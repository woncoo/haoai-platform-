import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getUserById,
  getOrdersByUser,
  getUsageLogsByUser,
  getRefundRequestsByUser,
  getChatMessagesByUser,
  getInvoiceRequestsByUser,
} from '@/lib/db';

// GET /api/user/data-export - 导出用户所有数据（GDPR合规）
export async function GET() {
  try {
    const user = await requireAuth();

    // 获取用户基本信息
    const userData = getUserById(user.id);

    // 获取充值记录
    const orders = getOrdersByUser(user.id);

    // 获取消费记录
    const usageLogs = getUsageLogsByUser(user.id, 1000);

    // 获取退款申请
    const refunds = getRefundRequestsByUser(user.id);

    // 获取对话历史
    const chatMessages = getChatMessagesByUser(user.id, 500);

    // 获取发票申请
    const invoices = getInvoiceRequestsByUser(user.id);

    // 组装导出数据
    const exportData = {
      exportTime: new Date().toISOString(),
      user: {
        id: userData?.id,
        phone: userData?.phone,
        nickname: userData?.nickname,
        balance: userData?.balance,
        totalSpent: userData?.total_spent,
        totalRecharged: userData?.total_recharged,
        status: userData?.status,
        createdAt: userData?.created_at,
      },
      orders: orders.map((o) => ({
        id: o.id,
        amount: o.amount,
        method: o.method,
        status: o.status,
        createdAt: o.created_at,
        completedAt: o.completed_at,
      })),
      usage: usageLogs.map((u) => ({
        id: u.id,
        model: u.model,
        inputTokens: u.input_tokens,
        outputTokens: u.output_tokens,
        cost: u.cost,
        createdAt: u.created_at,
      })),
      refunds: refunds.map((r) => ({
        id: r.id,
        orderId: r.order_id,
        amount: r.amount,
        reason: r.reason,
        status: r.status,
        createdAt: r.created_at,
      })),
      chatMessages: chatMessages.map((m) => ({
        id: m.id,
        model: m.model,
        role: m.role,
        content: m.content,
        cost: m.cost,
        createdAt: m.created_at,
      })),
      invoices: invoices.map((i) => ({
        id: i.id,
        title: i.title,
        amount: i.amount,
        status: i.status,
        createdAt: i.created_at,
      })),
    };

    return NextResponse.json({
      success: true,
      data: exportData,
      message: '数据导出成功',
    });
  } catch (error: any) {
    console.error('Data export error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}