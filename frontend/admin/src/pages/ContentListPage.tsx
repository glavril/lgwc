import { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { contentApi, Content } from '../api/content';
import type { ColumnsType } from 'antd/es/table';

export default function ContentListPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchContents = async () => {
    setLoading(true);
    try {
      const data = await contentApi.list({ limit: 50 });
      setContents(data);
    } catch (error: any) {
      message.error('获取内容列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await contentApi.delete(id);
      message.success('删除成功');
      fetchContents();
    } catch (error: any) {
      message.error('删除失败');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      published: 'green',
      draft: 'orange',
      scheduled: 'blue',
      private: 'purple',
    };
    return colors[status] || 'default';
  };

  const columns: ColumnsType<Content> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <a onClick={() => navigate(`/content/edit/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'content_type',
      key: 'content_type',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: '浏览',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 80,
    },
    {
      title: '评论',
      dataIndex: 'comment_count',
      key: 'comment_count',
      width: 80,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => window.open(`/preview/${record.id}`, '_blank')}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/content/edit/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">内容管理</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/content/new')}
        >
          新建内容
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contents}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
