#!/bin/bash

# WordPress风格博客系统 - 配置验证脚本
# 用途：在部署前验证所有配置文件的正确性
# 使用方法：chmod +x verify-config.sh && ./verify-config.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    ((PASSED++))
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    ((FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    ((WARNINGS++))
}

# ===========================================
# 检查必需文件
# ===========================================
print_header "检查必需文件"

required_files=(
    "docker compose.yml"
    "backend/Dockerfile"
    "backend/requirements.txt"
    "backend/.env.example"
    "backend/app/main.py"
    "frontend/admin/Dockerfile"
    "frontend/admin/nginx.conf"
    "frontend/admin/package.json"
    "frontend/blog/Dockerfile"
    "frontend/blog/nginx.conf"
    "frontend/blog/package.json"
    "nginx/nginx.conf"
    "code/database/schema.sql"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "文件存在: $file"
    else
        print_error "文件缺失: $file"
    fi
done

# ===========================================
# 检查Docker Compose配置
# ===========================================
print_header "检查Docker Compose配置"

if [ -f "docker compose.yml" ]; then
    # 检查服务定义
    services=("postgres" "redis" "api" "admin" "blog" "nginx")
    for service in "${services[@]}"; do
        if grep -q "$service:" docker compose.yml; then
            print_success "服务已定义: $service"
        else
            print_error "服务未定义: $service"
        fi
    done
    
    # 检查网络定义
    if grep -q "networks:" docker compose.yml; then
        print_success "网络配置存在"
    else
        print_warning "未定义Docker网络"
    fi
    
    # 检查卷定义
    if grep -q "volumes:" docker compose.yml; then
        print_success "数据卷配置存在"
    else
        print_warning "未定义数据卷"
    fi
fi

# ===========================================
# 检查后端配置
# ===========================================
print_header "检查后端配置"

if [ -f "backend/.env.example" ]; then
    # 检查环境变量
    env_vars=("DATABASE_URL" "SECRET_KEY" "REDIS_URL")
    for var in "${env_vars[@]}"; do
        if grep -q "$var" backend/.env.example; then
            print_success "环境变量已定义: $var"
        else
            print_warning "环境变量未定义: $var"
        fi
    done
fi

if [ -f "backend/requirements.txt" ]; then
    # 检查关键依赖
    deps=("fastapi" "sqlalchemy" "uvicorn" "pydantic")
    for dep in "${deps[@]}"; do
        if grep -qi "$dep" backend/requirements.txt; then
            print_success "依赖已包含: $dep"
        else
            print_error "依赖缺失: $dep"
        fi
    done
fi

if [ -f "backend/app/main.py" ]; then
    # 检查FastAPI应用
    if grep -q "FastAPI" backend/app/main.py; then
        print_success "FastAPI应用已定义"
    else
        print_error "FastAPI应用未定义"
    fi
    
    # 检查CORS配置
    if grep -q "CORS" backend/app/main.py; then
        print_success "CORS配置存在"
    else
        print_warning "未配置CORS（可能导致前端跨域问题）"
    fi
fi

# ===========================================
# 检查前端配置
# ===========================================
print_header "检查管理后台配置"

if [ -f "frontend/admin/package.json" ]; then
    # 检查关键依赖
    if grep -q "react" frontend/admin/package.json; then
        print_success "React依赖存在"
    fi
    if grep -q "antd" frontend/admin/package.json; then
        print_success "Ant Design依赖存在"
    fi
    if grep -q "axios" frontend/admin/package.json; then
        print_success "Axios依赖存在"
    fi
fi

if [ -f "frontend/admin/nginx.conf" ]; then
    if grep -q "try_files" frontend/admin/nginx.conf; then
        print_success "SPA路由配置存在"
    else
        print_warning "未配置SPA路由（可能导致刷新404）"
    fi
fi

print_header "检查博客前端配置"

if [ -f "frontend/blog/package.json" ]; then
    if grep -q "react" frontend/blog/package.json; then
        print_success "React依赖存在"
    fi
    if grep -q "react-markdown" frontend/blog/package.json; then
        print_success "Markdown渲染依赖存在"
    fi
fi

if [ -f "frontend/blog/.env.example" ]; then
    if grep -q "VITE_API_BASE_URL" frontend/blog/.env.example; then
        print_success "API地址配置存在"
    else
        print_warning "未配置API地址"
    fi
fi

# ===========================================
# 检查Nginx配置
# ===========================================
print_header "检查Nginx配置"

if [ -f "nginx/nginx.conf" ]; then
    # 检查上游服务
    upstreams=("api_backend" "admin_frontend" "blog_frontend")
    for upstream in "${upstreams[@]}"; do
        if grep -q "$upstream" nginx/nginx.conf; then
            print_success "上游服务已定义: $upstream"
        else
            print_warning "上游服务未定义: $upstream"
        fi
    done
    
    # 检查路由配置
    routes=("/api/" "/admin" "/")
    for route in "${routes[@]}"; do
        if grep -q "location $route" nginx/nginx.conf; then
            print_success "路由已配置: $route"
        else
            print_warning "路由未配置: $route"
        fi
    done
fi

# ===========================================
# 检查数据库Schema
# ===========================================
print_header "检查数据库Schema"

if [ -f "code/database/schema.sql" ]; then
    # 检查关键表
    tables=("users" "content" "media" "comments" "categories" "tags")
    for table in "${tables[@]}"; do
        if grep -qi "CREATE TABLE.*$table" code/database/schema.sql; then
            print_success "表定义存在: $table"
        else
            print_error "表定义缺失: $table"
        fi
    done
fi

# ===========================================
# 检查文档
# ===========================================
print_header "检查文档"

docs=("README.md" "QUICKSTART.md" "TESTING_CHECKLIST.md")
for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        print_success "文档存在: $doc"
    else
        print_warning "文档缺失: $doc"
    fi
done

# ===========================================
# 检查页面文件
# ===========================================
print_header "检查页面文件"

admin_pages=(
    "frontend/admin/src/pages/DashboardPage.tsx"
    "frontend/admin/src/pages/ContentListPage.tsx"
    "frontend/admin/src/pages/ContentEditorPage.tsx"
    "frontend/admin/src/pages/UserManagementPage.tsx"
    "frontend/admin/src/pages/CommentManagementPage.tsx"
    "frontend/admin/src/pages/MediaLibraryPage.tsx"
    "frontend/admin/src/pages/SettingsPage.tsx"
)

for page in "${admin_pages[@]}"; do
    if [ -f "$page" ]; then
        print_success "页面存在: $(basename $page)"
    else
        print_error "页面缺失: $(basename $page)"
    fi
done

blog_pages=(
    "frontend/blog/src/pages/HomePage.tsx"
    "frontend/blog/src/pages/PostListPage.tsx"
    "frontend/blog/src/pages/PostDetailPage.tsx"
)

for page in "${blog_pages[@]}"; do
    if [ -f "$page" ]; then
        print_success "页面存在: $(basename $page)"
    else
        print_error "页面缺失: $(basename $page)"
    fi
done

# ===========================================
# 总结
# ===========================================
print_header "验证总结"

total_checks=$((PASSED + FAILED + WARNINGS))

echo -e "总检查项: ${BLUE}$total_checks${NC}"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo -e "警告: ${YELLOW}$WARNINGS${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}✓ 配置验证通过！可以开始部署${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo "下一步："
    echo "  1. 运行: chmod +x deploy-test.sh"
    echo "  2. 运行: ./deploy-test.sh"
    echo "  3. 或手动运行: docker compose up -d"
    
    exit 0
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}✗ 发现 $FAILED 个配置问题${NC}"
    echo -e "${RED}========================================${NC}\n"
    
    echo "请修复上述问题后再继续部署"
    
    exit 1
fi
