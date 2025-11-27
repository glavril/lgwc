#!/bin/bash

# WordPress风格博客系统 - 完整部署测试脚本
# 用途：验证Docker部署的所有组件和功能
# 使用方法：chmod +x deploy-test.sh && ./deploy-test.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 测试结果统计
PASSED=0
FAILED=0
WARNINGS=0

# 打印函数
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

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# 等待服务就绪
wait_for_service() {
    local url=$1
    local max_attempts=30
    local attempt=1
    
    print_info "等待服务就绪: $url"
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s -f -o /dev/null "$url"; then
            return 0
        fi
        echo -n "."
        sleep 2
        ((attempt++))
    done
    
    return 1
}

# ===========================================
# 第1步：环境检查
# ===========================================
print_header "第1步：环境检查"

if command -v docker &> /dev/null; then
    print_success "Docker已安装: $(docker --version)"
else
    print_error "Docker未安装"
    exit 1
fi

if command -v docker compose &> /dev/null; then
    print_success "Docker Compose已安装: $(docker compose --version)"
elif docker compose version &> /dev/null; then
    print_success "Docker Compose已安装: $(docker compose version)"
    # 创建别名
    shopt -s expand_aliases
    alias docker compose='docker compose'
else
    print_error "Docker Compose未安装"
    exit 1
fi

if command -v curl &> /dev/null; then
    print_success "curl已安装"
else
    print_error "curl未安装，请先安装curl"
    exit 1
fi

# ===========================================
# 第2步：清理旧容器
# ===========================================
print_header "第2步：清理旧容器（可选）"

read -p "是否清理旧容器和数据？[y/N] " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "停止并删除旧容器..."
    docker compose down -v 2>/dev/null || true
    print_success "旧容器已清理"
else
    print_info "跳过清理步骤"
fi

# ===========================================
# 第3步：启动Docker服务
# ===========================================
print_header "第3步：启动Docker服务"

print_info "启动所有服务（这可能需要几分钟）..."
docker compose up -d

if [ $? -eq 0 ]; then
    print_success "Docker Compose启动成功"
else
    print_error "Docker Compose启动失败"
    exit 1
fi

sleep 5

# ===========================================
# 第4步：检查容器状态
# ===========================================
print_header "第4步：检查容器状态"

containers=("cms_postgres" "cms_redis" "cms_api" "cms_admin" "cms_blog" "cms_nginx")

for container in "${containers[@]}"; do
    if docker ps | grep -q "$container"; then
        status=$(docker inspect --format='{{.State.Status}}' "$container")
        if [ "$status" == "running" ]; then
            print_success "容器 $container 正在运行"
        else
            print_error "容器 $container 状态异常: $status"
        fi
    else
        print_error "容器 $container 未找到"
    fi
done

# ===========================================
# 第5步：检查容器日志
# ===========================================
print_header "第5步：检查容器日志（错误检测）"

for container in "${containers[@]}"; do
    if docker ps | grep -q "$container"; then
        errors=$(docker logs "$container" 2>&1 | grep -i "error\|fail\|exception" | wc -l)
        if [ "$errors" -eq 0 ]; then
            print_success "容器 $container 日志正常"
        else
            print_warning "容器 $container 日志中有 $errors 条错误/警告"
            echo "最近的错误："
            docker logs "$container" 2>&1 | grep -i "error\|fail\|exception" | tail -3
        fi
    fi
done

# ===========================================
# 第6步：数据库连接测试
# ===========================================
print_header "第6步：数据库连接测试"

