export function todayInputValue(date = new Date()): string {
  return formatLocalDate(date)
}

export function clampInputDateToMax(value: string, max: string): string {
  return value > max ? max : value
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
