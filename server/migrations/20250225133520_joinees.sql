-- Add migration script here
CREATE TABLE IF NOT EXISTS joinees (
    id bigserial PRIMARY KEY,
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

ALTER TABLE joinees 
ADD CONSTRAINT unique_project_user 
UNIQUE (project_id, user_id);