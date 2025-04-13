use std::sync::Arc;

use axum::{
    extract::{Path, Query, State},
    Extension, Json,
};
use nanoid::nanoid;
use tracing::warn;

use crate::{
    dto::{
        CreateProjectParams, CreateProjectResponse, GetMyProjectsResponse, GetProjectDetailQuery,
        GetProjectDetailResponse, UpdateProjectParams, UpdateProjectResponse,
    },
    error::AppError,
    Account, AppEvent, AppState, CreateProject, ProjectBoardEvent, UpdateProject, UserTyipingEvent,
};

use super::{JsonUnifyResponse, UnifyResponse};

/// 创建项目
pub(crate) async fn create_project(
    Extension(account): Extension<Account>,
    State(state): State<AppState>,
    Json(params): Json<CreateProjectParams>,
) -> Result<JsonUnifyResponse<CreateProjectResponse>, AppError> {
    let new_project = CreateProject {
        user_id: account.id,
        name: params.name,
        project_code: nanoid!(),
        project_link: "project_link".to_string(),
    };

    let project = state.create_project(new_project).await?;

    Ok(UnifyResponse::ok(Some(project.into())))
}

/// 更新项目
pub(crate) async fn update_project(
    Extension(account): Extension<Account>,
    State(state): State<AppState>,
    Path(project_id): Path<i64>,
    Json(params): Json<UpdateProjectParams>,
) -> Result<JsonUnifyResponse<UpdateProjectResponse>, AppError> {
    let update_project = UpdateProject {
        id: project_id,
        user_id: account.id,
        name: params.name,
    };
    let project = state.update_project(update_project).await?;
    Ok(UnifyResponse::ok(Some(project.into())))
}

/// 获取项目列表
pub(crate) async fn get_my_projects(
    Extension(account): Extension<Account>,
    State(state): State<AppState>,
) -> Result<JsonUnifyResponse<GetMyProjectsResponse>, AppError> {
    let projects = state.get_my_projects(account.id).await?;
    Ok(UnifyResponse::ok(Some(projects.into())))
}

/// 获取项目细节
pub(crate) async fn get_project_detail(
    State(state): State<AppState>,
    Query(project): Query<GetProjectDetailQuery>,
    Extension(account): Extension<Account>,
) -> Result<JsonUnifyResponse<GetProjectDetailResponse>, AppError> {
    let project = state
        .get_project_from_project_code(project.project_code.clone())
        .await?;
    let Some(project) = project else {
        return Ok(UnifyResponse::ok(None));
    };

    let account_id = account.id;
    if let Some(user_ids) = state.get_user_ids_from_joinees(project.id).await? {
        let event = Arc::new(AppEvent::JoinProjectBoardEvent(ProjectBoardEvent::new(
            project.project_code.clone(),
            account,
        )));
        for user_id in &user_ids {
            // 不需要通知自己
            if user_id == &account_id {
                continue;
            }
            if let Some(tx) = state.users.get(&(*user_id as u64)) {
                if let Err(e) = tx.send(event.clone()) {
                    warn!("Failed to send notification to user {}: {}", user_id, e);
                }
            }
        }

        // 知道谁在编辑，然后发送消息
        let event = Arc::new(AppEvent::UserTyipingEvent(UserTyipingEvent::new(
            project.project_code.clone(),
            account_id as _,
        )));
        for user_id in user_ids {
            // 不需要通知自己
            if user_id == account_id {
                continue;
            }
            if let Some(tx) = state.users.get(&(user_id as u64)) {
                if let Err(e) = tx.send(event.clone()) {
                    warn!("Failed to send notification to user {}: {}", user_id, e);
                }
            }
        }
    }

    Ok(UnifyResponse::ok(Some(GetProjectDetailResponse::new(
        project,
    ))))
}
