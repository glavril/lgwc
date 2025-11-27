import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPageBySlug, Content } from '../api/content';
import { ArrowLeft } from 'lucide-react';

const PageDetailPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      fetchPage();
    }
  }, [slug]);

  const fetchPage = async () => {
    try {
      setLoading(true);
      const data = await getPageBySlug(slug!);
      setPage(data);
    } catch (err) {
      console.error('加载页面失败:', err);
    } finally {
      setLoading(false);
    }
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

  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">页面不存在</p>
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
            to="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </Link>
        </div>
      </div>

      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            {page.featured_image && (
              <div className="mb-8 -mx-8 -mt-8 rounded-t-lg overflow-hidden">
                <img
                  src={page.featured_image}
                  alt={page.title}
                  className="w-full h-96 object-cover"
                />
              </div>
            )}

            <h1 className="text-4xl font-bold text-gray-900 mb-8">{page.title}</h1>

            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {page.content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default PageDetailPage;
