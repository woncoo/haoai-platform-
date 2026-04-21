import { NextRequest, NextResponse } from 'next/server';
import { completeOrder, getOrderById, updateUserBalance, incrementUserRecharged } from '@/lib/db';

function xmlResponse(data: Record<string, string>) {
  const xml = Object.entries(data)
    .map(([k, v]) => `<${k}><![CDATA[${v}]]></${k}>`)
    .join('');
  return new NextResponse(`<xml>${xml}</xml>`, {
    headers: { 'Content-Type': 'text/xml' },
  });
}

// 微信支付回调
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    console.log('微信支付回调:', body);

    // 实际项目中，这里需要解析微信返回的XML并验证签名
    // 为了简化，我们假设收到回调时订单已完成
    // 格式: out_trade_no=ord_xxx&transaction_id=wx_xxx

    const params = new URLSearchParams(body);
    const orderId = params.get('out_trade_no') || params.get('order_id');
    const transactionId = params.get('transaction_id') || `wx_${Date.now()}`;

    if (!orderId) {
      return xmlResponse({ return_code: 'FAIL', return_msg: '订单号为空' });
    }

    const order = getOrderById(orderId);
    if (!order) {
      return xmlResponse({ return_code: 'FAIL', return_msg: '订单不存在' });
    }

    if (order.status === 'completed') {
      // 订单已完成，直接返回成功
      return xmlResponse({ return_code: 'SUCCESS', return_msg: 'OK' });
    }

    // 更新订单状态
    completeOrder(orderId, transactionId);

    // 更新用户余额
    updateUserBalance(order.user_id, order.amount);
    incrementUserRecharged(order.user_id, order.amount);

    console.log(`✅ 微信支付成功: 订单 ${orderId}, 金额 ${order.amount}`);

    return xmlResponse({ return_code: 'SUCCESS', return_msg: 'OK' });
  } catch (error) {
    console.error('微信回调处理错误:', error);
    return xmlResponse({ return_code: 'FAIL', return_msg: '系统错误' });
  }
}