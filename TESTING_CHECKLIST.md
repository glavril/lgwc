# Docker部署测试清单

本文档提供完整的手动测试步骤，用于验证WordPress风格博客系统的Docker部署。

## 📋 测试前准备

### 环境要求
- [ ] Docker 20.10+ 已安装
- [ ] Docker Compose 2.0+ 已安装
- [ ] 可用端口：80, 3000, 3001, 5432, 6379, 8000
- [ ] 至少 4GB 可用内存
- [ ] 至少 10GB 可用磁盘空间

### 快速测试（推荐）
```bash
# 1. 进入项目目录
cd /workspace

# 2. 赋予脚本执行权限
chmod +x deploy-test.sh

# 3. 运行自动化测试脚本
./deploy-test.sh
```

---

## 🔧 手动测试步骤

### 第1阶段：Docker容器启动验证

#### 1.1 启动所有服务
```bash
cd /workspace
docker compose up -d
```

**预期结果：**
- ✓ 成功创建并启动6个容器
- ✓ 无错误信息输出

#### 1.2 检查容器状态
```bash
docker compose ps
```

**预期结果：**
```
NAME            STATUS          PORTS
cms_postgres    Up             0.0.0.0:5432->5432/tcp
cms_redis       Up             0.0.0.0:6379->6379/tcp
cms_api         Up             0.0.0.0:8000->8000/tcp
cms_admin       Up             0.0.0.0:3000->80/tcp
cms_blog        Up             0.0.0.0:3001->80/tcp
cms_nginx       Up             0.0.0.0:80->80/tcp
```

**验证清单：**
- [ ] cms_postgres 容器运行中
- [ ] cms_redis 容器运行中
- [ ] cms_api 容器运行中
- [ ] cms_admin 容器运行中
- [ ] cms_blog 容器运行中
- [ ] cms_nginx 容器运行中

#### 1.3 检查容器日志
```bash
# 查看所有容器日志
docker compose logs

# 查看特定容器日志
docker compose logs api
docker compose logs postgres
```

**验证清单：**
- [ ] 无严重错误（ERROR/FATAL）
- [ ] PostgreSQL显示 "database system is ready"
- [ ] Redis显示 "Ready to accept connections"
- [ ] API显示 "Application startup complete"

---

### 第2阶段：数据库初始化和连接测试

#### 2.1 PostgreSQL连接测试
```bash
# 连接到PostgreSQL容器
docker exec -it cms_postgres psql -U postgres -d cms_db

# 在psql中执行
\dt                    # 列出所有表
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';
\q                     # 退出
```

**预期结果：**
- ✓ 成功连接到数据库
- ✓ 显示多个表（users, content, media, comments等）
- ✓ 表数量 > 10

**验证清单：**
- [ ] 数据库连接成功
- [ ] users 表存在
- [ ] content 表存在
- [ ] media 表存在
- [ ] comments 表存在
- [ ] categories 表存在
- [ ] tags 表存在

#### 2.2 Redis连接测试
```bash
# 测试Redis
docker exec -it cms_redis redis-cli ping
```

**预期结果：**
```
PONG
```

**验证清单：**
- [ ] Redis响应 "PONG"

---

### 第3阶段：后端API接口测试

#### 3.1 API文档访问
在浏览器中打开：http://localhost:8000/docs

**预期结果：**
- ✓ 显示Swagger UI界面
- ✓ 列出所有API端点

**验证清单：**
- [ ] API文档页面加载成功
- [ ] 显示认证相关端点 (/api/v1/auth/)
- [ ] 显示内容管理端点 (/api/v1/content/)
- [ ] 显示用户管理端点 (/api/v1/users/)
- [ ] 显示媒体管理端点 (/api/v1/media/)

#### 3.2 健康检查端点
```bash
curl http://localhost:8000/health
```

**预期结果：**
```json
{"status": "healthy"}
```

**验证清单：**
- [ ] 返回HTTP 200
- [ ] 返回健康状态信息

#### 3.3 用户注册测试
```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "display_name": "管理员"
  }'
```

**预期结果：**
```json
{
  "id": "...",
  "username": "admin",
  "email": "admin@example.com",
  "display_name": "管理员",
  ...
}
```

**验证清单：**
- [ ] 返回HTTP 200或201
- [ ] 返回用户信息
- [ ] 包含用户ID

#### 3.4 用户登录测试
```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**预期结果：**
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  ...
}
```

**验证清单：**
- [ ] 返回HTTP 200
- [ ] 返回access_token
- [ ] token类型为bearer

#### 3.5 获取内容列表（需要token）
```bash
# 使用上一步获得的token
TOKEN="your_access_token_here"

curl "http://localhost:8000/api/v1/content" \
  -H "Authorization: Bearer $TOKEN"
```

**预期结果：**
```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "size": 10
}
```

