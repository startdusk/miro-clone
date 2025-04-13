use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use tracing::warn;

use crate::{
    dto::{AddJoineesParams, CreateOrUpdateProjectBoardDataParams, GetProjectBoardDataResponse},
    error::AppError,
    Account, AppEvent, AppState, CurrentProjectUsersEvent, ProjectBoardEvent,
};

use super::{JsonUnifyResponse, UnifyResponse};

// TODO: 加入到项目中，不会添加到数据库，所以，自己的项目列表是不会有这个项目的，只是临时加入编辑
pub(crate) async fn add_joinees(
    State(state): State<AppState>,
    Extension(account): Extension<Account>,
    Query(joinee): Query<AddJoineesParams>,
) -> Result<JsonUnifyResponse<()>, AppError> {
    let project = state
        .get_project_from_project_code(joinee.project_code.clone())
        .await?;
    let Some(project) = project else {
        return Err(AppError::NotFound("project not found".to_string()));
    };

    let _ = state.get_or_create_joinees(project.id, account.id).await?;
    let joinees = state.get_joinees_from_project_id(project.id).await?;

    // 告诉其他人，有人加入了项目
    let account_id = account.id;
    let event = Arc::new(AppEvent::JoinProjectBoardEvent(ProjectBoardEvent::new(
        joinee.project_code.clone(),
        account,
    )));

    let mut room_users = Vec::new();
    for joinee in &joinees {
        let user_id = joinee.user_id;
        if account_id == user_id {
            continue;
        }
        if let Some(tx) = state.users.get(&(user_id as u64)) {
            room_users.push(user_id);
            if let Err(e) = tx.send(Arc::clone(&event)) {
                warn!("Failed to send notification to user {}: {}", account_id, e);
            }
        }
    }

    // 然后，告诉自己现在房间里有哪些人
    let users = state.get_users_from_user_ids(room_users).await?;
    let event = Arc::new(AppEvent::CurrentProjectUsersEvent(
        CurrentProjectUsersEvent::new(
            joinee.project_code,
            users.into_iter().map(|u| u.into()).collect(),
        ),
    ));
    if let Some(tx) = state.users.get(&(account_id as u64)) {
        if let Err(e) = tx.send(Arc::clone(&event)) {
            warn!("Failed to send notification to user {}: {}", account_id, e);
        }
    }

    Ok(UnifyResponse::ok(None))
}

pub(crate) async fn get_project_board_data(
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
) -> Result<JsonUnifyResponse<GetProjectBoardDataResponse>, AppError> {
    let project = state.get_project_from_project_id(project_id).await?;
    let Some(project) = project else {
        return Err(AppError::NotFound("project not found".to_string()));
    };
    let mut project_board_data = GetProjectBoardDataResponse::default();
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
