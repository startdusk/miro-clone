-- Add migration script here
CREATE TABLE IF NOT EXISTS mini_text_editors (
    id bigserial PRIMARY KEY,
    project_id BIGINT NOT NULL,
    mini_text_editor_data JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_project_id_idx ON mini_text_editors (project_id);