**验证清单：**
- [ ] 返回HTTP 200
- [ ] 返回内容列表结构
- [ ] 无需token的端点返回401

---

### 第4阶段：前端管理后台访问测试

#### 4.1 访问管理后台首页
在浏览器中打开：http://localhost:3000

**预期结果：**
- ✓ 显示登录页面
- ✓ 包含用户名和密码输入框
- ✓ 页面样式正常

**验证清单：**
- [ ] 页面加载无错误
- [ ] 显示登录表单
- [ ] Ant Design样式正常加载
- [ ] 无控制台JavaScript错误

#### 4.2 登录测试
使用之前创建的账户登录：
- 用户名：admin
- 密码：admin123

**预期结果：**
- ✓ 登录成功
- ✓ 跳转到仪表盘页面
- ✓ 显示侧边栏菜单

**验证清单：**
- [ ] 登录成功
- [ ] 显示仪表盘
- [ ] 侧边栏包含所有菜单项：
  - [ ] 仪表盘
  - [ ] 内容管理
  - [ ] 媒体库
  - [ ] 评论管理
  - [ ] 用户管理
  - [ ] 系统设置

#### 4.3 仪表盘功能测试
点击"仪表盘"菜单

**验证清单：**
- [ ] 显示统计卡片（用户数、文章数、评论数、浏览量）
- [ ] 显示浏览量趋势图表
- [ ] 显示文章发布趋势图表
- [ ] 显示最近文章列表
- [ ] 显示最近评论列表
- [ ] 无数据加载错误

#### 4.4 内容管理测试
点击"内容管理"菜单

**验证清单：**
- [ ] 显示内容列表表格
- [ ] 显示"新建文章"按钮
- [ ] 可以筛选类型（文章/页面）
- [ ] 可以搜索内容

点击"新建文章"

**验证清单：**
- [ ] 显示文章编辑器
- [ ] 富文本编辑器加载正常
- [ ] 可以输入标题
- [ ] 可以输入内容
- [ ] 可以选择分类
- [ ] 可以添加标签
- [ ] 有保存按钮

#### 4.5 媒体库测试
点击"媒体库"菜单

**验证清单：**
- [ ] 显示媒体网格
- [ ] 显示"上传文件"按钮
- [ ] 显示统计卡片
- [ ] 可以按类型筛选
- [ ] 可以搜索文件

#### 4.6 评论管理测试
点击"评论管理"菜单

**验证清单：**
- [ ] 显示评论列表
- [ ] 显示统计卡片
- [ ] 可以按状态筛选
- [ ] 可以搜索评论
- [ ] 有批准/拒绝按钮

#### 4.7 用户管理测试
点击"用户管理"菜单

**验证清单：**
- [ ] 显示用户列表
- [ ] 显示统计卡片
- [ ] 显示"添加用户"按钮
- [ ] 可以编辑用户
- [ ] 可以删除用户

#### 4.8 系统设置测试
点击"系统设置"菜单

**验证清单：**
- [ ] 显示设置标签页
- [ ] 包含"常规"标签
- [ ] 包含"阅读"标签
- [ ] 包含"讨论"标签
- [ ] 包含"媒体"标签
- [ ] 表单可以提交

---

### 第5阶段：博客展示页面测试

#### 5.1 访问博客首页
在浏览器中打开：http://localhost:3001

**预期结果：**
- ✓ 显示博客首页
- ✓ 包含导航栏
- ✓ 包含Hero区域
- ✓ 包含文章列表
- ✓ 包含页脚

**验证清单：**
- [ ] 页面加载无错误
- [ ] 导航栏显示正常
- [ ] Hero区域样式正常
- [ ] 文章列表显示（如有数据）
- [ ] 页脚显示正常
- [ ] 响应式布局正常

#### 5.2 导航测试
点击导航栏各个链接

**验证清单：**
- [ ] "首页"链接工作正常
- [ ] "文章"链接工作正常
- [ ] "关于"链接工作正常（如有）
- [ ] 移动端汉堡菜单工作正常

#### 5.3 文章列表页测试
访问：http://localhost:3001/posts

**验证清单：**
- [ ] 显示文章列表
- [ ] 显示侧边栏筛选
- [ ] 可以按分类筛选
- [ ] 可以按标签筛选
- [ ] 搜索框工作正常
- [ ] 分页功能正常（如有多页）

#### 5.4 文章详情页测试
点击任意文章进入详情页

**验证清单：**
- [ ] 显示文章标题
- [ ] 显示文章内容（Markdown渲染）
- [ ] 显示作者信息
- [ ] 显示发布时间
- [ ] 显示分类和标签
- [ ] 显示评论区
- [ ] 评论表单工作正常

#### 5.5 响应式设计测试
在不同设备尺寸下测试：

