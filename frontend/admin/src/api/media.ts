import api from './client';

export interface Media {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  mime_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  description?: string;
  usage_count: number;
  status: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
}

export const mediaApi = {
  // 上传媒体
  upload: async (file: File): Promise<Media> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const { data } = await api.post<Media>('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  // 获取媒体列表
  list: async (params?: {
    skip?: number;
    limit?: number;
    mime_type?: string;
    status?: string;
  }): Promise<Media[]> => {
    const { data } = await api.get<Media[]>('/media', { params });
    return data;
  },

  // 获取单个媒体
  get: async (id: string): Promise<Media> => {
    const { data } = await api.get<Media>(`/media/${id}`);
    return data;
  },

  // 更新媒体
  update: async (id: string, mediaData: {
    alt_text?: string;
    caption?: string;
    description?: string;
    status?: string;
  }): Promise<Media> => {
    const { data } = await api.put<Media>(`/media/${id}`, mediaData);
    return data;
  },

  // 删除媒体
  delete: async (id: string): Promise<void> => {
    await api.delete(`/media/${id}`);
  },
};
