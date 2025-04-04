-- Add migration script here
CREATE TABLE IF NOT EXISTS drawings (
    id bigserial PRIMARY KEY,
    project_id BIGINT NOT NULL,
    drawing_data JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE UNIQUE INDEX IF NOT EXISTS project_id_idx ON drawings (project_id);