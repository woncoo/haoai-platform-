'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import OtterMascot from '../../components/OtterMascot';
import { getModelCategories, modelConfig } from '../../lib/models';

type TabType = 'overview' | 'models' | 'api' | 'users' | 'payments' | 'settings' | 'userApis' | 'usage' | 'invoices' | 'audit';

interface ApiKey {
  id: string;
  provider: string;
  name: string;
  key: string;
  status: 'active' | 'inactive' | 'error';
  usage: number;
  limit: number;
  cost: number;
}

interface User {
  id: string;
  phone: string;
  balance: number;
  totalSpent: number;
  messages: number;
  createdAt: string;
  status: 'active' | 'banned';
}

interface Payment {
  id: string;
  userId: string;
  amount: number;
  method: 'wechat' | 'alipay';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

// 模拟数据
const mockApiKeys: ApiKey[] = [
  { id: '1', provider: 'OpenAI', name: 'GPT-5 主Key', key: 'sk-xxxx...xxxx', status: 'active', usage: 125000, limit: 1000000, cost: 0.10 },
  { id: '2', provider: 'Anthropic', name: 'Claude 4 主Key', key: 'sk-ant-xxxx...xxxx', status: 'active', usage: 89000, limit: 500000, cost: 0.12 },
  { id: '3', provider: 'Google', name: 'Gemini API', key: 'AIza...xxxx', status: 'active', usage: 234000, limit: 2000000, cost: 0.008 },
  { id: '4', provider: 'DeepSeek', name: 'DeepSeek API', key: 'ds-xxxx...xxxx', status: 'error', usage: 45000, limit: 100000, cost: 0.014 },
];

const mockUsers: User[] = [
  { id: '1', phone: '138****8888', balance: 156.50, totalSpent: 543.50, messages: 2340, createdAt: '2026-03-15', status: 'active' },
  { id: '2', phone: '139****6666', balance: 89.20, totalSpent: 210.80, messages: 890, createdAt: '2026-03-20', status: 'active' },
  { id: '3', phone: '137****3333', balance: 0, totalSpent: 99.00, messages: 456, createdAt: '2026-03-22', status: 'banned' },
];

const mockPayments: Payment[] = [
  { id: '1', userId: '1', amount: 100, method: 'wechat', status: 'completed', createdAt: '2026-04-07 14:30' },
  { id: '2', userId: '2', amount: 50, method: 'alipay', status: 'completed', createdAt: '2026-04-07 15:20' },
  { id: '3', userId: '1', amount: 200, method: 'wechat', status: 'pending', createdAt: '2026-04-08 09:15' },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'overview', label: '总览', icon: '📊' },
    { id: 'models', label: '模型配置', icon: '🤖' },
    { id: 'api', label: 'API密钥', icon: '🔑' },
    { id: 'users', label: '用户管理', icon: '👥' },
    { id: 'payments', label: '充值记录', icon: '💳' },
    { id: 'userApis', label: '用户API', icon: '🔧' },
    { id: 'usage', label: '消费记录', icon: '📝' },
    { id: 'invoices', label: '发票管理', icon: '🧾' },
    { id: 'audit', label: '审计日志', icon: '📋' },
    { id: 'settings', label: '系统设置', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? 'w-64' : 'w-20'} flex-shrink-0 border-r transition-all duration-300 flex flex-col`}
        style={{ backgroundColor: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        {/* Logo */}
        <div className="p-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--card-border)' }}>
          <Link href="/" className="flex items-center gap-2">
            <OtterMascot size={36} />
            {sidebarOpen && <span className="font-bold text-lg" style={{ color: 'var(--primary)' }}>好AI</span>}
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-auto p-2 rounded-lg hover:bg-opacity-10"
            style={{ backgroundColor: 'var(--card-border)' }}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id ? 'font-medium' : ''
              }`}
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : 'var(--foreground)',
              }}
            >
              <span className="text-xl">{tab.icon}</span>
              {sidebarOpen && <span>{tab.label}</span>}
            </button>
          ))}
        </nav>

        {/* User */}
        <div className="p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--primary)', color: '#ffffff' }}>
              管
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-medium text-sm">管理员</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>超级管理员</div>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-40 border-b px-6 py-4" style={{ backgroundColor: 'var(--header-bg)', borderColor: 'var(--card-border)' }}>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
            <div className="flex items-center gap-4">
              <span className="badge badge-success">系统正常</span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('zh-CN')}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: '总用户', value: '1,234', change: '+12%', icon: '👥' },
                  { label: '今日消息', value: '5,678', change: '+8%', icon: '💬' },
                  { label: '今日收入', value: '¥2,345', change: '+15%', icon: '💰' },
                  { label: 'API调用', value: '45,678', change: '+5%', icon: '📊' },
                ].map((stat, i) => (
                  <div key={i} className="card">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-3xl">{stat.icon}</span>
                      <span className="badge badge-success text-xs">{stat.change}</span>
                    </div>
                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                    <div className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Charts Placeholder */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">收入趋势</h3>
                  <div className="h-64 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>图表区域 - 收入趋势</span>
                  </div>
                </div>
                <div className="card">
                  <h3 className="text-lg font-bold mb-4">模型使用分布</h3>
                  <div className="h-64 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--card-border)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>图表区域 - 模型使用</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">最近活动</h3>
                <div className="space-y-4">
                  {[
                    { time: '10:30', event: '用户 138****8888 充值 ¥100', type: 'payment' },
                    { time: '10:25', event: 'API调用峰值: 1,234 QPS', type: 'api' },
                    { time: '10:20', event: '新用户注册: 139****6666', type: 'user' },
                    { time: '10:15', event: 'GPT-5 模型响应异常 (已恢复)', type: 'error' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-3 border-b last:border-0" style={{ borderColor: 'var(--card-border)' }}>
                      <div className="w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: item.type === 'error' ? '#ef4444' : item.type === 'payment' ? 'var(--primary)' : 'var(--accent)'
                        }}
                      />
                      <span className="text-sm flex-1">{item.event}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Models Tab */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">模型配置</h3>
                  <button className="btn btn-primary btn-small">添加模型</button>
                </div>

                <div className="space-y-6">
                  {modelConfig.map((cat) => (
                    <div key={cat.id}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{cat.icon}</span>
                        <h4 className="font-bold">{cat.name}</h4>
                        <span className="badge">{cat.models.length} 个版本</span>
                      </div>
                      <table className="table">
                        <thead>
                          <tr>
                            <th>模型</th>
                            <th>批发价</th>
                            <th>销售价</th>
                            <th>利润率</th>
                            <th>状态</th>
                            <th>操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.models.map((model) => (
                            <tr key={model.id}>
                              <td>
                                <div className="font-medium">{model.name}</div>
                                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{model.desc}</div>
                              </td>
                              <td>¥{model.bulkPrice.toFixed(4)}</td>
                              <td className="font-bold" style={{ color: 'var(--primary)' }}>¥{model.displayPrice.toFixed(4)}</td>
                              <td>
                                <span className="badge badge-success">20%</span>
                              </td>
                              <td>
                                <span className="badge badge-success">启用</span>
                              </td>
                              <td>
                                <div className="flex gap-2">
                                  <button className="btn btn-small btn-secondary">编辑</button>
                                  <button className="btn btn-small" style={{ backgroundColor: 'var(--card-border)' }}>禁用</button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API Tab */}
          {activeTab === 'api' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">API密钥管理</h3>
                  <button className="btn btn-primary btn-small">添加API</button>
                </div>

                <div className="space-y-4">
                  {mockApiKeys.map((api) => (
                    <div key={api.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--background)' }}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold">{api.name}</span>
                            <span className={`badge ${
                              api.status === 'active' ? 'badge-success' :
                              api.status === 'error' ? 'badge-error' : 'badge-warning'
                            }`}>
                              {api.status === 'active' ? '正常' : api.status === 'error' ? '异常' : '停用'}
                            </span>
                          </div>
                          <div className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                            {api.key}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-small btn-secondary">编辑</button>
                          <button className="btn btn-small" style={{ backgroundColor: 'var(--card-border)' }}>删除</button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>已使用</div>
                          <div className="flex items-center gap-2">
                            <div className="progress flex-1">
                              <div className="progress-bar" style={{ width: `${(api.usage / api.limit) * 100}%` }} />
                            </div>
                            <span className="text-xs">{Math.round((api.usage / api.limit) * 100)}%</span>
                          </div>
                          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                            {api.usage.toLocaleString()} / {api.limit.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>成本</div>
                          <div className="font-bold">¥{api.cost.toFixed(4)}/千字</div>
                        </div>
                        <div>
                          <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>供应商</div>
                          <div className="font-medium">{api.provider}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* API文档 */}
              <div className="card">
                <h3 className="text-lg font-bold mb-4">API调用文档</h3>
                <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="font-mono text-sm space-y-2">
                    <div style={{ color: 'var(--text-muted)' }}># 聊天接口</div>
                    <div>POST /api/v1/chat</div>
                    <div style={{ color: 'var(--text-muted)' }}># 余额查询</div>
                    <div>GET /api/v1/balance</div>
                    <div style={{ color: 'var(--text-muted)' }}># 模型列表</div>
                    <div>GET /api/v1/models</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">用户管理</h3>
                  <div className="flex gap-2">
                    <input type="text" placeholder="搜索用户..." className="input" style={{ width: '200px' }} />
                    <button className="btn btn-secondary">导出</button>
                  </div>
                </div>

                <table className="table">
                  <thead>
                    <tr>
                      <th>用户ID</th>
                      <th>手机号</th>
                      <th>余额</th>
                      <th>累计消费</th>
                      <th>消息数</th>
                      <th>注册时间</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="font-mono text-sm">#{user.id}</td>
                        <td>{user.phone}</td>
                        <td className="font-bold" style={{ color: 'var(--primary)' }}>¥{user.balance.toFixed(2)}</td>
                        <td>¥{user.totalSpent.toFixed(2)}</td>
                        <td>{user.messages.toLocaleString()}</td>
                        <td>{user.createdAt}</td>
                        <td>
                          <span className={`badge ${user.status === 'active' ? 'badge-success' : 'badge-error'}`}>
                            {user.status === 'active' ? '正常' : '封禁'}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-2">
                            <button className="btn btn-small btn-secondary">详情</button>
                            <button className="btn btn-small" style={{ backgroundColor: user.status === 'active' ? 'var(--card-border)' : 'var(--primary)', color: user.status === 'active' ? 'var(--foreground)' : '#ffffff' }}>
                              {user.status === 'active' ? '封禁' : '解封'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-6">
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">支付记录</h3>
                  <div className="flex gap-2">
                    <select className="select">
                      <option>全部状态</option>
                      <option>已完成</option>
                      <option>处理中</option>
                      <option>失败</option>
                    </select>
                    <button className="btn btn-secondary">导出</button>
                  </div>
                </div>

                <table className="table">
                  <thead>
                    <tr>
                      <th>订单号</th>
                      <th>用户ID</th>
                      <th>金额</th>
                      <th>支付方式</th>
                      <th>状态</th>
                      <th>时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="font-mono text-sm">#{payment.id}</td>
                        <td>#{payment.userId}</td>
                        <td className="font-bold">¥{payment.amount.toFixed(2)}</td>
                        <td>{payment.method === 'wechat' ? '💚 微信' : '💙 支付宝'}</td>
                        <td>
                          <span className={`badge ${
                            payment.status === 'completed' ? 'badge-success' :
                            payment.status === 'pending' ? 'badge-warning' : 'badge-error'
                          }`}>
                            {payment.status === 'completed' ? '已完成' : payment.status === 'pending' ? '处理中' : '失败'}
                          </span>
                        </td>
                        <td>{payment.createdAt}</td>
                        <td>
                          <button className="btn btn-small btn-secondary">详情</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* User APIs Tab */}
          {activeTab === 'userApis' && (
            <UserApisPanel />
          )}

          {/* Usage Tab */}
          {activeTab === 'usage' && (
            <UsagePanel />
          )}

          {/* Invoices Tab */}
          {activeTab === 'invoices' && (
            <InvoicesPanel />
          )}

          {/* Audit Tab */}
          {activeTab === 'audit' && (
            <AuditPanel />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-bold mb-6">系统设置</h3>

                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-4">基础配置</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>网站名称</label>
                        <input type="text" defaultValue="好AI" className="input" />
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>网站域名</label>
                        <input type="text" defaultValue="https://haoai.com" className="input" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">支付配置</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>微信商户号</label>
                        <input type="text" placeholder="请输入商户号" className="input" />
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>支付宝商户号</label>
                        <input type="text" placeholder="请输入商户号" className="input" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">利润设置</h4>
                    <div>
                      <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>服务费比例 (%)</label>
                      <input type="number" defaultValue="20" className="input" style={{ width: '200px' }} />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>API成本 × (1 + 服务费比例) = 销售价格</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">预警设置</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>API使用预警 (%)</label>
                        <input type="number" defaultValue="80" className="input" style={{ width: '200px' }} />
                      </div>
                      <div>
                        <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>余额预警 (元)</label>
                        <input type="number" defaultValue="100" className="input" style={{ width: '200px' }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                    <button className="btn btn-primary">保存设置</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ==================== 用户API配置面板 ====================
function UserApisPanel() {
  const [apis, setApis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    api_url: '',
    api_key: '',
    cost_per_1k_tokens: 0.01,
  });

  useEffect(() => {
    fetchApis();
  }, []);

  const fetchApis = async () => {
    try {
      const res = await fetch('/api/admin/apis');
      const data = await res.json();
      if (data.success) {
        setApis(data.apis);
      }
    } catch (error) {
      console.error('Failed to fetch APIs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddApi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddForm(false);
        setFormData({ name: '', provider: '', api_url: '', api_key: '', cost_per_1k_tokens: 0.01 });
        fetchApis();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to add API:', error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      await fetch('/api/admin/apis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      fetchApis();
    } catch (error) {
      console.error('Failed to toggle status:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个API配置吗？')) return;
    try {
      await fetch(`/api/admin/apis?id=${id}`, { method: 'DELETE' });
      fetchApis();
    } catch (error) {
      console.error('Failed to delete API:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">用户API配置</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>管理用户接入的API，按1.2倍价格自动计费</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? '取消添加' : '+ 添加API'}
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddApi} className="p-4 rounded-xl mb-6" style={{ backgroundColor: 'var(--card-border)' }}>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">API名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input w-full"
                  placeholder="如：GPT-5 主Key"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">提供商</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="input w-full"
                  required
                >
                  <option value="">选择提供商</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Anthropic">Anthropic</option>
                  <option value="Google">Google</option>
                  <option value="DeepSeek">DeepSeek</option>
                  <option value="xAI">xAI</option>
                  <option value="Other">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">API地址</label>
                <input
                  type="url"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                  className="input w-full"
                  placeholder="https://api.openai.com/v1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">API密钥</label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="input w-full"
                  placeholder="sk-xxx"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2">成本价 (元/千token)</label>
                <input
                  type="number"
                  step="0.0001"
                  min="0"
                  value={formData.cost_per_1k_tokens}
                  onChange={(e) => setFormData({ ...formData, cost_per_1k_tokens: parseFloat(e.target.value) })}
                  className="input w-full"
                  required
                />
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  销售价：¥{(formData.cost_per_1k_tokens * 1.2).toFixed(4)}/千token（自动×1.2）
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button type="submit" className="btn btn-primary">确认添加</button>
            </div>
          </form>
        )}

        {apis.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            暂无API配置，请点击右上角添加
          </div>
        ) : (
          <div className="space-y-4">
            {apis.map((api) => (
              <div key={api.id} className="p-4 rounded-xl border" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--background)' }}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold">{api.name}</span>
                      <span className="badge">{api.provider}</span>
                      <span className={`badge ${api.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                        {api.status === 'active' ? '启用' : '停用'}
                      </span>
                    </div>
                    <div className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
                      🔒 API密钥已加密存储
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      API地址: {api.api_url} | 创建时间: {new Date(api.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleToggleStatus(api.id, api.status)}
                      className="btn btn-small btn-secondary"
                    >
                      {api.status === 'active' ? '停用' : '启用'}
                    </button>
                    <button
                      onClick={() => handleDelete(api.id)}
                      className="btn btn-small"
                      style={{ backgroundColor: '#ef4444', color: '#fff' }}
                    >
                      删除
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>成本价</div>
                    <div className="font-medium">¥{api.cost_per_1k_tokens.toFixed(4)}/千token</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>销售价</div>
                    <div className="font-bold" style={{ color: 'var(--primary)' }}>¥{api.sale_price.toFixed(4)}/千token</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>利润率</div>
                    <div className="font-medium">20%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== 消费记录面板 ====================
function UsagePanel() {
  const [usageLogs, setUsageLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setUsageLogs(data.recent_usage);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">消费记录</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>查看所有用户的API调用消费情况</p>
          </div>
          <button onClick={fetchUsage} className="btn btn-secondary">刷新</button>
        </div>

        {usageLogs.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            暂无消费记录
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>用户ID</th>
                <th>API配置</th>
                <th>模型</th>
                <th>输入Token</th>
                <th>输出Token</th>
                <th>费用</th>
              </tr>
            </thead>
            <tbody>
              {usageLogs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.created_at).toLocaleString()}</td>
                  <td className="font-mono text-sm">#{log.user_id.slice(0, 12)}</td>
                  <td className="font-mono text-sm">#{log.api_config_id.slice(0, 12)}</td>
                  <td>{log.model}</td>
                  <td>{log.input_tokens.toLocaleString()}</td>
                  <td>{log.output_tokens.toLocaleString()}</td>
                  <td className="font-bold" style={{ color: 'var(--primary)' }}>¥{log.cost.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== 发票管理面板 ====================
function InvoicesPanel() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending'>('all');

  useEffect(() => {
    fetchInvoices();
  }, [filter]);

  const fetchInvoices = async () => {
    try {
      const url = filter === 'pending' ? '/api/admin/invoices?status=pending' : '/api/admin/invoices';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setInvoices(data.invoices);
      }
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id: string, action: string, extraData?: any) => {
    try {
      const res = await fetch('/api/admin/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, ...extraData }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        fetchInvoices();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error('Failed to process invoice:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">发票管理</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>处理用户的发票申请，开具增值税发票</p>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'pending')}
              className="select"
            >
              <option value="all">全部申请</option>
              <option value="pending">待处理</option>
            </select>
            <button onClick={fetchInvoices} className="btn btn-secondary">刷新</button>
          </div>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            暂无发票申请
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>申请人</th>
                <th>发票抬头</th>
                <th>税号</th>
                <th>金额</th>
                <th>状态</th>
                <th>发票号</th>
                <th>申请时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.userName}</td>
                  <td className="font-medium">{invoice.title}</td>
                  <td className="font-mono text-sm">{invoice.taxId || '-'}</td>
                  <td className="font-bold" style={{ color: 'var(--primary)' }}>¥{invoice.amount.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${
                      invoice.status === 'issued' ? 'badge-success' :
                      invoice.status === 'approved' ? 'badge-warning' :
                      invoice.status === 'rejected' ? 'badge-error' : 'badge-default'
                    }`}>
                      {invoice.status === 'issued' ? '已开具' :
                       invoice.status === 'approved' ? '已批准' :
                       invoice.status === 'rejected' ? '已拒绝' : '待处理'}
                    </span>
                  </td>
                  <td className="font-mono text-sm">{invoice.invoiceNo || '-'}</td>
                  <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                  <td>
                    {invoice.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const invoiceNo = prompt('请输入发票号码:');
                            if (invoiceNo) handleProcess(invoice.id, 'approve', { invoiceNo });
                          }}
                          className="btn btn-small btn-secondary"
                        >
                          批准
                        </button>
                        <button
                          onClick={() => {
                            const note = prompt('请输入拒绝原因:');
                            if (note) handleProcess(invoice.id, 'reject', { adminNote: note });
                          }}
                          className="btn btn-small"
                          style={{ backgroundColor: '#ef4444', color: '#fff' }}
                        >
                          拒绝
                        </button>
                      </div>
                    )}
                    {invoice.status === 'approved' && (
                      <button
                        onClick={() => handleProcess(invoice.id, 'issue')}
                        className="btn btn-small btn-primary"
                      >
                        开具
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ==================== 审计日志面板 ====================
function AuditPanel() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const url = filter ? `/api/admin/audit?action=${filter}` : '/api/admin/audit';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'login': '登录',
      'logout': '登出',
      'recharge': '充值',
      'refund': '退款',
      'api_create': '创建API',
      'api_update': '更新API',
      'api_delete': '删除API',
      'config_change': '配置修改',
      'user_ban': '封禁用户',
      'user_unban': '解封用户',
    };
    return labels[action] || action;
  };

  const getActionBadge = (action: string) => {
    const styles: Record<string, string> = {
      'login': 'badge-default',
      'logout': 'badge-default',
      'recharge': 'badge-success',
      'refund': 'badge-warning',
      'api_create': 'badge-primary',
      'api_update': 'badge-warning',
      'api_delete': 'badge-error',
      'config_change': 'badge-default',
      'user_ban': 'badge-error',
      'user_unban': 'badge-success',
    };
    return `<span class="badge ${styles[action] || 'badge-default'}">${getActionLabel(action)}</span>`;
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold">📋 操作审计日志</h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>记录所有敏感操作，便于追溯和合规审查</p>
          </div>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="select"
            >
              <option value="">全部操作</option>
              <option value="login">登录</option>
              <option value="recharge">充值</option>
              <option value="refund">退款</option>
              <option value="api_create">API创建</option>
              <option value="api_delete">API删除</option>
              <option value="config_change">配置修改</option>
              <option value="user_ban">封禁用户</option>
            </select>
            <button onClick={fetchLogs} className="btn btn-secondary">刷新</button>
          </div>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
            暂无审计日志
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>时间</th>
                <th>用户ID</th>
                <th>操作类型</th>
                <th>操作对象</th>
                <th>详情</th>
                <th>IP地址</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td className="text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="font-mono text-sm">{log.userId || '-'}</td>
                  <td><span dangerouslySetInnerHTML={{ __html: getActionBadge(log.action) }} /></td>
                  <td className="text-sm">{log.targetType || '-'}</td>
                  <td className="text-sm max-w-xs truncate">{log.details || '-'}</td>
                  <td className="font-mono text-sm">{log.ipAddress || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
