import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getAllSupportTickets,
  updateSupportTicket,
} from '@/lib/db';

// GET /api/admin/tickets - 获取所有工单
export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    const tickets = getAllSupportTickets(status || undefined);

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
        userId: t.user_id,
        subject: t.subject,
        category: t.category,
        priority: t.priority,
        status: t.status,
        description: t.description,
        adminNote: t.admin_note,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        closedAt: t.closed_at,
      })),
    });
  } catch (error: any) {
    console.error('Get tickets error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/admin/tickets - 处理工单
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, action, admin_note } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    const validActions = ['pending', 'resolved', 'closed'];
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: '无效的操作' },
        { status: 400 }
      );
    }

    updateSupportTicket(id, {
      status: action,
      admin_note: admin_note,
    });

    return NextResponse.json({
      success: true,
      message: '工单已更新',
    });
  } catch (error: any) {
    console.error('Update ticket error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}