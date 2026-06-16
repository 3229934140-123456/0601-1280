import { useState } from 'react';
import { Package, Search, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { Input, Select, Table, Tag, Progress, Tabs, Button, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockInventory, categoryNames } from '../../mock/inventory';
import type { Inventory, InventoryStatus } from '../../types/inventory';
import { useNavigate } from 'react-router-dom';

const statusMap: Record<InventoryStatus, { text: string; color: string }> = {
  normal: { text: '正常', color: 'success' },
  warning: { text: '预警', color: 'warning' },
  shortage: { text: '缺货', color: 'error' },
};

const Inventory = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  const filteredData = mockInventory.filter((item) => {
    if (keyword && !item.pesticideName.includes(keyword)) return false;
    if (category !== 'all' && item.category !== category) return false;
    if (status !== 'all' && item.status !== status) return false;
    return true;
  });

  const totalValue = mockInventory.reduce((sum, item) => sum + item.totalQuantity * item.unitPrice, 0);
  const warningCount = mockInventory.filter((i) => i.status === 'warning' || i.status === 'shortage').length;
  const totalItems = mockInventory.length;

  const columns: ColumnsType<Inventory> = [
    {
      title: '农药名称',
      dataIndex: 'pesticideName',
      key: 'pesticideName',
      render: (text) => <span className="text-dark-100 font-medium">{text}</span>,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (c) => <Tag color="blue">{categoryNames[c]}</Tag>,
    },
    {
      title: '规格',
      dataIndex: 'specification',
      key: 'specification',
      width: 140,
    },
    {
      title: '库存状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: InventoryStatus) => <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag>,
    },
    {
      title: '可用库存',
      key: 'stock',
      width: 180,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-dark-100 w-20 text-right">
            {record.availableQuantity} {record.unit}
          </span>
          <Progress
            percent={(record.availableQuantity / (record.safetyStock * 2)) * 100}
            size="small"
            strokeColor={
              record.status === 'shortage'
                ? '#F44336'
                : record.status === 'warning'
                ? '#FF9800'
                : '#4CAF50'
            }
            showInfo={false}
            style={{ width: 80 }}
          />
        </div>
      ),
    },
    {
      title: '安全库存',
      dataIndex: 'safetyStock',
      key: 'safetyStock',
      width: 100,
      render: (v, record) => (
        <span className="font-mono text-dark-400">
          {v} {record.unit}
        </span>
      ),
    },
    {
      title: '单价',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 100,
      render: (v) => <span className="font-mono text-warning-400">¥{v}</span>,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 140,
      ellipsis: true,
    },
    {
      title: '有效期至',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="link" size="small">
            详情
          </Button>
          <Button type="link" size="small">
            出库
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'all',
      label: '库存台账',
      children: (
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'outbound',
      label: '出库审批',
      onClick: () => navigate('/inventory/outbound'),
      children: null as any,
    },
    {
      key: 'purchase',
      label: '采购审批',
      onClick: () => navigate('/inventory/purchase'),
      children: null as any,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{totalItems}</div>
              <div className="text-dark-400 text-sm">库存品类</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tech-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp size={24} className="text-tech-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">¥{(totalValue / 10000).toFixed(1)}万</div>
              <div className="text-dark-400 text-sm">库存总价值</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-warning-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{warningCount}</div>
              <div className="text-dark-400 text-sm">预警品种</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center">
              <Package size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">4.8</div>
              <div className="text-dark-400 text-sm">月周转率</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search size={16} className="text-dark-400" />
              <Input
                placeholder="搜索农药名称"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-dark-400" />
              <Select
                value={category}
                onChange={setCategory}
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: '全部分类' },
                  { value: 'insecticide', label: '杀虫剂' },
                  { value: 'fungicide', label: '杀菌剂' },
                  { value: 'herbicide', label: '除草剂' },
                  { value: 'other', label: '其他' },
                ]}
              />
              <Select
                value={status}
                onChange={setStatus}
                style={{ width: 120 }}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'normal', label: '正常' },
                  { value: 'warning', label: '预警' },
                  { value: 'shortage', label: '缺货' },
                ]}
              />
            </div>
          </div>
          <Space>
            <Button onClick={() => navigate('/inventory/outbound')}>出库审批</Button>
            <Button onClick={() => navigate('/inventory/purchase')}>采购审批</Button>
          </Space>
        </div>

        <Tabs
          items={tabItems}
          defaultActiveKey="all"
          onTabClick={(key) => {
            if (key === 'outbound') navigate('/inventory/outbound');
            if (key === 'purchase') navigate('/inventory/purchase');
          }}
        />
      </div>
    </div>
  );
};

export default Inventory;
