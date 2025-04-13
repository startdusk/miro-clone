use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

use crate::{error::AppError, AppState};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, sqlx::FromRow)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub email_verified_at: Option<DateTime<Utc>>,
    pub github_id: Option<String>,
    #[serde(skip)]
    pub password: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

pub struct NewUser {
    pub name: String,
    pub email: String,
    pub github_id: String,
}

pub struct UpdateUser {
    pub name: String,
    pub email: String,
    pub user_id: i64,
}

impl AppState {
    /// 异步函数，根据account_id获取用户信息
    pub async fn get_user(&self, account_id: impl Into<String>) -> Result<Option<User>, AppError> {
        // 使用sqlx查询数据库，获取用户信息
        let user = sqlx::query_as(
            r#"
            SELECT * FROM users WHERE github_id = $1
        "#,
        )
        .bind(account_id.into())
        .fetch_optional(&self.pool)
        .await?;
        // 返回查询结果
        Ok(user)
    }

    /// 异步函数，创建用户，如果用户已存在则更新下更新时间
    pub async fn create_user(&self, new_user: NewUser) -> Result<User, AppError> {
        // 使用sqlx查询数据库，创建用户
        let user = sqlx::query_as(
            r#"
            INSERT INTO users (name, email, github_id) 
            VALUES ($1, $2, $3)  
            ON CONFLICT(github_id) DO UPDATE SET updated_at=NOW() RETURNING * 
        "#,
        )
        .bind(new_user.name)
        .bind(new_user.email)
        .bind(new_user.github_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(user)
    }

    pub async fn update_user(&self, update_data: UpdateUser) -> Result<User, AppError> {
        let user = sqlx::query_as(
            r#"
            UPDATE users
            SET name = $1, email = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
        "#,
        )
        .bind(update_data.name)
        .bind(update_data.email)
        .bind(update_data.user_id)
        .fetch_one(&self.pool)
        .await?;
        Ok(user)
    }

    pub async fn get_users_from_user_ids(&self, user_ids: Vec<i64>) -> Result<Vec<User>, AppError> {
        let users = sqlx::query_as(
            r#"
            SELECT * FROM users WHERE id = ANY($1)
        "#,
        )
        .bind(user_ids)
        .fetch_all(&self.pool)
        .await?;
        Ok(users)
    }
}

impl NewUser {
    pub fn new(name: String, email: String, github_id: String) -> Self {
        Self {
            name,
            email,
            github_id,
        }
    }
}

impl UpdateUser {
    pub fn new(name: String, email: String, user_id: i64) -> Self {
        Self {
            name,
            email,
            user_id,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use anyhow::Result;

    #[tokio::test]
    async fn test_new_user() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let new_user = NewUser::new(
            "test".to_string(),
            "test@example.com".to_string(),
            "123456".to_string(),
        );
        assert_eq!(new_user.name, "test");
        assert_eq!(new_user.email, "test@example.com");
        assert_eq!(new_user.github_id, "123456");
        let user = state.create_user(new_user).await?;
        assert_eq!(user.name, "test");
        assert_eq!(user.email, "test@example.com");
        assert_eq!(user.github_id, Some("123456".to_string()));
        Ok(())
    }

    #[tokio::test]
    async fn test_update_user() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        let new_user = NewUser::new(
            "test".to_string(),
            "EMAIL.test@example.com".to_string(),
            "123456".to_string(),
        );
        let user = state.create_user(new_user).await?;
        assert_eq!(user.name, "test");
        assert_eq!(user.github_id, Some("123456".to_string()));
        assert_eq!(user.email, "EMAIL.test@example.com".to_string());

        let update_user = UpdateUser::new(
            "test2".to_string(),
            "EMAIL.test2@example.com".to_string(),
            user.id,
        );
        let user = state.update_user(update_user).await?;
        assert_eq!(user.name, "test2");
        assert_eq!(user.github_id, Some("123456".to_string()));
        assert_eq!(user.email, "EMAIL.test2@example.com".to_string());
        Ok(())
    }

    #[tokio::test]
    async fn test_get_user() -> Result<()> {
        let (_tdb, state) = AppState::new_for_test().await?;
        // create 10 users
        let mut user_ids = Vec::new();
        for i in 0..10 {
            let new_user = NewUser::new(
                format!("test{}", i),
                format!("test{}@example.com", i),
                format!("123456{}", i),
            );
            let user = state.create_user(new_user).await?;
            user_ids.push(user.id);
        }
        let user_ids_len = user_ids.len();

        let users = state.get_users_from_user_ids(user_ids).await?;

        assert_eq!(users.len(), user_ids_len);
        assert_eq!(users.len(), 10);

        Ok(())
    }
}
