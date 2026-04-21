import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getOrdersByUser, getUnacknowledgedAlertsByUser } from '@/lib/db';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    // 获取用户充值记录
    const orders = getOrdersByUser(user.id);

    // 获取未读预警
    const alerts = getUnacknowledgedAlertsByUser(user.id);

    // 计算余额预警阈值（余额低于历史最高充值的10%时预警）
    const maxRecharged = user.total_recharged;
    const lowBalanceThreshold = maxRecharged * 0.1;
    const isLowBalance = user.balance > 0 && user.balance <= lowBalanceThreshold;

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        balance: user.balance,
        total_spent: user.total_spent,
        total_recharged: user.total_recharged,
        status: user.status,
      },
      orders: orders.slice(0, 10), // 最近10条订单
      alerts,
      is_low_balance: isLowBalance,
      low_balance_threshold: lowBalanceThreshold,
    });
  } catch (error) {
    console.error('Get balance error:', error);
    return NextResponse.json(
      { success: false, error: '查询失败' },
      { status: 500 }
    );
  }
}
