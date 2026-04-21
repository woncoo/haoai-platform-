import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getChatMessagesByUser,
  searchChatMessages,
  saveChatMessage,
  clearChatHistory,
} from '@/lib/db';

// GET /api/user/chat-history - 获取对话历史
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');
    const limit = parseInt(searchParams.get('limit') || '100');

    let messages;
    if (keyword) {
      messages = searchChatMessages(user.id, keyword, limit);
    } else {
      messages = getChatMessagesByUser(user.id, limit);
    }

    return NextResponse.json({
      success: true,
      messages: messages.map((m) => ({
        id: m.id,
        model: m.model,
        role: m.role,
        content: m.content,
        tokens: m.tokens,
        cost: m.cost,
        createdAt: m.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Get chat history error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// DELETE /api/user/chat-history - 清空对话历史
export async function DELETE() {
  try {
    const user = await requireAuth();
    clearChatHistory(user.id);
    return NextResponse.json({
      success: true,
      message: '对话历史已清空',
    });
  } catch (error: any) {
    console.error('Clear chat history error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}