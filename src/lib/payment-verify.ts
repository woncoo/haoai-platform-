/**
 * 支付回调签名验证
 * 防止伪造支付回调攻击
 */

import crypto from 'crypto';

// 微信支付签名验证
export function verifyWechatPaySignature(
  params: Record<string, string>,
  signature: string,
  apiKey: string
): boolean {
  // 微信支付签名算法
  // 1. 把所有参数按字典序排序
  // 2. 拼接成 key=value&key=value... 格式
  // 3. 最后拼接 API密钥
  // 4. MD5/SHA256签名

  const sortedKeys = Object.keys(params).sort();
  const signString = sortedKeys
    .filter((key) => key !== 'sign' && params[key])
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const fullString = `${signString}&key=${apiKey}`;
  const expectedSignature = crypto
    .createHash('md5')
    .update(fullString, 'utf8')
    .digest('hex')
    .toUpperCase();

  return signature === expectedSignature;
}

// 支付宝签名验证
export function verifyAlipaySignature(
  params: Record<string, string>,
  signature: string,
  alipayPublicKey: string
): boolean {
  // 支付宝RSA2签名验证
  const signType = params.sign_type || 'RSA2';

  if (signType === 'RSA2') {
    const signString = Object.keys(params)
      .sort()
      .filter((key) => key !== 'sign' && key !== 'sign_type' && params[key])
      .map((key) => `${key}=${params[key]}`)
      .join('&');

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signString, 'utf8');
    return verify.verify(alipayPublicKey, signature, 'base64');
  }

  return false;
}

// 生成支付签名（用于主动查询订单）
export function signWechatPayParams(
  params: Record<string, string>,
  apiKey: string
): string {
  const sortedKeys = Object.keys(params).sort();
  const signString = sortedKeys
    .filter((key) => params[key])
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  const fullString = `${signString}&key=${apiKey}`;
  return crypto
    .createHash('md5')
    .update(fullString, 'utf8')
    .digest('hex')
    .toUpperCase();
}
