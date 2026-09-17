import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'
import { ActionIcon, Box, Button, Group, Stack, TextInput } from '@mantine/core'

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
        {expanded && (
          <TextInput
            autoFocus
            aria-label="搜索账单"
            leftSection={<Search aria-hidden="true" size={19} strokeWidth={2.2} />}
            rightSection={value ? (
              <ActionIcon color="teal" variant="light" size="sm" aria-label="清空搜索" onClick={() => onChange('')}>
                <X aria-hidden="true" size={15} />
              </ActionIcon>
            ) : undefined}
            onChange={(event) => onChange(event.target.value)}
            placeholder="搜索分类、备注、金额或收支类型"
            type="search"
            value={value}
            size="md"
          />
        )}
      </Box>
    </Stack>
  )
}
