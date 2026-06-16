import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plane,
  Battery,
  Droplets,
  MapPin,
  Activity,
  Thermometer,
  Gauge,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { Button, Card, Descriptions, Progress, Tabs } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useDroneStore } from '../../store/useDroneStore';
import { useApplicationStore } from '../../store/useApplicationStore';

const DroneDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { drones, getDroneById, refreshDroneData } = useDroneStore();
  const { applications } = useApplicationStore();
  const drone = getDroneById(id || '');
  const [isPlaying, setIsPlaying] = useState(false);
  const [droneState, setDroneState] = useState(drone);

  useEffect(() => {
    const currentDrone = getDroneById(id || '');
    setDroneState(currentDrone);
  }, [id, drones, getDroneById]);

  useEffect(() => {
    if (!isPlaying || drone?.status !== 'in_task') return;
    const interval = setInterval(() => {
      refreshDroneData();
      setDroneState(getDroneById(id || ''));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, drone?.status, id, refreshDroneData, getDroneById]);

  if (!drone) {
    return <div className="text-dark-400">无人机不存在</div>;
  }

  const currentTask = applications.find((a) => 
    a.status === 'in_progress' && a.workPlan?.droneIds?.includes(drone.id)
  );

  const flightPathOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item' },
    xAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 500,
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 300,
    },
    series: [
      {
        type: 'line',
        data: Array.from({ length: 30 }, (_, i) => [
          50 + i * 15 + Math.sin(i * 0.5) * 20,
          150 + Math.cos(i * 0.3) * 50,
        ]),
        smooth: true,
        lineStyle: { color: '#4CAF50', width: 2 },
        itemStyle: { color: '#4CAF50' },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(76, 175, 80, 0.3)' },
              { offset: 1, color: 'rgba(76, 175, 80, 0.02)' },
            ],
          },
        },
      },
      {
        type: 'scatter',
        data: [[200, 150]],
        symbolSize: 15,
        itemStyle: {
          color: '#03A9F4',
          shadowBlur: 10,
          shadowColor: '#03A9F4',
        },
      },
    ],
  };

  const batteryGaugeOption = {
    series: [
      {
        type: 'gauge',
        radius: '80%',
        startAngle: 200,
        endAngle: -20,
        min: 0,
        max: 100,
        splitNumber: 10,
        itemStyle: {
          color: droneState?.battery && droneState.battery < 30 ? '#F44336' : droneState?.battery && droneState.battery < 60 ? '#FF9800' : '#4CAF50',
        },
        progress: { show: true, width: 12 },
        pointer: { show: false },
        axisLine: { lineStyle: { width: 12, color: [[1, '#37474F']] } },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        title: { show: false },
        detail: {
          valueAnimation: true,
          formatter: '{value}%',
          fontSize: 20,
          color: '#ECEFF1',
          offsetCenter: [0, '20%'],
        },
        data: [{ value: droneState?.battery?.toFixed(0) || 0 }],
      },
    ],
  };

  const statusMap = {
    idle: { text: '待命', color: 'success' },
    in_task: { text: '作业中', color: 'processing' },
    charging: { text: '充电中', color: 'warning' },
    maintenance: { text: '维护中', color: 'default' },
    offline: { text: '离线', color: 'error' },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} className="bg-dark-800 border-dark-600">
          返回
        </Button>
        <h2 className="text-xl font-bold text-white">{drone.name} - 实时监控</h2>
        <span className={`px-3 py-1 rounded text-sm bg-${statusMap[drone.status].color}-500/20 text-${statusMap[drone.status].color}-400`}>
          {statusMap[drone.status as keyof typeof statusMap].text}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="card-glow p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <MapPin size={18} className="text-primary-400" />
                飞行轨迹
              </h3>
              <div className="flex items-center gap-2">
                {drone.status === 'in_task' && (
                  <>
                    <Button
                      size="small"
                      icon={isPlaying ? <Pause size={14} /> : <Play size={14} />}
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? '暂停' : '播放'}
                    </Button>
                    <Button size="small" icon={<RotateCcw size={14} />}>
                      重置
                    </Button>
                  </>
                )}
              </div>
            </div>
            <ReactECharts option={flightPathOption} style={{ height: '300px' }} opts={{ renderer: 'svg' }} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card-glow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Battery size={16} className="text-primary-400" />
                <span className="text-dark-400 text-sm">电池电量</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {droneState?.battery?.toFixed(1)}%
              </div>
              <Progress
                percent={droneState?.battery || 0}
                size="small"
                strokeColor={droneState?.battery && droneState.battery < 30 ? '#F44336' : '#4CAF50'}
                showInfo={false}
                className="mt-2"
              />
            </div>
            <div className="card-glow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets size={16} className="text-tech-400" />
                <span className="text-dark-400 text-sm">药液余量</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">
                {droneState?.currentLiquid?.toFixed(1)} L
              </div>
              <Progress
                percent={((droneState?.currentLiquid || 0) / drone.tankCapacity) * 100}
                size="small"
                strokeColor="#03A9F4"
                showInfo={false}
                className="mt-2"
              />
            </div>
            <div className="card-glow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={16} className="text-warning-400" />
                <span className="text-dark-400 text-sm">飞行速度</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">8.5 m/s</div>
            </div>
            <div className="card-glow p-4">
              <div className="flex items-center gap-2 mb-2">
                <Gauge size={16} className="text-purple-400" />
                <span className="text-dark-400 text-sm">飞行高度</span>
              </div>
              <div className="text-2xl font-bold text-white font-mono">3.0 m</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Plane size={18} className="text-tech-400" />
              无人机信息
            </h3>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="编号">{drone.name}</Descriptions.Item>
              <Descriptions.Item label="型号">{drone.model}</Descriptions.Item>
              <Descriptions.Item label="载重">{drone.maxPayload} kg</Descriptions.Item>
              <Descriptions.Item label="续航">{drone.flightRange} km</Descriptions.Item>
              <Descriptions.Item label="喷洒速率">{drone.sprayRate} L/min</Descriptions.Item>
              <Descriptions.Item label="药箱容量">{drone.tankCapacity} L</Descriptions.Item>
              <Descriptions.Item label="所属区域">{drone.region}</Descriptions.Item>
              <Descriptions.Item label="上次维护">{drone.lastMaintenanceDate}</Descriptions.Item>
            </Descriptions>
          </div>

          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Battery size={18} className="text-primary-400" />
              电量监测
            </h3>
            <ReactECharts option={batteryGaugeOption} style={{ height: '150px' }} opts={{ renderer: 'svg' }} />
          </div>

          {currentTask && (
            <div className="card-glow p-5">
              <h3 className="text-white font-semibold mb-3">当前任务</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">地块</span>
                  <span className="text-dark-100">{currentTask.plotName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">作物</span>
                  <span className="text-dark-100">{currentTask.cropType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">面积</span>
                  <span className="text-dark-100">{currentTask.plotArea} 亩</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">飞手</span>
                  <span className="text-dark-100">{drone.pilotName}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DroneDetail;
