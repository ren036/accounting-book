import { CategoryEmoji, getCategoryVisual } from './CategoryEmoji'
import { Center, Paper, SimpleGrid, Text, UnstyledButton } from '@mantine/core'

type CategoryPickerProps = { categories: string[]; value: string; onChange: (value: string) => void }

export function CategoryPicker({ categories, value, onChange }: CategoryPickerProps) {
  return (
    <Paper component="section" p="md">
      <Text mb="sm" size="sm" fw={600}>选择分类</Text>
      <SimpleGrid cols={5} spacing={6} verticalSpacing="sm" role="radiogroup" aria-label="账单分类">
        {categories.map((category) => {
          const active = category === value
          const visual = getCategoryVisual(category)
          return (
            <UnstyledButton
              type="button"
              role="radio"
              aria-checked={active}
              key={category}
              px={2}
              py={6}
              onClick={() => onChange(category)}
            >
              <Center
                mx="auto"
                w={40}
                h={40}
                style={{
                  borderRadius: 14,
                  background: active ? visual.color : visual.background,
                  transition: 'background-color 120ms ease, transform 120ms ease',
                  transform: active ? 'scale(1.06)' : undefined,
                }}
              >
                <CategoryEmoji category={category} color={active ? 'white' : undefined} />
              </Center>
              <Text mt={4} size="xs" ta="center" truncate fw={active ? 700 : 400} c={active ? 'teal.8' : 'dimmed'}>{category}</Text>
            </UnstyledButton>
          )
        })}
      </SimpleGrid>
    </Paper>
  )
}
