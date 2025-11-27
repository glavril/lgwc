#!/bin/bash

# 后端API服务启动脚本

# 检查Python环境
if ! command -v python3 &> /dev/null; then
    echo "Error: Python3 未安装"
    exit 1
fi

# 安装依赖
echo "安装Python依赖..."
pip install -r requirements.txt

# 创建上传目录
mkdir -p uploads

# 启动服务
echo "启动FastAPI服务..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
