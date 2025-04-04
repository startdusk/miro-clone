use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, AppState};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::FromRow)]
pub struct Drawing {
    pub id: i64,
    pub project_id: i64,
    pub drawing_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AppState {
    pub async fn get_drawing(&self, project_id: i64) -> Result<Option<Drawing>, AppError> {
        let drawing = sqlx::query_as(
            r#"
            SELECT * FROM drawings WHERE project_id = $1 LIMIT 1
            "#,
        )
        .bind(project_id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(drawing)
    }

    pub async fn create_or_update_drawing(
        &self,
        project_id: i64,
        drawing_data: serde_json::Value,
    ) -> Result<Drawing, AppError> {
        let drawing = sqlx::query_as(
            r#"
            INSERT INTO drawings (project_id, drawing_data)
            VALUES ($1, $2)
            ON CONFLICT(project_id) DO UPDATE SET drawing_data = $2, updated_at = NOW()
            RETURNING *
            "#,
        )
        .bind(project_id)
        .bind(drawing_data)
        .fetch_one(&self.pool)
        .await?;
        Ok(drawing)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_get_drawing() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;
        let drawing = state.get_drawing(project_id).await?;
        assert!(drawing.is_none());
        // 创建一个drawing
        let drawing_data = serde_json::json!({
            "shapes": [
                {
                    "type": "rect",
                    "x": 10,
                    "y": 20,
                    "width": 50,
                    "height": 30
                }
            ]
        });
        let _ = state
            .create_or_update_drawing(project_id, drawing_data.clone())
            .await?;
        // 获取drawing
        let drawing = state.get_drawing(project_id).await?;
        assert!(drawing.is_some());
        let drawing = drawing.unwrap();
        assert_eq!(drawing.project_id, project_id);
        assert_eq!(drawing.drawing_data, drawing_data);
        Ok(())
    }

    #[tokio::test]
    async fn test_create_or_update_drawing() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;
        let drawing_data = serde_json::json!({
            "shapes": [
                {
                    "type": "rect",
                    "x": 10,
                    "y": 20,
                    "width": 50,
                    "height": 30
                }
            ]
        });
        let drawing = state
            .create_or_update_drawing(project_id, drawing_data.clone())
            .await?;
        assert_eq!(drawing.project_id, project_id);
        assert_eq!(drawing.drawing_data, drawing_data);

        // 更新drawing_data
        let new_drawing_data = serde_json::json!({
            "shapes": [
                {
                    "type": "rect",
                    "x": 10,
                    "y": 20,
                    "width": 50,
                    "height": 30
                },
                {
                    "type": "circle",
                    "x": 30,
                    "y": 40,
                    "radius": 20
                },
            ]
        });
        let updated_drawing = state
            .create_or_update_drawing(project_id, new_drawing_data.clone())
            .await?;
        assert_eq!(updated_drawing.project_id, project_id);
        assert_eq!(updated_drawing.drawing_data, new_drawing_data);
        Ok(())
    }
}
