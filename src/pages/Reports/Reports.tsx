import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Search, Filter, Download, Calendar } from 'lucide-react';
import { Input, Select, Button, Table, Tag, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockReports } from '../../mock/reports';
import type { WorkReport } from '../../types/report';
import { useAuthStore } from '../../store/useAuthStore';

const { RangePicker } = DatePicker;

const Reports = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [crop, setCrop] = useState<string>('all');

  const filteredData = mockReports.filter((r) => {
    if (keyword && !r.plotName.includes(keyword) && !r.farmerName.includes(keyword)) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (crop !== 'all' && r.cropType !== crop) return false;
    if (user?.role === 'farmer' && r.farmerName !== user.name) return false;
    return true;
  });

  const columns: ColumnsType<WorkReport> = [
    {
      title: '报告编号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono text-tech-400 text-xs">{id}</span>,
    },
    {
      title: '地块名称',
      dataIndex: 'plotName',
      key: 'plotName',
      render: (text, record) => (
        <a onClick={() => navigate(`/reports/${record.id}`)} className="text-dark-100 hover:text-primary-400">
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
      title: '作业面积',
      key: 'area',
      width: 100,
      render: (_, record) => (
        <span className="font-mono text-dark-200">{record.actualArea} 亩</span>
      ),
    },
    {
      title: '作业时长',
      key: 'duration',
      width: 100,
      render: (_, record) => (
        <span className="font-mono text-dark-200">{record.flightDuration} 分钟</span>
      ),
    },
    {
      title: '作业费用',
      key: 'cost',
      width: 120,
      render: (_, record) => (
        <span className="font-mono text-warning-400">¥{record.settlement.actualPayment}</span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => <Tag color={s === 'confirmed' ? 'success' : 'default'}>{s === 'confirmed' ? '已确认' : '草稿'}</Tag>,
    },
    {
      title: '作业时间',
      key: 'time',
      width: 160,
      render: (_, record) => <span className="text-dark-400 text-sm">{record.startTime}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <>
          <Button type="link" size="small" onClick={() => navigate(`/reports/${record.id}`)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<Download size={12} />}>
            导出
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <FileText className="text-primary-400" size={24} />
          作业报告
        </h2>
        <Button icon={<Download size={16} />} type="primary">
          导出月度报告
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{mockReports.length}</div>
              <div className="text-dark-400 text-sm">总报告数</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tech-500/20 rounded-lg flex items-center justify-center">
              <Calendar size={24} className="text-tech-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">328.5</div>
              <div className="text-dark-400 text-sm">本月作业面积(亩)</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-500/20 rounded-lg flex items-center justify-center">
              <Download size={24} className="text-warning-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">¥12,580</div>
              <div className="text-dark-400 text-sm">本月结算金额</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center">
              <FileText size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">92.5%</div>
              <div className="text-dark-400 text-sm">农户满意度</div>
            </div>
          </div>
        </div>
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
                { value: 'draft', label: '草稿' },
                { value: 'confirmed', label: '已确认' },
              ]}
            />
            <Select
              value={crop}
              onChange={setCrop}
              style={{ width: 120 }}
              options={[
                { value: 'all', label: '全部作物' },
                { value: '水稻', label: '水稻' },
                { value: '小麦', label: '小麦' },
                { value: '玉米', label: '玉米' },
                { value: '大豆', label: '大豆' },
              ]}
            />
            <RangePicker style={{ width: 260 }} />
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>
    </div>
  );
};

export default Reports;
