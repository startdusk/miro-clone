import { textCaptionStore } from "../../../store/textCaption";
import { yjsDocStore } from "../../../store/yjsDoc";

import { debounce, getCursorPosition, moveCursorToPosition, runFuncSequentially } from "../../../hepler/utils";
import { createTextCaptionBodyClassName, createTextCaptionClassName, createTextCaptionHandlerClassName, createTextCaptionResizerClassName } from "./textCaptionTypes";
import type { ITextCaption } from "../../../types";

/**
 * 拖拽文本框
 * @returns 
 */
export function useDragTextCaption() {
  const textCaptionHasEventSet = new Set<number>()

  /**
   * 修改拖拽文本框 
   */
  const _modifyTextCaption = debounce(function(fn: (...args: any[]) => void) {
    fn()
  }, 200)

  /**
   * 修改文本框内容
   * @param id 文本框id
   * @returns 
   */
  const changeTextCaptionBodyContent = (id: number) => {
    const textCaptionContent = document.querySelector('.'+createTextCaptionBodyClassName(id)) as HTMLElement
    const index = yjsDocStore.textCaptions.findIndex(note => note.id === id)
    if (index === -1) return
    const _changeTextCaptionBodyContentOnEvent = () => {
      const _changeTextCaptionBodyContent = () => {
        yjsDocStore.doc.transact(() => {
          const trackTextCaption = yjsDocStore.yArrayTextCaption.get(index)
          if (!trackTextCaption) return
          trackTextCaption.body = textCaptionContent.textContent || ''
          yjsDocStore.yArrayTextCaption.delete(index)
          yjsDocStore.yArrayTextCaption.insert(index, [trackTextCaption])
        })
      }

      const getPos = () => {
        return new Promise((resolve, _) => {
          const curPos = getCursorPosition(textCaptionContent)
          yjsDocStore.setTextCaptionBodyTestCursorPosition(curPos.cursorPosition)
          _changeTextCaptionBodyContent()
          resolve(null)
        })
      }

      const setPos = () => {
        return new Promise((resolve, _) => {
          moveCursorToPosition(textCaptionContent, yjsDocStore.textCaptionBodyTextCursorPostion)
          resolve(null)
        })
      }

      const runner = () => {
        runFuncSequentially([getPos, setPos]).then(() => {
          console.log('text caption: all function completed in sequence.')
        })
      }
      
      _modifyTextCaption(runner)
    }

    textCaptionContent.addEventListener('keydown', _changeTextCaptionBodyContentOnEvent)
    textCaptionContent.addEventListener('mouseup', _changeTextCaptionBodyContentOnEvent)
  }
  
  const changeTextCaptionResizeXYPosition = (id: number, newResizeX: number, newResizeY: number) => {
    const index = yjsDocStore.textCaptions.findIndex(note => note.id === id)
    if (index === -1) return
    // 下面代码等价于 
    // yjsDocStore.textCaptions[index].resizePosition.x = newResizeX
    // const x = yjsDocStore.textCaptions[index].resizePosition.x
    const x = (yjsDocStore.textCaptions[index].resizePosition.x = newResizeX)
    const y = (yjsDocStore.textCaptions[index].resizePosition.y = newResizeY)
    yjsDocStore.doc.transact(() => {
      const trackTextCaption = yjsDocStore.yArrayTextCaption.get(index)
      if (!trackTextCaption) return
      trackTextCaption.resizePosition.x = x
      trackTextCaption.resizePosition.y = y
      yjsDocStore.yArrayTextCaption.delete(index)
      yjsDocStore.yArrayTextCaption.insert(index, [trackTextCaption])
    })
  }

  const changeTextCaptionXYPosition = (id: number, startX: number, startY: number) => {
    const index = yjsDocStore.textCaptions.findIndex(note => note.id === id)
    if (index === -1) return
    // 下面代码等价于 
    // yjsDocStore.textCaptions[index].dragPosition.x = startX
    // const x = yjsDocStore.textCaptions[index].dragPosition.x
    const x = (yjsDocStore.textCaptions[index].dragPosition.x = startX)
    const y = (yjsDocStore.textCaptions[index].dragPosition.y = startY)
    yjsDocStore.doc.transact(() => {
      const trackTextCaption = yjsDocStore.yArrayTextCaption.get(index)
      if (!trackTextCaption) return
      trackTextCaption.dragPosition.x = x
      trackTextCaption.dragPosition.y = y
      yjsDocStore.yArrayTextCaption.delete(index)
      yjsDocStore.yArrayTextCaption.insert(index, [trackTextCaption])
    })
  }
  const defaultResizeX = 150
  const defaultResizeY = 100
  const createTextCaption = () => {
    const id = new Date().getTime(); // id 取时间戳，保证唯一性
    const color = getRandomColorClass()
    const textCaption = {
      id,
      body: "",
      color,
      dragPosition: { x: 0, y: 0 },
      resizePosition: { x: defaultResizeX, y: defaultResizeY }
    } 
    yjsDocStore.textCaptions.push(textCaption)
    yjsDocStore.yArrayTextCaption.insert(0, [textCaption])
    textCaptionStore.textCaption.id = id
    setTimeout(() => dragTextCaption(id), 200)
  }

  const deleteTextCaption = (textCaption: ITextCaption) => {
    const index = yjsDocStore.textCaptions.findIndex(note => note.id === textCaption.id)
    if (index === -1) return
    yjsDocStore.textCaptions.splice(index)
    yjsDocStore.yArrayTextCaption.delete(index)
    textCaptionHasEventSet.delete(textCaption.id)
  }

  const dragTextCaption = (id: number) => {
    textCaptionStore.textCaption.id = id
    const textCaption = document.querySelector('.'+createTextCaptionClassName(id)) as HTMLElement;
    const textCaptionHandler = document.querySelector('.'+createTextCaptionHandlerClassName(id)) as HTMLElement;
    const textCaptionResizer = document.querySelector('.'+createTextCaptionResizerClassName(id)) as HTMLElement;

    // click
    textCaption.addEventListener('click', () => {
      textCaptionStore.textCaption.id = id
    })

    // for dragging
    let newX = 0, newY = 0, startX = 0, startY = 0
    // for resizing
    let startRX = 0, startRY = 0
    let textCaptionStartWidth = 0, textCaptionStartHeight = 0
    // resizing
    textCaptionResizer.addEventListener('mousedown', (e: any) => {
      textCaptionStore.textCaption.id = id
      startRX = e.clientX
      startRY = e.clientY

      textCaptionStartWidth = textCaption.offsetWidth
      textCaptionStartHeight = textCaption.offsetHeight

      // 将该节点的定位方式设置为绝对定位
      // 为什么要设置为绝对定位呢？
      // 因为我们在拖拽的时候，需要让元素脱离文档流，才能让元素跟随鼠标移动
      // 而绝对定位的元素是相对于最近的已定位的祖先元素进行定位的
      // 如果没有已定位的祖先元素，那么它的位置相对于最初的包含块
      // 这样就可以让元素跟随鼠标移动了
      // 参考：https://developer.mozilla.org/zh-CN/docs/Web/CSS/position
      //  绝对定位的特点
      //  脱离文档流：绝对定位的元素不会占用空间，其他元素会像它不存在一样排列。
      //  位置控制：可以使用 top、right、bottom 和 left 属性来精确控制元素的位置。
      //  重叠：绝对定位的元素可以与其他元素重叠。
      textCaption.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        const newWidth = textCaptionStartWidth + e.clientX - startRX
        const newHeight = textCaptionStartHeight + e.clientY - startRY 
        changeTextCaptionResizeXYPosition(id, newWidth, newHeight)

        textCaption.style.width = Math.max(newWidth, defaultResizeX)+'px'
        textCaption.style.height = Math.max(newHeight, defaultResizeY)+'px'
      }

      const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
      }

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
    })

    // draging
    textCaptionHandler.addEventListener('mousedown', (e: any) => {
      textCaptionStore.textCaption.id = id

      startX = e.clientX
      startY = e.clientY

      // 将该节点的定位方式设置为绝对定位
      // 为什么要设置为绝对定位呢？
      // 因为我们在拖拽的时候，需要让元素脱离文档流，才能让元素跟随鼠标移动
      // 而绝对定位的元素是相对于最近的已定位的祖先元素进行定位的
      // 如果没有已定位的祖先元素，那么它的位置相对于最初的包含块
      // 这样就可以让元素跟随鼠标移动了
      // 参考：https://developer.mozilla.org/zh-CN/docs/Web/CSS/position
      //  绝对定位的特点
      //  脱离文档流：绝对定位的元素不会占用空间，其他元素会像它不存在一样排列。
      //  位置控制：可以使用 top、right、bottom 和 left 属性来精确控制元素的位置。
      //  重叠：绝对定位的元素可以与其他元素重叠。
      textCaption.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        newX = startX - e.clientX
        newY = startY - e.clientY
        startX = e.clientX
        startY = e.clientY
        
        changeTextCaptionXYPosition(id, startX, startY)

        textCaption.style.top = (textCaption.offsetTop-newY)+'px'
        textCaption.style.left = (textCaption.offsetLeft-newX)+'px'
      }

      const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
      }

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)

    })
  }

  return { createTextCaption, textCaptionHasEventSet, dragTextCaption, changeTextCaptionBodyContent, deleteTextCaption }
}

function getRandomColorClass() {
  const colors = ['bg-blue-300', 'bg-indigo-300', 'bg-yellow-300', 'bg-pink-300']
  return colors[Math.floor(Math.random() * colors.length)]
}