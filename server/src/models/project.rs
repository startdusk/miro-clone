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

    pub async fn get_project_from_project_code(
        &self,
        project_code: String,
    ) -> Result<Option<Project>, AppError> {
        let project = sqlx::query_as(
            r#"
                SELECT 
                    id,
                    name,
                    image,
                    project_code,
                    user_id,
                    project_link,
                    created_at,
                    updated_at
                FROM projects WHERE project_code = $1 LIMIT 1
                "#,
        )
        .bind(project_code)
        .fetch_optional(&self.pool)
        .await?;
        Ok(project)
    }

    pub async fn get_project_from_project_id(
        &self,
        project_id: i64,
    ) -> Result<Option<Project>, AppError> {
        let project = sqlx::query_as(
            r#"
                SELECT 
                    id,
                    name,
                    image,
                    project_code,
                    user_id,
                    project_link,
                    created_at,
                    updated_at
                FROM projects WHERE id = $1 LIMIT 1
                "#,
        )
        .bind(project_id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(project)
    }

    pub async fn get_user_ids_from_project_code(
        &self,
        project_code: String,
    ) -> Result<Option<Vec<i64>>, AppError> {
        let user_ids: Vec<i64> = sqlx::query_scalar(
            r#"
                SELECT user_id FROM projects WHERE project_code = $1
                "#,
        )
        .bind(project_code)
        .fetch_all(&self.pool)
        .await?;

        Ok(if user_ids.is_empty() {
            None
        } else {
            Some(user_ids)
        })
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

    #[tokio::test]
    async fn test_get_project_from_project_id() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project = state.get_project_from_project_id(1).await?;
        assert_eq!(project, None);
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
        let project = state.get_project_from_project_id(1).await?;
        assert!(project.is_some());
        let project = project.unwrap();
        assert_eq!(project.name, "test");
        assert_eq!(project.project_code, "test");
        assert_eq!(project.project_link, "/test");
        assert_eq!(project.user_id, 1);
        Ok(())
    }

    #[tokio::test]
    async fn test_get_project_from_project_code() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project = state
            .get_project_from_project_code("test".to_string())
            .await?;
        assert_eq!(project, None);

        // create 10 projects
        for i in 0..10 {
            let mut project_code = "test".to_string();
            if i % 2 == 0 {
                project_code = format!("test{}", i);
            }
            let new_project = CreateProject {
                user_id: 1,
                name: format!("test{}", i),
                project_code: project_code.clone(),
                project_link: format!("/test{}", i),
            };
            let project = state.create_project(new_project).await?;
            assert_eq!(project.name, format!("test{}", i));
            assert_eq!(project.project_code, project_code);
            assert_eq!(project.project_link, format!("/test{}", i));
            assert_eq!(project.user_id, 1);
        }

        // get project from project_code "test"
        let project = state
            .get_project_from_project_code("test".to_string())
            .await?;
        assert!(project.is_some());
        let project = project.unwrap();
        assert_eq!(project.project_code, "test");
        assert_eq!(project.name, "test1");

        Ok(())
    }

    #[tokio::test]
    async fn test_get_user_ids_from_project_code() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project = state
            .get_user_ids_from_project_code("test".to_string())
            .await?;
        assert_eq!(project, None);
        // create 10 projects
        for i in 0..10 {
            let mut project_code = "test".to_string();
            if i % 2 == 0 {
                project_code = format!("test{}", i);
            }
            let new_project = CreateProject {
                user_id: i + 1,
                name: format!("test{}", i),
                project_code: project_code.clone(),
                project_link: format!("/test{}", i),
            };
            let _ = state.create_project(new_project).await?;
        }

        // get user_ids from project_code "test"
        let user_ids = state
            .get_user_ids_from_project_code("test".to_string())
            .await?;
        assert!(user_ids.is_some());
        let project = user_ids.unwrap();
        assert_eq!(project.len(), 5);
        let mut step = 0;
        for i in 0..5 {
            step += 1;
            assert_eq!(project[i] as usize, i + 1 + step);
        }
        Ok(())
    }
}
