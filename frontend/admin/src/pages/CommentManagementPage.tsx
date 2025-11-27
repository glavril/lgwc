import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Modal,
  message,
  Popconfirm,
  Input,
  Select,
  Card,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EyeOutlined,
  MessageOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import apiClient from '../api/client';

const { Search } = Input;

interface Comment {
  id: string;
  content_id: string;
  content_title: string;
  author_name: string;
  author_email: string;
  content: string;
  status: 'approved' | 'pending' | 'spam' | 'trash';
  created_at: string;
  parent_id?: string;
}

const CommentManagementPage = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    spam: 0,
  });
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [pagination.current, pagination.pageSize, selectedStatus, searchText]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }
      if (searchText) {
        params.search = searchText;
      }

      const response = await apiClient.get('/comments', { params });
      setComments(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
      });
    } catch (err) {
      message.error('加载评论列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/comments/stats');
      setStats(response.data);
    } catch (err) {
      console.error('获取统计数据失败:', err);
    }
  };

  const handleApprove = async (commentId: string) => {
    try {
      await apiClient.put(`/comments/${commentId}/status`, { status: 'approved' });
      message.success('评论已批准');
      fetchComments();
      fetchStats();
    } catch (err) {
      message.error('操作失败');
      console.error(err);
    }
  };

  const handleReject = async (commentId: string) => {
    try {
      await apiClient.put(`/comments/${commentId}/status`, { status: 'spam' });
      message.success('评论已标记为垃圾');
      fetchComments();
      fetchStats();
    } catch (err) {
      message.error('操作失败');
      console.error(err);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      await apiClient.delete(`/comments/${commentId}`);
      message.success('评论已删除');
      fetchComments();
      fetchStats();
    } catch (err) {
      message.error('删除失败');
      console.error(err);
    }
  };

  const handleView = (comment: Comment) => {
    setSelectedComment(comment);
    setViewModalVisible(true);
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
      title: '作者',
      dataIndex: 'author_name',
      key: 'author_name',
      width: 150,
    },
    {
      title: '评论内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (content: string) => (
        <div style={{ maxWidth: 400 }}>
          {content.length > 100 ? content.substring(0, 100) + '...' : content}
        </div>
      ),
    },
    {
      title: '文章',
      dataIndex: 'content_title',
      key: 'content_title',
      width: 200,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig: Record<
          string,
          { color: string; text: string; icon: any }
        > = {
          approved: { color: 'green', text: '已批准', icon: <CheckOutlined /> },
          pending: { color: 'orange', text: '待审核', icon: <ClockCircleOutlined /> },
          spam: { color: 'red', text: '垃圾', icon: <ExclamationCircleOutlined /> },
          trash: { color: 'default', text: '回收站', icon: <DeleteOutlined /> },
        };
        const config = statusConfig[status] || statusConfig.pending;
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: '提交时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 160,
      render: (date: string) => new Date(date).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 260,
      render: (_: any, record: Comment) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleApprove(record.id)}
              >
                批准
              </Button>
              <Button
                type="link"
                size="small"
                danger
                icon={<CloseOutlined />}
                onClick={() => handleReject(record.id)}
              >
                拒绝
              </Button>
            </>
          )}
          {record.status === 'spam' && (
            <Button
              type="link"
              size="small"
              icon={<CheckOutlined />}
              onClick={() => handleApprove(record.id)}
            >
              恢复
            </Button>
          )}
          <Popconfirm
            title="确定要删除这条评论吗？"
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
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>评论管理</h1>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总评论数"
              value={stats.total}
              prefix={<MessageOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已批准"
              value={stats.approved}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="待审核"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="垃圾评论"
              value={stats.spam}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 筛选栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Select
          value={selectedStatus}
          onChange={setSelectedStatus}
          style={{ width: 150 }}
        >
          <Select.Option value="all">全部状态</Select.Option>
          <Select.Option value="approved">已批准</Select.Option>
          <Select.Option value="pending">待审核</Select.Option>
          <Select.Option value="spam">垃圾</Select.Option>
        </Select>
        <Search
          placeholder="搜索评论内容或作者"
          onSearch={setSearchText}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      {/* 评论列表 */}
      <Table
        columns={columns}
        dataSource={comments}
        rowKey="id"
        loading={loading}
        pagination={pagination}
        onChange={handleTableChange}
      />

      {/* 查看评论详情模态框 */}
      <Modal
        title="评论详情"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={
          selectedComment && (
            <Space>
              {selectedComment.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => {
                      handleApprove(selectedComment.id);
                      setViewModalVisible(false);
                    }}
                  >
                    批准
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => {
                      handleReject(selectedComment.id);
                      setViewModalVisible(false);
                    }}
                  >
                    标记为垃圾
                  </Button>
                </>
              )}
              <Popconfirm
                title="确定要删除这条评论吗？"
                onConfirm={() => {
                  handleDelete(selectedComment.id);
                  setViewModalVisible(false);
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button danger icon={<DeleteOutlined />}>
                  删除
                </Button>
              </Popconfirm>
              <Button onClick={() => setViewModalVisible(false)}>关闭</Button>
            </Space>
          )
        }
        width={700}
      >
        {selectedComment && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <strong>作者：</strong> {selectedComment.author_name}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>邮箱：</strong> {selectedComment.author_email}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>文章：</strong> {selectedComment.content_title}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>状态：</strong>{' '}
              <Tag
                color={
                  selectedComment.status === 'approved'
                    ? 'green'
                    : selectedComment.status === 'pending'
                    ? 'orange'
                    : 'red'
                }
              >
                {selectedComment.status === 'approved'
                  ? '已批准'
                  : selectedComment.status === 'pending'
                  ? '待审核'
                  : '垃圾'}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>提交时间：</strong>{' '}
              {new Date(selectedComment.created_at).toLocaleString('zh-CN')}
            </div>
            <div>
              <strong>评论内容：</strong>
              <div
                style={{
                  marginTop: 8,
                  padding: 16,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {selectedComment.content}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CommentManagementPage;
