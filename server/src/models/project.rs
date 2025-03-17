use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, AppState};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::FromRow)]
pub struct Project {
    pub id: i64,
    pub name: String,
    pub image: Option<String>,
    pub project_code: String,
    pub user_id: i64,
    pub project_link: String,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct CreateProject {
    pub user_id: i64,
    pub name: String,
    pub project_code: String,
    pub project_link: String,
}

pub struct UpdateProject {
    pub id: i64,
    pub user_id: i64,
    pub name: String,
}

impl AppState {
    pub async fn get_my_projects(&self, user_id: i64) -> Result<Vec<Project>, AppError> {
        let projects = sqlx::query_as("SELECT * FROM projects WHERE user_id = $1 ORDER BY id DESC")
            .bind(user_id)
            .fetch_all(&self.pool)
            .await?;
        Ok(projects)
    }

    pub async fn create_project(&self, params: CreateProject) -> Result<Project, AppError> {
        let project = sqlx::query_as(
            "INSERT INTO projects (user_id, name, project_code, project_link) VALUES ($1, $2, $3, $4) RETURNING *",
        )
        .bind(params.user_id)
        .bind(params.name)
        .bind(params.project_code)
        .bind(params.project_link)
        .fetch_one(&self.pool)
        .await?;

        Ok(project)
    }

    pub async fn update_project(&self, params: UpdateProject) -> Result<Project, AppError> {
        let project = sqlx::query_as(
            "UPDATE projects SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
        )
        .bind(params.name)
        .bind(params.id)
        .bind(params.user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(project)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_create_project() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let new_project = CreateProject {
            user_id: 1,
            name: "test".to_string(),
            project_code: "test".to_string(),
            project_link: "/test".to_string(),
        };
        let project = state.create_project(new_project).await?;
        assert_eq!(project.name, "test");
        assert_eq!(project.project_code, "test");
        assert_eq!(project.project_link, "/test");
        assert_eq!(project.user_id, 1);

        Ok(())
    }

    #[tokio::test]
    #[should_panic]
    async fn test_create_project_should_fail() {
        // project name 重复，应该失败
        let (_tdb, state) = AppState::new_for_test().await.unwrap();
        let new_project = CreateProject {
            user_id: 1,
            name: "test".to_string(),
            project_code: "test".to_string(),
            project_link: "/test".to_string(),
        };
        let project = state.create_project(new_project).await.unwrap();
        assert_eq!(project.name, "test");
        assert_eq!(project.project_code, "test");
        assert_eq!(project.project_link, "/test");
        assert_eq!(project.user_id, 1);

        let new_project = CreateProject {
            user_id: 1,
            name: "test".to_string(),
            project_code: "test".to_string(),
            project_link: "/test".to_string(),
        };
        state.create_project(new_project).await.unwrap();
    }

    #[tokio::test]
    async fn test_update_project() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let new_project = CreateProject {
            user_id: 1,
            name: "test".to_string(),
            project_code: "test".to_string(),
            project_link: "/test".to_string(),
        };
        let project = state.create_project(new_project).await?;
        assert_eq!(project.name, "test");
        assert_eq!(project.project_code, "test");
        assert_eq!(project.project_link, "/test");
        assert_eq!(project.user_id, 1);
        let update_project = UpdateProject {
            id: project.id,
            user_id: 1,
            name: "test2".to_string(),
        };
        let project = state.update_project(update_project).await?;
        assert_eq!(project.name, "test2");
        assert_eq!(project.project_code, "test");
        assert_eq!(project.project_link, "/test");
        assert_eq!(project.user_id, 1);
        Ok(())
    }

    #[tokio::test]
    async fn test_get_projects() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let projects = state.get_my_projects(1).await?;
        assert_eq!(projects.len(), 0);

        let user_id = 1;
        let new_project = CreateProject {
            user_id,
            name: "test".to_string(),
            project_code: "test".to_string(),
            project_link: "/test".to_string(),
        };
        let project = state.create_project(new_project).await?;
        assert_eq!(project.name, "test");
        assert_eq!(project.project_code, "test");
        assert_eq!(project.project_link, "/test");
        assert_eq!(project.user_id, user_id);

        let projects = state.get_my_projects(1).await?;
        assert_eq!(projects.len(), 1);
        assert_eq!(projects[0].name, "test");
        assert_eq!(projects[0].project_code, "test");
        assert_eq!(projects[0].project_link, "/test");

        Ok(())
    }
}
