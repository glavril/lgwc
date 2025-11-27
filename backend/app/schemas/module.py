from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from datetime import datetime
import uuid


# 模块类型创建
class ModuleTypeCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    display_name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    icon_class: Optional[str] = None
    schema: Dict[str, Any]
    template_path: Optional[str] = None
    is_active: bool = True
    sort_order: int = 0


# 模块类型响应
class ModuleTypeResponse(BaseModel):
    id: uuid.UUID
    name: str
    display_name: str
    description: Optional[str]
    icon_class: Optional[str]
    schema: Dict[str, Any]
    template_path: Optional[str]
    is_active: bool
    sort_order: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# 页面模块创建
class PageModuleCreate(BaseModel):
    content_id: uuid.UUID
    module_type_id: uuid.UUID
    parent_id: Optional[uuid.UUID] = None
    module_order: int = 0
    css_classes: Optional[List[str]] = []
    custom_attributes: Optional[Dict[str, Any]] = {}
    is_active: bool = True


# 页面模块更新
class PageModuleUpdate(BaseModel):
    module_order: Optional[int] = None
    css_classes: Optional[List[str]] = None
    custom_attributes: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


# 页面模块响应
class PageModuleResponse(BaseModel):
    id: uuid.UUID
    content_id: uuid.UUID
    module_type_id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    module_order: int
    css_classes: List[str]
    custom_attributes: Dict[str, Any]
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# 模块数据创建/更新
class ModuleDataUpsert(BaseModel):
    data_key: str = Field(..., min_length=1, max_length=100)
    data_value: Dict[str, Any]


# 模块数据响应
class ModuleDataResponse(BaseModel):
    id: uuid.UUID
    page_module_id: uuid.UUID
    data_key: str
    data_value: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# 完整的页面模块(包含数据)
class PageModuleFull(PageModuleResponse):
    module_data: List[ModuleDataResponse] = []
    module_type: Optional[ModuleTypeResponse] = None
