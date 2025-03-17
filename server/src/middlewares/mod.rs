mod auth;
pub(crate) use auth::*;

use axum::Router;
use tower::ServiceBuilder;
use tower_http::{
    compression::CompressionLayer,
    trace::{DefaultMakeSpan, DefaultOnRequest, DefaultOnResponse, TraceLayer},
    LatencyUnit,
};
use tracing::Level;

use crate::dto::Account;

pub(crate) trait TokenVerify {
    type Error: std::fmt::Debug;
    fn verify(&self, token: &str) -> Result<Account, Self::Error>;
}

pub(crate) fn set_layer(app: Router) -> Router {
    app.layer(
        ServiceBuilder::new()
            .layer(
                TraceLayer::new_for_http()
                    .make_span_with(DefaultMakeSpan::new().include_headers(true))
                    .on_request(DefaultOnRequest::new().level(Level::INFO))
                    .on_response(
                        DefaultOnResponse::new()
                            .level(Level::INFO)
                            .latency_unit(LatencyUnit::Millis),
                    ),
            )
            .layer(CompressionLayer::new().gzip(true).br(true).deflate(true)),
    )
}
