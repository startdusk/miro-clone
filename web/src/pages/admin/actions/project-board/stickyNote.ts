import { ref } from "vue";
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'


import { createStickyNoteBodyClassName, createStickyNoteClassName, createStickyNoteHandlerClassName, createStickyNoteResizerClassName, type IStickyNote } from "./stickyNoteType";
import { stickyNoteStore } from "../../../../store/stickyNote";

export function useDragStickyNote() {
  // 记录所有的便利贴(sticky note)
  const stickyNotes = ref<IStickyNote[]>([]);
  // 记录所有的便利贴(sticky note)的 Yjs 数据, 用于多端同步
  const yArrayStickyNote = ref<Y.Array<IStickyNote> | null>(null)


  const stickyNoteHasEventSet = new Set()

  const doc = new Y.Doc()
  const initYjs = () => {
    yArrayStickyNote.value = doc.getArray('y-array-sticky-note')
    yArrayStickyNote.value.observe((_event: any) => {
      const notes = yArrayStickyNote.value?.toArray() || []
      stickyNotes.value = notes
      notes.forEach(({ id }) => {
        if (stickyNoteHasEventSet.has(id)) return
        stickyNoteHasEventSet.add(id)
        // add an event on each sticky note
        setTimeout(() => {
          dragStickyNote(id)
          changeStickyNoteBodyContent(id)
          // 为什么这里也要设置为绝对定位呢？
          // 因为其他端接收到数据后并没有显式的设置为绝对定位, 
          // 会导致如果当前屏幕的移动或放大之类的操作无法同步到其他端(因为其他端的元素并没有设置为绝对定位, 会导致元素无法移动或放大)
          const stickyNote = document.querySelector('.' +createStickyNoteClassName(id)) as HTMLElement;
          stickyNote.style.position = 'absolute'
        }, 200)
      })
    })
    // Sync clients with the y-websocket provider
    new WebsocketProvider(
      'ws://localhost:1234', 'sticky-note', doc
    )

    // this allows you to instantly get the (cached) documents data
    const indexeddbProvider = new IndexeddbPersistence('sticky-note', doc)
    indexeddbProvider.whenSynced.then(() => {
      console.log('loaded data from indexed db')
    })
  }

  const changeStickyNoteBodyContent = (id: number) => {
    const stickyNoteContent = document.querySelector('.'+createStickyNoteBodyClassName(id)) as HTMLElement
    const index = stickyNotes.value.findIndex(note => note.id === id)
    if (index === -1) return
    stickyNoteContent.addEventListener('keydown', () => {
      doc.transact(() => {
        const trackStickyNote = yArrayStickyNote.value?.get(index)
        if (!trackStickyNote) return
        trackStickyNote.body = stickyNoteContent.textContent || ''
        yArrayStickyNote.value?.delete(index)
        yArrayStickyNote.value?.insert(index, [trackStickyNote])
      })
    })
  }
  
  const changeStickyNoteResizeXYPosition = (id: number, newResizeX: number, newResizeY: number) => {
    const index = stickyNotes.value.findIndex(note => note.id === id)
    if (index === -1) return
    // 下面代码等价于 
    // stickyNotes.value[index].resizePosition.x = newResizeX
    // const x = stickyNotes.value[index].resizePosition.x
    const x = (stickyNotes.value[index].resizePosition.x = newResizeX)
    const y = (stickyNotes.value[index].resizePosition.y = newResizeY)
    doc.transact(() => {
      const trackStickyNote = yArrayStickyNote.value?.get(index)
      if (!trackStickyNote) return
      trackStickyNote.resizePosition.x = x
      trackStickyNote.resizePosition.y = y
      yArrayStickyNote.value?.delete(index)
      yArrayStickyNote.value?.insert(index, [trackStickyNote])
    })
  }

  const changeStickyNoteXYPosition = (id: number, startX: number, startY: number) => {
    const index = stickyNotes.value.findIndex(note => note.id === id)
    if (index === -1) return
    // 下面代码等价于 
    // stickyNotes.value[index].dragPosition.x = startX
    // const x = stickyNotes.value[index].dragPosition.x
    const x = (stickyNotes.value[index].dragPosition.x = startX)
    const y = (stickyNotes.value[index].dragPosition.y = startY)
    doc.transact(() => {
      const trackStickyNote = yArrayStickyNote.value?.get(index)
      if (!trackStickyNote) return
      trackStickyNote.dragPosition.x = x
      trackStickyNote.dragPosition.y = y
      yArrayStickyNote.value?.delete(index)
      yArrayStickyNote.value?.insert(index, [trackStickyNote])
    })
  }
  const defaultResizeX = 150
  const defaultResizeY = 100
  const createStickyNote = () => {
    const id = new Date().getTime(); // id 取时间戳，保证唯一性
    const color = getRandomColorClass()
    const stickyNote = {
      id,
      body: "",
      color,
      dragPosition: { x: 0, y: 0 },
      resizePosition: { x: defaultResizeX, y: defaultResizeY }
    } 
    stickyNotes.value.push(stickyNote)
    yArrayStickyNote.value?.insert(0, [stickyNote])
    stickyNoteStore.stickyNote.id = id
    setTimeout(() => dragStickyNote(id), 200)
  }

  const deleteStickyNote = (stickyNote: IStickyNote) => {
    const index = stickyNotes.value.findIndex(note => note.id === stickyNote.id)
    if (index === -1) return
    stickyNotes.value.splice(index)
    yArrayStickyNote.value?.delete(index)
    stickyNoteHasEventSet.delete(stickyNote.id)
  }

  const dragStickyNote = (id: number) => {
    stickyNoteStore.stickyNote.id = id
    const stickyNote = document.querySelector('.'+createStickyNoteClassName(id)) as HTMLElement;
    const stickyNoteHandler = document.querySelector('.'+createStickyNoteHandlerClassName(id)) as HTMLElement;
    const stickyNoteResizer = document.querySelector('.'+createStickyNoteResizerClassName(id)) as HTMLElement;

    // click
    stickyNote.addEventListener('click', () => {
      stickyNoteStore.stickyNote.id = id
    })

    // for dragging
    let newX = 0, newY = 0, startX = 0, startY = 0
    // for resizing
    let startRX = 0, startRY = 0
    let stickyNoteStartWidth = 0, stickyNoteStartHeight = 0
    // resizing
    stickyNoteResizer.addEventListener('mousedown', (e: any) => {
      stickyNoteStore.stickyNote.id = id
      startRX = e.clientX
      startRY = e.clientY

      stickyNoteStartWidth = stickyNote.offsetWidth
      stickyNoteStartHeight = stickyNote.offsetHeight

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
      stickyNote.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        const newWidth = stickyNoteStartWidth + e.clientX - startRX
        const newHeight = stickyNoteStartHeight + e.clientY - startRY 
        changeStickyNoteResizeXYPosition(id, newWidth, newHeight)

        stickyNote.style.width = Math.max(newWidth, defaultResizeX)+'px'
        stickyNote.style.height = Math.max(newHeight, defaultResizeY)+'px'
      }

      const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
      }

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)
    })

    // draging
    stickyNoteHandler.addEventListener('mousedown', (e: any) => {
      stickyNoteStore.stickyNote.id = id

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
      stickyNote.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        newX = startX - e.clientX
        newY = startY - e.clientY
        startX = e.clientX
        startY = e.clientY
        
        changeStickyNoteXYPosition(id, startX, startY)

        stickyNote.style.top = (stickyNote.offsetTop-newY)+'px'
        stickyNote.style.left = (stickyNote.offsetLeft-newX)+'px'
      }

      const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
      }

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)

    })
  }
  return { dragStickyNote, createStickyNote, deleteStickyNote, initYjs, stickyNotes }
}

function getRandomColorClass() {
  const colors = ['bg-blue-300', 'bg-indigo-300', 'bg-yellow-300', 'bg-pink-300']
  return colors[Math.floor(Math.random() * colors.length)]
}