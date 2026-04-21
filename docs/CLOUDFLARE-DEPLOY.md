# 好AI - Cloudflare Pages 部署指南

## 部署选项

### 选项1：Cloudflare Pages（推荐）

**优点**：
- 全球CDN加速
- 免费额度充足
- 自动HTTPS
- 边缘计算支持

**部署步骤**：

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **构建项目**
   ```bash
   npm run build
   ```

4. **部署**
   ```bash
   # 直接部署
   wrangler pages deploy out --project-name=haoai-platform

   # 或使用 wrangler pages project create 先创建项目
   ```

5. **设置环境变量**
   在 Cloudflare Pages 设置中添加：
   - `API_KEY_ENCRYPTION_KEY` - API加密密钥（32字节随机字符串）
   - `NODE_VERSION` - 18

**注意**：Cloudflare Pages 静态部署不支持 Server-Side 数据库。
需要改用：
- **Cloudflare D1** - SQLite边缘数据库
- **Cloudflare KV** - 键值存储

### 选项2：Cloudflare Workers（推荐用于动态API）

**优点**：
- 支持API Routes
- 边缘计算
- 按请求计费

**部署步骤**：

1. **创建 Workers 项目**
   ```bash
   wrangler init haoai-api
   ```

2. **配置 wrangler.toml**
   ```toml
   name = "haoai-api"
   main = "src/index.ts"
   compatibility_date = "2024-01-01"

   [[d1_databases]]
   binding = "DB"
   database_name = "haoai"
   database_id = "your-d1-database-id"
   ```

3. **部署**
   ```bash
   wrangler deploy
   ```

### 选项3：传统 VPS（你自己控制服务器）

**推荐配置**：
- Ubuntu 22.04 LTS
- Nginx + PM2
- Nginx 反向代理到 Next.js

**部署步骤**：

1. **安装 Node.js 18+**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **安装 PM2**
   ```bash
   sudo npm install -g pm2
   ```

3. **构建**
   ```bash
   npm run build
   npm run start
   ```

4. **配置 Nginx**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```

## 数据库迁移到 Cloudflare D1

如果使用 Cloudflare 部署，需要将 SQLite 迁移到 D1：

1. **创建 D1 数据库**
   ```bash
   wrangler d1 create haoai
   ```

2. **导出本地数据库**
   ```bash
   wrangler d1 export haoai --local=/path/to/haoai.db
   ```

3. **导入到 D1**
   ```bash
   wrangler d1 execute haoai --file=./haoai.db.sql
   ```

4. **更新代码使用 D1**
   修改 `src/lib/db.ts` 使用 `@cloudflare/workers-types` 和 D1 绑定。

## 生产环境检查清单

- [ ] 设置 `API_KEY_ENCRYPTION_KEY` 环境变量
- [ ] 配置 HTTPS（Cloudflare自动提供）
- [ ] 设置合理的速率限制
- [ ] 启用日志和监控
- [ ] 配置备份策略
- [ ] 测试支付回调URL可达性
