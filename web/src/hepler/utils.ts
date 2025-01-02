/**
 * 防抖函数
 * @param cb 回调函数
 * @param delay 延时，单位毫秒
 * @returns 
 */
export function debounce<T>(cb: (fn: (...args: any[]) => T) => T, delay: number) {
  let debounceTimer: ReturnType<typeof setTimeout>
  return function(fn: (...args: any[]) => T) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => cb(fn), delay)
  }
}

/**
 * 顺序执行异步函数
 * @param functions 
 */
export async function runFuncSequentially<T>(functions: (() => T | Promise<T>)[]) {
  for (const fn of functions) {
    await fn()
  }
}