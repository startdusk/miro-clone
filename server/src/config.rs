use anyhow::{bail, Result};
use serde::{Deserialize, Serialize};
use std::{env, fs::File};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppConfig {
    pub server: ServerConfig,
    pub auth: AuthConfig,
    pub oauth: OAuthConfig,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthConfig {
    pub github: Github,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthConfig {
    pub sk: String,
    pub pk: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ServerConfig {
    pub port: u16,
    pub db_url: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Github {
    pub client_id: String,
    pub client_secret: String,
    pub auth_url: String,
    pub token_url: String,
    pub redirect_url: String,
    pub scopes: Option<Vec<String>>,
}

impl AppConfig {
    pub fn load() -> Result<Self> {
        let ret: AppConfig = match (
            File::open("server.yml"),
            File::open("/etc/config/server.yml"),
            env::var("SERVER_CONFIG"),
        ) {
            (Ok(reader), _, _) => serde_yaml::from_reader(reader)?,
            (_, Ok(reader), _) => serde_yaml::from_reader(reader)?,
            (_, _, Ok(path)) => serde_yaml::from_reader(File::open(path)?)?,
            _ => bail!("Config file server.yml not found"),
        };

        Ok(ret)
    }
}
