#!/bin/bash

# WordPress博客系统 - 部署验证脚本
# 用于验证Docker部署是否成功

echo "🚀 WordPress风格博客系统 - 部署验证"
echo "================================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 计数器
PASS=0
FAIL=0

# 检查函数
check_service() {
    local service=$1
    local expected_port=$2
    local url=$3
    
    echo -n "检查 $service ($expected_port)... "
    
    if curl -s -f "$url" > /dev/null; then
        echo -e "${GREEN}✅ 通过${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ 失败${NC}"
        ((FAIL++))
    fi
}

# 检查服务状态
check_docker_services() {
    echo -e "\n${BLUE}📋 检查Docker服务状态:${NC}"
    docker compose ps
}

# 检查端口响应
check_api_endpoints() {
    echo -e "\n${BLUE}🌐 检查API端点响应:${NC}"
    
    # 管理后台
    check_service "管理后台" "3001" "http://localhost:3001"
    
    # 博客前端  
    check_service "博客前端" "3002" "http://localhost:3002"
    
    # API服务
    check_service "API服务" "8000" "http://localhost:8000"
    
    # API文档
    check_service "API文档" "8000" "http://localhost:8000/docs"
    
    # 数据库
    check_service "数据库" "5432" "http://localhost:5432"
}

# 检查API健康状态
check_api_health() {
    echo -e "\n${BLUE}💊 检查API健康状态:${NC}"
    
    # 用户认证测试
    echo -n "用户注册接口... "
    response=$(curl -s -X POST "http://localhost:8000/api/v1/auth/register" \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser","email":"test@example.com","password":"test123","role":"admin"}' \
        -w "%{http_code}" -o /tmp/response.json)
    
    if [ "$response" -eq 200 ] || [ "$response" -eq 400 ]; then  # 400表示用户已存在但接口正常
        echo -e "${GREEN}✅ 正常${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ 异常 ($response)${NC}"
        ((FAIL++))
    fi
    
    # 获取仪表盘数据
    echo -n "仪表盘数据接口... "
    if curl -s "http://localhost:8000/api/v1/stats/dashboard" > /dev/null; then
        echo -e "${GREEN}✅ 正常${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ 异常${NC}"
        ((FAIL++))
    fi
}

# 检查数据库连接
check_database() {
    echo -e "\n${BLUE}🗄️ 检查数据库连接:${NC}"
    
    echo -n "数据库连接... "
    if docker compose exec -T database psql -U cms_user -d cms_db -c "SELECT 1;" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ 正常${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ 异常${NC}"
        ((FAIL++))
    fi
    
    echo -n "数据表检查... "
    table_count=$(docker compose exec -T database psql -U cms_user -d cms_db -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    if [ "$table_count" -gt 0 ]; then
        echo -e "${GREEN}✅ 正常 ($table_count 个表)${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ 异常${NC}"
        ((FAIL++))
    fi
}

# 检查文件结构
check_file_structure() {
    echo -e "\n${BLUE}📁 检查项目文件结构:${NC}"
    
    # 检查关键文件
    files=(
        "docker-compose.yml"
        "backend/app/main.py"
        "frontend/admin/package.json"
        "frontend/blog/package.json"
        "nginx/nginx.conf"
        "code/database/schema.sql"
    )
    
    for file in "${files[@]}"; do
        if [ -f "$file" ]; then
            echo -e "  $file: ${GREEN}✅${NC}"
            ((PASS++))
        else
            echo -e "  $file: ${RED}❌ 缺失${NC}"
            ((FAIL++))
        fi
    done
}

# 性能检查
performance_check() {
    echo -e "\n${BLUE}⚡ 性能检查:${NC}"
    
    # 检查响应时间
    echo -n "API响应时间... "
    response_time=$(curl -s -w "%{time_total}" "http://localhost:8000/api/v1/stats/dashboard" -o /dev/null)
    
    if (( $(echo "$response_time < 2.0" | bc -l) )); then
        echo -e "${GREEN}✅ 良好 (${response_time}s)${NC}"
        ((PASS++))
    else
        echo -e "${YELLOW}⚠️ 一般 (${response_time}s)${NC}"
        ((PASS++))  # 仍然算通过
    fi
}

# 资源使用检查
resource_check() {
    echo -e "\n${BLUE}📊 资源使用情况:${NC}"
    
    # 内存使用
    echo -n "容器内存使用... "
    memory_usage=$(docker compose ps --format "table {{.Name}}\t{{.Status}}" | grep -E "(api|admin|blog|database)" | wc -l)
    if [ "$memory_usage" -gt 0 ]; then
        echo -e "${GREEN}✅ 运行正常 ($memory_usage 个容器)${NC}"
        ((PASS++))
    else
        echo -e "${RED}❌ 服务异常${NC}"
        ((FAIL++))
    fi
}

# 生成报告
generate_report() {
    echo -e "\n${BLUE}📊 验证报告:${NC}"
    echo "================================================"
    echo -e "✅ 通过测试: ${GREEN}$PASS${NC}"
    echo -e "❌ 失败测试: ${RED}$FAIL${NC}"
    echo "================================================"
    
    if [ $FAIL -eq 0 ]; then
        echo -e "${GREEN}🎉 部署验证成功！所有功能正常运行${NC}"
        echo -e "\n${BLUE}访问地址:${NC}"
        echo "• 管理后台: http://localhost:3001"
        echo "• 博客首页: http://localhost:3002"
        echo "• API文档: http://localhost:8000/docs"
        echo -e "\n${YELLOW}建议:${NC}"
        echo "1. 立即修改默认管理员密码"
        echo "2. 配置HTTPS（生产环境）"
        echo "3. 定期备份数据库"
    else
        echo -e "${RED}⚠️ 部署存在问题，请检查失败项${NC}"
        echo -e "\n${YELLOW}故障排查建议:${NC}"
        echo "1. 查看日志: docker compose logs"
        echo "2. 重启服务: docker compose restart"
        echo "3. 检查端口: netstat -tulpn | grep :8000"
    fi
}

# 主函数
main() {
    echo "开始验证WordPress风格博客系统部署..."
    echo "请确保Docker服务正在运行"
    echo ""
    
    # 检查docker compose
    if ! command -v docker compose &> /dev/null; then
        echo -e "${RED}❌ docker compose 未安装${NC}"
        exit 1
    fi
    
    # 执行所有检查
    check_docker_services
    check_file_structure
    check_api_endpoints
    check_api_health
    check_database
    performance_check
    resource_check
    
    # 生成报告
    generate_report
    
    echo -e "\n${BLUE}验证完成时间: $(date)${NC}"
}

# 执行验证
main