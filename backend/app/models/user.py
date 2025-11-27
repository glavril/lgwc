import uuid
from sqlalchemy import Boolean, Column, String, Text, Integer, TIMESTAMP, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from ..database import Base


class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(100), nullable=False)
    first_name = Column(String(50))
    last_name = Column(String(50))
    bio = Column(Text)
    avatar_url = Column(Text)
    website_url = Column(Text)
    password_hash = Column(String(255), nullable=False)
    salt = Column(String(32))
    is_active = Column(Boolean, default=True, index=True)
    is_verified = Column(Boolean, default=False)
    email_verification_token = Column(String(255))
    password_reset_token = Column(String(255))
    password_reset_expires = Column(TIMESTAMP(timezone=True))
    last_login_at = Column(TIMESTAMP(timezone=True))
    login_attempts = Column(Integer, default=0)
    locked_until = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    metadata = Column(JSONB, default={})


class Role(Base):
    """角色模型"""
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text)
    is_system = Column(Boolean, default=False)
    level = Column(Integer, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())


class Permission(Base):
    """权限模型"""
    __tablename__ = "permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    display_name = Column(String(100), nullable=False)
    description = Column(Text)
    resource = Column(String(50), nullable=False)
    action = Column(String(50), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())


class UserRole(Base):
    """用户角色关联模型"""
    __tablename__ = "user_roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    role_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    assigned_by = Column(UUID(as_uuid=True))
    assigned_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    expires_at = Column(TIMESTAMP(timezone=True))


class RolePermission(Base):
    """角色权限关联模型"""
    __tablename__ = "role_permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    role_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    permission_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    granted_by = Column(UUID(as_uuid=True))
    granted_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
