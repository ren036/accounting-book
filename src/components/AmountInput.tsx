import { Check, ChevronDown, Delete } from 'lucide-react'
import { parseAmountExpression } from '../lib/money'
import { ActionIcon, Box, Button, Divider, Group, Paper, SimpleGrid, Text } from '@mantine/core'

type AmountInputProps = { value: string; onActivateKeyboard: () => void }
type AmountKeyboardProps = { value: string; onChange: (value: string) => void; onSubmit?: () => void; onDismiss?: () => void }

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace']

export function AmountInput({ value, onActivateKeyboard }: AmountInputProps) {
  const calculated = parseAmountExpression(value)
  const hasExpression = /[+-]/.test(value)

  return (
    <Paper component="section" p="md"
      aria-label="金额输入区，点击显示数字键盘"
      onClick={onActivateKeyboard}
    >
      <Text size="sm" c="dimmed">金额</Text>
      <Group mt="sm" align="flex-end" gap="xs" pb="md" wrap="nowrap">
        <Text pb={4} fz={24} fw={600}>¥</Text>
        <Text component="output" miw={0} flex={1} truncate ta="right" fz={40} fw={600} lh={1} aria-label={`金额 ${value || '0'}`}>
          {value || '0'}
        </Text>
      </Group>
      <Divider />
      {hasExpression && <Text mt="xs" ta="right" size="sm" fw={600} c="teal.7">{Number.isFinite(calculated) ? `= ${formatAmount(calculated)}` : '算式未完成'}</Text>}
    </Paper>
  )
}

export function AmountKeyboard({ value, onChange, onSubmit, onDismiss }: AmountKeyboardProps) {
  function press(key: string) {
    if (key === 'backspace') return onChange(value.slice(0, -1))
    if (key === 'equals') {
      const calculated = parseAmountExpression(value)
      if (Number.isFinite(calculated)) onChange(formatAmount(calculated))
      return
    }
    onChange(nextAmountExpression(value, key))
  }

  return (
    <Box bg="var(--book-surface)" p="sm" pt={4} aria-label="金额键盘">
      {onDismiss && (
        <ActionIcon type="button" aria-label="收起数字键盘" onClick={onDismiss} variant="transparent" color="gray" w="100%" h={20}>
          <ChevronDown aria-hidden size={17} strokeWidth={2.2} />
        </ActionIcon>
      )}
      <Group gap={6} align="stretch" wrap="nowrap">
        <SimpleGrid cols={3} spacing={6} flex={3}>
          {keys.map((key) => (
            <Button key={key} type="button" aria-label={key === 'backspace' ? '删除一位' : `输入 ${key}`} onClick={() => press(key)} variant="light" color="gray" radius="lg" mih={44} fz="lg">
              {key === 'backspace' ? <Delete aria-hidden size={22} /> : key}
            </Button>
          ))}
        </SimpleGrid>
        {onSubmit && (
          <SimpleGrid cols={1} spacing={6} flex={1} style={{ gridTemplateRows: 'repeat(4, minmax(0, 1fr))' }}>
            <Button h="100%" mih={44} type="button" aria-label="输入加号" onClick={() => press('+')} variant="light" color="teal" radius="lg" fz="xl">+</Button>
            <Button h="100%" mih={44} type="button" aria-label="输入减号" onClick={() => press('-')} variant="light" color="teal" radius="lg" fz="xl">−</Button>
            <Button h="100%" mih={44} type="button" aria-label="计算金额" onClick={() => press('equals')} variant="light" color="gray" radius="lg" fz="xl">=</Button>
            <Button h="100%" mih={44} px="xs" type="button" onClick={onSubmit} color="teal" radius="lg" leftSection={<Check aria-hidden size={18} />}>
              完成
            </Button>
          </SimpleGrid>
        )}
      </Group>
    </Box>
  )
}

function nextAmountExpression(current: string, key: string): string {
  if (key === '+' || key === '-') return !current || /[+-]$/.test(current) ? current : `${current}${key}`
  if (key === '.') {
    const term = current.split(/[+-]/).at(-1) ?? ''
    if (term.includes('.')) return current
  }
  const decimal = current.split(/[+-]/).at(-1)?.split('.')[1]
  if (decimal?.length === 2) return current
  if (current === '0' && key !== '.') return key
  return `${current}${key}`
}

function formatAmount(amount: number): string { return String(Math.round(amount * 100) / 100) }
