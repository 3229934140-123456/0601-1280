import { useState } from 'react';
import { Users, Search, Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { Input, Button, Table, Tag, Switch, Modal, Form, Select, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockUsers, roleNames } from '../../mock/users';
import type { User, UserRole } from '../../types/user';

const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const filteredUsers = users.filter((u) => {
    if (keyword && !u.name.includes(keyword) && !u.username.includes(keyword)) return false;
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该用户吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
        message.success('删除成功');
      },
    });
  };

  const handleSubmit = () => {
    form.validateFields().then((values) => {
      if (editingUser) {
        setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...values } : u)));
        message.success('修改成功');
      } else {
        const newUser: User = {
          ...values,
          id: `u${Date.now()}`,
          status: 'active',
          createdAt: new Date().toISOString().split('T')[0],
        };
        setUsers((prev) => [...prev, newUser]);
        message.success('添加成功');
      }
      setIsModalOpen(false);
    });
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status: u.status === 'active' ? 'inactive' : 'active' } : u))
    );
  };

  const columns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      width: 120,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: UserRole) => {
        const colors: Record<string, string> = {
          admin: 'purple',
          supervisor: 'blue',
          env_officer: 'green',
          pilot: 'cyan',
          farmer: 'orange',
        };
        return <Tag color={colors[role]}>{roleNames[role]}</Tag>;
      },
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '所属区域',
      dataIndex: 'region',
      key: 'region',
      width: 100,
      render: (v) => v || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record) => (
        <Switch
          checked={status === 'active'}
          onChange={() => handleToggleStatus(record.id)}
          size="small"
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<Edit2 size={12} />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<Trash2 size={12} />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Users className="text-primary-400" size={24} />
          用户管理
        </h2>
        <Button type="primary" icon={<Plus size={16} />} onClick={handleAdd}>
          添加用户
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        {Object.entries(roleNames).map(([key, name]) => {
          const count = users.filter((u) => u.role === key).length;
          return (
            <div key={key} className="card-glow p-4">
              <div className="text-dark-400 text-sm mb-1">{name}</div>
              <div className="text-2xl font-bold text-white font-mono">{count}</div>
            </div>
          );
        })}
      </div>

      <div className="card-glow p-5">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-dark-400" />
            <Input
              placeholder="搜索用户名/姓名"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </div>
          <Select
            value={roleFilter}
            onChange={setRoleFilter}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: '全部角色' },
              { value: 'admin', label: '系统管理员' },
              { value: 'supervisor', label: '植保主管' },
              { value: 'env_officer', label: '环保监管员' },
              { value: 'pilot', label: '飞手' },
              { value: 'farmer', label: '农户' },
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title={editingUser ? '编辑用户' : '添加用户'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onOk={handleSubmit}
        okText={editingUser ? '保存' : '添加'}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            label="姓名"
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            label="角色"
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="请选择角色">
              {Object.entries(roleNames).map(([key, name]) => (
                <Option key={key} value={key}>
                  {name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入手机号" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item label="所属区域" name="region">
            <Select placeholder="请选择区域">
              <Option value="华东区">华东区</Option>
              <Option value="华北区">华北区</Option>
              <Option value="华南区">华南区</Option>
              <Option value="西南区">西南区</Option>
              <Option value="西北区">西北区</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;
