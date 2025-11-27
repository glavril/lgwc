import uuid
from sqlalchemy import Column, String, Text, Integer, BigInteger, TIMESTAMP, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from ..database import Base


class Media(Base):
    """媒体文件模型"""
    __tablename__ = "media"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_url = Column(Text, nullable=False)
    mime_type = Column(String(100), nullable=False, index=True)
    file_size = Column(BigInteger, nullable=False)
    width = Column(Integer)
    height = Column(Integer)
    duration = Column(Integer)
    
    # 媒体元数据
    alt_text = Column(Text)
    caption = Column(Text)
    description = Column(Text)
    
    # 引用统计
    usage_count = Column(Integer, default=0)
    
    # 状态
    status = Column(String(20), default='active', index=True)
    
    # 时间戳
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 扩展数据
    meta_data = Column("metadata", JSONB, default={})


class MediaMetadata(Base):
    """媒体元数据模型"""
    __tablename__ = "media_metadata"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    media_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    meta_key = Column(String(100), nullable=False)
    meta_value = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
