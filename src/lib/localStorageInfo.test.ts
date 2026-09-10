import { describe, expect, it } from 'vitest'
import { formatStorageSize } from './localStorageInfo'

describe('formatStorageSize', () => {
  it('使用适合阅读的单位显示本机存储空间', () => {
    expect(formatStorageSize(0)).toBe('0 B')
    expect(formatStorageSize(216 * 1024)).toBe('216 KB')
    expect(formatStorageSize(1.5 * 1024 * 1024)).toBe('1.5 MB')
    expect(formatStorageSize(34 * 1024 * 1024 * 1024)).toBe('34 GB')
  })

  it('忽略无效或负数输入', () => {
    expect(formatStorageSize(Number.NaN)).toBe('0 B')
    expect(formatStorageSize(-1024)).toBe('0 B')
  })
})
