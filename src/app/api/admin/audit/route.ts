import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getAuditLogs } from '@/lib/db';

// GET /api/admin/audit - 获取审计日志
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');
    const userId = searchParams.get('user_id');
    const limit = parseInt(searchParams.get('limit') || '100');

    const logs = getAuditLogs({
      action: action || undefined,
      userId: userId || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      logs: logs.map((l) => ({
        id: l.id,
        userId: l.user_id,
        action: l.action,
        targetType: l.target_type,
        targetId: l.target_id,
        details: l.details,
        ipAddress: l.ip_address,
        createdAt: l.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Get audit logs error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}