import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublishedPosts, Content } from '../api/content';
import { Calendar, User, MessageCircle, ArrowRight } from 'lucide-react';

const HomePage = () => {
  const [posts, setPosts] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPublishedPosts({ limit: 10 });
      setPosts(data.items || data);
    } catch (err) {
      setError('加载文章失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">欢迎来到我的博客</h1>
            <p className="text-xl opacity-90">
              分享技术、生活与思考
            </p>
          </div>
        </div>
      </div>

      {/* Featured Post */}
      {posts.length > 0 && (
        <div className="container mx-auto px-4 -mt-12">
          <div className="max-w-5xl mx-auto">
            <Link
              to={`/post/${posts[0].slug}`}
              className="block bg-white rounded-lg shadow-xl overflow-hidden hover:shadow-2xl transition-shadow duration-300"
            >
              {posts[0].featured_image && (
                <div className="h-96 overflow-hidden">
                  <img
                    src={posts[0].featured_image}
                    alt={posts[0].title}
                    className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-8">
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  {posts[0].categories && posts[0].categories.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full">
                      {posts[0].categories[0].name}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(posts[0].published_at || posts[0].created_at)}</span>
                  </div>
                </div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 hover:text-blue-600 transition-colors">
                  {posts[0].title}
                </h2>
                <p className="text-gray-600 text-lg mb-4 line-clamp-3">
                  {posts[0].excerpt || posts[0].content.substring(0, 200)}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {posts[0].author && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{posts[0].author.display_name}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{posts[0].comment_count || 0} 评论</span>
                    </div>
                  </div>
                  <span className="flex items-center gap-2 text-blue-600 font-medium">
                    阅读全文 <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* Recent Posts */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-gray-900">最新文章</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {posts.slice(1).map((post) => (
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
                  <p className="text-gray-600 mb-4 line-clamp-2">
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

          {posts.length > 1 && (
            <div className="mt-12 text-center">
              <Link
                to="/posts"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                查看更多文章 <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
