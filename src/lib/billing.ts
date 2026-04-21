import {
  getActiveApiConfigs,
  getUserById,
  updateUserBalance,
  incrementUserSpent,
  createUsageLog,
  createAlert,
  hasRecentLowBalanceAlert,
  calculateSalePrice,
  ApiConfig,
} from './db';

// 计算Token数量（简单估算）
// 实际项目中应该使用 tiktoken 或类似的库来准确计算
export function estimateTokens(text: string): number {
  // 中文约2字符=1 token，英文约4字符=1 token
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 2 + otherChars / 4);
}

// 计算对话费用
export function calculateChatCost(
  apiConfig: ApiConfig,
  inputTokens: number,
  outputTokens: number
): number {
  const totalTokens = inputTokens + outputTokens;
  const costPerToken = apiConfig.cost_per_1k_tokens / 1000;
  const baseCost = totalTokens * costPerToken;
  // 加上20%利润
  return Math.ceil(baseCost * apiConfig.markup_rate * 10000) / 10000;
}

// 检查并处理余额预警
export async function checkBalanceAlert(userId: string): Promise<{
  shouldAlert: boolean;
  alertMessage?: string;
}> {
  const user = getUserById(userId);
  if (!user) {
    return { shouldAlert: false };
  }

  // 计算预警阈值（余额低于历史最高充值的10%）
  const threshold = user.total_recharged * 0.1;

  if (user.balance > 0 && user.balance <= threshold) {
    // 检查最近1小时内是否已经发过预警
    if (!hasRecentLowBalanceAlert(userId)) {
      createAlert(
        userId,
        'balance_low',
        threshold,
        `余额不足，当前余额 ${user.balance.toFixed(2)}元，低于阈值 ${threshold.toFixed(2)}元`
      );
      return {
        shouldAlert: true,
        alertMessage: `余额不足提醒：当前余额 ${user.balance.toFixed(2)}元，建议及时充值`,
      };
    }
  }

  return { shouldAlert: false };
}

// 扣除用户余额
export function deductBalance(userId: string, amount: number): boolean {
  const user = getUserById(userId);
  if (!user || user.balance < amount) {
    return false;
  }

  updateUserBalance(userId, -amount);
  incrementUserSpent(userId, amount);
  return true;
}

// 聊天计费处理
export async function processChatBilling(
  userId: string,
  apiConfigId: string,
  model: string,
  inputText: string,
  outputTokens: number
): Promise<{
  success: boolean;
  cost?: number;
  error?: string;
  alertMessage?: string;
}> {
  // 获取API配置
  const apiConfig = getActiveApiConfigs(userId).find((c) => c.id === apiConfigId);
  if (!apiConfig) {
    return { success: false, error: 'API配置不存在或已禁用' };
  }

  // 计算输入Token
  const inputTokens = estimateTokens(inputText);

  // 计算费用
  const cost = calculateChatCost(apiConfig, inputTokens, outputTokens);

  // 检查余额
  const user = getUserById(userId);
  if (!user) {
    return { success: false, error: '用户不存在' };
  }

  if (user.balance < cost) {
    return {
      success: false,
      error: `余额不足，需要 ${cost.toFixed(4)}元，当前余额 ${user.balance.toFixed(2)}元`,
    };
  }

  // 扣除余额
  const deducted = deductBalance(userId, cost);
  if (!deducted) {
    return { success: false, error: '扣费失败' };
  }

  // 记录使用日志
  createUsageLog(userId, apiConfigId, model, inputTokens, outputTokens, cost);

  // 检查余额预警
  const alertResult = await checkBalanceAlert(userId);

  return {
    success: true,
    cost,
    alertMessage: alertResult.shouldAlert ? alertResult.alertMessage : undefined,
  };
}

// 获取用户可用的API配置列表（带销售价格）
export function getAvailableApis(userId: string): Array<{
  id: string;
  name: string;
  provider: string;
  model: string;
  cost_per_1k_tokens: number;
  sale_price: number;
  status: string;
}> {
  const configs = getActiveApiConfigs(userId);
  return configs.map((c) => ({
    id: c.id,
    name: c.name,
    provider: c.provider,
    model: c.name.split(' ')[0] || c.name, // 简单提取模型名
    cost_per_1k_tokens: c.cost_per_1k_tokens,
    sale_price: calculateSalePrice(c.cost_per_1k_tokens, c.markup_rate),
    status: c.status,
  }));
}
