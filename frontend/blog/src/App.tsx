import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PostListPage from './pages/PostListPage';
import PostDetailPage from './pages/PostDetailPage';
import PageDetailPage from './pages/PageDetailPage';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/posts" element={<PostListPage />} />
          <Route path="/post/:slug" element={<PostDetailPage />} />
          <Route path="/page/:slug" element={<PageDetailPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
