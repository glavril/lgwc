import api from './client';

export interface ModuleType {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  icon_class?: string;
  schema: Record<string, any>;
  template_path?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PageModule {
  id: string;
  content_id: string;
  module_type_id: string;
  parent_id?: string;
  module_order: number;
  css_classes: string[];
  custom_attributes: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ModuleData {
  id: string;
  page_module_id: string;
  data_key: string;
  data_value: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PageModuleFull extends PageModule {
  module_data: ModuleData[];
  module_type?: ModuleType;
}

export const moduleApi = {
  // 获取模块类型列表
  listTypes: async (params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
  }): Promise<ModuleType[]> => {
    const { data } = await api.get<ModuleType[]>('/modules/types', { params });
    return data;
  },

  // 获取指定内容的所有模块
  listByContent: async (contentId: string): Promise<PageModuleFull[]> => {
    const { data } = await api.get<PageModuleFull[]>(`/modules/content/${contentId}`);
    return data;
  },

  // 创建页面模块
  create: async (moduleData: {
    content_id: string;
    module_type_id: string;
    parent_id?: string;
    module_order?: number;
    css_classes?: string[];
    custom_attributes?: Record<string, any>;
  }): Promise<PageModule> => {
    const { data } = await api.post<PageModule>('/modules', moduleData);
    return data;
  },

  // 更新页面模块
  update: async (id: string, moduleData: {
    module_order?: number;
    css_classes?: string[];
    custom_attributes?: Record<string, any>;
    is_active?: boolean;
  }): Promise<PageModule> => {
    const { data } = await api.put<PageModule>(`/modules/${id}`, moduleData);
    return data;
  },

  // 删除页面模块
  delete: async (id: string): Promise<void> => {
    await api.delete(`/modules/${id}`);
  },

  // 创建或更新模块数据
  upsertData: async (moduleId: string, dataKey: string, dataValue: Record<string, any>): Promise<ModuleData> => {
    const { data } = await api.post<ModuleData>(`/modules/${moduleId}/data`, {
      data_key: dataKey,
      data_value: dataValue,
    });
    return data;
  },
};
