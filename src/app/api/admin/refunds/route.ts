import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getAllRefundRequests,
  getPendingRefundRequests,
  getRefundRequestById,
  approveRefundRequest,
  rejectRefundRequest,
  completeRefund,
  updateUserBalance,
  getUserById,
} from '@/lib/db';

// GET /api/admin/refunds - 获取所有退款申请
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let refunds;
    if (status === 'pending') {
      refunds = getPendingRefundRequests();
    } else {
      refunds = getAllRefundRequests();
    }

    // 获取所有用户
    const { getAllUsers } = await import('@/lib/db');
    const users = getAllUsers();
    const userMap = new Map(users.map((u: any) => [u.id, u.nickname || `用户${u.id.slice(0, 8)}`]));

    return NextResponse.json({
      success: true,
      refunds: refunds.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: userMap.get(r.user_id) || '未知用户',
        orderId: r.order_id,
        amount: r.amount,
        reason: r.reason,
        status: r.status,
        adminNote: r.admin_note,
        createdAt: r.created_at,
        processedAt: r.processed_at,
        processedBy: r.processed_by,
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

// POST /api/admin/refunds - 处理退款申请
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, action, adminNote } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    const refund = getRefundRequestById(id);
    if (!refund) {
      return NextResponse.json(
        { success: false, error: '退款申请不存在' },
        { status: 404 }
      );
    }

    if (refund.status !== 'pending' && action !== 'complete') {
      return NextResponse.json(
        { success: false, error: '该申请已被处理' },
        { status: 400 }
      );
    }

    const adminId = 'admin'; // 实际应从session获取

    if (action === 'approve') {
      approveRefundRequest(id, adminId, adminNote);
      return NextResponse.json({
        success: true,
        message: '退款申请已批准，等待打款',
      });
    }

    if (action === 'reject') {
      rejectRefundRequest(id, adminId, adminNote);
      return NextResponse.json({
        success: true,
        message: '退款申请已拒绝',
      });
    }

    if (action === 'complete') {
      // 执行退款：增加用户余额
      if (refund.status === 'approved') {
        updateUserBalance(refund.user_id, refund.amount);
        completeRefund(id);

        // 更新用户累计充值（退款后减少）
        const dbModule = await import('@/lib/db');
        const db = dbModule.default;
        const stmt = db.prepare(`
          UPDATE users SET total_recharged = total_recharged - ? WHERE id = ?
        `);
        stmt.run(refund.amount, refund.user_id);

        return NextResponse.json({
          success: true,
          message: `已退款 ¥${refund.amount} 到用户账户`,
        });
      } else {
        return NextResponse.json(
          { success: false, error: '只能完成已批准的退款' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: '未知操作' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Process refund error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
