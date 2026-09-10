import { createRoot } from 'react-dom/client'
import { MantineProvider, localStorageColorSchemeManager } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { App } from './App'
import { bookTheme } from './theme'
import './styles.css'

const colorSchemeManager = localStorageColorSchemeManager({
  key: 'accounting-book-color-scheme',
})

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={bookTheme} defaultColorScheme="light" colorSchemeManager={colorSchemeManager}>
    <ModalsProvider>
      <Notifications position="top-center" />
      <App />
    </ModalsProvider>
  </MantineProvider>,
)
