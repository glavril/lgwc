from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, Any, List
from ...database import get_db
from ...models.content import Content
from ...models.user import User
from ...models.comment import Comment
from ...models.media import Media
from datetime import datetime, timedelta

router = APIRouter()


@router.get("/dashboard")
async def get_dashboard_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """获取仪表盘统计数据"""
    
    # 用户总数
    total_users = db.query(func.count(User.id)).scalar() or 0
    
    # 文章总数（只统计文章类型）
    total_posts = db.query(func.count(Content.id)).filter(
        Content.content_type == 'post'
    ).scalar() or 0
    
    # 评论总数
    total_comments = db.query(func.count(Comment.id)).scalar() or 0
    
    # 总浏览量
    total_views = db.query(func.sum(Content.view_count)).scalar() or 0
    
    # 最近7天的浏览量趋势
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    view_trend = []
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        # 这里简化处理，使用created_at作为代理（实际应该有专门的浏览记录表）
        # 由于没有浏览记录表，使用当天创建的内容的总浏览量作为估算
        daily_views = db.query(func.sum(Content.view_count)).filter(
            Content.created_at >= day_start,
            Content.created_at < day_end
        ).scalar() or 0
        
        view_trend.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "views": int(daily_views) if daily_views else 0
        })
    
    # 最近7天的文章发布趋势
    publish_trend = []
    for i in range(7):
        day = seven_days_ago + timedelta(days=i)
        day_start = day.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        
        daily_posts = db.query(func.count(Content.id)).filter(
            Content.content_type == 'post',
            Content.created_at >= day_start,
            Content.created_at < day_end
        ).scalar() or 0
        
        publish_trend.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "count": int(daily_posts) if daily_posts else 0
        })
    
    # 最近5篇文章
    recent_posts = db.query(Content).filter(
        Content.content_type == 'post'
    ).order_by(Content.created_at.desc()).limit(5).all()
    
    recent_posts_data = [
        {
            "id": str(post.id),
            "title": post.title,
            "status": post.status,
            "view_count": post.view_count,
            "created_at": post.created_at.isoformat() if post.created_at else None
        }
        for post in recent_posts
    ]
    
    # 最近5条评论
    recent_comments = db.query(Comment).order_by(
        Comment.created_at.desc()
    ).limit(5).all()
    
    recent_comments_data = [
        {
            "id": str(comment.id),
            "author": comment.author_name,
            "content": comment.content[:50] + "..." if len(comment.content) > 50 else comment.content,
            "status": comment.status,
            "created_at": comment.created_at.isoformat() if comment.created_at else None
        }
        for comment in recent_comments
    ]
    
    return {
        "summary": {
            "total_users": total_users,
            "total_posts": total_posts,
            "total_comments": total_comments,
            "total_views": int(total_views) if total_views else 0
        },
        "view_trend": view_trend,
        "publish_trend": publish_trend,
        "recent_posts": recent_posts_data,
        "recent_comments": recent_comments_data
    }


@router.get("/overview")
async def get_overview_stats(db: Session = Depends(get_db)) -> Dict[str, Any]:
    """获取概览统计数据"""
    
    # 内容统计
    total_content = db.query(func.count(Content.id)).scalar() or 0
    published_content = db.query(func.count(Content.id)).filter(
        Content.status == 'published'
    ).scalar() or 0
    draft_content = db.query(func.count(Content.id)).filter(
        Content.status == 'draft'
    ).scalar() or 0
    
    # 用户统计
    total_users = db.query(func.count(User.id)).scalar() or 0
    active_users = db.query(func.count(User.id)).filter(
        User.status == 'active'
    ).scalar() or 0
    
    # 评论统计
    total_comments = db.query(func.count(Comment.id)).scalar() or 0
    approved_comments = db.query(func.count(Comment.id)).filter(
        Comment.status == 'approved'
    ).scalar() or 0
    pending_comments = db.query(func.count(Comment.id)).filter(
        Comment.status == 'pending'
    ).scalar() or 0
    
    # 媒体统计
    total_media = db.query(func.count(Media.id)).scalar() or 0
    total_media_size = db.query(func.sum(Media.file_size)).scalar() or 0
    
    return {
        "content": {
            "total": total_content,
            "published": published_content,
            "draft": draft_content
        },
        "users": {
            "total": total_users,
            "active": active_users
        },
        "comments": {
            "total": total_comments,
            "approved": approved_comments,
            "pending": pending_comments
        },
        "media": {
            "total": total_media,
            "total_size": int(total_media_size) if total_media_size else 0
        }
    }
