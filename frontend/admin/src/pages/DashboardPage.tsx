import { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Space,
  List,
  message,
} from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  CommentOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { Line, Column } from '@ant-design/plots';
import apiClient from '../api/client';

interface DashboardData {
  summary: {
    total_users: number;
    total_posts: number;
    total_comments: number;
    total_views: number;
  };
  view_trend: Array<{
    date: string;
    views: number;
  }>;
  publish_trend: Array<{
    date: string;
    count: number;
  }>;
  recent_posts: Array<{
    id: string;
    title: string;
    status: string;
    view_count: number;
    created_at: string;
  }>;
  recent_comments: Array<{
    id: string;
    author: string;
    content: string;
    status: string;
    created_at: string;
  }>;
}

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/stats/dashboard');
      setDashboardData(response.data);
    } catch (err: any) {
      console.error('获取仪表盘数据失败:', err);
      message.error(err.response?.data?.detail || '获取仪表盘数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 浏览量趋势图配置
  const viewsConfig = {
    data: dashboardData?.view_trend || [],
    xField: 'date',
    yField: 'views',
    smooth: true,
    color: '#1890ff',
    point: {
      size: 3,
      shape: 'circle',
    },
    tooltip: {
      showMarkers: true,
    },
    xAxis: {
      label: {
        formatter: (v: string) => {
          // 格式化日期显示
          const date = new Date(v);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        },
      },
    },
  };

  // 文章发布趋势图配置
  const postsConfig = {
    data: dashboardData?.publish_trend || [],
    xField: 'date',
    yField: 'count',
    color: '#52c41a',
    columnWidthRatio: 0.6,
    xAxis: {
      label: {
        formatter: (v: string) => {
          const date = new Date(v);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        },
      },
    },
  };

  // 文章列表列配置
  const postColumns = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          published: 'green',
          draft: 'orange',
          scheduled: 'blue',
        };
        const textMap: Record<string, string> = {
          published: '已发布',
          draft: '草稿',
          scheduled: '定时',
        };
        return <Tag color={colorMap[status]}>{textMap[status] || status}</Tag>;
      },
    },
    {
      title: '浏览量',
      dataIndex: 'view_count',
      key: 'view_count',
      width: 100,
      align: 'right' as const,
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (date: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleString('zh-CN');
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: '24px' }}>仪表盘</h1>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="用户总数"
              value={dashboardData?.summary.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="文章总数"
              value={dashboardData?.summary.total_posts || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="评论总数"
              value={dashboardData?.summary.total_comments || 0}
              prefix={<CommentOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title="总浏览量"
              value={dashboardData?.summary.total_views || 0}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表 */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="浏览量趋势（最近7天）" loading={loading}>
            <Line {...viewsConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="文章发布趋势（最近7天）" loading={loading}>
            <Column {...postsConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 最近文章和评论 */}
      <Row gutter={16}>
        <Col xs={24} lg={12}>
          <Card title="最近文章" loading={loading}>
            <Table
              dataSource={dashboardData?.recent_posts || []}
              columns={postColumns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="最近评论" loading={loading}>
            <List
              dataSource={dashboardData?.recent_comments || []}
              renderItem={(comment) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <span>{comment.author}</span>
                        <Tag
                          color={
                            comment.status === 'approved'
                              ? 'green'
                              : comment.status === 'pending'
                              ? 'orange'
                              : 'red'
                          }
                        >
                          {comment.status === 'approved'
                            ? '已批准'
                            : comment.status === 'pending'
                            ? '待审核'
                            : comment.status === 'rejected'
                            ? '已拒绝'
                            : comment.status}
                        </Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <div>{comment.content}</div>
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                          {comment.created_at
                            ? new Date(comment.created_at).toLocaleString('zh-CN')
                            : ''}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
