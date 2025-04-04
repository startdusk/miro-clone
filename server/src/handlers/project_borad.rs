use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};

use crate::{
    dto::{
        CreateProjectParams, CreateProjectResponse, GetMyProjectsResponse,
        GetProjectDetailResponse, UpdateProjectParams, UpdateProjectResponse,
    },
    error::AppError,
    Account, AppState,
};

use super::{JsonUnifyResponse, UnifyResponse};

pub(crate) async fn add_joinees(
    State(state): State<AppState>,
    Extension(account): Extension<Account>,
    Path(project_code): Path<String>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let project = state.get_project_from_project_code(project_code).await?;
    let Some(project) = project else {
        return Err(AppError::NotFound("project not found".to_string()));
    };

    let _ = state.get_or_create_joinees(project.id, account.id).await?;
    // dispatch project_code to event bus
    Ok(UnifyResponse::ok(None))
}

pub(crate) async fn get_project_board_data(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Extension(account): Extension<Account>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let project = state.get_project_from_project_id(project_id).await?;
    let Some(project) = project else {
        return Err(AppError::NotFound("project not found".to_string()));
    };
    if account.id != project.user_id {
        // TODO: return empty data
    };
    let mini_text_editor = state.get_mini_text_editor(project.id).await?;
    let sticky_note = state.get_sticky_note(project.id).await?;
    let text_caption = state.get_text_caption(project.id).await?;
    let drawing = state.get_drawing(project.id).await?;
    todo!()
}

pub(crate) async fn create_or_update_sticky_note(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Json(sticky_note_data): Json<serde_json::Value>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let _ = state
        .create_or_update_sticky_note(project_id, sticky_note_data)
        .await?;
    Ok(UnifyResponse::ok(None))
}

pub(crate) async fn create_or_update_text_caption(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Json(text_caption_data): Json<serde_json::Value>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let _ = state
        .create_or_update_text_caption(project_id, text_caption_data)
        .await?;
    Ok(UnifyResponse::ok(None))
}

pub(crate) async fn create_or_update_drawing(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Json(drawing_data): Json<serde_json::Value>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let _ = state
        .create_or_update_drawing(project_id, drawing_data)
        .await?;
    Ok(UnifyResponse::ok(None))
}

pub(crate) async fn create_or_update_mini_text_editor(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Json(mini_text_editor_data): Json<serde_json::Value>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let _ = state
        .create_or_update_mini_text_editor(project_id, mini_text_editor_data)
        .await?;
    Ok(UnifyResponse::ok(None))
}
