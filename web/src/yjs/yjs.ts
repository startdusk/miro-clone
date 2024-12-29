import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { yjsDocStore } from '../store/yjsDoc';

export interface YjsParameter {
  roomname: string;
  observeFunc: (fn: (id: number) => void) => void
  hasEventSet: Set<number>;
  targetClassNameFunc: (id: number) => string;
  dragFunc: (id: number) => void;
  changeBodyContentFunc: (id: number) => void;
}

export function initYjs(params: YjsParameter) {
  const {
    roomname,
    hasEventSet,
    observeFunc,
    targetClassNameFunc,
    dragFunc,
    changeBodyContentFunc
  } = params
    observeFunc((id: number) => {
      if (!hasEventSet.has(id)) {
        hasEventSet.add(id)
        // add an event on each sticky note
        setTimeout(() => {
          dragFunc(id)
          changeBodyContentFunc(id)
          // 为什么这里也要设置为绝对定位呢？
          // 因为其他端接收到数据后并没有显式的设置为绝对定位, 
          // 会导致如果当前屏幕的移动或放大之类的操作无法同步到其他端(因为其他端的元素并没有设置为绝对定位, 会导致元素无法移动或放大)
          const target = document.querySelector('.' +targetClassNameFunc(id)) as HTMLElement;
          target.style.position = 'absolute'
        }, 200)
      }
    })
  // Sync clients with the y-websocket provider
  new WebsocketProvider(
    'ws://localhost:1234', roomname, yjsDocStore.doc
  )

  // this allows you to instantly get the (cached) documents data
  const indexeddbProvider = new IndexeddbPersistence(roomname, yjsDocStore.doc)
  indexeddbProvider.whenSynced.then(() => {
    console.log('loaded data from indexed db')
  })
}
