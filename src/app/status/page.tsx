'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';

interface SystemStatus {
  service: string;
  status: 'operational' | 'degraded' | 'down';
  latency?: string;
  uptime: string;
}

export default function StatusPage() {
  const [statuses, setStatuses] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 模拟状态数据
    setStatuses([
      { service: '网站前端', status: 'operational', latency: '23ms', uptime: '99.9%' },
      { service: 'API服务', status: 'operational', latency: '45ms', uptime: '99.8%' },
      { service: 'ChatGPT模型', status: 'operational', latency: '120ms', uptime: '99.5%' },
      { service: 'Claude模型', status: 'operational', latency: '98ms', uptime: '99.7%' },
      { service: 'Gemini模型', status: 'operational', latency: '85ms', uptime: '99.6%' },
      { service: '支付系统', status: 'operational', latency: '156ms', uptime: '99.9%' },
      { service: '数据库', status: 'operational', latency: '12ms', uptime: '99.99%' },
      { service: '邮件服务', status: 'operational', latency: '234ms', uptime: '99.5%' },
    ]);
    setLoading(false);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return '#28a745';
      case 'degraded': return '#ffc107';
      case 'down': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'operational': return '运行中';
      case 'degraded': return '性能下降';
      case 'down': return '服务中断';
      default: return '未知';
    }
  };

  const overallStatus = statuses.every(s => s.status === 'operational')
    ? 'operational'
    : statuses.some(s => s.status === 'down')
    ? 'down'
    : 'degraded';

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      <main className="max-w-4xl mx-auto px-4 py-8 pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">系统状态</h1>
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: getStatusColor(overallStatus) }}
            />
            <span className="text-xl font-medium">
              {getStatusLabel(overallStatus)}
            </span>
          </div>
          <p className="mt-2" style={{ color: 'var(--text-muted)' }}>
            最后更新：{new Date().toLocaleString('zh-CN')}
          </p>
        </div>

        <div className="card mb-8">
          <h2 className="text-lg font-bold mb-4">📊 过去90天运行时间</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
              <div className="text-2xl font-bold" style={{ color: '#28a745' }}>99.95%</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>整体可用性</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
              <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>0.04%</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>平均延迟</div>
            </div>
            <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
              <div className="text-2xl font-bold" style={{ color: '#dc3545' }}>2次</div>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>中断事件</div>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">加载中...</div>
        ) : (
          <div className="card">
            <h2 className="text-lg font-bold mb-4">🔧 服务状态</h2>
            <div className="space-y-4">
              {statuses.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--card-border)' }}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    />
                    <span className="font-medium">{item.service}</span>
                  </div>
                  <div className="flex items-center gap-6">
                    <span
                      className={`text-sm ${
                        item.status === 'operational' ? '' : 'font-medium'
                      }`}
                      style={{ color: getStatusColor(item.status) }}
                    >
                      {getStatusLabel(item.status)}
                    </span>
                    {item.latency && (
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {item.latency}
                      </span>
                    )}
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {item.uptime}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card mt-8">
          <h2 className="text-lg font-bold mb-4">📢 维护公告</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-default">2026-04-20</span>
                <span className="font-medium">数据库优化维护</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                将于2026年4月25日凌晨2:00-4:00进行数据库优化维护，届时服务可能短暂中断。
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="badge badge-success">2026-04-15</span>
                <span className="font-medium">新增Claude 4.5支持</span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                好AI平台现已支持Claude 4.5模型，欢迎使用！
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            遇到问题？
            <a href="/user" className="underline ml-1">提交工单</a>
            或联系
            <a href="mailto:woncoo@hotmail.com" className="underline ml-1">woncoo@hotmail.com</a>
          </p>
        </div>
      </main>
    </div>
  );
}