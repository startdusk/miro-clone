use crate::dto::{Account, AuthorizeUrlResponse, OAuthCallbackParams};
use crate::error::AppError;
use crate::oauth::OAuthApp;
use crate::{AppState, NewUser, UpdateUser};
use axum::extract::Path;
use axum::extract::{Query, State};
use axum::response::{IntoResponse, Redirect, Response};
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
) -> Result<Response, AppError> {
    let oauth_app: OAuthApp = app_name.try_into()?;
    info!("using oauth app: {:?}, query: {:?}", oauth_app, params);

    let code = params.authorization_code();
    let access_token = state.get_access_token(&oauth_app, code).await?;

    // 使用访问令牌获取用户信息
    let auth_user = state.get_auth_user(&oauth_app, access_token).await?;
    info!("got auth user: {:?}", auth_user);

    let user = match state.get_user(&auth_user.account_id).await? {
        Some(user) => {
            // update user name
            let user = state
                .update_user(UpdateUser::new(auth_user.username, user.email, user.id))
                .await?;
            user
        }
        None =>
        // 创建用户
        {
            state
                .create_user(NewUser::new(
                    auth_user.username,
                    "<unknown.email>".to_string(),
                    auth_user.account_id,
                ))
                .await?
        }
    };

    let account: Account = user.into();
    // 并创建token 返回
    let token = state.ek.sign(account)?;
    // 重定向到前端，前端会打开这个url，并获取token(前端启动了polka这个web服务器, 监听54321端口, 并处理/auth/{token}这个路由, 获取到token后, 前端会保存到localStorage中)
    let redirect_url = format!("http://localhost:5173/auth?token={token}");
    Ok(Redirect::temporary(&redirect_url).into_response())
}
