# 记账本 PWA

一个面向个人使用的纯本地离线记账本。它是一个可以部署成网页、也可以在 iPhone Safari 中添加到主屏幕当作 App 使用的 PWA。

这个项目不需要后端服务，不上传账单数据。部署平台只负责提供网页入口，账单数据保存在当前设备浏览器的本地数据库中。

## 功能

- 记一笔收入或支出。
- 编辑和删除单条账单。
- 首页查看当月收支和当月账单详情。
- 统计页按年份、月份查看收支汇总。
- 查看某个月的账单明细。
- 设置页导出 JSON 备份。
- 设置页导入 JSON 备份。
- 设置页导入 `.xls` / `.xlsx` Excel 账单文件。
- 设置页清空全部本地账单数据，带确认弹窗。
- 支持 iPhone Safari 添加到主屏幕。
- 支持 PWA 离线缓存基础资源。

## 技术栈

- React 19：页面和交互。
- TypeScript：类型约束。
- Vite：本地开发和生产构建。
- Dexie：IndexedDB 封装。
- IndexedDB：浏览器本地账单数据库。
- antd-mobile：确认弹窗等移动端 UI。
- lucide-react：图标。
- vite-plugin-pwa：生成 PWA manifest 和 service worker。
- xlsx：解析 `.xls` / `.xlsx` Excel 文件。
- Vitest：单元测试。

## 主要依赖

- `react` / `react-dom`：构建单页应用和页面交互。
- `antd-mobile`：移动端 UI 组件，目前主要用于确认弹窗。
- `dexie`：封装 IndexedDB 读写，管理本地账单数据。
- `xlsx`：生成 Excel 备份文件，解析 `.xls` / `.xlsx` 导入文件。
- `lucide-react`：页面图标。
- `vite-plugin-pwa`：生成 PWA 配置、manifest 和 service worker，让应用可以添加到手机主屏幕并缓存基础资源。

## 开发依赖

- `typescript`：提供静态类型检查。
- `vite`：开发服务器和生产构建工具。
- `@vitejs/plugin-react`：Vite 的 React 插件。
- `vitest`：单元测试框架。
- `@types/react` / `@types/react-dom`：React TypeScript 类型定义。

## 数据保存在哪里

账单数据保存在当前设备浏览器的 IndexedDB 中，数据库名是：

```txt
accounting-book
```

可以理解为：

```txt
你的 iPhone 本机
  -> Safari 网站数据
    -> 当前访问的域名
      -> IndexedDB
        -> accounting-book
          -> transactions
```

重要说明：

- 数据不保存在 Vercel。
- 数据不保存在 Cloudflare。
- 数据不保存在 GitHub。
- 数据不保存在电脑上，除非你在电脑浏览器里使用这个应用。
- 换域名后，本地数据不会自动迁移。
- 换手机后，本地数据不会自动迁移。
- 清除 Safari 网站数据可能会删除账单。
- 建议定期导出 JSON 备份并保存到 iCloud Drive 或“文件”App。

## 数据模型

当前每条账单只保留必要字段：

```ts
type Transaction = {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  note: string
  occurredAt: string
}
```

删除账单是直接从 IndexedDB 删除，不再保留软删除字段。

## 项目结构

```txt
src/
  App.tsx                       应用主状态和页面切换
  main.tsx                      React 入口
  styles.css                    全局样式
  components/                   复用组件
  pages/                        页面组件
  domain/                       业务逻辑和类型
  lib/                          数据库、备份、Excel 导入等基础能力
  tests/                        Vitest 测试
public/
  icon.svg                      PWA 图标
vite.config.ts                  Vite 和 PWA 配置
```

## 本地开发

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

如果要让同一个 Wi-Fi 下的 iPhone 访问电脑开发服务，使用：

```bash
npm run dev -- --host 0.0.0.0
```

然后在 iPhone Safari 打开终端里显示的局域网地址，例如：

```txt
http://192.168.x.x:5173
```

本地开发地址只适合测试。电脑关机、开发服务器停止、Wi-Fi 改变后，手机就无法访问。

## 测试

运行全部测试：

```bash
npm test
```

测试覆盖了账单更新、汇总统计、导航、图标、JSON 备份、Excel 导入等逻辑。

## 生产构建

构建生产产物：

```bash
npm run build
```

构建产物输出到：

```txt
dist/
```

本地预览构建结果：

```bash
npm run preview
```

## 部署到 Cloudflare Pages

推荐部署到 Cloudflare Pages。它适合纯前端 Vite 项目，并且 `*.pages.dev` 在手机网络下通常比 `*.vercel.app` 更稳定。

### 1. 上传到 GitHub

第一次上传：

```bash
git init
git add .
git commit -m "init accounting book"
git branch -M main
git remote add origin 你的GitHub仓库地址
git push -u origin main
```

之后更新代码：

```bash
git add .
git commit -m "update"
git push
```

### 2. 创建 Cloudflare Pages 项目

打开：

```txt
https://dash.cloudflare.com/
```

操作步骤：

1. 进入 `Workers & Pages`。
2. 点击 `Create`。
3. 选择 `Pages`。
4. 选择 `Connect to Git`。
5. 绑定 GitHub。
6. 选择这个项目仓库。

不要选择 Workers，也不需要 `@cloudflare/vite-plugin` 或 `wrangler`。

### 3. 构建配置

Cloudflare Pages 构建配置填写：

```txt
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Root directory: /
```

如果可以设置 Node.js 版本，建议填：

```txt
20
```

保存后点击部署。

### 4. 正式地址和预览地址

Cloudflare Pages 部署完成后可能给两个类型的地址。

正式地址通常是：

```txt
https://accounting-book.pages.dev/
```

