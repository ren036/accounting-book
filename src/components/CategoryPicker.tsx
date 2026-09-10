import { CategoryEmoji, getCategoryVisual } from './CategoryEmoji'
import { Box, Paper, SimpleGrid, Text, UnstyledButton } from '@mantine/core'

type CategoryPickerProps = { categories: string[]; value: string; onChange: (value: string) => void }

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <Paper component="section" p="md" radius="xl" shadow="xs">
      <Text mb="sm" size="sm" fw={600}>选择分类</Text>
      <SimpleGrid cols={5} spacing={6} verticalSpacing="sm" role="radiogroup" aria-label="账单分类">
        {categories.map((category) => {
          const active = category === value
          const visual = getCategoryVisual(category)
          return (
            <UnstyledButton type="button" role="radio" aria-checked={active} key={category} onClick={() => onChange(category)}>
              <Box mx="auto" w={40} h={40} display="grid" style={{ placeItems: 'center', borderRadius: 14, background: visual.background, outline: active ? '2px solid var(--book-green)' : undefined, outlineOffset: active ? 2 : undefined }}>
                <CategoryEmoji category={category} />
              </Box>
              <Text mt={4} size="xs" ta="center" truncate fw={active ? 600 : 400} c={active ? 'teal.7' : 'dimmed'}>{category}</Text>
            </UnstyledButton>
          )
        })}
      </SimpleGrid>
    </Paper>
  )
}
