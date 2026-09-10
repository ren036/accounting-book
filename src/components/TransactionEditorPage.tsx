import { Button, Flex, Group, Title } from '@mantine/core'
import type { EditableTransactionFields, Transaction } from '../domain/transaction'
import { TransactionForm } from './TransactionForm'

type TransactionEditorPageProps = {
  title: string
  formId: string
  viewportHeight: number
  initialTransaction?: Transaction
  onCancel: () => void
  onSubmit: (fields: EditableTransactionFields) => Promise<void>
}

export function TransactionEditorPage({
  title,
  formId,
  viewportHeight,
  initialTransaction,
  onCancel,
  onSubmit,
}: TransactionEditorPageProps) {
  return (
    <Flex component="section" direction="column" h="100%" mih={0} style={{ overflow: 'hidden' }}>
      <Group justify="space-between" px="md" py="xs" wrap="nowrap">
        <Button variant="transparent" aria-label="取消" onClick={onCancel}>取消</Button>
        <Title order={2} size="h4">{title}</Title>
        <Button variant="transparent" type="submit" form={formId} aria-label="保存">保存</Button>
      </Group>
      <TransactionForm
        id={formId}
        viewportHeight={viewportHeight}
        initialTransaction={initialTransaction}
        onSubmit={onSubmit}
      />
    </Flex>
  )
}