print_info "测试PostgreSQL连接..."
if docker exec cms_postgres psql -U postgres -d cms_db -c "SELECT version();" &> /dev/null; then
    print_success "PostgreSQL连接成功"
    
    # 检查表是否创建
    tables=$(docker exec cms_postgres psql -U postgres -d cms_db -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
    if [ "$tables" -gt 0 ]; then
        print_success "数据库表已创建 ($tables 个表)"
    else
        print_warning "数据库表未创建，可能需要运行迁移"
    fi
else
    print_error "PostgreSQL连接失败"
fi

print_info "测试Redis连接..."
if docker exec cms_redis redis-cli ping | grep -q "PONG"; then
    print_success "Redis连接成功"
else
    print_error "Redis连接失败"
fi

# ===========================================
# 第7步：后端API测试
# ===========================================
print_header "第7步：后端API测试"

# 等待API服务就绪
if wait_for_service "http://localhost:8000/docs"; then
    print_success "API服务就绪"
else
    print_error "API服务超时未就绪"
fi

# 测试API文档
print_info "测试API文档页面..."
if curl -s -f "http://localhost:8000/docs" > /dev/null; then
    print_success "API文档可访问 (http://localhost:8000/docs)"
else
    print_error "API文档不可访问"
fi

# 测试健康检查
print_info "测试健康检查端点..."
if curl -s -f "http://localhost:8000/health" > /dev/null; then
    print_success "健康检查端点正常"
else
    print_warning "健康检查端点不可用（可能未实现）"
fi

# 测试用户注册
print_info "测试用户注册API..."
register_response=$(curl -s -w "%{http_code}" -X POST "http://localhost:8000/api/v1/auth/register" \
    -H "Content-Type: application/json" \
    -d '{"username":"testuser","email":"test@example.com","password":"test123","display_name":"测试用户"}' \
    -o /tmp/register_response.json)

if [ "$register_response" == "200" ] || [ "$register_response" == "201" ]; then
    print_success "用户注册API正常 (HTTP $register_response)"
elif [ "$register_response" == "400" ]; then
    print_warning "用户注册API返回400（用户可能已存在）"
else
    print_error "用户注册API失败 (HTTP $register_response)"
fi

# 测试内容列表API
print_info "测试内容列表API..."
content_response=$(curl -s -w "%{http_code}" "http://localhost:8000/api/v1/content" -o /tmp/content_response.json)

if [ "$content_response" == "200" ]; then
    print_success "内容列表API正常"
elif [ "$content_response" == "401" ]; then
    print_warning "内容列表API需要认证（符合预期）"
else
    print_error "内容列表API失败 (HTTP $content_response)"
fi

# ===========================================
# 第8步：前端访问测试
# ===========================================
print_header "第8步：前端访问测试"

# 测试管理后台
print_info "测试管理后台..."
if wait_for_service "http://localhost:3000"; then
    if curl -s -f "http://localhost:3000" | grep -q "html"; then
        print_success "管理后台可访问 (http://localhost:3000)"
    else
        print_error "管理后台返回异常内容"
    fi
else
    print_error "管理后台超时未就绪"
fi

# 测试博客前端
print_info "测试博客前端..."
if wait_for_service "http://localhost:3001"; then
    if curl -s -f "http://localhost:3001" | grep -q "html"; then
        print_success "博客前端可访问 (http://localhost:3001)"
    else
        print_error "博客前端返回异常内容"
    fi
else
    print_error "博客前端超时未就绪"
fi

# ===========================================
# 第9步：Nginx反向代理测试
# ===========================================
print_header "第9步：Nginx反向代理测试"

print_info "测试Nginx统一入口..."
if curl -s -f "http://localhost/" > /dev/null; then
    print_success "Nginx根路径可访问（博客前端）"
else
    print_error "Nginx根路径不可访问"
fi

print_info "测试Nginx管理后台路由..."
if curl -s -f "http://localhost/admin" > /dev/null; then
    print_success "Nginx /admin路径可访问"
else
    print_error "Nginx /admin路径不可访问"
fi

print_info "测试Nginx API路由..."
if curl -s -f "http://localhost/api/v1/content" > /dev/null 2>&1 || \
   curl -s "http://localhost/api/v1/content" | grep -q "401\|200"; then
    print_success "Nginx /api路径可访问"
else
    print_error "Nginx /api路径不可访问"
fi

# ===========================================
# 第10步：容器资源使用情况
# ===========================================
print_header "第10步：容器资源使用情况"

docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" "${containers[@]}" 2>/dev/null || print_warning "无法获取资源使用情况"

# ===========================================
# 第11步：网络连通性测试
# ===========================================
print_header "第11步：容器间网络测试"

print_info "测试API到数据库的连接..."
if docker exec cms_api sh -c "nc -zv postgres 5432" 2>&1 | grep -q "open\|succeed"; then
    print_success "API可以连接到PostgreSQL"
else
    print_warning "无法验证API到PostgreSQL的连接"
fi

print_info "测试API到Redis的连接..."
if docker exec cms_api sh -c "nc -zv redis 6379" 2>&1 | grep -q "open\|succeed"; then
    print_success "API可以连接到Redis"
else
    print_warning "无法验证API到Redis的连接"
fi

# ===========================================
# 测试总结
# ===========================================
print_header "测试总结"

total_tests=$((PASSED + FAILED + WARNINGS))

echo -e "总测试数: ${BLUE}$total_tests${NC}"
echo -e "通过: ${GREEN}$PASSED${NC}"
echo -e "失败: ${RED}$FAILED${NC}"
echo -e "警告: ${YELLOW}$WARNINGS${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}🎉 所有关键测试通过！系统部署成功！${NC}"
    echo -e "${GREEN}========================================${NC}\n"
    
    echo "访问地址："
    echo "  - API文档: http://localhost:8000/docs"
    echo "  - 管理后台: http://localhost:3000"
    echo "  - 博客前端: http://localhost:3001"
    echo "  - Nginx入口: http://localhost"
    
    exit 0
else
    echo -e "\n${RED}========================================${NC}"
    echo -e "${RED}⚠️  测试发现 $FAILED 个问题，请检查日志${NC}"
    echo -e "${RED}========================================${NC}\n"
    
    echo "故障排查命令："
    echo "  查看所有日志: docker compose logs"
    echo "  查看API日志: docker compose logs api"
    echo "  查看数据库日志: docker compose logs postgres"
    echo "  重启服务: docker compose restart"
    echo "  停止服务: docker compose down"
    
    exit 1
fi
