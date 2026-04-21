'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';

interface DailyStat {
  date: string;
  count: number;
  totalCost: number;
  inputTokens: number;
  outputTokens: number;
}

interface UsageLog {
  id: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  createdAt: string;
}

interface QuickPrompt {
  id: string;
  title: string;
  content: string;
}

interface BudgetInfo {
  monthly_limit: number;
  daily_limit: number;
  alert_threshold: number;
}

export default function UserCenterPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'budget' | 'prompts' | 'tickets' | 'referral' | 'webhooks'>('overview');
  const [balance, setBalance] = useState(0);
  const [totalRecharged, setTotalRecharged] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [recentLogs, setRecentLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);

  // 预算相关
  const [budget, setBudget] = useState<BudgetInfo>({ monthly_limit: 0, daily_limit: 0, alert_threshold: 0.8 });
  const [dailySpending, setDailySpending] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);

  // 快捷指令相关
  const [quickPrompts, setQuickPrompts] = useState<QuickPrompt[]>([]);
  const [showPromptForm, setShowPromptForm] = useState(false);
  const [promptForm, setPromptForm] = useState({ title: '', content: '' });

  // 工单相关
  const [tickets, setTickets] = useState<any[]>([]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'question', description: '', priority: 'normal' });

  // 邀请相关
  const [referralStats, setReferralStats] = useState({ totalInvited: 0, totalEarned: 0, pendingReward: 0 });
  const [myReferralCode, setMyReferralCode] = useState('');

  useEffect(() => {
    fetchUsageData();
    fetchBudget();
    fetchQuickPrompts();
    fetchTickets();
    fetchReferral();
  }, []);

  const fetchUsageData = async () => {
    try {
      const res = await fetch('/api/user/usage');
      const data = await res.json();
      if (data.success) {
        setBalance(data.currentBalance);
        setTotalRecharged(data.totalRecharged);
        setTotalSpent(data.totalSpent);
        setDailyStats(data.dailyStats);
        setRecentLogs(data.recentLogs);
      }
    } catch (error) {
      console.error('Failed to fetch usage data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBudget = async () => {
    try {
      const res = await fetch('/api/user/budget');
      const data = await res.json();
      if (data.success) {
        setBudget(data.budget);
        setDailySpending(data.spending.daily);
        setMonthlySpending(data.spending.monthly);
      }
    } catch (error) {
      console.error('Failed to fetch budget:', error);
    }
  };

  const fetchQuickPrompts = async () => {
    try {
      const res = await fetch('/api/user/quick-prompts');
      const data = await res.json();
      if (data.success) {
        setQuickPrompts(data.prompts);
      }
    } catch (error) {
      console.error('Failed to fetch quick prompts:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/user/tickets');
      const data = await res.json();
      if (data.success) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  };

  const fetchReferral = async () => {
    try {
      const res = await fetch('/api/user/referral');
      const data = await res.json();
      if (data.success) {
        setReferralStats(data.stats);
        // 生成邀请码（使用用户ID的hash）
        setMyReferralCode(btoa(data.referrals.sent[0]?.inviteeId || 'user').slice(0, 8));
      }
    } catch (error) {
      console.error('Failed to fetch referral:', error);
    }
  };

  const handleSaveBudget = async () => {
    try {
      const res = await fetch('/api/user/budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(budget),
      });
      const data = await res.json();
      if (data.success) {
        alert('预算设置成功');
        fetchBudget();
      }
    } catch (error) {
      console.error('Failed to save budget:', error);
    }
  };

  const handleAddPrompt = async () => {
    if (!promptForm.title || !promptForm.content) return;
    try {
      const res = await fetch('/api/user/quick-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptForm),
      });
      const data = await res.json();
      if (data.success) {
        setPromptForm({ title: '', content: '' });
        setShowPromptForm(false);
        fetchQuickPrompts();
      }
    } catch (error) {
      console.error('Failed to add prompt:', error);
    }
  };

  const handleDeletePrompt = async (id: string) => {
    if (!confirm('确定要删除这个快捷指令吗？')) return;
    try {
      await fetch(`/api/user/quick-prompts?id=${id}`, { method: 'DELETE' });
      fetchQuickPrompts();
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  const handleCreateTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description) return;
    try {
      const res = await fetch('/api/user/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketForm),
      });
      const data = await res.json();
      if (data.success) {
        setTicketForm({ subject: '', category: 'question', description: '', priority: 'normal' });
        setShowTicketForm(false);
        fetchTickets();
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'badge-warning',
      pending: 'badge-default',
      resolved: 'badge-success',
      closed: 'badge-default',
    };
    const labels: Record<string, string> = {
      open: '待处理',
      pending: '处理中',
      resolved: '已解决',
      closed: '已关闭',
    };
    return `<span class="badge ${styles[status] || 'badge-default'}">${labels[status] || status}</span>`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">🦦</div>
          <div>加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      <main className="max-w-6xl mx-auto px-4 py-8 pt-20">
        <h1 className="text-3xl font-bold mb-8">🦪 个人中心</h1>

        {/* Tab导航 */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { id: 'overview', label: '总览', icon: '📊' },
            { id: 'budget', label: '预算控制', icon: '💵' },
            { id: 'prompts', label: '快捷指令', icon: '⚡' },
            { id: 'tickets', label: '工单', icon: '🎫' },
            { id: 'referral', label: '邀请有礼', icon: '🎁' },
            { id: 'webhooks', label: 'Webhooks', icon: '🔗' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? 'btn-primary' : 'btn-secondary'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* 总览 */}
        {activeTab === 'overview' && (
          <>
            {/* 余额卡片 */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>当前余额</div>
                <div className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>
                  ¥{balance.toFixed(2)}
                </div>
              </div>
              <div className="card">
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>累计充值</div>
                <div className="text-4xl font-bold" style={{ color: '#28a745' }}>
                  ¥{totalRecharged.toFixed(2)}
                </div>
              </div>
              <div className="card">
                <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>累计消费</div>
                <div className="text-4xl font-bold" style={{ color: '#dc3545' }}>
                  ¥{totalSpent.toFixed(2)}
                </div>
              </div>
            </div>

            {/* 充值入口 */}
            <div className="flex gap-4 mb-8">
              <Link href="/login" className="btn btn-primary">
                💰 充值
              </Link>
            </div>

            {/* 消费可视化 */}
            <div className="card mb-8">
              <h3 className="text-lg font-bold mb-4">📊 近7天消费趋势</h3>
              {dailyStats.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无消费记录</div>
              ) : (
                <div className="flex items-end gap-2 h-40">
                  {dailyStats.slice(-7).map((stat, i) => {
                    const maxCost = Math.max(...dailyStats.slice(-7).map(s => s.totalCost), 1);
                    const height = (stat.totalCost / maxCost) * 100;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div
                          className="w-full rounded-t-lg transition-all hover:opacity-80"
                          style={{
                            height: `${Math.max(height, 4)}%`,
                            backgroundColor: 'var(--primary)',
                          }}
                          title={`¥${stat.totalCost.toFixed(2)}`}
                        />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {formatDate(stat.date)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 每日消费趋势表 */}
            <div className="card mb-8">
              <h3 className="text-lg font-bold mb-4">📋 每日消费明细</h3>
              {dailyStats.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无消费记录</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>日期</th>
                        <th>调用次数</th>
                        <th>输入Token</th>
                        <th>输出Token</th>
                        <th>消费金额</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dailyStats.map((stat) => (
                        <tr key={stat.date}>
                          <td>{formatDate(stat.date)}</td>
                          <td>{stat.count}</td>
                          <td>{stat.inputTokens.toLocaleString()}</td>
                          <td>{stat.outputTokens.toLocaleString()}</td>
                          <td className="font-bold" style={{ color: 'var(--primary)' }}>¥{stat.totalCost.toFixed(4)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* 最近消费明细 */}
            <div className="card">
              <h3 className="text-lg font-bold mb-4">📝 最近消费明细</h3>
              {recentLogs.length === 0 ? (
                <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无消费记录</div>
              ) : (
                <div className="space-y-4">
                  {recentLogs.slice(0, 10).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-4 rounded-lg"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                      <div>
                        <div className="font-medium">{log.model}</div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          {new Date(log.createdAt).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold" style={{ color: 'var(--primary)' }}>-¥{log.cost.toFixed(4)}</div>
                        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                          输入{log.inputTokens} / 输出{log.outputTokens} tokens
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* 预算控制 */}
        {activeTab === 'budget' && (
          <div className="card">
            <h3 className="text-lg font-bold mb-6">💵 预算控制</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              设置每日或每月消费上限，超出时系统将发送提醒
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>每日上限 (元)</label>
                <input
                  type="number"
                  value={budget.daily_limit}
                  onChange={(e) => setBudget({ ...budget, daily_limit: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                  placeholder="0 表示不限制"
                />
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  今日已消费: ¥{dailySpending.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>每月上限 (元)</label>
                <input
                  type="number"
                  value={budget.monthly_limit}
                  onChange={(e) => setBudget({ ...budget, monthly_limit: parseFloat(e.target.value) || 0 })}
                  className="input w-full"
                  placeholder="0 表示不限制"
                />
                <div className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  本月已消费: ¥{monthlySpending.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-2" style={{ color: 'var(--text-muted)' }}>预警阈值</label>
              <select
                value={budget.alert_threshold * 100}
                onChange={(e) => setBudget({ ...budget, alert_threshold: parseFloat(e.target.value) / 100 })}
                className="input"
              >
                <option value={50}>达到上限50%时提醒</option>
                <option value={70}>达到上限70%时提醒</option>
                <option value={80}>达到上限80%时提醒（推荐）</option>
                <option value={90}>达到上限90%时提醒</option>
              </select>
            </div>

            <button onClick={handleSaveBudget} className="btn btn-primary">保存设置</button>

            {/* 进度条 */}
            {(budget.daily_limit > 0 || budget.monthly_limit > 0) && (
              <div className="mt-8 space-y-4">
                {budget.daily_limit > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>每日预算进度</span>
                      <span>¥{dailySpending.toFixed(2)} / ¥{budget.daily_limit}</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min((dailySpending / budget.daily_limit) * 100, 100)}%`,
                          backgroundColor: dailySpending / budget.daily_limit > 0.9 ? '#dc3545' : 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                )}
                {budget.monthly_limit > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>每月预算进度</span>
                      <span>¥{monthlySpending.toFixed(2)} / ¥{budget.monthly_limit}</span>
                    </div>
                    <div className="progress">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min((monthlySpending / budget.monthly_limit) * 100, 100)}%`,
                          backgroundColor: monthlySpending / budget.monthly_limit > 0.9 ? '#dc3545' : 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 快捷指令 */}
        {activeTab === 'prompts' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">⚡ 快捷指令</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>保存常用prompt，一键发送</p>
              </div>
              <button onClick={() => setShowPromptForm(!showPromptForm)} className="btn btn-primary">
                {showPromptForm ? '取消' : '+ 添加'}
              </button>
            </div>

            {showPromptForm && (
              <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--card-border)' }}>
                <div className="mb-4">
                  <label className="block text-sm mb-2">标题</label>
                  <input
                    type="text"
                    value={promptForm.title}
                    onChange={(e) => setPromptForm({ ...promptForm, title: e.target.value })}
                    className="input w-full"
                    placeholder="如：代码解释"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm mb-2">Prompt内容</label>
                  <textarea
                    value={promptForm.content}
                    onChange={(e) => setPromptForm({ ...promptForm, content: e.target.value })}
                    className="input w-full h-24"
                    placeholder="输入常用的prompt..."
                  />
                </div>
                <button onClick={handleAddPrompt} className="btn btn-primary">保存</button>
              </div>
            )}

            {quickPrompts.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
                暂无快捷指令，点击右上角添加
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {quickPrompts.map((prompt) => (
                  <div key={prompt.id} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium">{prompt.title}</div>
                      <button onClick={() => handleDeletePrompt(prompt.id)} className="text-sm" style={{ color: '#dc3545' }}>
                        删除
                      </button>
                    </div>
                    <div className="text-sm truncate" style={{ color: 'var(--text-muted)' }}>{prompt.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 工单 */}
        {activeTab === 'tickets' && (
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold">🎫 客服工单</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>提交问题，管理员将尽快处理</p>
              </div>
              <button onClick={() => setShowTicketForm(!showTicketForm)} className="btn btn-primary">
                {showTicketForm ? '取消' : '+ 新建工单'}
              </button>
            </div>

            {showTicketForm && (
              <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--card-border)' }}>
                <div className="mb-4">
                  <label className="block text-sm mb-2">主题</label>
                  <input
                    type="text"
                    value={ticketForm.subject}
                    onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                    className="input w-full"
                    placeholder="简述您的问题"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm mb-2">类别</label>
                    <select
                      value={ticketForm.category}
                      onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                      className="input w-full"
                    >
                      <option value="question">咨询</option>
                      <option value="bug">Bug反馈</option>
                      <option value="refund">退款申请</option>
                      <option value="other">其他</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm mb-2">优先级</label>
                    <select
                      value={ticketForm.priority}
                      onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                      className="input w-full"
                    >
                      <option value="low">低</option>
                      <option value="normal">普通</option>
                      <option value="high">高</option>
                      <option value="urgent">紧急</option>
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm mb-2">详细描述</label>
                  <textarea
                    value={ticketForm.description}
                    onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                    className="input w-full h-24"
                    placeholder="请详细描述您的问题..."
                  />
                </div>
                <button onClick={handleCreateTicket} className="btn btn-primary">提交工单</button>
              </div>
            )}

            {tickets.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>暂无工单记录</div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-medium mr-2">{ticket.subject}</span>
                        <span className={`badge ${
                          ticket.priority === 'urgent' ? 'badge-error' :
                          ticket.priority === 'high' ? 'badge-warning' : 'badge-default'
                        }`}>
                          {ticket.priority === 'urgent' ? '紧急' :
                           ticket.priority === 'high' ? '高' :
                           ticket.priority === 'low' ? '低' : '普通'}
                        </span>
                      </div>
                      <span dangerouslySetInnerHTML={{ __html: getStatusBadge(ticket.status) }} />
                    </div>
                    <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{ticket.description}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(ticket.createdAt).toLocaleString('zh-CN')}
                      {ticket.adminNote && <span className="ml-4">管理员: {ticket.adminNote}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 邀请有礼 */}
        {activeTab === 'referral' && (
          <div className="card">
            <h3 className="text-lg font-bold mb-6">🎁 邀请有礼</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              邀请好友注册并充值满¥100，你和好友都将获得¥10奖励
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
                <div className="text-3xl font-bold" style={{ color: 'var(--primary)' }}>
                  {referralStats.totalInvited}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>已邀请人数</div>
              </div>
              <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
                <div className="text-3xl font-bold" style={{ color: '#28a745' }}>
                  ¥{referralStats.totalEarned.toFixed(2)}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>已获得奖励</div>
              </div>
              <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
                <div className="text-3xl font-bold" style={{ color: '#ffc107' }}>
                  ¥{referralStats.pendingReward.toFixed(2)}
                </div>
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>待生效奖励</div>
              </div>
            </div>

            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--card-border)' }}>
              <div className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>你的邀请码</div>
              <div className="flex items-center gap-4">
                <code className="text-xl font-bold tracking-widest">{myReferralCode}</code>
                <button
                  onClick={() => navigator.clipboard.writeText(myReferralCode)}
                  className="btn btn-secondary btn-small"
                >
                  复制
                </button>
              </div>
              <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                分享给好友，好友注册时输入此邀请码即可
              </div>
            </div>
          </div>
        )}

        {/* Webhooks */}
        {activeTab === 'webhooks' && (
          <div className="card">
            <h3 className="text-lg font-bold mb-6">🔗 Webhooks</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              配置Webhook，接收余额变动、订单完成等事件通知
            </p>

            <div className="p-4 rounded-lg mb-6" style={{ backgroundColor: 'var(--card-border)' }}>
              <h4 className="font-medium mb-4">支持的事件</h4>
              <div className="grid md:grid-cols-2 gap-2 text-sm">
                {['balance_low - 余额不足', 'balance_exhausted - 余额耗尽', 'order_completed - 订单完成', 'refund_approved - 退款批准'].map((event) => (
                  <div key={event.split(' ')[0]} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                    <code className="text-xs">{event}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
              Webhook配置功能开发中...
            </div>
          </div>
        )}
      </main>
    </div>
  );
}