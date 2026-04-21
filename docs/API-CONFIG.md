# 好AI - API配置指南

## 目录
1. [模型API配置](#模型api配置)
2. [端口设置](#端口设置)
3. [支付接口配置](#支付接口配置)
4. [用户体系](#用户体系)
5. [系统架构](#系统架构)

---

## 模型API配置

### OpenAI
```bash
# API Base URL
OPENAI_API_BASE=https://api.openai.com/v1

# API Key (从 OpenAI Platform 获取)
OPENAI_API_KEY=sk-xxxxx

# 常用模型端点
- GPT-5: gpt-5
- GPT-4 Turbo: gpt-4-turbo
- GPT-4o: gpt-4o
- GPT-4o Mini: gpt-4o-mini
- o3 Mini: o3-mini

# 本地代理 (可选，用于绕过防火墙)
OPENAI_PROXY=http://your-proxy:7890
```

### Anthropic
```bash
# API Base URL
ANTHROPIC_API_BASE=https://api.anthropic.com

# API Key (从 Anthropic Console 获取)
ANTHROPIC_API_KEY=sk-ant-xxxxx

# 常用模型
- Claude 4.6 Opus: claude-opus-4-6
- Claude 4.6 Sonnet: claude-sonnet-4-6
- Claude 4 Opus: claude-opus-4
- Claude 4 Sonnet: claude-sonnet-4
- Claude 3.5 Sonnet: claude-sonnet-3-5
```

### Google Gemini
```bash
# API Base URL
GOOGLE_API_BASE=https://generativelanguage.googleapis.com/v1beta

# API Key (从 Google AI Studio 获取)
GOOGLE_API_KEY=AIza-xxxxx

# 常用模型
- Gemini 3 Ultra: gemini-3-ultra
- Gemini 3 Pro: gemini-3-pro
- Gemini 3 Flash: gemini-3-flash
- Gemini 2.5 Pro: gemini-2-5-pro
- Gemini 2.0 Flash: gemini-2-0-flash
```

### DeepSeek
```bash
# API Base URL
DEEPSEEK_API_BASE=https://api.deepseek.com

# API Key (从 DeepSeek Platform 获取)
DEEPSEEK_API_KEY=ds-xxxxx

# 常用模型
- DeepSeek V3: deepseek-chat
- DeepSeek R1: deepseek-reasoner
```

### xAI Grok
```bash
# API Base URL
XAI_API_BASE=https://api.x.ai/v1

# API Key (从 xAI Console 获取)
XAI_API_KEY=xai-xxxxx

# 常用模型
- Grok 3: grok-3-beta
- Grok 2: grok-2-beta
```

### AWS (批量采购)
```bash
# AWS Bedrock 配置
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx

# 通过 AWS 采购的模型
# Claude (via Anthropic on Bedrock)
# Titan (via Amazon)
# Mistral (via Mistral AI on Bedrock)
```

---

## 端口设置

### 服务器端口
```yaml
# Next.js 前端
PORT: 3000

# Node.js 后端 API
API_PORT: 3001

# WebSocket (实时对话)
WS_PORT: 3002

# Redis (缓存)
REDIS_PORT: 6379

# MongoDB/PostgreSQL (数据库)
DB_PORT: 27017  # MongoDB
DB_PORT: 5432   # PostgreSQL
```

### 代理配置
```bash
# Nginx 反向代理
upstream frontend {
    server 127.0.0.1:3000;
}

upstream api {
    server 127.0.0.1:3001;
}

server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://frontend;
    }

    location /api {
        proxy_pass http://api;
    }

    location /ws {
        proxy_pass http://ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 支付接口配置

### 微信支付
```bash
# 微信支付配置 (需商户资质)
WECHAT_APP_ID=wxxxxx
WECHAT_MCH_ID=xxxxx
WECHAT_API_KEY=xxxxx
WECHAT_SECRET=xxxxx

# 扫码支付接口
WECHAT_NATIVE_URL=https://api.mch.weixin.qq.com/pay/unifiedorder

# JSAPI支付 (公众号内)
WECHAT_JSAPI_URL=https://api.mch.weixin.qq.com/pay/unifiedorder
```

### 支付宝
```bash
# 支付宝配置 (需商户资质)
ALIPAY_APP_ID=xxxxx
ALIPAY_PRIVATE_KEY=xxxxx
ALIPAY_PUBLIC_KEY=xxxxx
ALIPAY_SIGN_TYPE=RSA2

# 扫码支付
ALIPAY_GATEWAY=https://openapi.alipay.com/gateway.do
```

### 支付流程
```
用户选择金额 → 生成订单 → 展示二维码 → 用户扫码支付 →
微信/支付宝回调 → 更新余额 → 发送通知
```

---

## 用户体系

### 用户ID生成规则
```
微信用户: 微信号唯一ID
支付宝用户: 支付宝用户唯一ID
```

### 找回用户ID
```bash
# 方案1: 邮箱绑定
USER_EMAIL_BINDING=true

# 方案2: 手机号绑定
USER_PHONE_BINDING=true

# 方案3: 微信UnionID
WECHAT_UNIONID=true
```

### 用户数据存储
```javascript
// 用户表结构
{
  id: String,           // 唯一ID
  phone: String,         // 手机号 (可选)
  wechatOpenid: String,  // 微信OpenID
  alipayId: String,     // 支付宝ID
  balance: Number,       // 余额
  totalSpent: Number,    // 累计消费
  createdAt: Date,      // 创建时间
  status: String,        // active/banned
  messageCount: Number,  // 消息数
  modelUsage: Object     // 各模型使用量
}
```

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户端                                │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐      │
│  │  Web    │  │  微信   │  │  支付宝  │  │  Admin   │      │
│  │  浏览器  │  │  小程序  │  │   小程序  │  │  管理后台  │      │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘      │
└───────┼────────────┼────────────┼────────────┼────────────┘
        │            │            │            │
        └────────────┴────────────┴────────────┘
                             │
                    ┌────────▼────────┐
                    │   Nginx/LB      │
                    │  (反向代理+SSL)  │
                    └────────┬────────┘
                             │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼───────┐    ┌───────▼───────┐    ┌───────▼───────┐
│   Next.js     │    │   API Server  │    │   WebSocket   │
│   Frontend    │    │   (Node.js)   │    │   Server      │
│   :3000       │    │   :3001       │    │   :3002       │
└───────────────┘    └───────┬───────┘    └───────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼───────┐    ┌───────▼───────┐    ┌───────▼───────┐
│   Redis       │    │   Database    │    │   AI Models   │
│   Cache       │    │   (MongoDB)   │    │   API Proxy   │
│   :6379       │    │   :27017      │    │               │
└───────────────┘    └───────────────┘    └───────┬───────┘
                                                 │
                         ┌───────────────────────┼───────────────────────┐
                         │                       │                       │
                  ┌──────▼──────┐          ┌──────▼──────┐          ┌──────▼──────┐
                  │  OpenAI     │          │  Anthropic  │          │  Google     │
                  │  API        │          │  API        │          │  API        │
                  └─────────────┘          └─────────────┘          └─────────────┘
```

---

## 环境变量示例

创建 `.env` 文件：

```bash
# ==================== 网站配置 ====================
SITE_NAME=好AI
SITE_URL=https://haoai.com
ADMIN_URL=https://admin.haoai.com

# ==================== 数据库 ====================
MONGODB_URI=mongodb://localhost:27017/haoai
REDIS_URL=redis://localhost:6379

# ==================== OpenAI ====================
OPENAI_API_KEY=sk-xxxxx
OPENAI_API_BASE=https://api.openai.com/v1

# ==================== Anthropic ====================
ANTHROPIC_API_KEY=sk-ant-xxxxx

# ==================== Google ====================
GOOGLE_API_KEY=AIza-xxxxx

# ==================== DeepSeek ====================
DEEPSEEK_API_KEY=ds-xxxxx

# ==================== xAI ====================
XAI_API_KEY=xai-xxxxx

# ==================== 微信支付 ====================
WECHAT_APP_ID=wxxxxx
WECHAT_MCH_ID=xxxxx
WECHAT_API_KEY=xxxxx
WECHAT_NOTIFY_URL=https://haoai.com/api/payment/wechat/callback

# ==================== 支付宝 ====================
ALIPAY_APP_ID=xxxxx
ALIPAY_PRIVATE_KEY=xxxxx
ALIPAY_PUBLIC_KEY=xxxxx
ALipay_NOTIFY_URL=https://haoai.com/api/payment/alipay/callback

# ==================== AWS (可选) ====================
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_REGION=us-west-2

# ==================== 代理 (可选) ====================
HTTP_PROXY=http://proxy:7890
HTTPS_PROXY=http://proxy:7890

# ==================== 服务费 ====================
SERVICE_FEE_RATE=0.2  # 20% 利润
```

---

## 启动生产环境

```bash
# 1. 安装依赖
npm install

# 2. 构建前端
npm run build

# 3. 启动后端服务
npm run start

# 或使用 PM2
pm2 start ecosystem.config.js
```

---

## 监控与日志

```bash
# 查看日志
pm2 logs

# 监控状态
pm2 monit

# 查看API调用统计
curl http://localhost:3001/api/admin/stats
```
