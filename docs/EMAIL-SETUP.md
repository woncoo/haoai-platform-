# 邮件报告系统设置指南

## 功能说明

每日自动生成并发送运营报表到指定邮箱，包括：
- 昨日充值总金额
- 每个用户的详细消费记录
- 平台余额
- API配置状态
- 运营预警和预估

## 1. 配置邮件服务

### 方式一：QQ邮箱 / 163邮箱（简单）

1. 登录邮箱网页版
2. 设置 → 账户 → POP3/SMTP服务 → 开启
3. 获取授权码（不是登录密码）

### 方式二：Gmail（推荐国际业务）

1. Google Account → Security → 2-Step Verification → 开启
2. Google Account → Security → App passwords
3. 生成一个新的应用密码

### 填入配置

创建 `.env` 文件：

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
DAILY_REPORT_EMAIL=your-email@example.com
```

## 2. 测试邮件发送

```bash
# 预览日报（HTML格式）
curl "http://localhost:3000/api/admin/daily-report?format=html"

# 发送测试邮件
curl -X POST http://localhost:3000/api/admin/daily-report \
  -H "Content-Type: application/json" \
  -b "haoai_user_id=demo_user_001" \
  -d '{"email":"your-email@example.com"}'
```

## 3. 设置自动发送

### Mac/Linux - 使用 crontab

```bash
# 编辑 crontab
crontab -e

# 每天早上9点发送日报
0 9 * * * cd /path/to/ai-aggregation-platform && node scripts/send-daily-report.js >> /var/log/daily-report.log 2>&1
```

### 使用 launchd (macOS)

创建 `~/Library/LaunchAgents/com.haoai.daily-report.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.haoai.daily-report</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>/path/to/scripts/send-daily-report.js</string>
    </array>
    <key>StartCalendarInterval</key>
    <dict>
        <key>Hour</key>
        <integer>9</integer>
        <key>Minute</key>
        <integer>0</integer>
    </dict>
</dict>
</plist>
```

加载：
```bash
launchctl load ~/Library/LaunchAgents/com.haoai.daily-report.plist
```

### 使用第三方服务

#### GitHub Actions（免费）

创建 `.github/workflows/daily-report.yml`:

```yaml
name: Daily Report

on:
  schedule:
    - cron: '0 1 * * *'  # 每天 UTC 1:00 (北京时间9:00)
  workflow_dispatch:  # 手动触发

jobs:
  report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install
      - run: npx ts-node scripts/send-daily-report.ts
        env:
          SMTP_HOST: ${{ secrets.SMTP_HOST }}
          SMTP_PORT: ${{ secrets.SMTP_PORT }}
          SMTP_USER: ${{ secrets.SMTP_USER }}
          SMTP_PASSWORD: ${{ secrets.SMTP_PASSWORD }}
          DAILY_REPORT_EMAIL: ${{ secrets.DAILY_REPORT_EMAIL }}
```

在 GitHub Settings → Secrets 中配置：
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASSWORD
- DAILY_REPORT_EMAIL

## 4. 报表预览

访问管理后台 → 总览页面，可以查看：
- 实时统计数据
- 用户消费明细
- 系统设置

## 常见问题

### Q: 邮件发送失败？
A: 检查 SMTP 配置是否正确，确认邮箱已开启 SMTP 服务

### Q: 如何发送给多个邮箱？
A: 修改 `DAILY_REPORT_EMAIL` 为逗号分隔的多个邮箱

### Q: 能否自定义报表内容？
A: 修改 `src/lib/daily-report.ts` 中的报表生成逻辑
