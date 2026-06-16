import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Button, Table, Tag, Modal, Form, Input, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockPurchaseOrders } from '../../mock/inventory';
import type { PurchaseOrder } from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const PurchaseApprovals = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [approving, setApproving] = useState(false);

  const canApprove = (order: PurchaseOrder) => {
    if (user?.role === 'supervisor' && order.currentLevel === 1) return true;
    if (user?.role === 'supervisor' && order.currentLevel === 2) return true;
    if (user?.role === 'admin' && order.currentLevel === 3) return true;
    if (user?.role === 'admin') return true;
    return false;
  };

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      message.success('审批通过');
      setIsModalOpen(false);
      form.resetFields();
    }, 1000);
  };

  const columns: ColumnsType<PurchaseOrder> = [
    {
      title: '采购单号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono text-tech-400 text-xs">{id}</span>,
    },
    {
      title: '农药名称',
      dataIndex: 'pesticideName',
      key: 'pesticideName',
    },
    {
      title: '采购数量',
      key: 'quantity',
      render: (_, record) => (
        <span className="font-mono">
          {record.quantity} {record.unit}
        </span>
      ),
    },
    {
      title: '预估金额',
      key: 'price',
      render: (_, record) => (
        <span className="font-mono text-warning-400">¥{(record.quantity * record.estimatedPrice).toFixed(0)}</span>
      ),
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '当前阶段',
      key: 'level',
      render: (_, record) => {
        const levels = ['采购员审核', '植保主管审批', '总经理审批', '已完成'];
        return (
          <Tag color={record.currentLevel >= 3 ? 'success' : 'blue'}>
            {levels[record.currentLevel - 1]}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'processing'}>
          {{ pending: '待审批', approved: '已通过', rejected: '已驳回', escalated: '已升级' }[s]}
        </Tag>
      ),
    },
    {
      title: '是否超时',
      dataIndex: 'escalatedAt',
      key: 'escalated',
      render: (v) => (v ? <Tag color="warning">已自动升级</Tag> : <span className="text-dark-500">正常</span>),
    },
    {
      title: '申请时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => {
            setSelectedOrder(record);
            setIsModalOpen(true);
          }}
        >
          {canApprove(record) ? '审批' : '查看'}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate('/inventory')} className="bg-dark-800 border-dark-600">
          返回库存
        </Button>
        <h2 className="text-xl font-bold text-white">采购审批</h2>
        <Tag icon={<AlertTriangle size={12} />} color="warning" className="ml-auto">
          超48小时自动升级
        </Tag>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-warning-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {mockPurchaseOrders.filter((o) => o.status === 'pending').length}
              </div>
              <div className="text-dark-400 text-sm">待审批</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-primary-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {mockPurchaseOrders.filter((o) => o.status === 'approved').length}
              </div>
              <div className="text-dark-400 text-sm">已通过</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <TrendingUp size={20} className="text-tech-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">1</div>
              <div className="text-dark-400 text-sm">已升级</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-danger-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">2</div>
              <div className="text-dark-400 text-sm">库存预警</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <Table
          columns={columns}
          dataSource={mockPurchaseOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="采购审批详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={600}
        footer={
          canApprove(selectedOrder!) ? (
            <div className="flex justify-end gap-3">
              <Button danger icon={<XCircle size={14} />}>
                驳回
              </Button>
              <Button type="primary" icon={<CheckCircle size={14} />} loading={approving} onClick={handleApprove}>
                审批通过
              </Button>
            </div>
          ) : null
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-dark-400 text-sm mb-1">采购单号</div>
                <div className="font-mono text-tech-400">{selectedOrder.id}</div>
              </div>
              <div>
                <div className="text-dark-400 text-sm mb-1">农药名称</div>
                <div className="text-dark-100 font-medium">{selectedOrder.pesticideName}</div>
              </div>
              <div>
                <div className="text-dark-400 text-sm mb-1">采购数量</div>
                <div className="text-dark-100">
                  {selectedOrder.quantity} {selectedOrder.unit}
                </div>
              </div>
              <div>
                <div className="text-dark-400 text-sm mb-1">预估总价</div>
                <div className="text-warning-400 font-bold">
                  ¥{(selectedOrder.quantity * selectedOrder.estimatedPrice).toFixed(0)}
                </div>
              </div>
              <div>
                <div className="text-dark-400 text-sm mb-1">供应商</div>
                <div className="text-dark-100">{selectedOrder.supplier}</div>
              </div>
              <div>
                <div className="text-dark-400 text-sm mb-1">申请人</div>
                <div className="text-dark-100">{selectedOrder.applicantName}</div>
              </div>
            </div>

            <div className="bg-dark-950 rounded-lg p-3">
              <div className="text-dark-400 text-sm mb-1">采购原因</div>
              <div className="text-dark-200">{selectedOrder.reason}</div>
            </div>

            <div>
              <h4 className="text-dark-200 font-medium mb-3">三级审批流程</h4>
              <div className="flex items-center">
                {['采购员', '植保主管', '总经理'].map((name, i) => {
                  const approval = selectedOrder.approvals[i];
                  const isCurrent = selectedOrder.currentLevel === i + 1;
                  const isDone = approval?.status === 'approved';
                  return (
                    <div key={i} className="flex items-center flex-1">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isDone
                              ? 'bg-primary-500 text-white'
                              : isCurrent
                              ? 'bg-tech-500 text-white animate-pulse'
                              : 'bg-dark-700 text-dark-400'
                          }`}
                        >
                          {isDone ? '✓' : i + 1}
                        </div>
                        <span className={`mt-2 text-xs ${isDone || isCurrent ? 'text-dark-200' : 'text-dark-500'}`}>
                          {name}
                        </span>
                        {approval?.approverName && approval.approverName !== '待审批' && (
                          <span className="text-xs text-dark-500">{approval.approverName}</span>
                        )}
                      </div>
                      {i < 2 && (
                        <div className={`flex-1 h-0.5 mx-2 ${isDone ? 'bg-primary-500' : 'bg-dark-700'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {canApprove(selectedOrder) && (
              <Form form={form} layout="vertical">
                <Form.Item label="审批意见" name="opinion">
                  <TextArea rows={3} placeholder="请输入审批意见（可选）" />
                </Form.Item>
              </Form>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PurchaseApprovals;
