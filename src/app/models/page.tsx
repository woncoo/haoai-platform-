import Link from 'next/link';
import Navigation from '../components/Navigation';
import { getModelCategories } from '../../lib/models';

const categories = getModelCategories();

export default function ModelsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
          顶级AI模型
          <span style={{ color: 'var(--primary)' }}> 随心切换</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          汇聚全球最顶尖的AI模型，一个平台全部搞定。无需翻墙，直接访问。
        </p>
      </section>

      {/* Models by Category */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          {categories.map((cat) => (
            <div key={cat.id}>
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${cat.color}20` }}
                >
                  {cat.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>{cat.name}</h2>
                  <p style={{ color: 'var(--text-muted)' }}>{cat.models.length} 个模型版本</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cat.models.map((model) => (
                  <div
                    key={model.id}
                    className="card card-interactive"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                          {model.name}
                        </h3>
                        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {model.desc}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                      <div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>上下文窗口</div>
                        <div className="font-medium">{(model.contextWindow / 1000).toFixed(0)}K tokens</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold" style={{ color: 'var(--primary)' }}>
                          ¥{model.displayPrice}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>/千字</div>
                      </div>
                    </div>

                    <Link
                      href="/chat"
                      className="btn btn-primary w-full justify-center mt-4"
                    >
                      立即使用 →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4" style={{ backgroundColor: 'var(--card-bg)' }}>
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-6">🦦</div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
            准备好体验了吗？
          </h2>
          <p className="mb-8" style={{ color: 'var(--text-muted)' }}>
            选择你喜欢的模型，开始和世界顶级AI对话
          </p>
          <Link
            href="/login"
            className="btn btn-primary btn-large"
          >
            扫码登录 →
          </Link>
        </div>
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
