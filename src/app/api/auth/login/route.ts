import { NextRequest, NextResponse } from 'next/server';
import { demoLogin, simulateWechatLogin, simulateAlipayLogin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { method } = body; // 'wechat', 'alipay', 'demo'

    let user;
    switch (method) {
      case 'wechat':
        user = await simulateWechatLogin();
        break;
      case 'alipay':
        user = await simulateAlipayLogin();
        break;
      case 'demo':
      default:
        user = await demoLogin();
        break;
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        balance: user.balance,
        total_spent: user.total_spent,
        status: user.status,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: '登录失败' },
      { status: 500 }
    );
  }
}