**桌面端（>1024px）：**
- [ ] 布局使用全宽
- [ ] 侧边栏显示
- [ ] 导航栏完整显示

**平板端（768px-1024px）：**
- [ ] 布局自适应
- [ ] 文章网格变为2列
- [ ] 导航栏保持可用

**移动端（<768px）：**
- [ ] 单列布局
- [ ] 汉堡菜单
- [ ] 文章卡片堆叠
- [ ] 触摸友好的按钮

---

### 第6阶段：容器间通信验证

#### 6.1 API到数据库连接
```bash
# 从API容器内部连接PostgreSQL
docker exec cms_api sh -c "nc -zv postgres 5432"
```

**预期结果：**
```
postgres (172.x.x.x:5432) open
```

**验证清单：**
- [ ] API可以连接到PostgreSQL

#### 6.2 API到Redis连接
```bash
# 从API容器内部连接Redis
docker exec cms_api sh -c "nc -zv redis 6379"
```

**预期结果：**
```
redis (172.x.x.x:6379) open
```

**验证清单：**
- [ ] API可以连接到Redis

#### 6.3 前端到API连接
在浏览器开发者工具中检查网络请求

**验证清单：**
- [ ] 前端成功调用API
- [ ] API返回正确的CORS头
- [ ] 无跨域错误

---

### 第7阶段：Nginx反向代理验证

#### 7.1 Nginx根路径（博客前端）
```bash
curl -I http://localhost/
```

**验证清单：**
- [ ] 返回HTTP 200
- [ ] 内容类型为text/html

#### 7.2 Nginx管理后台路由
```bash
curl -I http://localhost/admin
```

**验证清单：**
- [ ] 返回HTTP 200
- [ ] 正确路由到管理后台

#### 7.3 Nginx API路由
```bash
curl -I http://localhost/api/v1/content
```

**验证清单：**
- [ ] 返回HTTP 200或401
- [ ] 正确路由到后端API

---

### 第8阶段：性能和资源测试

#### 8.1 容器资源使用
```bash
docker stats --no-stream
```

**验证清单：**
- [ ] 所有容器CPU使用率 < 50%
- [ ] 所有容器内存使用 < 512MB
- [ ] 无容器异常重启

#### 8.2 页面加载性能
使用浏览器开发者工具检查：

**验证清单：**
- [ ] 首页加载时间 < 3秒
- [ ] API响应时间 < 500ms
- [ ] 静态资源已缓存
- [ ] Gzip压缩已启用

---

## ✅ 测试完成清单

### 必须通过的测试
- [ ] 所有6个Docker容器成功启动
- [ ] PostgreSQL数据库连接成功
- [ ] Redis缓存连接成功
- [ ] 后端API文档可访问
- [ ] 用户注册和登录功能正常
- [ ] 管理后台登录成功
- [ ] 博客前端首页加载正常
- [ ] Nginx反向代理工作正常

### 建议通过的测试
- [ ] 仪表盘数据显示正常
- [ ] 内容管理功能可用
- [ ] 媒体库功能可用
- [ ] 评论管理功能可用
- [ ] 用户管理功能可用
- [ ] 系统设置功能可用
- [ ] 响应式设计正常

---

## 🐛 故障排查

### 容器无法启动
```bash
# 查看详细日志
docker compose logs [service_name]

# 重启服务
docker compose restart [service_name]

# 完全重新构建
docker compose down
docker compose build --no-cache
docker compose up -d
```

### 数据库连接失败
```bash
# 检查PostgreSQL日志
docker compose logs postgres

# 验证环境变量
docker exec cms_api env | grep DATABASE

# 重启PostgreSQL
docker compose restart postgres
```

### 前端无法访问API
```bash
# 检查CORS配置
docker compose logs api | grep CORS

# 检查环境变量
cat frontend/admin/.env
cat frontend/blog/.env

# 重启服务
docker compose restart api admin blog
```

### 端口冲突
```bash
# 查看端口占用
sudo lsof -i :80
sudo lsof -i :3000
sudo lsof -i :8000

# 修改docker compose.yml中的端口映射
# 然后重启
docker compose down
docker compose up -d
```

---

## 📊 测试报告模板

### 测试环境
- 操作系统: _______________
- Docker版本: _______________
- Docker Compose版本: _______________
- 测试日期: _______________

### 测试结果统计
- 总测试项: _____ 
- 通过: _____ 
- 失败: _____ 
- 跳过: _____

### 关键问题记录
1. 问题描述: _______________
   - 影响范围: _______________
   - 解决方案: _______________

2. 问题描述: _______________
   - 影响范围: _______________
   - 解决方案: _______________

### 测试结论
- [ ] 系统部署成功，可以投入使用
- [ ] 存在非关键问题，可以投入使用
- [ ] 存在关键问题，需要修复后再使用

### 测试人员签名
签名: _______________ 日期: _______________
