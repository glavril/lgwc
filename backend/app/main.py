from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from .config import settings
from .api.v1 import auth, users, content, media, modules, stats
import os
import time

# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求日志中间件
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    print(f"{request.method} {request.url.path} - {response.status_code} - {process_time:.3f}s")
    return response

# 异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "detail": "内部服务器错误",
            "error": str(exc) if settings.DEBUG else "发生了一个错误"
        }
    )

# API路由
api_v1_prefix = "/api/v1"
app.include_router(auth.router, prefix=f"{api_v1_prefix}/auth", tags=["认证"])
app.include_router(users.router, prefix=f"{api_v1_prefix}/users", tags=["用户"])
app.include_router(content.router, prefix=f"{api_v1_prefix}/content", tags=["内容"])
app.include_router(media.router, prefix=f"{api_v1_prefix}/media", tags=["媒体"])
app.include_router(modules.router, prefix=f"{api_v1_prefix}/modules", tags=["模块"])
app.include_router(stats.router, prefix=f"{api_v1_prefix}/stats", tags=["统计"])

# 静态文件服务
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
else:
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# 根路径
@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# 健康检查
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time()
    }

# 启动事件
@app.on_event("startup")
async def startup_event():
    print(f"启动 {settings.APP_NAME} v{settings.APP_VERSION}")
    print(f"调试模式: {settings.DEBUG}")
    print(f"API文档: http://localhost:8000/docs")

# 关闭事件
@app.on_event("shutdown")
async def shutdown_event():
    print(f"关闭 {settings.APP_NAME}")
