-- Add migration script here
CREATE TABLE IF NOT EXISTS text_captions (
    id bigserial PRIMARY KEY,
    project_id BIGINT NOT NULL,
    text_caption_data JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE UNIQUE INDEX IF NOT EXISTS unique_project_id_idx ON text_captions (project_id);
