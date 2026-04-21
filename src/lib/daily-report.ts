/**
 * 每日报表生成器
 * 生成清晰的日报邮件内容
 */

import {
  getAllUsers,
  getAllApiConfigs,
  getOrdersByUser,
  getUsageLogsByUser,
  getAllUsageLogs,
} from './db';
import db from './db';

export interface DailyReport {
  date: string;
  // 充值统计
  totalRecharge: number;
  rechargeCount: number;
  // 消费统计
  totalConsumption: number;
  consumptionCount: number;
  // 用户详情
  userStats: UserStat[];
  // 平台余额
  platformBalance: number;
  // API余额
  apiBalances: ApiBalance[];
  // 预警
  warnings: string[];
  // 预估
  predictions: Prediction[];
}

export interface UserStat {
  userId: string;
  nickname: string;
  startBalance: number;
  recharge: number;
  consumption: number;
  endBalance: number;
  transactionCount: number;
}

export interface ApiBalance {
  name: string;
  provider: string;
  // 这个信息可能需要从API提供商获取
  // 目前是占位符
  estimatedRemaining: string;
}

export interface Prediction {
  type: 'recharge_needed' | 'api_balance_low' | 'consumption_high';
  message: string;
  urgency: 'low' | 'medium' | 'high';
}

// 获取日期范围内的订单
function getOrdersByDateRange(startDate: string, endDate: string) {
  const stmt = db.prepare(`
    SELECT * FROM orders
    WHERE status = 'completed'
    AND completed_at BETWEEN ? AND ?
    ORDER BY completed_at DESC
  `);
  return stmt.all(startDate, endDate);
}

// 获取日期范围内的消费记录
function getUsageByDateRange(startDate: string, endDate: string) {
  const stmt = db.prepare(`
    SELECT * FROM usage_logs
    WHERE created_at BETWEEN ? AND ?
    ORDER BY created_at DESC
  `);
  return stmt.all(startDate, endDate);
}

// 生成每日报表
export function generateDailyReport(date: Date = new Date()): DailyReport {
  // 计算日期范围（昨天00:00:00 到 23:59:59）
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const startOfDay = `${yesterday.toISOString().split('T')[0]} 00:00:00`;
  const endOfDay = `${yesterday.toISOString().split('T')[0]} 23:59:59`;

  const dateStr = yesterday.toISOString().split('T')[0];

  // 获取昨日充值
  const yesterdayOrders = getOrdersByDateRange(startOfDay, endOfDay) as any[];
  const totalRecharge = yesterdayOrders.reduce((sum, o) => sum + o.amount, 0);
  const rechargeCount = yesterdayOrders.length;

  // 获取昨日消费
  const yesterdayUsage = getUsageByDateRange(startOfDay, endOfDay) as any[];
  const totalConsumption = yesterdayUsage.reduce((sum, u) => sum + u.cost, 0);
  const consumptionCount = yesterdayUsage.length;

  // 获取所有用户和他们的消费
  const users = getAllUsers() as any[];
  const userStats: UserStat[] = [];

  for (const user of users) {
    const userOrders = yesterdayOrders.filter((o) => o.user_id === user.id);
    const userUsage = yesterdayUsage.filter((u) => u.user_id === user.id);

    const recharge = userOrders.reduce((sum, o) => sum + o.amount, 0);
    const consumption = userUsage.reduce((sum, u) => sum + u.cost, 0);

    // 计算昨日开始时的余额（= 当前余额 - 昨日充值 + 昨日消费）
    const startBalance = user.balance - recharge + consumption;

    if (recharge > 0 || consumption > 0 || user.balance > 0) {
      userStats.push({
        userId: user.id,
        nickname: user.nickname || `用户${user.id.slice(0, 8)}`,
        startBalance: Math.round(startBalance * 100) / 100,
        recharge: Math.round(recharge * 100) / 100,
        consumption: Math.round(consumption * 100) / 100,
        endBalance: Math.round(user.balance * 100) / 100,
        transactionCount: userUsage.length,
      });
    }
  }

  // 按消费金额排序
  userStats.sort((a, b) => b.consumption - a.consumption);

  // 平台余额（所有用户余额总和）
  const platformBalance = users.reduce((sum, u) => sum + u.balance, 0);

  // API余额（占位符，需要从API提供商获取）
  const apiConfigs = getAllApiConfigs() as any[];
  const apiBalances: ApiBalance[] = apiConfigs.map((api) => ({
    name: api.name,
    provider: api.provider,
    estimatedRemaining: '需手动查询',
  }));

  // 生成预警
  const warnings: string[] = [];

  // 余额不足预警
  const lowBalanceUsers = users.filter((u) => u.balance < 10 && u.balance > 0);
  if (lowBalanceUsers.length > 0) {
    warnings.push(`⚠️ ${lowBalanceUsers.length}个用户余额低于10元`);
  }

  // 零余额用户
  const zeroBalanceUsers = users.filter((u) => u.balance === 0);
  if (zeroBalanceUsers.length > 0) {
    warnings.push(`⚠️ ${zeroBalanceUsers.length}个用户余额为0（已停用）`);
  }

  // 生成预估
  const predictions: Prediction[] = [];

  // 充值预估
  if (totalConsumption > 0 && platformBalance < totalConsumption * 3) {
    predictions.push({
      type: 'recharge_needed',
      message: `按当前消费速度，平台余额预计${Math.ceil(platformBalance / (totalConsumption || 1))}天后耗尽，建议及时充值`,
      urgency: platformBalance < totalConsumption ? 'high' : 'medium',
    });
  }

  // 高消费预警
  if (totalConsumption > 100) {
    predictions.push({
      type: 'consumption_high',
      message: `昨日消费较高（¥${totalConsumption.toFixed(2)}），请关注异常情况`,
      urgency: 'low',
    });
  }

  return {
    date: dateStr,
    totalRecharge: Math.round(totalRecharge * 100) / 100,
    rechargeCount,
    totalConsumption: Math.round(totalConsumption * 100) / 100,
    consumptionCount,
    userStats,
    platformBalance: Math.round(platformBalance * 100) / 100,
    apiBalances,
    warnings,
    predictions,
  };
}

