# 记账本 — 长期项目笔记

## 配色体系（2026-09-22 起）

主题色从墨绿换成了开屏 logo 的墨黑 `#111827`，并确立了「品牌色 / 语义色」分离的约定：

- **品牌色 `ink`**：`#111827`（取自 `public/icon.svg`，也是 PWA `theme_color`）。
  用于按钮、图标、导航高亮、分类选中、区块小标题、链接等**品牌与交互**元素。
  它是 `virtualColor`，亮色取 `inkLight[7]`、深色取 `inkDark[5]`（浅色），
  因为纯黑在深色背景上不可辨。配 `autoContrast: true`。
- **语义色 `teal`（绿）/ `red`（红）**：表示**数据含义**，不要当品牌色用。
  - 绿 = 收入、存入、预算未超支、目标已存够、可支配余额为正
  - 红 = 支出、取出、预算超支、余额为负
- **应用级令牌**（`src/styles.css`）：`--book-ink`（随方案切换的墨黑）、
  `--book-bg` / `--book-surface` / `--book-border` 等中性色。
  这些中性色已去绿，是中性冷灰系，改配色时不要往回加绿色倾向。

### 改动配色时的注意点

- `SegmentedControl` 的 `defaultProps` **不要**设 `color`。它内部用 `getContrastColor()`
  算标签色，解析不了 `virtualColor`，深色模式会变成浅底白字。用 Mantine 默认指示块。
- `Switch` 滑块颜色靠 `styles.css` 里深色模式的 `--switch-thumb-bg: #111827` 反转，
  别删；Mantine 默认白色滑块在浅色轨道上看不出对比。
- `--mantine-color-success` 由 Mantine 指向 `teal-8`，所以 `teal` 色阶必须保留。
- 开屏骨架（`index.html` 的 `.app-boot` 与 `App.tsx` 的 `OpeningPage` 共用该类名）
  深色模式下 logo 是浅底深字，改配色时三处（`index.html`、`SettingsPage` 切方案处、
  `vite.config.ts`）的 theme-color / 底色要保持一致。

## 技术栈与约定

- React 19 + TypeScript + Mantine 9.6 + Dexie(IndexedDB) + Vite，PWA 离线应用，纯本地不上传。
- 构建：`npm run build`（`tsc && vite build`）；测试：`npm run test`（vitest，`src/tests` 目前为空）。
- 代码风格：组件普遍写成单行紧凑 JSX，注释用中文。
- 用户重视隐私与性能，也介意代码冗余——改完顺手清掉变成死代码的旧令牌/旧引用。
