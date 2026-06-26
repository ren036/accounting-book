export function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10)
}

export function clampInputDateToMax(value: string, max: string): string {
  return value > max ? max : value
}

export function currentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

export function currentYear(): string {
  return new Date().toISOString().slice(0, 4)
}
