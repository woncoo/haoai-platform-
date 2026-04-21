# Cloudflare Pages 部署指南

## 前提条件

1. 已注册 Cloudflare 账号
2. 已有域名并完成 DNS 配置
3. 已安装 Node.js 18+

## 部署步骤

### 方式一：Git 集成部署（推荐）

1. **推送代码到 GitHub/GitLab**

```bash
cd ~/Desktop/ai-aggregation-platform
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/你的用户名/haoai-platform.git
git push -u origin main
```

2. **在 Cloudflare Pages 创建项目**

- 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
- 进入 Pages → 创建项目 → 选择你的 Git 仓库
- 配置构建设置：
  - **构建命令**: `npm run build`
  - **构建输出目录**: `.next`
  - **环境变量**: 添加以下变量
    - `NODE_VERSION` = `18`
    - `API_KEY_ENCRYPTION_KEY` = 你的32位加密密钥

3. **配置自定义域名**

- 在 Pages 项目设置中添加你的域名
- Cloudflare 会自动配置 SSL 证书

### 方式二：Wrangler CLI 部署

1. **安装 Wrangler**

```bash
npm install -g wrangler
```

2. **登录 Cloudflare**

```bash
wrangler login
```

3. **部署**

```bash
npm run build
npx wrangler pages deploy .next --project-name=haoai-platform
```

4. **配置环境变量**

```bash
wrangler secret put API_KEY_ENCRYPTION_KEY
# 输入你的32位加密密钥
```

## 重要配置

### 环境变量（必须在 Cloudflare 设置）

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `API_KEY_ENCRYPTION_KEY` | API密钥加密密钥（生产必须） | 32位随机字符串 |
| `NODE_VERSION` | Node版本 | 18 |
| `SMTP_HOST` | 邮件发送服务器 | smtp-mail.outlook.com |
| `SMTP_PORT` | 邮件端口 | 587 |
| `SMTP_USER` | 邮件用户名 | woncoo@hotmail.com |
| `SMTP_PASSWORD` | 邮件密码 | your-app-password |
| `DAILY_REPORT_EMAIL` | 报告收件人 | woncoo@hotmail.com |

### 微信/支付宝支付配置

微信支付和支付宝需要商户号才能使用真实支付。当前项目使用模拟支付模式用于开发测试。

**真实支付接入需配置：**
- 微信支付：商户号 + API密钥
- 支付宝：应用 AppID + 私钥/公钥

## 注意事项

### SQLite 数据库限制

Cloudflare Pages 是无服务器平台，不支持原生文件系统写入。

**当前方案**：使用本地 SQLite 开发，生产环境需迁移到：
1. **Cloudflare D1** - SQLite 兼容的边缘数据库
2. **PlanetScale** - MySQL 边缘数据库
3. **Neon** - PostgreSQL 边缘数据库

### 每日报告邮件

由于 Cloudflare Workers/Pages 环境限制，邮件发送需要在外部服务完成。方案：

1. **使用 Cloudflare Email Workers** 转发
2. **使用第三方邮件 API**（SendGrid、Mailgun）
3. **本地 CronJob** 运行报告脚本

## 快速开始

```bash
# 1. 克隆并安装
git clone https://github.com/你的用户名/haoai-platform.git
cd haoai-platform
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填写真实值

# 3. 本地开发
npm run dev

# 4. 构建生产版本
npm run build

# 5. 部署（需先配置 wrangler）
npx wrangler pages deploy .next
```

## 验证部署

部署完成后访问你的域名，检查：

1. ✅ 首页正常显示
2. ✅ 登录页面可访问
3. ✅ 聊天页面可正常加载
4. ✅ API 调用正常计费
5. ✅ 余额显示正确