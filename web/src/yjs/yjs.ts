import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { yjsDocStore } from '../store/yjsDoc';
import { runFuncSequentially } from '../hepler/utils';
import { initCursor, initDrawing, initMiniTextEditor, initMouse, initStickyNote } from './utils';


export function initYjs() {
  runFuncSequentially([
    initCursor,
    initMouse,
    initDrawing,
    initMiniTextEditor,
    initStickyNote
  ]).then(() => {
    console.log('All func run....')
  }).catch((err) => console.error(err))

  // Sync clients with the y-websocket provider
  new WebsocketProvider(
    'ws://localhost:1234', 'miro-clone-1', yjsDocStore.doc
  )

  // this allows you to instantly get the (cached) documents data
  const indexeddbProvider = new IndexeddbPersistence('miro-clone-1', yjsDocStore.doc)
  indexeddbProvider.whenSynced.then(() => {
    console.log('loaded data from indexed db')
  })
}
