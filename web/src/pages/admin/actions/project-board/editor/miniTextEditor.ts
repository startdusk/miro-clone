import { createMiniTextEditorBodyClassName, createMiniTextEditorClassName, createMiniTextEditorHandlerClassName, createMiniTextEditorResizerClassName, type IMiniTextEditor } from "../miniTextEditorType";
import { miniTextEditorStore } from "../../../../../store/miniTextEditor";
import { yjsDocStore } from "../../../../../store/yjsDoc";
import { useEditor } from "./editor";

import { initYjs } from '../../../../../yjs/yjs';
import { debounce } from '../../../../../hepler/utils';

/**
 * 使用拖拽小型文本编辑器
 */
export function useDragMiniTextEditor() {
  const { applyBold, applyItalic, applyUnderline, applyH1, applyH2, applyH3, applyAlignCenter, applyAlignLeft, applyAlignRight, applyUnorderedList, applyLink, insertImage, highlightText } = useEditor()

  const miniTextEditorHasEventSet = new Set<number>()

  const initMiniTextEditorYjs = () => {
    initYjs({
      roomname: "mini-text-editor",
      hasEventSet: miniTextEditorHasEventSet,
      observeFunc: yjsDocStore.observeYArrayMiniTextEditor,
      targetClassNameFunc: createMiniTextEditorClassName,
      dragFunc: dragMiniTextEditor,
      changeBodyContentFunc: changeMiniTextEditorBodyContent
    })
  }

  const _modifyMiniTextEditor = debounce(function(fn: (...args: any[]) => void) { fn() }, 200)

  const changeMiniTextEditorBodyContent = (id: number) => {
    const miniTextEditorContent = document.querySelector('.'+createMiniTextEditorBodyClassName(id)) as HTMLElement
    const index = yjsDocStore.miniTextEditors.findIndex(editor => editor.id === id)
    if (index === -1) return
    miniTextEditorContent.addEventListener('keydown', () => {
      const _changeMiniTextEditorBodyContent = () => {
        yjsDocStore.doc.transact(() => {
          const trackMiniTextEditor = yjsDocStore.yArrayMiniTextEditor.get(index)
          if (!trackMiniTextEditor) return
          trackMiniTextEditor.body = miniTextEditorContent.innerHTML
          yjsDocStore.yArrayMiniTextEditor.delete(index)
          yjsDocStore.yArrayMiniTextEditor.insert(index, [trackMiniTextEditor])
        })
      }
      _modifyMiniTextEditor(_changeMiniTextEditorBodyContent)
    })
  }
  
  const changeMiniTextEditorResizeXYPosition = (id: number, newResizeY: number) => {
    const index = yjsDocStore.miniTextEditors.findIndex(editor => editor.id === id)
    if (index === -1) return
    // 富文本编辑器不需要调整宽度，只需要调整高度
    // const x = (miniTextEditors.value[index].resizePosition.x = newResizeX)
    const y = (yjsDocStore.miniTextEditors[index].resizePosition.y = newResizeY)
    yjsDocStore.doc.transact(() => {
      const trackMiniTextEditor = yjsDocStore.yArrayMiniTextEditor.get(index)
      if (!trackMiniTextEditor) return
      // trackMiniTextEditor.resizePosition.x = x
      trackMiniTextEditor.resizePosition.y = y
      yjsDocStore.yArrayMiniTextEditor.delete(index)
      yjsDocStore.yArrayMiniTextEditor.insert(index, [trackMiniTextEditor])
    })
  }

  const changeMiniTextEditorXYPosition = (id: number, startX: number, startY: number) => {
    const index = yjsDocStore.miniTextEditors.findIndex(editor => editor.id === id)
    if (index === -1) return
    const x = (yjsDocStore.miniTextEditors[index].dragPosition.x = startX)
    const y = (yjsDocStore.miniTextEditors[index].dragPosition.y = startY)
    yjsDocStore.doc.transact(() => {
      const trackMiniTextEditor = yjsDocStore.yArrayMiniTextEditor.get(index)
      if (!trackMiniTextEditor) return
      trackMiniTextEditor.dragPosition.x = x
      trackMiniTextEditor.dragPosition.y = y
      yjsDocStore.yArrayMiniTextEditor.delete(index)
      yjsDocStore.yArrayMiniTextEditor.insert(index, [trackMiniTextEditor])
    })
  }

  const defaultResizeX = 470
  const defaultResizeY = 40
  const createMiniTextEditor = () => {
    const id = new Date().getTime(); // id 取时间戳，保证唯一性
    const color = getRandomColorClass()
    const editor = {
      id,
      body: "",
      color,
      dragPosition: { x: 0, y: 0 },
      resizePosition: { x: defaultResizeX, y: defaultResizeY }
    }
    yjsDocStore.miniTextEditors.push(editor)

    yjsDocStore.yArrayMiniTextEditor.insert(0, [editor])
    miniTextEditorStore.miniTextEditor.id = id
    setTimeout(() => dragMiniTextEditor(id), 200)
  }

  const deleteMiniTextEditor = (miniTextEditor: IMiniTextEditor) => {
    const index = yjsDocStore.miniTextEditors.findIndex(editor => editor.id === miniTextEditor.id)
    if (index === -1) return
    yjsDocStore.miniTextEditors.splice(index)
    yjsDocStore.yArrayMiniTextEditor.delete(index)
    miniTextEditorHasEventSet.delete(miniTextEditor.id)
  }

  const dragMiniTextEditor = (id: number) => {
    miniTextEditorStore.miniTextEditor.id = id
    const miniTextEditor = document.querySelector('.' + createMiniTextEditorClassName(id)) as HTMLElement;
    const miniTextEditorHandler = document.querySelector('.' + createMiniTextEditorHandlerClassName(id)) as HTMLElement;
    const miniTextEditorResizer = document.querySelector('.' + createMiniTextEditorResizerClassName(id)) as HTMLElement;
    
    // for dragging
    let newX = 0, newY = 0, startX = 0, startY = 0
    // for resizing
    let startRX = 0, startRY = 0
    let miniTextEditorStartWidth = 0, miniTextEditorStartHeight = 0

    // click
    miniTextEditor.addEventListener('click', () => {
      miniTextEditorStore.miniTextEditor.id = id
    })

    // resizing
    miniTextEditorResizer.addEventListener('mousedown', (e: any) => {
      miniTextEditorStore.miniTextEditor.id = id
      startRX = e.clientX
      startRY = e.clientY

      miniTextEditorStartWidth = miniTextEditor.offsetWidth
      miniTextEditorStartHeight = miniTextEditor.offsetHeight

      miniTextEditor.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        const newWidth = miniTextEditorStartWidth + e.clientX - startRX
        const newHeight = miniTextEditorStartHeight + e.clientY - startRY 
        
        changeMiniTextEditorResizeXYPosition(id, newHeight)
        miniTextEditor.style.width = Math.max(newWidth, defaultResizeX)+'px'
        miniTextEditor.style.height = Math.max(newHeight, defaultResizeY)+'px'
      }

      const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
      }

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)

    })

    // draging
    miniTextEditorHandler.addEventListener('mousedown', (e: any) => {
      miniTextEditorStore.miniTextEditor.id = id

      startX = e.clientX
      startY = e.clientY

      miniTextEditor.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        newX = startX - e.clientX
        newY = startY - e.clientY
        startX = e.clientX
        startY = e.clientY

        changeMiniTextEditorXYPosition(id, startX, startY)

        miniTextEditor.style.top = (miniTextEditor.offsetTop-newY)+'px'
        miniTextEditor.style.left = (miniTextEditor.offsetLeft-newX)+'px'
      }

      const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
      }

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)

    })

    applyBold(id)
    applyItalic(id)
    applyUnderline(id)
    applyH1(id)
    applyH2(id)
    applyH3(id)
    applyAlignLeft(id)
    applyAlignCenter(id)
    applyAlignRight(id)
    applyUnorderedList(id)
    applyLink(id)
    insertImage(id)
    highlightText(id)
  }

  return { createMiniTextEditor, deleteMiniTextEditor, initMiniTextEditorYjs }
}

/**
 * 获取随机颜色
 */
function getRandomColorClass() {
  const colors = ['bg-blue-300', 'bg-indigo-300', 'bg-yellow-300', 'bg-pink-300']
  return colors[Math.floor(Math.random() * colors.length)]
}