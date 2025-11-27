import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getPostBySlug,
  getComments,
  submitComment,
  incrementViewCount,
  Content,
  Comment,
} from '../api/content';
import { Calendar, User, MessageCircle, Tag, ArrowLeft } from 'lucide-react';

const PostDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Content | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({
    content: '',
    author_name: '',
    author_email: '',
  });

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const data = await getPostBySlug(slug!);
      setPost(data);
      
      // 增加浏览量
      await incrementViewCount(data.id);
      
      // 获取评论
      const commentsData = await getComments(data.id);
      setComments(commentsData);
    } catch (err) {
      console.error('加载文章失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    try {
      setCommentLoading(true);
      await submitComment(post.id, commentForm);
      setCommentForm({ content: '', author_name: '', author_email: '' });
      
      // 重新加载评论
      const commentsData = await getComments(post.id);
      setComments(commentsData);
    } catch (err) {
      console.error('提交评论失败:', err);
      alert('提交评论失败，请稍后重试');
    } finally {
      setCommentLoading(false);
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">文章不存在</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:underline">
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <Link
            to="/posts"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回文章列表
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-8">
            {post.featured_image && (
              <div className="mb-8 -mx-8 -mt-8 rounded-t-lg overflow-hidden">
                <img
                  src={post.featured_image}
                  alt={post.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            <div className="mb-6">
              {post.categories && post.categories.length > 0 && (
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm mb-4">
                  {post.categories[0].name}
                </span>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {post.author && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author.display_name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>{post.comment_count || 0} 评论</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-6 pb-6 border-b">
                <Tag className="w-4 h-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      to={`/posts?tag=${tag.slug}`}
                      className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                    >
                      {tag.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Comments Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              评论 ({comments.length})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleSubmitComment} className="mb-8 pb-8 border-b">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  评论内容
                </label>
                <textarea
                  value={commentForm.content}
                  onChange={(e) =>
                    setCommentForm({ ...commentForm, content: e.target.value })
                  }
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="写下你的评论..."
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    昵称
                  </label>
                  <input
                    type="text"
                    value={commentForm.author_name}
                    onChange={(e) =>
                      setCommentForm({ ...commentForm, author_name: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="你的昵称"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={commentForm.author_email}
                    onChange={(e) =>
                      setCommentForm({ ...commentForm, author_email: e.target.value })
                    }
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={commentLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commentLoading ? '提交中...' : '提交评论'}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">暂无评论，快来抢沙发吧！</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="font-medium text-gray-900">
                            {comment.author_name}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {comment.content}
                        </p>
                        
                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 ml-8 space-y-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <User className="w-4 h-4 text-gray-600" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="font-medium text-gray-900 text-sm">
                                      {reply.author_name}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                    {reply.content}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PostDetailPage;
