-- Add migration script here
CREATE TABLE IF NOT EXISTS oauth_clients (
    id uuid PRIMARY KEY,
    user_id bigint NOT NULL,
    name varchar(255) NOT NULL,
    secret varchar(100) NULL,
    provider varchar(255) NULL,
    redirect text NOT NULL,
    personal_access_client boolean NOT NULL,
    password_client boolean NOT NULL,
    revoked boolean NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP 
);

CREATE UNIQUE INDEX oauth_clients_user_id_index ON oauth_clients(user_id);
