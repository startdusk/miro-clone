use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, AppState};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::FromRow)]
pub struct Joinee {
    pub id: i64,
    pub project_id: i64,
    pub user_id: i64,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AppState {
    pub async fn get_user_ids_from_joinees(
        &self,
        project_id: i64,
    ) -> Result<Option<Vec<i64>>, AppError> {
        let user_ids: Vec<i64> = sqlx::query_scalar(
            r#"
                SELECT user_id FROM joinees WHERE project_id = $1
            "#,
        )
        .bind(project_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(if user_ids.is_empty() {
            None
        } else {
            Some(user_ids)
        })
    }
    pub async fn get_joinees_from_project_id(
        &self,
        project_id: i64,
    ) -> Result<Vec<Joinee>, AppError> {
        let joinees = sqlx::query_as(
            r#"
                SELECT 
                    id,
                    project_id,
                    user_id,
                    created_at,
                    updated_at 
                FROM joinees WHERE project_id = $1
            "#,
        )
        .bind(project_id)
        .fetch_all(&self.pool)
        .await?;
        Ok(joinees)
    }

    pub async fn get_or_create_joinees(
        &self,
        project_id: i64,
        user_id: i64,
    ) -> Result<Joinee, AppError> {
        let joinee = sqlx::query_as(
            r#"
                INSERT INTO joinees (project_id, user_id)
                VALUES ($1, $2)
                ON CONFLICT (project_id, user_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
                RETURNING *
            "#,
        )
        .bind(project_id)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(joinee)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_get_joinees_from_project_id() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let joinees = state.get_joinees_from_project_id(1).await?;
        assert_eq!(joinees.len(), 0);

        // create a joinee
        let joinee = state.get_or_create_joinees(1, 1).await?;

        let joinees = state.get_joinees_from_project_id(1).await?;
        assert_eq!(joinees.len(), 1);
        assert_eq!(joinees[0].project_id, joinee.project_id);
        assert_eq!(joinees[0].user_id, joinee.user_id);

        Ok(())
    }

    #[tokio::test]
    async fn test_get_or_create_joinees() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let joinee = state.get_or_create_joinees(1, 1).await?;
        assert_eq!(joinee.project_id, 1);
        assert_eq!(joinee.user_id, 1);
        let joinee = state.get_or_create_joinees(1, 1).await?;
        assert_eq!(joinee.project_id, 1);
        assert_eq!(joinee.user_id, 1);

        let joinee = state.get_or_create_joinees(1, 2).await?;
        assert_eq!(joinee.project_id, 1);
        assert_eq!(joinee.user_id, 2);
        Ok(())
    }
}
