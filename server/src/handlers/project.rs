use axum::{
    extract::{Path, State},
    Extension, Json,
};

use crate::{
    dto::{
        CreateProjectParams, CreateProjectResponse, GetMyProjectsResponse, UpdateProjectParams,
        UpdateProjectResponse,
    },
    error::AppError,
    Account, AppState, CreateProject, UpdateProject,
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
        project_code: "project_code".to_string(),
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
