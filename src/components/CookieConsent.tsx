'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // 检查是否已经同意过
    const consented = localStorage.getItem('cookie_consent');
    if (!consented) {
      setShow(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4">
      <div className="max-w-4xl mx-auto rounded-lg shadow-lg p-6"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="font-bold mb-2">🍪 Cookie 使用说明</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              我们使用 Cookie 来改善您的用户体验、分析网站流量和提供个性化服务。
              继续使用即表示您同意我们使用 Cookie。
              <Link href="/privacy" className="underline ml-1">了解更多</Link>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDecline}
              className="px-4 py-2 rounded-lg text-sm"
              style={{ backgroundColor: 'var(--card-border)', color: 'var(--foreground)' }}
            >
              仅必要
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ backgroundColor: 'var(--primary)', color: '#041C1C' }}
            >
              全部接受
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}