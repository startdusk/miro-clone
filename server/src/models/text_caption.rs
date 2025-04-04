use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, AppState};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::FromRow)]
pub struct TextCaption {
    pub id: i64,
    pub project_id: i64,
    pub text_caption_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AppState {
    pub async fn get_text_caption(&self, project_id: i64) -> Result<Option<TextCaption>, AppError> {
        let text_caption = sqlx::query_as(
            r#"
            SELECT * FROM text_captions WHERE project_id = $1 LIMIT 1
            "#,
        )
        .bind(project_id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(text_caption)
    }

    pub async fn create_or_update_text_caption(
        &self,
        project_id: i64,
        text_caption_data: serde_json::Value,
    ) -> Result<TextCaption, AppError> {
        let text_caption = sqlx::query_as(
            r#"
            INSERT INTO text_captions (project_id, text_caption_data)
            VALUES ($1, $2)
            ON CONFLICT(project_id) DO UPDATE SET text_caption_data = $2, updated_at = NOW() RETURNING *
            "#,
        ).bind(project_id).bind(text_caption_data).fetch_one(&self.pool).await?;
        Ok(text_caption)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_create_or_update_text_caption() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;

        // 创建一个新的TextCaption
        let text_caption_data = serde_json::json!({
            "text": "Hello, world!",
            "color": "#000000",
            "fontSize": 16,
            "fontFamily": "Arial",
        });
        // 调用create_or_update_text_caption方法
        let text_caption = state
            .create_or_update_text_caption(project_id, text_caption_data.clone())
            .await?;
        // 检查创建的TextCaption是否正确
        assert_eq!(text_caption.project_id, project_id);
        assert_eq!(text_caption.text_caption_data, text_caption_data);

        // 更新TextCaption
        let updated_text_caption_data = serde_json::json!({
            "text": "Hello, world!",
            "color": "#000000",
            "fontSize": 16,
            "fontFamily": "Arial",
            "backgroundColor": "#ffffff",
        });
        // 调用create_or_update_text_caption方法
        let updated_text_caption = state
            .create_or_update_text_caption(project_id, updated_text_caption_data.clone())
            .await?;
        // 检查更新的TextCaption是否正确
        assert_eq!(updated_text_caption.project_id, project_id);
        assert_eq!(
            updated_text_caption.text_caption_data,
            updated_text_caption_data
        );

        Ok(())
    }

    #[tokio::test]
    async fn test_get_text_caption() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;
        let text_caption = state.get_text_caption(project_id).await?;
        assert!(text_caption.is_none());

        // 创建一个新的TextCaption
        let text_caption_data = serde_json::json!({
            "text": "Hello, world!",
            "color": "#000000",
            "fontSize": 16,
            "fontFamily": "Arial",
        });
        // 调用create_or_update_text_caption方法
        let _ = state
            .create_or_update_text_caption(project_id, text_caption_data.clone())
            .await?;
        // 调用get_text_caption方法
        let text_caption = state.get_text_caption(project_id).await?;
        assert!(text_caption.is_some());
        let text_caption = text_caption.unwrap();
        assert_eq!(text_caption.project_id, project_id);
        assert_eq!(text_caption.text_caption_data, text_caption_data);
        Ok(())
    }
}
