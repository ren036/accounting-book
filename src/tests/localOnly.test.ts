import { describe, expect, it } from 'vitest'
import { getStorageMode } from '../lib/storageMode'

describe('storage mode', () => {
  it('uses local-only storage without cloud sync', () => {
    expect(getStorageMode()).toEqual({
      kind: 'local-only',
      label: '纯本地模式',
      description: '数据只保存在当前设备，请定期导出备份。'
    })
  })
})
