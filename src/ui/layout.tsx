import { Stack, type StackProps } from '@mantine/core'

type PageLayoutProps = {
  header: React.ReactNode
  children: React.ReactNode
  gap?: StackProps['gap']
  headerGap?: StackProps['gap']
  contentGap?: StackProps['gap']
  paddingTop?: StackProps['pt']
}

export function PageLayout({
  header,
  children,
  gap = 'md',
  headerGap = 'md',
  contentGap = 'md',
  paddingTop = 'md',
}: PageLayoutProps) {
  return (
    <Stack gap={gap} p="sm" pt={paddingTop} pb="md">
      <Stack gap={headerGap}>{header}</Stack>
      <Stack gap={contentGap}>{children}</Stack>
    </Stack>
  )
}
