import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createCoupon,
  getCouponByCode,
  getAllInvoiceRequests,
} from '@/lib/db';

// GET /api/admin/coupons - 获取优惠券列表
export async function GET() {
  try {
    await requireAuth();

    // 获取所有已创建的优惠券（这里简化处理，实际应查询数据库）
    const coupons = (global as any).__coupons || [];

    return NextResponse.json({
      success: true,
      coupons,
    });
  } catch (error: any) {
    console.error('Get coupons error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/admin/coupons - 创建优惠券
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const {
      code,
      type,
      value,
      min_amount,
      max_discount,
      valid_from,
      valid_until,
      usage_limit,
    } = body;

    if (!code || !type || !value) {
      return NextResponse.json(
        { success: false, error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 检查优惠券代码是否已存在
    const existing = getCouponByCode(code);
    if (existing) {
      return NextResponse.json(
        { success: false, error: '优惠券代码已存在' },
        { status: 400 }
      );
    }

    const coupon = createCoupon(
      code,
      type,
      value,
      min_amount || 0,
      max_discount || 0,
      valid_from,
      valid_until,
      usage_limit || 1
    );

    return NextResponse.json({
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        min_amount: coupon.min_amount,
        max_discount: coupon.max_discount,
        valid_from: coupon.valid_from,
        valid_until: coupon.valid_until,
        usage_limit: coupon.usage_limit,
        status: coupon.status,
      },
    });
  } catch (error: any) {
    console.error('Create coupon error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}