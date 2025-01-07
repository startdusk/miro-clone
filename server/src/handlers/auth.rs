use crate::dto::{AuthorizeUrlResponse, OAuthCallbackParams};
use crate::error::AppError;
use crate::oauth::OAuthApp;
use crate::AppState;
use axum::extract::Path;
use axum::extract::{Query, State};
use tracing::info;

use super::{JsonUnifyResponse, UnifyResponse};

/// Generate authorize url for the given oauth app
pub(crate) async fn oauth_authorize_handler(
    State(state): State<AppState>,
    Path(app_name): Path<String>,
) -> Result<JsonUnifyResponse<AuthorizeUrlResponse>, AppError> {
    let oauth_app: OAuthApp = app_name.try_into()?;
    let authorize_url = state.get_authorize_url(&oauth_app);
    Ok(UnifyResponse::ok(Some(AuthorizeUrlResponse {
        authorize_url,
    })))
}

/// Handle callback from oauth provider
pub(crate) async fn oauth_callback_handler(
    State(state): State<AppState>,
    Path(app_name): Path<String>,
    Query(params): Query<OAuthCallbackParams>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let oauth_app: OAuthApp = app_name.try_into()?;
    info!("using oauth app: {:?}, query: {:?}", oauth_app, params);

    let code = params.authorization_code();
    let access_token = state.get_access_token(&oauth_app, code).await?;

    // 使用访问令牌获取用户信息
    let auth_user = state.get_auth_user(&oauth_app, access_token).await?;
    info!("got auth user: {:?}", auth_user);
    // let account_id = github_user.id.to_string();
    // let username = github_user
    //     .name
    //     .or(github_user.email)
    //     .unwrap_or_else(|| "<unknown>".to_owned());

    // TODO: 如果用户不存在，创建用户，存在，则返回用户，并创建token 返回

    Ok(UnifyResponse::ok(Some(())))
}
