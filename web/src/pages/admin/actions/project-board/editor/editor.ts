import { yjsDocStore } from "../../../../../store/yjsDoc"
import { createApplyAlignClassName, createApplyBoldClassName, createApplyH1ClassName, createApplyH2ClassName, createApplyH3ClassName, createApplyHighlightTextClassName, createApplyImageClassName, createApplyItalicClassName, createApplyLinkClassName, createApplyListClassName, createApplyUnderlineClassName, createMiniTextEditorBodyClassName } from "../miniTextEditorType"

export function useEditor() {
  return { 
    applyBold,
    applyItalic,
    applyUnderline,
    applyH1,
    applyH2,
    applyH3,
    applyAlignCenter,
    applyAlignLeft,
    applyAlignRight,
    applyUnorderedList,
    applyLink,
    insertImage,
    highlightText
  }
}

/** 
 * 高亮文本
 * @param id id
 */
function highlightText(id: number) {
  const hightlightBtn = document.querySelector('.'+createApplyHighlightTextClassName(id)) as HTMLElement
  hightlightBtn.addEventListener('click', () => {
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const selectedText = range.extractContents()
    
    const isApply = range.commonAncestorContainer.parentElement?.closest('hl')
    // 如果已经应用了，就取消应用
    if (isApply) {
      removeHightlight(range)
    } else {
      addHightlight(range, selectedText)
    }
    replicateTextFormatingWithId(id)
    // 重要: 要清空选中
    selection.removeAllRanges()
  })
}

/**
 * 添加高亮
 * @param range 
 * @param selectedText 
 */
function addHightlight(range: Range, selectedText: DocumentFragment) {
  const highlightText = document.createElement('hl') as HTMLElement
  highlightText.style.backgroundColor = '#fde047'
  highlightText.style.color = 'black'
  highlightText.appendChild(selectedText)
  range.deleteContents()
  range.insertNode(highlightText)
}

/**
 * 删除高亮
 * @param range 
 */
function removeHightlight(range: Range) {
    const parentElement = range.commonAncestorContainer.parentElement?.closest('hl')
    const docFragment = document.createDocumentFragment()
    if (parentElement?.firstChild) {
      console.log(parentElement.firstChild)
      docFragment.appendChild(parentElement.firstChild)
    }
    parentElement?.replaceWith(docFragment)
}

/**
 * 应用加粗
 * @param id id
 */
const applyBold = (id: number) => {
  const className = createApplyBoldClassName(id)
  applyTag(id, 'b', className)
}

/**
 * 应用斜体
 * @param id id
 */
const applyItalic = (id: number) => {
  const className = createApplyItalicClassName(id)
  applyTag(id, 'i', className)
}

/**
 * 应用下滑线
 * @param id id
 */
const applyUnderline = (id: number) => {
  const className = createApplyUnderlineClassName(id)
  applyTag(id, 'u', className)
}

/**
 * 应用h1标题
 * @param id id
 */
const applyH1 = (id: number) => {
  const className = createApplyH1ClassName(id)
  applyTag(id, 'h1', className)
}

/**
 * 应用h2标题
 * @param id id
 */
const applyH2 = (id: number) => {
  const className = createApplyH2ClassName(id)
  applyTag(id, 'h2', className)
}

/**
 * 应用h3标题
 * @param id id
 */
const applyH3 = (id: number) => {
  const className = createApplyH3ClassName(id)
  applyTag(id, 'h3', className)
}

/**
 * 应用左对齐
 * @param id id
 */
function applyAlignLeft(id: number) {
  applyAlignment(id, 'left')
}

/**
 * 应用右对齐
 * @param id id
 */
function applyAlignRight(id: number) {
  applyAlignment(id, 'right')
}

/**
 * 应用居中
 * @param id id
 */
function applyAlignCenter(id: number) {
  applyAlignment(id, 'center')
}

/**
 * 应用无序列表
 * @param id id
 */
function applyUnorderedList(id: number) {
  const apply = document.querySelector('.' + createApplyListClassName(id)) as HTMLElement
  apply.addEventListener('click', () => {
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    
    const ul = document.createElement('ul') as HTMLElement
    const li = document.createElement('li') as HTMLElement
    ul.style.listStyle = 'disc'
    ul.style.marginLeft = '20px'
    li.textContent = ''
    ul.appendChild(li)
    range.deleteContents()
    range.insertNode(ul)

    // move the cursor after the ul tag
    range.setStartAfter(ul)
    range.setEndAfter(ul)
    selection.addRange(range)
    
    replicateTextFormatingWithId(id)
    selection.removeAllRanges()
  })
}

