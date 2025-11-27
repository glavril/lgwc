import uuid
from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, Boolean, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from ..database import Base


class Content(Base):
    """内容模型(统一的文章/页面模型)"""
    __tablename__ = "content"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(500), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    content_type = Column(String(50), nullable=False, index=True)
    status = Column(String(20), nullable=False, default='draft', index=True)
    content_format = Column(String(20), default='html')
    
    # 内容字段
    excerpt = Column(Text)
    content = Column(Text, nullable=False)
    content_json = Column(JSONB)
    featured_image_id = Column(UUID(as_uuid=True))
    
    # 关系字段
    author_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('content.id'), index=True)
    menu_order = Column(Integer, default=0)
    
    # SEO字段
    meta_title = Column(String(60))
    meta_description = Column(String(160))
    meta_keywords = Column(ARRAY(Text))
    
    # 发布信息
    published_at = Column(TIMESTAMP(timezone=True), index=True)
    scheduled_for = Column(TIMESTAMP(timezone=True))
    
    # 统计信息
    view_count = Column(Integer, default=0)
    like_count = Column(Integer, default=0)
    comment_count = Column(Integer, default=0)
    
    # 时间戳
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # 扩展数据
    metadata = Column(JSONB, default={})


class Taxonomy(Base):
    """分类法模型"""
    __tablename__ = "taxonomies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text)
    is_hierarchical = Column(Boolean, default=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class Term(Base):
    """术语模型(分类/标签)"""
    __tablename__ = "terms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    taxonomy_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), nullable=False, index=True)
    description = Column(Text)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('terms.id'), index=True)
    term_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class ContentTerm(Base):
    """内容与术语关联模型"""
    __tablename__ = "content_terms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    term_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    term_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
