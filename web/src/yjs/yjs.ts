import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import { yjsDocStore } from "../store/yjsDoc";
import { runFuncSequentially } from "../hepler/utils";
import {
  initCursor,
  initDrawing,
  initMiniTextEditor,
  initMouse,
  initStickyNote,
  initTextCaption,
} from "./utils";

export function initYjs() {
  yjsDocStore.loading = true;
  runFuncSequentially([
    initCursor,
    initMouse,
    initDrawing,
    initMiniTextEditor,
    initStickyNote,
    initTextCaption
  ])
    .then(() => {
      console.log("All func run....");

      // this allows you to instantly get the (cached) documents data
      const indexeddbProvider = new IndexeddbPersistence(
        "miro-clone-1",
        yjsDocStore.doc
      );
      indexeddbProvider.whenSynced.then(() => {
        yjsDocStore.loading = false;
        console.log("loaded data from indexed db");
      });
    })
    .catch((err) => console.error(err));

  // Sync clients with the y-websocket provider
  new WebsocketProvider("ws://localhost:1234", "miro-clone-1", yjsDocStore.doc);
}
