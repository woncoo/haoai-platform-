import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import {
  createReferral,
  getReferralsByUser,
  completeReferral,
  updateUserBalance,
  incrementUserRecharged,
} from '@/lib/db';

// 邀请奖励金额
const REFERRAL_REWARD = 10;
const REFERRAL_REQUIREMENT = 100; // 被邀请人需充值满100元

// GET /api/user/referral - 获取邀请记录
export async function GET() {
  try {
    const user = await requireAuth();
    const referrals = getReferralsByUser(user.id);

    // 分类
    const sent = referrals.filter((r) => r.inviter_id === user.id);
    const received = referrals.filter((r) => r.invitee_id === user.id);

    return NextResponse.json({
      success: true,
      referrals: {
        sent: sent.map((r) => ({
          id: r.id,
          inviteeId: r.invitee_id,
          status: r.status,
          reward: r.reward_amount,
          createdAt: r.created_at,
          completedAt: r.completed_at,
        })),
        received: received.map((r) => ({
          id: r.id,
          inviterId: r.inviter_id,
          status: r.status,
          reward: r.reward_amount,
          createdAt: r.created_at,
          completedAt: r.completed_at,
        })),
      },
      stats: {
        totalInvited: sent.length,
        totalEarned: sent
          .filter((r) => r.status === 'completed')
          .reduce((sum, r) => sum + r.reward_amount, 0),
        pendingReward: sent
          .filter((r) => r.status === 'pending')
          .reduce((sum, r) => sum + r.reward_amount, 0),
      },
    });
  } catch (error: any) {
    console.error('Get referral error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/user/referral - 创建邀请记录
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { invitee_id } = body;

    if (!invitee_id) {
      return NextResponse.json(
        { success: false, error: '缺少被邀请人ID' },
        { status: 400 }
      );
    }

    if (invitee_id === user.id) {
      return NextResponse.json(
        { success: false, error: '不能邀请自己' },
        { status: 400 }
      );
    }

    // 检查是否已经邀请过此人
    const existing = getReferralsByUser(user.id);
    const alreadyInvited = existing.some(
      (r) => r.inviter_id === user.id && r.invitee_id === invitee_id
    );

    if (alreadyInvited) {
      return NextResponse.json(
        { success: false, error: '已经邀请过该用户' },
        { status: 400 }
      );
    }

    const referral = createReferral(user.id, invitee_id, REFERRAL_REWARD);

    return NextResponse.json({
      success: true,
      referral: {
        id: referral.id,
        inviteeId: referral.invitee_id,
        reward: referral.reward_amount,
        status: referral.status,
      },
      message: `邀请成功！好友充值满${REFERRAL_REQUIREMENT}元后，你将获得¥${REFERRAL_REWARD}奖励`,
    });
  } catch (error: any) {
    console.error('Create referral error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// 内部函数：检查邀请是否满足条件并发放奖励
export function checkAndCompleteReferral(inviterId: string, inviteeId: string, rechargeAmount: number) {
  if (rechargeAmount >= REFERRAL_REQUIREMENT) {
    const referrals = getReferralsByUser(inviterId);
    const pendingReferral = referrals.find(
      (r) => r.inviter_id === inviterId && r.invitee_id === inviteeId && r.status === 'pending'
    );

    if (pendingReferral) {
      // 发放奖励
      updateUserBalance(inviterId, REFERRAL_REWARD);
      incrementUserRecharged(inviterId, REFERRAL_REWARD);
      completeReferral(pendingReferral.id);
      return true;
    }
  }
  return false;
}