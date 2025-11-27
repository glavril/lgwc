import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPublishedPosts, getCategories, getTags, Content, Category, Tag } from '../api/content';
import { Calendar, User, MessageCircle, Search, Filter } from 'lucide-react';

const PostListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory, selectedTag, searchQuery]);

  const fetchInitialData = async () => {
    try {
      const [categoriesData, tagsData] = await Promise.all([
        getCategories(),
        getTags(),
      ]);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (err) {
      console.error('加载分类和标签失败:', err);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPublishedPosts({
        page,
        limit: 12,
        category: selectedCategory || undefined,
        tag: selectedTag || undefined,
        search: searchQuery || undefined,
      });
      setPosts(data.items || data);
      setTotalPages(data.total_pages || 1);
    } catch (err) {
      console.error('加载文章失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    updateSearchParams();
  };

  const handleCategoryChange = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setPage(1);
    updateSearchParams();
  };

  const handleTagChange = (tagSlug: string) => {
    setSelectedTag(tagSlug);
    setPage(1);
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedTag) params.tag = selectedTag;
    if (page > 1) params.page = page.toString();
    setSearchParams(params);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">所有文章</h1>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索文章..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-bold text-gray-900">筛选</h2>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">分类</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => handleCategoryChange('')}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      !selectedCategory
                        ? 'bg-blue-100 text-blue-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    全部分类
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.slug
                          ? 'bg-blue-100 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">标签</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleTagChange('')}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      !selectedTag
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }`}
                  >
                    全部
                  </button>
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagChange(tag.slug)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTag === tag.slug
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 text-lg">没有找到文章</p>
              </div>
            ) : (
              <>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/post/${post.slug}`}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                    >
                      {post.featured_image && (
                        <div className="h-48 overflow-hidden">
                          <img
                            src={post.featured_image}
                            alt={post.title}
                            className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-3 text-sm text-gray-600">
                          {post.categories && post.categories.length > 0 && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 rounded-full text-xs">
                              {post.categories[0].name}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(post.published_at || post.created_at)}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600 transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {post.excerpt || post.content.substring(0, 150)}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          {post.author && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{post.author.display_name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comment_count || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      上一页
                    </button>
                    <div className="flex gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`px-4 py-2 rounded-lg ${
                            page === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      下一页
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default PostListPage;
