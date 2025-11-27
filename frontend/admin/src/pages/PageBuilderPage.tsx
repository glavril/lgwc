import { useState, useEffect } from 'react';
import { Card, Button, Space, message, Empty } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { moduleApi, PageModuleFull, ModuleType } from '../api/modules';

interface SortableModuleProps {
  module: PageModuleFull;
  onEdit: (module: PageModuleFull) => void;
  onDelete: (id: string) => void;
}

function SortableModule({ module, onEdit, onDelete }: SortableModuleProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card
        size="small"
        className="mb-2 cursor-move hover:shadow-md"
        extra={
          <Space>
            <Button size="small" onClick={() => onEdit(module)}>编辑</Button>
            <Button size="small" danger onClick={() => onDelete(module.id)}>删除</Button>
          </Space>
        }
      >
        <div className="font-semibold">{module.module_type?.display_name || '未知模块'}</div>
        <div className="text-sm text-gray-500">顺序: {module.module_order}</div>
      </Card>
    </div>
  );
}

export default function PageBuilderPage() {
  const { contentId } = useParams();
  const [modules, setModules] = useState<PageModuleFull[]>([]);
  const [moduleTypes, setModuleTypes] = useState<ModuleType[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (contentId) {
      fetchModules();
      fetchModuleTypes();
    }
  }, [contentId]);

  const fetchModules = async () => {
    if (!contentId) return;
    setLoading(true);
    try {
      const data = await moduleApi.listByContent(contentId);
      setModules(data);
    } catch (error: any) {
      message.error('获取模块列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchModuleTypes = async () => {
    try {
      const data = await moduleApi.listTypes({ is_active: true });
      setModuleTypes(data);
    } catch (error: any) {
      message.error('获取模块类型失败');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex(m => m.id === active.id);
      const newIndex = modules.findIndex(m => m.id === over.id);

      const newModules = [...modules];
      const [movedModule] = newModules.splice(oldIndex, 1);
      newModules.splice(newIndex, 0, movedModule);

      // 更新顺序
      const updatedModules = newModules.map((m, index) => ({
        ...m,
        module_order: index,
      }));

      setModules(updatedModules);

      // 保存到服务器
      try {
        await Promise.all(
          updatedModules.map(m =>
            moduleApi.update(m.id, { module_order: m.module_order })
          )
        );
        message.success('顺序已更新');
      } catch (error: any) {
        message.error('更新顺序失败');
        fetchModules();
      }
    }
  };

  const handleAddModule = async (typeId: string) => {
    if (!contentId) return;
    try {
      await moduleApi.create({
        content_id: contentId,
        module_type_id: typeId,
        module_order: modules.length,
      });
      message.success('模块已添加');
      fetchModules();
    } catch (error: any) {
      message.error('添加模块失败');
    }
  };

  const handleDeleteModule = async (id: string) => {
    try {
      await moduleApi.delete(id);
      message.success('模块已删除');
      fetchModules();
    } catch (error: any) {
      message.error('删除模块失败');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">页面构建器</h1>
      
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <Card title="模块库" size="small">
            <Space direction="vertical" className="w-full">
              {moduleTypes.map(type => (
                <Button
                  key={type.id}
                  type="dashed"
                  icon={<PlusOutlined />}
                  className="w-full"
                  onClick={() => handleAddModule(type.id)}
                >
                  {type.display_name}
                </Button>
              ))}
            </Space>
          </Card>
        </div>

        <div className="col-span-3">
          <Card title="页面模块" loading={loading}>
            {modules.length === 0 ? (
              <Empty description="暂无模块，请从左侧添加" />
            ) : (
              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  {modules.map(module => (
                    <SortableModule
                      key={module.id}
                      module={module}
                      onEdit={() => message.info('编辑功能开发中')}
                      onDelete={handleDeleteModule}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
