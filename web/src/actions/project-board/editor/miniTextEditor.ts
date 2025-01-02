import { createMiniTextEditorBodyClassName, createMiniTextEditorClassName, createMiniTextEditorHandlerClassName, createMiniTextEditorResizerClassName, type IMiniTextEditor } from "./miniTextEditorType";
import { miniTextEditorStore } from "../../../store/miniTextEditor";
import { yjsDocStore } from "../../../store/yjsDoc";
import { useEditor } from "./editor";

import { debounce, runFuncSequentially } from '../../../hepler/utils';
import { createBlinkingCursorClassName } from "../blinking-cursor/blinkingCursorType";
import type { ICursor } from "../../../types";

/**
 * 使用拖拽小型文本编辑器
 */
export function useDragMiniTextEditor() {
  const { initMiniTextEditor } = useEditor()

  const miniTextEditorHasEventSet = new Set<number>()

  const _modifyMiniTextEditor = debounce(function(fn: (...args: any[]) => void) { fn() }, 200)

  const getCursorPosition = (editor: HTMLElement): ICursor => {
    const selection = window.getSelection() as Selection
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0) as Range
      const cloneRange = range.cloneRange()
      cloneRange.selectNodeContents(editor)
      cloneRange.setEnd(range.endContainer, range.endOffset)
      const cursorPosition = cloneRange.toString().length
      const rect = range.getBoundingClientRect(); // Get the position of the cursor
      const editorRect = editor.getBoundingClientRect();
      const x = `${rect.left - editorRect.left}px`;
      const y = `${rect.bottom - editorRect.top + window.scrollY + 20}px`;
      return { cursorPosition, x, y }
    }
    return { cursorPosition: 0, x: '0px', y: '0px' }
  }

  const moveCursorToPosition = (editor: HTMLElement, position: number) => {
    const selection = window.getSelection() as Selection
    const range = document.createRange()
    let currentPos = 0
    // Iterate over child nodes to find the correct text node
    for (const node of editor.childNodes) {
      const nodeLen = (node.textContent || '').length
      // If it's a text node, set the cursor directly
      if (currentPos + nodeLen >= position) {
        if (node.nodeType === Node.TEXT_NODE) {
          range.setStart(node, position - currentPos)
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          // For element nodes, recursively go inside its child nodes to find the correct position
          setCursorInsideElement(node, position-currentPos, range)
        }
        break
      }
      
      currentPos += nodeLen
    }
    range.collapse(true) // 使范围在起始点处
    selection.removeAllRanges() // 清除现有的选择
    selection.addRange(range) // 添加新的范围
    editor.focus() // 光标聚焦
  }

  // Helper function to set cursor inside nested elements
  const setCursorInsideElement = (element: ChildNode, position: number, range: Range) => {
    for (const node of element.childNodes) {
      const nodeLen = (node.textContent || '').length
      if (position <= nodeLen) {
        if (node.nodeType === Node.TEXT_NODE) {
          range.setStart(node, position)
        } else {
          setCursorInsideElement(node, position, range)
        }
        break
      }
      position -= nodeLen
    }
  }

  const changeMiniTextEditorBodyContent = (id: number) => {
    const miniTextEditorContent = document.querySelector('.'+createMiniTextEditorBodyClassName(id)) as HTMLElement
    const index = yjsDocStore.miniTextEditors.findIndex(editor => editor.id === id)
    if (index === -1) return

    const _changeMiniTextEditorContentOnEvent = () => {
      const _changeMiniTextEditorBodyContent = () => {
        yjsDocStore.doc.transact(() => {
          const trackMiniTextEditor = yjsDocStore.yArrayMiniTextEditor.get(index)
          if (!trackMiniTextEditor) return
          
          trackMiniTextEditor.body = miniTextEditorContent.innerHTML
          yjsDocStore.yArrayMiniTextEditor.delete(index)
          yjsDocStore.yArrayMiniTextEditor.insert(index, [trackMiniTextEditor])
        })
      }

      const blinkingCursor = document.querySelector(
        "." + createBlinkingCursorClassName(id)
      ) as HTMLElement;
      blinkingCursor.style.display = "block";
      const cursor = getCursorPosition(miniTextEditorContent);
      yjsDocStore.setCursorInfo(cursor)

      const getPos = () => {
        return new Promise((resolve, _) => {
          const curPos = getCursorPosition(miniTextEditorContent)
          yjsDocStore.setMiniTextEditorBodyTestCursorPosition(curPos.cursorPosition)
          _changeMiniTextEditorBodyContent()
          resolve(null)
        })
      }

      const setPos = () => {
        return new Promise((resolve, _) => {
          moveCursorToPosition(miniTextEditorContent, yjsDocStore.miniTextEditorBodyTextCursorPosition)
          resolve(null)
        })
      }

      const runner = () => {
        runFuncSequentially([getPos, setPos]).then(() => {
          console.log('All function completed in sequence.')
        })
      }
      
      _modifyMiniTextEditor(runner)
    }

    miniTextEditorContent.addEventListener('keydown', _changeMiniTextEditorContentOnEvent)
    miniTextEditorContent.addEventListener('mouseup', _changeMiniTextEditorContentOnEvent)
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

    initMiniTextEditor(id)
  }

  return { createMiniTextEditor, dragMiniTextEditor, changeMiniTextEditorBodyContent, miniTextEditorHasEventSet, deleteMiniTextEditor }
}

/**
 * 获取随机颜色
 */
function getRandomColorClass() {
  const colors = ['bg-blue-300', 'bg-indigo-300', 'bg-yellow-300', 'bg-pink-300']
  return colors[Math.floor(Math.random() * colors.length)]
}