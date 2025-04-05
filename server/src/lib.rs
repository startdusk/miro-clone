mod config;
pub mod dto;
mod error;
mod handlers;
mod middlewares;
mod models;
mod oauth;
mod utils;

use axum::{
    http::Method,
    middleware::from_fn_with_state,
    routing::{get, post, put},
};

use anyhow::Context;
use dashmap::DashMap;
use dto::Account;
use middlewares::{set_layer, verify_token, TokenVerify};
use oauth::{GithubClient, OAuthClient};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use tokio::sync::broadcast;
use tower_http::cors::{self, CorsLayer};

use std::{fmt, mem, ops::Deref, sync::Arc};

use axum::Router;
pub use config::AppConfig;
use error::AppError;
use models::*;

use handlers::*;
use utils::{DecodingKey, EncodingKey};

pub type ProjectCode = String;
pub type AccountId = u64;

pub type UserMap = Arc<DashMap<AccountId, broadcast::Sender<Arc<AppEvent>>>>;

#[derive(Debug, Serialize, Deserialize)]
#[serde(tag = "event")]
pub enum AppEvent {
    ProjectBoardEvent(ProjectCode),
    UserTyipingEvent(AccountId),
}

#[derive(Clone)]
pub struct AppState {
    inner: Arc<AppStateInner>,
}

#[allow(unused)]
pub struct AppStateInner {
    pub(crate) config: AppConfig,
    pub(crate) ek: EncodingKey,
    pub(crate) dk: DecodingKey,
    pub(crate) pool: PgPool,
    pub(crate) users: UserMap,
    pub(crate) oauth_client: OAuthClient,
}

pub async fn get_router(state: AppState) -> Result<Router, AppError> {
    let cors = CorsLayer::new()
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PATCH,
            Method::PUT,
            Method::DELETE,
        ])
        .allow_headers(cors::Any)
        .allow_origin(cors::Any);

    let api = Router::new()
        .route("/projects", put(create_project).get(get_my_projects))
        .route("/projects/{project_id}", post(update_project))
        .route("/projects/detail", get(get_project_detail))
        .nest(
            "/projects/{project_id}",
            Router::new()
                .route(
                    "/project_board",
                    get(get_project_board_data).post(create_or_update_project_board_data),
                )
                .route("/joinees", post(add_joinees)),
        )
        .layer(from_fn_with_state(state.clone(), verify_token::<AppState>));

    let app = Router::new()
        .route("/", get(index_handler))
        .route("/events", get(sse_handler))
        .route("/auth/{app_name}/authorize", get(oauth_authorize_handler))
        .route("/auth/{app_name}/callback", get(oauth_callback_handler))
        .nest("/api", api)
        .layer(cors)
        .with_state(state);
    Ok(set_layer(app))
}

impl Deref for AppState {
    type Target = AppStateInner;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl TokenVerify for AppState {
    type Error = AppError;

    fn verify(&self, token: &str) -> Result<Account, Self::Error> {
        Ok(self.dk.verify(token)?)
    }
}

impl AppState {
    pub async fn try_new(mut config: AppConfig) -> Result<Self, AppError> {
        let pool = PgPool::connect(&config.server.db_url)
            .await
            .context("connect db failed")?;
        let dk = DecodingKey::load(&config.auth.pk).context("load pk failed")?;
        let ek = EncodingKey::load(&config.auth.sk).context("load sk failed")?;
        let github_scopes = mem::take(&mut config.oauth.github.scopes);
        let oauth_github_client = config.oauth.github.new_oauth_client()?;
        Ok(AppState {
            inner: Arc::new(AppStateInner {
                config,
                dk,
                ek,
                pool,
                oauth_client: OAuthClient {
                    github: GithubClient::new(oauth_github_client, github_scopes),
                },
                users: Arc::new(DashMap::new()),
            }),
        })
    }
}

impl fmt::Debug for AppStateInner {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.debug_struct("AppStateInner")
            .field("config", &self.config)
            .finish()
    }
}

#[cfg(test)]
pub mod test_util {
    use super::*;
    use sqlx::Executor;
    use sqlx_db_tester::TestPg;

    impl AppState {
        pub async fn new_for_test() -> Result<(TestPg, Self), AppError> {
            let mut config = AppConfig::load()?;
            let dk = DecodingKey::load(&config.auth.pk).context("load pk failed")?;
            let ek = EncodingKey::load(&config.auth.sk).context("load sk failed")?;
            let post = config.server.db_url.rfind('/').expect("invalid db_url");
            let server_url = &config.server.db_url[..post];
            let github_scopes = mem::take(&mut config.oauth.github.scopes);
            let oauth_github_client = config.oauth.github.new_oauth_client()?;
            let (tdb, pool) = get_test_pool(Some(server_url)).await;
            let state = AppState {
                inner: Arc::new(AppStateInner {
                    config,
                    dk,
                    ek,
                    pool,
                    oauth_client: OAuthClient {
                        github: GithubClient::new(oauth_github_client, github_scopes),
                    },
                    users: Arc::new(DashMap::new()),
                }),
            };
            Ok((tdb, state))
        }
    }

    pub async fn get_test_pool(url: Option<&str>) -> (TestPg, PgPool) {
        let url = match url {
            Some(url) => url.to_string(),
            None => "postgres://postgres:postgres@localhost:5432".to_string(),
        };
        let tdb = TestPg::new(url, std::path::Path::new("./migrations"));
        let pool = tdb.get_pool().await;

        // run prepared sql to insert test data
        let sql = include_str!("../fixtures/test.sql").split(';');
        let mut ts = pool.begin().await.expect("begin transaction failed");
        for s in sql {
            if s.trim().is_empty() {
                continue;
            }
            ts.execute(s).await.expect("execute sql failed");
        }
        ts.commit().await.expect("commit transaction failed");

        // 注意: 此tdb一定要返回出去，即使外面不使用，也要接收 成 _tdb，因为在外部的scope中，tdb用来作为生命周期约束，drop掉测试数据
        (tdb, pool)
    }
}
