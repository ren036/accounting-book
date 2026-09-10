import { useEffect, useState } from 'react'
import { Button, Flex, Paper, Text } from '@mantine/core'
import { useRegisterSW } from 'virtual:pwa-register/react'

const UPDATE_INTERVAL = 60 * 60 * 1000

export function PwaUpdatePrompt() {
  const [registration, setRegistration] = useState<ServiceWorkerRegistration>()
  const [dismissed, setDismissed] = useState(false)
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: (_swUrl, currentRegistration) => {
      setRegistration(currentRegistration)
    },
  })

  useEffect(() => {
    if (!registration) return

    const checkForUpdate = () => {
      void registration.update().catch(() => undefined)
    }
    const checkWhenVisible = () => {
      if (document.visibilityState === 'visible') checkForUpdate()
    }

    checkForUpdate()
    const intervalId = window.setInterval(checkForUpdate, UPDATE_INTERVAL)
    window.addEventListener('online', checkForUpdate)
    document.addEventListener('visibilitychange', checkWhenVisible)

    return () => {
      window.clearInterval(intervalId)
      window.removeEventListener('online', checkForUpdate)
      document.removeEventListener('visibilitychange', checkWhenVisible)
    }
  }, [registration])

  if (!needRefresh || dismissed) return null

  return (
    <Paper
      role="alert"
      aria-live="polite"
      shadow="lg"
      radius="lg"
      p="sm"
      withBorder
      pos="fixed"
      style={{
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        left: '50%',
        zIndex: 1000,
        width: 'calc(100% - 24px)',
        maxWidth: 480,
        transform: 'translateX(-50%)',
      }}
    >
      <Flex align="center" justify="space-between" gap="sm" wrap="wrap">
        <Text size="sm" fw={600}>发现新版本，刷新后即可使用。</Text>
        <Flex gap="xs" ml="auto">
          <Button variant="subtle" color="gray" size="compact-sm" onClick={() => setDismissed(true)}>
            稍后
          </Button>
          <Button size="compact-sm" onClick={() => void updateServiceWorker(true)}>
            立即刷新
          </Button>
        </Flex>
      </Flex>
    </Paper>
  )
}
