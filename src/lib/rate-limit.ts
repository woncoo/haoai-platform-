/**
 * 速率限制器 - 防止API滥用和暴力计费测试
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blockedUntil: number;
}

const rateLimits = new Map<string, RateLimitEntry>();

// 速率限制配置
const RATE_LIMIT_WINDOW = 60 * 1000; // 1分钟窗口
const RATE_LIMIT_MAX = 30; // 每分钟最多30次调用
const RATE_LIMIT_BLOCK_DURATION = 5 * 60 * 1000; // 封锁5分钟

/**
 * 检查速率限制
 * @param identifier 用户ID或IP
 * @returns 是否允许请求
 */
export function checkRateLimit(identifier: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimits.get(identifier);

  // 如果被封锁
  if (entry?.blockedUntil && now < entry.blockedUntil) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.blockedUntil - now) / 1000)
    };
  }

  // 如果窗口过期，重置
  if (!entry || now > entry.resetTime) {
    rateLimits.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
      blockedUntil: 0,
    });
    return { allowed: true };
  }

  // 增加计数
  entry.count++;

  // 检查是否超过限制
  if (entry.count > RATE_LIMIT_MAX) {
    entry.blockedUntil = now + RATE_LIMIT_BLOCK_DURATION;
    rateLimits.set(identifier, entry);
    return {
      allowed: false,
      retryAfter: RATE_LIMIT_BLOCK_DURATION / 1000
    };
  }

  rateLimits.set(identifier, entry);
  return { allowed: true };
}

/**
 * 清理过期的速率限制记录
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, entry] of rateLimits.entries()) {
    if (now > entry.resetTime && entry.blockedUntil === 0) {
      rateLimits.delete(key);
    }
  }
}

// 每5分钟清理一次过期记录
setInterval(cleanupRateLimits, 5 * 60 * 1000);
