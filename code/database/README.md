# PostgreSQL 现代化 CMS 数据库 Schema

本项目基于对 WordPress 数据库架构的深度分析，设计了一套现代化的 PostgreSQL 数据库 Schema，适用于构建高性能、可扩展的内容管理系统。

## 📁 文件结构

```
code/database/
├── schema.sql              # 完整的数据库 DDL 脚本

docs/
├── wordpress_analysis.md   # WordPress 架构分析报告
└── database_design.md      # PostgreSQL 数据库设计文档
```

## 🚀 快速开始

### 1. 环境要求

- PostgreSQL 12+
- UUID-OSSP 扩展支持

### 2. 创建数据库

```bash
# 创建数据库
createdb cms_db

# 执行 Schema 脚本
psql -d cms_db -f code/database/schema.sql
```

### 3. 验证安装

```sql
-- 检查表是否创建成功
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 查看默认角色
SELECT * FROM roles;

-- 查看默认权限
SELECT * FROM permissions;
```

## 📊 Schema 概览

### 核心模块

1. **用户管理模块**
   - `users` - 用户基础信息
   - `roles` - 角色定义
   - `permissions` - 权限定义
   - `user_roles` - 用户角色关联
   - `role_permissions` - 角色权限关联

2. **内容管理模块**
   - `content` - 统一内容表（支持文章、页面、自定义类型）
   - `taxonomies` - 分类法定义
   - `terms` - 术语表（分类/标签）
   - `content_terms` - 内容与术语关联

3. **媒体管理模块**
   - `media` - 媒体文件
   - `media_metadata` - 媒体元数据

4. **评论管理模块**
   - `comments` - 评论
   - `comment_metadata` - 评论扩展数据

5. **系统设置模块**
   - `options` - 系统配置
   - `settings` - 结构化设置项
   - `user_settings` - 用户个人设置
   - `menus` - 菜单
   - `menu_items` - 菜单项

6. **模块化页面模块**
   - `module_types` - 模块类型定义
   - `page_modules` - 页面模块
   - `module_data` - 模块数据

## ✨ 核心特性

### PostgreSQL 特性利用

- **UUID 主键**: 更好的分布式支持
- **JSONB 字段**: 灵活的元数据存储和查询
- **GIN 索引**: 对 JSONB 字段的高效索引
- **全文搜索**: 原生 PostgreSQL 全文搜索支持
- **触发器**: 自动维护数据一致性和时间戳
- **外键约束**: 严格的数据完整性保证

### 性能优化

- **复合索引**: 针对常见查询场景优化
- **分区支持**: 大数据量的水平分片
- **物化视图**: 统计信息和报表优化
- **连接池**: 支持 PgBouncer 等连接池

### 安全特性

- **RBAC 权限**: 基于角色的访问控制
- **行级安全**: 细粒度的数据访问控制
- **审计日志**: 完整的操作审计跟踪
- **数据验证**: 数据库层面的输入验证

## 🔧 自定义配置

### 调整性能参数

在 `postgresql.conf` 中配置：

```conf
# 内存配置
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# 连接配置
max_connections = 200
```

### 分区配置

根据业务需求为大数据表配置分区：

```sql
-- 按月分区内容表
CREATE TABLE content_2025_01 PARTITION OF content
FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
```

## 📈 监控和维护

### 性能监控

```sql
-- 查看慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 查看表大小
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### 定期维护

```sql
-- 更新统计信息
ANALYZE;

-- 清理死元组
VACUUM;

-- 重建索引
REINDEX DATABASE your_database_name;
```

## 🧪 测试数据

Schema 包含了完整的默认数据：

- 6个默认角色（super_admin, admin, editor, author, contributor, subscriber）
- 权限定义和角色权限分配
- 默认分类法（category, tag, post_format）
- 默认模块类型（text, image, video, gallery, embed）
- 系统设置和配置

## 🔄 从 WordPress 迁移

提供了完整的 WordPress 数据迁移支持：

```sql
-- 执行迁移
SELECT migrate_from_wordpress();

-- 验证迁移结果
SELECT * FROM validate_migration();
```

## 📚 详细文档

- [`docs/database_design.md`](docs/database_design.md) - 完整的设计文档
- [`docs/wordpress_analysis.md`](docs/wordpress_analysis.md) - WordPress 分析报告

## 🤝 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交更改
4. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。详情请见 LICENSE 文件。

## 💬 讨论

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 参与讨论
- 联系维护者

---

**版本**: 1.0  
**更新时间**: 2025-11-27  
**PostgreSQL 版本**: 12+