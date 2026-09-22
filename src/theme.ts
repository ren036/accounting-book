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
  virtualColor,
} from '@mantine/core'

export const bookTheme = createTheme({
  // 品牌主色：开屏 logo 的墨黑 #111827（见 public/icon.svg）
  primaryColor: 'ink',
  // 亮色模式取 inkLight 第 7 档（#111827）；深色模式取 inkDark 第 5 档（浅灰）
  primaryShade: { light: 7, dark: 5 },
  // ink 是虚拟色，深色模式需要自动反转文字颜色才能保证可读性
  autoContrast: true,
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
    // 亮色模式的品牌墨黑阶：0 最浅 → 9 最深
    inkLight: [
      '#f4f6f9',
      '#e7eaf0',
      '#ced5df',
      '#b0b9c8',
      '#8f9aae',
      '#6d7994',
      '#48536b',
      '#111827',
      '#0b1120',
      '#060a13',
    ],
    // 深色模式的品牌阶：纯黑在深色背景上不可辨，因此第 5 档（主色）取浅灰
    inkDark: [
      '#f8fafc',
      '#f1f5f9',
      '#e9eef5',
      '#e2e8f0',
      '#d8e0ea',
      '#cbd5e1',
      '#b0bccd',
      '#94a3b8',
      '#64748b',
      '#111827',
    ],
    // 主色随配色方案在 inkLight / inkDark 之间切换
    ink: virtualColor({ name: 'ink', light: 'inkLight', dark: 'inkDark' }),
    // 语义色：收入、存入、预算正常态仍用绿色，与支出的红色形成收支对比
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
    // 不设置 color：使用 Mantine 默认的白色（亮色）/ dark-5（深色）指示块。
    // 若设为 ink，深色模式下指示块为浅色而标签文字仍为白色，会导致不可读。
    SegmentedControl: SegmentedControl.extend({
      defaultProps: { radius: 'sm' },
    }),
    Select: Select.extend({
      defaultProps: { radius: 'sm', size: 'md' },
    }),
    TextInput: TextInput.extend({
      defaultProps: { radius: 'sm', size: 'md' },
    }),
    Textarea: Textarea.extend({
      defaultProps: { radius: 'sm', size: 'md' },
    }),
    NumberInput: NumberInput.extend({
      defaultProps: { radius: 'sm', size: 'md' },
    }),
    FileInput: FileInput.extend({
      defaultProps: { radius: 'sm', size: 'md' },
    }),
    Drawer: Drawer.extend({
      defaultProps: { position: 'bottom', radius: 'lg' },
    }),
    Progress: Progress.extend({
      defaultProps: { color: 'ink', radius: 'xs' },
    }),
    Switch: Switch.extend({
      defaultProps: {
        color: 'ink',
        styles: { body: { justifyContent: 'space-between' }, labelWrapper: { flex: 1 } },
      },
    }),
    Alert: Alert.extend({
      defaultProps: { radius: 'lg', variant: 'light' },
    }),
  },
})
