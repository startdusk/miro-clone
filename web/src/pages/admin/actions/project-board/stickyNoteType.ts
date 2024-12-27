export interface IStickyNote {
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

const classNamePrefix = 'sticky-note'

export function createStickyNoteClassName(id: number) {
  return `${classNamePrefix}-${id}`
}

export function createStickyNoteHandlerClassName(id: number) {
  return `${classNamePrefix}-handler-${id}`
}

export function createStickyNoteResizerClassName(id: number) {
  return `${classNamePrefix}-resizer-${id}`
}

export function createStickyNoteBodyClassName(id: number) {
  return `${classNamePrefix}-body-${id}`
}