import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import apiClient from '../api/client';


interface User {
  id: string;
  username: string;
  email: string;
  display_name: string;
  role: string;
  status: string;
  created_at: string;
  last_login?: string;
  posts_count?: number;
}

const UserManagementPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    authors: 0,
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [pagination.current, pagination.pageSize]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/users', {
        params: {
          page: pagination.current,
          limit: pagination.pageSize,
        },
      });
      setUsers(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
      });
    } catch (err) {
      message.error('加载用户列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/users/stats');
      setStats(response.data);
    } catch (err) {
      console.error('获取统计数据失败:', err);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      display_name: user.display_name,
      role: user.role,
      status: user.status,
    });
    setModalVisible(true);
  };

  const handleDelete = async (userId: string) => {
    try {
      await apiClient.delete(`/users/${userId}`);
      message.success('用户已删除');
      fetchUsers();
      fetchStats();
    } catch (err) {
      message.error('删除失败');
      console.error(err);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        // 更新用户
        await apiClient.put(`/users/${editingUser.id}`, values);
        message.success('用户已更新');
      } else {
        // 创建用户
        await apiClient.post('/users', values);
        message.success('用户已创建');
      }
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
      fetchStats();
    } catch (err: any) {
      message.error(err.response?.data?.detail || '操作失败');
      console.error(err);
    }
  };

  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
      total: pagination.total,
    });
  };

  const columns = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      key: 'display_name',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const colorMap: Record<string, string> = {
          admin: 'red',
          editor: 'blue',
          author: 'green',
          contributor: 'cyan',
          subscriber: 'default',
        };
        const iconMap: Record<string, any> = {
          admin: <CrownOutlined />,
          editor: <EditOutlined />,
          author: <UserOutlined />,
        };
        return (
          <Tag color={colorMap[role]} icon={iconMap[role]}>
            {role === 'admin'
              ? '管理员'
              : role === 'editor'
              ? '编辑'
              : role === 'author'
              ? '作者'
              : role === 'contributor'
              ? '贡献者'
              : '订阅者'}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '活跃' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '文章数',
      dataIndex: 'posts_count',
      key: 'posts_count',
      render: (count: number) => count || 0,
    },
    {
      title: '注册时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('zh-CN'),
    },
    {
      title: '最后登录',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date: string) =>
        date ? new Date(date).toLocaleDateString('zh-CN') : '从未登录',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>用户管理</h1>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="总用户数"
              value={stats.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="管理员"
              value={stats.admins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="作者"
              value={stats.authors}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加用户
        </Button>
      </div>

      {/* 用户列表 */}
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* 添加/编辑用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="用户名"
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              {
                pattern: /^[a-zA-Z0-9_-]{3,20}$/,
                message: '用户名只能包含字母、数字、下划线和连字符，长度3-20',
              },
            ]}
          >
            <Input disabled={!!editingUser} placeholder="username" />
          </Form.Item>

          <Form.Item
            label="邮箱"
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="user@example.com" />
          </Form.Item>

          <Form.Item
            label="显示名称"
            name="display_name"
            rules={[{ required: true, message: '请输入显示名称' }]}
          >
            <Input placeholder="张三" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password placeholder="至少6位" />
            </Form.Item>
          )}

          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
            initialValue="subscriber"
          >
            <Select>
              <Select.Option value="admin">管理员</Select.Option>
              <Select.Option value="editor">编辑</Select.Option>
              <Select.Option value="author">作者</Select.Option>
              <Select.Option value="contributor">贡献者</Select.Option>
              <Select.Option value="subscriber">订阅者</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="状态"
            name="status"
            rules={[{ required: true, message: '请选择状态' }]}
            initialValue="active"
          >
            <Select>
              <Select.Option value="active">活跃</Select.Option>
              <Select.Option value="inactive">禁用</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button
                onClick={() => {
                  setModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
