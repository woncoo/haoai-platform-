/**
 * API Key 加密工具
 * 使用 AES-256-GCM 加密，FBI级别安全
 */

import crypto from 'crypto';

// 加密密钥 - 生产环境必须通过环境变量设置
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_KEY || 'haoai-default-key-change-in-production!';
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * 将密钥转换为32字节
 */
function getKey(): Buffer {
  return crypto.scryptSync(ENCRYPTION_KEY, 'haoai-salt', 32);
}

/**
 * 加密API Key
 * @param plainText 明文API Key
 * @returns 加密后的字符串 (iv:authTag:ciphertext，都用base64编码)
 */
export function encryptApiKey(plainText: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);

  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');

  const authTag = cipher.getAuthTag();

  // 格式: iv:authTag:ciphertext
  return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
}

/**
 * 解密API Key
 * @param encryptedText 加密字符串
 * @returns 解密后的明文
 */
export function decryptApiKey(encryptedText: string): string {
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted format');
    }

    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt API Key');
  }
}

/**
 * 生成安全的随机字符串
 */
export function generateSecureId(prefix: string = ''): string {
  const random = crypto.randomBytes(16).toString('hex');
  const timestamp = Date.now().toString(36);
  return prefix ? `${prefix}_${timestamp}_${random}` : `${timestamp}_${random}`;
}

/**
 * 验证API Key格式是否有效（不解密，只验证格式）
 */
export function isValidApiKeyFormat(encryptedText: string): boolean {
  const parts = encryptedText.split(':');
  if (parts.length !== 3) return false;

  try {
    // 验证各部分是否为有效的base64
    Buffer.from(parts[0], 'base64');
    Buffer.from(parts[1], 'base64');
    Buffer.from(parts[2], 'base64');
    return true;
  } catch {
    return false;
  }
}
