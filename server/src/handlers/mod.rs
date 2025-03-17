mod auth;
mod project;
mod project_borad;

pub(crate) use auth::*;
pub(crate) use project::*;
#[allow(unused)]
pub(crate) use project_borad::*;

use axum::{response::IntoResponse, Json};
use serde::Serialize;

pub(crate) async fn index_handler() -> impl IntoResponse {
    "index"
}

pub type JsonUnifyResponse<T> = Json<UnifyResponse<T>>;

#[derive(Debug, Serialize)]
pub struct UnifyResponse<T> {
    pub code: i32,
    pub message: String,
    pub success: bool,
    pub data: Option<T>,
}

#[allow(unused)]
impl<T> UnifyResponse<T>
where
    T: Serialize,
{
    pub fn new(code: i32, message: String, success: bool, data: Option<T>) -> Self {
        Self {
            code,
            message,
            success,
            data,
        }
    }
    pub fn ok(data: Option<T>) -> Json<Self> {
        Self::new(0, "OK".to_string(), true, data).json()
    }

    pub fn err(code: i32, message: String) -> Json<Self> {
        Self::new(code, message, false, None).json()
    }

    pub fn json(self) -> Json<Self> {
        Json(self)
    }
}
