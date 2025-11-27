# 快速启动指南

本文档帮助您快速启动整个WordPress风格博客系统。

## 方式1: Docker Compose一键启动(推荐)

这是最简单的方式，适合快速体验和部署。

### 步骤

```bash
# 1. 进入项目根目录
cd /workspace

# 2. 启动所有服务
docker compose up -d

# 3. 查看服务状态
docker compose ps

# 4. 查看服务日志
docker compose logs -f
```

### 访问地址

启动完成后,可通过以下地址访问:

- **博客前端**: http://localhost:3001
- **管理后台**: http://localhost:3000
- **API文档**: http://localhost:8000/docs
- **Nginx统一入口**: http://localhost
  - 博客: http://localhost/
  - 管理后台: http://localhost/admin

### 停止服务

```bash
# 停止所有服务
docker compose down

# 停止并删除数据卷(谨慎使用)
docker compose down -v
```

## 方式2: 本地开发模式

适合开发和调试。

### 1. 启动后端基础服务

```bash
# 只启动数据库和Redis
docker compose up -d postgres redis

# 等待服务就绪
docker compose logs postgres | grep "ready"
```

### 2. 启动后端API

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env,确保数据库配置正确

# 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 3. 启动管理后台前端

打开新终端:

```bash
cd frontend/admin

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
pnpm dev
# 访问: http://localhost:5173
```

### 4. 启动博客前端

打开新终端:

```bash
cd frontend/blog

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env

# 启动开发服务器
pnpm dev
# 访问: http://localhost:5174
```

## 初始化数据

### 创建管理员账户

访问 http://localhost:3000 并注册账户,首个注册的账户将自动成为管理员。

或通过API直接创建:

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "display_name": "管理员"
  }'
```

### 创建测试内容

登录管理后台后,可以:
1. 创建分类和标签
2. 上传媒体文件
3. 创建文章和页面
4. 使用页面构建器创建自定义页面

## 故障排查

### 数据库连接失败

```bash
# 检查PostgreSQL是否运行
docker compose ps postgres

# 查看日志
docker compose logs postgres

# 重启PostgreSQL
docker compose restart postgres
```

### 前端无法连接API

1. 检查后端是否正常运行: http://localhost:8000/docs
2. 检查环境变量中的API地址配置
3. 检查CORS配置(backend/app/main.py)

### Docker容器启动失败

```bash
# 停止所有容器
docker compose down

# 清理并重新创建
docker compose up -d --force-recreate

# 查看详细日志
docker compose logs --tail=100
```

### 端口冲突

如果默认端口被占用,可以修改docker compose.yml中的端口映射:

```yaml
services:
  api:
    ports:
      - "8001:8000"  # 改为8001
  admin:
    ports:
      - "3002:80"    # 改为3002
  blog:
    ports:
      - "3003:80"    # 改为3003
```

## 生产环境配置

### 安全配置检查清单

- [ ] 更改SECRET_KEY
- [ ] 配置强密码的数据库
- [ ] 设置正确的ALLOWED_ORIGINS
- [ ] 配置HTTPS证书
- [ ] 启用Nginx访问日志
- [ ] 配置文件上传大小限制
- [ ] 设置Redis密码
- [ ] 配置数据库备份

### 性能优化建议

- 启用Redis缓存
- 配置Nginx gzip压缩
- 使用CDN托管静态资源
- 数据库索引优化
- 配置合适的连接池大小

## 下一步

1. 访问管理后台创建内容
2. 访问博客前端查看效果
3. 阅读API文档了解可用接口
4. 查看项目文档了解架构设计

## 需要帮助?

- 查看 README.md 了解详细文档
- 查看 docs/ 目录了解系统架构
- 查看 API文档 了解接口定义
