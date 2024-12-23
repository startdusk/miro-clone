use axum::response::IntoResponse;

pub(crate) async fn index_handler() -> impl IntoResponse {
    "index"
}
