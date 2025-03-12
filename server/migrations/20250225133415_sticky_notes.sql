-- Add migration script here
CREATE TABLE IF NOT EXISTS sticky_notes (
    id bigserial PRIMARY KEY,
    project_id INT NOT NULL,
    sticky_note_data JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);