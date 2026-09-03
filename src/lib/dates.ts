export function todayInputValue(date = new Date()): string {
  return formatLocalDate(date)
}

export function clampInputDateToMax(value: string, max: string): string {
  return value > max ? max : value
}

export function combineDateWithTime(date: string, existingOccurredAt?: string, now = new Date()): string {
  const existingTime = existingOccurredAt?.match(/ (\d{2}:\d{2}:\d{2})$/)?.[1]
  return `${date} ${existingTime ?? formatLocalTime(now)}`
}

export function formatOccurredAtForExport(occurredAt: string): string {
  const date = occurredAt.match(/^(\d{4}-\d{2}-\d{2})/)?.[1]
  if (!date) return occurredAt
  return /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(occurredAt) ? occurredAt : date
}

export function currentMonth(date = new Date()): string {
  return formatLocalDate(date).slice(0, 7)
}

export function currentYear(date = new Date()): string {
  return String(date.getFullYear())
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}
