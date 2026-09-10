import { Box, Button, Group, Title } from '@mantine/core'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields } from '../domain/transaction'
import { saveTransaction } from '../lib/db'
import { showMessage } from '../ui/feedback'

type EntryPageProps = {
  viewportHeight: number
  onCancel: () => void
  onSaved: () => Promise<void>
}

export function EntryPage({ viewportHeight, onCancel, onSaved }: EntryPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction({ id: crypto.randomUUID(), ...fields })
    await onSaved()
    showMessage('保存成功')
  }

  return (
    <Box component="section" h="100%" mih={0} style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', overflow: 'hidden' }}>
      <Group justify="space-between" px="md" py="xs" wrap="nowrap">
        <Button color="teal" variant="transparent" aria-label="取消" onClick={onCancel}>
          取消
        </Button>
        <Title order={2} size="h4">记一笔</Title>
        <Button
          color="teal"
          variant="transparent"
          type="submit"
          form="entry-transaction-form"
          aria-label="保存"
        >
          保存
        </Button>
      </Group>
      <TransactionForm id="entry-transaction-form" viewportHeight={viewportHeight} onSubmit={handleSubmit} />
    </Box>
  )
}
