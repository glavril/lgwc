#!/usr/bin/env python3
"""
WordPress风格博客系统 - 配置验证工具
验证所有配置文件和组件的完整性
"""

import os
import json
import sys
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

class Validator:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.warnings = 0
        
    def success(self, msg):
        print(f"{Colors.GREEN}✓ {msg}{Colors.END}")
        self.passed += 1
        
    def error(self, msg):
        print(f"{Colors.RED}✗ {msg}{Colors.END}")
        self.failed += 1
        
    def warning(self, msg):
        print(f"{Colors.YELLOW}⚠ {msg}{Colors.END}")
        self.warnings += 1
        
    def header(self, msg):
        print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
        print(f"{Colors.BLUE}{msg}{Colors.END}")
        print(f"{Colors.BLUE}{'='*50}{Colors.END}\n")
        
    def check_file(self, path, description=None):
        """检查文件是否存在"""
        if os.path.exists(path):
            self.success(f"文件存在: {description or path}")
            return True
        else:
            self.error(f"文件缺失: {description or path}")
            return False
            
    def check_file_content(self, path, keyword, description):
        """检查文件内容是否包含关键字"""
        try:
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
                if keyword.lower() in content.lower():
                    self.success(f"{description}")
                    return True
                else:
                    self.error(f"{description} - 未找到关键字: {keyword}")
                    return False
        except Exception as e:
            self.error(f"无法读取文件 {path}: {e}")
            return False
            
    def summary(self):
        """打印总结"""
        total = self.passed + self.failed + self.warnings
        
        print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
        print(f"{Colors.BLUE}验证总结{Colors.END}")
        print(f"{Colors.BLUE}{'='*50}{Colors.END}\n")
        
        print(f"总检查项: {total}")
        print(f"{Colors.GREEN}通过: {self.passed}{Colors.END}")
        print(f"{Colors.RED}失败: {self.failed}{Colors.END}")
        print(f"{Colors.YELLOW}警告: {self.warnings}{Colors.END}\n")
        
        if self.failed == 0:
            print(f"{Colors.GREEN}{'='*50}{Colors.END}")
            print(f"{Colors.GREEN}✓ 配置验证通过！可以开始部署{Colors.END}")
            print(f"{Colors.GREEN}{'='*50}{Colors.END}\n")
            return True
        else:
            print(f"{Colors.RED}{'='*50}{Colors.END}")
            print(f"{Colors.RED}✗ 发现 {self.failed} 个配置问题{Colors.END}")
            print(f"{Colors.RED}{'='*50}{Colors.END}\n")
            return False

