export function formatMoney(amount: number): string {
  return amount.toFixed(2)
}

export function evaluateAmountExpression(expression: string): number | null {
  const trimmed = expression.trim()
  if (!trimmed || !/^\d+(?:\.\d+)?(?:\+\d+(?:\.\d+)?)*$/.test(trimmed)) return null

  const total = trimmed.split('+').reduce((sum, part) => sum + Number(part), 0)
  return Math.round(total * 100) / 100
}
