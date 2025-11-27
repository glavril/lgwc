import api from './client';

export interface Content {
  id: string;
  title: string;
  slug: string;
  content_type: string;
  status: string;
  content_format: string;
  excerpt?: string;
  content: string;
  content_json?: any;
  featured_image_id?: string;
  author_id: string;
  parent_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  published_at?: string;
  scheduled_for?: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export interface ContentCreateData {
  title: string;
  slug?: string;
  content_type?: string;
  status?: string;
  content_format?: string;
  excerpt?: string;
  content: string;
  content_json?: any;
  featured_image_id?: string;
  parent_id?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string[];
  scheduled_for?: string;
  metadata?: Record<string, any>;
}

export const contentApi = {
  // 获取内容列表
  list: async (params?: {
    skip?: number;
    limit?: number;
    content_type?: string;
    status?: string;
    author_id?: string;
  }): Promise<Content[]> => {
    const { data } = await api.get<Content[]>('/content', { params });
    return data;
  },

  // 获取单个内容
  get: async (id: string): Promise<Content> => {
    const { data } = await api.get<Content>(`/content/${id}`);
    return data;
  },

  // 通过slug获取内容
  getBySlug: async (slug: string): Promise<Content> => {
    const { data } = await api.get<Content>(`/content/slug/${slug}`);
    return data;
  },

  // 创建内容
  create: async (contentData: ContentCreateData): Promise<Content> => {
    const { data } = await api.post<Content>('/content', contentData);
    return data;
  },

  // 更新内容
  update: async (id: string, contentData: Partial<ContentCreateData>): Promise<Content> => {
    const { data } = await api.put<Content>(`/content/${id}`, contentData);
    return data;
  },

  // 删除内容
  delete: async (id: string): Promise<void> => {
    await api.delete(`/content/${id}`);
  },
};
