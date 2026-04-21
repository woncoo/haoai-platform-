import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import {
  getAllApiConfigs,
  getUserById,
  createUsageLog,
  updateUserBalance,
  incrementUserSpent,
  createAlert,
  hasRecentLowBalanceAlert,
  calculateSalePrice,
  ApiConfig,
} from '@/lib/db';
import db from '@/lib/db';
import { countTokens, countMessageTokens } from '@/lib/tokenizer';

// 计算费用 - 向上取整，宁多扣不少扣，保证利润
function calculateCost(costPer1kTokens: number, inputTokens: number, outputTokens: number, markupRate: number = 1.2): number {
  const totalTokens = inputTokens + outputTokens;
  // 基础成本
  const baseCost = (totalTokens / 1000) * costPer1kTokens;
  // 乘以倍率后向上取整到4位小数，保证利润
  const finalCost = Math.ceil(baseCost * markupRate * 10000) / 10000;
  // 再多加一点点，确保覆盖所有成本（至少0.0001元）
  return Math.max(finalCost, 0.0001);
}

// API健康状态追踪（内存中，生产环境应使用Redis）
const apiHealthTracker = new Map<string, { failures: number; lastSuccess: number; cooldownUntil: number }>();

// API故障恢复时间（毫秒）= 30秒
const API_COOLDOWN_MS = 30000;

// 获取活跃的全局API配置（带故障转移）
function getActiveGlobalApiConfigs() {
  const configs = getAllApiConfigs();
  const now = Date.now();

  return configs.filter((c) => {
    // 只选择活跃的
    if (c.status !== 'active') return false;

    // 检查是否在冷却期
    const health = apiHealthTracker.get(c.id);
    if (health && health.cooldownUntil > now) {
      return false; // 在冷却期内，跳过
    }

    return true;
  });
}

// 更新API健康状态
function updateApiHealth(configId: string, success: boolean) {
  const now = Date.now();
  const health = apiHealthTracker.get(configId) || { failures: 0, lastSuccess: 0, cooldownUntil: 0 };

  if (success) {
    // 成功调用：重置失败计数
    health.failures = 0;
    health.lastSuccess = now;
    health.cooldownUntil = 0;
  } else {
    // 失败：增加失败计数
    health.failures += 1;
    health.lastSuccess = now;

    // 连续失败3次则进入冷却期
    if (health.failures >= 3) {
      health.cooldownUntil = now + API_COOLDOWN_MS;
      console.warn(`API ${configId} 进入故障转移冷却期，失败次数: ${health.failures}`);
    }
  }

  apiHealthTracker.set(configId, health);
}

// 按优先级排序API配置（优先使用成功率高的）
function sortByHealth(configs: ApiConfig[]) {
  return configs.sort((a, b) => {
    const healthA = apiHealthTracker.get(a.id) || { failures: 0 };
    const healthB = apiHealthTracker.get(b.id) || { failures: 0 };
    // 失败次数少的优先
    return healthA.failures - healthB.failures;
  });
}

// 原子性扣款 - 防止并发竞态条件
function atomicDeductBalance(userId: string, amount: number): { success: boolean; newBalance: number } {
  const deductStmt = db.prepare(`
    UPDATE users
    SET balance = balance - ?,
        total_spent = total_spent + ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND balance >= ?
  `);

  const getBalanceStmt = db.prepare('SELECT balance FROM users WHERE id = ?');

  const transaction = db.transaction(() => {
    // 先检查余额是否足够
    const user = getBalanceStmt.get(userId) as { balance: number } | undefined;
    if (!user || user.balance < amount) {
      return { success: false, newBalance: user?.balance || 0 };
    }

    // 扣款
    const result = deductStmt.run(amount, amount, userId, amount);
    if (result.changes === 0) {
      return { success: false, newBalance: user.balance };
    }

    // 获取新余额
    const newUser = getBalanceStmt.get(userId) as { balance: number };
    return { success: true, newBalance: newUser.balance };
  });

  return transaction();
}

