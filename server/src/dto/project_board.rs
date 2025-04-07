use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize)]
pub struct GetProjectBoardDataResponse {
    pub mini_text_editor: Option<serde_json::Value>,
    pub sticky_note: Option<serde_json::Value>,
    pub text_caption: Option<serde_json::Value>,
    pub drawing: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct CreateOrUpdateProjectBoardDataParams {
    pub mini_text_editor: Option<serde_json::Value>,
    pub sticky_note: Option<serde_json::Value>,
    pub text_caption: Option<serde_json::Value>,
    pub drawing: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Default, Deserialize)]
pub struct AddJoineesParams {
    pub project_code: String,
}
