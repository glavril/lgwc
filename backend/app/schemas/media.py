from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


# 媒体创建
class MediaCreate(BaseModel):
    filename: str
    original_filename: str
    file_path: str
    file_url: str
    mime_type: str
    file_size: int
    width: Optional[int] = None
    height: Optional[int] = None
    duration: Optional[int] = None
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    description: Optional[str] = None
    metadata: Dict[str, Any] = {}


# 媒体更新
class MediaUpdate(BaseModel):
    alt_text: Optional[str] = None
    caption: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# 媒体响应
class MediaResponse(BaseModel):
    id: uuid.UUID
    filename: str
    original_filename: str
    file_path: str
    file_url: str
    mime_type: str
    file_size: int
    width: Optional[int]
    height: Optional[int]
    duration: Optional[int]
    alt_text: Optional[str]
    caption: Optional[str]
    description: Optional[str]
    usage_count: int
    status: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    
    class Config:
        from_attributes = True
