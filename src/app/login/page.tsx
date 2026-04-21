'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const { isDark, toggle } = { isDark: false, toggle: () => {} }; // 默认主题
  const [step, setStep] = useState<'scan' | 'paid'>('scan');
  const [selectedAmount, setSelectedAmount] = useState(50);
  const [loginLoading, setLoginLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);

  const amounts = [30, 50, 100, 200];

  // 检查是否已登录
  useEffect(() => {
    checkLoginStatus();
  }, []);

  // 轮询订单状态
  useEffect(() => {
    if (!orderId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch('/api/user/balance');
        const data = await res.json();
        if (data.success && data.orders?.some((o: any) => o.id === orderId && o.status === 'completed')) {
          setStep('paid');
          clearInterval(pollInterval);
        }
      } catch (error) {
        console.error('Poll error:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [orderId]);

  const checkLoginStatus = async () => {
    try {
      const res = await fetch('/api/user/balance');
      const data = await res.json();
      if (data.success) {
        // 已登录，跳过登录步骤
        if (data.user.balance > 0) {
          router.push('/chat');
        }
      }
    } catch (error) {
      // 未登录，继续
    }
  };

  const handleLogin = async (method: 'wechat' | 'alipay' | 'demo') => {
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method }),
      });
      const data = await res.json();

      if (data.success) {
        if (method === 'demo') {
          // Demo登录直接跳转
          router.push('/chat');
        } else {
          // 扫码登录后进入充值流程
          setStep('scan');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('登录失败，请重试');
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePayment = async (method: 'wechat' | 'alipay') => {
    setPaymentLoading(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedAmount,
          method,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setOrderId(data.order.id);
        setQrCode(data.order.qr_code);
        // 模拟支付成功（2秒后自动完成）
        setTimeout(() => {
          setStep('paid');
        }, 2000);
      } else {
        alert(data.error || '创建订单失败');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('支付失败，请重试');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-md w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <span className="text-4xl">🦦</span>
          <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>好AI</span>
        </Link>

        <div className="p-8 rounded-2xl border" style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
          {step === 'scan' ? (
            <>
              <h1 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--foreground)' }}>
                扫码登录/注册
              </h1>
              <p className="text-center mb-6" style={{ color: 'var(--text-muted)' }}>
                微信或支付宝扫码即可登录
              </p>

              {/* QR Code */}
              <div className="bg-white rounded-xl p-8 mb-6 flex items-center justify-center">
                {qrCode ? (
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-dashed flex items-center justify-center mb-2" style={{ borderColor: '#8ebf69' }}>
                      <span className="text-6xl">📱</span>
                    </div>
                    <p className="text-sm" style={{ color: '#666' }}>订单已创建，请扫码支付</p>
                    <p className="text-xs mt-1" style={{ color: '#999' }}>模拟支付，2秒后自动完成</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="w-48 h-48 border-2 border-dashed flex items-center justify-center mb-2" style={{ borderColor: '#8ebf69' }}>
                      <span className="text-6xl">📱</span>
                    </div>
                    <p className="text-sm" style={{ color: '#666' }}>模拟二维码</p>
                  </div>
                )}
              </div>

              {/* Payment Amount */}
              <div className="mb-6">
                <p className="text-sm mb-3" style={{ color: 'var(--text-muted)' }}>选择充值金额（可选）</p>
                <div className="grid grid-cols-4 gap-2">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setSelectedAmount(amt)}
                      className={`p-3 rounded-lg text-center transition-all ${
                        selectedAmount === amt ? 'border-2' : 'border'
                      }`}
                      style={{
                        borderColor: selectedAmount === amt ? 'var(--primary)' : 'var(--card-border)',
                        backgroundColor: selectedAmount === amt ? `${isDark ? '8ebf69' : '8ebf69'}15` : 'transparent',
                      }}
                    >
                      <div className="font-bold" style={{ color: 'var(--foreground)' }}>¥{amt}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        实际¥{amt}
                      </div>
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                  * 扫码后将跳转至{selectedAmount}元充值页面
                </p>
              </div>

              {/* Login Buttons */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => handlePayment('wechat')}
                  disabled={paymentLoading}
                  className="p-4 rounded-xl border flex flex-col items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <span className="text-3xl">💚</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>微信支付</span>
                </button>
                <button
                  onClick={() => handlePayment('alipay')}
                  disabled={paymentLoading}
                  className="p-4 rounded-xl border flex flex-col items-center gap-2 transition-all hover:scale-105 disabled:opacity-50"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <span className="text-3xl">💙</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>支付宝</span>
                </button>
              </div>

              <div className="text-center text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
                或先登录，稍后充值
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleLogin('wechat')}
                  disabled={loginLoading}
                  className="p-3 rounded-xl border transition-all hover:scale-105 disabled:opacity-50"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>微信登录</span>
                </button>
                <button
                  onClick={() => handleLogin('alipay')}
                  disabled={loginLoading}
                  className="p-3 rounded-xl border transition-all hover:scale-105 disabled:opacity-50"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>支付宝登录</span>
                </button>
              </div>

              <p className="text-xs text-center mt-6" style={{ color: 'var(--text-muted)' }}>
                登录即表示同意<span style={{ color: 'var(--primary)' }}>《用户协议》</span>和<span style={{ color: 'var(--primary)' }}>《隐私政策》</span>
              </p>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                支付成功！
              </h2>
              <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
                欢迎回来！即将跳转至聊天页面...
              </p>
              <Link
                href="/chat"
                className="inline-block px-6 py-3 rounded-xl font-medium"
                style={{ backgroundColor: 'var(--primary)', color: '#fff' }}
              >
                开始聊天 →
              </Link>
            </div>
          )}
        </div>

        {/* Demo Button */}
        <div className="mt-4 text-center">
          <button
            onClick={() => handleLogin('demo')}
            disabled={loginLoading}
            className="text-sm underline disabled:opacity-50"
            style={{ color: 'var(--text-muted)' }}
          >
            {loginLoading ? '登录中...' : '[Demo] 跳过登录直接进入'}
          </button>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm hover:underline" style={{ color: 'var(--text-muted)' }}>
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  );
}
