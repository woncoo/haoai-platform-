import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  getUserBudget,
  setUserBudget,
  getUserSpendingInPeriod,
} from '@/lib/db';

// GET /api/user/budget - 获取预算信息
export async function GET() {
  try {
    const user = await requireAuth();
    const budget = getUserBudget(user.id);

    if (!budget) {
      return NextResponse.json({
        success: true,
        budget: {
          monthly_limit: 0,
          daily_limit: 0,
          alert_threshold: 0.8,
        },
        spending: {
          daily: getUserSpendingInPeriod(user.id, 'daily'),
          monthly: getUserSpendingInPeriod(user.id, 'monthly'),
        },
      });
    }

    return NextResponse.json({
      success: true,
      budget: {
        monthly_limit: budget.monthly_limit,
        daily_limit: budget.daily_limit,
        alert_threshold: budget.alert_threshold,
      },
      spending: {
        daily: getUserSpendingInPeriod(user.id, 'daily'),
        monthly: getUserSpendingInPeriod(user.id, 'monthly'),
      },
    });
  } catch (error: any) {
    console.error('Get budget error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/user/budget - 设置预算
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { monthly_limit, daily_limit, alert_threshold } = body;

    if (monthly_limit < 0 || daily_limit < 0) {
      return NextResponse.json(
        { success: false, error: '预算金额不能为负数' },
        { status: 400 }
      );
    }

    setUserBudget(
      user.id,
      monthly_limit || 0,
      daily_limit || 0,
      alert_threshold || 0.8
    );

    return NextResponse.json({
      success: true,
      message: '预算设置成功',
    });
  } catch (error: any) {
    console.error('Set budget error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}