export function formatMoney(amount: number): string {
  return amount.toFixed(2)
}

export function formatPrivateMoney(amount: number, hidden: boolean): string {
  return hidden ? '******' : formatMoney(amount)
}

export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100
}

export function parseAmountExpression(expression: string): number {
  const normalized = expression.replace(/\s/g, '')
  if (!normalized) {
    return Number.NaN
  }

  const tokens = normalized.match(/[+-]?(\d+(\.\d*)?|\.\d+)/g)
  if (!tokens || tokens.join('') !== normalized) {
    return Number.NaN
  }

  return tokens.reduce((sum, token) => sum + Number(token), 0)
}
