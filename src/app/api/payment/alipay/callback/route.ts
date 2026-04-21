import { NextRequest, NextResponse } from 'next/server';
import { completeOrder, getOrderById, updateUserBalance, incrementUserRecharged } from '@/lib/db';

// 支付宝支付回调
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('支付宝支付回调:', body);

    // 实际项目中，这里需要解析支付宝返回的参数并验证签名
    // 为了简化，我们假设收到回调时订单已完成
    // 格式: out_trade_no=ord_xxx&trade_no=alipay_xxx

    const params = new URLSearchParams(body);
    const orderId = params.get('out_trade_no') || params.get('order_id');
    const transactionId = params.get('trade_no') || `alipay_${Date.now()}`;

    if (!orderId) {
      return NextResponse.json({ code: 'FAIL', msg: '订单号为空' });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ code: 'FAIL', msg: '订单不存在' });
    }

    if (order.status === 'completed') {
      // 订单已完成，直接返回成功
      return NextResponse.json({ code: 'SUCCESS', msg: '成功' });
    }

    // 更新订单状态
    completeOrder(orderId, transactionId);

    // 更新用户余额
    updateUserBalance(order.user_id, order.amount);
    incrementUserRecharged(order.user_id, order.amount);

    console.log(`✅ 支付宝支付成功: 订单 ${orderId}, 金额 ${order.amount}`);

    return NextResponse.json({ code: 'SUCCESS', msg: '成功' });
  } catch (error) {
    console.error('支付宝回调处理错误:', error);
    return NextResponse.json({ code: 'FAIL', msg: '系统错误' });
  }
}
