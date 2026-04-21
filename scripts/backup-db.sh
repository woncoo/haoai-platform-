#!/bin/bash
# 数据库备份脚本
# 使用方法: ./scripts/backup-db.sh
# 可添加到 crontab: 0 2 * * * /Users/sunbai/Desktop/ai-aggregation-platform/scripts/backup-db.sh

set -e

# 配置
DB_PATH="/Users/sunbai/Desktop/ai-aggregation-platform/data/haoai.db"
BACKUP_DIR="/Users/sunbai/Desktop/ai-aggregation-platform/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="haoai_backup_${TIMESTAMP}.db"

# 创建备份目录（如果不存在）
mkdir -p "$BACKUP_DIR"

# 复制数据库文件
cp "$DB_PATH" "$BACKUP_DIR/$BACKUP_FILE"

# 压缩备份文件
gzip "$BACKUP_DIR/$BACKUP_FILE"

# 删除7天前的旧备份
find "$BACKUP_DIR" -name "*.db.gz" -mtime +7 -delete

echo "[$(date)] 数据库备份完成: $BACKUP_FILE.gz"

# 可选：上传到云存储（取消注释并配置）
# rclone copy "$BACKUP_DIR/$BACKUP_FILE.gz" gdrive:haoai-backups/