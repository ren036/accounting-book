import { Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { notifications } from '@mantine/notifications'

export function showMessage(message: string) {
  notifications.show({ message, color: 'teal', withCloseButton: false })
}

export function confirmAction({
  message,
  confirmLabel = '确定',
  cancelLabel = '取消',
  destructive = false,
}: {
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}) {
  return new Promise<boolean>((resolve) => {
    let settled = false
    const settle = (value: boolean) => {
      if (settled) return
      settled = true
      resolve(value)
    }

    modals.openConfirmModal({
      title: '请确认',
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: confirmLabel, cancel: cancelLabel },
      confirmProps: { color: destructive ? 'red' : 'teal' },
      centered: true,
      radius: 'lg',
      onConfirm: () => settle(true),
      onCancel: () => settle(false),
      onClose: () => settle(false),
    })
  })
}
