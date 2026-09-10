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
  primaryShade: 7,
  defaultRadius: 'sm',
  fontFamily: '"Noto Sans SC", "Microsoft YaHei", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily: 'inherit',
    fontWeight: '700',
  },
  radius: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '18px',
  },
  colors: {
    teal: [
      '#edf6f2',
      '#d8ebe3',
      '#b4d8c9',
      '#8fc4af',
      '#6caf95',
      '#509a7e',
      '#3f876d',
      '#34745e',
      '#2a5e4d',
      '#214a3e',
    ],
  },
  components: {
    Paper: Paper.extend({
      defaultProps: { radius: 'md', shadow: undefined },
    }),
    Button: Button.extend({
      defaultProps: { radius: 'sm' },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { radius: 'sm' },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { color: 'teal', radius: 'sm' },
    }),
    Select: Select.extend({
      defaultProps: { radius: 'sm' },
    }),
    TextInput: TextInput.extend({
      defaultProps: { radius: 'sm' },
    }),
    Textarea: Textarea.extend({
      defaultProps: { radius: 'sm' },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: { radius: 'sm' },
    }),
    FileInput: FileInput.extend({
      defaultProps: { radius: 'sm' },
    }),
    Drawer: Drawer.extend({
      defaultProps: { position: 'bottom', radius: 'lg' },
    }),
    Progress: Progress.extend({
      defaultProps: { color: 'teal', radius: 'xs' },
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
