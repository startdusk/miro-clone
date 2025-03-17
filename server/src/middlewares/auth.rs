use axum::{
    extract::{FromRequestParts, Query, Request, State},
    http::{request::Parts, StatusCode},
    middleware::Next,
    response::{IntoResponse, Response},
};
use axum_extra::{
    headers::{authorization::Bearer, Authorization},
    TypedHeader,
};
use serde::Deserialize;
use tracing::warn;

use super::TokenVerify;

#[derive(Debug, Deserialize)]
struct Params {
    access_token: String,
}

// 在请求上下文设置完用户才能往下走
pub async fn verify_token<T>(State(state): State<T>, req: Request, next: Next) -> Response
where
    T: Clone + Send + Sync + 'static + TokenVerify,
{
    let (mut parts, body) = req.into_parts();
    match extract_token(&state, &mut parts).await {
        Ok(token) => {
            let mut req = Request::from_parts(parts, body);
            match set_user(&state, &token, &mut req) {
                Ok(_) => next.run(req).await,
                Err(err_msg) => (StatusCode::FORBIDDEN, err_msg).into_response(),
            }
        }
        Err(err_msg) => (StatusCode::UNAUTHORIZED, err_msg).into_response(),
    }
}

async fn extract_token<T>(state: &T, parts: &mut Parts) -> Result<String, String>
where
    T: Clone + Send + Sync + 'static + TokenVerify,
{
    match TypedHeader::<Authorization<Bearer>>::from_request_parts(parts, &state).await {
        Ok(TypedHeader(Authorization(bearer))) => Ok(bearer.token().to_string()),
        Err(e) => {
            if e.is_missing() {
                match Query::<Params>::from_request_parts(parts, &state).await {
                    Ok(params) => Ok(params.access_token.clone()),
                    Err(e) => {
                        let msg = format!("parse url {} query params failed: {}", parts.uri, e);
                        warn!(msg);
                        Err(msg)
                    }
                }
            } else {
                let msg = format!("parse Authorization header failed: {}", e);
                warn!(msg);
                Err(msg)
            }
        }
    }
}

fn set_user<T>(state: &T, token: &str, req: &mut Request) -> Result<(), String>
where
    T: Clone + Send + Sync + 'static + TokenVerify,
{
    match state.verify(token) {
        Ok(account) => {
            req.extensions_mut().insert(account);
            Ok(())
        }
        Err(e) => {
            let msg = format!("verify token failed: {:?}", e);
            warn!(msg);
            Err(msg)
        }
    }
}

#[cfg(test)]
mod tests {

    use std::{ops::Deref, sync::Arc};

    use super::*;
    use crate::{dto::Account, DecodingKey, EncodingKey};
    use anyhow::Result;
    use axum::{body::Body, middleware::from_fn_with_state, routing::get, Router};
    use tower::ServiceExt;

    #[derive(Clone)]
    struct AppState(Arc<AppStateInner>);

    struct AppStateInner {
        ek: EncodingKey,
        dk: DecodingKey,
    }
    impl TokenVerify for AppState {
        type Error = jwt_simple::Error;

        fn verify(&self, token: &str) -> Result<Account, Self::Error> {
            self.dk.verify(token)
        }
    }
    impl Deref for AppState {
        type Target = AppStateInner;

        fn deref(&self) -> &Self::Target {
            &self.0
        }
    }

    async fn handler(_req: Request) -> impl IntoResponse {
        (StatusCode::OK, "ok")
    }

    #[tokio::test]
    async fn verify_token_middleware_should_work() -> Result<()> {
        let encoding_pem = include_str!("../../fixtures/encoding.pem");
        let decoding_pem = include_str!("../../fixtures/decoding.pem");
        let ek = EncodingKey::load(encoding_pem)?;
        let dk = DecodingKey::load(decoding_pem)?;

        let state = AppState(Arc::new(AppStateInner { ek, dk }));

        let user = Account::new(1, "new user1", "user1@acme.org", Some(123456.to_string()));
        // use token
        let token = state.ek.sign(user)?;
        let app = Router::new()
            .route("/", get(handler))
            .layer(from_fn_with_state(state.clone(), verify_token::<AppState>))
            .with_state(state);
        let req = Request::builder()
            .uri("/")
            .header("Authorization", format!("Bearer {}", token))
            .body(Body::empty())?;
        let res = app.clone().oneshot(req).await?;
        assert_eq!(res.status(), StatusCode::OK);

        // good token in query params
        let req = Request::builder()
            .uri(format!("/?access_token={}", token))
            .body(Body::empty())?;
        let res = app.clone().oneshot(req).await?;
        assert_eq!(res.status(), StatusCode::OK);

        // no token
        let req = Request::builder().uri("/").body(Body::empty())?;
        let res = app.clone().oneshot(req).await?;
        assert_eq!(res.status(), StatusCode::UNAUTHORIZED);

        // bad token
        let req = Request::builder()
            .uri("/")
            .header("Authorization", "bad-token")
            .body(Body::empty())?;
        let res = app.oneshot(req).await?;
        assert_eq!(res.status(), StatusCode::UNAUTHORIZED);

        Ok(())
    }
}
