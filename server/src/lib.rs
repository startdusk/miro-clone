mod config;
pub mod dto;
mod error;
mod handlers;
mod middlewares;
mod models;
mod oauth;
mod utils;

use axum::{http::Method, routing::get};

use anyhow::Context;
use oauth::OAuthClient;
use sqlx::PgPool;
use tower_http::cors::{self, CorsLayer};

use std::{fmt, ops::Deref, sync::Arc};

use axum::Router;
pub use config::AppConfig;
use error::AppError;

use handlers::*;
use utils::{DecodingKey, EncodingKey};

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

    let api = Router::new().layer(cors);

    let app = Router::new()
        .route("/", get(index_handler))
        .route("/auth/{app_name}/authorize", get(oauth_authorize_handler))
        .route("/auth/{app_name}/callback", get(oauth_callback_handler))
        .nest("/api", api)
        .with_state(state);
    Ok(app)
}

impl Deref for AppState {
    type Target = AppStateInner;

    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl AppState {
    pub async fn try_new(config: AppConfig) -> Result<Self, AppError> {
        let pool = PgPool::connect(&config.server.db_url)
            .await
            .context("connect db failed")?;
        let dk = DecodingKey::load(&config.auth.pk).context("load pk failed")?;
        let ek = EncodingKey::load(&config.auth.sk).context("load sk failed")?;
        let oauth_github_client = config.oauth.github.new_oauth_client()?;
        Ok(AppState {
            inner: Arc::new(AppStateInner {
                config,
                dk,
                ek,
                pool,
                oauth_client: OAuthClient {
                    github: oauth_github_client,
                },
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

#[cfg(feature = "test-util")]
mod test_util {
    use super::*;
    use sqlx::Executor;
    use sqlx_db_tester::TestPg;

    impl AppState {
        pub async fn new_for_test() -> Result<(TestPg, Self), AppError> {
            let config = AppConfig::load()?;
            let dk = DecodingKey::load(&config.auth.pk).context("load pk failed")?;
            let ek = EncodingKey::load(&config.auth.sk).context("load sk failed")?;
            let post = config.server.db_url.rfind('/').expect("invalid db_url");
            let server_url = &config.server.db_url[..post];
            let (tdb, pool) = get_test_pool(Some(server_url)).await;
            let state = AppState {
                inner: Arc::new(AppStateInner {
                    config,
                    dk,
                    ek,
                    pool,
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
        let tdb = TestPg::new(url, std::path::Path::new("../migrations"));
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
