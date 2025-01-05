export interface ITextCaption {
  id: number;
  body: string;
  color: string;
  dragPosition: {
    x: number;
    y: number;
  };
  resizePosition: {
    x: number;
    y: number;
  };
}

const classNamePrefix = 'text-caption';

export function createTextCaptionClassName(id: number) {
  return `${classNamePrefix}-${id}`;
}

export function createTextCaptionHandlerClassName(id: number) {
  return `${classNamePrefix}-handler-${id}`;
}

export function createTextCaptionResizerClassName(id: number) {
  return `${classNamePrefix}-resizer-${id}`;
}

export function createTextCaptionBodyClassName(id: number) {  
  return `${classNamePrefix}-body-${id}`;
}
