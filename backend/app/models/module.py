import uuid
from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, Boolean, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from ..database import Base


class ModuleType(Base):
    """模块类型模型"""
    __tablename__ = "module_types"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text)
    icon_class = Column(String(100))
    schema = Column(JSONB, nullable=False)
    template_path = Column(Text)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class PageModule(Base):
    """页面模块模型"""
    __tablename__ = "page_modules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    module_type_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('page_modules.id'), index=True)
    module_order = Column(Integer, default=0)
    css_classes = Column(ARRAY(Text))
    custom_attributes = Column(JSONB)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class ModuleData(Base):
    """模块数据模型"""
    __tablename__ = "module_data"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    page_module_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    data_key = Column(String(100), nullable=False)
    data_value = Column(JSONB, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class Option(Base):
    """系统配置模型"""
    __tablename__ = "options"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    option_name = Column(String(100), unique=True, nullable=False)
    option_value = Column(JSONB, nullable=False)
    description = Column(Text)
    is_public = Column(Boolean, default=False)
    autoload = Column(Boolean, default=True, index=True)
    data_type = Column(String(20), default='mixed')
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class Menu(Base):
    """菜单模型"""
    __tablename__ = "menus"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    location = Column(String(50), index=True)
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class MenuItem(Base):
    """菜单项模型"""
    __tablename__ = "menu_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    menu_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey('menu_items.id'), index=True)
    title = Column(String(200), nullable=False)
    url = Column(Text)
    target = Column(String(20))
    css_classes = Column(ARRAY(Text))
    icon_class = Column(String(100))
    item_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
