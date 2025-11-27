-- PostgreSQL 现代化 CMS 数据库 Schema 设计
-- 基于 WordPress 分析，优化为现代架构
-- 版本: 1.0
-- 日期: 2025-11-27

-- 设置 PostgreSQL 配置
SET timezone = 'UTC';
SET search_path TO public, extensions;

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =============================================
-- 1. 用户管理模块
-- =============================================

-- 用户基础信息表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    bio TEXT,
    avatar_url TEXT,
    website_url TEXT,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(32),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMPTZ,
    last_login_at TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- 扩展数据（JSONB）- 存储用户偏好、扩展字段等
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 角色表
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false, -- 标识系统默认角色
    level INTEGER DEFAULT 0, -- 角色层级
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 权限表
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- 如: 'posts.create'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- 如: 'posts', 'users', 'settings'
    action VARCHAR(50) NOT NULL, -- 如: 'create', 'read', 'update', 'delete'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 用户角色关联表
CREATE TABLE user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ,
    
    UNIQUE(user_id, role_id)
);

-- 角色权限关联表
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES users(id),
    granted_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(role_id, permission_id)
);

-- =============================================
-- 2. 内容管理模块
-- =============================================

-- 内容基础表（统一内容对象模型）
CREATE TABLE content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content_type VARCHAR(50) NOT NULL, -- 'post', 'page', 'custom_post_type'
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'scheduled', 'private'
    content_format VARCHAR(20) DEFAULT 'html', -- 'html', 'markdown', 'json'
    
    -- 内容字段
    excerpt TEXT,
    content TEXT NOT NULL,
    content_json JSONB, -- 结构化内容，支持富文本编辑器
    featured_image_id UUID,
    
    -- 关系字段
    author_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID REFERENCES content(id), -- 支持层级结构
    menu_order INTEGER DEFAULT 0,
    
    -- SEO 字段
    meta_title VARCHAR(60),
    meta_description VARCHAR(160),
    meta_keywords TEXT[],
    
    -- 发布信息
    published_at TIMESTAMPTZ,
    scheduled_for TIMESTAMPTZ,
    
    -- 统计信息
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- 扩展数据
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 分类法（Tags/Categories）
CREATE TABLE taxonomies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL, -- 'category', 'tag', 'custom_taxonomy'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    is_hierarchical BOOLEAN DEFAULT false, -- 是否支持层级
    slug VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 术语表（Tags/Categories的具体项）
CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    taxonomy_id UUID NOT NULL REFERENCES taxonomies(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES terms(id),
    term_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(taxonomy_id, slug)
);

-- 内容与术语关联表（多对多关系）
CREATE TABLE content_terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    term_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_id, term_id)
);

-- =============================================
-- 3. 媒体管理模块
-- =============================================

-- 媒体文件表
CREATE TABLE media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    width INTEGER, -- 图片宽度
    height INTEGER, -- 图片高度
    duration INTEGER, -- 视频/音频时长（秒）
    
    -- 媒体元数据
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    
    -- 引用统计
    usage_count INTEGER DEFAULT 0,
    
    -- 状态
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'archived', 'deleted'
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- 扩展数据
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 媒体元数据表
CREATE TABLE media_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_id UUID NOT NULL REFERENCES media(id) ON DELETE CASCADE,
    meta_key VARCHAR(100) NOT NULL,
    meta_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(media_id, meta_key)
);

-- =============================================
-- 4. 评论管理模块
-- =============================================

-- 评论表
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id),
    
    -- 评论者信息
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_url TEXT,
    author_ip INET NOT NULL,
    user_agent TEXT,
    
    -- 评论内容
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'html',
    
    -- 状态管理
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'spam', 'trash'
    is_pinned BOOLEAN DEFAULT false, -- 是否置顶
    
    -- 审核信息
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMPTZ,
    
    -- 统计信息
    like_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    
    -- 时间戳
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    -- 扩展数据
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 评论元数据表
CREATE TABLE comment_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    meta_key VARCHAR(100) NOT NULL,
    meta_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(comment_id, meta_key)
);

-- =============================================
-- 5. 系统设置模块
-- =============================================

