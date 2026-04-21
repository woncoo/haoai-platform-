import Database from 'better-sqlite3';
import path from 'path';

// 数据库文件路径
const DB_PATH = path.join(process.cwd(), 'data', 'haoai.db');

// 确保data目录存在
import fs from 'fs';
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(DB_PATH);

// 启用 WAL 模式，提升并发性能
db.pragma('journal_mode = WAL');

// 初始化表结构
export function initDatabase() {
  db.exec(`
    -- 用户表
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      balance REAL DEFAULT 0,
      total_spent REAL DEFAULT 0,
      total_recharged REAL DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- API配置表（管理员配置）
    CREATE TABLE IF NOT EXISTS api_configs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      api_url TEXT NOT NULL,
      api_key TEXT NOT NULL,
      cost_per_1k_tokens REAL NOT NULL,
      markup_rate REAL DEFAULT 1.2,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 支付订单表
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount REAL NOT NULL,
      method TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      qr_code TEXT,
      transaction_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 消费记录表
    CREATE TABLE IF NOT EXISTS usage_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      api_config_id TEXT NOT NULL,
      model TEXT NOT NULL,
      input_tokens INTEGER DEFAULT 0,
      output_tokens INTEGER DEFAULT 0,
      cost REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (api_config_id) REFERENCES api_configs(id)
    );

    -- 预警记录表
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      type TEXT NOT NULL,
      threshold REAL NOT NULL,
      message TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      acknowledged_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 退款申请表
    CREATE TABLE IF NOT EXISTS refund_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      order_id TEXT NOT NULL,
      amount REAL NOT NULL,
      reason TEXT,
      status TEXT DEFAULT 'pending', -- pending, approved, rejected, completed
      admin_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      processed_by TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );

    -- 用户设置表（预警阈值等）
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      alert_threshold REAL DEFAULT 10,
      email_alerts INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 发票申请表
    CREATE TABLE IF NOT EXISTS invoice_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      tax_id TEXT,
      address TEXT,
      phone TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending', -- pending, approved, issued, rejected
      admin_note TEXT,
      invoice_no TEXT,
      issued_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      processed_at DATETIME,
      processed_by TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 对话历史表
    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      api_config_id TEXT,
      model TEXT NOT NULL,
      role TEXT NOT NULL, -- user/assistant
      content TEXT NOT NULL,
      tokens INTEGER DEFAULT 0,
      cost REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (api_config_id) REFERENCES api_configs(id)
    );

    -- 快捷指令表
    CREATE TABLE IF NOT EXISTS quick_prompts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 用户预算表
    CREATE TABLE IF NOT EXISTS user_budgets (
      user_id TEXT PRIMARY KEY,
      monthly_limit REAL DEFAULT 0,
      daily_limit REAL DEFAULT 0,
      alert_threshold REAL DEFAULT 0.8,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 优惠券表
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL, -- fixed(固定金额) or percentage(百分比)
      value REAL NOT NULL,
      min_amount REAL DEFAULT 0,
      max_discount REAL DEFAULT 0,
      valid_from DATETIME,
      valid_until DATETIME,
      usage_limit INTEGER DEFAULT 1,
      used_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 优惠券领取记录
    CREATE TABLE IF NOT EXISTS user_coupons (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      coupon_id TEXT NOT NULL,
      used_at DATETIME,
      status TEXT DEFAULT 'unused', -- unused, used, expired
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (coupon_id) REFERENCES coupons(id)
    );

    -- 邀请记录表
    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      inviter_id TEXT NOT NULL,
      invitee_id TEXT NOT NULL,
      reward_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending', -- pending, completed, expired
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      FOREIGN KEY (inviter_id) REFERENCES users(id),
      FOREIGN KEY (invitee_id) REFERENCES users(id)
    );

    -- 客服工单表
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL,
      category TEXT NOT NULL, -- question, bug, refund, other
      priority TEXT DEFAULT 'normal', -- low, normal, high, urgent
      status TEXT DEFAULT 'open', -- open, pending, resolved, closed
      description TEXT NOT NULL,
      admin_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 操作审计日志
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL, -- login, logout, recharge, refund, config_change, etc.
      target_type TEXT, -- user, order, api_config, etc.
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- API调用统计（用于异常检测）
    CREATE TABLE IF NOT EXISTS api_stats (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      hour_key TEXT NOT NULL, -- YYYY-MM-DD-HH格式
      request_count INTEGER DEFAULT 0,
      total_tokens INTEGER DEFAULT 0,
      total_cost REAL DEFAULT 0,
      avg_response_time REAL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- Webhook配置表
    CREATE TABLE IF NOT EXISTS webhooks (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      url TEXT NOT NULL,
      events TEXT NOT NULL, -- JSON数组，如["balance_low","order_completed"]
      secret TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    -- 创建索引
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_configs_user ON api_configs(user_id);
    CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id);
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_stats_user_hour ON api_stats(user_id, hour_key);
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON usage_logs(user_id);
    CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON usage_logs(created_at);
    CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id);
    CREATE INDEX IF NOT EXISTS idx_api_configs_user ON api_configs(user_id);
  `);

  console.log('✅ 数据库初始化完成');
}

