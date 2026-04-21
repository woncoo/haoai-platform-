import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getStats, getAllUsers, getAllApiConfigs, getAllUsageLogs, getOrdersByUser } from '@/lib/db';

// GET /api/admin/stats - 获取统计数据
export async function GET() {
  try {
    await requireAuth();

    const stats = getStats();
    const users = getAllUsers();
    const apiConfigs = getAllApiConfigs();
    const recentUsage = getAllUsageLogs(50);

    // 获取今日收入（通过usage_logs计算）
    const todayRevenue = recentUsage
      .filter((log) => {
        const logDate = new Date(log.created_at).toDateString();
        const today = new Date().toDateString();
        return logDate === today;
      })
      .reduce((sum, log) => sum + log.cost, 0);

    // 获取待处理订单数
    const pendingOrders = users.reduce((sum, user) => {
      const orders = getOrdersByUser(user.id);
      return sum + orders.filter((o) => o.status === 'pending').length;
    }, 0);

    return NextResponse.json({
      success: true,
      stats: {
        total_users: stats.totalUsers,
        total_orders: stats.totalOrders,
        total_recharged: stats.totalRecharged,
        today_messages: stats.todayMessages,
        today_cost: stats.todayCost,
        today_revenue: todayRevenue,
        pending_orders: pendingOrders,
        active_apis: apiConfigs.filter((c) => c.status === 'active').length,
      },
      recent_usage: recentUsage.slice(0, 20),
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
