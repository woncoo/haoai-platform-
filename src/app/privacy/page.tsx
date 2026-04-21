'use client';

import Navigation from '../components/Navigation';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      <main className="max-w-3xl mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold mb-8">隐私政策</h1>

        <div className="card space-y-6">
          <section>
            <h2 className="text-xl font-bold mb-3">1. 信息收集</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              我们收集以下信息以提供服务：
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2" style={{ color: 'var(--text-muted)' }}>
              <li>账户信息（手机号码、昵称）</li>
              <li>充值和消费记录</li>
              <li>API使用日志（包含Token数量和费用）</li>
              <li>对话历史（存储在本地）</li>
              <li>Cookie和访问日志</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. 信息使用</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              我们使用收集的信息用于：
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2" style={{ color: 'var(--text-muted)' }}>
              <li>提供AI对话服务</li>
              <li>计费和账单管理</li>
              <li>发送余额预警通知</li>
              <li>生成每日使用报告</li>
              <li>改进服务质量</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. 信息保护</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              我们采用业界标准的安全措施保护您的数据：
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2" style={{ color: 'var(--text-muted)' }}>
              <li>API密钥使用AES-256-GCM加密存储</li>
              <li>数据库访问权限严格控制</li>
              <li>定期安全审计和更新</li>
              <li>数据传输使用HTTPS加密</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Cookie政策</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              我们使用Cookie来：
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2" style={{ color: 'var(--text-muted)' }}>
              <li>保持登录状态</li>
              <li>记住您的偏好设置</li>
              <li>分析网站流量</li>
              <li>提供个性化内容</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. 数据保留</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              我们保留您的数据的时间：
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2" style={{ color: 'var(--text-muted)' }}>
              <li>账户数据：账户注销后6个月内</li>
              <li>消费记录：法定保留期限7年</li>
              <li>对话历史：您可以随时删除</li>
              <li>访问日志：90天内</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. 您的权利</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              根据GDPR，您拥有以下权利：
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2" style={{ color: 'var(--text-muted)' }}>
              <li><strong>访问权</strong>：获取您的个人数据副本</li>
              <li><strong>更正权</strong>：纠正不准确的数据</li>
              <li><strong>删除权</strong>：要求删除您的数据</li>
              <li><strong>数据可携权</strong>：导出您的数据</li>
              <li><strong>限制处理权</strong>：限制我们处理您的数据</li>
              <li><strong>拒绝权</strong>：拒绝某些类型的处理</li>
            </ul>
            <p className="mt-4" style={{ color: 'var(--text-muted)' }}>
              如需行使上述权利，请联系：woncoo@hotmail.com
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. 联系我们</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              如有任何隐私相关问题，请通过以下方式联系我们：
            </p>
            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
              邮箱：woncoo@hotmail.com<br />
              地址：好AI数据中心
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. 政策更新</h2>
            <p style={{ color: 'var(--text-muted)' }}>
              我们可能会不时更新本隐私政策。更新后我们将通过网站公告或邮件通知您。
              最后更新日期：2026年4月21日
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}