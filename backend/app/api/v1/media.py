from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional
from ...database import get_db
from ...models.media import Media
from ...models.user import User
from ...schemas.media import MediaCreate, MediaUpdate, MediaResponse
from ...core.security import get_current_active_user
from ...config import settings
import uuid
import os
from datetime import datetime
import shutil

router = APIRouter()


@router.post("/upload", response_model=MediaResponse, status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """上传媒体文件"""
    # 检查文件大小
    if file.size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"文件大小超过限制({settings.MAX_UPLOAD_SIZE} bytes)"
        )
    
    # 创建上传目录
    upload_dir = os.path.join(settings.UPLOAD_DIR, datetime.now().strftime("%Y/%m"))
    os.makedirs(upload_dir, exist_ok=True)
    
    # 生成文件名
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(upload_dir, filename)
    
    # 保存文件
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"文件保存失败: {str(e)}"
        )
    
    # 创建媒体记录
    media = Media(
        filename=filename,
        original_filename=file.filename,
        file_path=file_path,
        file_url=f"/uploads/{datetime.now().strftime('%Y/%m')}/{filename}",
        mime_type=file.content_type,
        file_size=file.size
    )
    
    db.add(media)
    db.commit()
    db.refresh(media)
    
    return media


@router.get("", response_model=List[MediaResponse])
async def list_media(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    mime_type: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取媒体列表"""
    query = db.query(Media)
    
    if mime_type:
        query = query.filter(Media.mime_type.like(f"{mime_type}%"))
    if status:
        query = query.filter(Media.status == status)
    
    query = query.order_by(Media.created_at.desc())
    media_list = query.offset(skip).limit(limit).all()
    
    return media_list


@router.get("/{media_id}", response_model=MediaResponse)
async def get_media(
    media_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """获取指定媒体"""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="媒体不存在"
        )
    return media


@router.put("/{media_id}", response_model=MediaResponse)
async def update_media(
    media_id: uuid.UUID,
    media_update: MediaUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新媒体信息"""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="媒体不存在"
        )
    
    update_data = media_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(media, field, value)
    
    db.commit()
    db.refresh(media)
    
    return media


@router.delete("/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除媒体"""
    media = db.query(Media).filter(Media.id == media_id).first()
    if not media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="媒体不存在"
        )
    
    # 删除文件
    try:
        if os.path.exists(media.file_path):
            os.remove(media.file_path)
    except Exception as e:
        print(f"删除文件失败: {e}")
    
    db.delete(media)
    db.commit()
    
    return None
