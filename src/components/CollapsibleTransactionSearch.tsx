import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { TransactionSearch } from './TransactionSearch'
import { Box, Button, Group, Stack } from '@mantine/core'

type CollapsibleTransactionSearchProps = {
  value: string
  onChange: (value: string) => void
  children: ReactNode
}

export function CollapsibleTransactionSearch({ value, onChange, children }: CollapsibleTransactionSearchProps) {
  const [expanded, setExpanded] = useState(false)
  const searchId = useId()

  return (
    <Stack gap="xs">
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Box miw={0} flex={1}>{children}</Box>
        <Button
          type="button"
          variant="subtle"
          color="gray"
          size="xs"
          radius="xl"
          leftSection={expanded ? <X size={16} aria-hidden="true" /> : <Search size={16} aria-hidden="true" />}
          aria-expanded={expanded}
          aria-controls={searchId}
          onClick={() => {
            setExpanded(!expanded)
            if (expanded) onChange('')
          }}
        >
          {expanded ? '收起搜索' : '搜索'}
        </Button>
      </Group>
      <Box id={searchId} hidden={!expanded}>
        {expanded && <TransactionSearch value={value} onChange={onChange} autoFocus />}
      </Box>
    </Stack>
  )
}
