import { useState } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Package, AlertTriangle } from 'lucide-react';
import { Button, Table, Tag, Modal, Form, Input, message, Card, Descriptions, List } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockOutboundOrders } from '../../mock/inventory';
import type { OutboundOrder } from '../../types/inventory';
import { useAuthStore } from '../../store/useAuthStore';
import { useNavigate } from 'react-router-dom';

const { TextArea } = Input;

const OutboundApprovals = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [selectedOrder, setSelectedOrder] = useState<OutboundOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [approving, setApproving] = useState(false);

  const canApprove = (order: OutboundOrder) => {
    if (user?.role === 'supervisor' && order.currentLevel === 1) return true;
    if (user?.role === 'env_officer' && order.currentLevel === 2) return true;
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

  const handleReject = () => {
    form.validateFields().then(() => {
      message.warning('已驳回申请');
      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const columns: ColumnsType<OutboundOrder> = [
    {
      title: '出库单号',
      dataIndex: 'id',
      key: 'id',
      render: (id) => <span className="font-mono text-tech-400 text-xs">{id}</span>,
    },
    {
      title: '关联地块',
      dataIndex: 'applicationPlotName',
      key: 'applicationPlotName',
    },
    {
      title: '农药明细',
      key: 'items',
      render: (_, record) => (
        <div className="text-sm">
          {record.items.map((item, i) => (
            <div key={i} className="text-dark-300">
              {item.pesticideName}：{item.quantity} {item.unit}
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '总费用',
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (v) => <span className="font-mono text-warning-400">¥{v}</span>,
    },
    {
      title: '申请人',
      dataIndex: 'applicantName',
      key: 'applicantName',
    },
    {
      title: '当前阶段',
      key: 'level',
      render: (_, record) => {
        const levels = ['植保主管审批', '环保部门审批', '已完成'];
        return <Tag color="blue">{levels[record.currentLevel - 1] || '已完成'}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s) => (
        <Tag color={s === 'approved' ? 'success' : s === 'rejected' ? 'error' : 'processing'}>
          {{ pending: '待审批', approved: '已通过', rejected: '已驳回', escalated: '已越级' }[s]}
        </Tag>
      ),
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
          disabled={!canApprove(record)}
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
        <h2 className="text-xl font-bold text-white">农药出库审批</h2>
        <Tag icon={<AlertTriangle size={12} />} color="warning" className="ml-auto">
          超24小时自动越级
        </Tag>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <Clock size={20} className="text-warning-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">
                {mockOutboundOrders.filter((o) => o.status === 'pending').length}
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
                {mockOutboundOrders.filter((o) => o.status === 'approved').length}
              </div>
              <div className="text-dark-400 text-sm">已通过</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle size={20} className="text-danger-400" />
            <div>
              <div className="text-2xl font-bold text-white font-mono">1</div>
              <div className="text-dark-400 text-sm">即将超时</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <Table
          columns={columns}
          dataSource={mockOutboundOrders}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </div>

      <Modal
        title="出库审批详情"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={
          canApprove(selectedOrder!) ? (
            <div className="flex justify-end gap-3">
              <Button danger icon={<XCircle size={14} />} onClick={handleReject}>
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
            <Descriptions column={2} size="small">
              <Descriptions.Item label="出库单号">
                <span className="font-mono text-tech-400">{selectedOrder.id}</span>
              </Descriptions.Item>
              <Descriptions.Item label="关联地块">{selectedOrder.applicationPlotName}</Descriptions.Item>
              <Descriptions.Item label="申请人">{selectedOrder.applicantName}</Descriptions.Item>
              <Descriptions.Item label="申请时间">{selectedOrder.createdAt}</Descriptions.Item>
              <Descriptions.Item label="总费用" span={2}>
                <span className="text-warning-400 font-bold">¥{selectedOrder.totalCost}</span>
              </Descriptions.Item>
            </Descriptions>

            <div>
              <h4 className="text-dark-200 font-medium mb-2">出库明细</h4>
              <div className="bg-dark-950 rounded-lg p-3 space-y-2">
                {selectedOrder.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-dark-300">{item.pesticideName}</span>
                    <span className="text-dark-100 font-mono">
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-dark-200 font-medium mb-2">审批流程</h4>
              <div className="flex items-center">
                {selectedOrder.approvals.map((approval, i) => (
                  <div key={i} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                          approval.status === 'approved'
                            ? 'bg-primary-500 text-white'
                            : approval.status === 'rejected'
                            ? 'bg-danger-500 text-white'
                            : 'bg-dark-700 text-dark-400'
                        }`}
                      >
                        {approval.status === 'approved' ? '✓' : approval.status === 'rejected' ? '✕' : i + 1}
                      </div>
                      <span className="mt-1 text-xs text-dark-400 w-20 text-center">
                        {approval.approverName}
                      </span>
                      <span className="text-xs text-dark-500">{approval.approverRole}</span>
                    </div>
                    {i < selectedOrder.approvals.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-1 ${
                          approval.status === 'approved' ? 'bg-primary-500' : 'bg-dark-700'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {canApprove(selectedOrder) && (
              <Form form={form} layout="vertical">
                <Form.Item
                  label="审批意见"
                  name="opinion"
                  rules={[{ required: false, message: '请输入审批意见' }]}
                >
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

export default OutboundApprovals;
