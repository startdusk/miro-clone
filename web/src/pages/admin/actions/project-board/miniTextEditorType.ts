export interface IMiniTextEditor {
  id: number,
  body: string,
  color: string,
  dragPosition: {
    x: number,
    y: number
  }
  resizePosition: {
    x: number,
    y: number,
  }
}

const classNamePrefix = 'text-editor'

export function createMiniTextEditorClassName(id: number) {
  return `${classNamePrefix}-${id}`
}

export function createMiniTextEditorHandlerClassName(id: number) {
  return `${classNamePrefix}-handler-${id}`
}

export function createMiniTextEditorResizerClassName(id: number) {
  return `${classNamePrefix}-resizer-${id}`
}

export function createApplyBoldClassName(id: number) {
  return `apply-bold-${id}`
}

export function createApplyItalicClassName(id: number) {
  return `apply-italic-${id}`
}

export function createApplyUnderlineClassName(id: number) {
  return `apply-underline-${id}`
}

export function createApplyH1ClassName(id: number) {
  return `apply-h1-${id}`
}

export function createApplyH2ClassName(id: number) {
  return `apply-h2-${id}`
}

export function createApplyH3ClassName(id: number) {
  return `apply-h3-${id}`
}

export function createApplyAliginClassName(id: number, aliginment: 'left' | 'center' | 'right') {
  return `apply-aligin-${aliginment}-${id}`
}

export function createApplyListClassName(id: number) {
  return `apply-list-${id}`
}

export function createApplyLinkClassName(id: number) {
  return `apply-link-${id}`
}

export function createApplyImageClassName(id: number) {
  return `apply-image-${id}`
}
