#!/usr/bin/env node

/**
 * 发送每日报告邮件 - 独立脚本
 * 可以通过 crontab 或 launchd 定时执行
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { generateDailyReport, generateReportHtml } = require('../src/lib/daily-report');
const { sendEmail } = require('../src/lib/email');

async function main() {
  console.log('📊 好AI - 发送日报');
  console.log('==================');

  const report = generateDailyReport(new Date());
  console.log(`📅 日期: ${report.date}`);
  console.log(`💰 昨日充值: ¥${report.totalRecharge}`);
  console.log(`💸 昨日消费: ¥${report.totalConsumption}`);
  console.log(`👥 用户数: ${report.userStats.length}`);
  console.log(`🏦 平台余额: ¥${report.platformBalance}`);

  const html = generateReportHtml(report);
  const recipientEmail = process.env.DAILY_REPORT_EMAIL || 'woncoo@hotmail.com';

  console.log(`📧 发送到: ${recipientEmail}`);

  const result = await sendEmail({
    to: recipientEmail,
    subject: `🦦 好AI日报 - ${report.date}`,
    html,
  });

  if (result.success) {
    console.log('✅ 发送成功!');
  } else {
    console.error('❌ 发送失败:', result.error);
    process.exit(1);
  }
}

main().catch(console.error);
