use serde::{Deserialize, Serialize};

use oauth2::{AuthorizationCode, CsrfToken};

/// Request to get the authorization URL
#[derive(Debug, Clone, Serialize)]
pub struct AuthorizeUrlResponse {
    pub authorize_url: String,
}

#[derive(Debug, Deserialize, Clone)]
pub struct OAuthCallbackParams {
    pub code: String,
    pub state: String,
}

impl OAuthCallbackParams {
    /// Convert the code to an `AuthorizationCode`
    pub fn authorization_code(&self) -> AuthorizationCode {
        AuthorizationCode::new(self.code.clone())
    }

    /// Convert the state to a `CsrfToken`
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
