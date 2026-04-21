import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createWebhook,
  getWebhooksByUser,
  deleteWebhook,
} from '@/lib/db';
import crypto from 'crypto';

// GET /api/user/webhooks - 获取Webhook列表
export async function GET() {
  try {
    const user = await requireAuth();
    const webhooks = getWebhooksByUser(user.id);

    return NextResponse.json({
      success: true,
      webhooks: webhooks.map((w) => ({
        id: w.id,
        url: w.url,
        events: JSON.parse(w.events),
        status: w.status,
        createdAt: w.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Get webhooks error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/user/webhooks - 创建Webhook
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { url, events } = body;

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { success: false, error: '请提供URL和事件列表' },
        { status: 400 }
      );
    }

    // 生成secret用于签名验证
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = createWebhook(user.id, url, events, secret);

    return NextResponse.json({
      success: true,
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: JSON.parse(webhook.events),
        secret: webhook.secret,
        status: webhook.status,
        createdAt: webhook.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/user/webhooks - 删除Webhook
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少ID' },
        { status: 400 }
      );
    }

    deleteWebhook(id);

    return NextResponse.json({
      success: true,
      message: 'Webhook已删除',
    });
  } catch (error: any) {
    console.error('Delete webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 触发Webhook事件的内部函数
export async function triggerWebhook(userId: string, event: string, data: any) {
  const webhooks = (await import('@/lib/db')).getActiveWebhooksByEvent(event);

  for (const webhook of webhooks) {
    if (webhook.user_id !== userId) continue;

    const payload = JSON.stringify({
      event,
      timestamp: new Date().toISOString(),
      data,
    });

    // 如果有secret，添加签名
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(payload)
        .digest('hex');
      headers['X-Webhook-Signature'] = signature;
    }

    // 发送webhook（异步，不等待结果）
    fetch(webhook.url, {
      method: 'POST',
      headers,
      body: payload,
    }).catch((err) => {
      console.error(`Webhook delivery failed for ${webhook.url}:`, err);
    });
  }
}