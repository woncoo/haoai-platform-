import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createQuickPrompt,
  getQuickPromptsByUser,
  updateQuickPrompt,
  deleteQuickPrompt,
} from '@/lib/db';

// GET /api/user/quick-prompts - 获取快捷指令
export async function GET() {
  try {
    const user = await requireAuth();
    const prompts = getQuickPromptsByUser(user.id);

    return NextResponse.json({
      success: true,
      prompts: prompts.map((p) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        createdAt: p.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Get quick prompts error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/user/quick-prompts - 创建快捷指令
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { title, content } = body;

    if (!title || !content) {
      return NextResponse.json(
        { success: false, error: '请提供标题和内容' },
        { status: 400 }
      );
    }

    const prompt = createQuickPrompt(user.id, title, content);

    return NextResponse.json({
      success: true,
      prompt: {
        id: prompt.id,
        title: prompt.title,
        content: prompt.content,
        createdAt: prompt.created_at,
      },
    });
  } catch (error: any) {
    console.error('Create quick prompt error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/user/quick-prompts - 更新快捷指令
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { id, title, content } = body;

    if (!id || !title || !content) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    updateQuickPrompt(id, title, content);

    return NextResponse.json({
      success: true,
      message: '更新成功',
    });
  } catch (error: any) {
    console.error('Update quick prompt error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/user/quick-prompts - 删除快捷指令
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

    deleteQuickPrompt(id);

    return NextResponse.json({
      success: true,
      message: '删除成功',
    });
  } catch (error: any) {
    console.error('Delete quick prompt error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}