import { describe, expect, it, vi } from 'vitest'
import { parseExcelRows } from '../lib/excelImport'

describe('parseExcelRows', () => {
  it('maps income and expense rows to transactions', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000001')
      .mockReturnValueOnce('00000000-0000-4000-8000-000000000002')

    const result = parseExcelRows([
      ['2024-04-30', '收入', 540, undefined, '助学金', 'hygge', '奖金', undefined],
      ['2024-05-06', '支出', undefined, 12, '午饭', 'hygge', '餐饮', undefined]
    ])

    expect(result).toEqual({
      skipped: 0,
      transactions: [
        {
          id: '00000000-0000-4000-8000-000000000001',
          type: 'income',
          amount: 540,
          category: '奖金',
          note: '助学金',
          occurredAt: '2024-04-30T00:00:00.000Z'
        },
        {
          id: '00000000-0000-4000-8000-000000000002',
          type: 'expense',
          amount: 12,
          category: '餐饮',
          note: '午饭',
          occurredAt: '2024-05-06T00:00:00.000Z'
        }
      ]
    })
  })

  it('skips invalid rows and trims text fields', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce('00000000-0000-4000-8000-000000000003')

    const result = parseExcelRows([
      [],
      ['not-a-date', '支出', undefined, 12, '无效日期', 'hygge', '餐饮', undefined],
      ['2024-05-06', '其他', undefined, 12, '无效类型', 'hygge', '餐饮', undefined],
      ['2024-05-06', '支出', undefined, 0, '无效金额', 'hygge', '餐饮', undefined],
      ['2024-05-06', '支出', undefined, '18.5', '  晚饭  ', 'hygge', ' 餐饮 ', undefined]
    ])

    expect(result).toEqual({
      skipped: 4,
      transactions: [
        {
          id: '00000000-0000-4000-8000-000000000003',
          type: 'expense',
          amount: 18.5,
          category: '餐饮',
          note: '晚饭',
          occurredAt: '2024-05-06T00:00:00.000Z'
        }
      ]
    })
  })
})
