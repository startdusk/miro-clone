-- Add migration script here
CREATE TABLE IF NOT EXISTS mini_text_editors (
    id bigserial PRIMARY KEY,
    project_id INT NOT NULL,
    mini_text_editor_data JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);
