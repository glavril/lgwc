import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
  PictureOutlined,
  CommentOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  BlockOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import type { MenuProps } from 'antd';

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/content',
      icon: <FileTextOutlined />,
      label: '内容管理',
    },
    {
      key: '/media',
      icon: <PictureOutlined />,
      label: '媒体库',
    },
    {
      key: '/comments',
      icon: <CommentOutlined />,
      label: '评论管理',
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: '用户管理',
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        clearAuth();
        navigate('/login');
      },
    },
  ];

  // 获取当前选中的菜单项
  const getSelectedKeys = () => {
    const path = location.pathname;
    // 对于详情页和编辑页，高亮其父菜单
    if (path.startsWith('/content')) return ['/content'];
    if (path.startsWith('/builder')) return ['/content'];
    // 其他直接返回路径
    return [path];
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div className="h-16 flex items-center justify-center text-white font-bold text-xl">
          {collapsed ? 'CMS' : 'CMS管理后台'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKeys()}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="m-0">WordPress风格博客系统</h2>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="cursor-pointer flex items-center">
              <Avatar icon={<UserOutlined />} src={user?.avatar_url} />
              <span className="ml-2">{user?.display_name || user?.username || '管理员'}</span>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: '16px', background: '#fff', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
