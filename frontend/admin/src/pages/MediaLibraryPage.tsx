import { useState, useEffect } from 'react';
import {
  Card,
  Upload,
  Button,
  Modal,
  Image,
  message,
  List,
  Space,
  Input,
  Select,
  Popconfirm,
  Tag,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  CopyOutlined,
  FileImageOutlined,
  FileOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import apiClient from '../api/client';

const { Search } = Input;

interface Media {
  id: string;
  filename: string;
  file_path: string;
  file_type: string;
  file_size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  created_at: string;
  url: string;
}

const MediaLibraryPage = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    images: 0,
    videos: 0,
    documents: 0,
    total_size: 0,
  });

  useEffect(() => {
    fetchMedia();
    fetchStats();
  }, [pagination.current, filterType, searchText]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };
      if (filterType !== 'all') {
        params.type = filterType;
      }
      if (searchText) {
        params.search = searchText;
      }

      const response = await apiClient.get('/media', { params });
      setMedia(response.data.items || []);
      setPagination({
        ...pagination,
        total: response.data.total || 0,
      });
    } catch (err) {
      message.error('加载媒体库失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/media/stats');
      setStats(response.data);
    } catch (err) {
      console.error('获取统计数据失败:', err);
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请选择文件');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      if (file.originFileObj) {
        formData.append('files', file.originFileObj);
      }
    });

    try {
      await apiClient.post('/media/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      message.success('文件上传成功');
      setUploadModalVisible(false);
      setFileList([]);
      fetchMedia();
      fetchStats();
    } catch (err) {
      message.error('上传失败');
      console.error(err);
    }
  };

  const handleDelete = async (mediaId: string) => {
    try {
      await apiClient.delete(`/media/${mediaId}`);
      message.success('文件已删除');
      fetchMedia();
      fetchStats();
    } catch (err) {
      message.error('删除失败');
      console.error(err);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    message.success('URL已复制到剪贴板');
  };

  const handleViewDetail = (item: Media) => {
    setSelectedMedia(item);
    setDetailModalVisible(true);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) {
      return <FileImageOutlined style={{ fontSize: 48, color: '#1890ff' }} />;
    } else if (fileType.startsWith('video/')) {
      return <VideoCameraOutlined style={{ fontSize: 48, color: '#52c41a' }} />;
    } else {
      return <FileOutlined style={{ fontSize: 48, color: '#faad14' }} />;
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>媒体库</h1>

      {/* 统计卡片 */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总文件数"
              value={stats.total}
              prefix={<FileOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="图片"
              value={stats.images}
              prefix={<FileImageOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="视频"
              value={stats.videos}
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总大小"
              value={formatFileSize(stats.total_size)}
              valueStyle={{ color: '#722ed1', fontSize: 20 }}
            />
          </Card>
        </Col>
      </Row>

      {/* 操作栏 */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setUploadModalVisible(true)}
        >
          上传文件
        </Button>
        <Select
          value={filterType}
          onChange={setFilterType}
          style={{ width: 150 }}
        >
          <Select.Option value="all">全部类型</Select.Option>
          <Select.Option value="image">图片</Select.Option>
          <Select.Option value="video">视频</Select.Option>
          <Select.Option value="document">文档</Select.Option>
        </Select>
        <Search
          placeholder="搜索文件名"
          onSearch={setSearchText}
          style={{ width: 300 }}
          allowClear
        />
      </div>

      {/* 媒体网格 */}
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: 4,
          xxl: 6,
        }}
        loading={loading}
        dataSource={media}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          onChange: (page) => setPagination({ ...pagination, current: page }),
        }}
        renderItem={(item) => (
          <List.Item>
            <Card
              hoverable
              cover={
                item.file_type.startsWith('image/') ? (
                  <div
                    style={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      background: '#f0f0f0',
                    }}
                  >
                    <Image
                      src={item.url}
                      alt={item.alt_text || item.filename}
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                      preview={false}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      height: 200,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: '#f0f0f0',
                    }}
                  >
                    {getFileIcon(item.file_type)}
                  </div>
                )
              }
              actions={[
                <Button
                  type="link"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewDetail(item)}
                >
                  详情
                </Button>,
                <Button
                  type="link"
                  icon={<CopyOutlined />}
                  onClick={() => handleCopyUrl(item.url)}
                >
                  复制
                </Button>,
                <Popconfirm
                  title="确定要删除这个文件吗？"
                  onConfirm={() => handleDelete(item.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" danger icon={<DeleteOutlined />}>
                    删除
                  </Button>
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.filename}
                  </div>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Tag>{item.file_type.split('/')[0]}</Tag>
                    <span>{formatFileSize(item.file_size)}</span>
                    {item.width && item.height && (
                      <span>
                        {item.width} × {item.height}
                      </span>
                    )}
                  </Space>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      {/* 上传模态框 */}
      <Modal
        title="上传文件"
        open={uploadModalVisible}
        onOk={handleUpload}
        onCancel={() => {
          setUploadModalVisible(false);
          setFileList([]);
        }}
        okText="上传"
        cancelText="取消"
      >
        <Upload
          fileList={fileList}
          onChange={({ fileList }) => setFileList(fileList)}
          beforeUpload={() => false}
          multiple
        >
          <Button icon={<UploadOutlined />}>选择文件</Button>
        </Upload>
        <div style={{ marginTop: 16, color: '#999' }}>
          <p>支持的文件类型：JPG, PNG, GIF, WebP, MP4, PDF, DOCX</p>
          <p>单个文件最大大小：10 MB</p>
        </div>
      </Modal>

      {/* 详情模态框 */}
      <Modal
        title="文件详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={
          <Space>
            <Button onClick={() => handleCopyUrl(selectedMedia?.url || '')}>
              <CopyOutlined /> 复制 URL
            </Button>
            <Popconfirm
              title="确定要删除这个文件吗？"
              onConfirm={() => {
                if (selectedMedia) {
                  handleDelete(selectedMedia.id);
                  setDetailModalVisible(false);
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button danger>
                <DeleteOutlined /> 删除
              </Button>
            </Popconfirm>
            <Button onClick={() => setDetailModalVisible(false)}>关闭</Button>
          </Space>
        }
        width={800}
      >
        {selectedMedia && (
          <div>
            {selectedMedia.file_type.startsWith('image/') && (
              <div style={{ marginBottom: 16, textAlign: 'center' }}>
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.alt_text || selectedMedia.filename}
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <strong>文件名：</strong> {selectedMedia.filename}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>文件类型：</strong> {selectedMedia.file_type}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>文件大小：</strong> {formatFileSize(selectedMedia.file_size)}
            </div>
            {selectedMedia.width && selectedMedia.height && (
              <div style={{ marginBottom: 12 }}>
                <strong>尺寸：</strong> {selectedMedia.width} × {selectedMedia.height}
              </div>
            )}
            <div style={{ marginBottom: 12 }}>
              <strong>上传时间：</strong>{' '}
              {new Date(selectedMedia.created_at).toLocaleString('zh-CN')}
            </div>
            <div style={{ marginBottom: 12 }}>
              <strong>URL：</strong>
              <div
                style={{
                  marginTop: 4,
                  padding: 8,
                  background: '#f5f5f5',
                  borderRadius: 4,
                  wordBreak: 'break-all',
                }}
              >
                {selectedMedia.url}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MediaLibraryPage;
