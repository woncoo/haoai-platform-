import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  detectAnomalousUsage,
  getUserApiStats,
} from '@/lib/db';

// GET /api/admin/anomaly - 检测异常使用
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('user_id');
    const hours = parseInt(searchParams.get('hours') || '24');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: '缺少用户ID' },
        { status: 400 }
      );
    }

    const anomaly = detectAnomalousUsage(userId);
    const stats = getUserApiStats(userId, hours);

    return NextResponse.json({
      success: true,
      isAnomalous: anomaly.isAnomalous,
      reason: anomaly.reason,
      stats: stats.map((s) => ({
        hourKey: s.hour_key,
        requestCount: s.request_count,
        totalTokens: s.total_tokens,
        totalCost: s.total_cost,
        avgResponseTime: s.avg_response_time,
      })),
    });
  } catch (error: any) {
    console.error('Detect anomaly error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}