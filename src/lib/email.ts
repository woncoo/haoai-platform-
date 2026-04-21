/**
 * 邮件发送工具
 * 支持 SMTP 发送邮件
 */

import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  from: string;
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

// 默认配置（需要替换为真实邮箱）
const defaultConfig: EmailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  user: process.env.SMTP_USER || '',
  password: process.env.SMTP_PASSWORD || '',
  from: process.env.SMTP_FROM || '好AI <noreply@haoai.com>',
};

// 创建 transporter
let transporter: nodemailer.Transporter | null = null;

export function createTransporter(config: EmailConfig = defaultConfig): nodemailer.Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });
}

// 初始化 transporter
export function initTransporter() {
  if (!transporter && defaultConfig.user && defaultConfig.password) {
    transporter = createTransporter();
  }
  return transporter;
}

// 发送邮件
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const transport = initTransporter();
    if (!transport) {
      return { success: false, error: '邮件服务未配置' };
    }

    await transport.sendMail({
      from: defaultConfig.from,
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]+>/g, ''),
    });

    return { success: true };
  } catch (error: any) {
    console.error('发送邮件失败:', error);
    return { success: false, error: error.message };
  }
}

// 测试邮件配置
export async function testEmailConfig(): Promise<boolean> {
  try {
    const transport = initTransporter();
    if (!transport) return false;

    await transport.verify();
    return true;
  } catch {
    return false;
  }
}
