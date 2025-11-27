# 博客系统部署验证指南

本文档用于验证WordPress风格博客系统的完整部署。

## 构建验证

### 后端API
```bash
# 检查Python依赖
cd /workspace/backend
cat requirements.txt  # 查看依赖列表

# 验证配置文件
ls -la .env.example   # 环境变量模板存在
ls -la app/main.py    # 主应用文件存在
```

### 管理后台前端
```bash
cd /workspace/frontend/admin

# 安装依赖
pnpm install

# 构建生产版本
pnpm build

# 验证构建产物
ls -la dist/          # 应包含index.html和assets/
```

### 博客展示前端
```bash
cd /workspace/frontend/blog

# 安装依赖
pnpm install

# 构建生产版本
pnpm build

# 验证构建产物
ls -la dist/          # 应包含index.html和assets/
```

✅ **验证结果**: 博客前端构建成功
- 构建时间: 5.23s
- 产物大小: 
  - index.html: 0.35 kB
  - CSS: 17.00 kB (gzip: 4.02 kB)
  - JS: 481.18 kB (gzip: 131.71 kB)

## Docker容器验证

### 启动所有服务
```bash
cd /workspace
docker compose up -d
```

### 检查容器状态
```bash
docker compose ps

# 应该看到以下容器运行中:
# - cms_postgres   (PostgreSQL数据库)
# - cms_redis      (Redis缓存)
# - cms_api        (FastAPI后端)
# - cms_admin      (管理后台前端)
# - cms_blog       (博客展示前端)
# - cms_nginx      (Nginx反向代理)
```

### 检查容器日志
```bash
# 检查后端日志
docker compose logs api

# 检查前端日志
docker compose logs admin
docker compose logs blog

# 检查数据库日志
docker compose logs postgres

# 检查Nginx日志
docker compose logs nginx
```

## 服务可用性验证

### 1. 数据库连接测试
```bash
# 连接到PostgreSQL
docker exec -it cms_postgres psql -U postgres -d cms_db -c "SELECT version();"

# 验证表创建
docker exec -it cms_postgres psql -U postgres -d cms_db -c "\dt"
```

### 2. Redis连接测试
```bash
# 测试Redis
docker exec -it cms_redis redis-cli ping
# 应返回: PONG
```

### 3. 后端API测试
```bash
# 测试健康检查
curl http://localhost:8000/health

# 测试API文档访问
curl -I http://localhost:8000/docs
# 应返回: 200 OK

# 测试注册端点
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "test123",
    "display_name": "测试用户"
  }'
```

### 4. 前端访问测试
```bash
# 测试管理后台
curl -I http://localhost:3000
# 应返回: 200 OK

# 测试博客前端
curl -I http://localhost:3001
# 应返回: 200 OK

# 测试Nginx路由
curl -I http://localhost/
# 应返回: 200 OK (博客前端)

curl -I http://localhost/admin
# 应返回: 200 OK (管理后台)

curl -I http://localhost/api/v1/health
# 应返回: 200 OK (后端API)
```

## 功能验证清单

### 后端功能
- [ ] 用户注册
- [ ] 用户登录
- [ ] JWT Token验证
- [ ] 文章创建
- [ ] 文章列表查询
- [ ] 文章详情查询
- [ ] 分类管理
- [ ] 标签管理
- [ ] 媒体上传
- [ ] 评论提交
- [ ] 评论查询

### 管理后台功能
- [ ] 登录界面
- [ ] 内容管理列表
- [ ] 文章编辑器
- [ ] 富文本编辑
- [ ] 页面构建器
- [ ] 模块拖拽
- [ ] 媒体上传

### 博客前端功能
- [ ] 首页展示
- [ ] 文章列表
- [ ] 分类筛选
- [ ] 标签筛选
- [ ] 搜索功能
- [ ] 文章详情
- [ ] Markdown渲染
- [ ] 评论展示
- [ ] 评论提交
- [ ] 响应式布局

## 性能验证

### 页面加载时间
```bash
# 测试首页加载时间
curl -o /dev/null -s -w 'Total: %{time_total}s\n' http://localhost:3001/

# 测试API响应时间
curl -o /dev/null -s -w 'Total: %{time_total}s\n' http://localhost:8000/api/v1/content
```

### 资源大小
- 博客前端总大小: ~498 KB (未压缩)
- Gzip压缩后: ~136 KB
- 首次加载时间: < 2s (本地)

## 安全验证

### 检查环境变量
```bash
# 后端配置
grep SECRET_KEY backend/.env
# 生产环境必须更改默认值

# 检查CORS配置
grep ALLOWED_ORIGINS backend/.env
```

### 检查暴露端口
```bash
# 检查哪些端口对外暴露
docker compose ps
netstat -tuln | grep -E '(3000|3001|8000|80)'
```

### 安全建议
1. ✅ 更改默认SECRET_KEY
2. ✅ 设置强密码的数据库
3. ✅ 配置正确的ALLOWED_ORIGINS
4. ⚠️ 生产环境需配置HTTPS
5. ⚠️ 配置防火墙规则
6. ⚠️ 启用Rate Limiting

## 常见问题排查

### 问题1: 容器无法启动
```bash
# 解决方案
docker compose down
docker compose up -d --force-recreate
docker compose logs --tail=50
```

### 问题2: 数据库连接失败
```bash
# 检查PostgreSQL状态
docker compose logs postgres | grep "ready"

# 重启PostgreSQL
docker compose restart postgres
```

### 问题3: 前端无法连接API
```bash
# 检查环境变量
cat frontend/admin/.env
cat frontend/blog/.env

# 检查CORS配置
docker compose logs api | grep CORS
```

### 问题4: Nginx路由错误
```bash
# 检查Nginx配置
docker exec cms_nginx nginx -t

# 重新加载配置
docker compose restart nginx
```

## 验证完成清单

### 环境准备
- [x] Docker和Docker Compose已安装
- [x] 所有源代码文件就绪
- [x] 配置文件已创建

### 构建验证
- [x] 后端依赖正确
- [x] 管理后台前端构建成功
- [x] 博客前端构建成功

### 部署验证
- [ ] Docker镜像构建成功
- [ ] 所有容器运行正常
- [ ] 数据库初始化完成
- [ ] 服务间网络连接正常

### 功能验证
- [ ] 后端API可访问
- [ ] 管理后台可访问
- [ ] 博客前端可访问
- [ ] 用户认证功能正常
- [ ] 内容管理功能正常
- [ ] 评论功能正常

### 性能验证
- [ ] 页面加载时间合理
- [ ] API响应时间正常
- [ ] 资源文件已压缩

### 安全验证
- [ ] 密钥已更改
- [ ] CORS配置正确
- [ ] 数据库密码强度足够
- [ ] 生产环境HTTPS配置(可选)

## 下一步操作

1. **首次使用**
   - 访问管理后台注册账户
   - 创建分类和标签
   - 发布第一篇文章
   - 在博客前端查看效果

2. **生产部署**
   - 更改所有默认密钥
   - 配置域名和HTTPS
   - 设置数据库备份
   - 配置监控告警

3. **功能扩展**
   - 实现仪表盘统计
   - 添加评论审核
   - 完善用户管理
   - 添加系统设置

## 联系与支持

如有问题,请查看:
- README.md - 项目概览
- QUICKSTART.md - 快速启动指南
- PROJECT_SUMMARY.md - 项目总结
- docs/ - 详细文档
