import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, FileText } from 'lucide-react';
import { Input, Select, Button, Table, Tag, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockApplications, regions, cropTypes } from '../../mock/applications';
import type { Application, ApplicationStatus } from '../../types/application';
import { useAuthStore } from '../../store/useAuthStore';

const statusMap: Record<ApplicationStatus, { text: string; color: string }> = {
  pending: { text: '待处理', color: 'warning' },
  planning: { text: '方案制定中', color: 'processing' },
  approved: { text: '已审批', color: 'success' },
  rejected: { text: '已驳回', color: 'error' },
  in_progress: { text: '作业中', color: 'processing' },
  completed: { text: '已完成', color: 'success' },
};

const Applications = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [region, setRegion] = useState<string>('all');
  const [crop, setCrop] = useState<string>('all');

  const filteredData = mockApplications.filter((app) => {
    if (keyword && !app.plotName.includes(keyword) && !app.farmerName.includes(keyword)) return false;
    if (status !== 'all' && app.status !== status) return false;
    if (region !== 'all' && app.region !== region) return false;
    if (crop !== 'all' && app.cropType !== crop) return false;
    if (user?.role === 'farmer' && app.farmerId !== user.id) return false;
    return true;
  });

  const columns: ColumnsType<Application> = [
    {
      title: '申请编号',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id) => <span className="font-mono text-tech-400 text-xs">{id}</span>,
    },
    {
      title: '地块名称',
      dataIndex: 'plotName',
      key: 'plotName',
      render: (text, record) => (
        <a onClick={() => navigate(`/applications/${record.id}`)} className="text-dark-100 hover:text-primary-400">
          {text}
        </a>
      ),
    },
    {
      title: '农户',
      dataIndex: 'farmerName',
      key: 'farmerName',
      width: 100,
    },
    {
      title: '作物类型',
      dataIndex: 'cropType',
      key: 'cropType',
      width: 100,
    },
    {
      title: '面积(亩)',
      dataIndex: 'plotArea',
      key: 'plotArea',
      width: 90,
      render: (v) => <span className="font-mono">{v}</span>,
    },
    {
      title: '病虫害',
      dataIndex: 'pestType',
      key: 'pestType',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: ApplicationStatus) => <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag>,
    },
    {
      title: '期望日期',
      dataIndex: 'expectedDate',
      key: 'expectedDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => navigate(`/applications/${record.id}`)}>
            详情
          </Button>
          {record.status === 'pending' && user?.role === 'farmer' && (
            <Button type="link" size="small">
              编辑
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">植保申请管理</h2>
        {user?.role === 'farmer' && (
          <Button type="primary" icon={<Plus size={16} />} onClick={() => navigate('/applications/new')}>
            新建申请
          </Button>
        )}
      </div>

      <div className="card-glow p-5">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Search size={16} className="text-dark-400" />
            <Input
              placeholder="搜索地块/农户"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-dark-400" />
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'pending', label: '待处理' },
                { value: 'planning', label: '方案制定中' },
                { value: 'approved', label: '已审批' },
                { value: 'in_progress', label: '作业中' },
                { value: 'completed', label: '已完成' },
                { value: 'rejected', label: '已驳回' },
              ]}
            />
            <Select
              value={region}
              onChange={setRegion}
              style={{ width: 120 }}
              options={[{ value: 'all', label: '全部区域' }, ...regions.map((r) => ({ value: r, label: r }))]}
            />
            <Select
              value={crop}
              onChange={setCrop}
              style={{ width: 120 }}
              options={[{ value: 'all', label: '全部作物' }, ...cropTypes.map((c) => ({ value: c, label: c }))]}
            />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          className="bg-transparent"
        />
      </div>
    </div>
  );
};

export default Applications;
