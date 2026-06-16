import { useState, useEffect } from 'react';
import { Leaf, Droplets, Mountain, AlertTriangle, MapPin, Activity, Lock, Unlock } from 'lucide-react';
import { Select, Tabs, Card, Progress, Tag, Table, Button, message } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';
import { waterStandards, soilStandards } from '../../mock/environment';
import type { EnvironmentMonitor, EnvStatus } from '../../types/environment';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';
import { useNavigate } from 'react-router-dom';

const statusMap: Record<EnvStatus, { text: string; color: string; dot: string }> = {
  normal: { text: '正常', color: 'success', dot: 'bg-primary-500' },
  warning: { text: '预警', color: 'warning', dot: 'bg-warning-500' },
  exceeded: { text: '超标', color: 'error', dot: 'bg-danger-500 animate-pulse' },
};

const Environment = () => {
  const navigate = useNavigate();
  const { monitors, alerts, lockedPlots, isPlotLocked, lockPlot, unlockPlot, processAlert } = useEnvironmentStore();
  const [region, setRegion] = useState('all');
  const [monitorData, setMonitorData] = useState<EnvironmentMonitor[]>([]);

  useEffect(() => {
    setMonitorData(monitors);
  }, [monitors]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMonitorData((prev) =>
        prev.map((m) => ({
          ...m,
          monitorTime: new Date().toLocaleString('zh-CN'),
          waterQuality: {
            ...m.waterQuality,
            pesticideResidue: Math.max(0, Math.round((m.waterQuality.pesticideResidue + (Math.random() - 0.5) * 0.02) * 1000) / 1000),
          },
          soilQuality: {
            ...m.soilQuality,
            pesticideResidue: Math.max(0, Math.round((m.soilQuality.pesticideResidue + (Math.random() - 0.5) * 0.02) * 1000) / 1000),
          },
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = monitorData.filter((m) => region === 'all' || m.region === region);

  const normalCount = monitorData.filter((m) => m.status === 'normal').length;
  const warningCount = monitorData.filter((m) => m.status === 'warning').length;
  const exceededCount = monitorData.filter((m) => m.status === 'exceeded').length;
  const lockedCount = lockedPlots.length;

  const handleLockPlot = (monitor: EnvironmentMonitor) => {
    const alertForPlot = alerts.find((a) => a.plotId === monitor.plotId && a.status !== 'resolved');
    if (alertForPlot) {
      processAlert(alertForPlot.id);
    }
    const success = lockPlot(monitor.plotId, `环保监测数据超标：${monitor.status === 'exceeded' ? '水质或土壤指标超标' : '接近临界值'}`);
    if (success) {
      message.success(`地块「${monitor.plotName}」已锁定，作业已暂停`);
    } else {
      message.warning('该地块已处于锁定状态');
    }
  };

  const handleUnlockPlot = (monitor: EnvironmentMonitor) => {
    const success = unlockPlot(monitor.plotId);
    if (success) {
      message.success(`地块「${monitor.plotName}」已解锁`);
    } else {
      message.error('存在未完成的整改工单，无法解锁');
    }
  };

  const trendOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 35, 41, 0.9)',
      borderColor: '#455A64',
      textStyle: { color: '#ECEFF1' },
    },
    legend: {
      data: ['农药残留(水)', '农药残留(土壤)'],
      textStyle: { color: '#B0BEC5' },
      top: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['0时', '4时', '8时', '12时', '16时', '20时', '现在'],
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C' },
    },
    yAxis: {
      type: 'value',
      name: 'mg/L',
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C' },
      splitLine: { lineStyle: { color: '#37474F' } },
    },
    series: [
      {
        name: '农药残留(水)',
        type: 'line',
        smooth: true,
        data: [0.02, 0.03, 0.05, 0.08, 0.12, 0.1, 0.08],
        lineStyle: { color: '#03A9F4', width: 2 },
        itemStyle: { color: '#03A9F4' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(3, 169, 244, 0.3)' },
              { offset: 1, color: 'rgba(3, 169, 244, 0)' },
            ],
          },
        },
      },
      {
        name: '农药残留(土壤)',
        type: 'line',
        smooth: true,
        data: [0.03, 0.04, 0.06, 0.09, 0.15, 0.12, 0.1],
        lineStyle: { color: '#8BC34A', width: 2 },
        itemStyle: { color: '#8BC34A' },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(139, 195, 74, 0.3)' },
              { offset: 1, color: 'rgba(139, 195, 74, 0)' },
            ],
          },
        },
      },
    ],
  };

  const columns: ColumnsType<EnvironmentMonitor> = [
    {
      title: '监测点',
      dataIndex: 'plotName',
      key: 'plotName',
      render: (text, record) => {
        const isLocked = isPlotLocked(record.plotId);
        return (
          <div className="flex items-center gap-2">
            <span className="text-dark-100">{text}</span>
            {isLocked && <Tag color="error" icon={<Lock size={10} />}>已锁定</Tag>}
          </div>
        );
      },
    },
    {
      title: '区域',
      dataIndex: 'region',
      key: 'region',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (s: EnvStatus) => (
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusMap[s].dot}`} />
          <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag>
        </div>
      ),
    },
    {
      title: '水质农药残留',
      key: 'water',
      width: 180,
      render: (_, record) => {
        const value = record.waterQuality.pesticideResidue;
        const max = waterStandards.pesticideResidue.max;
        const percent = Math.min(100, (value / max) * 100);
        const isExceeded = value > max;
        return (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className={isExceeded ? 'text-danger-400' : 'text-dark-300'}>{value} mg/L</span>
              <span className="text-dark-500">≤ {max}</span>
            </div>
            <Progress 
              percent={percent} 
              showInfo={false} 
              size="small" 
              strokeColor={isExceeded ? '#ef4444' : '#66BB6A'}
              trailColor="#37474F"
            />
          </div>
        );
      },
    },
    {
      title: '土壤农药残留',
      key: 'soil',
      width: 180,
      render: (_, record) => {
        const value = record.soilQuality.pesticideResidue;
        const max = soilStandards.pesticideResidue.max;
        const percent = Math.min(100, (value / max) * 100);
        const isExceeded = value > max;
        return (
          <div className="w-full">
            <div className="flex justify-between text-xs mb-1">
              <span className={isExceeded ? 'text-danger-400' : 'text-dark-300'}>{value} mg/kg</span>
              <span className="text-dark-500">≤ {max}</span>
            </div>
            <Progress 
              percent={percent} 
              showInfo={false} 
              size="small" 
              strokeColor={isExceeded ? '#ef4444' : '#8BC34A'}
              trailColor="#37474F"
            />
          </div>
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'monitorTime',
      key: 'monitorTime',
      width: 160,
      render: (v) => <span className="text-xs text-dark-400">{v}</span>,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => {
        const isLocked = isPlotLocked(record.plotId);
        return (
          <>
            {isLocked ? (
              <Button 
                type="link" 
                size="small" 
                icon={<Unlock size={14} />}
                onClick={() => handleUnlockPlot(record)}
                className="text-primary-400"
              >
                解锁
              </Button>
            ) : (
              <Button 
                type="link" 
                size="small" 
                icon={<Lock size={14} />}
                onClick={() => handleLockPlot(record)}
                className="text-danger-400"
              >
                锁定
              </Button>
            )}
          </>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">环保监测</h2>
        <div className="flex items-center gap-4">
          <Select
            value={region}
            onChange={setRegion}
            style={{ width: 150 }}
            options={[
              { value: 'all', label: '全部区域' },
              { value: '华东区', label: '华东区' },
              { value: '华北区', label: '华北区' },
              { value: '华南区', label: '华南区' },
              { value: '西南区', label: '西南区' },
              { value: '西北区', label: '西北区' },
            ]}
          />
          <Button 
            type="primary" 
            icon={<AlertTriangle size={16} />}
            onClick={() => navigate('/environment/alerts')}
          >
            告警管理
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary-500/20 flex items-center justify-center">
              <Leaf size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{normalCount}</div>
              <div className="text-dark-400 text-sm">正常监测点</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning-500/20 flex items-center justify-center">
              <AlertTriangle size={24} className="text-warning-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{warningCount}</div>
              <div className="text-dark-400 text-sm">预警监测点</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-danger-500/20 flex items-center justify-center">
              <Activity size={24} className="text-danger-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{exceededCount}</div>
              <div className="text-dark-400 text-sm">超标监测点</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-tech-500/20 flex items-center justify-center">
              <Lock size={24} className="text-tech-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{lockedCount}</div>
              <div className="text-dark-400 text-sm">已锁定地块</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow p-5">
          <h3 className="text-white font-semibold mb-4">农药残留趋势</h3>
          <ReactECharts option={trendOption} style={{ height: 300 }} />
        </div>
        <div className="card-glow p-5">
          <h3 className="text-white font-semibold mb-4">指标详情</h3>
          <Tabs
            defaultActiveKey="water"
            items={[
              {
                key: 'water',
                label: (
                  <span className="flex items-center gap-2">
                    <Droplets size={16} className="text-tech-400" />
                    水质指标
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    {filteredData[0] && (
                      <>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">pH值</span>
                            <span className="text-white font-mono">{filteredData[0].waterQuality.ph}</span>
                          </div>
                          <Progress percent={((filteredData[0].waterQuality.ph - 6.5) / 2) * 100} showInfo={false} strokeColor="#66BB6A" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">溶解氧</span>
                            <span className="text-white font-mono">{filteredData[0].waterQuality.dissolvedOxygen} mg/L</span>
                          </div>
                          <Progress percent={(filteredData[0].waterQuality.dissolvedOxygen / 10) * 100} showInfo={false} strokeColor="#03A9F4" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">农药残留</span>
                            <span className={`font-mono ${filteredData[0].waterQuality.pesticideResidue > 0.1 ? 'text-danger-400' : 'text-white'}`}>
                              {filteredData[0].waterQuality.pesticideResidue} mg/L
                            </span>
                          </div>
                          <Progress 
                            percent={Math.min(100, (filteredData[0].waterQuality.pesticideResidue / 0.1) * 100)} 
                            showInfo={false} 
                            strokeColor={filteredData[0].waterQuality.pesticideResidue > 0.1 ? '#ef4444' : '#8BC34A'} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">亚硝酸盐</span>
                            <span className="text-white font-mono">{filteredData[0].waterQuality.nitrite} mg/L</span>
                          </div>
                          <Progress percent={(filteredData[0].waterQuality.nitrite / 0.2) * 100} showInfo={false} strokeColor="#FF9800" />
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
              {
                key: 'soil',
                label: (
                  <span className="flex items-center gap-2">
                    <Mountain size={16} className="text-primary-400" />
                    土壤指标
                  </span>
                ),
                children: (
                  <div className="space-y-4">
                    {filteredData[0] && (
                      <>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">pH值</span>
                            <span className="text-white font-mono">{filteredData[0].soilQuality.ph}</span>
                          </div>
                          <Progress percent={((filteredData[0].soilQuality.ph - 5.5) / 2.5) * 100} showInfo={false} strokeColor="#8BC34A" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">有机质</span>
                            <span className="text-white font-mono">{filteredData[0].soilQuality.organicMatter} g/kg</span>
                          </div>
                          <Progress percent={(filteredData[0].soilQuality.organicMatter / 40) * 100} showInfo={false} strokeColor="#66BB6A" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">农药残留</span>
                            <span className={`font-mono ${filteredData[0].soilQuality.pesticideResidue > 0.1 ? 'text-danger-400' : 'text-white'}`}>
                              {filteredData[0].soilQuality.pesticideResidue} mg/kg
                            </span>
                          </div>
                          <Progress 
                            percent={Math.min(100, (filteredData[0].soilQuality.pesticideResidue / 0.1) * 100)} 
                            showInfo={false} 
                            strokeColor={filteredData[0].soilQuality.pesticideResidue > 0.1 ? '#ef4444' : '#8BC34A'} 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-dark-300">重金属</span>
                            <span className={`font-mono ${filteredData[0].soilQuality.heavyMetals > 0.3 ? 'text-danger-400' : 'text-white'}`}>
                              {filteredData[0].soilQuality.heavyMetals} mg/kg
                            </span>
                          </div>
                          <Progress 
                            percent={Math.min(100, (filteredData[0].soilQuality.heavyMetals / 0.3) * 100)} 
                            showInfo={false} 
                            strokeColor={filteredData[0].soilQuality.heavyMetals > 0.3 ? '#ef4444' : '#FF9800'} 
                          />
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      </div>

      <div className="card-glow p-5">
        <h3 className="text-white font-semibold mb-4">监测点列表</h3>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{ pageSize: 6 }}
        />
      </div>
    </div>
  );
};

export default Environment;
