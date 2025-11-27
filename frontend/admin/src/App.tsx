import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ContentListPage from './pages/ContentListPage';
import ContentEditorPage from './pages/ContentEditorPage';
import PageBuilderPage from './pages/PageBuilderPage';
import UserManagementPage from './pages/UserManagementPage';
import CommentManagementPage from './pages/CommentManagementPage';
import MediaLibraryPage from './pages/MediaLibraryPage';
import SettingsPage from './pages/SettingsPage';
import { useAuthStore } from './store/auth';
import MainLayout from './components/MainLayout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route path="/" element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="content" element={<ContentListPage />} />
            <Route path="content/new" element={<ContentEditorPage />} />
            <Route path="content/edit/:id" element={<ContentEditorPage />} />
            <Route path="builder/:contentId" element={<PageBuilderPage />} />
            <Route path="media" element={<MediaLibraryPage />} />
            <Route path="comments" element={<CommentManagementPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
