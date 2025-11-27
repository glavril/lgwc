from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...database import get_db
from ...models.content import Content
from ...models.user import User
from ...schemas.content import ContentCreate, ContentUpdate, ContentResponse
from ...core.security import get_current_active_user
from slugify import slugify
import uuid
from datetime import datetime

router = APIRouter()


@router.post("", response_model=ContentResponse, status_code=status.HTTP_201_CREATED)
async def create_content(
    content_data: ContentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建内容"""
    # 生成slug
    if not content_data.slug:
        base_slug = slugify(content_data.title)
        slug = base_slug
        counter = 1
        while db.query(Content).filter(Content.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
    else:
        slug = content_data.slug
        if db.query(Content).filter(Content.slug == slug).first():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该slug已存在"
            )
    
    # 创建内容
    new_content = Content(
        **content_data.dict(exclude={'slug'}),
        slug=slug,
        author_id=current_user.id
    )
    
    # 如果状态为published,设置发布时间
    if new_content.status == 'published' and not new_content.published_at:
        new_content.published_at = datetime.utcnow()
    
    db.add(new_content)
    db.commit()
    db.refresh(new_content)
    
    return new_content


@router.get("", response_model=List[ContentResponse])
async def list_content(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    content_type: Optional[str] = None,
    status: Optional[str] = None,
    author_id: Optional[uuid.UUID] = None,
    db: Session = Depends(get_db)
):
    """获取内容列表"""
    query = db.query(Content)
    
    if content_type:
        query = query.filter(Content.content_type == content_type)
    if status:
        query = query.filter(Content.status == status)
    if author_id:
        query = query.filter(Content.author_id == author_id)
    
    query = query.order_by(Content.created_at.desc())
    content_list = query.offset(skip).limit(limit).all()
    
    return content_list


@router.get("/{content_id}", response_model=ContentResponse)
async def get_content(
    content_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """获取指定内容"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="内容不存在"
        )
    
    # 增加浏览次数
    content.view_count += 1
    db.commit()
    
    return content


@router.get("/slug/{slug}", response_model=ContentResponse)
async def get_content_by_slug(
    slug: str,
    db: Session = Depends(get_db)
):
    """通过slug获取内容"""
    content = db.query(Content).filter(Content.slug == slug).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="内容不存在"
        )
    
    # 增加浏览次数
    content.view_count += 1
    db.commit()
    
    return content


@router.put("/{content_id}", response_model=ContentResponse)
async def update_content(
    content_id: uuid.UUID,
    content_update: ContentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新内容"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="内容不存在"
        )
    
    # 检查权限(只有作者或管理员可以编辑)
    if content.author_id != current_user.id:
        # 这里应该检查是否为管理员,暂时简化处理
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权编辑此内容"
        )
    
    # 更新字段
    update_data = content_update.dict(exclude_unset=True)
    
    # 如果更新了标题但没有更新slug,自动生成新slug
    if 'title' in update_data and 'slug' not in update_data:
        base_slug = slugify(update_data['title'])
        slug = base_slug
        counter = 1
        while db.query(Content).filter(
            Content.slug == slug,
            Content.id != content_id
        ).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        update_data['slug'] = slug
    
    # 如果状态改为published,设置发布时间
    if update_data.get('status') == 'published' and not content.published_at:
        update_data['published_at'] = datetime.utcnow()
    
    for field, value in update_data.items():
        setattr(content, field, value)
    
    db.commit()
    db.refresh(content)
    
    return content


@router.delete("/{content_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_content(
    content_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除内容"""
    content = db.query(Content).filter(Content.id == content_id).first()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="内容不存在"
        )
    
    # 检查权限
    if content.author_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="无权删除此内容"
        )
    
    db.delete(content)
    db.commit()
    
    return None