预览地址类似：

```txt
https://75b83e3c.accounting-book.pages.dev/
```

长期使用和添加到主屏幕时，建议使用正式地址，不要用带随机前缀的预览地址。

## 部署到 Vercel

Vercel 也可以部署这个项目，但某些手机网络可能无法稳定访问 `*.vercel.app` 子域名。如果手机不开 VPN 打不开 Vercel 地址，建议改用 Cloudflare Pages 或绑定自定义域名。

Vercel 网页部署：

1. 打开 `https://vercel.com/new`。
2. 导入 GitHub 仓库。
3. Framework Preset 选择 `Vite`。
4. Build Command 使用 `npm run build`。
5. Output Directory 使用 `dist`。
6. 点击 Deploy。

Vercel 命令行部署：

```bash
npm install -g vercel
vercel login
vercel
vercel --prod
```

## iPhone 添加到主屏幕

使用正式部署地址，例如：

```txt
https://accounting-book.pages.dev/
```

添加步骤：

1. 用 iPhone Safari 打开正式地址。
2. 等页面正常显示。
3. 点击 Safari 底部分享按钮。
4. 选择“添加到主屏幕”。
5. 名称可以改成“记账本”。
6. 点击“添加”。

添加完成后，可以直接点击桌面图标使用，不需要先打开 Safari。

## 更新代码后手机怎么更新

如果使用 GitHub + Cloudflare Pages，更新流程是：

```bash
git add .
git commit -m "update"
git push
```

Cloudflare Pages 会自动重新构建并部署。

手机上的 PWA 可能不会立刻更新。可以尝试：

1. 关闭主屏幕上的记账本。
2. 用 Safari 打开正式地址刷新一次。
3. 再打开主屏幕 App。

PWA 使用 service worker 缓存资源，所以更新有时需要重新打开或等待缓存更新。

## 导入和导出

### JSON 备份

设置页点击“导出 JSON”会下载 JSON 文件。

建议把 JSON 保存到：

- iCloud Drive
- iPhone “文件”App
- 你信任的其他备份位置

恢复数据时，在设置页选择 JSON 文件导入。

### Excel 导出和导入

设置页点击“导出 Excel”会下载 `.xlsx` 文件。

导出的 Excel 直接展示每笔账单数据，工作表名是 `Transactions`，字段包括：

```txt
id | type | amount | category | note | occurredAt
```

每一笔账单占一行。再次导入这个 Excel 时会保留原 `id`，如果本地已有相同 `id` 的账单，会覆盖更新。

设置页支持导入：

```txt
.xls
.xlsx
```

除应用自己导出的 Excel 外，也兼容旧的特殊 Excel 格式。旧格式行映射规则：

```txt
第 1 列：日期
第 2 列：收入 / 支出
第 3 列：收入金额
第 4 列：支出金额
第 5 列：备注
第 6 列：忽略
第 7 列：一级分类，导入为 category
第 8 列：忽略
```

导入完成后会显示成功条数和跳过条数。

重复导入同一个 Excel 文件会产生重复账单，目前没有自动去重。

## 清空全部数据

设置页有“清空全部数据”按钮。

点击后会弹出确认框：

```txt
确定清空全部账单吗？此操作不可恢复。
```

确认后会清空当前域名下 IndexedDB 中的全部账单。

清空前建议先导出备份。

## 换域名、换平台、换手机

浏览器本地数据按域名隔离。

例如这两个地址的数据互不相通：

```txt
https://accounting-book-seven.vercel.app/
https://accounting-book.pages.dev/
```

如果从 Vercel 换到 Cloudflare Pages，需要：

1. 在旧地址导出 JSON 备份。
2. 打开新地址。
3. 在新地址导入 JSON 备份。

换手机也是同样流程。

## 常见问题

### Cloudflare Pages 部署后白屏

先查看线上 HTML 源码。

如果看到：

```html
<script type="module" src="/src/main.tsx"></script>
```

说明 Cloudflare 部署的是源码根目录，不是 `dist` 构建产物。

检查 Cloudflare Pages 配置：

```txt
Build command: npm run build
Build output directory: dist
Root directory: /
```

保存后重新部署。

### Cloudflare Pages 报 @cloudflare/vite-plugin 错误

这个项目不需要 `@cloudflare/vite-plugin`。

如果报错类似：

```txt
Failed to resolve "@cloudflare/vite-plugin"
```

通常是创建成了 Workers 项目或 Cloudflare Vite 模板。

应该重新创建普通 Pages 项目：

```txt
Workers & Pages -> Create -> Pages -> Connect to Git
```

不要选择 Workers。

### iPhone 打不开 Vercel 地址

如果电脑能打开 `*.vercel.app`，但 iPhone 5G 不开 VPN 打不开，通常是手机网络对 Vercel 子域名解析或访问不稳定。

可选解决方案：

1. 改用 Cloudflare Pages。
2. 给 Vercel 绑定自定义域名。
3. 手机开 VPN 或 Cloudflare WARP。

### 数据会不会过期

IndexedDB 不会按固定时间自动过期，但不是永久保险箱。

这些情况可能导致数据丢失：

1. 清除 Safari 网站数据。
2. 删除 PWA 后清理浏览器数据。
3. iPhone 存储空间紧张时系统清理网站数据。
4. 换手机。
5. 换域名。
6. 手动点击“清空全部数据”。

建议定期导出 JSON 备份。

## 当前部署建议

长期使用建议：

```txt
Cloudflare Pages + 正式 pages.dev 地址 + iPhone Safari 添加到主屏幕
```

正式地址示例：

```txt
https://accounting-book.pages.dev/
```

不要用预览部署地址长期使用。
