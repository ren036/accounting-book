import { describe, expect, it } from 'vitest'
import { parseBackup, serializeBackup } from '../lib/backup'
import type { Transaction } from '../domain/transaction'

describe('backup', () => {
  it('serializes and parses minimal transactions', () => {
    const transactions: Transaction[] = [
      {
        id: 't1',
        type: 'expense',
        amount: 12,
        category: '餐饮',
        note: '午饭',
        occurredAt: '2026-06-01T00:00:00.000Z'
      }
    ]

    expect(parseBackup(serializeBackup(transactions))).toEqual(transactions)
  })

  it('rejects invalid backup content', () => {
    expect(() => parseBackup('{"version":2,"transactions":[]}')).toThrow('备份文件格式不正确')
  })

  it('strips removed fields from imported old transactions', () => {
    const transactions = parseBackup(JSON.stringify({
      version: 1,
      exportedAt: '2026-06-25T00:00:00.000Z',
      transactions: [
        {
          id: 'historical-2024',
          type: 'expense',
          amount: 88,
          category: '餐饮',
          note: '历史账单',
          occurredAt: '2024-03-02T00:00:00.000Z',
          createdAt: '2024-03-02T00:00:00.000Z',
          updatedAt: '2024-03-02T00:00:00.000Z',
          deletedAt: null,
          syncStatus: 'synced'
        }
      ]
    }))

    expect(transactions).toEqual([
      {
        id: 'historical-2024',
        type: 'expense',
        amount: 88,
        category: '餐饮',
        note: '历史账单',
        occurredAt: '2024-03-02T00:00:00.000Z'
      }
    ])
  })

  it('skips imported old soft-deleted transactions', () => {
    const transactions = parseBackup(JSON.stringify({
      version: 1,
      exportedAt: '2026-06-25T00:00:00.000Z',
      transactions: [
        {
          id: 'deleted-old-record',
          type: 'expense',
          amount: 50,
          category: '餐饮',
          note: '已删除',
          occurredAt: '2024-03-02T00:00:00.000Z',
          createdAt: '2024-03-02T00:00:00.000Z',
          updatedAt: '2024-03-02T00:00:00.000Z',
          deletedAt: '2024-03-03T00:00:00.000Z',
          syncStatus: 'synced'
        }
      ]
    }))

    expect(transactions).toEqual([])
  })
})
