import { describe, expect, it } from 'vitest'
import { combineDateWithTime, formatOccurredAtForExport } from './dates'

describe('combineDateWithTime', () => {
  it('新建账单时使用当前时间', () => {
    const now = new Date(2026, 8, 2, 10, 20, 30, 456)

    expect(combineDateWithTime('2026-09-01', undefined, now))
      .toBe('2026-09-01 10:20:30')
  })

  it('编辑账单时保留原来的时间', () => {
    expect(combineDateWithTime('2026-09-01', '2026-08-31 08:09:10'))
      .toBe('2026-09-01 08:09:10')
  })
})

describe('formatOccurredAtForExport', () => {
  it('导出时移除老数据的零点和时区', () => {
    expect(formatOccurredAtForExport('2026-08-25T00:00:00+00:00')).toBe('2026-08-25')
    expect(formatOccurredAtForExport('2026-08-25T00:00:00.000Z')).toBe('2026-08-25')
    expect(formatOccurredAtForExport('2026-08-25T12:34:56+08:00')).toBe('2026-08-25')
  })

  it('保留新数据的实际时间', () => {
    expect(formatOccurredAtForExport('2026-09-03 12:34:56')).toBe('2026-09-03 12:34:56')
  })
})
