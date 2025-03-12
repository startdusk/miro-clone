-- Add migration script here
CREATE TABLE IF NOT EXISTS drawings (
    id bigserial PRIMARY KEY,
    project_id INT NOT NULL,
    drawing_data JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);
