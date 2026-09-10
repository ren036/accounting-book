import { ScrollArea, Stack, type StackProps } from '@mantine/core'

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
    <Stack h="100%" mih={0} gap={gap} p="sm" pt={paddingTop} pb={0}>
      <Stack flex="0 0 auto" gap={headerGap}>{header}</Stack>
      <ScrollArea flex={1} mih={0} mx={-4} type="auto" offsetScrollbars="y" scrollbarSize={5}>
        <Stack gap={contentGap} px={4} pb="md">{children}</Stack>
      </ScrollArea>
    </Stack>
  )
}
