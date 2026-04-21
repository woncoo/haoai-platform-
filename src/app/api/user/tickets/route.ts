import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createSupportTicket,
  getSupportTicketsByUser,
} from '@/lib/db';

// GET /api/user/tickets - 获取工单列表
export async function GET() {
  try {
    const user = await requireAuth();
    const tickets = getSupportTicketsByUser(user.id);

    return NextResponse.json({
      success: true,
      tickets: tickets.map((t) => ({
        id: t.id,
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

// POST /api/user/tickets - 创建工单
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { subject, category, description, priority } = body;

    if (!subject || !category || !description) {
      return NextResponse.json(
        { success: false, error: '请填写完整的工单信息' },
        { status: 400 }
      );
    }

    const validCategories = ['question', 'bug', 'refund', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: '无效的工单类别' },
        { status: 400 }
      );
    }

    const ticket = createSupportTicket(user.id, subject, category, description, priority || 'normal');

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        subject: ticket.subject,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        createdAt: ticket.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create ticket error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}