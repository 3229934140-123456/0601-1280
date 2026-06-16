import { useState } from 'react';
import { ArrowLeft, AlertTriangle, Lock, Unlock, FileText, CheckCircle, Clock } from 'lucide-react';
import { Button, Table, Tag, Modal, message, Tabs } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockEnvAlerts, mockRectificationOrders } from '../../mock/environment';
import type { EnvAlert, RectificationOrder } from '../../types/environment';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

const EnvAlerts = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [alerts, setAlerts] = useState(mockEnvAlerts);
  const [selectedAlert, setSelectedAlert] = useState<EnvAlert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProcess = (alert: EnvAlert) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleLockPlot = () => {
    message.success('地块已锁定，作业已暂停，整改工单已推送');
    setIsModalOpen(false);
    setAlerts((prev) =>
      prev.map((a) => (a.id === selectedAlert?.id ? { ...a, status: 'processing' } : a))
    );
  };

  const handleResolve = (orderId: string) => {
    message.success('整改已审核通过，地块已解锁');
  };

  const alertColumns: ColumnsType<EnvAlert> = [
    {
      title: '告警编号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono text-tech-400 text-xs">{id}</span>,
    },
    {
      title: '地块名称',
      dataIndex: 'plotName',
      key: 'plotName',
    },
    {
      title: '所属区域',
      dataIndex: 'region',
      key: 'region',
      width: 100,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (t) => <Tag color={t === 'water' ? 'blue' : 'green'}>{t === 'water' ? '水质' : '土壤'}</Tag>,
    },
    {
      title: '超标指标',
      dataIndex: 'indicator',
      key: 'indicator',
      width: 120,
    },
    {
      title: '当前值/标准值',
      key: 'value',
      width: 140,
      render: (_, record) => (
        <span className="font-mono">
          <span className="text-danger-400">{record.value}</span>
          {' / '}
          <span className="text-dark-400">{record.standard}</span>
        </span>
      ),
    },
    {
      title: '等级',
      dataIndex: 'level',
      key: 'level',
      width: 80,
      render: (l) => <Tag color={l === 'danger' ? 'error' : 'warning'}>{l === 'danger' ? '严重' : '警告'}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => (
        <Tag color={s === 'resolved' ? 'success' : s === 'processing' ? 'processing' : 'warning'}>
          {{ pending: '待处理', processing: '处理中', resolved: '已解决' }[s]}
        </Tag>
      ),
    },
    {
      title: '告警时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <>
          <Button type="link" size="small" onClick={() => handleProcess(record)}>
            处理
          </Button>
          <Button type="link" size="small" danger>
            锁定地块
          </Button>
        </>
      ),
    },
  ];

  const rectificationColumns: ColumnsType<RectificationOrder> = [
    {
      title: '工单编号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono text-tech-400 text-xs">{id}</span>,
    },
    {
      title: '地块名称',
      dataIndex: 'plotName',
      key: 'plotName',
    },
    {
      title: '农户',
      dataIndex: 'farmerName',
      key: 'farmerName',
      width: 100,
    },
    {
      title: '问题描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '整改期限',
      dataIndex: 'deadline',
      key: 'deadline',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s) => (
        <Tag
          color={
            s === 'verified'
              ? 'success'
              : s === 'completed'
              ? 'processing'
              : s === 'in_progress'
              ? 'warning'
              : 'default'
          }
        >
          {{ pending: '待整改', in_progress: '整改中', completed: '待审核', verified: '已完成' }[s]}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <>
          <Button type="link" size="small">详情</Button>
          {record.status === 'completed' && user?.role === 'env_officer' && (
            <Button type="link" size="small" onClick={() => handleResolve(record.id)}>
              审核
            </Button>
          )}
        </>
      ),
    },
  ];

  const tabItems = [
    {
      key: 'alerts',
      label: (
        <span className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning-400" />
          超标告警
        </span>
      ),
      children: (
        <Table
          columns={alertColumns}
          dataSource={alerts}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'rectification',
      label: (
        <span className="flex items-center gap-2">
          <FileText size={16} className="text-tech-400" />
          整改工单
        </span>
      ),
      children: (
        <Table
          columns={rectificationColumns}
          dataSource={mockRectificationOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/environment')} className="bg-dark-800 border-dark-600">
          返回监测
        </Button>
        <h2 className="text-xl font-bold text-white">环保告警管理</h2>
        <Tag icon={<Lock size={12} />} color="error" className="ml-auto">
          超标自动锁定地块
        </Tag>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-warning-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {alerts.filter((a) => a.status === 'pending').length}
              </div>
              <div className="text-dark-400 text-sm">待处理</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-danger-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {alerts.filter((a) => a.level === 'danger').length}
              </div>
              <div className="text-dark-400 text-sm">严重告警</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <Lock size={20} className="text-warning-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">1</div>
              <div className="text-dark-400 text-sm">已锁定地块</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-primary-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {alerts.filter((a) => a.status === 'resolved').length}
              </div>
              <div className="text-dark-400 text-sm">已解决</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <Tabs items={tabItems} defaultActiveKey="alerts" />
      </div>

      <Modal
        title="处理超标告警"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setIsModalOpen(false)}>取消</Button>
            <Button type="primary" danger icon={<Lock size={14} />} onClick={handleLockPlot}>
              锁定地块并生成整改工单
            </Button>
          </div>
        }
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="bg-danger-500/10 border border-danger-500/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={20} className="text-danger-500" />
                <span className="text-white font-semibold">{selectedAlert.plotName}</span>
                <Tag color="error">严重超标</Tag>
              </div>
              <p className="text-dark-300 text-sm">
                {selectedAlert.type === 'water' ? '水质' : '土壤'}中{selectedAlert.indicator}含量为{' '}
                <span className="text-danger-400 font-mono">{selectedAlert.value}</span>，
                超过标准值 <span className="text-dark-400 font-mono">{selectedAlert.standard}</span>，
                超标 <span className="text-warning-400 font-bold">{((selectedAlert.value / selectedAlert.standard - 1) * 100).toFixed(0)}%</span>
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-dark-200 font-medium">影响说明</h4>
              <ul className="text-dark-400 text-sm space-y-1 list-disc pl-5">
                <li>可能影响周边水体生态环境</li>
                <li>存在农产品安全隐患</li>
                <li>需立即停止该地块植保作业</li>
                <li>需制定整改方案并限期整改</li>
              </ul>
            </div>

            <div className="bg-dark-950 rounded-lg p-4">
              <h4 className="text-dark-200 font-medium mb-2">处理建议</h4>
              <ol className="text-dark-400 text-sm space-y-1 list-decimal pl-5">
                <li>立即锁定该地块，暂停所有植保作业</li>
                <li>生成整改工单，推送至农户及相关部门</li>
                <li>要求农户7日内提交整改方案</li>
                <li>整改完成后进行复检</li>
                <li>复检合格后方可解锁地块</li>
              </ol>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default EnvAlerts;
