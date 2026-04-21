/**
 * 会员等级系统
 * 根据累计充值金额自动升级
 */

// 会员等级定义
export const MEMBERSHIP_TIERS = [
  { name: '普通用户', minAmount: 0, discount: 1.0, color: '#999999' },
  { name: '青铜会员', minAmount: 100, discount: 0.98, color: '#cd7f32' },
  { name: '白银会员', minAmount: 500, discount: 0.95, color: '#c0c0c0' },
  { name: '黄金会员', minAmount: 1000, discount: 0.90, color: '#ffd700' },
  { name: '铂金会员', minAmount: 5000, discount: 0.85, color: '#e5e4e2' },
  { name: '钻石会员', minAmount: 10000, discount: 0.80, color: '#b9f2ff' },
] as const;

export type MembershipTierName = typeof MEMBERSHIP_TIERS[number]['name'];

/**
 * 根据累计充值金额获取会员等级
 */
export function getMembershipTier(totalRecharged: number): {
  name: MembershipTierName;
  discount: number;
  color: string;
  nextTier: { name: string; amount: number } | null;
} {
  let currentTier: typeof MEMBERSHIP_TIERS[number] = MEMBERSHIP_TIERS[0];

  for (const tier of MEMBERSHIP_TIERS) {
    if (totalRecharged >= tier.minAmount) {
      currentTier = tier;
    } else {
      break;
    }
  }

  // 找到下一个等级
  const currentIndex = MEMBERSHIP_TIERS.findIndex((t) => t.name === currentTier.name);
  const nextTier =
    currentIndex < MEMBERSHIP_TIERS.length - 1
      ? {
          name: MEMBERSHIP_TIERS[currentIndex + 1].name,
          amount: MEMBERSHIP_TIERS[currentIndex + 1].minAmount,
        }
      : null;

  return {
    name: currentTier.name as MembershipTierName,
    discount: currentTier.discount,
    color: currentTier.color,
    nextTier,
  };
}

/**
 * 计算折扣后的价格
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discount: number
): number {
  return Math.ceil(originalPrice * discount * 10000) / 10000;
}

/**
 * 获取会员特权描述
 */
export function getMembershipBenefits(tierName: MembershipTierName): string[] {
  const benefits: Record<MembershipTierName, string[]> = {
    '普通用户': ['享受标准价格'],
    '青铜会员': ['享受98折优惠', '专属客服支持'],
    '白银会员': ['享受95折优惠', '专属客服支持', '优先响应'],
    '黄金会员': ['享受9折优惠', '专属客服支持', '优先响应', '月度账单'],
    '铂金会员': ['享受85折优惠', '专属客服支持', '优先响应', '月度账单', '定制化报告'],
    '钻石会员': ['享受8折优惠', '专属客服支持', '优先响应', '月度账单', '定制化报告', '年度战略回顾'],
  };

  return benefits[tierName] || ['享受标准价格'];
}
