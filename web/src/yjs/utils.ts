import { yjsDocStore } from "../store/yjsDoc";
import { useDragMiniTextEditor } from "../actions/project-board/editor/miniTextEditor"; 
import { useDragStickyNote } from "../actions/project-board/sticky-note/stickyNote";
import { createMiniTextEditorClassName } from "../actions/project-board/editor/miniTextEditorType";
import { createStickyNoteClassName } from "../actions/project-board/sticky-note/stickyNoteType";
import { useCanvas } from "../actions/project-board/canvas/canvas";

const { initCanvas } = useCanvas()
const { dragMiniTextEditor, changeMiniTextEditorBodyContent, miniTextEditorHasEventSet  } = useDragMiniTextEditor()
const { dragStickyNote, changeStickyNoteBodyContent, stickyNoteHasEventSet } = useDragStickyNote()

export const initCursor = () =>{
  return new Promise((resolve, _reject) =>{
      yjsDocStore.observeTypesForCursor()
      resolve(null)
  })
}

export const initMouse = () =>{
  return new Promise((resolve, _reject) =>{
      yjsDocStore.observeTypesForMouse()
      resolve(null)
  })
}

export const initDrawing = () =>{
  return new Promise((resolve, _reject) =>{
      yjsDocStore.observeTypesDrawing(async () => {
        (await initCanvas()).replayDrawing()
      })
      resolve(null)
  })
}

export interface YjsParameter {
  observeFunc: (fn: (id: number) => void) => void
  hasEventSet: Set<number>;
  targetClassNameFunc: (id: number) => string;
  dragFunc: (id: number) => void;
  changeBodyContentFunc: (id: number) => void;
}

export const initStickyNote = () => {
  return new Promise((resolve, _reject) =>{
      initYjsFunc({
        observeFunc: yjsDocStore.observeYArrayStickyNote,
        hasEventSet: stickyNoteHasEventSet,
        targetClassNameFunc: createStickyNoteClassName,
        dragFunc: dragStickyNote,
        changeBodyContentFunc: changeStickyNoteBodyContent
      })
      resolve(null)
  })
}

export const initTextCaption = () => {
  return new Promise((resolve, _reject) =>{
      initYjsFunc({
        observeFunc: yjsDocStore.observeYArrayStickyNote,
        hasEventSet: stickyNoteHasEventSet,
        targetClassNameFunc: createStickyNoteClassName,
        dragFunc: dragStickyNote,
        changeBodyContentFunc: changeStickyNoteBodyContent
      })
      resolve(null)
  })
}

export const initMiniTextEditor = () => {
  return new Promise((resolve, _reject) =>{
      initYjsFunc({
        observeFunc: yjsDocStore.observeYArrayMiniTextEditor,
        hasEventSet: miniTextEditorHasEventSet,
        targetClassNameFunc: createMiniTextEditorClassName,
        dragFunc: dragMiniTextEditor,
        changeBodyContentFunc: changeMiniTextEditorBodyContent
      })
      resolve(null)
  })
}

export function initYjsFunc(params: YjsParameter) {
  const {
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
}
