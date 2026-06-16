import { useState } from 'react';
import { Settings, ShieldCheck, Clock, Plane, AlertTriangle } from 'lucide-react';
import { Card, Form, InputNumber, Switch, Button, message, Tabs, Divider } from 'antd';

const SystemSettings = () => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      message.success('设置保存成功');
    }, 1000);
  };

  const tabItems = [
    {
      key: 'dispatch',
      label: (
        <span className="flex items-center gap-2">
          <Plane size={16} className="text-tech-400" />
          调度规则
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card title="无人机调度设置" className="bg-transparent border-dark-700">
            <Form form={form} layout="vertical" initialValues={{
              maxTaskPerDay: 8,
              minBatteryForTask: 30,
              autoDispatch: true,
              backupDroneEnabled: true,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item label="单架无人机每日最大任务数">
                  <InputNumber min={1} max={20} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="执行任务最低电量(%)">
                  <InputNumber min={10} max={90} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="自动调度无人机" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="异常自动调度备用机" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </div>
            </Form>
          </Card>

          <Card title="航线规划设置" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              defaultHeight: 3,
              defaultSpeed: 8,
              routeOverlap: 10,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item label="默认飞行高度(m)">
                  <InputNumber min={1} max={10} step={0.5} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="默认飞行速度(m/s)">
                  <InputNumber min={1} max={15} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="航线重叠率(%)">
                  <InputNumber min={0} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'approval',
      label: (
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-primary-400" />
          审批阈值
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card title="农药出库审批设置" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              outboundLevel1: true,
              outboundLevel2: true,
              outboundEscalateHours: 24,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item label="第一级审批(植保主管)" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="第二级审批(环保部门)" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="自动越级时间(小时)">
                  <InputNumber min={1} max={72} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </Form>
          </Card>

          <Card title="采购审批设置" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              purchaseLevel1: true,
              purchaseLevel2: true,
              purchaseLevel3: true,
              purchaseEscalateHours: 48,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Form.Item label="第一级(采购员)" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="第二级(植保主管)" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="第三级(总经理)" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="自动升级时间(小时)">
                  <InputNumber min={1} max={168} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </Form>
          </Card>

          <Card title="金额阈值设置" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              supervisorApprovalLimit: 5000,
              gmApprovalLimit: 50000,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item label="主管审批金额上限(元)">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="总经理审批金额上限(元)">
                  <InputNumber min={0} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'alert',
      label: (
        <span className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-warning-400" />
          告警阈值
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card title="无人机告警设置" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              lowBatteryWarning: 30,
              lowBatteryDanger: 15,
              lowLiquidWarning: 30,
              lowLiquidDanger: 10,
              routeDeviation: 5,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item label="低电量预警(%)">
                  <InputNumber min={10} max={80} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="低电量告警(%)">
                  <InputNumber min={5} max={50} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="航线偏移告警(米)">
                  <InputNumber min={1} max={50} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="低药液预警(%)">
                  <InputNumber min={10} max={80} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="低药液告警(%)">
                  <InputNumber min={5} max={50} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </Form>
          </Card>

          <Card title="环保告警阈值" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              waterPesticideWarning: 0.05,
              waterPesticideDanger: 0.1,
              soilPesticideWarning: 0.05,
              soilPesticideDanger: 0.1,
              autoLockPlot: true,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Form.Item label="水质农药残留预警(mg/L)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="水质农药残留超标(mg/L)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="土壤农药残留预警(mg/kg)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="土壤农药残留超标(mg/kg)">
                  <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
                </Form.Item>
              </div>
              <Divider className="border-dark-700" />
              <Form.Item label="超标自动锁定地块" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      key: 'system',
      label: (
        <span className="flex items-center gap-2">
          <Settings size={16} className="text-dark-400" />
          系统设置
        </span>
      ),
      children: (
        <div className="space-y-6">
          <Card title="数据刷新设置" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              dashboardRefreshInterval: 5,
              droneRefreshInterval: 1,
              envRefreshInterval: 10,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item label="首页大屏刷新间隔(秒)">
                  <InputNumber min={1} max={60} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="无人机数据刷新间隔(秒)">
                  <InputNumber min={1} max={30} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item label="环保数据刷新间隔(秒)">
                  <InputNumber min={5} max={120} style={{ width: '100%' }} />
                </Form.Item>
              </div>
            </Form>
          </Card>

          <Card title="通知设置" className="bg-transparent border-dark-700">
            <Form layout="vertical" initialValues={{
              emailNotification: true,
              smsNotification: false,
              soundAlert: true,
            }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Form.Item label="邮件通知" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="短信通知" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item label="声音告警" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="text-primary-400" size={24} />
          系统设置
        </h2>
        <Button type="primary" loading={saving} onClick={handleSave}>
          保存设置
        </Button>
      </div>

      <div className="card-glow p-5">
        <Tabs items={tabItems} defaultActiveKey="dispatch" />
      </div>
    </div>
  );
};

export default SystemSettings;
