import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getAllInvoiceRequests,
  getPendingInvoiceRequests,
  approveInvoiceRequest,
  issueInvoiceRequest,
  rejectInvoiceRequest,
} from '@/lib/db';

// GET /api/admin/invoices - 获取所有发票申请
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    let invoices;
    if (status === 'pending') {
      invoices = getPendingInvoiceRequests();
    } else {
      invoices = getAllInvoiceRequests();
    }

    // 获取所有用户
    const { getAllUsers } = await import('@/lib/db');
    const users = getAllUsers();
    const userMap = new Map(users.map((u: any) => [u.id, u.nickname || `用户${u.id.slice(0, 8)}`]));

    return NextResponse.json({
      success: true,
      invoices: invoices.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: userMap.get(r.user_id) || '未知用户',
        title: r.title,
        taxId: r.tax_id,
        address: r.address,
        phone: r.phone,
        amount: r.amount,
        status: r.status,
        invoiceNo: r.invoice_no,
        adminNote: r.admin_note,
        createdAt: r.created_at,
        processedAt: r.processed_at,
        issuedAt: r.issued_at,
        processedBy: r.processed_by,
      })),
    });
  } catch (error: any) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/admin/invoices - 处理发票申请
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, action, invoiceNo, adminNote } = body;

    if (!id || !action) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    const invoice = (await import('@/lib/db')).getInvoiceRequestById(id);
    if (!invoice) {
      return NextResponse.json(
        { success: false, error: '发票申请不存在' },
        { status: 404 }
      );
    }

    const adminId = 'admin'; // 实际应从session获取

    if (action === 'approve') {
      if (!invoiceNo) {
        return NextResponse.json(
          { success: false, error: '请提供发票号码' },
          { status: 400 }
        );
      }
      approveInvoiceRequest(id, adminId, invoiceNo);
      return NextResponse.json({
        success: true,
        message: '发票申请已批准',
      });
    }

    if (action === 'issue') {
      issueInvoiceRequest(id, adminId);
      return NextResponse.json({
        success: true,
        message: '发票已开具',
      });
    }

    if (action === 'reject') {
      if (!adminNote) {
        return NextResponse.json(
          { success: false, error: '请提供拒绝原因' },
          { status: 400 }
        );
      }
      rejectInvoiceRequest(id, adminId, adminNote);
      return NextResponse.json({
        success: true,
        message: '发票申请已拒绝',
      });
    }

    return NextResponse.json(
      { success: false, error: '未知操作' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Process invoice error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}