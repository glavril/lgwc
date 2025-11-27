# 博客展示前端

基于React + TypeScript + Vite构建的现代化博客展示网站。

## 功能特性

- **首页**: 展示精选文章和最新文章
- **文章列表**: 支持分类、标签筛选和搜索
- **文章详情**: Markdown渲染、评论系统
- **页面展示**: 展示静态页面(如关于页面)
- **响应式设计**: 适配移动端和桌面端

## 技术栈

- React 18.3
- TypeScript 5.6
- Vite 6.0
- React Router 6
- Tailwind CSS 3.4
- Axios (API请求)
- React Markdown (Markdown渲染)
- Lucide React (图标库)

## 开发指南

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制`.env.example`为`.env`并配置API地址：

```bash
cp .env.example .env
```

编辑`.env`：

```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

### 预览生产版本

```bash
pnpm preview
```

## 项目结构

```
src/
├── api/               # API客户端
│   ├── client.ts      # Axios实例配置
│   └── content.ts     # 内容相关API
├── components/        # 组件
│   ├── Header.tsx     # 导航栏
│   ├── Footer.tsx     # 页脚
│   └── Layout.tsx     # 主布局
├── pages/             # 页面
│   ├── HomePage.tsx         # 首页
│   ├── PostListPage.tsx     # 文章列表
│   ├── PostDetailPage.tsx   # 文章详情
│   └── PageDetailPage.tsx   # 页面详情
└── App.tsx            # 应用入口
```

## 页面路由

- `/` - 首页
- `/posts` - 文章列表
- `/post/:slug` - 文章详情
- `/page/:slug` - 页面详情

## Docker部署

### 使用Docker Compose

在项目根目录运行：

```bash
docker-compose up -d blog
```

访问 http://localhost:3001

### 单独构建

```bash
docker build -t blog-frontend .
docker run -p 3001:80 blog-frontend
```

## 响应式设计

- **移动端** (<768px): 单列布局，汉堡菜单
- **平板** (768px-1024px): 两列网格布局
- **桌面** (>1024px): 完整布局，侧边栏

## 样式系统

使用Tailwind CSS，主要配色：

- 主色调: Blue (600)
- 辅助色: Purple (600)
- 中性色: Gray (50-900)

## API集成

所有API请求通过`src/api/`模块处理：

- `getPublishedPosts()` - 获取已发布文章
- `getPostBySlug()` - 获取文章详情
- `getPageBySlug()` - 获取页面详情
- `getCategories()` - 获取分类列表
- `getTags()` - 获取标签列表
- `getComments()` - 获取评论
- `submitComment()` - 提交评论

## 许可证

MIT
