// AI模型完整配置 v2.0
// 包含所有世界顶级模型及其子版本

export interface ModelVersion {
  id: string;
  name: string;
  bulkPrice: number;      // 批发价（大批量采购）
  displayPrice: number;  // 销售价（自动=批发价×1.2）
  contextWindow: number;  // 上下文窗口
  desc: string;
}

export interface ModelCategory {
  id: string;
  name: string;
  provider: string;
  icon: string;
  color: string;
  models: ModelVersion[];
}

export const modelConfig: ModelCategory[] = [
  // ==================== OpenAI ====================
  {
    id: 'openai',
    name: 'OpenAI',
    provider: 'OpenAI',
    icon: '🤖',
    color: '#10a37f',
    models: [
      { id: 'gpt-5', name: 'GPT-5', bulkPrice: 0.10, displayPrice: 0.12, contextWindow: 200000, desc: '最新旗舰，通用能力最强' },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', bulkPrice: 0.07, displayPrice: 0.084, contextWindow: 128000, desc: '快速响应，性价比高' },
      { id: 'gpt-4o', name: 'GPT-4o', bulkPrice: 0.05, displayPrice: 0.06, contextWindow: 128000, desc: '多模态旗舰，支持语音' },
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini', bulkPrice: 0.015, displayPrice: 0.018, contextWindow: 128000, desc: '轻量快速，性价比之王' },
      { id: 'o3-mini', name: 'o3 Mini', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 128000, desc: '推理能力强，适合复杂问题' },
      { id: 'o1-mini', name: 'o1 Mini', bulkPrice: 0.018, displayPrice: 0.022, contextWindow: 65536, desc: '快速推理，适合编程' },
      { id: 'o1-pro', name: 'o1 Pro', bulkPrice: 0.15, displayPrice: 0.18, contextWindow: 128000, desc: '最强制版推理能力' },
    ],
  },

  // ==================== Anthropic Claude ====================
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    provider: 'Anthropic',
    icon: '🧠',
    color: '#d97706',
    models: [
      { id: 'claude-4-6-opus', name: 'Claude 4.6 Opus', bulkPrice: 0.15, displayPrice: 0.18, contextWindow: 200000, desc: '最强大模型，专家级任务' },
      { id: 'claude-4-6-sonnet', name: 'Claude 4.6 Sonnet', bulkPrice: 0.03, displayPrice: 0.036, contextWindow: 200000, desc: '均衡之选，性价比最高' },
      { id: 'claude-4-opus', name: 'Claude 4 Opus', bulkPrice: 0.14, displayPrice: 0.168, contextWindow: 200000, desc: '超大上下文，分析能力强' },
      { id: 'claude-4-sonnet', name: 'Claude 4 Sonnet', bulkPrice: 0.027, displayPrice: 0.032, contextWindow: 200000, desc: '日常使用，完全够用' },
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', bulkPrice: 0.015, displayPrice: 0.018, contextWindow: 200000, desc: '长上下文优选' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', bulkPrice: 0.012, displayPrice: 0.015, contextWindow: 200000, desc: '经典版本，稳定可靠' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', bulkPrice: 0.008, displayPrice: 0.01, contextWindow: 200000, desc: '极速响应，适合简单任务' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', bulkPrice: 0.075, displayPrice: 0.09, contextWindow: 200000, desc: '超大杯，适合复杂分析' },
    ],
  },

  // ==================== Google Gemini ====================
  {
    id: 'google',
    name: 'Google Gemini',
    provider: 'Google',
    icon: '✨',
    color: '#4285f4',
    models: [
      { id: 'gemini-3-ultra', name: 'Gemini 3 Ultra', bulkPrice: 0.07, displayPrice: 0.084, contextWindow: 2000000, desc: 'Google最强大模型' },
      { id: 'gemini-3-pro', name: 'Gemini 3 Pro', bulkPrice: 0.035, displayPrice: 0.042, contextWindow: 1000000, desc: '旗舰版本，多模态强' },
      { id: 'gemini-3-flash', name: 'Gemini 3 Flash', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 1000000, desc: '最新快速版本' },
      { id: 'gemini-2-5-pro', name: 'Gemini 2.5 Pro', bulkPrice: 0.025, displayPrice: 0.03, contextWindow: 1000000, desc: '进阶版本，稳定可靠' },
      { id: 'gemini-2-0-flash', name: 'Gemini 2.0 Flash', bulkPrice: 0.008, displayPrice: 0.01, contextWindow: 1000000, desc: '极速响应，高性价比' },
      { id: 'gemini-2-0-flash-thinking', name: 'Gemini 2.0 Flash Thinking', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 1000000, desc: '推理增强版' },
      { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', bulkPrice: 0.0125, displayPrice: 0.015, contextWindow: 2000000, desc: '超长上下文，经典之选' },
      { id: 'gemini-1-5-flash', name: 'Gemini 1.5 Flash', bulkPrice: 0.0035, displayPrice: 0.0042, contextWindow: 1000000, desc: '轻量快速，适合日常' },
    ],
  },

  // ==================== xAI Grok ====================
  {
    id: 'xai',
    name: 'xAI Grok',
    provider: 'xAI',
    icon: '🌟',
    color: '#8b5cf6',
    models: [
      { id: 'grok-3-beta', name: 'Grok 3 Beta', bulkPrice: 0.03, displayPrice: 0.036, contextWindow: 131072, desc: '最新旗舰，实时信息强' },
      { id: 'grok-2-beta', name: 'Grok 2 Beta', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 131072, desc: '稳定版本，推理能力强' },
      { id: 'grok-2-mini-beta', name: 'Grok 2 Mini Beta', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 131072, desc: '轻量快速，性价比高' },
      { id: 'grok-1', name: 'Grok 1', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 131072, desc: '开源版本' },
    ],
  },

  // ==================== DeepSeek ====================
  {
    id: 'deepseek',
    name: 'DeepSeek',
    provider: 'DeepSeek',
    icon: '🔵',
    color: '#1e3a5f',
    models: [
      { id: 'deepseek-v3', name: 'DeepSeek V3', bulkPrice: 0.014, displayPrice: 0.017, contextWindow: 64000, desc: '国产旗舰，中文优化强' },
      { id: 'deepseek-r1', name: 'DeepSeek R1', bulkPrice: 0.027, displayPrice: 0.032, contextWindow: 64000, desc: '推理能力强，开源免费' },
      { id: 'deepseek-r1-distill-qwen', name: 'DeepSeek R1 Distill Qwen', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 8192, desc: '蒸馏版，适合简单任务' },
      { id: 'deepseek-r1-distill-llama', name: 'DeepSeek R1 Distill Llama', bulkPrice: 0.012, displayPrice: 0.014, contextWindow: 8192, desc: '蒸馏版，英文能力强' },
      { id: 'deepseek-coder-v3', name: 'DeepSeek Coder V3', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 64000, desc: '代码专用版本' },
      { id: 'deepseek-math-v3', name: 'DeepSeek Math V3', bulkPrice: 0.015, displayPrice: 0.018, contextWindow: 64000, desc: '数学专用版本' },
    ],
  },

  // ==================== Alibaba Qwen ====================
  {
    id: 'qwen',
    name: 'Alibaba Qwen',
    provider: 'Alibaba',
    icon: '🏹',
    color: '#ff6a00',
    models: [
      { id: 'qwen-max', name: 'Qwen Max', bulkPrice: 0.04, displayPrice: 0.048, contextWindow: 32000, desc: '阿里最强模型' },
      { id: 'qwen-plus', name: 'Qwen Plus', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 32000, desc: '进阶版本，性价比高' },
      { id: 'qwen-turbo', name: 'Qwen Turbo', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 32000, desc: '快速响应' },
      { id: 'qwen-long', name: 'Qwen Long', bulkPrice: 0.025, displayPrice: 0.03, contextWindow: 1000000, desc: '超长上下文版' },
      { id: 'qwen-coder-turbo', name: 'Qwen Coder Turbo', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 32000, desc: '代码专用版' },
      { id: 'qwq-32b', name: 'QWQ 32B', bulkPrice: 0.018, displayPrice: 0.022, contextWindow: 32000, desc: '推理增强版' },
    ],
  },

  // ==================== Baidu ERNIE ====================
  {
    id: 'baidu',
    name: 'Baidu ERNIE',
    provider: 'Baidu',
    icon: '🌸',
    color: '#252525',
    models: [
      { id: 'ernie-4', name: 'ERNIE 4', bulkPrice: 0.035, displayPrice: 0.042, contextWindow: 14000, desc: '百度最强模型' },
      { id: 'ernie-4-turbo', name: 'ERNIE 4 Turbo', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 14000, desc: '快速版本' },
      { id: 'ernie-3.5', name: 'ERNIE 3.5', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 14000, desc: '经典版本' },
      { id: 'ernie-speed', name: 'ERNIE Speed', bulkPrice: 0.008, displayPrice: 0.01, contextWindow: 14000, desc: '极速版本' },
      { id: 'ernie-lite', name: 'ERNIE Lite', bulkPrice: 0.005, displayPrice: 0.006, contextWindow: 14000, desc: '轻量版本' },
    ],
  },

  // ==================== Mistral ====================
  {
    id: 'mistral',
    name: 'Mistral AI',
    provider: 'Mistral',
    icon: '🌊',
    color: '#5c5c5c',
    models: [
      { id: 'mistral-large', name: 'Mistral Large', bulkPrice: 0.04, displayPrice: 0.048, contextWindow: 128000, desc: '旗舰版本' },
      { id: 'mistral-medium', name: 'Mistral Medium', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 128000, desc: '均衡版本' },
      { id: 'mistral-small', name: 'Mistral Small', bulkPrice: 0.008, displayPrice: 0.01, contextWindow: 128000, desc: '轻量版本' },
      { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', bulkPrice: 0.018, displayPrice: 0.022, contextWindow: 64000, desc: 'MoE大模型' },
      { id: 'mixtral-8x7b', name: 'Mixtral 8x7B', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 32000, desc: '经典MoE' },
    ],
  },

  // ==================== Meta Llama ====================
  {
    id: 'meta',
    name: 'Meta Llama',
    provider: 'Meta',
    icon: '🦙',
    color: '#0668d9',
    models: [
      { id: 'llama-4-405b', name: 'Llama 4 405B', bulkPrice: 0.06, displayPrice: 0.072, contextWindow: 128000, desc: 'Meta最强开源' },
      { id: 'llama-4-70b', name: 'Llama 4 70B', bulkPrice: 0.025, displayPrice: 0.03, contextWindow: 128000, desc: '中杯旗舰' },
      { id: 'llama-4-8b', name: 'Llama 4 8B', bulkPrice: 0.008, displayPrice: 0.01, contextWindow: 128000, desc: '轻量开源' },
      { id: 'llama-3-70b', name: 'Llama 3 70B', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 128000, desc: '经典旗舰' },
      { id: 'llama-3-8b', name: 'Llama 3 8B', bulkPrice: 0.006, displayPrice: 0.007, contextWindow: 128000, desc: '轻量经典' },
    ],
  },

  // ==================== Cohere ====================
  {
    id: 'cohere',
    name: 'Cohere',
    provider: 'Cohere',
    icon: '🔮',
    color: '#e63b7a',
    models: [
      { id: 'command-r-plus-2', name: 'Command R+ 2', bulkPrice: 0.035, displayPrice: 0.042, contextWindow: 128000, desc: '旗舰版本' },
      { id: 'command-r-plus', name: 'Command R+', bulkPrice: 0.03, displayPrice: 0.036, contextWindow: 128000, desc: '经典旗舰' },
      { id: 'command-r', name: 'Command R', bulkPrice: 0.015, displayPrice: 0.018, contextWindow: 128000, desc: '均衡版本' },
      { id: 'command', name: 'Command', bulkPrice: 0.008, displayPrice: 0.01, contextWindow: 4096, desc: '轻量版本' },
    ],
  },

  // ==================== AI21 ====================
  {
    id: 'ai21',
    name: 'AI21',
    provider: 'AI21',
    icon: '🏛️',
    color: '#3c3c3c',
    models: [
      { id: 'jamba-1.5-large', name: 'Jamba 1.5 Large', bulkPrice: 0.04, displayPrice: 0.048, contextWindow: 256000, desc: '超大上下文' },
      { id: 'jamba-1.5-medium', name: 'Jamba 1.5 Medium', bulkPrice: 0.02, displayPrice: 0.024, contextWindow: 256000, desc: '均衡版本' },
      { id: 'jamba-1.5-mini', name: 'Jamba 1.5 Mini', bulkPrice: 0.01, displayPrice: 0.012, contextWindow: 256000, desc: '轻量快速' },
    ],
  },
];

// 获取所有模型（扁平化）
export function getAllModels(): Array<{ id: string; name: string; provider: string; icon: string; color: string; bulkPrice: number; displayPrice: number; contextWindow: number; desc: string; category: string }> {
  const result = [];
  for (const cat of modelConfig) {
    for (const model of cat.models) {
      result.push({
        ...model,
        provider: cat.provider,
        icon: cat.icon,
        color: cat.color,
        category: cat.name,
      });
    }
  }
  return result;
}

// 根据ID获取模型
export function getModelById(id: string) {
  for (const cat of modelConfig) {
    for (const model of cat.models) {
      if (model.id === id) {
        return { ...model, provider: cat.provider, icon: cat.icon, color: cat.color, category: cat.name };
      }
    }
  }
  return null;
}

// 获取模型分类
export function getModelCategories() {
  return modelConfig;
}

// 计算价格（批发价 × 1.2）
export function calculatePrice(bulkPrice: number): number {
  return Math.ceil(bulkPrice * 1.2 * 1000) / 1000;
}
