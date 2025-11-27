from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime
import uuid


# 用户注册
class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    display_name: str = Field(..., min_length=1, max_length=100)
    first_name: Optional[str] = None
    last_name: Optional[str] = None


# 用户登录
class UserLogin(BaseModel):
    username: str
    password: str


# 用户响应
class UserResponse(BaseModel):
    id: uuid.UUID
    username: str
    email: EmailStr
    display_name: str
    first_name: Optional[str]
    last_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    website_url: Optional[str]
    is_active: bool
    is_verified: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any] = {}
    
    class Config:
        from_attributes = True


# 用户更新
class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    website_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# Token响应
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenData(BaseModel):
    user_id: Optional[str] = None
