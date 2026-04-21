#!/usr/bin/env node

/**
 * 发送每日报告邮件
 * 用法: npx ts-node scripts/send-daily-report.ts
 *
 * 建议在 crontab 中配置定时执行:
 * 0 9 * * * cd /path/to/project && npx ts-node scripts/send-daily-report.ts >> /var/log/daily-report.log 2>&1
 */

import { generateDailyReport, generateReportHtml } from '../src/lib/daily-report';
import { sendEmail } from '../src/lib/email';

async function main() {
  console.log('📊 开始生成日报...');

  // 生成昨天的报表
  const report = generateDailyReport(new Date());
  console.log(`📅 日期: ${report.date}`);
  console.log(`💰 昨日充值: ¥${report.totalRecharge}`);
  console.log(`💸 昨日消费: ¥${report.totalConsumption}`);
  console.log(`👥 用户数: ${report.userStats.length}`);

  // 生成HTML
  const html = generateReportHtml(report);

  // 收件人邮箱（从环境变量或命令行参数获取）
  const recipientEmail = process.env.DAILY_REPORT_EMAIL || 'sunbai@example.com';

  console.log(`📧 发送到: ${recipientEmail}`);

  // 发送邮件
  const result = await sendEmail({
    to: recipientEmail,
    subject: `🦦 好AI日报 - ${report.date}`,
    html,
  });

  if (result.success) {
    console.log('✅ 邮件发送成功!');
  } else {
    console.error('❌ 邮件发送失败:', result.error);
    process.exit(1);
  }
}

main().catch(console.error);
