use axum::{
    extract::{Path, State},
    Extension, Json,
};

use crate::{
    dto::{CreateOrUpdateProjectBoardDataParams, GetProjectBoardDataResponse},
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
    // TODO: dispatch project_code to event bus
    Ok(UnifyResponse::ok(None))
}

pub(crate) async fn get_project_board_data(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Extension(account): Extension<Account>,
) -> Result<JsonUnifyResponse<GetProjectBoardDataResponse>, AppError> {
    let project = state.get_project_from_project_id(project_id).await?;
    let Some(project) = project else {
        return Err(AppError::NotFound("project not found".to_string()));
    };
    let mut project_board_data = GetProjectBoardDataResponse::default();
    if account.id != project.user_id {
        return Ok(UnifyResponse::ok(Some(project_board_data)));
    };
    if let Some(mini_text_editor) = state.get_mini_text_editor(project.id).await? {
        project_board_data.mini_text_editor = Some(mini_text_editor.mini_text_editor_data);
    }
    if let Some(sticky_note) = state.get_sticky_note(project.id).await? {
        project_board_data.sticky_note = Some(sticky_note.sticky_note_data);
    }
    if let Some(text_caption) = state.get_text_caption(project.id).await? {
        project_board_data.text_caption = Some(text_caption.text_caption_data);
    }
    if let Some(drawing) = state.get_drawing(project.id).await? {
        project_board_data.drawing = Some(drawing.drawing_data);
    }
    Ok(UnifyResponse::ok(Some(project_board_data)))
}

pub(crate) async fn create_or_update_project_board_data(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Json(project_board_data): Json<CreateOrUpdateProjectBoardDataParams>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let project = state.get_project_from_project_id(project_id).await?;
    if project.is_none() {
        return Err(AppError::NotFound("project not found".to_string()));
    }
    let mini_text_editor = project_board_data.mini_text_editor.unwrap_or_default();
    let sticky_note = project_board_data.sticky_note.unwrap_or_default();
    let text_caption = project_board_data.text_caption.unwrap_or_default();
    let drawing = project_board_data.drawing.unwrap_or_default();
    state
        .create_or_update_mini_text_editor(project_id, mini_text_editor)
        .await?;
    state
        .create_or_update_sticky_note(project_id, sticky_note)
        .await?;
    state
        .create_or_update_text_caption(project_id, text_caption)
        .await?;
    state.create_or_update_drawing(project_id, drawing).await?;

    Ok(UnifyResponse::ok(None))
}
