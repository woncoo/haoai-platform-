import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getUsageLogsByUser, getUserById } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'daily'; // daily, weekly, monthly
    const limit = parseInt(searchParams.get('limit') || '100');

    // 获取用户的消费记录
    const usageLogs = getUsageLogsByUser(user.id, limit);

    // 按日期分组统计
    const statsByDate: Record<string, {
      date: string;
      count: number;
      totalCost: number;
      inputTokens: number;
      outputTokens: number;
    }> = {};

    for (const log of usageLogs as any[]) {
      const date = log.created_at.split(' ')[0];

      if (!statsByDate[date]) {
        statsByDate[date] = {
          date,
          count: 0,
          totalCost: 0,
          inputTokens: 0,
          outputTokens: 0,
        };
      }

      statsByDate[date].count += 1;
      statsByDate[date].totalCost += log.cost;
      statsByDate[date].inputTokens += log.input_tokens || 0;
      statsByDate[date].outputTokens += log.output_tokens || 0;
    }

    // 转换为数组并排序
    const dailyStats = Object.values(statsByDate)
      .map((s) => ({
        ...s,
        totalCost: Math.round(s.totalCost * 100) / 100,
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    // 计算总统计
    const totalStats = {
      totalCost: Math.round(dailyStats.reduce((sum, d) => sum + d.totalCost, 0) * 100) / 100,
      totalCount: dailyStats.reduce((sum, d) => sum + d.count, 0),
      totalInputTokens: dailyStats.reduce((sum, d) => sum + d.inputTokens, 0),
      totalOutputTokens: dailyStats.reduce((sum, d) => sum + d.outputTokens, 0),
    };

    // 获取账户余额
    const currentUser = getUserById(user.id);

    return NextResponse.json({
      success: true,
      currentBalance: currentUser?.balance || 0,
      totalRecharged: currentUser?.total_recharged || 0,
      totalSpent: currentUser?.total_spent || 0,
      period,
      dailyStats,
      totalStats,
      recentLogs: usageLogs.slice(0, 20).map((log: any) => ({
        id: log.id,
        model: log.model,
        inputTokens: log.input_tokens,
        outputTokens: log.output_tokens,
        cost: log.cost,
        createdAt: log.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Get usage error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
