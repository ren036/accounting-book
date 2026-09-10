import {
  ActionIcon,
  Alert,
  Button,
  Drawer,
  FileInput,
  NumberInput,
  Paper,
  Progress,
  SegmentedControl,
  Select,
  Switch,
  Textarea,
  TextInput,
  createTheme,
} from '@mantine/core'

export const bookTheme = createTheme({
  primaryColor: 'teal',
  primaryShade: 6,
  defaultRadius: 'lg',
  fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: 'inherit',
    fontWeight: '700',
  },
  radius: {
    xs: '6px',
    sm: '10px',
    md: '14px',
    lg: '18px',
    xl: '22px',
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
    Paper: Paper.extend({
      defaultProps: { radius: 'xl', shadow: 'xs' },
    }),
    Button: Button.extend({
      defaultProps: { radius: 'xl' },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { radius: 'xl' },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { color: 'teal', radius: 'xl' },
    }),
    Select: Select.extend({
      defaultProps: { radius: 'xl' },
    }),
    TextInput: TextInput.extend({
      defaultProps: { radius: 'lg' },
    }),
    Textarea: Textarea.extend({
      defaultProps: { radius: 'lg' },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: { radius: 'lg' },
    }),
    FileInput: FileInput.extend({
      defaultProps: { radius: 'lg' },
    }),
    Drawer: Drawer.extend({
      defaultProps: { position: 'bottom', radius: 'xl' },
    }),
    Progress: Progress.extend({
      defaultProps: { color: 'teal', radius: 'xl' },
    }),
    Switch: Switch.extend({
      defaultProps: {
        color: 'teal',
        styles: { body: { justifyContent: 'space-between' }, labelWrapper: { flex: 1 } },
      },
    }),
    Alert: Alert.extend({
      defaultProps: { radius: 'lg', variant: 'light' },
    }),
  },
})
