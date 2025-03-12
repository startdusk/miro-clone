-- Add migration script here
CREATE TABLE IF NOT EXISTS joinees (
    id bigserial PRIMARY KEY,
    project_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);
