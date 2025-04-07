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

interface IYjsOption {
  projectCode: string;
}

export function initYjs(opt : IYjsOption) {
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
      // const indexeddbProvider = new IndexeddbPersistence(
      //   opt.projectCode,
      //   yjsDocStore.doc
      // );
      // indexeddbProvider.whenSynced.then(() => {
      //   yjsDocStore.loading = false;
      //   console.log("loaded data from indexed db");
      // });
    })
    .catch((err) => console.error(err));

  // Sync clients with the y-websocket provider
  // const provider = new WebsocketProvider("ws://localhost:1234", "miro-clone-1", yjsDocStore.doc);
  // provider.on("status", (event) => {
  //   console.log("yjs provider status:", event.status);
  //   if (event.status === "connected") {
  //     yjsDocStore.loading = false;
  //     console.log("loaded data from yjs server");
  //   }
  // });
}