// 聊天API
export async function POST(request: NextRequest) {
  try {
    // 1. 速率限制检查
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = checkRateLimit(clientIp);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `请求过于频繁，请${rateLimitResult.retryAfter}秒后再试`,
          code: 'RATE_LIMITED',
          retryAfter: rateLimitResult.retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimitResult.retryAfter),
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const user = await requireAuth();

    // 2. 强制检查：用户状态必须是active
    if (user.status !== 'active') {
      return NextResponse.json(
        { success: false, error: '账号已被封禁，请联系客服' },
        { status: 403 }
      );
    }

    // 3. 强制检查：余额必须大于0
    if (user.balance <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: '余额不足，账号已停用，请先充值',
          balance: 0,
          code: 'INSUFFICIENT_BALANCE',
        },
        { status: 402 }
      );
    }

    const body = await request.json();
    const { api_config_id, model, messages } = body;

    // 4. 验证请求参数
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { success: false, error: '无效的请求参数' },
        { status: 400 }
      );
    }

    // 获取全局API配置（带故障转移和健康排序）
    const globalConfigs = getActiveGlobalApiConfigs();

    if (globalConfigs.length === 0) {
      return NextResponse.json(
        { success: false, error: '系统暂无可用API，请联系管理员' },
        { status: 503 }
      );
    }

    // 按健康状态排序（失败的次数少的优先）
    const sortedConfigs = sortByHealth(globalConfigs);

    // 选择API配置（支持指定或自动选择最健康的）
    let activeConfig: ApiConfig | undefined;
    if (api_config_id) {
      activeConfig = sortedConfigs.find((c) => c.id === api_config_id);
    }
    if (!activeConfig) {
      // 默认选择最健康的配置
      activeConfig = sortedConfigs[0];
    }

    // 使用tiktoken精确计算输入Token
    const inputTokens = countMessageTokens(messages);

    // 模拟API调用（实际项目中这里要真实调用供应商API）
    // 模拟一个响应
    let simulatedOutput: string;
    let apiCallSuccess = true;

    try {
      simulatedOutput = `这是一条模拟响应。使用 ${activeConfig.name} (${activeConfig.provider})，成本价 ${activeConfig.cost_per_1k_tokens} 元/千token，销售价 ${calculateSalePrice(activeConfig.cost_per_1k_tokens, activeConfig.markup_rate)} 元/千token。`;

      // 模拟10%概率的API失败（用于测试故障转移）
      // 实际项目中这里会捕获真实的API异常
      // if (Math.random() < 0.1) {
      //   throw new Error('API调用失败');
      // }
    } catch (apiError: any) {
      apiCallSuccess = false;
      if (activeConfig) {
        updateApiHealth(activeConfig.id, false);
      }

      // 尝试故障转移到下一个健康的API
      const remainingConfigs = sortedConfigs.filter(c => c.id !== activeConfig?.id);
      if (remainingConfigs.length > 0) {
        const failoverConfig = remainingConfigs[0];
        console.warn(`API ${activeConfig?.id} 失败，自动切换到 ${failoverConfig.id}`);

        simulatedOutput = `这是一条模拟响应。使用 ${failoverConfig.name} (${failoverConfig.provider})，成本价 ${failoverConfig.cost_per_1k_tokens} 元/千token，销售价 ${calculateSalePrice(failoverConfig.cost_per_1k_tokens, failoverConfig.markup_rate)} 元/千token。`;

        // 更新activeConfig为新的配置
        activeConfig = failoverConfig;
      } else {
        return NextResponse.json(
          { success: false, error: `API调用失败: ${apiError.message}，且无备用API` },
          { status: 503 }
        );
      }
    }

    // 更新API健康状态
    if (activeConfig) {
      updateApiHealth(activeConfig.id, apiCallSuccess);
    }

    // 使用tiktoken精确计算输出Token
    const outputTokens = countTokens(simulatedOutput);

    // 计算费用（精确计费，向上取整）
    const cost = calculateCost(
      activeConfig!.cost_per_1k_tokens,
      inputTokens,
      outputTokens,
      activeConfig.markup_rate
    );

    // 原子性扣款（防止并发导致的负余额）
    const deductResult = atomicDeductBalance(user.id, cost);

    if (!deductResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: '余额不足，请先充值',
          balance: deductResult.newBalance,
          need: cost,
          code: 'INSUFFICIENT_BALANCE',
        },
        { status: 402 }
      );
    }

    const remainingBalance = deductResult.newBalance;

    // 记录使用日志
    createUsageLog(user.id, activeConfig.id, model || activeConfig.name, inputTokens, outputTokens, cost);

    // 检查余额预警（余额低于历史最高充值10%时提醒）
    let alertMessage: string | undefined;
    const threshold = user.total_recharged * 0.1;

    if (remainingBalance > 0 && remainingBalance <= threshold) {
      if (!hasRecentLowBalanceAlert(user.id)) {
        createAlert(
          user.id,
          'balance_low',
          threshold,
          `余额不足提醒：当前余额 ${remainingBalance.toFixed(2)}元，低于阈值 ${threshold.toFixed(2)}元`
        );
        alertMessage = `⚠️ 余额不足提醒：当前余额 ${remainingBalance.toFixed(2)}元，建议及时充值`;
      }
    }

    // 检查余额是否归零
    if (remainingBalance <= 0) {
      // 创建强制停用预警
      createAlert(
        user.id,
        'balance_exhausted',
        0,
        `余额耗尽，账号已停用`
      );
    }

    return NextResponse.json({
      success: true,
      response: simulatedOutput,
      usage: {
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        cost: cost,
        model: activeConfig.name,
        provider: activeConfig.provider,
        api_config_id: activeConfig.id,
      },
      balance: remainingBalance,
      alert_message: alertMessage,
      failover: sortedConfigs.length > 1 ? true : false,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    if (error.message?.includes('未登录')) {
      return NextResponse.json(
        { success: false, error: error.message, code: 'NOT_LOGGED_IN' },
        { status: 401 }
      );
    }
    if (error.message?.includes('封禁')) {
      return NextResponse.json(
        { success: false, error: error.message, code: 'ACCOUNT_BANNED' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { success: false, error: '请求失败' },
      { status: 500 }
    );
  }
}

// 获取可用的API列表（公开信息）
export async function GET() {
  try {
    const user = await requireAuth();
    const configs = getActiveGlobalApiConfigs();

    return NextResponse.json({
      success: true,
      apis: configs.map((c) => ({
        id: c.id,
        name: c.name,
        provider: c.provider,
        model: c.name.split(' ')[0],
        cost_per_1k_tokens: c.cost_per_1k_tokens,
        sale_price: calculateSalePrice(c.cost_per_1k_tokens, c.markup_rate),
      })),
      balance: user.balance,
      user_status: user.status,
    });
  } catch (error: any) {
    console.error('Get APIs error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
