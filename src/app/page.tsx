'use client';

import Link from 'next/link';
import Navigation from './components/Navigation';
import { getModelCategories } from '../lib/models';

const categories = getModelCategories();

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#041C1C', color: '#FFFFFF' }}>
      <Navigation />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-8">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full opacity-20" style={{ backgroundColor: '#0a3030', filter: 'blur(120px)' }} />
          <div className="absolute bottom-20 right-1/4 w-80 h-80 rounded-full opacity-15" style={{ backgroundColor: '#ffe6cb', filter: 'blur(100px)' }} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* 标签 */}
          <div className="inline-block mb-8 px-4 py-2 rounded-full border" style={{ borderColor: '#ffe6cb33' }}>
            <span className="text-sm tracking-widest uppercase" style={{ color: '#ffe6cb' }}>
              Open Source • MIT License
            </span>
          </div>

          {/* 主标题 */}
          <h1 className="text-6xl md:text-8xl font-bold tracking-widest uppercase mb-8" style={{ fontFamily: 'var(--font-mono)' }}>
            <span style={{ color: '#ffe6cb' }}>好AI</span>
            <br />
            <span>An Agent That Grows With You</span>
          </h1>

          {/* 副标题 */}
          <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto leading-relaxed" style={{ color: '#ffe6cb' }}>
            无需翻墙，直接访问GPT-5、Claude 4、Gemini 3等全球顶尖AI模型。
            <br />
            微信/支付宝扫码登录，超值价格，让AI对话更简单。
          </p>

          {/* 安装命令 */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="rounded-2xl p-6 text-left" style={{ backgroundColor: '#0a2828', border: '1px solid #ffe6cb22' }}>
              <div className="text-sm mb-3" style={{ color: '#ffe6cb66' }}># 扫码开始使用</div>
              <code className="text-lg tracking-wide" style={{ fontFamily: 'Courier New, monospace' }}>
                <span style={{ color: '#ffe6cb' }}>¥</span> 0.01 = <span style={{ color: '#ffe6cb' }}>500</span> 字对话
              </code>
            </div>
          </div>

          {/* CTA 按钮 */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="px-8 py-4 text-lg font-bold rounded-lg transition-all hover:opacity-90 tracking-widest uppercase"
              style={{ backgroundColor: '#ffe6cb', color: '#041C1C' }}
            >
              开始聊天 →
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 text-lg font-medium rounded-lg border transition-all hover:bg-white hover:bg-opacity-10 tracking-widest uppercase"
              style={{ borderColor: '#ffe6cb44', color: '#ffe6cb' }}
            >
              查看价格
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-8 border-t" style={{ borderColor: '#ffe6cb11' }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { num: '40+', label: '顶级AI模型' },
              { num: '¥0.004', label: '最低价格' },
              { num: '99.9%', label: '服务可用性' },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-5xl md:text-6xl font-bold tracking-widest mb-2" style={{ color: '#ffe6cb' }}>{stat.num}</div>
                <div className="text-sm tracking-widest uppercase opacity-60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-8 border-t" style={{ borderColor: '#ffe6cb11' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase text-center mb-16" style={{ color: '#ffe6cb' }}>
            核心功能
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🌍',
                title: '全球顶尖模型',
                desc: 'GPT-5、Claude 4、Gemini 3等最新模型，无需VPN直连访问'
              },
              {
                icon: '💳',
                title: '微信/支付宝',
                desc: '扫码即可登录充值，预存金额按需使用，简单便捷'
              },
              {
                icon: '💰',
                title: '超值价格',
                desc: '比官方更优惠的价格，按量计费，用多少充多少'
              },
              {
                icon: '⚡',
                title: '极速响应',
                desc: '优化的API路由，高速稳定的对话体验'
              },
              {
                icon: '🔒',
                title: '安全可靠',
                desc: '专业团队维护，余额永久有效，数据安全加密'
              },
              {
                icon: '💬',
                title: '简单易用',
                desc: '扫码即用，无需注册，一键开始对话'
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl transition-all hover:scale-105"
                style={{
                  backgroundColor: '#0a2828',
                  border: '1px solid #ffe6cb22'
                }}
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold tracking-widest uppercase mb-3">{feature.title}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Models Showcase */}
      <section className="py-24 px-8 border-t" style={{ borderColor: '#ffe6cb11' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase text-center mb-16" style={{ color: '#ffe6cb' }}>
            支持的AI模型
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.slice(0, 6).map((cat) =>
              cat.models.slice(0, 2).map((model) => (
                <div
                  key={model.id}
                  className="p-5 rounded-xl flex items-center gap-4 transition-all hover:scale-102"
                  style={{
                    backgroundColor: '#0a2828',
                    border: '1px solid #ffe6cb22'
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ backgroundColor: `${cat.color}20` }}
                  >
                    {cat.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold tracking-wide truncate">{model.name}</div>
                    <div className="text-sm opacity-60 truncate">{cat.provider}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-bold" style={{ color: '#ffe6cb' }}>¥{model.displayPrice}</div>
                    <div className="text-xs opacity-50">/千字</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-10">
            <Link href="/models" className="btn btn-secondary">
              查看全部40+模型 →
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-24 px-8 border-t" style={{ borderColor: '#ffe6cb11' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase mb-4" style={{ color: '#ffe6cb' }}>
            简单按量计费
          </h2>
          <p className="text-lg opacity-70 mb-16">
            没有月费、没有订阅、没有套路。用多少付多少。
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '简单问答', desc: '约500字对话', price: '¥0.01' },
              { title: '文章写作', desc: '约2000字文章', price: '¥0.04' },
              { title: '代码编写', desc: '约3000字代码', price: '¥0.06' },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 rounded-xl"
                style={{
                  backgroundColor: '#0a2828',
                  border: '1px solid #ffe6cb22'
                }}
              >
                <div className="text-sm mb-2 opacity-60">{item.desc}</div>
                <div className="text-4xl font-bold tracking-widest mb-2" style={{ color: '#ffe6cb' }}>{item.price}</div>
                <div className="text-sm opacity-60">{item.title}</div>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link href="/pricing" className="btn btn-primary btn-large">
              查看详细价格 →
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-8 border-t" style={{ borderColor: '#ffe6cb11' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold tracking-widest uppercase text-center mb-16" style={{ color: '#ffe6cb' }}>
            常见问题
          </h2>

          <div className="space-y-4">
            {[
              { q: '好AI是如何收费的？', a: '按实际使用量计费，没有月费、没有订阅、没有最低消费。用多少充多少，余额永久有效。' },
              { q: '余额有有效期吗？', a: '余额永久有效，随时可用。用多少扣多少，不使用不扣费。' },
              { q: '支持哪些支付方式？', a: '目前支持微信支付和支付宝扫码支付。' },
              { q: '需要翻墙吗？', a: '完全不需要！好AI部署在国内服务器，中国用户可以直接访问所有海外顶级AI模型。' },
              { q: '响应速度如何？', a: '我们接入了各大模型官方API，经过优化的路由确保响应速度快、稳定可靠。' },
            ].map((faq, i) => (
              <details
                key={i}
                className="p-5 rounded-xl"
                style={{
                  backgroundColor: '#0a2828',
                  border: '1px solid #ffe6cb22'
                }}
              >
                <summary className="font-bold tracking-widest uppercase cursor-pointer list-none flex items-center justify-between">
                  <span>{faq.q}</span>
                  <span>▼</span>
                </summary>
                <div className="mt-4 pt-4 border-t opacity-70" style={{ borderColor: '#ffe6cb22' }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-8 border-t" style={{ borderColor: '#ffe6cb11' }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold tracking-widest uppercase mb-8" style={{ color: '#ffe6cb' }}>
            准备好开始了吗？
          </h2>
          <p className="text-xl opacity-80 mb-10">
            扫码支付即可使用，没有任何月费或订阅费<br />
            用多少充多少，余额永久有效
          </p>

          <Link
            href="/login"
            className="inline-block px-10 py-5 text-lg font-bold rounded-lg transition-all hover:scale-105 tracking-widest uppercase"
            style={{ backgroundColor: '#ffe6cb', color: '#041C1C' }}
          >
            扫码登录/充值 →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-8 border-t" style={{ borderColor: '#ffe6cb11' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold tracking-widest" style={{ color: '#ffe6cb' }}>好AI</span>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm tracking-widest uppercase opacity-60">
              <Link href="/" className="hover:opacity-100 transition-opacity">首页</Link>
              <Link href="/chat" className="hover:opacity-100 transition-opacity">聊天</Link>
              <Link href="/pricing" className="hover:opacity-100 transition-opacity">定价</Link>
              <Link href="/models" className="hover:opacity-100 transition-opacity">模型</Link>
              <Link href="/admin" className="hover:opacity-100 transition-opacity">管理后台</Link>
            </div>

            <div className="text-sm opacity-40">
              MIT License · © 2026 好AI
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
