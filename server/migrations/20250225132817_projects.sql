-- Add migration script here
CREATE TABLE IF NOT EXISTS projects (
    id serial PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NULL,
    project_code VARCHAR(255) NOT NULL,
    user_id INT NOT NULL,
    project_link VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);
