import { Link } from 'react-router-dom';
import { Github, Twitter, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">关于博客</h3>
            <p className="text-sm leading-relaxed">
              分享技术心得、生活感悟与成长经验，记录学习与思考的点点滴滴。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  首页
                </Link>
              </li>
              <li>
                <Link to="/posts" className="hover:text-white transition-colors">
                  文章列表
                </Link>
              </li>
              <li>
                <Link to="/page/about" className="hover:text-white transition-colors">
                  关于我
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">分类</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/posts?category=tech" className="hover:text-white transition-colors">
                  技术
                </Link>
              </li>
              <li>
                <Link to="/posts?category=life" className="hover:text-white transition-colors">
                  生活
                </Link>
              </li>
              <li>
                <Link to="/posts?category=thoughts" className="hover:text-white transition-colors">
                  思考
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">社交媒体</h3>
            <div className="flex gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="mailto:hello@example.com"
                className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p className="flex items-center justify-center gap-2">
            <span>&copy; {currentYear} 我的博客. All rights reserved.</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500" /> by MiniMax Agent
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