// 生成 HTML 报表
export function generateReportHtml(report: DailyReport): string {
  const formatMoney = (n: number) => `¥${n.toFixed(2)}`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>好AI - ${report.date} 日报</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; color: #333; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #8ebf69; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    .date { color: #999; font-size: 14px; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
    .card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
    .card-value { font-size: 28px; font-weight: bold; color: #8ebf69; }
    .card-label { color: #666; font-size: 14px; margin-top: 5px; }
    .warning { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #ffc107; }
    .prediction { background: #d1ecf1; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #17a2b8; }
    .prediction.high { background: #f8d7da; border-color: #dc3545; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f5f5f5; font-weight: 600; }
    tr:hover { background: #fafafa; }
    .amount { font-weight: bold; }
    .amount.positive { color: #28a745; }
    .amount.negative { color: #dc3545; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 12px; }
    .api-section { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 15px 0; }
  </style>
</head>
<body>
  <h1>🦦 好AI 日报</h1>
  <p class="date">📅 ${report.date}</p>

  <div class="summary">
    <div class="card">
      <div class="card-value">${formatMoney(report.totalRecharge)}</div>
      <div class="card-label">昨日充值</div>
    </div>
    <div class="card">
      <div class="card-value">${report.rechargeCount}</div>
      <div class="card-label">充值笔数</div>
    </div>
    <div class="card">
      <div class="card-value">${formatMoney(report.totalConsumption)}</div>
      <div class="card-label">昨日消费</div>
    </div>
    <div class="card">
      <div class="card-value">${formatMoney(report.platformBalance)}</div>
      <div class="card-label">平台余额</div>
    </div>
  </div>

  ${report.warnings.length > 0 ? `
  <div class="warning">
    <strong>⚠️ 系统预警</strong>
    <ul style="margin: 10px 0 0 20px;">
      ${report.warnings.map((w) => `<li>${w}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  ${report.predictions.length > 0 ? `
  <div class="prediction ${report.predictions.some((p) => p.urgency === 'high') ? 'high' : ''}">
    <strong>📊 运营预估</strong>
    <ul style="margin: 10px 0 0 20px;">
      ${report.predictions.map((p) => `<li>${p.message}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <h2>📋 用户消费明细</h2>
  <p style="color: #666; font-size: 14px;">共 ${report.userStats.length} 个用户</p>

  <table>
    <thead>
      <tr>
        <th>用户</th>
        <th>昨日开始余额</th>
        <th>昨日充值</th>
        <th>昨日消费</th>
        <th>当前余额</th>
        <th>调用次数</th>
      </tr>
    </thead>
    <tbody>
      ${report.userStats.length === 0 ? `
      <tr>
        <td colspan="6" style="text-align: center; color: #999;">暂无数据</td>
      </tr>
      ` : report.userStats.map((u) => `
      <tr>
        <td>${u.nickname}</td>
        <td class="${u.startBalance >= 0 ? 'positive' : 'negative'}">${formatMoney(u.startBalance)}</td>
        <td class="amount positive">${u.recharge > 0 ? '+' + formatMoney(u.recharge) : '-'}</td>
        <td class="amount negative">${u.consumption > 0 ? '-' + formatMoney(u.consumption) : '-'}</td>
        <td class="${u.endBalance >= 0 ? 'positive' : 'negative'}"><strong>${formatMoney(u.endBalance)}</strong></td>
        <td>${u.transactionCount}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>🔑 API配置状态</h2>
  <div class="api-section">
    <table>
      <thead>
        <tr>
          <th>API名称</th>
          <th>提供商</th>
          <th>状态</th>
        </tr>
      </thead>
      <tbody>
        ${report.apiBalances.map((api) => `
        <tr>
          <td>${api.name}</td>
          <td>${api.provider}</td>
          <td>${api.estimatedRemaining}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
    <p style="color: #666; font-size: 12px; margin-top: 10px;">
      * API余额需要登录各提供商后台手动查询
    </p>
  </div>

  <div class="footer">
    <p>本报表由好AI系统自动生成</p>
    <p>如有问题请联系管理员</p>
  </div>
</body>
</html>
  `;
}
