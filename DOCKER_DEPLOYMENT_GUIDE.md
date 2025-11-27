# 🚀 WordPress风格博客系统 - Docker部署指南

## 📦 部署前准备

### 系统要求
- **操作系统**: Linux/Windows/macOS
- **Docker**: 20.10+ 
- **Docker Compose**: 2.0+ (Docker插件)
- **内存**: 最少2GB，推荐4GB+
- **存储**: 最少10GB可用空间

### 检查Docker环境
```bash
# 检查Docker版本
docker --version
docker compose version

# 检查运行状态
docker ps
```

## 🔧 快速部署步骤

### 步骤1：获取项目文件
将workspace中的所有文件复制到您的服务器上，确保以下核心文件存在：

```
wordpress-clone-system/
├── docker-compose.yml          # 主配置文件
├── backend/                    # 后端API服务
├── frontend/admin/             # 管理后台
├── frontend/blog/              # 博客展示
├── nginx/                      # Nginx配置
├── code/database/              # 数据库脚本
└── README.md                   # 项目说明
```

### 步骤2：启动服务
```bash
# 进入项目目录
cd wordpress-clone-system

# 一键启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f
```

### 步骤3：验证部署
部署成功后，您应该能看到以下服务运行：

- **管理后台**: http://localhost:3001
- **博客首页**: http://localhost:3002  
- **API服务**: http://localhost:8000
- **API文档**: http://localhost:8000/docs

## 🎯 功能验证测试

### 1. 用户注册和登录
```bash
# 访问管理后台
curl http://localhost:3001

# 注册管理员账户
POST http://localhost:8000/api/v1/auth/register
{
  "username": "admin",
  "email": "admin@example.com", 
  "password": "admin123",
  "role": "admin"
}
```

### 2. 文章管理测试
- 创建新文章
- 富文本编辑器
- 分类标签设置
- 发布状态切换

### 3. 页面构建器测试
- 访问页面管理
- 创建新页面
- 拖拽式模块编辑
- 实时预览功能

### 4. 媒体管理测试
- 文件上传
- 图片预览
- 媒体库浏览

### 5. 响应式设计测试
在以下设备上测试访问：
- 桌面浏览器 (1920x1080)
- 平板设备 (768x1024)
- 手机设备 (375x667)

## 🔍 故障排查

### 常见问题解决

#### 1. 端口被占用
```bash
# 查看端口占用
netstat -tulpn | grep :8000

# 修改端口
# 编辑docker-compose.yml
services:
  api:
    ports:
      - "8001:8000"  # 改为您需要的端口
```

#### 2. 数据库连接失败
```bash
# 检查数据库状态
docker compose exec database psql -U cms_user -d cms_db

# 重启数据库
docker compose restart database
```

#### 3. 前端无法访问
```bash
# 重新构建前端
docker compose build --no-cache frontend-admin
docker compose build --no-cache frontend-blog

# 重启服务
docker compose restart frontend-admin frontend-blog
```

#### 4. 文件权限问题
```bash
# 设置正确的文件权限
sudo chown -R $USER:$USER .
sudo chmod -R 755 .
```

## 📊 性能监控

### 资源使用情况
```bash
# 查看容器资源使用
docker stats

# 查看磁盘使用
docker system df
```

### 数据库性能
```bash
# 连接到数据库
docker compose exec database psql -U cms_user -d cms_db

# 查看慢查询
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

## 🔒 安全加固

### 生产环境建议
1. **修改默认密码**
   - 数据库密码
   - JWT密钥
   - 管理员密码

2. **配置HTTPS**
   - 申请SSL证书
   - 配置Nginx SSL

3. **防火墙设置**
   ```bash
   # 开放必要端口
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp  # SSH
   ```

4. **定期备份**
   ```bash
   # 数据库备份
   docker compose exec database pg_dump -U cms_user cms_db > backup.sql
   
   # 媒体文件备份
   docker compose exec api tar -czf /tmp/media_backup.tar.gz /app/uploads
   ```

## 🚀 扩展部署

### 使用负载均衡
```yaml
# docker-compose.yml
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
      - frontend-admin
      - frontend-blog
```

### 数据库优化
```sql
-- PostgreSQL优化
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
SELECT pg_reload_conf();
```

## 📞 技术支持

如果在部署过程中遇到任何问题，请提供以下信息：

1. **系统环境**: `docker version`, `docker compose version`
2. **错误日志**: `docker compose logs`
3. **具体错误**: 详细的错误信息
4. **配置情况**: `docker-compose.yml` 配置

**随时准备协助解决任何部署问题！**

---

## 🎉 部署成功后

恭喜！您已经成功部署了现代化的WordPress风格博客系统。

### 下一步：
- 创建管理员账户
- 配置网站基本信息
- 安装和测试各种功能
- 根据需要自定义主题和页面

**享受您的现代化博客管理系统！**