'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import OtterMascot from '../../components/OtterMascot';
import { getModelCategories } from '../../lib/models';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  model?: string;
  cost?: number;
}

interface ApiInfo {
  id: string;
  name: string;
  provider: string;
  model: string;
  cost_per_1k_tokens: number;
  sale_price: number;
}

const categories = getModelCategories();

export default function ChatPage() {
  const [expandedCategory, setExpandedCategory] = useState<string>(categories[0]?.id || '');
  const [selectedModelId, setSelectedModelId] = useState<string>(categories[0]?.models[0]?.id || '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [balance, setBalance] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [availableApis, setAvailableApis] = useState<ApiInfo[]>([]);
  const [selectedApiId, setSelectedApiId] = useState<string | null>(null);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 初始化：检查登录状态，获取用户信息和API列表
  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  // 当可用API变化时，自动选择第一个
  useEffect(() => {
    if (availableApis.length > 0 && !selectedApiId) {
      setSelectedApiId(availableApis[0].id);
    }
  }, [availableApis]);

  // 滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkAuthAndFetchData = async () => {
    try {
      // 获取用户余额
      const balanceRes = await fetch('/api/user/balance');
      const balanceData = await balanceRes.json();

      if (balanceData.success) {
        setBalance(balanceData.user.balance);
        setUserId(balanceData.user.id);

        // 检查余额预警
        if (balanceData.is_low_balance) {
          setShowLowBalanceAlert(true);
          setAlertMessage(`余额不足提醒：当前余额 ${balanceData.user.balance.toFixed(2)}元，建议及时充值`);
        }
      }

      // 获取可用的API列表
      const apisRes = await fetch('/api/chat');
      const apisData = await apisRes.json();

      if (apisData.success && apisData.apis.length > 0) {
        setAvailableApis(apisData.apis);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    // 检查是否已登录
    if (!userId) {
      alert('请先登录');
      window.location.href = '/login';
      return;
    }

    // 检查余额
    if (balance <= 0) {
      alert('余额不足，请先充值');
      window.location.href = '/login';
      return;
    }

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          api_config_id: selectedApiId,
          model: selectedModelId,
          messages: [{ role: 'user', content: input }],
        }),
      });

      const data = await response.json();

      if (data.success) {
        const botMessage: Message = {
          role: 'assistant',
          content: data.response,
          model: selectedModelId,
          cost: data.usage.cost,
        };
        setMessages(prev => [...prev, botMessage]);
        setBalance(data.balance);

        // 检查是否触发余额预警
        if (data.alert_message) {
          setShowLowBalanceAlert(true);
          setAlertMessage(data.alert_message);
        }
      } else {
        const errorMessage: Message = {
          role: 'assistant',
          content: `错误: ${data.error}`,
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '请求失败，请稍后重试',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedModel = categories
    .flatMap(cat => cat.models.map(m => ({ ...m, category: cat.name, icon: cat.icon, color: cat.color })))
    .find(m => m.id === selectedModelId);

  const selectedApi = availableApis.find(a => a.id === selectedApiId);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <Navigation />

      {/* 余额预警横幅 */}
      {showLowBalanceAlert && (
        <div className="fixed top-16 left-0 right-0 z-50 p-3 text-center text-sm"
          style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
          <span>{alertMessage}</span>
          <Link href="/login" className="ml-4 underline font-medium">立即充值</Link>
          <button
            onClick={() => setShowLowBalanceAlert(false)}
            className="ml-4 opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex-1 pt-16 flex">
        {/* Sidebar */}
        {showSidebar && (
          <aside
            className="w-72 border-r flex-shrink-0 hidden md:block overflow-y-auto"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}
          >
            <div className="p-4">
              <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--text-muted)' }}>
                选择AI模型
              </h2>

              <div className="space-y-3">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    {/* Category Header */}
                    <button
                      onClick={() => setExpandedCategory(expandedCategory === cat.id ? '' : cat.id)}
                      className="w-full p-3 rounded-xl flex items-center gap-3 transition-all"
                      style={{
                        backgroundColor: expandedCategory === cat.id ? `${cat.color}15` : 'transparent',
                      }}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                          {cat.name}
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {cat.models.length} 个模型
                        </div>
                      </div>
                      <span style={{ color: 'var(--text-muted)' }}>
                        {expandedCategory === cat.id ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* Models in Category */}
                    {expandedCategory === cat.id && (
                      <div className="ml-4 mt-2 space-y-1">
                        {cat.models.map((model) => (
                          <button
                            key={model.id}
                            onClick={() => setSelectedModelId(model.id)}
                            className={`w-full p-3 rounded-lg text-left flex items-center justify-between transition-all ${
                              selectedModelId === model.id ? 'border-2' : 'border'
                            }`}
                            style={{
                              borderColor: selectedModelId === model.id ? cat.color : 'var(--card-border)',
                              backgroundColor: selectedModelId === model.id ? `${cat.color}10` : 'transparent',
                            }}
                          >
                            <div>
                              <div className="font-medium text-sm" style={{ color: 'var(--foreground)' }}>
                                {model.name}
                              </div>
                              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                ¥{model.displayPrice}/千字
                              </div>
                            </div>
                            {selectedModelId === model.id && (
                              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 选中的API信息 */}
            {selectedApi && (
              <div className="p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
                <h3 className="text-sm font-medium mb-3" style={{ color: 'var(--text-muted)' }}>
                  当前API配置
                </h3>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="font-medium text-sm mb-1">{selectedApi.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {selectedApi.provider} · {selectedApi.model}
                  </div>
                  <div className="mt-2 text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>成本价: </span>
                    <span>¥{selectedApi.cost_per_1k_tokens}/千token</span>
                  </div>
                  <div className="text-xs">
                    <span style={{ color: 'var(--text-muted)' }}>销售价: </span>
                    <span className="font-bold" style={{ color: 'var(--primary)' }}>¥{selectedApi.sale_price}/千token</span>
                  </div>
                </div>
              </div>
            )}

            {/* Balance */}
            <div className="absolute bottom-0 left-0 w-72 p-4 border-t" style={{ borderColor: 'var(--card-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>余额</span>
                <span className="text-xl font-bold" style={{ color: 'var(--primary)' }}>¥{balance.toFixed(2)}</span>
              </div>
              <Link
                href="/login"
                className="btn btn-primary btn-small w-full justify-center"
              >
                充值
              </Link>
            </div>
          </aside>
        )}

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header
            className="p-4 border-b flex items-center gap-4"
            style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}
          >
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="md:hidden p-2 rounded-lg"
              style={{ backgroundColor: 'var(--card-border)' }}
            >
              ☰
            </button>

            <div className="flex items-center gap-3 flex-1">
              {selectedModel && (
                <>
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ backgroundColor: `${selectedModel.color}20` }}
                  >
                    {selectedModel.icon}
                  </div>
                  <div>
                    <h1 className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {selectedModel.name}
                    </h1>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {selectedModel.category} · ¥{selectedModel.displayPrice}/千字
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
              余额: <span className="font-bold" style={{ color: 'var(--primary)' }}>¥{balance.toFixed(2)}</span>
            </div>
          </header>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="mb-6 animate-float">
                  <OtterMascot size={80} />
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
                  开始和 {selectedModel?.name} 对话
                </h2>
                <p className="text-sm max-w-md mb-6" style={{ color: 'var(--text-muted)' }}>
                  {userId ? '当前已连接真实API，按1.2倍价格计费' : '请先登录后使用真实API'}
                </p>

                {/* Quick prompts */}
                <div className="flex flex-wrap justify-center gap-2 max-w-lg">
                  {['帮我写一段代码', '解释一下量子计算', '推荐一本书', '写一首诗'].map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                      style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[70%] rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: msg.role === 'user' ? 'var(--chat-user-bg)' : 'var(--chat-bot-bg)',
                    color: msg.role === 'user' ? '#fff' : 'var(--foreground)',
                  }}
                >
                  {msg.role === 'assistant' && msg.model && (
                    <div className="text-xs mb-1 opacity-70 border-b pb-1 mb-2" style={{ borderColor: 'var(--card-border)' }}>
                      {msg.model} {msg.cost && `· ¥${msg.cost.toFixed(4)}`}
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: 'var(--chat-bot-bg)' }}>
                  <div className="loading-dots">
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <footer className="p-4 border-t" style={{ borderColor: 'var(--card-border)', backgroundColor: 'var(--card-bg)' }}>
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={userId ? '输入消息...' : '请先登录...'}
                className="flex-1 px-4 py-3 rounded-xl border outline-none focus:ring-2"
                style={{
                  backgroundColor: 'var(--background)',
                  borderColor: 'var(--card-border)',
                  color: 'var(--foreground)',
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading || !userId}
                className="btn btn-primary px-6"
              >
                发送
              </button>
            </form>
          </footer>
        </main>

        {/* Ad Sidebar */}
        <aside className="w-48 border-l p-4 hidden lg:block" style={{ borderColor: 'var(--card-border)' }}>
          <div className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>广告位</div>
          <div
            className="aspect-square rounded-lg flex items-center justify-center text-center p-2"
            style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
          >
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>广告区域<br />300×250</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
