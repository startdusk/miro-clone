use axum::{extract::multipart, http::StatusCode, response::IntoResponse, Json};
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorOutput {
    pub error: String,
}

#[derive(Debug, Error)]
pub enum AppError {
    #[error("sql error: {0}")]
    SqlxError(#[from] sqlx::Error),

    #[error("general error: {0}")]
    AnyError(#[from] anyhow::Error),

    #[error("http header parse error: {0}")]
    HttpHeaderError(#[from] axum::http::header::InvalidHeaderValue),

    #[error("email already exists: {0}")]
    EmailAlreadyExists(String),

    #[error("not found: {0}")]
    NotFound(String),

    #[error("io error: {0}")]
    IoError(#[from] std::io::Error),

    #[error("multipart error: {0}")]
    MultipartError(#[from] multipart::MultipartError),

    #[error("{0}")]
    UnAuthorization(String),
}

impl ErrorOutput {
    pub fn new(error: impl Into<String>) -> Self {
        Self {
            error: error.into(),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        let status = match &self {
            Self::HttpHeaderError(_) | Self::MultipartError(_) => StatusCode::UNPROCESSABLE_ENTITY,
            Self::SqlxError(_) | Self::AnyError(_) | Self::IoError(_) => {
                StatusCode::INTERNAL_SERVER_ERROR
            }
            Self::EmailAlreadyExists(_) => StatusCode::CONFLICT,

            Self::NotFound(_) => StatusCode::NOT_FOUND,
            Self::UnAuthorization(_) => StatusCode::UNAUTHORIZED,
        };

        (status, Json(ErrorOutput::new(self.to_string()))).into_response()
    }
}
