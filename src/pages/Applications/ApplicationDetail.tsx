import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Plane, Package, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button, Descriptions, Tag, Space, Divider, Card, List, Progress, message } from 'antd';
import { mockApplications } from '../../mock/applications';
import { mockDrones } from '../../mock/drones';
import { useAuthStore } from '../../store/useAuthStore';

const ApplicationDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [approving, setApproving] = useState(false);

  const application = mockApplications.find((a) => a.id === id);

  if (!application) {
    return <div className="text-dark-400">申请不存在</div>;
  }

  const workPlan = application.workPlan;
  const assignedDrones = mockDrones.filter((d) => workPlan?.droneIds.includes(d.id));

  const statusMap = {
    pending: { text: '待处理', color: 'warning' },
    planning: { text: '方案制定中', color: 'processing' },
    approved: { text: '已审批', color: 'success' },
    rejected: { text: '已驳回', color: 'error' },
    in_progress: { text: '作业中', color: 'processing' },
    completed: { text: '已完成', color: 'success' },
  };

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => {
      setApproving(false);
      message.success('方案审批通过');
      navigate('/applications');
    }, 1000);
  };

  const handleReject = () => {
    message.warning('请填写驳回原因');
  };

  const steps = [
    { title: '提交申请', status: 'done', icon: FileText },
    { title: '制定方案', status: application.status !== 'pending' ? 'done' : 'current', icon: Package },
    { title: '方案审批', status: ['approved', 'in_progress', 'completed'].includes(application.status) ? 'done' : 'pending', icon: CheckCircle },
    { title: '农药出库', status: ['in_progress', 'completed'].includes(application.status) ? 'done' : 'pending', icon: Package },
    { title: '执行作业', status: application.status === 'completed' ? 'done' : application.status === 'in_progress' ? 'current' : 'pending', icon: Plane },
    { title: '完成验收', status: application.status === 'completed' ? 'done' : 'pending', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} className="bg-dark-800 border-dark-600">
          返回
        </Button>
        <h2 className="text-xl font-bold text-white">植保申请详情</h2>
        <Tag color={statusMap[application.status as keyof typeof statusMap].color} className="ml-auto">
          {statusMap[application.status as keyof typeof statusMap].text}
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
          <h3 className="text-white font-semibold mb-4">申请信息</h3>
          <Descriptions column={1} size="small">
            <Descriptions.Item label="申请编号">
              <span className="font-mono text-tech-400">{application.id}</span>
            </Descriptions.Item>
            <Descriptions.Item label="地块名称">{application.plotName}</Descriptions.Item>
            <Descriptions.Item label="所属区域">{application.region}</Descriptions.Item>
            <Descriptions.Item label="农户">{application.farmerName}</Descriptions.Item>
            <Descriptions.Item label="作物类型">{application.cropType}</Descriptions.Item>
            <Descriptions.Item label="作物生育期">{application.cropStage}</Descriptions.Item>
            <Descriptions.Item label="地块面积">{application.plotArea} 亩</Descriptions.Item>
            <Descriptions.Item label="病虫害类型">{application.pestType}</Descriptions.Item>
            <Descriptions.Item label="虫害等级">
              <Tag color={application.pestLevel === 'severe' ? 'error' : application.pestLevel === 'moderate' ? 'warning' : 'success'}>
                {{ mild: '轻度', moderate: '中度', severe: '重度' }[application.pestLevel]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="植保需求">{application.requirement}</Descriptions.Item>
            <Descriptions.Item label="期望作业日期">{application.expectedDate}</Descriptions.Item>
            <Descriptions.Item label="申请时间">{application.createdAt}</Descriptions.Item>
          </Descriptions>
        </div>

        <div className="card-glow p-5">
          <h3 className="text-white font-semibold mb-4">推荐作业方案</h3>
          {workPlan ? (
            <div className="space-y-4">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="方案编号">
                  <span className="font-mono text-tech-400">{workPlan.id}</span>
                </Descriptions.Item>
                <Descriptions.Item label="预计作业时间">{workPlan.estimatedDuration} 分钟</Descriptions.Item>
                <Descriptions.Item label="预计作业面积">{workPlan.estimatedArea} 亩</Descriptions.Item>
                <Descriptions.Item label="飞行高度">{workPlan.flightHeight} 米</Descriptions.Item>
                <Descriptions.Item label="喷洒量">{workPlan.sprayVolume} 升/亩</Descriptions.Item>
              </Descriptions>

              <Divider className="my-2 border-dark-700" />

              <div>
                <h4 className="text-dark-200 text-sm font-medium mb-2">分配无人机</h4>
                <div className="space-y-2">
                  {assignedDrones.map((drone) => (
                    <div key={drone.id} className="flex items-center justify-between p-2 bg-dark-950 rounded">
                      <div className="flex items-center gap-2">
                        <Plane size={16} className="text-tech-400" />
                        <span className="text-dark-100">{drone.name}</span>
                        <span className="text-dark-500 text-xs">{drone.model}</span>
                      </div>
                      <span className="text-dark-400 text-xs">飞手：{drone.pilotName || '未分配'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Divider className="my-2 border-dark-700" />

              <div>
                <h4 className="text-dark-200 text-sm font-medium mb-2">农药配方</h4>
                <div className="space-y-2">
                  {workPlan.formulas.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-dark-950 rounded">
                      <span className="text-dark-100">{f.pesticideName}</span>
                      <div className="text-right">
                        <span className="text-dark-300 text-sm">
                          {f.dosage} {f.unit}/亩 × {application.plotArea}亩 ={' '}
                        </span>
                        <span className="text-white font-mono">{f.totalAmount} {f.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Divider className="my-2 border-dark-700" />

              <div className="flex justify-between items-center">
                <span className="text-dark-400">预计总费用</span>
                <span className="text-2xl font-bold text-primary-400 font-mono">¥{workPlan.totalCost}</span>
              </div>

              {workPlan.supervisorOpinion && (
                <div className="p-3 bg-dark-950 rounded">
                  <span className="text-dark-400 text-xs">主管意见：</span>
                  <span className="text-dark-200 text-sm ml-2">{workPlan.supervisorOpinion}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-dark-500">
              <Clock size={40} className="mx-auto mb-2 opacity-50" />
              <p>方案正在制定中，请稍候...</p>
            </div>
          )}
        </div>
      </div>

      {user?.role === 'supervisor' && application.status === 'planning' && workPlan && (
        <div className="card-glow p-5 flex justify-end gap-3">
          <Button icon={<XCircle size={16} />} danger onClick={handleReject}>
            驳回方案
          </Button>
          <Button type="primary" icon={<CheckCircle size={16} />} loading={approving} onClick={handleApprove}>
            审批通过
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApplicationDetail;
