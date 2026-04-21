'use client';

import Link from 'next/link';
import { useTheme } from '../providers';
import OtterMascot from '../../components/OtterMascot';

export default function Navigation() {
  const { isDark, toggle } = useTheme();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b backdrop-blur-md"
      style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--card-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <OtterMascot size={36} />
            <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
              好AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--foreground)' }}>
              首页
            </Link>
            <Link href="/chat" className="hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--foreground)' }}>
              开始聊天
            </Link>
            <Link href="/pricing" className="hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--foreground)' }}>
              定价
            </Link>
            <Link href="/models" className="hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--foreground)' }}>
              模型
            </Link>
            <Link href="/advisory-board" className="hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--foreground)' }}>
              私董会
            </Link>
            <Link href="/admin" className="hover:opacity-70 transition-opacity font-medium" style={{ color: 'var(--text-muted)' }}>
              管理后台
            </Link>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:opacity-70 transition-opacity"
              style={{ backgroundColor: 'var(--card-border)' }}
            >
              {isDark ? '☀️' : '🌙'}
            </button>

            <Link
              href="/login"
              className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)', color: '#041C1C' }}
            >
              登录/注册
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
