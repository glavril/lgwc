import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Select,
  InputNumber,
  message,
  Tabs,
  Space,
  Upload,
  Divider,
} from 'antd';
import { UploadOutlined, SaveOutlined } from '@ant-design/icons';
import apiClient from '../api/client';

const { TextArea } = Input;

interface SiteSettings {
  site_name: string;
  site_description: string;
  site_url: string;
  admin_email: string;
  language: string;
  timezone: string;
  date_format: string;
  time_format: string;
  posts_per_page: number;
  comments_enabled: boolean;
  comments_require_approval: boolean;
  allow_registration: boolean;
  default_role: string;
  upload_max_size: number;
  allowed_file_types: string[];
}

const SettingsPage = () => {
  const [generalForm] = Form.useForm();
  const [readingForm] = Form.useForm();
  const [discussionForm] = Form.useForm();
  const [mediaForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/settings');
      const settings: SiteSettings = response.data;

      // 填充表单数据
      generalForm.setFieldsValue({
        site_name: settings.site_name,
        site_description: settings.site_description,
        site_url: settings.site_url,
        admin_email: settings.admin_email,
        language: settings.language,
        timezone: settings.timezone,
        date_format: settings.date_format,
        time_format: settings.time_format,
      });

      readingForm.setFieldsValue({
        posts_per_page: settings.posts_per_page,
      });

      discussionForm.setFieldsValue({
        comments_enabled: settings.comments_enabled,
        comments_require_approval: settings.comments_require_approval,
        allow_registration: settings.allow_registration,
        default_role: settings.default_role,
      });

      mediaForm.setFieldsValue({
        upload_max_size: settings.upload_max_size,
        allowed_file_types: settings.allowed_file_types,
      });
    } catch (err) {
      message.error('加载设置失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGeneral = async (values: any) => {
    try {
      setSaveLoading(true);
      await apiClient.put('/settings/general', values);
      message.success('常规设置已保存');
    } catch (err) {
      message.error('保存失败');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveReading = async (values: any) => {
    try {
      setSaveLoading(true);
      await apiClient.put('/settings/reading', values);
      message.success('阅读设置已保存');
    } catch (err) {
      message.error('保存失败');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveDiscussion = async (values: any) => {
    try {
      setSaveLoading(true);
      await apiClient.put('/settings/discussion', values);
      message.success('讨论设置已保存');
    } catch (err) {
      message.error('保存失败');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveMedia = async (values: any) => {
    try {
      setSaveLoading(true);
      await apiClient.put('/settings/media', values);
      message.success('媒体设置已保存');
    } catch (err) {
      message.error('保存失败');
      console.error(err);
    } finally {
      setSaveLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'general',
      label: '常规',
      children: (
        <Card loading={loading}>
          <Form
            form={generalForm}
            layout="vertical"
            onFinish={handleSaveGeneral}
            initialValues={{
              language: 'zh-CN',
              timezone: 'Asia/Shanghai',
              date_format: 'Y-m-d',
              time_format: 'H:i:s',
            }}
          >
            <Form.Item
              label="网站标题"
              name="site_name"
              rules={[{ required: true, message: '请输入网站标题' }]}
            >
              <Input placeholder="我的博客" />
            </Form.Item>

            <Form.Item label="网站描述" name="site_description">
              <TextArea rows={3} placeholder="分享技术、生活与思考" />
            </Form.Item>

            <Form.Item
              label="网站地址"
              name="site_url"
              rules={[
                { required: true, message: '请输入网站地址' },
                { type: 'url', message: '请输入有效的URL' },
              ]}
            >
              <Input placeholder="https://example.com" />
            </Form.Item>

            <Form.Item
              label="管理员邮箱"
              name="admin_email"
              rules={[
                { required: true, message: '请输入管理员邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input placeholder="admin@example.com" />
            </Form.Item>

            <Divider />

            <Form.Item label="语言" name="language">
              <Select>
                <Select.Option value="zh-CN">简体中文</Select.Option>
                <Select.Option value="zh-TW">繁体中文</Select.Option>
                <Select.Option value="en-US">English</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="时区" name="timezone">
              <Select>
                <Select.Option value="Asia/Shanghai">北京时间 (UTC+8)</Select.Option>
                <Select.Option value="Asia/Hong_Kong">中国香港时间 (UTC+8)</Select.Option>
                <Select.Option value="Asia/Tokyo">东京时间 (UTC+9)</Select.Option>
                <Select.Option value="America/New_York">纽约时间 (UTC-5)</Select.Option>
                <Select.Option value="Europe/London">伦敦时间 (UTC+0)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="日期格式" name="date_format">
              <Select>
                <Select.Option value="Y-m-d">2025-11-27</Select.Option>
                <Select.Option value="m/d/Y">11/27/2025</Select.Option>
                <Select.Option value="d/m/Y">27/11/2025</Select.Option>
                <Select.Option value="Y年m月d日">2025年11月27日</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item label="时间格式" name="time_format">
              <Select>
                <Select.Option value="H:i:s">24小时制 (14:30:00)</Select.Option>
                <Select.Option value="g:i a">12小时制 (2:30 pm)</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saveLoading}
                  icon={<SaveOutlined />}
                >
                  保存更改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'reading',
      label: '阅读',
      children: (
        <Card loading={loading}>
          <Form
            form={readingForm}
            layout="vertical"
            onFinish={handleSaveReading}
            initialValues={{
              posts_per_page: 10,
            }}
          >
            <Form.Item
              label="每页显示文章数"
              name="posts_per_page"
              rules={[{ required: true, message: '请输入每页显示文章数' }]}
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="RSS订阅中显示的最多文章数"
              name="rss_posts_count"
              initialValue={10}
            >
              <InputNumber min={1} max={50} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="RSS订阅中每篇文章显示"
              name="rss_show_content"
              initialValue="summary"
            >
              <Select>
                <Select.Option value="full">全文</Select.Option>
                <Select.Option value="summary">摘要</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saveLoading}
                  icon={<SaveOutlined />}
                >
                  保存更改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'discussion',
      label: '讨论',
      children: (
        <Card loading={loading}>
          <Form
            form={discussionForm}
            layout="vertical"
            onFinish={handleSaveDiscussion}
            initialValues={{
              comments_enabled: true,
              comments_require_approval: false,
              allow_registration: true,
              default_role: 'subscriber',
            }}
          >
            <Form.Item
              label="评论功能"
              name="comments_enabled"
              valuePropName="checked"
            >
              <Switch checkedChildren="开启" unCheckedChildren="关闭" />
            </Form.Item>

            <Form.Item
              label="评论需要审核"
              name="comments_require_approval"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item
              label="评论嵌套层级"
              name="comment_max_depth"
              initialValue={5}
            >
              <InputNumber min={1} max={10} style={{ width: '100%' }} />
            </Form.Item>

            <Divider />

            <Form.Item
              label="允许用户注册"
              name="allow_registration"
              valuePropName="checked"
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item label="新用户默认角色" name="default_role">
              <Select>
                <Select.Option value="subscriber">订阅者</Select.Option>
                <Select.Option value="contributor">贡献者</Select.Option>
                <Select.Option value="author">作者</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saveLoading}
                  icon={<SaveOutlined />}
                >
                  保存更改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'media',
      label: '媒体',
      children: (
        <Card loading={loading}>
          <Form
            form={mediaForm}
            layout="vertical"
            onFinish={handleSaveMedia}
            initialValues={{
              upload_max_size: 10,
              allowed_file_types: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
            }}
          >
            <Form.Item
              label="最大上传文件大小 (MB)"
              name="upload_max_size"
              rules={[{ required: true, message: '请输入最大上传文件大小' }]}
            >
              <InputNumber min={1} max={100} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="允许的文件类型"
              name="allowed_file_types"
              rules={[{ required: true, message: '请选择允许的文件类型' }]}
            >
              <Select mode="multiple" placeholder="选择允许的文件类型">
                <Select.Option value="image/jpeg">JPEG 图片</Select.Option>
                <Select.Option value="image/png">PNG 图片</Select.Option>
                <Select.Option value="image/gif">GIF 图片</Select.Option>
                <Select.Option value="image/webp">WebP 图片</Select.Option>
                <Select.Option value="application/pdf">PDF 文档</Select.Option>
                <Select.Option value="application/msword">Word 文档</Select.Option>
                <Select.Option value="video/mp4">MP4 视频</Select.Option>
                <Select.Option value="audio/mpeg">MP3 音频</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="图片压缩质量"
              name="image_quality"
              initialValue={85}
              help="0-100，数值越大质量越好，文件越大"
            >
              <InputNumber min={0} max={100} style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="自动生成缩略图"
              name="auto_generate_thumbnails"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch checkedChildren="是" unCheckedChildren="否" />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saveLoading}
                  icon={<SaveOutlined />}
                >
                  保存更改
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={{ marginBottom: 24 }}>系统设置</h1>
      <Tabs items={tabItems} />
    </div>
  );
};

export default SettingsPage;
