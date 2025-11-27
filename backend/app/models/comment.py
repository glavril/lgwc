import uuid
from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.sql import func
from ..database import Base


class Comment(Base):
    """评论模型"""
    __tablename__ = "comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), index=True)
    
    # 评论者信息
    author_name = Column(String(100), nullable=False)
    author_email = Column(String(255), nullable=False)
    author_url = Column(Text)
    author_ip = Column(INET, nullable=False)
    user_agent = Column(Text)
    
    # 评论内容
    content = Column(Text, nullable=False)
    content_format = Column(String(20), default='html')
    
    # 状态管理
    status = Column(String(20), default='pending', index=True)
    is_pinned = Column(Boolean, default=False)
    
    # 审核信息
    approved_by = Column(UUID(as_uuid=True))
    approved_at = Column(TIMESTAMP(timezone=True))
    
    # 统计信息
    like_count = Column(Integer, default=0)
    reply_count = Column(Integer, default=0)
    
    # 时间戳
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 扩展数据
    metadata = Column(JSONB, default={})


class CommentMetadata(Base):
    """评论元数据模型"""
    __tablename__ = "comment_metadata"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    comment_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    meta_key = Column(String(100), nullable=False)
    meta_value = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