def main():
    v = Validator()
    base_path = Path('/workspace')
    
    # ========== 检查必需文件 ==========
    v.header("1. 检查必需文件")
    
    required_files = [
        'docker-compose.yml',
        'backend/Dockerfile',
        'backend/requirements.txt',
        'backend/.env.example',
        'backend/app/main.py',
        'frontend/admin/Dockerfile',
        'frontend/admin/nginx.conf',
        'frontend/admin/package.json',
        'frontend/blog/Dockerfile',
        'frontend/blog/nginx.conf',
        'frontend/blog/package.json',
        'nginx/nginx.conf',
        'code/database/schema.sql',
    ]
    
    for file in required_files:
        v.check_file(base_path / file, file)
    
    # ========== 检查Docker Compose ==========
    v.header("2. 检查Docker Compose配置")
    
    docker_compose = base_path / 'docker-compose.yml'
    if os.path.exists(docker_compose):
        services = ['postgres', 'redis', 'api', 'admin', 'blog', 'nginx']
        for service in services:
            v.check_file_content(docker_compose, f'{service}:', f'服务已定义: {service}')
    
    # ========== 检查后端配置 ==========
    v.header("3. 检查后端配置")
    
    # 检查环境变量
    env_example = base_path / 'backend/.env.example'
    if os.path.exists(env_example):
        env_vars = ['DATABASE_URL', 'SECRET_KEY', 'REDIS_URL']
        for var in env_vars:
            v.check_file_content(env_example, var, f'环境变量: {var}')
    
    # 检查依赖
    requirements = base_path / 'backend/requirements.txt'
    if os.path.exists(requirements):
        deps = ['fastapi', 'sqlalchemy', 'uvicorn', 'pydantic']
        for dep in deps:
            v.check_file_content(requirements, dep, f'依赖包: {dep}')
    
    # 检查FastAPI应用
    main_py = base_path / 'backend/app/main.py'
    if os.path.exists(main_py):
        v.check_file_content(main_py, 'FastAPI', 'FastAPI应用已定义')
        v.check_file_content(main_py, 'CORS', 'CORS配置存在')
    
    # ========== 检查管理后台 ==========
    v.header("4. 检查管理后台配置")
    
    admin_package = base_path / 'frontend/admin/package.json'
    if os.path.exists(admin_package):
        try:
            with open(admin_package, 'r') as f:
                pkg = json.load(f)
                deps = pkg.get('dependencies', {})
                
                check_deps = ['react', 'antd', 'axios', '@ant-design/plots']
                for dep in check_deps:
                    if dep in deps:
                        v.success(f'依赖包: {dep}')
                    else:
                        v.warning(f'依赖包缺失: {dep}')
        except Exception as e:
            v.error(f'无法解析package.json: {e}')
    
    # ========== 检查博客前端 ==========
    v.header("5. 检查博客前端配置")
    
    blog_package = base_path / 'frontend/blog/package.json'
    if os.path.exists(blog_package):
        try:
            with open(blog_package, 'r') as f:
                pkg = json.load(f)
                deps = pkg.get('dependencies', {})
                
                check_deps = ['react', 'react-markdown', 'axios']
                for dep in check_deps:
                    if dep in deps:
                        v.success(f'依赖包: {dep}')
                    else:
                        v.error(f'依赖包缺失: {dep}')
        except Exception as e:
            v.error(f'无法解析package.json: {e}')
    
    # ========== 检查Nginx配置 ==========
    v.header("6. 检查Nginx配置")
    
    nginx_conf = base_path / 'nginx/nginx.conf'
    if os.path.exists(nginx_conf):
        upstreams = ['api_backend', 'admin_frontend', 'blog_frontend']
        for upstream in upstreams:
            v.check_file_content(nginx_conf, upstream, f'上游服务: {upstream}')
            
        routes = ['/api/', '/admin', 'location /']
        for route in routes:
            v.check_file_content(nginx_conf, route, f'路由配置: {route}')
    
    # ========== 检查数据库Schema ==========
    v.header("7. 检查数据库Schema")
    
    schema_sql = base_path / 'code/database/schema.sql'
    if os.path.exists(schema_sql):
        tables = ['users', 'content', 'media', 'comments', 'categories', 'tags']
        for table in tables:
            v.check_file_content(schema_sql, f'CREATE TABLE', f'表定义检查: {table}')
    
    # ========== 检查页面文件 ==========
    v.header("8. 检查管理后台页面")
    
    admin_pages = [
        'frontend/admin/src/pages/DashboardPage.tsx',
        'frontend/admin/src/pages/ContentListPage.tsx',
        'frontend/admin/src/pages/ContentEditorPage.tsx',
        'frontend/admin/src/pages/UserManagementPage.tsx',
        'frontend/admin/src/pages/CommentManagementPage.tsx',
        'frontend/admin/src/pages/MediaLibraryPage.tsx',
        'frontend/admin/src/pages/SettingsPage.tsx',
        'frontend/admin/src/pages/PageBuilderPage.tsx',
    ]
    
    for page in admin_pages:
        page_name = os.path.basename(page)
        v.check_file(base_path / page, f'管理页面: {page_name}')
    
    v.header("9. 检查博客前端页面")
    
    blog_pages = [
        'frontend/blog/src/pages/HomePage.tsx',
        'frontend/blog/src/pages/PostListPage.tsx',
        'frontend/blog/src/pages/PostDetailPage.tsx',
        'frontend/blog/src/pages/PageDetailPage.tsx',
    ]
    
    for page in blog_pages:
        page_name = os.path.basename(page)
        v.check_file(base_path / page, f'博客页面: {page_name}')
    
    # ========== 检查文档 ==========
    v.header("10. 检查文档")
    
    docs = [
        'README.md',
        'QUICKSTART.md',
        'TESTING_CHECKLIST.md',
        'PROJECT_SUMMARY.md',
        'DELIVERY.md',
        'DEPLOYMENT_VERIFICATION.md',
    ]
    
    for doc in docs:
        v.check_file(base_path / doc, f'文档: {doc}')
    
    # ========== 打印总结 ==========
    success = v.summary()
    
    if success:
        print("下一步：")
        print("  1. 在有Docker环境的机器上运行: bash deploy-test.sh")
        print("  2. 或手动运行: docker-compose up -d")
        print("  3. 查看测试清单: cat TESTING_CHECKLIST.md")
        return 0
    else:
        print("请修复上述问题后再继续")
        return 1

if __name__ == '__main__':
    sys.exit(main())
