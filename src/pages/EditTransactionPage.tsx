import { Box, Button, Group, Title } from '@mantine/core'
import { TransactionForm } from '../components/TransactionForm'
import type { EditableTransactionFields, Transaction } from '../domain/transaction'
import { updateTransaction } from '../domain/transaction'
import { saveTransaction } from '../lib/db'
import { showMessage } from '../ui/feedback'

type EditTransactionPageProps = {
  transaction: Transaction
  viewportHeight: number
  onCancel: () => void
  onSaved: () => Promise<void>
}

export function EditTransactionPage({ transaction, viewportHeight, onCancel, onSaved }: EditTransactionPageProps) {
  async function handleSubmit(fields: EditableTransactionFields) {
    await saveTransaction(updateTransaction(transaction, fields))
    await onSaved()
    showMessage('修改成功')
  }

  return (
    <Box component="section" h="100%" mih={0} style={{ display: 'grid', gridTemplateRows: 'auto minmax(0, 1fr)', overflow: 'hidden' }}>
      <Group justify="space-between" px="md" py="xs" wrap="nowrap">
        <Button color="teal" variant="transparent" aria-label="取消" onClick={onCancel}>
          取消
        </Button>
        <Title order={2} size="h4">编辑账单</Title>

        <Button

          color="teal"
          variant="transparent"
          type="submit"
          form="edit-transaction-form"
          aria-label="保存"
        >
          保存
        </Button>
      </Group>
      <TransactionForm
        id="edit-transaction-form"
        viewportHeight={viewportHeight}
        initialTransaction={transaction}
        onSubmit={handleSubmit}
      />
    </Box>
  )
}
