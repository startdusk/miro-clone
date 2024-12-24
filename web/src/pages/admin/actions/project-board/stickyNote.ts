import { ref } from "vue";
import type { IStickyNote } from "./stickyNoteType";

export function useDragStickyNote() {
  const stickyNotes = ref<IStickyNote[]>([] as IStickyNote[]);
  let count = 0
  const createStickyNote = () => {
    count++
    const id = count;
    const color = getRandomColorClass()
    stickyNotes.value.push({
      id,
      body: "",
      color,
      dragPosition: { x: 0, y: 0 },
      resizePosition: { x: 0, y: 0 }
    })
    setTimeout(() => dragStickyNote(id), 200)
  }

  const deleteStickyNote = (stickyNote: IStickyNote) => {
    stickyNotes.value = stickyNotes.value.filter(note => note.id !== stickyNote.id)
  }

  const dragStickyNote = (id: number) => {
    const stickyNote = document.querySelector(`.sticky-note-${id}`) as HTMLElement;
    const stickyNoteHandler = document.querySelector(`.sticky-note-handler-${id}`) as HTMLElement;
    const stickyNoteResizer = document.querySelector(`.sticky-note-resizer-${id}`) as HTMLElement;
    
    // for dragging
    let newX = 0, newY = 0, startX = 0, startY = 0
    // for resizing
    let startRX = 0, startRY = 0
    let stickyNoteStartWidth = 0, stickyNoteStartHeight = 0

    // resizing
    stickyNoteResizer.addEventListener('mousedown', (e: any) => {
      startRX = e.clientX
      startRY = e.clientY

      stickyNoteStartWidth = stickyNote.offsetWidth
      stickyNoteStartHeight = stickyNote.offsetHeight

      stickyNote.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        const newWidth = stickyNoteStartWidth + e.clientX - startRX
        const newHeight = stickyNoteStartHeight + e.clientY - startRY 

        stickyNote.style.width = Math.max(newWidth, 100)+'px'
        stickyNote.style.height = Math.max(newHeight, 100)+'px'
      }

      const mouseUp = () => {
        document.removeEventListener('mousemove', mouseMove)
      }

      document.addEventListener('mousemove', mouseMove)
      document.addEventListener('mouseup', mouseUp)

    })

    // draging
    stickyNoteHandler.addEventListener('mousedown', (e: any) => {
      startX = e.clientX
      startY = e.clientY

      stickyNote.style.position = 'absolute' // 让元素脱离文档流(使其可以被鼠标挪动)
      
      const mouseMove = (e: any) => {
        newX = startX - e.clientX
        newY = startY - e.clientY
        startX = e.clientX
        startY = e.clientY

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
  return { dragStickyNote, createStickyNote, deleteStickyNote, stickyNotes }
}

function getRandomColorClass() {
  const colors = ['bg-blue-300', 'bg-indigo-300', 'bg-yellow-300', 'bg-pink-300']
  return colors[Math.floor(Math.random() * colors.length)]
}