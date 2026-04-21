/**
 * 精确Token计算
 * 使用 tiktoken 库实现
 * 包含字符估算作为降级方案
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let encodingCache: any = null;
let useFallback = false;
let initPromise: Promise<void> | null = null;

async function initEncoding() {
  if (useFallback) return;
  if (encodingCache) return;

  try {
    const tiktoken = await import('tiktoken');
    // 使用 cl100k_base 编码器（GPT-4/ChatGPT 使用的）
    encodingCache = tiktoken.default.encoding_for_model('gpt-4');
  } catch (error) {
    console.warn('Tiktoken加载失败，使用字符估算:', error);
    useFallback = true;
  }
}

// 初始化编码器
initEncoding();

/**
 * 计算文本的Token数量
 * @param text 输入文本
 * @returns Token数量
 */
export function countTokens(text: string): number {
  try {
    if (!useFallback && encodingCache) {
      const tokens = encodingCache.encode(text);
      return tokens.length;
    }
  } catch (error) {
    console.error('Token counting error:', error);
  }

  // 备用：字符估算（中文字符约2个token，英文约4个字符1个token）
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 2 + otherChars / 4);
}

/**
 * 计算消息数组的总Token数
 * @param messages 消息数组 [{role, content}]
 * @returns 总Token数
 */
export function countMessageTokens(messages: Array<{role: string; content: string}>): number {
  let total = 0;

  // 每个消息有额外的 overhead
  const overheadPerMessage = 4;

  for (const msg of messages) {
    total += countTokens(msg.content);
    total += overheadPerMessage;
  }

  // 额外 overhead
  total += 3; // assistant overhead

  return total;
}

/**
 * 估算一次对话的总消耗Token
 * @param messages 用户消息数组
 * @param responseText AI回复文本
 * @returns 总Token数
 */
export function estimateTotalTokens(
  messages: Array<{role: string; content: string}>,
  responseText: string
): { inputTokens: number; outputTokens: number; totalTokens: number } {
  const inputTokens = countMessageTokens(messages);
  const outputTokens = countTokens(responseText);

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}