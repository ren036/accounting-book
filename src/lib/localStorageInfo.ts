export type LocalStorageInfo = {
  usage: number
  quota: number
  percentage: number
}

export async function getLocalStorageInfo(): Promise<LocalStorageInfo | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null

  const estimate = await navigator.storage.estimate()
  const usage = normalizeBytes(estimate.usage)
  const quota = normalizeBytes(estimate.quota)

  return {
    usage,
    quota,
    percentage: quota > 0 ? Math.min((usage / quota) * 100, 100) : 0,
  }
}

export function formatStorageSize(bytes: number): string {
  const normalizedBytes = normalizeBytes(bytes)
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let value = normalizedBytes
  let unitIndex = 0

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }

  const maximumFractionDigits = unitIndex === 0 || value >= 100 ? 0 : 1
  return `${new Intl.NumberFormat('zh-CN', { maximumFractionDigits }).format(value)} ${units[unitIndex]}`
}

function normalizeBytes(value: number | undefined): number {
  return Number.isFinite(value) && value && value > 0 ? value : 0
}
