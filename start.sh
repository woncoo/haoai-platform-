#!/bin/bash
# 好AI - AI聚合平台启动脚本

cd "$(dirname "$0")"

echo "=========================================="
echo "  好AI - AI模型聚合平台"
echo "=========================================="

# 检查端口占用
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port 3000 is in use"
    echo "   Killing existing process..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# 启动服务
echo "🚀 Starting server..."
npm run dev > /tmp/ai-platform.log 2>&1 &
DEV_PID=$!

# 等待启动
sleep 5

# 检查是否成功
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Server started successfully!"
    echo ""
    echo "📍 Local:   http://localhost:3000"
    echo "📍 Network: http://$(ifconfig en0 2>/dev/null | grep 'inet ' | awk '{print $2}'):3000"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=========================================="

    # 保持运行
    wait $DEV_PID
else
    echo "❌ Server failed to start"
    echo "Check log: /tmp/ai-platform.log"
    tail -20 /tmp/ai-platform.log
fi
