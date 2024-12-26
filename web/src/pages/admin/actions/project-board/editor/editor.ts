import { createApplyAlignClassName, createApplyBoldClassName, createApplyH1ClassName, createApplyH2ClassName, createApplyH3ClassName, createApplyImageClassName, createApplyItalicClassName, createApplyLinkClassName, createApplyListClassName, createApplyUnderlineClassName } from "../miniTextEditorType"

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
    insertImage
  }
}

/**
 * 应用加粗
 * @param id id
 */
const applyBold = (id: number) => {
  const className = createApplyBoldClassName(id)
  applyTag('b', className)
}

/**
 * 应用斜体
 * @param id id
 */
const applyItalic = (id: number) => {
  const className = createApplyItalicClassName(id)
  applyTag('i', className)
}

/**
 * 应用下滑线
 * @param id id
 */
const applyUnderline = (id: number) => {
  const className = createApplyUnderlineClassName(id)
  applyTag('u', className)
}

/**
 * 应用h1标题
 * @param id id
 */
const applyH1 = (id: number) => {
  const className = createApplyH1ClassName(id)
  applyTag('h1', className)
}

/**
 * 应用h2标题
 * @param id id
 */
const applyH2 = (id: number) => {
  const className = createApplyH2ClassName(id)
  applyTag('h2', className)
}

/**
 * 应用h3标题
 * @param id id
 */
const applyH3 = (id: number) => {
  const className = createApplyH3ClassName(id)
  applyTag('h3', className)
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
    
    selection.removeAllRanges()
  })
}


/**
 * 应用标签
 * @param tagName 标签名
 * @param className 类名
 */
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