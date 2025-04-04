use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, AppState};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::FromRow)]
pub struct MiniTextEditor {
    pub id: i64,
    pub project_id: i64,
    pub mini_text_editor_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AppState {
    pub async fn get_mini_text_editor(
        &self,
        project_id: i64,
    ) -> Result<Option<MiniTextEditor>, AppError> {
        let mini_text_editor = sqlx::query_as(
            r#"
            SELECT * FROM mini_text_editors WHERE project_id = $1 LIMIT 1
            "#,
        )
        .bind(project_id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(mini_text_editor)
    }

    pub async fn create_or_update_mini_text_editor(
        &self,
        project_id: i64,
        mini_text_editor_data: serde_json::Value,
    ) -> Result<MiniTextEditor, AppError> {
        let mini_text_editor = sqlx::query_as(
            r#"
            INSERT INTO mini_text_editors (project_id, mini_text_editor_data)
            VALUES ($1, $2) 
            ON CONFLICT(project_id) DO UPDATE SET mini_text_editor_data = $2, updated_at = NOW() RETURNING *
            "#,
        ).bind(project_id).bind(mini_text_editor_data).fetch_one(&self.pool).await?;
        Ok(mini_text_editor)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_create_or_update_mini_text_editor() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;
        let mini_text_editor_data = serde_json::json!({
            "text": "Hello, world!",
            "color": "#000000",
            "fontSize": 16,
            "fontFamily": "Arial",
            "fontWeight": "normal",
            "fontStyle": "normal",
            "textDecoration": "none",
            "textAlign": "left",
            "lineHeight": 1.5,
            "letterSpacing": 0,
            "wordSpacing": 0,
            "backgroundColor": "#ffffff",
            "backgroundImage": null,
            "backgroundRepeat": "repeat",
            "backgroundPosition": "0% 0%",
        });
        let mini_text_editor = state
            .create_or_update_mini_text_editor(project_id, mini_text_editor_data.clone())
            .await?;
        assert_eq!(mini_text_editor.project_id, project_id);
        assert_eq!(
            mini_text_editor.mini_text_editor_data,
            mini_text_editor_data
        );

        // 更新数据
        let updated_mini_text_editor_data = serde_json::json!({
            "text": "Hello, world!",
            "color": "#000000",
            "fontSize": 16,
            "fontFamily": "Arial",
            "fontWeight": "normal",
            "fontStyle": "normal",
            "textDecoration": "none",
        });
        let updated_mini_text_editor = state
            .create_or_update_mini_text_editor(project_id, updated_mini_text_editor_data.clone())
            .await?;
        assert_eq!(updated_mini_text_editor.project_id, project_id);
        assert_eq!(
            updated_mini_text_editor.mini_text_editor_data,
            updated_mini_text_editor_data
        );
        Ok(())
    }

    #[tokio::test]
    async fn test_get_mini_text_editor() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;
        let mini_text_editor = state.get_mini_text_editor(project_id).await?;
        assert!(mini_text_editor.is_none());
        // 创建数据
        let mini_text_editor_data = serde_json::json!({
            "text": "Hello, world!",
            "color": "#000000",
            "fontSize": 16,
            "fontFamily": "Arial",
        });
        state
            .create_or_update_mini_text_editor(project_id, mini_text_editor_data.clone())
            .await?;
        let mini_text_editor = state.get_mini_text_editor(project_id).await?;
        assert!(mini_text_editor.is_some());
        let mini_text_editor = mini_text_editor.unwrap();
        assert_eq!(mini_text_editor.project_id, project_id);
        assert_eq!(
            mini_text_editor.mini_text_editor_data,
            mini_text_editor_data
        );

        Ok(())
    }
}
