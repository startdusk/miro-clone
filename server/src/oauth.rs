use core::fmt;

use anyhow::anyhow;
use oauth2::{
    basic::BasicClient, reqwest::async_http_client, AuthUrl, AuthorizationCode, ClientId,
    ClientSecret, CsrfToken, RedirectUrl, Scope, TokenResponse, TokenUrl,
};
use url::Url;

use crate::{config::Github, error::AppError, AppState};

#[derive(Debug)]
pub enum OAuthApp {
    Github,
    Google,
}

impl TryFrom<String> for OAuthApp {
    type Error = AppError;

    fn try_from(value: String) -> Result<Self, Self::Error> {
        match value.as_str().to_lowercase().trim() {
            "github" => Ok(OAuthApp::Github),
            "google" => Ok(OAuthApp::Google),
            _ => Err(AppError::InvalidPathName("Invalid OAuth app".to_string())),
        }
    }
}

pub struct OAuthClient {
    pub(crate) github: BasicClient,
}

impl OAuthClient {
    pub fn get_authorize_url(&self, app: OAuthApp, scopes: Option<&Vec<String>>) -> Url {
        match app {
            OAuthApp::Github => {
                // Generate the authorization URL to which we'll redirect the user.
                let mut authorize_url = self.github.authorize_url(CsrfToken::new_random);
                if let Some(scopes) = scopes {
                    // Add the scopes to the URL.
                    let mut new_scopes = Vec::new();
                    scopes.iter().for_each(|scope| {
                        new_scopes.push(Scope::new(scope.clone()));
                    });
                    authorize_url = authorize_url.add_scopes(new_scopes);
                }
                let (authorize_url, _csrf_state) = authorize_url.url();
                authorize_url
            }
            OAuthApp::Google => unimplemented!(),
        }
    }

    pub async fn get_access_token(
        &self,
        app: OAuthApp,
        code: AuthorizationCode,
    ) -> Result<String, AppError> {
        match app {
            OAuthApp::Github => {
                let token_res = self
                    .github
                    .exchange_code(code)
                    .request_async(&async_http_client)
                    .await
                    .map_err(|err| {
                        AppError::AnyError(anyhow!("Failed to get access token: {:?}", err))
                    })?;
                Ok(token_res.access_token().secret().to_string())
            }
            OAuthApp::Google => unimplemented!(),
        }
    }
}

impl AppState {
    pub fn get_authorize_url(&self, app: OAuthApp) -> String {
        let scopes = match app {
            OAuthApp::Github => Some(&self.config.oauth.github.scopes),
            OAuthApp::Google => None,
        };
        self.oauth_client.get_authorize_url(app, scopes).to_string()
    }

    pub async fn get_access_token(
        &self,
        app: OAuthApp,
        code: AuthorizationCode,
    ) -> Result<String, AppError> {
        self.oauth_client.get_access_token(app, code).await
    }
}

impl Github {
    pub fn new_oauth_client(&self) -> Result<BasicClient, AppError> {
        let client_id = ClientId::new(self.client_id.clone());
        let client_secret = ClientSecret::new(self.client_secret.clone());
        let auth_url = AuthUrl::new(self.auth_url.clone())?;
        let token_url = TokenUrl::new(self.token_url.clone())?;
        let redirect_url = RedirectUrl::new(self.redirect_url.clone())?;

        // Set up the config for the Github OAuth2 process.
        let client = BasicClient::new(client_id, Some(client_secret), auth_url, Some(token_url))
            // This example will be running its own server at localhost:8080.
            // See below for the server implementation.
            .set_redirect_uri(redirect_url);
        Ok(client)
    }
}

impl fmt::Display for OAuthApp {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            OAuthApp::Github => write!(f, "github"),
            OAuthApp::Google => write!(f, "google"),
        }
    }
}
