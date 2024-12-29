/**
 * 防抖函数
 * @param cb 
 * @param delay 
 * @returns 
 */
export function debounce<T>(cb: (fn: (...args: any[]) => T) => T, delay: number) {
  let debounceTimer: ReturnType<typeof setTimeout>
  return function(fn: (...args: any[]) => T) {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => cb(fn), delay)
  }
}
