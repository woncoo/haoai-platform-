import { cookies } from 'next/headers';
import { getOrCreateUser, User } from './db';

const USER_COOKIE_NAME = 'haoai_user_id';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30天

// 获取当前登录用户
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(USER_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  return getOrCreateUser(userId);
}

// 设置用户登录Cookie
export async function setUserCookie(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(USER_COOKIE_NAME, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// 清除用户Cookie
export async function clearUserCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(USER_COOKIE_NAME);
}

// 生成唯一用户ID（用于模拟登录）
export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// 模拟微信扫码登录
export async function simulateWechatLogin(code?: string): Promise<User> {
  // 模拟微信登录，生成一个唯一ID
  const userId = generateUserId();
  const user = getOrCreateUser(userId);
  await setUserCookie(userId);
  return user;
}

// 模拟支付宝扫码登录
export async function simulateAlipayLogin(code?: string): Promise<User> {
  // 模拟支付宝登录，生成一个唯一ID
  const userId = generateUserId();
  const user = getOrCreateUser(userId);
  await setUserCookie(userId);
  return user;
}

// Demo登录（跳过扫码直接登录）
export async function demoLogin(): Promise<User> {
  const userId = 'demo_user_001';
  const user = getOrCreateUser(userId);
  await setUserCookie(userId);
  return user;
}

// 登出
export async function logout() {
  await clearUserCookie();
}

// 检查用户是否登录（用于API保护）
export async function requireAuth(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('未登录，请先扫码登录');
  }
  if (user.status === 'banned') {
    throw new Error('账号已被封禁');
  }
  return user;
}
