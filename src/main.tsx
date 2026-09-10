import { createRoot } from 'react-dom/client'
import { createTheme, MantineProvider, SegmentedControl } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import { App } from './App'
import './styles.css'

const theme = createTheme({
  primaryColor: 'teal',
  primaryShade: 6,
  defaultRadius: 'md',
  fontFamily: 'inherit',
  radius: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '20px',
  },
  colors: {
    teal: [
      '#e5f7ef',
      '#d0f1e4',
      '#a5e3cf',
      '#78d4b8',
      '#4bc49f',
      '#26b487',
      '#16a574',
      '#10875f',
      '#0b6b4d',
      '#07533c',
    ],
  },
  components: {
    SegmentedControl: SegmentedControl.extend({
      defaultProps: {
        color: 'teal',
        radius: 'xl',
      },
    }),
  },
})

createRoot(document.getElementById('root')!).render(
  <MantineProvider theme={theme} defaultColorScheme="light">
    <ModalsProvider>
      <Notifications position="top-center" />
      <App />
    </ModalsProvider>
  </MantineProvider>,
)
