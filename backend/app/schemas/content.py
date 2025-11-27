from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid


# 内容创建
class ContentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    slug: Optional[str] = None
    content_type: str = Field(default="post")
    status: str = Field(default="draft")
    content_format: str = Field(default="html")
    excerpt: Optional[str] = None
    content: str = Field(..., min_length=1)
    content_json: Optional[Dict[str, Any]] = None
    featured_image_id: Optional[uuid.UUID] = None
    parent_id: Optional[uuid.UUID] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = []
    scheduled_for: Optional[datetime] = None
    metadata: Dict[str, Any] = {}


# 内容更新
class ContentUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    status: Optional[str] = None
    content_format: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    content_json: Optional[Dict[str, Any]] = None
    featured_image_id: Optional[uuid.UUID] = None
    parent_id: Optional[uuid.UUID] = None
    meta_title: Optional[str] = None
    meta_description: Optional[str] = None
    meta_keywords: Optional[List[str]] = None
    scheduled_for: Optional[datetime] = None
    metadata: Optional[Dict[str, Any]] = None


# 内容响应
class ContentResponse(BaseModel):
    id: uuid.UUID
    title: str
    slug: str
    content_type: str
    status: str
    content_format: str
    excerpt: Optional[str]
    content: str
    content_json: Optional[Dict[str, Any]]
    featured_image_id: Optional[uuid.UUID]
    author_id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    menu_order: int
    meta_title: Optional[str]
    meta_description: Optional[str]
    meta_keywords: Optional[List[str]]
    published_at: Optional[datetime]
    scheduled_for: Optional[datetime]
    view_count: int
    like_count: int
    comment_count: int
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]
    
    class Config:
        from_attributes = True


# 术语创建
class TermCreate(BaseModel):
    taxonomy_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=100)
    slug: Optional[str] = None
    description: Optional[str] = None
    parent_id: Optional[uuid.UUID] = None


# 术语响应
class TermResponse(BaseModel):
    id: uuid.UUID
    taxonomy_id: uuid.UUID
    name: str
    slug: str
    description: Optional[str]
    parent_id: Optional[uuid.UUID]
    term_order: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
