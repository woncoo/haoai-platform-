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