// ==================== 用户操作 ====================

export interface User {
  id: string;
  phone?: string;
  nickname?: string;
  avatar?: string;
  balance: number;
  total_spent: number;
  total_recharged: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export function createUser(id: string, phone?: string): User {
  const stmt = db.prepare(`
    INSERT INTO users (id, phone, nickname) VALUES (?, ?, ?)
  `);
  stmt.run(id, phone || null, `用户${id.slice(0, 8)}`);
  return getUserById(id)!;
}

export function getUserById(id: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}

export function getOrCreateUser(id: string, phone?: string): User {
  let user = getUserById(id);
  if (!user) {
    user = createUser(id, phone);
  }
  return user;
}

export function updateUserBalance(id: string, amount: number) {
  const stmt = db.prepare(`
    UPDATE users SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(amount, id);
}

export function incrementUserSpent(id: string, amount: number) {
  const stmt = db.prepare(`
    UPDATE users SET total_spent = total_spent + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(amount, id);
}

export function incrementUserRecharged(id: string, amount: number) {
  const stmt = db.prepare(`
    UPDATE users SET total_recharged = total_recharged + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(amount, id);
}

export function getAllUsers(): User[] {
  const stmt = db.prepare('SELECT * FROM users ORDER BY created_at DESC');
  return stmt.all() as User[];
}

// ==================== API配置操作 ====================

// 懒加载加密模块避免循环依赖
let cryptoModule: typeof import('./crypto') | null = null;
async function getCrypto() {
  if (!cryptoModule) {
    cryptoModule = await import('./crypto');
  }
  return cryptoModule;
}

export interface ApiConfig {
  id: string;
  user_id: string;
  name: string;
  provider: string;
  api_url: string;
  api_key: string;  // 存储的是加密后的内容
  cost_per_1k_tokens: number;
  markup_rate: number;
  status: string;
  created_at: string;
}

// 同步版本的API配置（用于不需要显示的场景）
export interface ApiConfigPublic {
  id: string;
  name: string;
  provider: string;
  api_url: string;
  cost_per_1k_tokens: number;
  markup_rate: number;
  status: string;
  created_at: string;
}

export async function createApiConfig(
  userId: string,
  name: string,
  provider: string,
  apiUrl: string,
  apiKey: string,
  costPer1kTokens: number
): Promise<ApiConfig> {
  const { encryptApiKey } = await getCrypto();
  const id = `api_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const encryptedKey = encryptApiKey(apiKey);
  const stmt = db.prepare(`
    INSERT INTO api_configs (id, user_id, name, provider, api_url, api_key, cost_per_1k_tokens)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, name, provider, apiUrl, encryptedKey, costPer1kTokens);
  return getApiConfigById(id)!;
}

export function getApiConfigById(id: string): ApiConfig | undefined {
  const stmt = db.prepare('SELECT * FROM api_configs WHERE id = ?');
  return stmt.get(id) as ApiConfig | undefined;
}

export function getApiConfigsByUser(userId: string): ApiConfig[] {
  const stmt = db.prepare('SELECT * FROM api_configs WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as ApiConfig[];
}

export function getActiveApiConfigs(userId: string): ApiConfig[] {
  const stmt = db.prepare('SELECT * FROM api_configs WHERE user_id = ? AND status = ? ORDER BY created_at DESC');
  return stmt.all(userId, 'active') as ApiConfig[];
}

export function getAllApiConfigs(): ApiConfig[] {
  const stmt = db.prepare('SELECT * FROM api_configs ORDER BY created_at DESC');
  return stmt.all() as ApiConfig[];
}

export function updateApiConfigStatus(id: string, status: string) {
  const stmt = db.prepare('UPDATE api_configs SET status = ? WHERE id = ?');
  stmt.run(status, id);
}

export function deleteApiConfig(id: string) {
  const stmt = db.prepare('DELETE FROM api_configs WHERE id = ?');
  stmt.run(id);
}

// 获取解密后的API Key（仅内部使用，不暴露给前端）
export async function getDecryptedApiKey(id: string): Promise<string | null> {
  const config = getApiConfigById(id);
  if (!config) return null;

  const { decryptApiKey } = await getCrypto();
  try {
    return decryptApiKey(config.api_key);
  } catch {
    console.error(`Failed to decrypt API key for config ${id}`);
    return null;
  }
}

// 获取所有可用的API配置（公开信息，不包含密钥）
export function getAvailableApiConfigs(): ApiConfigPublic[] {
  const configs = getAllApiConfigs();
  return configs.map(c => ({
    id: c.id,
    name: c.name,
    provider: c.provider,
    api_url: c.api_url,
    cost_per_1k_tokens: c.cost_per_1k_tokens,
    markup_rate: c.markup_rate,
    status: c.status,
    created_at: c.created_at,
  }));
}

// 计算销售价格 = 成本 × 加价率
export function calculateSalePrice(costPer1kTokens: number, markupRate: number = 1.2): number {
  return Math.ceil(costPer1kTokens * markupRate * 10000) / 10000;
}

// ==================== 订单操作 ====================

export interface Order {
  id: string;
  user_id: string;
  amount: number;
  method: string;
  status: string;
  qr_code?: string;
  transaction_id?: string;
  created_at: string;
  completed_at?: string;
}

export function createOrder(userId: string, amount: number, method: string): Order {
  const id = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO orders (id, user_id, amount, method) VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, userId, amount, method);
  return getOrderById(id)!;
}

export function getOrderById(id: string): Order | undefined {
  const stmt = db.prepare('SELECT * FROM orders WHERE id = ?');
  return stmt.get(id) as Order | undefined;
}

export function getOrdersByUser(userId: string): Order[] {
  const stmt = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as Order[];
}

export function getPendingOrders(): Order[] {
  const stmt = db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY created_at ASC');
  return stmt.all('pending') as Order[];
}

export function completeOrder(id: string, transactionId: string) {
  const stmt = db.prepare(`
    UPDATE orders SET status = ?, transaction_id = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run('completed', transactionId, id);
}

export function failOrder(id: string) {
  const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  stmt.run('failed', id);
}

// ==================== 退款操作 ====================

export interface RefundRequest {
  id: string;
  user_id: string;
  order_id: string;
  amount: number;
  reason: string;
  status: string;
  admin_note?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
}

export function createRefundRequest(
  userId: string,
  orderId: string,
  amount: number,
  reason: string
): RefundRequest {
  const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO refund_requests (id, user_id, order_id, amount, reason)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, orderId, amount, reason);
  return getRefundRequestById(id)!;
}

export function getRefundRequestById(id: string): RefundRequest | undefined {
  const stmt = db.prepare('SELECT * FROM refund_requests WHERE id = ?');
  return stmt.get(id) as RefundRequest | undefined;
}

export function getRefundRequestsByUser(userId: string): RefundRequest[] {
  const stmt = db.prepare('SELECT * FROM refund_requests WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as RefundRequest[];
}

export function getAllRefundRequests(): RefundRequest[] {
  const stmt = db.prepare('SELECT * FROM refund_requests ORDER BY created_at DESC');
  return stmt.all() as RefundRequest[];
}

export function getPendingRefundRequests(): RefundRequest[] {
  const stmt = db.prepare("SELECT * FROM refund_requests WHERE status = 'pending' ORDER BY created_at ASC");
  return stmt.all() as RefundRequest[];
}

export function approveRefundRequest(id: string, adminId: string, adminNote?: string) {
  const stmt = db.prepare(`
    UPDATE refund_requests
    SET status = 'approved', admin_note = ?, processed_at = CURRENT_TIMESTAMP, processed_by = ?
    WHERE id = ?
  `);
  stmt.run(adminNote || null, adminId, id);
}

export function rejectRefundRequest(id: string, adminId: string, adminNote?: string) {
  const stmt = db.prepare(`
    UPDATE refund_requests
    SET status = 'rejected', admin_note = ?, processed_at = CURRENT_TIMESTAMP, processed_by = ?
    WHERE id = ?
  `);
  stmt.run(adminNote || null, adminId, id);
}

export function completeRefund(id: string) {
  const stmt = db.prepare(`
    UPDATE refund_requests
    SET status = 'completed', processed_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  stmt.run(id);
}

// ==================== 用户设置操作 ====================

export interface UserSettings {
  user_id: string;
  alert_threshold: number;
  email_alerts: boolean;
}

export function getUserSettings(userId: string): UserSettings | undefined {
  const stmt = db.prepare('SELECT * FROM user_settings WHERE user_id = ?');
  return stmt.get(userId) as UserSettings | undefined;
}

export function updateUserSettings(userId: string, settings: Partial<UserSettings>) {
  const current = getUserSettings(userId);
  if (current) {
    const stmt = db.prepare(`
      UPDATE user_settings
      SET alert_threshold = ?, email_alerts = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    stmt.run(
      settings.alert_threshold ?? current.alert_threshold,
      settings.email_alerts !== undefined ? (settings.email_alerts ? 1 : 0) : (current.email_alerts ? 1 : 0),
      userId
    );
  } else {
    const stmt = db.prepare(`
      INSERT INTO user_settings (user_id, alert_threshold, email_alerts)
      VALUES (?, ?, ?)
    `);
    stmt.run(
      userId,
      settings.alert_threshold ?? 10,
      settings.email_alerts !== undefined ? (settings.email_alerts ? 1 : 0) : 1
    );
  }
}

// ==================== 发票操作 ====================

export interface InvoiceRequest {
  id: string;
  user_id: string;
  title: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  amount: number;
  status: string;
  admin_note?: string;
  invoice_no?: string;
  issued_at?: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
}

export function createInvoiceRequest(
  userId: string,
  title: string,
  amount: number,
  taxId?: string,
  address?: string,
  phone?: string
): InvoiceRequest {
  const id = `inv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO invoice_requests (id, user_id, title, tax_id, address, phone, amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, title, taxId || null, address || null, phone || null, amount);
  return getInvoiceRequestById(id)!;
}

export function getInvoiceRequestById(id: string): InvoiceRequest | undefined {
  const stmt = db.prepare('SELECT * FROM invoice_requests WHERE id = ?');
  return stmt.get(id) as InvoiceRequest | undefined;
}

export function getInvoiceRequestsByUser(userId: string): InvoiceRequest[] {
  const stmt = db.prepare('SELECT * FROM invoice_requests WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as InvoiceRequest[];
}

export function getAllInvoiceRequests(): InvoiceRequest[] {
  const stmt = db.prepare('SELECT * FROM invoice_requests ORDER BY created_at DESC');
  return stmt.all() as InvoiceRequest[];
}

export function getPendingInvoiceRequests(): InvoiceRequest[] {
  const stmt = db.prepare("SELECT * FROM invoice_requests WHERE status = 'pending' ORDER BY created_at ASC");
  return stmt.all() as InvoiceRequest[];
}

export function approveInvoiceRequest(id: string, adminId: string, invoiceNo: string) {
  const stmt = db.prepare(`
    UPDATE invoice_requests
    SET status = 'approved', invoice_no = ?, processed_at = CURRENT_TIMESTAMP, processed_by = ?
    WHERE id = ?
  `);
  stmt.run(invoiceNo, adminId, id);
}

export function issueInvoiceRequest(id: string, adminId: string) {
  const stmt = db.prepare(`
    UPDATE invoice_requests
    SET status = 'issued', issued_at = CURRENT_TIMESTAMP, processed_at = CURRENT_TIMESTAMP, processed_by = ?
    WHERE id = ?
  `);
  stmt.run(adminId, id);
}

export function rejectInvoiceRequest(id: string, adminId: string, adminNote: string) {
  const stmt = db.prepare(`
    UPDATE invoice_requests
    SET status = 'rejected', admin_note = ?, processed_at = CURRENT_TIMESTAMP, processed_by = ?
    WHERE id = ?
  `);
  stmt.run(adminNote, adminId, id);
}

export function getUserTotalInvoicedAmount(userId: string): number {
  const stmt = db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total FROM invoice_requests
    WHERE user_id = ? AND status IN ('approved', 'issued')
  `);
  const result = stmt.get(userId) as { total: number };
  return result.total;
}

// ==================== 消费记录操作 ====================

export interface UsageLog {
  id: string;
  user_id: string;
  api_config_id: string;
  model: string;
  input_tokens: number;
  output_tokens: number;
  cost: number;
  created_at: string;
}

export function createUsageLog(
  userId: string,
  apiConfigId: string,
  model: string,
  inputTokens: number,
  outputTokens: number,
  cost: number
): UsageLog {
  const id = `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO usage_logs (id, user_id, api_config_id, model, input_tokens, output_tokens, cost)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, apiConfigId, model, inputTokens, outputTokens, cost);
  return getUsageLogById(id)!;
}

export function getUsageLogById(id: string): UsageLog | undefined {
  const stmt = db.prepare('SELECT * FROM usage_logs WHERE id = ?');
  return stmt.get(id) as UsageLog | undefined;
}

export function getUsageLogsByUser(userId: string, limit: number = 100): UsageLog[] {
  const stmt = db.prepare('SELECT * FROM usage_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(userId, limit) as UsageLog[];
}

export function getAllUsageLogs(limit: number = 100): UsageLog[] {
  const stmt = db.prepare('SELECT * FROM usage_logs ORDER BY created_at DESC LIMIT ?');
  return stmt.all(limit) as UsageLog[];
}

export function getTodayUsageByUser(userId: string): { total_cost: number; count: number } {
  const stmt = db.prepare(`
    SELECT COALESCE(SUM(cost), 0) as total_cost, COUNT(*) as count
    FROM usage_logs
    WHERE user_id = ? AND DATE(created_at) = DATE('now')
  `);
  return stmt.get(userId) as { total_cost: number; count: number };
}

// ==================== 预警操作 ====================

export interface Alert {
  id: string;
  user_id: string;
  type: string;
  threshold: number;
  message?: string;
  created_at: string;
  acknowledged_at?: string;
}

export function createAlert(userId: string, type: string, threshold: number, message?: string): Alert {
  const id = `alert_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO alerts (id, user_id, type, threshold, message) VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, type, threshold, message || null);
  return getAlertById(id)!;
}

export function getAlertById(id: string): Alert | undefined {
  const stmt = db.prepare('SELECT * FROM alerts WHERE id = ?');
  return stmt.get(id) as Alert | undefined;
}

export function getUnacknowledgedAlertsByUser(userId: string): Alert[] {
  const stmt = db.prepare('SELECT * FROM alerts WHERE user_id = ? AND acknowledged_at IS NULL ORDER BY created_at DESC');
  return stmt.all(userId) as Alert[];
}

export function acknowledgeAlert(id: string) {
  const stmt = db.prepare('UPDATE alerts SET acknowledged_at = CURRENT_TIMESTAMP WHERE id = ?');
  stmt.run(id);
}

export function hasRecentLowBalanceAlert(userId: string): boolean {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM alerts
    WHERE user_id = ? AND type = 'balance_low' AND created_at > datetime('now', '-1 hour')
  `);
  const result = stmt.get(userId) as { count: number };
  return result.count > 0;
}

// ==================== 统计操作 ====================

export function getStats() {
  const users = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  const orders = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total FROM orders WHERE status = 'completed'").get() as { count: number; total: number };
  const usage = db.prepare("SELECT COUNT(*) as count, COALESCE(SUM(cost), 0) as total FROM usage_logs WHERE DATE(created_at) = DATE('now')").get() as { count: number; total: number };
  const todayRevenue = db.prepare("SELECT COALESCE(SUM(cost), 0) as total FROM usage_logs WHERE DATE(created_at) = DATE('now')").get() as { total: number };

  return {
    totalUsers: users.count,
    totalOrders: orders.count,
    totalRecharged: orders.total,
    todayMessages: usage.count,
    todayCost: usage.total,
    todayRevenue: todayRevenue.total,
  };
}

// ==================== 对话历史操作 ====================

export interface ChatMessage {
  id: string;
  user_id: string;
  api_config_id?: string;
  model: string;
  role: 'user' | 'assistant';
  content: string;
  tokens: number;
  cost: number;
  created_at: string;
}

export function saveChatMessage(
  userId: string,
  model: string,
  role: 'user' | 'assistant',
  content: string,
  tokens: number = 0,
  cost: number = 0,
  apiConfigId?: string
): ChatMessage {
  const id = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO chat_messages (id, user_id, api_config_id, model, role, content, tokens, cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, apiConfigId || null, model, role, content, tokens, cost);
  return getChatMessageById(id)!;
}

export function getChatMessageById(id: string): ChatMessage | undefined {
  const stmt = db.prepare('SELECT * FROM chat_messages WHERE id = ?');
  return stmt.get(id) as ChatMessage | undefined;
}

export function getChatMessagesByUser(userId: string, limit: number = 100): ChatMessage[] {
  const stmt = db.prepare('SELECT * FROM chat_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ?');
  return stmt.all(userId, limit) as ChatMessage[];
}

export function searchChatMessages(userId: string, keyword: string, limit: number = 50): ChatMessage[] {
  const stmt = db.prepare(`
    SELECT * FROM chat_messages
    WHERE user_id = ? AND content LIKE ?
    ORDER BY created_at DESC LIMIT ?
  `);
  return stmt.all(userId, `%${keyword}%`, limit) as ChatMessage[];
}

export function deleteChatMessage(id: string) {
  const stmt = db.prepare('DELETE FROM chat_messages WHERE id = ?');
  stmt.run(id);
}

export function clearChatHistory(userId: string) {
  const stmt = db.prepare('DELETE FROM chat_messages WHERE user_id = ?');
  stmt.run(userId);
}

// ==================== 快捷指令操作 ====================

export interface QuickPrompt {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
}

export function createQuickPrompt(userId: string, title: string, content: string): QuickPrompt {
  const id = `qp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO quick_prompts (id, user_id, title, content) VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, userId, title, content);
  return getQuickPromptById(id)!;
}

export function getQuickPromptById(id: string): QuickPrompt | undefined {
  const stmt = db.prepare('SELECT * FROM quick_prompts WHERE id = ?');
  return stmt.get(id) as QuickPrompt | undefined;
}

export function getQuickPromptsByUser(userId: string): QuickPrompt[] {
  const stmt = db.prepare('SELECT * FROM quick_prompts WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as QuickPrompt[];
}

export function updateQuickPrompt(id: string, title: string, content: string) {
  const stmt = db.prepare('UPDATE quick_prompts SET title = ?, content = ? WHERE id = ?');
  stmt.run(title, content, id);
}

export function deleteQuickPrompt(id: string) {
  const stmt = db.prepare('DELETE FROM quick_prompts WHERE id = ?');
  stmt.run(id);
}

// ==================== 用户预算操作 ====================

export interface UserBudget {
  user_id: string;
  monthly_limit: number;
  daily_limit: number;
  alert_threshold: number;
  created_at: string;
  updated_at: string;
}

export function getUserBudget(userId: string): UserBudget | undefined {
  const stmt = db.prepare('SELECT * FROM user_budgets WHERE user_id = ?');
  return stmt.get(userId) as UserBudget | undefined;
}

export function setUserBudget(
  userId: string,
  monthlyLimit: number,
  dailyLimit: number,
  alertThreshold: number = 0.8
) {
  const existing = getUserBudget(userId);
  if (existing) {
    const stmt = db.prepare(`
      UPDATE user_budgets
      SET monthly_limit = ?, daily_limit = ?, alert_threshold = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `);
    stmt.run(monthlyLimit, dailyLimit, alertThreshold, userId);
  } else {
    const stmt = db.prepare(`
      INSERT INTO user_budgets (user_id, monthly_limit, daily_limit, alert_threshold)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(userId, monthlyLimit, dailyLimit, alertThreshold);
  }
}

export function getUserSpendingInPeriod(userId: string, period: 'daily' | 'monthly'): number {
  let dateFilter = '';
  if (period === 'daily') {
    dateFilter = "DATE(created_at) = DATE('now')";
  } else {
    dateFilter = "strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')";
  }
  const stmt = db.prepare(`SELECT COALESCE(SUM(cost), 0) as total FROM usage_logs WHERE user_id = ? AND ${dateFilter}`);
  const result = stmt.get(userId) as { total: number };
  return result.total;
}

// ==================== 优惠券操作 ====================

export interface Coupon {
  id: string;
  code: string;
  type: 'fixed' | 'percentage';
  value: number;
  min_amount: number;
  max_discount: number;
  valid_from?: string;
  valid_until?: string;
  usage_limit: number;
  used_count: number;
  status: string;
  created_at: string;
}

export function createCoupon(
  code: string,
  type: 'fixed' | 'percentage',
  value: number,
  minAmount: number = 0,
  maxDiscount: number = 0,
  validFrom?: string,
  validUntil?: string,
  usageLimit: number = 1
): Coupon {
  const id = `cpn_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO coupons (id, code, type, value, min_amount, max_discount, valid_from, valid_until, usage_limit)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, code, type, value, minAmount, maxDiscount, validFrom || null, validUntil || null, usageLimit);
  return getCouponById(id)!;
}

export function getCouponById(id: string): Coupon | undefined {
  const stmt = db.prepare('SELECT * FROM coupons WHERE id = ?');
  return stmt.get(id) as Coupon | undefined;
}

export function getCouponByCode(code: string): Coupon | undefined {
  const stmt = db.prepare('SELECT * FROM coupons WHERE code = ?');
  return stmt.get(code) as Coupon | undefined;
}

export function validateCoupon(code: string, amount: number): { valid: boolean; discount: number; message: string } {
  const coupon = getCouponByCode(code);
  if (!coupon) return { valid: false, discount: 0, message: '优惠券不存在' };
  if (coupon.status !== 'active') return { valid: false, discount: 0, message: '优惠券已停用' };
  if (coupon.used_count >= coupon.usage_limit) return { valid: false, discount: 0, message: '优惠券已用完' };
  if (amount < coupon.min_amount) return { valid: false, discount: 0, message: `满${coupon.min_amount}元可用` };

  const now = new Date();
  if (coupon.valid_from && new Date(coupon.valid_from) > now) return { valid: false, discount: 0, message: '优惠券未生效' };
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return { valid: false, discount: 0, message: '优惠券已过期' };

  let discount = 0;
  if (coupon.type === 'fixed') {
    discount = coupon.value;
  } else {
    discount = amount * (coupon.value / 100);
    if (coupon.max_discount > 0) discount = Math.min(discount, coupon.max_discount);
  }

  return { valid: true, discount, message: '优惠券可用' };
}

export function useCoupon(couponId: string) {
  const stmt = db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?');
  stmt.run(couponId);
}

// ==================== 邀请记录操作 ====================

export interface Referral {
  id: string;
  inviter_id: string;
  invitee_id: string;
  reward_amount: number;
  status: string;
  created_at: string;
  completed_at?: string;
}

export function createReferral(inviterId: string, inviteeId: string, rewardAmount: number = 10): Referral {
  const id = `ref_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO referrals (id, inviter_id, invitee_id, reward_amount) VALUES (?, ?, ?, ?)
  `);
  stmt.run(id, inviterId, inviteeId, rewardAmount);
  return getReferralById(id)!;
}

export function getReferralById(id: string): Referral | undefined {
  const stmt = db.prepare('SELECT * FROM referrals WHERE id = ?');
  return stmt.get(id) as Referral | undefined;
}

export function getReferralsByUser(userId: string): Referral[] {
  const stmt = db.prepare('SELECT * FROM referrals WHERE inviter_id = ? OR invitee_id = ? ORDER BY created_at DESC');
  return stmt.all(userId, userId) as Referral[];
}

export function completeReferral(id: string) {
  const stmt = db.prepare(`
    UPDATE referrals SET status = 'completed', completed_at = CURRENT_TIMESTAMP WHERE id = ?
  `);
  stmt.run(id);
}

// ==================== 客服工单操作 ====================

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  description: string;
  admin_note?: string;
  created_at: string;
  updated_at: string;
  closed_at?: string;
}

export function createSupportTicket(
  userId: string,
  subject: string,
  category: string,
  description: string,
  priority: string = 'normal'
): SupportTicket {
  const id = `ticket_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO support_tickets (id, user_id, subject, category, priority, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, subject, category, priority, description);
  return getSupportTicketById(id)!;
}

export function getSupportTicketById(id: string): SupportTicket | undefined {
  const stmt = db.prepare('SELECT * FROM support_tickets WHERE id = ?');
  return stmt.get(id) as SupportTicket | undefined;
}

export function getSupportTicketsByUser(userId: string): SupportTicket[] {
  const stmt = db.prepare('SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as SupportTicket[];
}

export function getAllSupportTickets(status?: string): SupportTicket[] {
  if (status) {
    const stmt = db.prepare('SELECT * FROM support_tickets WHERE status = ? ORDER BY created_at DESC');
    return stmt.all(status) as SupportTicket[];
  }
  const stmt = db.prepare('SELECT * FROM support_tickets ORDER BY created_at DESC');
  return stmt.all() as SupportTicket[];
}

export function updateSupportTicket(id: string, updates: { status?: string; admin_note?: string }) {
  const sets: string[] = [];
  const values: any[] = [];

  if (updates.status) {
    sets.push('status = ?');
    values.push(updates.status);
    if (updates.status === 'closed') {
      sets.push('closed_at = CURRENT_TIMESTAMP');
    }
  }
  if (updates.admin_note) {
    sets.push('admin_note = ?');
    values.push(updates.admin_note);
  }
  sets.push('updated_at = CURRENT_TIMESTAMP');

  const stmt = db.prepare(`UPDATE support_tickets SET ${sets.join(', ')} WHERE id = ?`);
  stmt.run(...values, id);
}

// ==================== 审计日志操作 ====================

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  target_type?: string;
  target_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export function createAuditLog(
  action: string,
  options: {
    userId?: string;
    targetType?: string;
    targetId?: string;
    details?: string;
    ipAddress?: string;
  } = {}
): AuditLog {
  const id = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO audit_logs (id, user_id, action, target_type, target_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(id, options.userId || null, action, options.targetType || null, options.targetId || null, options.details || null, options.ipAddress || null);
  return { id, action, ...options, created_at: new Date().toISOString() };
}

export function getAuditLogs(options: {
  userId?: string;
  action?: string;
  limit?: number;
} = {}): AuditLog[] {
  let sql = 'SELECT * FROM audit_logs WHERE 1=1';
  const params: any[] = [];

  if (options.userId) {
    sql += ' AND user_id = ?';
    params.push(options.userId);
  }
  if (options.action) {
    sql += ' AND action = ?';
    params.push(options.action);
  }

  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(options.limit || 100);

  const stmt = db.prepare(sql);
  return stmt.all(...params) as AuditLog[];
}

// ==================== API统计操作（异常检测）====================

export interface ApiStats {
  id: string;
  user_id: string;
  hour_key: string;
  request_count: number;
  total_tokens: number;
  total_cost: number;
  avg_response_time: number;
  created_at: string;
  updated_at: string;
}

export function recordApiStats(
  userId: string,
  tokens: number,
  cost: number,
  responseTime: number = 0
): void {
  const hourKey = new Date().toISOString().slice(0, 13); // YYYY-MM-DDTHH
  const id = `stats_${hourKey}_${userId}`;

  const existing = db.prepare('SELECT id FROM api_stats WHERE hour_key = ? AND user_id = ?').get(hourKey, userId);

  if (existing) {
    const stmt = db.prepare(`
      UPDATE api_stats
      SET request_count = request_count + 1,
          total_tokens = total_tokens + ?,
          total_cost = total_cost + ?,
          avg_response_time = (avg_response_time * request_count + ?) / (request_count + 1),
          updated_at = CURRENT_TIMESTAMP
      WHERE hour_key = ? AND user_id = ?
    `);
    stmt.run(tokens, cost, responseTime, hourKey, userId);
  } else {
    const stmt = db.prepare(`
      INSERT INTO api_stats (id, user_id, hour_key, request_count, total_tokens, total_cost, avg_response_time)
      VALUES (?, ?, ?, 1, ?, ?, ?)
    `);
    stmt.run(id, userId, hourKey, tokens, cost, responseTime);
  }
}

export function getUserApiStats(userId: string, hours: number = 24): ApiStats[] {
  const stmt = db.prepare(`
    SELECT * FROM api_stats
    WHERE user_id = ? AND hour_key >= datetime('now', '-' || ? || ' hours')
    ORDER BY hour_key DESC
  `);
  return stmt.all(userId, hours) as ApiStats[];
}

export function detectAnomalousUsage(userId: string): { isAnomalous: boolean; reason?: string } {
  // 检测最近1小时的请求数是否异常高（超过平均的5倍）
  const stats = getUserApiStats(userId, 24);
  if (stats.length < 2) return { isAnomalous: false };

  const recentHour = stats[0];
  const avgRequests = stats.reduce((sum, s) => sum + s.request_count, 0) / stats.length;

  if (recentHour.request_count > avgRequests * 5 && avgRequests > 10) {
    return {
      isAnomalous: true,
      reason: `检测到异常高的API使用量：最近1小时${recentHour.request_count}次请求，远超平均${Math.round(avgRequests)}次`
    };
  }

  // 检测凌晨异常（0-6点请求超过平均的3倍）
  const hour = new Date().getHours();
  if (hour >= 0 && hour <= 6) {
    const daytimeAvg = stats.filter(s => {
      const h = parseInt(s.hour_key.slice(11, 13));
      return h >= 8 && h <= 22;
    }).reduce((sum, s) => sum + s.request_count, 0) / Math.max(stats.filter(s => {
      const h = parseInt(s.hour_key.slice(11, 13));
      return h >= 8 && h <= 22;
    }).length, 1);

    if (recentHour.request_count > daytimeAvg * 3 && daytimeAvg > 5) {
      return {
        isAnomalous: true,
        reason: `检测到凌晨异常使用：${recentHour.request_count}次请求（白天平均${Math.round(daytimeAvg)}次）`
      };
    }
  }

  return { isAnomalous: false };
}

// ==================== Webhook操作 ====================

export interface Webhook {
  id: string;
  user_id: string;
  url: string;
  events: string; // JSON string
  secret?: string;
  status: string;
  created_at: string;
}

export function createWebhook(
  userId: string,
  url: string,
  events: string[],
  secret?: string
): Webhook {
  const id = `wh_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const stmt = db.prepare(`
    INSERT INTO webhooks (id, user_id, url, events, secret) VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(id, userId, url, JSON.stringify(events), secret || null);
  return getWebhookById(id)!;
}

export function getWebhookById(id: string): Webhook | undefined {
  const stmt = db.prepare('SELECT * FROM webhooks WHERE id = ?');
  return stmt.get(id) as Webhook | undefined;
}

export function getWebhooksByUser(userId: string): Webhook[] {
  const stmt = db.prepare('SELECT * FROM webhooks WHERE user_id = ? ORDER BY created_at DESC');
  return stmt.all(userId) as Webhook[];
}

export function getActiveWebhooksByEvent(event: string): Webhook[] {
  const stmt = db.prepare('SELECT * FROM webhooks WHERE status = ?');
  const webhooks = stmt.all('active') as Webhook[];
  return webhooks.filter(w => {
    const events = JSON.parse(w.events);
    return events.includes(event) || events.includes('*');
  });
}

export function deleteWebhook(id: string) {
  const stmt = db.prepare('DELETE FROM webhooks WHERE id = ?');
  stmt.run(id);
}

// 初始化数据库
initDatabase();

export default db;
