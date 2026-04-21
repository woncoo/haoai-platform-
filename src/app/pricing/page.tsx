import Link from 'next/link';
import Navigation from '../components/Navigation';
import { getModelCategories } from '../../lib/models';

const categories = getModelCategories();

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          超值价格
          <span style={{ color: 'var(--primary)' }}> 按量计费</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          没有月费、没有订阅、没有套路。用多少付多少。
        </p>
      </section>

      {/* Pricing Examples */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12" style={{ color: 'var(--foreground)' }}>
            使用示例
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: '简单问答', desc: '约500字对话', cost: '¥0.01' },
              { title: '文章写作', desc: '约2000字文章', cost: '¥0.04' },
              { title: '代码编写', desc: '约3000字代码', cost: '¥0.06' },
            ].map((item) => (
              <div
                key={item.title}
                className="card text-center"
              >
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{item.desc}</div>
                <div className="text-3xl font-bold mb-2" style={{ color: 'var(--primary)' }}>{item.cost}</div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Model Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-4" style={{ color: 'var(--foreground)' }}>
            各模型价格
          </h2>
          <p className="text-center mb-12" style={{ color: 'var(--text-muted)' }}>
            全部来自官方API，响应快速稳定
          </p>

          {categories.map((cat) => (
            <div key={cat.id} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{cat.icon}</span>
                <h3 className="font-bold" style={{ color: 'var(--foreground)' }}>{cat.name}</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>模型</th>
                      <th>描述</th>
                      <th>上下文</th>
                      <th className="text-right">价格</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cat.models.map((model) => (
                      <tr key={model.id}>
                        <td className="font-medium">{model.name}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{model.desc}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{(model.contextWindow / 1000).toFixed(0)}K</td>
                        <td className="text-right font-bold" style={{ color: 'var(--primary)' }}>
                          ¥{model.displayPrice}/千字
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12" style={{ color: 'var(--foreground)' }}>
            常见问题
          </h2>
          <div className="space-y-4">
            {[
              { q: '好AI是如何收费的？', a: '按实际使用量计费，没有月费、没有订阅、没有最低消费。用多少充多少，余额永久有效。' },
              { q: '余额有有效期吗？', a: '余额永久有效，随时可用。用多少扣多少，不使用不扣费。' },
              { q: '支持哪些支付方式？', a: '目前支持微信支付和支付宝扫码支付。' },
              { q: '需要翻墙吗？', a: '完全不需要！好AI部署在国内服务器，中国用户可以直接访问所有海外顶级AI模型。' },
              { q: '响应速度如何？', a: '我们接入了各大模型官方API，经过优化的路由确保响应速度快、稳定可靠。' },
              { q: '如何申请API？', a: '您无需申请任何API。我们已经接入了各大AI厂商的API，您只需扫码支付即可使用。' },
            ].map((faq, i) => (
              <details key={i} className="card accordion">
                <summary>
                  {faq.q}
                </summary>
                <div className="accordion-content">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          立即开始使用
        </h2>
        <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
          扫码支付即可使用，没有任何额外费用
        </p>
        <Link
          href="/login"
          className="btn btn-primary btn-large"
        >
          扫码登录/充值 →
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦦</span>
            <span className="font-bold" style={{ color: 'var(--primary)' }}>好AI</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            © 2026 好AI. 让AI对话更简单。
          </p>
        </div>
      </footer>
    </div>
  );
}
