import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createApiConfig,
  getAllApiConfigs,
  getApiConfigById,
  updateApiConfigStatus,
  deleteApiConfig,
  getAllUsers,
  calculateSalePrice,
} from '@/lib/db';

// GET /api/admin/apis - 获取所有API配置
export async function GET() {
  try {
    await requireAuth();
    const configs = getAllApiConfigs();
    const users = getAllUsers();

    // 构建用户ID到昵称的映射
    const userMap = new Map(users.map((u) => [u.id, u.nickname || `用户${u.id.slice(0, 8)}`]));

    return NextResponse.json({
      success: true,
      apis: configs.map((c) => ({
        id: c.id,
        user_id: c.user_id,
        user_name: userMap.get(c.user_id) || '未知用户',
        name: c.name,
        provider: c.provider,
        api_url: c.api_url,
        cost_per_1k_tokens: c.cost_per_1k_tokens,
        markup_rate: c.markup_rate,
        sale_price: calculateSalePrice(c.cost_per_1k_tokens, c.markup_rate),
        status: c.status,
        created_at: c.created_at,
        // 不返回明文API密钥，只显示加密后的格式标识
        api_key_hidden: true,
        api_key_preview: '••••••••',
      })),
    });
  } catch (error: any) {
    console.error('Get APIs error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/admin/apis - 创建新的API配置
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { name, provider, api_url, api_key, cost_per_1k_tokens } = body;

    // 验证必填字段
    if (!name || !provider || !api_url || !api_key || cost_per_1k_tokens === undefined) {
      return NextResponse.json(
        { success: false, error: '请填写完整信息' },
        { status: 400 }
      );
    }

    // 验证成本价格
    if (cost_per_1k_tokens <= 0) {
      return NextResponse.json(
        { success: false, error: '成本价格必须大于0' },
        { status: 400 }
      );
    }

    // 使用admin的ID作为user_id（全局API池）
    const config = await createApiConfig(
      'admin',
      name,
      provider,
      api_url,
      api_key,
      cost_per_1k_tokens
    );

    return NextResponse.json({
      success: true,
      api: {
        id: config.id,
        name: config.name,
        provider: config.provider,
        api_url: config.api_url,
        cost_per_1k_tokens: config.cost_per_1k_tokens,
        markup_rate: config.markup_rate,
        sale_price: calculateSalePrice(config.cost_per_1k_tokens, config.markup_rate),
        status: config.status,
        created_at: config.created_at,
        api_key_hidden: true,
      },
    });
  } catch (error: any) {
    console.error('Create API error:', error);
    return NextResponse.json(
      { success: false, error: '创建失败' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/apis - 更新API状态
export async function PUT(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: '缺少参数' },
        { status: 400 }
      );
    }

    const config = getApiConfigById(id);
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'API配置不存在' },
        { status: 404 }
      );
    }

    updateApiConfigStatus(id, status);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update API error:', error);
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/apis - 删除API配置
export async function DELETE(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: '缺少ID' },
        { status: 400 }
      );
    }

    const config = getApiConfigById(id);
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'API配置不存在' },
        { status: 404 }
      );
    }

    deleteApiConfig(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete API error:', error);
    return NextResponse.json(
      { success: false, error: '删除失败' },
      { status: 500 }
    );
  }
}
