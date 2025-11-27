# Docker部署指南

本指南详细说明如何在不同环境中部署现代化CMS系统，包括系统要求、安装步骤、配置说明、启动服务、验证测试和故障排查等内容。

## 📋 目录

- [系统要求](#系统要求)
- [安装步骤](#安装步骤)
- [环境配置](#环境配置)
- [启动服务](#启动服务)
- [验证测试](#验证测试)
- [故障排查](#故障排查)
- [性能调优](#性能调优)
- [安全加固](#安全加固)
- [监控维护](#监控维护)

## 🖥️ 系统要求

### 最低要求

| 组件 | 最低配置 | 推荐配置 | 说明 |
|------|----------|----------|------|
| CPU | 2核心 | 4核心 | 处理API请求和数据库查询 |
| 内存 | 2GB | 4GB+ | Docker容器和数据库运行 |
| 存储 | 10GB | 50GB+ | 系统文件、数据库、日志 |
| 网络 | 1Mbps | 10Mbps+ | 应用访问和内容传输 |

### 软件依赖

| 软件 | 版本要求 | 安装说明 |
|------|----------|----------|
| Docker Engine | 19.03+ | [Docker官方文档](https://docs.docker.com/engine/install/) |
| Docker Compose | 1.25+ | [Compose官方文档](https://docs.docker.com/compose/install/) |
| 操作系统 | Linux/macOS/Windows | 推荐Ubuntu 20.04+、macOS 10.15+、Windows 10+ |
| 内核 | Linux 4.15+ | 仅Linux系统 |

### 端口要求

| 端口 | 服务 | 用途 | 外部访问 |
|------|------|------|----------|
| 80 | Nginx | HTTP入口 | ✅ |
| 443 | Nginx | HTTPS入口 | ✅ |
| 8000 | FastAPI | API服务 | ⚠️ (仅开发) |
| 3000 | Admin Frontend | 管理后台 | ⚠️ (仅开发) |
| 3001 | Blog Frontend | 博客前端 | ⚠️ (仅开发) |
| 5432 | PostgreSQL | 数据库 | ❌ |
| 6379 | Redis | 缓存 | ❌ |

## 🔧 安装步骤

### 1. Docker安装

#### Ubuntu/Debian系统

```bash
# 更新包索引
sudo apt update

# 安装依赖
sudo apt install apt-transport-https ca-certificates curl gnupg lsb-release

# 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 设置稳定版仓库
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker Engine
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker compose-plugin

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker

# 将当前用户添加到docker组
sudo usermod -aG docker $USER

# 重新登录或执行
newgrp docker
```

#### CentOS/RHEL系统

```bash
# 安装Docker
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io docker compose-plugin

# 启动服务
sudo systemctl start docker
sudo systemctl enable docker

# 添加用户到docker组
sudo usermod -aG docker $USER
```

#### macOS系统

```bash
# 使用Homebrew安装
brew install --cask docker

# 或者下载Docker Desktop
# https://www.docker.com/products/docker-desktop
```

#### Windows系统

1. 下载并安装 [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
2. 启用WSL 2功能
3. 重启系统

### 2. Docker Compose验证

```bash
# 验证Docker安装
docker --version
docker compose --version

# 测试Docker运行
docker run hello-world
```

## ⚙️ 环境配置

### 1. 项目文件准备

```bash
# 克隆项目（或下载项目文件）
git clone <repository-url>
cd modern-cms

# 检查项目文件结构
ls -la
```

### 2. 环境变量配置

#### 创建生产环境配置

```bash
# 复制环境变量模板
cp .env.example .env.prod

# 编辑生产环境配置
vim .env.prod
```

#### 环境变量详解

```bash
# ===========================================
# 数据库配置
# ===========================================
DATABASE_URL=postgresql://username:password@postgres:5432/cms_db
DATABASE_ASYNC_URL=postgresql+asyncpg://username:password@postgres:5432/cms_db

# ===========================================
# Redis配置
# ===========================================
REDIS_URL=redis://redis:6379/0

# ===========================================
# 应用配置
# ===========================================
SECRET_KEY=your-super-secret-key-change-in-production-min-32-chars
DEBUG=false
APP_ENV=production
APP_NAME="Modern CMS"
APP_VERSION=1.0.0

# ===========================================
# 安全配置
# ===========================================
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com
CORS_ALLOW_CREDENTIALS=true

# ===========================================
# 文件上传配置
# ===========================================
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_DIR=/app/uploads

# ===========================================
# 邮件配置 (可选)
# ===========================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_USE_TLS=true

# ===========================================
# 日志配置
# ===========================================
LOG_LEVEL=INFO
LOG_FORMAT=json

# ===========================================
# 缓存配置
# ===========================================
CACHE_TTL=3600  # 1小时
SESSION_TTL=86400  # 24小时
```

#### Docker Compose配置

```yaml
# docker compose.prod.yml
version: '3.8'

services:
  # PostgreSQL数据库
  postgres:
    image: postgres:15-alpine
    container_name: cms_postgres
    environment:
      POSTGRES_USER: ${DB_USERNAME:-postgres}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME:-cms_db}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups  # 备份目录
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USERNAME:-postgres}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - cms_network

  # Redis缓存
  redis:
    image: redis:7-alpine
    container_name: cms_redis
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
    restart: unless-stopped
    networks:
      - cms_network

  # FastAPI后端
  api:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: cms_api
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - DATABASE_ASYNC_URL=${DATABASE_ASYNC_URL}
      - REDIS_URL=${REDIS_URL}
      - SECRET_KEY=${SECRET_KEY}
      - DEBUG=${DEBUG}
      - ALLOWED_ORIGINS=${ALLOWED_ORIGINS}
      - LOG_LEVEL=${LOG_LEVEL}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - cms_network
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Nginx反向代理
  nginx:
    image: nginx:alpine
    container_name: cms_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.prod.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # SSL证书目录
      - nginx_logs:/var/log/nginx
    depends_on:
      - api
      - admin
      - blog
    restart: unless-stopped
    networks:
      - cms_network

volumes:
  postgres_data:
  redis_data:
  nginx_logs:

networks:
  cms_network:
    driver: bridge
```

### 3. Nginx生产配置

创建生产环境Nginx配置文件 `nginx/nginx.prod.conf`:

```nginx
# 主配置
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    # 基础设置
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # 日志格式
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    
    access_log /var/log/nginx/access.log main;
    
    # 性能优化
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 10M;
    
    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # 上游服务器
    upstream api_backend {
        server api:8000;
        keepalive 32;
    }
    
    upstream admin_backend {
        server admin:80;
        keepalive 32;
    }
    
    upstream blog_backend {
        server blog:80;
        keepalive 32;
    }
    
    # HTTP重定向到HTTPS
    server {
        listen 80;
        server_name _;
        return 301 https://$server_name$request_uri;
    }
    
    # HTTPS主服务器
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;
        
        # SSL证书配置
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;
        
        # API代理
        location /api/ {
            proxy_pass http://api_backend/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_connect_timeout 30s;
            proxy_send_timeout 30s;
            proxy_read_timeout 30s;
        }
        
        # 静态文件代理 (API服务)
        location /uploads/ {
            proxy_pass http://api_backend/uploads/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_cache_valid 200 302 1h;
            proxy_cache_valid 404 1m;
            expires 1h;
        }
        
        # 管理后台
        location /admin/ {
            proxy_pass http://admin_backend/admin/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # 博客前端
        location / {
            proxy_pass http://blog_backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
        
        # 健康检查
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## 🚀 启动服务

### 开发环境启动

```bash
# 1. 启动基础服务 (数据库、缓存)
docker compose up -d postgres redis

# 2. 等待数据库初始化完成
docker compose logs postgres

# 3. 启动所有服务
docker compose up -d

# 4. 查看服务状态
docker compose ps
```

### 生产环境启动

```bash
# 1. 构建生产镜像
docker compose -f docker compose.yml -f docker compose.prod.yml build --no-cache

# 2. 创建必要的目录
mkdir -p nginx/logs nginx/ssl backups

# 3. 设置SSL证书 (如果没有)
# 将您的SSL证书放到 nginx/ssl/ 目录
# cert.pem - 证书文件
# key.pem - 私钥文件

# 4. 启动生产服务
docker compose -f docker compose.yml -f docker compose.prod.yml up -d

# 5. 检查服务状态
docker compose -f docker compose.yml -f docker compose.prod.yml ps
```

### 服务依赖顺序

启动顺序很重要，确保依赖服务先启动：

```bash
# 1. 首先启动基础设施服务
docker compose up -d postgres redis

# 2. 等待数据库就绪 (约30秒)
sleep 30

# 3. 检查数据库健康状态
docker compose exec postgres pg_isready

# 4. 启动应用服务
docker compose up -d api

# 5. 启动前端服务
docker compose up -d admin blog

# 6. 最后启动Nginx
docker compose up -d nginx
```

## ✅ 验证测试

### 1. 基础连接测试

```bash
# 检查所有容器状态
docker compose ps

# 查看容器日志
docker compose logs --tail=50

# 检查容器资源使用
docker stats
```

### 2. 服务端点测试

#### API健康检查

```bash
# 检查API服务健康状态
curl -f http://localhost:8000/health

# 检查API文档
curl -f http://localhost:8000/docs

# 检查API根路径
curl -f http://localhost:8000/
```

#### 前端服务测试

```bash
# 检查管理后台
curl -f -I http://localhost:3000

# 检查博客前端
curl -f -I http://localhost:3001

# 检查Nginx代理
curl -f -I http://localhost/admin
curl -f -I http://localhost/
```

### 3. 数据库连接测试

```bash
# 检查PostgreSQL连接
docker compose exec postgres psql -U postgres -d cms_db -c "SELECT version();"

# 检查Redis连接
docker compose exec redis redis-cli ping

# 检查数据库连接数
docker compose exec postgres psql -U postgres -d cms_db -c "SELECT count(*) FROM pg_stat_activity;"
```

### 4. 功能测试

#### 用户注册测试

```bash
# 使用curl测试用户注册
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "testpassword123",
    "display_name": "Test User"
  }'
```

#### 内容创建测试

```bash
# 首先登录获取token
TOKEN=$(curl -s -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpassword123"}' | \
  python -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 创建内容
curl -X POST "http://localhost:8000/api/v1/content" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "测试文章",
    "content": "这是一篇测试文章的内容",
    "content_type": "post",
    "status": "published"
  }'
```

### 5. 性能测试

#### 负载测试工具安装

```bash
# 安装Apache Bench (Ubuntu/Debian)
sudo apt install apache2-utils

# 或安装hey (Go版本)
curl -LO https://github.com/rakyll/hey/releases/download/v0.0.1/hey_linux_amd64
chmod +x hey_linux_amd64
sudo mv hey_linux_amd64 /usr/local/bin/hey
```

#### 基础性能测试

```bash
# API响应时间测试
hey -n 100 -c 10 http://localhost:8000/health

# 管理页面性能测试
hey -n 50 -c 5 http://localhost/admin

# 博客首页性能测试
hey -n 100 -c 10 http://localhost/
```

### 6. 安全测试

```bash
# 检查HTTP头安全性
curl -I http://localhost/ | grep -E "(X-Frame-Options|X-XSS-Protection|X-Content-Type-Options)"

# 检查SSL配置 (如果使用HTTPS)
ssl-checker yourdomain.com 443

# 检查敏感文件访问
curl -f http://localhost/.env || echo "环境文件不可访问 (正确)"
curl -f http://localhost/admin/.env || echo "管理后台环境文件不可访问 (正确)"
```

## 🔧 故障排查

### 常见问题诊断

#### 1. 容器无法启动

**症状**: 容器状态为Exited或Restarting

```bash
# 查看容器日志
docker compose logs [service_name]

# 检查配置文件语法
docker compose config

# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

**解决方案**:

```bash
# 清理并重新创建容器
docker compose down -v
docker compose up -d --force-recreate

# 重新构建镜像
docker compose build --no-cache
docker compose up -d
```

#### 2. 数据库连接失败

**症状**: API服务无法连接数据库

```bash
# 检查数据库容器状态
docker compose ps postgres

# 检查数据库日志
docker compose logs postgres

# 测试数据库连接
docker compose exec postgres pg_isready -U postgres

# 检查网络连接
docker compose exec api ping postgres
```

**解决方案**:

```bash
# 重启数据库服务
docker compose restart postgres

# 检查环境变量
docker compose exec api env | grep DATABASE

# 手动连接测试
docker compose exec postgres psql -U postgres -d cms_db
```

#### 3. 前端无法访问API

**症状**: 浏览器控制台显示CORS错误或网络错误

```bash
# 检查CORS配置
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8000/api/v1/content

# 检查API服务状态
docker compose logs api
```

**解决方案**:

```bash
# 检查环境变量配置
docker compose exec api env | grep ALLOWED_ORIGINS

# 重启API服务
docker compose restart api

# 检查防火墙设置
sudo ufw status
sudo iptables -L
```

#### 4. 内存不足

**症状**: 容器被杀，系统响应慢

```bash
# 检查系统资源
free -h
df -h
docker stats

# 检查容器内存使用
docker compose exec api free -h
```

**解决方案**:

```bash
# 增加系统swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# 优化Docker配置
# 编辑 /etc/docker/daemon.json
{
  "default-runtime": "runc",
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2",
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 64000,
      "Soft": 64000
    }
  }
}

# 重启Docker服务
sudo systemctl restart docker
```

#### 5. 磁盘空间不足

**症状**: 无法写入文件，容器崩溃

```bash
# 检查磁盘使用情况
df -h
du -sh /var/lib/docker

# 清理Docker资源
docker system prune -a
docker volume prune

# 清理日志文件
sudo find /var/lib/docker/containers/*/ -name "*.log" -exec truncate -s 0 {} \;
```

### 日志分析

#### 实时查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f api
docker compose logs -f postgres

# 查看最近N行日志
docker compose logs --tail=100 api
```

#### 日志级别分析

```bash
# 过滤错误日志
docker compose logs api | grep -i error
docker compose logs api | grep -i exception

# 过滤警告日志
docker compose logs nginx | grep -i warn
```

### 网络诊断

```bash
# 检查容器网络
docker network ls
docker network inspect workspace_cms_network

# 检查DNS解析
docker compose exec api nslookup postgres
docker compose exec api getent hosts redis

# 测试网络连通性
docker compose exec api curl -f http://postgres:5432
docker compose exec api curl -f http://redis:6379
```

## ⚡ 性能调优

### 1. 数据库优化

#### PostgreSQL配置优化

创建 `postgresql.conf`:

```sql
-- 内存设置
shared_buffers = 256MB              -- 1/4内存
effective_cache_size = 1GB          -- 3/4内存
work_mem = 4MB                      -- 单查询内存
maintenance_work_mem = 64MB         -- 维护操作内存

-- 连接设置
max_connections = 200
superuser_reserved_connections = 3

-- WAL设置
wal_buffers = 16MB
checkpoint_completion_target = 0.7
wal_keep_size = 1GB

-- 查询计划
random_page_cost = 1.1              -- SSD优化
effective_io_concurrency = 200

-- 日志设置
log_min_duration_statement = 1000   -- 记录慢查询
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on

-- 自动统计信息
track_activities = on
track_counts = on
track_io_timing = on
```

#### 数据库索引优化

```sql
-- 创建性能监控表
CREATE TABLE IF NOT EXISTS query_stats AS
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE mean_time > 100  -- 记录平均执行时间超过100ms的查询
ORDER BY mean_time DESC;

-- 创建常用查询的复合索引
CREATE INDEX CONCURRENTLY idx_content_type_status_published 
ON content(content_type, status, published_at DESC) 
WHERE status = 'published';

-- 创建JSONB字段索引
CREATE INDEX CONCURRENTLY idx_content_metadata_gin 
ON content USING GIN(metadata);

-- 创建全文搜索索引
CREATE INDEX CONCURRENTLY idx_content_search_gin 
ON content USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));
```

### 2. Redis优化

#### Redis配置优化

```bash
# 备份原有配置
cp /etc/redis/redis.conf /etc/redis/redis.conf.backup

# 优化配置
redis-cli config set maxmemory 512mb
redis-cli config set maxmemory-policy allkeys-lru
redis-cli config set save "900 1 300 10 60 10000"
```

#### 应用层缓存策略

```python
# Redis缓存配置示例
CACHE_CONFIG = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://redis:6379/0",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            "COMPRESSOR": "django_redis.compressors.zlib.ZlibCompressor",
            "SERIALIZER": "django_redis.serializers.json.JSONSerializer",
        }
    }
}

# 缓存策略
CACHE_TTL = {
    "content": 3600,      # 内容缓存1小时
    "user_profile": 1800, # 用户资料缓存30分钟
    "menu": 7200,         # 菜单缓存2小时
    "settings": 86400,    # 设置缓存24小时
}
```

### 3. Nginx优化

#### 静态文件缓存

```nginx
# 静态文件缓存配置
location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    add_header Vary Accept-Encoding;
    gzip_static on;
}

# 媒体文件缓存
location /uploads/ {
    expires 1M;
    add_header Cache-Control "public";
    add_header Vary Accept-Encoding;
    
    # 启用sendfile
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    
    # 启用缓存
    proxy_cache_valid 200 302 1h;
    proxy_cache_valid 404 1m;
    expires 1h;
}
```

#### 连接优化

```nginx
# 连接优化
worker_connections 1024;
use epoll;
multi_accept on;

# 缓冲区优化
client_body_buffer_size 128k;
client_header_buffer_size 1k;
large_client_header_buffers 4 4k;
output_buffers 1 32k;
postpone_output 1460;

# 超时设置
client_body_timeout 12;
client_header_timeout 12;
keepalive_timeout 15;
send_timeout 10;
```

### 4. 应用优化

#### FastAPI优化

```python
# main.py 性能优化
from fastapi import FastAPI
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Modern CMS",
    docs_url="/docs" if settings.DEBUG else None,  # 生产环境关闭文档
    redoc_url="/redoc" if settings.DEBUG else None,
)

# 添加Gzip压缩
app.add_middleware(GZipMiddleware, minimum_size=1000)

# CORS优化
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
    max_age=86400,  # 24小时缓存预检请求
)
```

#### 数据库连接池优化

```python
# database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

# 数据库连接池配置
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=QueuePool,
    pool_size=20,           # 连接池大小
    max_overflow=30,        # 溢出连接数
    pool_pre_ping=True,     # 预检连接
    pool_recycle=3600,      # 连接回收时间
    echo=settings.DEBUG,    # SQL日志 (仅开发)
)
```

## 🔒 安全加固

### 1. 容器安全

#### 非root用户运行

```dockerfile
# Dockerfile.backend
FROM python:3.11-slim

# 创建非root用户
RUN groupadd -r appuser && useradd -r -g appuser appuser

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 创建必要目录
RUN mkdir -p /app/uploads && chown -R appuser:appuser /app

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8000

# 启动应用
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 只读文件系统

```yaml
# docker compose.prod.yml
services:
  api:
    build: ./backend
    read_only: true
    tmpfs:
      - /tmp
      - /app/uploads
    volumes:
      - ./uploads:/app/uploads:rw
```

#### 安全能力限制

```yaml
services:
  api:
    build: ./backend
    cap_drop:
      - ALL
    cap_add:
      - CHOWN
      - DAC_OVERRIDE
      - FOWNER
      - SETGID
      - SETUID
    security_opt:
      - no-new-privileges:true
```

### 2. 网络安全

#### 网络隔离

```yaml
services:
  postgres:
    networks:
      - database_network
  
  redis:
    networks:
      - cache_network
  
  api:
    networks:
      - app_network
      - database_network
      - cache_network

networks:
  database_network:
    driver: bridge
    internal: true  # 内部网络
  
  cache_network:
    driver: bridge
    internal: true
  
  app_network:
    driver: bridge
```

#### 端口限制

```yaml
services:
  postgres:
    ports: []  # 不暴露端口
  
  redis:
    ports: []  # 不暴露端口
  
  nginx:
    ports:
      - "80:80"
      - "443:443"
```

### 3. 数据安全

#### 环境变量加密

```bash
# 使用Docker secrets (推荐)
echo "my-secret-password" | docker secret create db_password -

# 或者使用外部密钥管理
# AWS Secrets Manager, HashiCorp Vault等
```

#### 数据加密

```sql
-- 启用表空间加密
ALTER TABLESPACE encrypted_ts ENCRYPTION ON;

-- 敏感字段加密
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 创建加密函数
CREATE OR REPLACE FUNCTION encrypt_field(plaintext TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(encrypt(plaintext::bytea, 'encryption_key', 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;
```

### 4. 访问控制

#### 防火墙配置

```bash
# Ubuntu/Debian
sudo ufw enable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow from 192.168.1.0/24 to any port 22

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

#### SSH安全

```bash
# 禁用root登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config

# 禁用密码登录
sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config

# 修改SSH端口
sudo sed -i 's/#Port 22/Port 2222/' /etc/ssh/sshd_config

# 重启SSH服务
sudo systemctl restart ssh
```

## 📊 监控维护

### 1. 健康检查

#### 应用层健康检查

```python
# health_check.py
from fastapi import FastAPI
from sqlalchemy import text
import redis
import httpx

app = FastAPI()

@app.get("/health/detailed")
async def detailed_health_check():
    health_status = {
        "status": "healthy",
        "timestamp": time.time(),
        "checks": {}
    }
    
    # 数据库健康检查
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT 1"))
            health_status["checks"]["database"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["database"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "unhealthy"
    
    # Redis健康检查
    try:
        r.ping()
        health_status["checks"]["redis"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["redis"] = {"status": "unhealthy", "error": str(e)}
        health_status["status"] = "unhealthy"
    
    # 外部API健康检查
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://httpbin.org/status/200", timeout=5)
            health_status["checks"]["external_api"] = {"status": "healthy"}
    except Exception as e:
        health_status["checks"]["external_api"] = {"status": "unhealthy", "error": str(e)}
    
    return health_status
```

#### Docker健康检查

```yaml
services:
  api:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
  
  postgres:
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
  
  redis:
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5
```

### 2. 日志收集

#### 结构化日志

```python
# logging_config.py
import logging
import json
from datetime import datetime

class JSONFormatter(logging.Formatter):
    def format(self, record):
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }
        
        # 添加额外字段
        if hasattr(record, 'user_id'):
            log_entry['user_id'] = record.user_id
        if hasattr(record, 'request_id'):
            log_entry['request_id'] = record.request_id
        
        return json.dumps(log_entry)

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    handlers=[logging.StreamHandler()],
    format='%(message)s'
)

# 应用JSON格式化器
logger = logging.getLogger()
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.handlers.clear()
logger.addHandler(handler)
```

#### 日志轮转

```yaml
# docker compose.yml
services:
  api:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
  
  postgres:
    logging:
      driver: "json-file"
      options:
        max-size: "50m"
        max-file: "5"
```

### 3. 性能监控

#### 资源监控脚本

```bash
#!/bin/bash
# monitor.sh - 系统监控脚本

# 检查磁盘使用率
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "警告: 磁盘使用率达到 ${DISK_USAGE}%"
    # 发送告警
fi

# 检查内存使用率
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "警告: 内存使用率达到 ${MEMORY_USAGE}%"
fi

# 检查容器状态
UNHEALTHY_CONTAINERS=$(docker compose ps --filter health=unhealthy -q | wc -l)
if [ $UNHEALTHY_CONTAINERS -gt 0 ]; then
    echo "警告: 发现 $UNHEALTHY_CONTAINERS 个不健康的容器"
fi

# 检查API响应时间
API_RESPONSE_TIME=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:8000/health)
if (( $(echo "$API_RESPONSE_TIME > 1.0" | bc -l) )); then
    echo "警告: API响应时间超过1秒: ${API_RESPONSE_TIME}s"
fi
```

#### Grafana监控面板

```yaml
# docker compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3002:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
    volumes:
      - grafana_data:/var/lib/grafana

  node_exporter:
    image: prom/node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro

volumes:
  prometheus_data:
  grafana_data:
```

### 4. 备份恢复

#### 自动备份脚本

```bash
#!/bin/bash
# backup.sh - 数据库备份脚本

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cms_backup_${DATE}.sql"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 数据库备份
docker compose exec -T postgres pg_dump -U postgres cms_db > $BACKUP_DIR/$BACKUP_FILE

# 压缩备份文件
gzip $BACKUP_DIR/$BACKUP_FILE

# 删除7天前的备份
find $BACKUP_DIR -name "cms_backup_*.sql.gz" -mtime +7 -delete

# 上传到云存储 (可选)
# aws s3 cp $BACKUP_DIR/cms_backup_${DATE}.sql.gz s3://your-backup-bucket/

echo "备份完成: $BACKUP_FILE.gz"
```

#### 恢复脚本

```bash
#!/bin/bash
# restore.sh - 数据库恢复脚本

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <backup_file>"
    exit 1
fi

# 确认操作
read -p "这将覆盖当前数据库，确定继续? (y/N): " confirm
if [ "$confirm" != "y" ]; then
    echo "操作已取消"
    exit 1
fi

# 停止应用服务
docker compose stop api

# 解压备份文件
if [[ $BACKUP_FILE == *.gz ]]; then
    gunzip -c $BACKUP_FILE > /tmp/restore.sql
else
    cp $BACKUP_FILE /tmp/restore.sql
fi

# 恢复数据库
docker compose exec -T postgres psql -U postgres cms_db < /tmp/restore.sql

# 重启应用服务
docker compose start api

echo "恢复完成"
```

### 5. 维护任务

#### 定期维护脚本

```bash
#!/bin/bash
# maintenance.sh - 定期维护任务

echo "开始维护任务..."

# 数据库统计信息更新
docker compose exec postgres psql -U postgres cms_db -c "ANALYZE;"

# 清理Docker资源
docker system prune -f

# 清理日志文件
docker compose exec nginx sh -c "find /var/log/nginx -name '*.log' -mtime +7 -delete"

# 重启服务 (可选)
# docker compose restart

echo "维护任务完成"
```

#### 定时任务配置

```bash
# 添加到crontab
crontab -e

# 每天凌晨2点执行备份
0 2 * * * /path/to/backup.sh

# 每周日凌晨3点执行维护
0 3 * * 0 /path/to/maintenance.sh

# 每5分钟监控一次系统状态
*/5 * * * * /path/to/monitor.sh
```

---

## 🎯 总结

本部署指南涵盖了现代化CMS系统的完整部署流程，从系统要求到故障排查，从性能优化到安全加固。通过遵循本指南，您可以：

✅ **快速部署**: 在30分钟内完成生产环境部署  
✅ **安全运行**: 通过多层安全措施保护系统  
✅ **高性能**: 优化配置获得最佳性能  
✅ **可监控**: 完善的监控和告警机制  
✅ **易维护**: 自动化的备份和恢复流程  

如果在使用过程中遇到问题，请参考[故障排查](#故障排查)章节，或查看项目的GitHub Issues页面获取帮助。

**祝您使用愉快！** 🚀