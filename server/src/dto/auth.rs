use serde::{Deserialize, Serialize};

use oauth2::{AuthorizationCode, CsrfToken};

use crate::oauth::OAuthApp;

/// Request to get the authorization URL
#[derive(Debug, Clone, Serialize)]
pub struct AuthorizeUrlResponse {
    pub authorize_url: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct OAuthCallbackParams {
    pub code: String,
    #[allow(unused)]
    pub state: String,
}

impl OAuthCallbackParams {
    /// Convert the code to an `AuthorizationCode`
    pub fn authorization_code(&self) -> AuthorizationCode {
        AuthorizationCode::new(self.code.clone())
    }

    /// Convert the state to a `CsrfToken`
    #[allow(unused)]
    pub fn csrf_token(&self) -> CsrfToken {
        CsrfToken::new(self.state.clone())
    }
}

// Checkout available fields on: https://docs.github.com/en/rest/users/users?apiVersion=2022-11-28#get-the-authenticated-user
#[derive(Default, Serialize, Deserialize)]
pub struct GithubUser {
    pub id: u64,
    pub name: Option<String>,
    pub email: Option<String>,
    pub avatar_url: String,
}

//  Checkout available fields on: https://developers.google.com/identity/openid-connect/openid-connect
#[derive(Default, Serialize, Deserialize)]
pub struct GoogleUser {
    /// 用户的标识符，在所有 Google 账号中必须具有唯一性，并且不得重复使用。Google 账号在不同的时间点可以有多个电子邮件地址，但 sub 值始终保持不变。在应用中使用 sub 作为用户的唯一标识符键。长度上限为 255 个区分大小写的 ASCII 字符。
    sub: String,
    /// 用户的全名（采用可显示的形式）
    name: String,
    email: Option<String>,
    email_verified: Option<bool>,
    /// 用户个人资料照片的网址
    picture: String,
}

/// OAuth 认证后的用户信息
#[derive(Debug)]
pub struct AuthUser {
    /// 账户ID
    pub account_id: String,
    /// OAuth提供方
    pub provider: OAuthApp,
    /// 用户昵称
    pub username: String,
    /// 用户头像
    pub avatar: Option<String>,
}

impl From<GithubUser> for AuthUser {
    fn from(user: GithubUser) -> Self {
        let user_id = user.id.to_string();
        Self {
            account_id: user_id.clone(),
            provider: OAuthApp::Github,
            username: user.name.unwrap_or(user_id),
            avatar: Some(user.avatar_url),
        }
    }
}

impl From<GoogleUser> for AuthUser {
    fn from(user: GoogleUser) -> Self {
        Self {
            account_id: user.sub,
            provider: OAuthApp::Google,
            username: user.name,
            avatar: Some(user.picture),
        }
    }
}
