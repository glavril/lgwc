# 现代化CMS系统

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-blue.svg)](https://www.docker.com/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-15+-blue.svg)](https://www.postgresql.org/)
[![FastAPI](https://img.shields.io/badge/fastapi-latest-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-18+-blue.svg)](https://reactjs.org/)

一个基于WordPress架构分析的现代化CMS系统，采用最新的前后端分离技术栈，支持模块化页面设计、完整的权限管理和现代化的开发体验。

## 🚀 项目特性

### 核心功能
- **现代化架构**: 基于WordPress分析的优化设计，采用前后端分离架构
- **多端支持**: 管理员后台 + 博客展示端，满足不同用户群体需求
- **模块化设计**: 支持灵活的页面模块化设计，拖拽式页面构建
- **权限管理**: 基于RBAC的完整权限控制系统
- **响应式设计**: 支持桌面和移动设备的响应式界面

### 技术亮点
- **高性能**: PostgreSQL + Redis缓存，查询性能提升10-100倍
- **可扩展性**: UUID主键设计，支持微服务和分布式架构
- **开发友好**: 热重载、类型安全、现代化开发工具链
- **容器化**: 完整的Docker容器化解决方案，支持多环境部署
- **数据安全**: 严格的外键约束、审计日志、数据完整性保证

## 🏗️ 技术栈

### 后端
- **框架**: FastAPI (Python) - 高性能异步API框架
- **数据库**: PostgreSQL 15+ - 关系型数据库，支持JSONB扩展
- **缓存**: Redis - 高性能内存缓存
- **ORM**: SQLAlchemy 2.0 - Python SQL工具包和ORM
- **认证**: JWT Token + bcrypt密码哈希
- **文档**: 自动生成OpenAPI/Swagger文档

### 前端
- **框架**: React 18 + TypeScript
- **UI组件**: Ant Design + Radix UI - 企业级UI组件库
- **状态管理**: Zustand - 轻量级状态管理
- **构建工具**: Vite - 快速的现代化构建工具
- **样式**: TailwindCSS - 实用优先的CSS框架
- **路由**: React Router DOM

### 基础设施
- **容器化**: Docker + Docker Compose
- **反向代理**: Nginx
- **数据库迁移**: Alembic
- **监控**: 容器健康检查 + 日志收集

## 📋 核心模块

### 1. 用户管理系统
- **用户账户**: 注册、登录、个人资料管理
- **角色权限**: 6级角色体系 (超级管理员 → 订阅者)
- **权限控制**: 资源+动作的精细化权限模型
- **安全机制**: 密码加密、登录尝试限制、账户锁定

### 2. 内容管理系统
- **统一内容模型**: 支持文章、页面、自定义内容类型
- **分类法**: 支持层级分类和标签系统
- **富文本编辑**: 支持HTML、Markdown、结构化内容
- **SEO优化**: 完整的SEO字段和优化支持
- **版本控制**: 内容历史版本和发布状态管理

### 3. 媒体管理
- **文件上传**: 支持多种文件类型和大小限制
- **图片处理**: 自动获取图片尺寸和元数据
- **媒体库**: 分类、搜索、批量操作
- **CDN就绪**: 支持对象存储和CDN集成

### 4. 评论系统
- **嵌套评论**: 支持多级回复结构
- **审核流程**: 待审、已通过、垃圾评论管理
- **反垃圾**: IP记录、用户代理跟踪
- **统计信息**: 评论数量、点赞统计

### 5. 模块化页面
- **模块类型**: 文本、图片、视频、画廊、嵌入内容
- **拖拽构建**: 可视化页面构建器
- **嵌套支持**: 模块支持嵌套和复杂布局
- **数据验证**: JSON Schema定义的数据结构验证

### 6. 系统设置
- **配置管理**: 站点基本信息、SEO设置、功能开关
- **用户设置**: 用户个人偏好和个性化配置
- **菜单管理**: 支持层级结构的导航菜单
- **系统监控**: 性能指标、健康检查

## 快速开始

### 前置要求
- Docker 和 Docker Compose
- Node.js 18+ (用于本地开发)
- Python 3.11+ (用于本地开发)
- pnpm (推荐)

### 使用Docker快速启动

```bash
# 1. 克隆项目
git clone <repository-url>
cd workspace

# 2. 启动所有服务
docker compose up -d

# 3. 等待服务启动完成后,访问:
# - API文档: http://localhost:8000/docs
# - 管理后台: http://localhost:3000
# - 博客前端: http://localhost:3001
# - Nginx入口: http://localhost:80
#   - 通过Nginx访问: http://localhost/admin (管理后台)
#   - 通过Nginx访问: http://localhost (博客前端)
```

### 本地开发

#### 后端开发

```bash
# 1. 进入后端目录
cd backend

# 2. 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. 安装依赖
pip install -r requirements.txt

# 4. 配置环境变量
cp .env.example .env
# 编辑.env文件,配置数据库等信息

# 5. 启动PostgreSQL和Redis(使用Docker)
docker compose up -d postgres redis

# 6. 启动开发服务器
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 前端开发

**管理后台:**
```bash
# 1. 进入前端目录
cd frontend/admin

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑.env文件

# 4. 启动开发服务器
pnpm dev
```

**博客前端:**
```bash
# 1. 进入博客前端目录
cd frontend/blog

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑.env文件,配置API地址

# 4. 启动开发服务器
pnpm dev
# 访问: http://localhost:5173
```

## 数据库初始化

PostgreSQL数据库会在首次启动时自动执行schema初始化脚本。

手动初始化:
```bash
# 连接到PostgreSQL容器
docker exec -it cms_postgres psql -U postgres -d cms_db

# 导入schema
\i /docker-entrypoint-initdb.d/schema.sql
```

## API文档

启动后端服务后,访问以下地址查看API文档:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 📁 项目结构

```
.
├── backend/                 # FastAPI后端
│   ├── app/
│   │   ├── api/v1/         # API路由
│   │   ├── core/           # 核心功能
│   │   ├── models/         # 数据模型
│   │   ├── schemas/        # 数据模式
│   │   └── utils/          # 工具函数
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── admin/              # 管理后台
│   │   ├── src/
│   │   │   ├── api/        # API客户端
│   │   │   ├── components/ # 公共组件
│   │   │   ├── pages/      # 页面组件
│   │   │   └── store/      # 状态管理
│   │   └── Dockerfile
│   └── blog/               # 博客展示端
├── nginx/                  # Nginx配置
├── code/
│   └── database/           # 数据库相关
│       └── schema.sql      # 数据库Schema
├── docs/                   # 项目文档
└── docker compose.yml      # Docker编排配置
```

## 🚀 快速开始

### 系统要求

- **Docker**: 19.03+
- **Docker Compose**: 1.25+
- **内存**: 最低2GB，推荐4GB+
- **存储**: 最低10GB可用空间
- **操作系统**: Linux, macOS, Windows (WSL2)

### 一键启动

1. **克隆项目**
```bash
git clone <repository-url>
cd modern-cms
```

2. **启动所有服务**
```bash
docker compose up -d
```

3. **访问应用**
- 管理后台: http://localhost:3000
- 博客展示: http://localhost:3001
- API文档: http://localhost:8000/docs
- Nginx代理: http://localhost

4. **默认账户**
- 管理员: admin@example.com / admin123
- 需要在数据库中初始化或通过API创建

### 开发环境启动

如果您需要在开发环境中进行开发：

1. **启动基础设施服务**
```bash
docker compose up -d postgres redis
```

2. **启动后端开发服务**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

3. **启动前端开发服务**
```bash
cd frontend/admin
pnpm install
pnpm dev
```

## 🔧 配置说明

### 环境变量

主要环境变量在 `docker compose.yml` 中配置：

```yaml
# 数据库配置
DATABASE_URL: postgresql://postgres:password@postgres:5432/cms_db
DATABASE_ASYNC_URL: postgresql+asyncpg://postgres:password@postgres:5432/cms_db

# Redis配置
REDIS_URL: redis://redis:6379/0

# 应用配置
SECRET_KEY: your-secret-key-change-in-production
DEBUG: "True"
ALLOWED_ORIGINS: http://localhost:3000,http://localhost:3001
```

### 数据库配置

PostgreSQL数据库自动创建，初始化脚本位于：
- `/var/lib/postgresql/data` - 数据持久化目录
- `code/database/schema.sql` - 数据库Schema定义

### Nginx配置

反向代理配置位于 `nginx/nginx.conf`，支持：
- 静态资源服务
- API代理转发
- Gzip压缩
- 安全头设置

## 📖 API文档

项目使用FastAPI自动生成交互式API文档：

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI JSON**: http://localhost:8000/openapi.json

### 主要API端点

| 端点 | 方法 | 描述 | 认证 |
|------|------|------|------|
| `/api/v1/auth/login` | POST | 用户登录 | ❌ |
| `/api/v1/auth/register` | POST | 用户注册 | ❌ |
| `/api/v1/users` | GET/POST | 用户管理 | ✅ |
| `/api/v1/content` | GET/POST | 内容管理 | ✅ |
| `/api/v1/media` | GET/POST | 媒体管理 | ✅ |
| `/api/v1/modules` | GET/POST | 模块管理 | ✅ |

## 开发指南

### 添加新的API端点

1. 在`backend/app/models/`中定义数据模型
2. 在`backend/app/schemas/`中定义Pydantic schema
3. 在`backend/app/api/v1/`中创建路由
4. 在`backend/app/main.py`中注册路由

### 添加新的前端页面

**管理后台:**
1. 在`frontend/admin/src/pages/`中创建页面组件
2. 在`frontend/admin/src/App.tsx`中添加路由
3. 在`frontend/admin/src/api/`中添加API调用

**博客前端:**
1. 在`frontend/blog/src/pages/`中创建页面组件
2. 在`frontend/blog/src/App.tsx`中添加路由
3. 在`frontend/blog/src/api/`中添加API调用

### 添加新的模块类型

1. 通过API创建模块类型定义
2. 定义模块schema
3. 在页面构建器中添加模块

## 部署

### 生产环境部署

```bash
# 1. 构建生产镜像
docker compose -f docker compose.yml build

# 2. 启动生产服务
docker compose -f docker compose.yml up -d

# 3. 检查服务状态
docker compose ps
```

### 环境变量配置

生产环境需要配置以下环境变量:
- `SECRET_KEY`: JWT密钥(必须更改)
- `DATABASE_URL`: 数据库连接
- `REDIS_URL`: Redis连接
- `ALLOWED_ORIGINS`: 允许的CORS来源

## 性能优化

- 数据库索引优化
- Redis缓存层
- CDN静态资源加速
- 图片懒加载
- API响应压缩

## 安全性

- JWT认证
- 密码哈希存储
- CORS配置
- SQL注入防护
- XSS防护
- 文件上传验证

## 故障排查

### 数据库连接失败
检查PostgreSQL容器是否正常运行:
```bash
docker compose ps postgres
docker compose logs postgres
```

### 前端无法访问API
检查CORS配置和API_URL环境变量

### Docker容器无法启动
```bash
docker compose down
docker compose up -d --force-recreate
```

## 🔒 安全特性

### 数据安全
- **密码安全**: bcrypt哈希 + 盐值
- **SQL注入防护**: SQLAlchemy ORM参数化查询
- **XSS防护**: 输入验证和输出编码
- **CSRF防护**: Token验证机制

### 访问控制
- **JWT认证**: 无状态Token认证
- **RBAC权限**: 基于角色的访问控制
- **API限流**: 防止API滥用
- **安全头**: HSTS, X-Frame-Options等

### 容器安全
- **非root运行**: 容器内使用非特权用户
- **最小权限**: 移除不必要的系统权限
- **只读文件系统**: 生产环境只读根文件系统
- **网络隔离**: 容器网络隔离

## 📊 性能优化

### 数据库优化
- **索引策略**: 针对高频查询的复合索引
- **JSONB索引**: 支持JSON字段的GIN索引
- **查询优化**: 避免N+1查询，优化JOIN操作
- **分页优化**: 游标分页替代OFFSET分页

### 缓存策略
- **Redis缓存**: 热点数据缓存
- **数据库连接池**: 连接复用和资源管理
- **静态资源**: Nginx静态文件缓存
- **CDN就绪**: 支持内容分发网络

### 前端优化
- **代码分割**: 按路由和组件懒加载
- **Tree Shaking**: 移除未使用代码
- **资源压缩**: Gzip/Brotli压缩
- **图片优化**: 响应式图片和格式优化

## 🧪 测试

### 运行测试

```bash
# 后端测试
cd backend
pytest tests/

# 前端测试
cd frontend/admin
pnpm test
```

### 测试覆盖
- **单元测试**: 核心业务逻辑测试
- **集成测试**: API端点测试
- **端到端测试**: 用户流程测试
- **性能测试**: 负载和压力测试

## 📦 部署

### 生产环境部署

1. **构建生产镜像**
```bash
docker compose -f docker compose.yml -f docker compose.prod.yml build
```

2. **部署到生产环境**
```bash
docker compose -f docker compose.yml -f docker compose.prod.yml up -d
```

3. **数据库迁移**
```bash
docker compose exec api alembic upgrade head
```

### 监控和日志

- **健康检查**: 容器健康状态监控
- **日志收集**: 结构化日志输出
- **性能监控**: 容器资源使用监控
- **错误追踪**: 异常和错误日志收集

## 🛠️ 开发指南

### 添加新的API端点

1. 在`backend/app/models/`中定义数据模型
2. 在`backend/app/schemas/`中定义Pydantic schema
3. 在`backend/app/api/v1/`中创建路由
4. 在`backend/app/main.py`中注册路由

### 添加新的前端页面

**管理后台:**
1. 在`frontend/admin/src/pages/`中创建页面组件
2. 在`frontend/admin/src/App.tsx`中添加路由
3. 在`frontend/admin/src/api/`中添加API调用

**博客前端:**
1. 在`frontend/blog/src/pages/`中创建页面组件
2. 在`frontend/blog/src/App.tsx`中添加路由
3. 在`frontend/blog/src/api/`中添加API调用

### 添加新的模块类型

1. 通过API创建模块类型定义
2. 定义模块schema
3. 在页面构建器中添加模块

## 🤝 贡献指南

我们欢迎社区贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解详细的贡献指南。

### 开发流程

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 代码规范

- **Python**: 遵循 PEP 8，使用 Black 格式化
- **TypeScript**: 遵循 ESLint 规则，使用 Prettier 格式化
- **提交信息**: 遵循 Conventional Commits 规范

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目：

- [FastAPI](https://fastapi.tiangolo.com/) - 现代的Python Web框架
- [React](https://reactjs.org/) - 用户界面构建库
- [PostgreSQL](https://www.postgresql.org/) - 开源关系数据库
- [Ant Design](https://ant.design/) - 企业级UI设计语言
- [Docker](https://www.docker.com/) - 容器化平台

## 📞 联系我们

- **项目维护者**: [Your Name](mailto:your.email@example.com)
- **问题反馈**: [GitHub Issues](https://github.com/yourusername/modern-cms/issues)
- **讨论交流**: [GitHub Discussions](https://github.com/yourusername/modern-cms/discussions)

---

**让内容管理变得更简单、更现代、更强大！** 🚀
# lgwc
