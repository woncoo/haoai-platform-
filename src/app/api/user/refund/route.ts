import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createRefundRequest,
  getRefundRequestsByUser,
  getOrderById,
  getUserById,
  updateUserBalance,
} from '@/lib/db';

// GET /api/user/refund - 获取用户的退款申请
export async function GET() {
  try {
    const user = await requireAuth();
    const requests = getRefundRequestsByUser(user.id);

    return NextResponse.json({
      success: true,
      requests: requests.map((r) => ({
        id: r.id,
        orderId: r.order_id,
        amount: r.amount,
        reason: r.reason,
        status: r.status,
        createdAt: r.created_at,
        processedAt: r.processed_at,
      })),
    });
  } catch (error: any) {
    console.error('Get refunds error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/user/refund - 创建退款申请
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { orderId, reason } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: '请提供订单号' },
        { status: 400 }
      );
    }

    // 验证订单属于该用户且已完成
    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: '订单不存在' },
        { status: 404 }
      );
    }

    if (order.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: '无权申请此订单退款' },
        { status: 403 }
      );
    }

    if (order.status !== 'completed') {
      return NextResponse.json(
        { success: false, error: '只能退款已完成的订单' },
        { status: 400 }
      );
    }

    // 创建退款申请
    const refund = createRefundRequest(user.id, orderId, order.amount, reason || '未说明原因');

    return NextResponse.json({
      success: true,
      refund: {
        id: refund.id,
        orderId: refund.order_id,
        amount: refund.amount,
        status: refund.status,
        createdAt: refund.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create refund error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
