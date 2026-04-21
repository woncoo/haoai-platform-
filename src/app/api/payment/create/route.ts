import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createOrder } from '@/lib/db';
import { getMembershipTier, MEMBERSHIP_TIERS } from '@/lib/membership';

// 充值优惠活动
const RECHARGE_BONUSES = [
  { amount: 100, bonus: 0 },      // 充100无优惠
  { amount: 200, bonus: 10 },     // 充200送10
  { amount: 500, bonus: 50 },     // 充500送50
  { amount: 1000, bonus: 120 },   // 充1000送120
  { amount: 2000, bonus: 300 },   // 充2000送300
  { amount: 5000, bonus: 800 },   // 充5000送800
] as const;

function getRechargeBonus(amount: number): number {
  let bonus = 0;
  for (const config of RECHARGE_BONUSES) {
    if (amount >= config.amount) {
      bonus = config.bonus;
    }
  }
  return bonus;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: '请先登录' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, method } = body;

    // 验证金额
    if (!amount || amount < 1 || amount > 10000) {
      return NextResponse.json(
        { success: false, error: '金额必须在1-10000元之间' },
        { status: 400 }
      );
    }

    // 验证支付方式
    if (!['wechat', 'alipay'].includes(method)) {
      return NextResponse.json(
        { success: false, error: '支付方式无效' },
        { status: 400 }
      );
    }

    // 获取会员等级和折扣
    const tier = getMembershipTier(user.total_recharged);

    // 计算优惠
    const bonus = getRechargeBonus(amount);
    const memberDiscount = amount * (1 - tier.discount);
    const finalAmount = amount + bonus - memberDiscount;

    // 创建订单
    const order = createOrder(user.id, Number(finalAmount.toFixed(2)), method);

    // 生成模拟二维码URL
    const qrCode = method === 'wechat'
      ? `weixin://wxpay/bizpayurl?orderId=${order.id}`
      : `alipay://alipayqr?orderId=${order.id}`;

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        originalAmount: amount,
        bonus: bonus,
        memberDiscount: Number(memberDiscount.toFixed(2)),
        finalAmount: Number(finalAmount.toFixed(2)),
        method: order.method,
        status: order.status,
        qr_code: qrCode,
      },
      membership: {
        currentTier: tier.name,
        discount: tier.discount,
        nextTier: tier.nextTier,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { success: false, error: '创建订单失败' },
      { status: 500 }
    );
  }
}

// GET 获取充值优惠信息
export async function GET() {
  try {
    const user = await getCurrentUser();

    let membership = {
      currentTier: '普通用户',
      discount: 1.0,
      nextTier: { name: '青铜会员', amount: 100 },
    };

    if (user) {
      const tier = getMembershipTier(user.total_recharged);
      membership = {
        currentTier: tier.name,
        discount: tier.discount,
        nextTier: tier.nextTier || { name: '最高等级', amount: 0 },
      };
    }

    return NextResponse.json({
      success: true,
      rechargeBonus: RECHARGE_BONUSES,
      membership,
    });
  } catch (error) {
    console.error('Get recharge info error:', error);
    return NextResponse.json(
      { success: false, error: '获取失败' },
      { status: 500 }
    );
  }
}
