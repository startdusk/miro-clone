import type { ICursor } from "../types";

/**
 * 防抖函数
 * @param cb 回调函数
 * @param delay 延时，单位毫秒
 * @returns
 */
export function debounce<T>(
  cb: (fn: (...args: any[]) => T) => T,
  delay: number
) {
  let debounceTimer: ReturnType<typeof setTimeout>;
  return function (fn: (...args: any[]) => T) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => cb(fn), delay);
  };
}

/**
 * 顺序执行异步函数
 * @param functions
 */
export async function runFuncSequentially<T>(
  functions: (() => T | Promise<T>)[]
) {
  for (const fn of functions) {
    await fn();
  }
}

/**
 * 获取光标位置
 * @param element 元素
 * @returns ICursor 光标位置
 */
export const getCursorPosition = (element: HTMLElement): ICursor => {
  const selection = window.getSelection() as Selection;
  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0) as Range;
    const cloneRange = range.cloneRange();
    cloneRange.selectNodeContents(element);
    cloneRange.setEnd(range.endContainer, range.endOffset);
    const cursorPosition = cloneRange.toString().length;
    const rect = range.getBoundingClientRect(); // Get the position of the cursor
    const elementRect = element.getBoundingClientRect();
    const x = `${rect.left - elementRect.left}px`;
    const y = `${rect.bottom - elementRect.top + window.scrollY + 20}px`;
    return { cursorPosition, x, y };
  }
  return { cursorPosition: 0, x: "0px", y: "0px" };
};

export const moveCursorToPosition = (element: HTMLElement, position: number) => {
  const selection = window.getSelection() as Selection;
  const range = document.createRange();
  let currentPos = 0;
  // Iterate over child nodes to find the correct text node
  for (const node of element.childNodes) {
    const nodeLen = (node.textContent || "").length;
    // If it's a text node, set the cursor directly
    if (currentPos + nodeLen >= position) {
      if (node.nodeType === Node.TEXT_NODE) {
        range.setStart(node, position - currentPos);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // For element nodes, recursively go inside its child nodes to find the correct position
        setCursorInsideElement(node, position - currentPos, range);
      }
      break;
    }

    currentPos += nodeLen;
  }
  range.collapse(true); // 使范围在起始点处
  selection.removeAllRanges(); // 清除现有的选择
  selection.addRange(range); // 添加新的范围
  element.focus(); // 光标聚焦
};

// Helper function to set cursor inside nested elements
const setCursorInsideElement = (
  element: ChildNode,
  position: number,
  range: Range
) => {
  for (const node of element.childNodes) {
    const nodeLen = (node.textContent || "").length;
    if (position <= nodeLen) {
      if (node.nodeType === Node.TEXT_NODE) {
        range.setStart(node, position);
      } else {
        setCursorInsideElement(node, position, range);
      }
      break;
    }
    position -= nodeLen;
  }
};
