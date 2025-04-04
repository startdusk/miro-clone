-- Add migration script here
CREATE TABLE IF NOT EXISTS sticky_notes (
    id bigserial PRIMARY KEY,
    project_id BIGINT NOT NULL,
    sticky_note_data JSON NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sticky_notes_project_id_idx ON sticky_notes(project_id);