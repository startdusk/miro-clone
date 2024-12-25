import { ref } from "vue";
import { createMiniTextEditorClassName, createMiniTextEditorHandlerClassName, createMiniTextEditorResizerClassName, type IMiniTextEditor } from "../miniTextEditorType";
import { miniTextEditorStore } from "../../../../../store/miniTextEditor";
import { useEditor } from "./editor";

export function useDragMiniTextEditor() {
  const { applyBold, applyItalic, applyUnderline, applyH1, applyH2, applyH3, applyAliginRight } = useEditor()
  const miniTextEditors = ref<IMiniTextEditor[]>([] as IMiniTextEditor[]);
  const createMiniTextEditor = () => {
    const id = new Date().getTime(); // id 取时间戳，保证唯一性
    const color = getRandomColorClass()
    miniTextEditors.value.push({
      id,
      body: "",
      color,
      dragPosition: { x: 0, y: 0 },
      resizePosition: { x: 0, y: 0 }
    })

    miniTextEditorStore.miniTextEditor.id = id
    setTimeout(() => dragMiniTextEditor(id), 200)
  }

  const deleteMiniTextEditor = (miniTextEditor: IMiniTextEditor) => {
    miniTextEditors.value = miniTextEditors.value.filter(editor => editor.id !== miniTextEditor.id)
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

        miniTextEditor.style.width = Math.max(newWidth, 100)+'px'
        miniTextEditor.style.height = Math.max(newHeight, 100)+'px'
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
    applyAliginRight(id)
  }
  return { dragMiniTextEditor, createMiniTextEditor, deleteMiniTextEditor,  miniTextEditors }
}

function getRandomColorClass() {
  const colors = ['bg-blue-300', 'bg-indigo-300', 'bg-yellow-300', 'bg-pink-300']
  return colors[Math.floor(Math.random() * colors.length)]
}