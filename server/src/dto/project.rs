use serde::{Deserialize, Serialize};

use crate::models::Project;

#[derive(Debug, Deserialize, Clone)]
pub struct CreateProjectParams {
    pub name: String,
}

pub type CreateProjectResponse = ProjectDto;
pub type UpdateProjectResponse = ProjectDto;

#[derive(Debug, Serialize, Clone)]
pub struct ProjectDto {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
    pub project_code: String,
    pub project_link: String,
}

impl From<Project> for ProjectDto {
    fn from(project: Project) -> Self {
        Self {
            id: project.id,
            user_id: project.user_id,
            name: project.name,
            project_code: project.project_code,
            project_link: project.project_link,
        }
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct UpdateProjectParams {
    pub name: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct GetMyProjectsResponse {
    pub projects: Vec<ProjectDto>,
}

impl From<Vec<Project>> for GetMyProjectsResponse {
    fn from(projects: Vec<Project>) -> Self {
        Self {
            projects: projects.into_iter().map(|p| p.into()).collect(),
        }
    }
}

#[derive(Debug, Serialize, Clone)]
pub struct GetProjectDetailResponse(ProjectDto);

impl GetProjectDetailResponse {
    pub fn new(project: Project) -> Self {
        Self(project.into())
    }
}

#[derive(Debug, Deserialize, Clone)]
pub struct GetProjectDetailQuery {
    pub project_code: String,
}