-- 系统配置表
CREATE TABLE options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_name VARCHAR(100) UNIQUE NOT NULL,
    option_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- 是否对前端公开
    autoload BOOLEAN DEFAULT true, -- 是否自动加载
    data_type VARCHAR(20) DEFAULT 'mixed', -- 'string', 'number', 'boolean', 'object', 'array', 'mixed'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 设置项表（结构化配置）
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    setting_type VARCHAR(20) NOT NULL, -- 'text', 'textarea', 'number', 'boolean', 'select', 'json'
    default_value JSONB,
    validation_rules JSONB, -- 验证规则
    is_user_specific BOOLEAN DEFAULT false, -- 是否用户特定设置
    group_name VARCHAR(50) DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 用户设置值表
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    setting_id UUID NOT NULL REFERENCES settings(id) ON DELETE CASCADE,
    setting_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, setting_id)
);

-- 菜单表
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    location VARCHAR(50), -- 菜单位置标识
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 菜单项表
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID NOT NULL REFERENCES menus(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES menu_items(id),
    title VARCHAR(200) NOT NULL,
    url TEXT,
    target VARCHAR(20), -- '_self', '_blank'
    css_classes TEXT[],
    icon_class VARCHAR(100),
    item_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- 6. 模块化页面模块
-- =============================================

-- 模块类型表
CREATE TABLE module_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL, -- 如: 'text', 'image', 'video', 'gallery'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_class VARCHAR(100),
    schema JSONB NOT NULL, -- 模块数据结构定义
    template_path TEXT, -- 模板文件路径
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 页面模块表
CREATE TABLE page_modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    module_type_id UUID NOT NULL REFERENCES module_types(id),
    parent_id UUID REFERENCES page_modules(id), -- 支持模块嵌套
    module_order INTEGER DEFAULT 0,
    css_classes TEXT[],
    custom_attributes JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 模块数据表
CREATE TABLE module_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_module_id UUID NOT NULL REFERENCES page_modules(id) ON DELETE CASCADE,
    data_key VARCHAR(100) NOT NULL,
    data_value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(page_module_id, data_key)
);

-- =============================================
-- 7. 索引设计
-- =============================================

-- 用户表索引
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(is_active, is_verified);
CREATE INDEX idx_users_last_login ON users(last_login_at);
CREATE INDEX idx_users_metadata ON users USING GIN(metadata);

-- 内容表索引
CREATE INDEX idx_content_type_status ON content(content_type, status);
CREATE INDEX idx_content_author ON content(author_id);
CREATE INDEX idx_content_parent ON content(parent_id);
CREATE INDEX idx_content_published ON content(published_at DESC);
CREATE INDEX idx_content_scheduled ON content(scheduled_for) WHERE status = 'scheduled';
CREATE INDEX idx_content_slug ON content(slug);
CREATE INDEX idx_content_metadata ON content USING GIN(metadata);
CREATE INDEX idx_content_search ON content USING GIN(to_tsvector('english', title || ' ' || COALESCE(excerpt, '')));

-- 分类法索引
CREATE INDEX idx_terms_taxonomy ON terms(taxonomy_id);
CREATE INDEX idx_terms_parent ON terms(parent_id);
CREATE INDEX idx_terms_slug ON terms(slug);

-- 内容术语关联索引
CREATE INDEX idx_content_terms_content ON content_terms(content_id);
CREATE INDEX idx_content_terms_term ON content_terms(term_id);
CREATE INDEX idx_content_terms_order ON content_terms(content_id, term_order);

-- 媒体表索引
CREATE INDEX idx_media_mime_type ON media(mime_type);
CREATE INDEX idx_media_status ON media(status);
CREATE INDEX idx_media_created ON media(created_at DESC);
CREATE INDEX idx_media_metadata ON media USING GIN(metadata);

