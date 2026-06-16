import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plane, Battery, Droplets, MapPin, AlertTriangle, Search } from 'lucide-react';
import { Input, Select, Tabs, Table, Tag, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { mockDrones, mockDroneAlerts } from '../../mock/drones';
import type { Drone, DroneStatus } from '../../types/drone';

const statusMap: Record<DroneStatus, { text: string; color: string; dot: string }> = {
  idle: { text: '待命', color: 'success', dot: 'bg-primary-500' },
  in_task: { text: '作业中', color: 'processing', dot: 'bg-tech-500 animate-pulse' },
  charging: { text: '充电中', color: 'warning', dot: 'bg-warning-500' },
  maintenance: { text: '维护中', color: 'default', dot: 'bg-dark-400' },
  offline: { text: '离线', color: 'error', dot: 'bg-danger-500' },
};

const Drones = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [drones, setDrones] = useState(mockDrones);

  useEffect(() => {
    const interval = setInterval(() => {
      setDrones((prev) =>
        prev.map((d) => ({
          ...d,
          battery:
            d.status === 'in_task'
              ? Math.max(10, d.battery - Math.random() * 2)
              : d.status === 'charging'
              ? Math.min(100, d.battery + Math.random() * 3)
              : d.battery,
          currentLiquid:
            d.status === 'in_task'
              ? Math.max(0, d.currentLiquid - Math.random() * 0.5)
              : d.currentLiquid,
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredDrones = drones.filter((d) => {
    if (keyword && !d.name.includes(keyword)) return false;
    if (status !== 'all' && d.status !== status) return false;
    return true;
  });

  const activeCount = drones.filter((d) => d.status === 'in_task').length;
  const idleCount = drones.filter((d) => d.status === 'idle').length;
  const alertCount = mockDroneAlerts.filter((a) => !a.resolved).length;

  const columns: ColumnsType<Drone> = [
    {
      title: '无人机编号',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <a onClick={() => navigate(`/drones/${record.id}`)} className="text-dark-100 hover:text-primary-400">
          {name}
        </a>
      ),
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: DroneStatus) => (
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusMap[s].dot}`} />
          <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag>
        </span>
      ),
    },
    {
      title: '电量',
      dataIndex: 'battery',
      key: 'battery',
      render: (v: number) => (
        <div className="flex items-center gap-2">
          <Battery
            size={16}
            className={v < 30 ? 'text-danger-500' : v < 60 ? 'text-warning-500' : 'text-primary-500'}
          />
          <span className={`font-mono ${v < 30 ? 'text-danger-400' : v < 60 ? 'text-warning-400' : 'text-primary-400'}`}>
            {v.toFixed(0)}%
          </span>
        </div>
      ),
    },
    {
      title: '药液余量',
      dataIndex: 'currentLiquid',
      key: 'currentLiquid',
      render: (v: number, record) => (
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-tech-400" />
          <span className="font-mono text-dark-200">
            {v.toFixed(1)} / {record.tankCapacity} L
          </span>
        </div>
      ),
    },
    {
      title: '飞手',
      dataIndex: 'pilotName',
      key: 'pilotName',
      render: (v) => v || '未分配',
    },
    {
      title: '当前任务',
      dataIndex: 'currentPlotName',
      key: 'currentPlotName',
      render: (v) => v || '-',
    },
    {
      title: '所属区域',
      dataIndex: 'region',
      key: 'region',
    },
  ];

  const tabItems = [
    {
      key: 'list',
      label: '全部无人机',
      children: (
        <Table
          columns={columns}
          dataSource={filteredDrones}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: 'alerts',
      label: (
        <span className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-warning-500" />
          告警中心
          {alertCount > 0 && <Badge count={alertCount} size="small" />}
        </span>
      ),
      children: (
        <div className="space-y-3">
          {mockDroneAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.resolved
                  ? 'bg-dark-900/50 border-dark-700'
                  : alert.level === 'danger'
                  ? 'bg-danger-500/10 border-danger-500/30'
                  : 'bg-warning-500/10 border-warning-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    size={18}
                    className={alert.level === 'danger' ? 'text-danger-500' : 'text-warning-500'}
                  />
                  <span className="text-white font-medium">{alert.droneName}</span>
                  <Tag color={alert.level === 'danger' ? 'error' : 'warning'}>
                    {{
                      route_deviation: '航线偏移',
                      low_liquid: '药液不足',
                      low_battery: '电量低',
                      equipment_fault: '设备故障',
                    }[alert.type]}
                  </Tag>
                </div>
                <span className="text-dark-400 text-xs">{alert.timestamp}</span>
              </div>
              <p className="text-dark-300 text-sm">{alert.message}</p>
              {!alert.resolved && (
                <div className="mt-3 flex justify-end">
                  <a className="text-tech-400 text-sm hover:text-tech-300">处理告警 →</a>
                </div>
              )}
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Plane size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{drones.length}</div>
              <div className="text-dark-400 text-sm">无人机总数</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-tech-500/20 rounded-lg flex items-center justify-center">
              <Plane size={24} className="text-tech-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{activeCount}</div>
              <div className="text-dark-400 text-sm">作业中</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center">
              <Plane size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{idleCount}</div>
              <div className="text-dark-400 text-sm">待命中</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-warning-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-warning-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{alertCount}</div>
              <div className="text-dark-400 text-sm">待处理告警</div>
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
                placeholder="搜索无人机"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                style={{ width: 200 }}
                allowClear
              />
            </div>
            <Select
              value={status}
              onChange={setStatus}
              style={{ width: 140 }}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'idle', label: '待命' },
                { value: 'in_task', label: '作业中' },
                { value: 'charging', label: '充电中' },
                { value: 'maintenance', label: '维护中' },
                { value: 'offline', label: '离线' },
              ]}
            />
          </div>
        </div>

        <Tabs items={tabItems} defaultActiveKey="list" />
      </div>
    </div>
  );
};

export default Drones;
