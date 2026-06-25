export type StorageMode = {
  kind: 'local-only'
  label: string
  description: string
}

export function getStorageMode(): StorageMode {
  return {
    kind: 'local-only',
    label: '纯本地模式',
    description: '数据只保存在当前设备，请定期导出备份。'
  }
}
