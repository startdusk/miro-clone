use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, AppState};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::FromRow)]
pub struct StickyNote {
    pub id: i64,
    pub project_id: i64,
    pub sticky_note_data: serde_json::Value,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl AppState {
    pub async fn get_sticky_note(&self, project_id: i64) -> Result<Option<StickyNote>, AppError> {
        let sticky_note = sqlx::query_as(
            r#"
            SELECT * FROM sticky_notes WHERE project_id = $1 LIMIT 1
        "#,
        )
        .bind(project_id)
        .fetch_optional(&self.pool)
        .await?;
        Ok(sticky_note)
    }

    pub async fn create_or_update_sticky_note(
        &self,
        project_id: i64,
        sticky_note_data: serde_json::Value,
    ) -> Result<StickyNote, AppError> {
        let sticky_note = sqlx::query_as(
            r#"
            INSERT INTO sticky_notes (project_id, sticky_note_data)
            VALUES ($1, $2)
            ON CONFLICT (project_id) DO UPDATE SET sticky_note_data = $2, updated_at = NOW()
            RETURNING *
        "#,
        )
        .bind(project_id)
        .bind(sticky_note_data)
        .fetch_one(&self.pool)
        .await?;
        Ok(sticky_note)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_create_or_update_sticky_note() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;
        let sticky_note_data = serde_json::json!({
            "title": "Test Sticky Note",
            "content": "This is a test sticky note.",
            "position": {
                "x": 100,
                "y": 200
            },
            "size": {
                "width": 300,
                "height": 400
            },
            "zIndex": 1
        });
        // 创建或更新 StickyNote
        let sticky_note = state
            .create_or_update_sticky_note(project_id, sticky_note_data.clone())
            .await?;
        // 验证 StickyNote 数据
        assert_eq!(sticky_note.project_id, project_id);
        assert_eq!(sticky_note.sticky_note_data, sticky_note_data);
        // 更新 StickyNote 数据
        let updated_sticky_note_data = serde_json::json!({
            "title": "Updated Sticky Note",
            "content": "This is an updated sticky note.",
            "position": {
                "x": 200,
                "y": 300
            },
            "size": {
                "width": 400,
                "height": 500
            },
            "zIndex": 2
        });
        let updated_sticky_note = state
            .create_or_update_sticky_note(project_id, updated_sticky_note_data.clone())
            .await?;
        // 验证更新后的 StickyNote 数据
        assert_eq!(updated_sticky_note.project_id, project_id);
        assert_eq!(
            updated_sticky_note.sticky_note_data,
            updated_sticky_note_data
        );
        Ok(())
    }

    #[tokio::test]
    async fn test_get_sticky_note() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let project_id = 1;
        let sticky_note_data = serde_json::json!({
            "title": "Test Sticky Note",
            "content": "This is a test sticky note.",
            "position": {
                "x": 100,
                "y": 200
            },
            "size": {
                "width": 300,
                "height": 400
            },
            "zIndex": 1
        });
        // 创建或更新 StickyNote
        let _ = state
            .create_or_update_sticky_note(project_id, sticky_note_data.clone())
            .await?;
        // 获取 StickyNote
        let sticky_note = state.get_sticky_note(project_id).await?;
        // 验证 StickyNote 数据
        assert!(sticky_note.is_some());
        let sticky_note = sticky_note.unwrap();
        assert_eq!(sticky_note.project_id, project_id);
        assert_eq!(sticky_note.sticky_note_data, sticky_note_data);
        Ok(())
    }
}
