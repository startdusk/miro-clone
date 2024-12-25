import { createApplyAliginClassName, createApplyBoldClassName, createApplyH1ClassName, createApplyH2ClassName, createApplyH3ClassName, createApplyItalicClassName, createApplyUnderlineClassName } from "../miniTextEditorType"

export function useEditor() {
  return { 
    applyBold,
    applyItalic,
    applyUnderline,
    applyH1,
    applyH2,
    applyH3,
    applyAliginCenter,
    applyAliginLeft,
    applyAliginRight  
  }
}

// 加粗
const applyBold = (id: number) => {
  const className = createApplyBoldClassName(id)
  applyTag('b', className)
}

// 斜体
const applyItalic = (id: number) => {
  const className = createApplyItalicClassName(id)
  applyTag('i', className)
}

// 下划线
const applyUnderline = (id: number) => {
  const className = createApplyUnderlineClassName(id)
  applyTag('u', className)
}

// h1
const applyH1 = (id: number) => {
  const className = createApplyH1ClassName(id)
  applyTag('h1', className)
}

// h2
const applyH2 = (id: number) => {
  const className = createApplyH2ClassName(id)
  applyTag('h2', className)
}

// h3
const applyH3 = (id: number) => {
  const className = createApplyH3ClassName(id)
  applyTag('h3', className)
}

// 左对齐
function applyAliginLeft(id: number) {
  applyAliginment(id, 'left')
}

// 右对齐
function applyAliginRight(id: number) {
  applyAliginment(id, 'right')
}

// 居中
function applyAliginCenter(id: number) {
  applyAliginment(id, 'center')
}

function applyAliginment(id: number, aliginment: 'left' | 'center' | 'right') {
  const apply = document.querySelector('.' + createApplyAliginClassName(id, aliginment)) as HTMLElement
  apply.addEventListener('click', () => {
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const selectedText = range.cloneContents()
    const aliginText = document.createElement('div') as HTMLElement
    switch (aliginment) {
      case 'left':
        aliginText.style.textAlign = 'left'
        break
      case 'right':
        aliginText.style.textAlign = 'right'
        break
      case 'center':
        aliginText.style.textAlign = 'center'
        break
    }
    aliginText.appendChild(selectedText)
    range.deleteContents()
    range.insertNode(aliginText)
    
    selection.removeAllRanges()
  })
}


function applyTag(tagName: string, className: string) {
  const apply = document.querySelector('.' + className) as HTMLElement
  apply.addEventListener('click', () => {
    // 拿到当前选中的文本
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const selectedText = range.cloneContents()
    // 选中的文本的父元素，用于判断是否已经加粗
    const parentElement = range.commonAncestorContainer.parentElement
    const isItalic = parentElement?.closest(tagName)
    // 如果已经斜体，就取消斜体
    if (isItalic) {
      removeTag(range, tagName)
    } else {
      addTag(range, tagName, selectedText)
    }
    // 重要: 要清空选中
    selection.removeAllRanges()
  })

}

function addTag(range: Range, tagName: string, selectedText: DocumentFragment) {
  const tag = document.createElement(tagName) as HTMLElement
  switch (tagName) {
    case 'h1':
      tag.style.fontSize = '24px'
      break
    case 'h2':
      tag.style.fontSize = '20px'
      break
    case 'h3':
      tag.style.fontSize = '16px'
      break
  }
  tag.appendChild(selectedText)
  range.deleteContents()
  range.insertNode(tag)
}

// TODO: 存在bug，如：要完整选中<b></b>标签，才会去掉加粗，否则会有其他未定义行为
function removeTag(range: Range, tagName: string) {
  const parentElement = range.commonAncestorContainer.parentElement?.closest(tagName)
  const docFragment = document.createDocumentFragment()
  if (parentElement?.firstChild) {
    docFragment.appendChild(parentElement.firstChild)
  }
  parentElement?.replaceWith(docFragment)
}