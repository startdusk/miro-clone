use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct User {
    pub id: i64,
    pub username: String,
    pub email: String,
    pub github_id: Option<String>,
    #[serde(skip)]
    pub password_hash: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

impl User {
    pub fn new(
        id: i64,
        username: impl Into<String>,
        email: impl Into<String>,
        github_id: Option<String>,
    ) -> Self {
        let now = chrono::Utc::now();
        Self {
            id,
            username: username.into(),
            email: email.into(),
            github_id,
            password_hash: None,
            created_at: now,
            updated_at: now,
        }
    }
}