/**
 * 应用链接
 * @param id id
 */
function applyLink(id: number) {
  const apply = document.querySelector('.' + createApplyLinkClassName(id)) as HTMLElement
  apply.addEventListener('click', () => {
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const selectedText = range.extractContents()

    const link = document.createElement('a') as HTMLAnchorElement
    const url = prompt('Enter the link:', 'http://')
    if (!url) return
    link.href = url
    link.style.color = 'blue'
    link.style.textDecoration = 'underline'
    link.appendChild(selectedText)
    range.insertNode(link)
    
    replicateTextFormatingWithId(id)
    selection.removeAllRanges()
  })
}

/**
 * 插入图片
 * @param id id
 */
function insertImage(id: number) {
  const apply = document.querySelector('.' + createApplyImageClassName(id)) as HTMLElement
  apply.addEventListener('click', () => {
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)

    const img = document.createElement('img') as HTMLImageElement
    const url = prompt('Enter the image url:', 'http://')
    if (!url) return
    img.src = url
    img.alt = 'image'
    img.style.width = '50%'
    range.insertNode(img)
    // move the cursor after the img tag
    range.setStartAfter(img)
    range.setEndAfter(img)
    selection.addRange(range)
    replicateTextFormatingWithId(id)
    selection.removeAllRanges()
  })
}


/**
 * 应用对齐方式
 * @param id id
 * @param alignment 对齐类型 left | center | right
 */
function applyAlignment(id: number, alignment: 'left' | 'center' | 'right') {
  const apply = document.querySelector('.' + createApplyAlignClassName(id, alignment)) as HTMLElement
  apply.addEventListener('click', () => {
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const selectedText = range.cloneContents()
    const aliginText = document.createElement('div') as HTMLElement
    switch (alignment) {
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
    
    replicateTextFormatingWithId(id)
    selection.removeAllRanges()
  })
}


/**
 * 应用标签
 * @param id id
 * @param tagName 标签名
 * @param className 类名
 */
function applyTag(id: number, tagName: string, className: string) {
  const apply = document.querySelector('.' + className) as HTMLElement
  apply.addEventListener('click', () => {
    // 拿到当前选中的文本
    const selection = window.getSelection() as Selection
    if (!selection || !selection.rangeCount) return
    const range = selection.getRangeAt(0)
    const selectedText = range.cloneContents()
    // 选中的文本的父元素，用于判断是否已经添加了标签(加粗/斜体之类的等等)
    const parentElement = range.commonAncestorContainer.parentElement
    const isApply = parentElement?.closest(tagName)
    // 如果已经应用了，就取消应用
    if (isApply) {
      removeTag(range, tagName)
    } else {
      addTag(range, tagName, selectedText)
    }
    replicateTextFormatingWithId(id)
    // 重要: 要清空选中
    selection.removeAllRanges()
  })

}

/**
 * 添加标签
 * @param range Range
 * @param tagName 标签名
 * @param selectedText 选中的文本
 */
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

// TODO: 移除标签存在bug，如：要完整选中<b></b>标签，才会去掉加粗，否则会有其他未定义行为
/**
 * 移除标签
 * @param range Range
 * @param tagName 标签名
 */
function removeTag(range: Range, tagName: string) {
  const parentElement = range.commonAncestorContainer.parentElement?.closest(tagName)
  const docFragment = document.createDocumentFragment()
  if (parentElement?.firstChild) {
    docFragment.appendChild(parentElement.firstChild)
  }
  parentElement?.replaceWith(docFragment)
}

const replicateTextFormatingWithId = (id: number) => {
  const bodyContent = document.querySelector('.' + createMiniTextEditorBodyClassName(id)) as HTMLElement
  const index = yjsDocStore.miniTextEditors.findIndex(editor => editor.id === id)
  if (!index) return
  const newContent = yjsDocStore.miniTextEditors[index].body = bodyContent.innerHTML
  yjsDocStore.doc.transact(() => {
    const trackMiniTextEditor = yjsDocStore.yArrayMiniTextEditor.get(index)
    if (!trackMiniTextEditor) return
    trackMiniTextEditor.body = newContent
    yjsDocStore.yArrayMiniTextEditor.delete(index)
    yjsDocStore.yArrayMiniTextEditor.insert(index, [trackMiniTextEditor])
  })
}