import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { generateDailyReport, generateReportHtml } from '@/lib/daily-report';
import { sendEmail } from '@/lib/email';

// GET /api/admin/daily-report - 获取日报
export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    // 支持指定日期，默认昨天
    const searchParams = request.nextUrl.searchParams;
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const report = generateDailyReport(targetDate);
    const html = generateReportHtml(report);

    // 如果是HTML请求，返回HTML
    const format = searchParams.get('format');
    if (format === 'html') {
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' },
      });
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('生成日报失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}

// POST /api/admin/daily-report - 发送日报到邮箱
export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { email, date } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, error: '请提供邮箱地址' },
        { status: 400 }
      );
    }

    const targetDate = date ? new Date(date) : new Date();
    const report = generateDailyReport(targetDate);
    const html = generateReportHtml(report);

    const result = await sendEmail({
      to: email,
      subject: `🦦 好AI日报 - ${report.date}`,
      html,
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `日报已发送到 ${email}`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('发送日报失败:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 401 }
    );
  }
}
