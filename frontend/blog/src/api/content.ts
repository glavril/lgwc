import apiClient from './client';

// 内容类型
export interface Content {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  type: 'post' | 'page';
  status: 'draft' | 'published' | 'scheduled';
  author_id: string;
  author?: {
    id: string;
    username: string;
    display_name: string;
  };
  featured_image?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  categories?: Category[];
  tags?: Tag[];
  view_count?: number;
  comment_count?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  content: string;
  author_name: string;
  author_email: string;
  created_at: string;
  replies?: Comment[];
}

// 获取已发布的文章列表
export const getPublishedPosts = async (params?: {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  search?: string;
}) => {
  const response = await apiClient.get('/content', {
    params: {
      ...params,
      type: 'post',
      status: 'published',
    },
  });
  return response.data;
};

// 获取文章详情(通过slug)
export const getPostBySlug = async (slug: string) => {
  const response = await apiClient.get(`/content/slug/${slug}`);
  return response.data;
};

// 获取页面详情(通过slug)
export const getPageBySlug = async (slug: string) => {
  const response = await apiClient.get(`/content/slug/${slug}`);
  return response.data;
};

// 获取分类列表
export const getCategories = async () => {
  const response = await apiClient.get('/categories');
  return response.data;
};

// 获取标签列表
export const getTags = async () => {
  const response = await apiClient.get('/tags');
  return response.data;
};

// 获取文章评论
export const getComments = async (contentId: string) => {
  const response = await apiClient.get(`/content/${contentId}/comments`);
  return response.data;
};

// 提交评论
export const submitComment = async (contentId: string, data: {
  content: string;
  author_name: string;
  author_email: string;
  parent_id?: string;
}) => {
  const response = await apiClient.post(`/content/${contentId}/comments`, data);
  return response.data;
};

// 增加浏览量
export const incrementViewCount = async (contentId: string) => {
  const response = await apiClient.post(`/content/${contentId}/view`);
  return response.data;
};
