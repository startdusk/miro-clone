use std::{convert::Infallible, time::Duration};

use axum::{
    extract::State,
    response::{sse::Event, Sse},
    Extension,
};

use futures::Stream;
use tokio::sync::broadcast;
use tracing::info;

use crate::{Account, AppEvent, AppState};

const CHANNEL_CAPACITY: usize = 256;

pub(crate) async fn sse_handler(
    Extension(user): Extension<Account>,
    State(state): State<AppState>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let user_id = user.id as u64;
    let users = &state.users;
    let mut rx = if let Some(tx) = users.get(&user_id) {
        tx.subscribe()
    } else {
        let (tx, rx) = broadcast::channel(CHANNEL_CAPACITY);
        state.users.insert(user_id, tx);
        rx
    };
    let left = state.users.len();
    info!("User {} subscribe, left {} users", user_id, left);
    let stream = async_stream::stream! {
        let _guard = Guard::new(user_id, state);
        while let Ok(v) = rx.recv().await {
            let name = match v.as_ref() {
                AppEvent::ProjectBoardEvent(_) => "ProjectBoardEvent",
                AppEvent::UserTyipingEvent(_) => "UserTyipingEvent",
            };
            let v = serde_json::to_string(&v).expect("Failed to serialize event");
            yield Ok(Event::default().data(v).event(name))
        }
    };

    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(Duration::from_secs(1))
            .text("keep-alive-text"),
    )
}

// Guard 实现客户端退出sse后，删除users中的user_id
// 参考: https://github.com/tokio-rs/axum/discussions/1060
struct Guard {
    user_id: u64,
    state: AppState,
}

impl Guard {
    pub fn new(user_id: u64, state: AppState) -> Self {
        Self { user_id, state }
    }
}

impl Drop for Guard {
    fn drop(&mut self) {
        self.state.users.remove(&self.user_id);
        let left = self.state.users.len();
        info!("User {} exit sse, left {} users", self.user_id, left);
    }
}

