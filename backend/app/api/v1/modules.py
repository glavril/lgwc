from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ...database import get_db
from ...models.module import ModuleType, PageModule, ModuleData
from ...models.user import User
from ...schemas.module import (
    ModuleTypeCreate,
    ModuleTypeResponse,
    PageModuleCreate,
    PageModuleUpdate,
    PageModuleResponse,
    ModuleDataUpsert,
    ModuleDataResponse,
    PageModuleFull
)
from ...core.security import get_current_active_user
import uuid

router = APIRouter()


# 模块类型相关API
@router.post("/types", response_model=ModuleTypeResponse, status_code=status.HTTP_201_CREATED)
async def create_module_type(
    module_type_data: ModuleTypeCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建模块类型(需要管理员权限)"""
    # 检查名称是否已存在
    if db.query(ModuleType).filter(ModuleType.name == module_type_data.name).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="模块类型名称已存在"
        )
    
    module_type = ModuleType(**module_type_data.dict())
    db.add(module_type)
    db.commit()
    db.refresh(module_type)
    
    return module_type


@router.get("/types", response_model=List[ModuleTypeResponse])
async def list_module_types(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """获取模块类型列表"""
    query = db.query(ModuleType)
    
    if is_active is not None:
        query = query.filter(ModuleType.is_active == is_active)
    
    query = query.order_by(ModuleType.sort_order, ModuleType.name)
    module_types = query.offset(skip).limit(limit).all()
    
    return module_types


@router.get("/types/{type_id}", response_model=ModuleTypeResponse)
async def get_module_type(
    type_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """获取指定模块类型"""
    module_type = db.query(ModuleType).filter(ModuleType.id == type_id).first()
    if not module_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="模块类型不存在"
        )
    return module_type


# 页面模块相关API
@router.post("", response_model=PageModuleResponse, status_code=status.HTTP_201_CREATED)
async def create_page_module(
    module_data: PageModuleCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建页面模块"""
    page_module = PageModule(**module_data.dict())
    db.add(page_module)
    db.commit()
    db.refresh(page_module)
    
    return page_module


@router.get("/content/{content_id}", response_model=List[PageModuleFull])
async def list_page_modules_by_content(
    content_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """获取指定内容的所有页面模块"""
    modules = db.query(PageModule).filter(
        PageModule.content_id == content_id,
        PageModule.is_active == True
    ).order_by(PageModule.module_order).all()
    
    # 加载模块数据
    result = []
    for module in modules:
        module_data = db.query(ModuleData).filter(
            ModuleData.page_module_id == module.id
        ).all()
        
        module_type = db.query(ModuleType).filter(
            ModuleType.id == module.module_type_id
        ).first()
        
        result.append({
            **module.__dict__,
            "module_data": module_data,
            "module_type": module_type
        })
    
    return result


@router.get("/{module_id}", response_model=PageModuleFull)
async def get_page_module(
    module_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """获取指定页面模块"""
    module = db.query(PageModule).filter(PageModule.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面模块不存在"
        )
    
    # 加载模块数据
    module_data = db.query(ModuleData).filter(
        ModuleData.page_module_id == module.id
    ).all()
    
    module_type = db.query(ModuleType).filter(
        ModuleType.id == module.module_type_id
    ).first()
    
    return {
        **module.__dict__,
        "module_data": module_data,
        "module_type": module_type
    }


@router.put("/{module_id}", response_model=PageModuleResponse)
async def update_page_module(
    module_id: uuid.UUID,
    module_update: PageModuleUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """更新页面模块"""
    module = db.query(PageModule).filter(PageModule.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面模块不存在"
        )
    
    update_data = module_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(module, field, value)
    
    db.commit()
    db.refresh(module)
    
    return module


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_page_module(
    module_id: uuid.UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """删除页面模块"""
    module = db.query(PageModule).filter(PageModule.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面模块不存在"
        )
    
    db.delete(module)
    db.commit()
    
    return None


# 模块数据相关API
@router.post("/{module_id}/data", response_model=ModuleDataResponse, status_code=status.HTTP_201_CREATED)
async def upsert_module_data(
    module_id: uuid.UUID,
    data: ModuleDataUpsert,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """创建或更新模块数据"""
    # 检查模块是否存在
    module = db.query(PageModule).filter(PageModule.id == module_id).first()
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="页面模块不存在"
        )
    
    # 查找已存在的数据
    existing_data = db.query(ModuleData).filter(
        ModuleData.page_module_id == module_id,
        ModuleData.data_key == data.data_key
    ).first()
    
    if existing_data:
        # 更新现有数据
        existing_data.data_value = data.data_value
        db.commit()
        db.refresh(existing_data)
        return existing_data
    else:
        # 创建新数据
        new_data = ModuleData(
            page_module_id=module_id,
            data_key=data.data_key,
            data_value=data.data_value
        )
        db.add(new_data)
        db.commit()
        db.refresh(new_data)
        return new_data
