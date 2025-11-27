import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Space, message, Card } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { contentApi, ContentCreateData } from '../api/content';

const { TextArea } = Input;
const { Option } = Select;

export default function ContentEditorPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchContent();
    }
  }, [id]);

  const fetchContent = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await contentApi.get(id);
      form.setFieldsValue(data);
      setContent(data.content);
    } catch (error: any) {
      message.error('获取内容失败');
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values: ContentCreateData) => {
    setLoading(true);
    try {
      const data = { ...values, content };
      
      if (id) {
        await contentApi.update(id, data);
        message.success('更新成功');
      } else {
        await contentApi.create(data);
        message.success('创建成功');
      }
      
      navigate('/content');
    } catch (error: any) {
      message.error(error.response?.data?.detail || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Card title={id ? '编辑内容' : '新建内容'}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            content_type: 'post',
            status: 'draft',
            content_format: 'html',
          }}
        >
          <Form.Item
            label="标题"
            name="title"
            rules={[{ required: true, message: '请输入标题' }]}
          >
            <Input size="large" placeholder="请输入标题" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="自动生成,也可自定义" />
          </Form.Item>

          <Form.Item label="摘要" name="excerpt">
            <TextArea rows={3} placeholder="请输入摘要" />
          </Form.Item>

          <Form.Item label="内容" required>
            <ReactQuill
              value={content}
              onChange={setContent}
              theme="snow"
              className="bg-white"
              style={{ height: 400, marginBottom: 50 }}
            />
          </Form.Item>

          <Space size="middle">
            <Form.Item label="类型" name="content_type">
              <Select style={{ width: 120 }}>
                <Option value="post">文章</Option>
                <Option value="page">页面</Option>
              </Select>
            </Form.Item>

            <Form.Item label="状态" name="status">
              <Select style={{ width: 120 }}>
                <Option value="draft">草稿</Option>
                <Option value="published">已发布</Option>
                <Option value="private">私密</Option>
              </Select>
            </Form.Item>

            <Form.Item label="格式" name="content_format">
              <Select style={{ width: 120 }}>
                <Option value="html">HTML</Option>
                <Option value="markdown">Markdown</Option>
              </Select>
            </Form.Item>
          </Space>

          <Form.Item label="SEO标题" name="meta_title">
            <Input placeholder="SEO标题" />
          </Form.Item>

          <Form.Item label="SEO描述" name="meta_description">
            <TextArea rows={2} placeholder="SEO描述" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading} size="large">
                {id ? '更新' : '创建'}
              </Button>
              <Button size="large" onClick={() => navigate('/content')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