-- 评论表索引
CREATE INDEX idx_comments_content ON comments(content_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_created ON comments(created_at DESC);
CREATE INDEX idx_comments_approved ON comments(approved_by, approved_at);
CREATE INDEX idx_comments_metadata ON comments USING GIN(metadata);

-- 设置表索引
CREATE INDEX idx_options_autoload ON options(autoload) WHERE autoload = true;
CREATE INDEX idx_options_public ON options(is_public) WHERE is_public = true;
CREATE INDEX idx_settings_group ON settings(group_name, sort_order);

-- 用户设置索引
CREATE INDEX idx_user_settings_user ON user_settings(user_id);
CREATE INDEX idx_user_settings_setting ON user_settings(setting_id);

-- 菜单索引
CREATE INDEX idx_menus_location ON menus(location);
CREATE INDEX idx_menu_items_menu ON menu_items(menu_id);
CREATE INDEX idx_menu_items_parent ON menu_items(parent_id);
CREATE INDEX idx_menu_items_order ON menu_items(menu_id, item_order);

-- 模块化页面索引
CREATE INDEX idx_page_modules_content ON page_modules(content_id);
CREATE INDEX idx_page_modules_type ON page_modules(module_type_id);
CREATE INDEX idx_page_modules_parent ON page_modules(parent_id);
CREATE INDEX idx_page_modules_order ON page_modules(content_id, module_order);
CREATE INDEX idx_module_data_module ON module_data(page_module_id);

-- =============================================
-- 8. 触发器和函数
-- =============================================

-- 更新时间戳函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建更新时间戳触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_terms_updated_at BEFORE UPDATE ON terms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_options_updated_at BEFORE UPDATE ON options
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at BEFORE UPDATE ON menus
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_types_updated_at BEFORE UPDATE ON module_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_page_modules_updated_at BEFORE UPDATE ON page_modules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_data_updated_at BEFORE UPDATE ON module_data
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 内容发布状态检查函数
CREATE OR REPLACE FUNCTION check_content_publication_status()
RETURNS TRIGGER AS $$
BEGIN
    -- 当内容状态变为发布时，设置发布时间
    IF NEW.status = 'published' AND OLD.status != 'published' THEN
        NEW.published_at = CURRENT_TIMESTAMP;
    END IF;
    
    -- 当内容状态从发布变为其他时，清除发布时间
    IF NEW.status != 'published' AND OLD.status = 'published' THEN
        NEW.published_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER content_publication_status_trigger
    BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION check_content_publication_status();

-- 评论状态更新时同步内容评论计数
CREATE OR REPLACE FUNCTION update_content_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.status = 'approved' THEN
        UPDATE content SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        IF OLD.status = 'approved' AND NEW.status != 'approved' THEN
            UPDATE content SET comment_count = comment_count - 1 WHERE id = NEW.content_id;
        ELSIF OLD.status != 'approved' AND NEW.status = 'approved' THEN
            UPDATE content SET comment_count = comment_count + 1 WHERE id = NEW.content_id;
        END IF;
    ELSIF TG_OP = 'DELETE' AND OLD.status = 'approved' THEN
        UPDATE content SET comment_count = comment_count - 1 WHERE id = OLD.content_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER comment_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_content_comment_count();

-- =============================================
-- 9. 初始数据插入
-- =============================================

-- 插入默认角色
INSERT INTO roles (name, display_name, description, is_system, level) VALUES
('super_admin', 'Super Admin', '超级管理员，拥有所有权限', true, 100),
('admin', 'Administrator', '管理员，拥有大部分管理权限', true, 90),
('editor', 'Editor', '编辑，可以管理所有内容', true, 70),
('author', 'Author', '作者，可以发布和管理自己的内容', true, 50),
('contributor', 'Contributor', '贡献者，可以提交内容但需要审核', true, 30),
('subscriber', 'Subscriber', '订阅者，只能评论和更新个人信息', true, 10);

-- 插入默认权限
INSERT INTO permissions (name, display_name, description, resource, action) VALUES
('content.create', 'Create Content', '创建内容', 'content', 'create'),
('content.read', 'Read Content', '查看内容', 'content', 'read'),
('content.update', 'Update Content', '更新内容', 'content', 'update'),
('content.delete', 'Delete Content', '删除内容', 'content', 'delete'),
('content.publish', 'Publish Content', '发布内容', 'content', 'publish'),
('media.upload', 'Upload Media', '上传媒体文件', 'media', 'upload'),
('media.manage', 'Manage Media', '管理媒体文件', 'media', 'manage'),
('users.manage', 'Manage Users', '管理用户', 'users', 'manage'),
('settings.manage', 'Manage Settings', '管理系统设置', 'settings', 'manage'),
('comments.moderate', 'Moderate Comments', '审核评论', 'comments', 'moderate');

-- 为角色分配权限
-- Super Admin 拥有所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permissions p WHERE r.name = 'super_admin';

-- Admin 权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'admin' 
AND p.name IN (
    'content.create', 'content.read', 'content.update', 'content.delete', 'content.publish',
    'media.upload', 'media.manage',
    'comments.moderate'
);

-- Editor 权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'editor' 
AND p.name IN (
    'content.create', 'content.read', 'content.update', 'content.delete', 'content.publish',
    'media.upload', 'media.manage',
    'comments.moderate'
);

-- Author 权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'author' 
AND p.name IN (
    'content.create', 'content.read', 'content.update',
    'media.upload'
);

-- Contributor 权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'contributor' 
AND p.name IN (
    'content.create', 'content.read', 'content.update'
);

-- Subscriber 权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r 
CROSS JOIN permissions p 
WHERE r.name = 'subscriber' 
AND p.name IN (
    'content.read'
);

-- 插入默认分类法
INSERT INTO taxonomies (name, display_name, description, is_hierarchical) VALUES
('category', 'Categories', '内容分类，支持层级结构', true),
('tag', 'Tags', '内容标签，扁平结构', false),
('post_format', 'Post Formats', '文章格式', false);

-- 插入默认模块类型
INSERT INTO module_types (name, display_name, description, schema, is_active) VALUES
('text', 'Text', '文本模块', '{"fields": [{"name": "content", "type": "html", "required": true}]}'::jsonb, true),
('image', 'Image', '图片模块', '{"fields": [{"name": "src", "type": "url", "required": true}, {"name": "alt", "type": "text"}]}'::jsonb, true),
('video', 'Video', '视频模块', '{"fields": [{"name": "src", "type": "url", "required": true}, {"name": "poster", "type": "url"}]}'::jsonb, true),
('gallery', 'Gallery', '图片画廊模块', '{"fields": [{"name": "images", "type": "array", "itemSchema": {"src": "url", "alt": "text"}}]}'::jsonb, true),
('embed', 'Embed', '嵌入内容模块', '{"fields": [{"name": "embed_code", "type": "html", "required": true}]}'::jsonb, true);

-- 插入默认系统设置
INSERT INTO settings (setting_key, display_name, description, setting_type, default_value, group_name) VALUES
('site_name', 'Site Name', '网站名称', 'text', '"My Website"', 'general'),
('site_description', 'Site Description', '网站描述', 'textarea', '""', 'general'),
('site_url', 'Site URL', '网站URL', 'text', '""', 'general'),
('admin_email', 'Admin Email', '管理员邮箱', 'text', '""', 'general'),
('posts_per_page', 'Posts Per Page', '每页文章数', 'number', '10', 'reading'),
('comments_enabled', 'Comments Enabled', '启用评论', 'boolean', 'true', 'discussion'),
('user_registration', 'User Registration', '允许用户注册', 'boolean', 'false', 'general'),
('default_role', 'Default User Role', '新用户默认角色', 'select', '"subscriber"', 'general');

-- 插入默认系统选项
INSERT INTO options (option_name, option_value, description, autoload) VALUES
('version', '"1.0.0"', '系统版本', true),
('installed_at', CURRENT_TIMESTAMP::text, '安装时间', true),
('site_maintenance', 'false', '网站维护模式', false),
('cache_enabled', 'true', '启用缓存', true),
('seo_enabled', 'true', '启用SEO功能', true);

-- =============================================
-- 10. 视图定义
-- =============================================

-- 内容列表视图
CREATE VIEW content_list AS
SELECT 
    c.id,
    c.title,
    c.slug,
    c.content_type,
    c.status,
    c.excerpt,
    c.published_at,
    c.view_count,
    c.comment_count,
    u.display_name AS author_name,
    u.username AS author_username,
    c.created_at,
    c.updated_at
FROM content c
JOIN users u ON c.author_id = u.id;

-- 用户角色视图
CREATE VIEW user_roles_view AS
SELECT 
    u.id AS user_id,
    u.username,
    u.display_name,
    u.email,
    r.name AS role_name,
    r.display_name AS role_display_name,
    r.level AS role_level,
    ur.assigned_at
FROM users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.is_active = true;

-- 评论列表视图
CREATE VIEW comments_list AS
SELECT 
    cm.id,
    cm.content_id,
    c.title AS content_title,
    cm.author_name,
    cm.author_email,
    cm.content,
    cm.status,
    cm.created_at,
    u.display_name AS approved_by_name
FROM comments cm
JOIN content c ON cm.content_id = c.id
LEFT JOIN users u ON cm.approved_by = u.id;

-- 模块化页面视图
CREATE VIEW page_modules_view AS
SELECT 
    pm.id,
    pm.content_id,
    c.title AS page_title,
    mt.name AS module_type,
    mt.display_name AS module_type_display,
    pm.module_order,
    pm.css_classes,
    pm.is_active
FROM page_modules pm
JOIN content c ON pm.content_id = c.id
JOIN module_types mt ON pm.module_type_id = mt.id;

-- =============================================
-- 11. 性能优化建议
-- =============================================

-- 创建分区表（可选，用于大数据量场景）
-- 按月分区内容表
-- CREATE TABLE content_2025_01 PARTITION OF content
-- FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

-- 创建全文搜索索引
-- CREATE INDEX idx_content_fulltext ON content USING GIN(to_tsvector('english', title || ' ' || content));

-- 物化视图用于统计信息（需要定期刷新）
-- CREATE MATERIALIZED VIEW content_stats AS
-- SELECT 
--     content_type,
--     status,
--     COUNT(*) as count,
--     DATE_TRUNC('month', created_at) as month
-- FROM content 
-- GROUP BY content_type, status, DATE_TRUNC('month', created_at);

-- =============================================
-- Schema 创建完成
-- =============================================

-- 注释说明
COMMENT ON TABLE users IS '用户基础信息表，存储用户账户和资料信息';
COMMENT ON TABLE roles IS '角色表，定义系统角色';
COMMENT ON TABLE permissions IS '权限表，定义具体权限';
COMMENT ON TABLE user_roles IS '用户角色关联表，多对多关系';
COMMENT ON TABLE role_permissions IS '角色权限关联表，多对多关系';
COMMENT ON TABLE content IS '统一内容表，支持文章、页面和自定义内容类型';
COMMENT ON TABLE taxonomies IS '分类法表，定义分类体系';
COMMENT ON TABLE terms IS '术语表，具体的分类或标签项';
COMMENT ON TABLE content_terms IS '内容与术语关联表，多对多关系';
COMMENT ON TABLE media IS '媒体文件表，存储文件信息和元数据';
COMMENT ON TABLE media_metadata IS '媒体扩展元数据表';
COMMENT ON TABLE comments IS '评论表，支持嵌套和审核';
COMMENT ON TABLE comment_metadata IS '评论扩展元数据表';
COMMENT ON TABLE options IS '系统配置表，存储站点配置';
COMMENT ON TABLE settings IS '结构化设置项定义表';
COMMENT ON TABLE user_settings IS '用户个人设置值表';
COMMENT ON TABLE menus IS '菜单表';
COMMENT ON TABLE menu_items IS '菜单项表，支持层级结构';
COMMENT ON TABLE module_types IS '模块类型定义表';
COMMENT ON TABLE page_modules IS '页面模块表，支持模块化页面设计';
COMMENT ON TABLE module_data IS '模块数据表，存储模块具体内容';

-- 设置完成标识
DO $$
BEGIN
    RAISE NOTICE 'PostgreSQL CMS Schema 创建完成！';
    RAISE NOTICE '版本: 1.0';
    RAISE NOTICE '创建时间: %', CURRENT_TIMESTAMP;
    RAISE NOTICE '';
    RAISE NOTICE '表结构:';
    RAISE NOTICE '- 用户管理: users, roles, permissions, user_roles, role_permissions';
    RAISE NOTICE '- 内容管理: content, taxonomies, terms, content_terms';
    RAISE NOTICE '- 媒体管理: media, media_metadata';
    RAISE NOTICE '- 评论管理: comments, comment_metadata';
    RAISE NOTICE '- 系统设置: options, settings, user_settings, menus, menu_items';
    RAISE NOTICE '- 模块化页面: module_types, page_modules, module_data';
    RAISE NOTICE '';
    RAISE NOTICE '特性:';
    RAISE NOTICE '- 支持JSONB字段用于扩展数据';
    RAISE NOTICE '- 完整的索引优化';
    RAISE NOTICE '- 自动维护时间戳';
    RAISE NOTICE '- 触发器维护数据一致性';
    RAISE NOTICE '- 基于RBAC的权限系统';
    RAISE NOTICE '- 模块化页面设计';
    RAISE NOTICE '- 全文搜索支持';
END $$;