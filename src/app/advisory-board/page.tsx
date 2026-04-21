'use client';

import Navigation from '../components/Navigation';

export default function AdvisoryBoard() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      <main className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              私董会
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
              汇聚顶尖AI专家，打造高端智能社群
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl border"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)'
                }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            className="p-8 rounded-2xl text-center border"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)'
            }}
          >
            <h2 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              加入私董会
            </h2>
            <p className="mb-6" style={{ color: 'var(--text-muted)' }}>
              连接行业精英，共享AI红利
            </p>
            <a
              href="/login"
              className="inline-block px-8 py-4 rounded-xl font-bold text-lg transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)', color: '#041C1C' }}
            >
              立即加入
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

const features = [
  {
    icon: '🤖',
    title: 'AI技能库',
    desc: '汇集全球顶尖AI技能，包括GPT、Claude、Gemini等模型的高级应用技巧'
  },
  {
    icon: '💡',
    title: '实战案例',
    desc: '分享真实商业案例，展示AI在各行业的创新应用场景'
  },
  {
    icon: '🎯',
    title: '专家指导',
    desc: '一对一专家咨询，解决你的具体AI应用难题'
  },
  {
    icon: '🌐',
    title: '人脉网络',
    desc: '加入高质量社群，与行业领袖和创业者建立连接'
  }
];
