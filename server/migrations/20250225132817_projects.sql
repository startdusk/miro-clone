-- Add migration script here
CREATE TABLE IF NOT EXISTS projects (
    id bigserial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NULL,
    project_code VARCHAR(255) NOT NULL,
    user_id BIGINT NOT NULL,
    project_link VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

-- Add user_id and name to unique index
CREATE UNIQUE INDEX IF NOT EXISTS unique_project_user_id_name ON projects (user_id, name);
