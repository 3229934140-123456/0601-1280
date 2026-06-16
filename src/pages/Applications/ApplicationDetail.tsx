import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Plane, Package, CheckCircle, XCircle, Clock, Calendar, MapPin, User, Droplets } from 'lucide-react';
import { Button, Descriptions, Tag, Space, Divider, Card, List, Progress, message, Result, Modal, Form, Input } from 'antd';
import { useApplicationStore } from '../../store/useApplicationStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { Application } from '../../types/application';

const { TextArea } = Input;

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { getApplicationById, updateApplicationStatus } = useApplicationStore();
  const [application, setApplication] = useState<Application | undefined>();
  const [approving, setApproving] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectForm] = Form.useForm();

  useEffect(() => {
    if (id) {
      const app = getApplicationById(id);
      setApplication(app);
    }
  }, [id, getApplicationById]);

  if (!application) {
    return <Result status="404" title="申请不存在" subTitle="您访问的申请记录不存在或已被删除" extra={<Button type="primary" onClick={() => navigate('/applications')}>返回列表</Button>} />;
  }

  if (user?.role === 'farmer' && application.farmerId !== user.id) {
    return <Result status="403" title="无权限访问" subTitle="您只能查看自己地块的申请详情" extra={<Button type="primary" onClick={() => navigate('/applications')}>返回列表</Button>} />;
  }

  const workPlan = application.workPlan;

  const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: '待处理', color: 'warning' },
    planning: { text: '方案制定中', color: 'processing' },
    approved: { text: '已审批', color: 'success' },
    rejected: { text: '已驳回', color: 'error' },
    in_progress: { text: '作业中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
  };

  const handleApprove = () => {
    if (!user || (user.role !== 'supervisor' && user.role !== 'admin')) {
      message.error('只有植保主管或管理员可以审批方案');
      return;
    }
    setApproving(true);
    setTimeout(() => {
      updateApplicationStatus(application.id, 'approved');
      setApproving(false);
      message.success('方案审批通过');
      setApplication({ ...application, status: 'approved' });
    }, 1000);
  };

  const handleReject = () => {
    rejectForm.validateFields().then((values) => {
      if (!user || (user.role !== 'supervisor' && user.role !== 'admin')) {
        message.error('只有植保主管或管理员可以审批方案');
        return;
      }
      updateApplicationStatus(application.id, 'rejected');
      message.warning('方案已驳回');
      setApplication({ ...application, status: 'rejected' });
      setRejectModalOpen(false);
      rejectForm.resetFields();
    });
  };

  const steps = [
    { title: '提交申请', status: 'done', icon: FileText },
    { title: '制定方案', status: application.status !== 'pending' ? 'done' : 'current', icon: Package },
    { title: '方案审批', status: ['approved', 'in_progress', 'completed'].includes(application.status) ? 'done' : 'pending', icon: CheckCircle },
    { title: '农药出库', status: ['in_progress', 'completed'].includes(application.status) ? 'done' : 'pending', icon: Package },
    { title: '执行作业', status: application.status === 'completed' ? 'done' : application.status === 'in_progress' ? 'current' : 'pending', icon: Plane },
    { title: '完成验收', status: application.status === 'completed' ? 'done' : 'pending', icon: CheckCircle },
  ];

  const canApprovePlan = user && (user.role === 'supervisor' || user.role === 'admin') && application.status === 'planning' && workPlan;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} className="bg-dark-800 border-dark-600">
          返回
        </Button>
        <h2 className="text-xl font-bold text-white">植保申请详情</h2>
        <Tag color={statusMap[application.status].color} className="ml-auto">
          {statusMap[application.status].text}
        </Tag>
      </div>

      <div className="card-glow p-5">
        <h3 className="text-white font-semibold mb-4">处理进度</h3>
        <div className="flex items-center justify-between">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'done'
                      ? 'bg-primary-500 text-white'
                      : step.status === 'current'
                      ? 'bg-tech-500 text-white animate-pulse'
                      : 'bg-dark-700 text-dark-500'
                  }`}
                >
                  <step.icon size={18} />
                </div>
                <span className={`mt-2 text-xs ${step.status === 'done' ? 'text-primary-400' : step.status === 'current' ? 'text-tech-400' : 'text-dark-500'}`}>
                  {step.title}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 ${step.status === 'done' ? 'bg-primary-500' : 'bg-dark-700'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <MapPin size={18} className="text-primary-400" />
            申请信息
          </h3>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="申请编号">
              <span className="font-mono text-tech-400">{application.id}</span>
            </Descriptions.Item>
            <Descriptions.Item label="地块名称">{application.plotName}</Descriptions.Item>
            <Descriptions.Item label="所属区域">{application.region}</Descriptions.Item>
            <Descriptions.Item label="地块面积">
              <span className="font-mono">{application.plotArea} 亩</span>
            </Descriptions.Item>
            <Descriptions.Item label="农户">
              <span className="flex items-center gap-2">
                <User size={14} className="text-dark-400" />
                {application.farmerName}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="申请时间">{application.createdAt}</Descriptions.Item>
          </Descriptions>
        </div>

        <div className="card-glow p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Droplets size={18} className="text-primary-400" />
            作业需求
          </h3>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="作物类型">{application.cropType}</Descriptions.Item>
            <Descriptions.Item label="生育期">{application.cropStage}</Descriptions.Item>
            <Descriptions.Item label="病虫害类型">
              <Tag color="warning">{application.pestType}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="危害程度">
              <Tag color={application.pestLevel === 'severe' ? 'danger' : application.pestLevel === 'moderate' ? 'warning' : 'success'}>
                {{ mild: '轻度', moderate: '中度', severe: '重度' }[application.pestLevel]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="期望作业日期">
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-dark-400" />
                {application.expectedDate}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="需求描述">
              <div className="text-dark-300 text-sm">{application.requirement}</div>
            </Descriptions.Item>
          </Descriptions>
        </div>
      </div>

      {workPlan && (
        <>
          <Divider className="border-dark-700" />

          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plane size={18} className="text-tech-400" />
              智能作业方案
              <Tag color={workPlan.status === 'approved' ? 'success' : workPlan.status === 'rejected' ? 'error' : 'processing'} className="ml-2">
                {{ pending: '待审批', approved: '已通过', rejected: '已驳回' }[workPlan.status]}
              </Tag>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-dark-900 rounded-lg p-4">
                <div className="text-dark-400 text-sm mb-1">预计作业时间</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <Clock size={16} className="text-tech-400" />
                  {workPlan.scheduledDate}
                </div>
              </div>
              <div className="bg-dark-900 rounded-lg p-4">
                <div className="text-dark-400 text-sm mb-1">预计作业时长</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <Clock size={16} className="text-warning-400" />
                  {workPlan.estimatedDuration} 分钟
                </div>
              </div>
              <div className="bg-dark-900 rounded-lg p-4">
                <div className="text-dark-400 text-sm mb-1">预计作业面积</div>
                <div className="text-white font-medium flex items-center gap-2">
                  <MapPin size={16} className="text-primary-400" />
                  {workPlan.estimatedArea} 亩
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-dark-200 font-medium mb-3">资源分配</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-tech-500/20 flex items-center justify-center">
                      <Plane size={20} className="text-tech-400" />
                    </div>
                    <div>
                      <div className="text-dark-400 text-xs">作业无人机</div>
                      <div className="text-white font-medium">{workPlan.droneNames.join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <User size={20} className="text-primary-400" />
                    </div>
                    <div>
                      <div className="text-dark-400 text-xs">执飞飞手</div>
                      <div className="text-white font-medium">{workPlan.pilotNames.join(', ')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-dark-900 rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-warning-500/20 flex items-center justify-center">
                      <Droplets size={20} className="text-warning-400" />
                    </div>
                    <div>
                      <div className="text-dark-400 text-xs">飞行参数</div>
                      <div className="text-white font-medium text-sm">
                        高度 {workPlan.flightHeight}m · 流量 {workPlan.sprayVolume}L/亩
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-dark-200 font-medium mb-3">农药配方</h4>
                <div className="space-y-3">
                  {workPlan.formulas.map((formula, i) => (
                    <div key={i} className="p-3 bg-dark-900 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-medium">{formula.pesticideName}</span>
                        <span className="text-warning-400 font-mono">¥{formula.totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-400">用量</span>
                        <span className="text-dark-300 font-mono">
                          {formula.dosage} {formula.unit}/亩 × {workPlan.estimatedArea}亩
                        </span>
                      </div>
                      <Progress 
                        percent={Math.round(formula.totalAmount / Math.max(...workPlan.formulas.map(f => f.totalAmount)) * 100)} 
                        size="small"
                        showInfo={false}
                        strokeColor="#66BB6A"
                        className="mt-2"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/30 rounded-lg flex justify-between items-center">
                  <span className="text-primary-400 font-medium">预计总费用</span>
                  <span className="text-warning-400 text-xl font-bold font-mono">¥{workPlan.totalCost}</span>
                </div>
              </div>
            </div>

            {workPlan.supervisorOpinion && (
              <div className="mt-6 p-4 bg-dark-900 rounded-lg">
                <div className="text-dark-400 text-sm mb-1">主管审批意见</div>
                <div className="text-dark-200">{workPlan.supervisorOpinion}</div>
              </div>
            )}
          </div>
        </>
      )}

      {!workPlan && (
        <div className="card-glow p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-dark-800 flex items-center justify-center mx-auto mb-4">
            <Clock size={32} className="text-dark-500" />
          </div>
          <h3 className="text-dark-300 mb-2">系统正在制定作业方案</h3>
          <p className="text-dark-500 text-sm">请稍候，系统正在根据地块信息、病虫害类型和可用资源智能规划最优作业方案</p>
        </div>
      )}

      {canApprovePlan && (
        <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
          <Button danger icon={<XCircle size={16} />} onClick={() => setRejectModalOpen(true)}>
            驳回方案
          </Button>
          <Button type="primary" icon={<CheckCircle size={16} />} loading={approving} onClick={handleApprove}>
            审批通过
          </Button>
        </div>
      )}

      <Modal
        title="驳回方案"
        open={rejectModalOpen}
        onCancel={() => setRejectModalOpen(false)}
        footer={
          <div className="flex justify-end gap-3">
            <Button onClick={() => setRejectModalOpen(false)}>取消</Button>
            <Button danger onClick={handleReject}>确认驳回</Button>
          </div>
        }
      >
        <Form form={rejectForm} layout="vertical">
          <Form.Item
            label="驳回原因"
            name="reason"
            rules={[{ required: true, message: '请输入驳回原因' }]}
          >
            <TextArea rows={4} placeholder="请详细说明驳回原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ApplicationDetail;
