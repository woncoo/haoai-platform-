import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createInvoiceRequest,
  getInvoiceRequestsByUser,
  getUserTotalInvoicedAmount,
} from '@/lib/db';

// GET /api/user/invoice - 获取用户的发票申请
export async function GET() {
  try {
    const user = await requireAuth();
    const requests = getInvoiceRequestsByUser(user.id);
    const totalInvoiced = getUserTotalInvoicedAmount(user.id);

    return NextResponse.json({
      success: true,
      requests: requests.map((r) => ({
        id: r.id,
        title: r.title,
        taxId: r.tax_id,
        address: r.address,
        phone: r.phone,
        amount: r.amount,
        status: r.status,
        invoiceNo: r.invoice_no,
        createdAt: r.created_at,
        processedAt: r.processed_at,
      })),
      totalInvoiced,
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/user/invoice - 创建发票申请
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, amount, taxId, address, phone } = body;

    if (!title || !amount) {
      return NextResponse.json(
        { success: false, error: '请提供发票抬头和金额' },
        { status: 400 }
      );
    }

    // 验证金额（发票金额必须大于0且小于等于用户累计充值）
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: '发票金额必须大于0' },
        { status: 400 }
      );
    }

    // 检查用户累计充值金额
    const { getUserById } = await import('@/lib/db');
    const userData = getUserById(user.id);
    if (!userData || userData.total_recharged < amount) {
      return NextResponse.json(
        { success: false, error: `发票金额不能超过累计充值金额（¥${userData?.total_recharged || 0}）` },
        { status: 400 }
      );
    }

    // 创建发票申请
    const invoice = createInvoiceRequest(
      user.id,
      title,
      amount,
      taxId,
      address,
      phone
    );

    return NextResponse.json({
      success: true,
      invoice: {
        id: invoice.id,
        title: invoice.title,
        amount: invoice.amount,
        status: invoice.status,
        createdAt: invoice.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}