# 记账本 PWA

个人使用的纯本地离线记账本。支持 iPhone Safari 添加到主屏幕、本地离线记账、JSON 备份导入导出。

数据只保存在当前设备的浏览器本地数据库中，不上传服务器。部署到 Vercel 只提供网页入口，不保存账单数据。

## 本地运行

```bash
npm install
npm run dev -- --host 0.0.0.0
```

电脑和 iPhone 连同一个 Wi-Fi 后，在 iPhone Safari 打开：

```txt
http://你的电脑局域网IP:5173
```

当前电脑上查到的地址示例：

```txt
http://192.168.17.174:5173
```

## 生产构建

```bash
npm run build
```

构建产物在 `dist/`。

## 部署到 Vercel

### 方法一：命令行部署

安装并登录 Vercel：

```bash
npm install -g vercel
vercel login
```

在项目目录执行：

```bash
vercel
```

第一次部署时按提示选择：

```txt
Set up and deploy? yes
Which scope? 选择你的账号
Link to existing project? no
Project name? accounting-book
Directory? ./
Override settings? no
```

部署完成后，Vercel 会给你一个 `https://...vercel.app` 地址。iPhone 开 5G 也可以访问这个地址。账单数据仍然只保存在 iPhone 本机。

发布正式生产地址：

```bash
vercel --prod
```

### 方法二：网页部署

1. 把项目上传到 GitHub。
2. 打开 `https://vercel.com/new`。
3. Import 这个仓库。
4. Framework Preset 选择 `Vite`。
5. Build Command 使用 `npm run build`。
6. Output Directory 使用 `dist`。
7. 点击 Deploy。

## 数据备份

这是纯本地应用，以下操作可能导致账单丢失：

1. 清除 Safari 网站数据。
2. 更换 iPhone。
3. 删除主屏幕上的 PWA 后清理浏览器数据。

建议定期在设置页点击“导出备份”，把 JSON 文件保存到 iCloud Drive、文件 App 或其他你信任的位置。换手机时，在新设备打开应用后使用“导入备份”恢复数据。

## iPhone 添加到主屏幕

1. 用 iPhone Safari 打开部署后的 `https://...vercel.app` 地址。
2. 点击分享按钮。
3. 选择“添加到主屏幕”。
4. 之后就可以像 App 一样从桌面打开。

PWA 的离线能力在 HTTPS 环境下最稳定，Vercel 默认提供 HTTPS。
