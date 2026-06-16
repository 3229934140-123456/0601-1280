import { useState, useEffect } from 'react';
import { Leaf, Droplets, Mountain, AlertTriangle, MapPin, Activity } from 'lucide-react';
import { Select, Tabs, Card, Progress, Tag, Table, Button } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { ColumnsType } from 'antd/es/table';
import { mockEnvMonitors, mockEnvAlerts, waterStandards, soilStandards } from '../../mock/environment';
import type { EnvironmentMonitor, EnvStatus } from '../../types/environment';
import { useNavigate } from 'react-router-dom';

const statusMap: Record<EnvStatus, { text: string; color: string; dot: string }> = {
  normal: { text: '正常', color: 'success', dot: 'bg-primary-500' },
  warning: { text: '预警', color: 'warning', dot: 'bg-warning-500' },
  exceeded: { text: '超标', color: 'error', dot: 'bg-danger-500 animate-pulse' },
};

const Environment = () => {
  const navigate = useNavigate();
  const [region, setRegion] = useState('all');
  const [monitors, setMonitors] = useState(mockEnvMonitors);

  useEffect(() => {
    const interval = setInterval(() => {
      setMonitors((prev) =>
        prev.map((m) => ({
          ...m,
          monitorTime: new Date().toLocaleString('zh-CN'),
          waterQuality: {
            ...m.waterQuality,
            pesticideResidue: Math.max(0, m.waterQuality.pesticideResidue + (Math.random() - 0.5) * 0.02),
          },
          soilQuality: {
            ...m.soilQuality,
            pesticideResidue: Math.max(0, m.soilQuality.pesticideResidue + (Math.random() - 0.5) * 0.02),
          },
        }))
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = monitors.filter((m) => region === 'all' || m.region === region);

  const normalCount = monitors.filter((m) => m.status === 'normal').length;
  const warningCount = monitors.filter((m) => m.status === 'warning').length;
  const exceededCount = monitors.filter((m) => m.status === 'exceeded').length;

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
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(3, 169, 244, 0.3)' },
              { offset: 1, color: 'rgba(3, 169, 244, 0.02)' },
            ],
          },
        },
      },
      {
        name: '农药残留(土壤)',
        type: 'line',
        smooth: true,
        data: [0.04, 0.05, 0.07, 0.1, 0.15, 0.12, 0.1],
        lineStyle: { color: '#4CAF50', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(76, 175, 80, 0.3)' },
              { offset: 1, color: 'rgba(76, 175, 80, 0.02)' },
            ],
          },
        },
      },
    ],
  };

  const columns: ColumnsType<EnvironmentMonitor> = [
    {
      title: '地块名称',
      dataIndex: 'plotName',
      key: 'plotName',
      render: (text) => <span className="text-dark-100">{text}</span>,
    },
    {
      title: '所属区域',
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
        <span className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${statusMap[s].dot}`} />
          <Tag color={statusMap[s].color}>{statusMap[s].text}</Tag>
        </span>
      ),
    },
    {
      title: '水质-农药残留',
      key: 'waterResidue',
      width: 130,
      render: (_, record) => (
        <span
          className={`font-mono ${
            record.waterQuality.pesticideResidue > waterStandards.pesticideResidue.max
              ? 'text-danger-400'
              : 'text-primary-400'
          }`}
        >
          {record.waterQuality.pesticideResidue.toFixed(3)} mg/L
        </span>
      ),
    },
    {
      title: '土壤-农药残留',
      key: 'soilResidue',
      width: 130,
      render: (_, record) => (
        <span
          className={`font-mono ${
            record.soilQuality.pesticideResidue > soilStandards.pesticideResidue.max
              ? 'text-danger-400'
              : 'text-primary-400'
          }`}
        >
          {record.soilQuality.pesticideResidue.toFixed(3)} mg/kg
        </span>
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'monitorTime',
      key: 'monitorTime',
      width: 160,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Leaf className="text-primary-400" size={24} />
          环保监测大屏
        </h2>
        <div className="flex items-center gap-3">
          <Select
            value={region}
            onChange={setRegion}
            style={{ width: 140 }}
            options={[
              { value: 'all', label: '全部区域' },
              { value: '华东区', label: '华东区' },
              { value: '华北区', label: '华北区' },
              { value: '华南区', label: '华南区' },
            ]}
          />
          <Button onClick={() => navigate('/environment/alerts')}>告警管理</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
              <Activity size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{monitors.length}</div>
              <div className="text-dark-400 text-sm">监测点总数</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-success-500/20 rounded-lg flex items-center justify-center">
              <Leaf size={24} className="text-primary-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{normalCount}</div>
              <div className="text-dark-400 text-sm">正常</div>
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
              <div className="text-dark-400 text-sm">预警</div>
            </div>
          </div>
        </div>
        <div className="card-glow p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-danger-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle size={24} className="text-danger-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white font-mono">{exceededCount}</div>
              <div className="text-dark-400 text-sm">超标</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4">今日农药残留趋势</h3>
            <ReactECharts option={trendOption} style={{ height: '280px' }} opts={{ renderer: 'svg' }} />
          </div>

          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4">监测点数据</h3>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Droplets size={18} className="text-tech-400" />
              水质监测详情
            </h3>
            {monitors[0] && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">pH值</span>
                    <span
                      className={`font-mono ${
                        monitors[0].waterQuality.ph < waterStandards.ph.min ||
                        monitors[0].waterQuality.ph > waterStandards.ph.max
                          ? 'text-danger-400'
                          : 'text-primary-400'
                      }`}
                    >
                      {monitors[0].waterQuality.ph}
                    </span>
                  </div>
                  <Progress
                    percent={((monitors[0].waterQuality.ph - 5) / 4) * 100}
                    size="small"
                    strokeColor="#03A9F4"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">溶解氧 (mg/L)</span>
                    <span
                      className={`font-mono ${
                        monitors[0].waterQuality.dissolvedOxygen < waterStandards.dissolvedOxygen.min
                          ? 'text-warning-400'
                          : 'text-primary-400'
                      }`}
                    >
                      {monitors[0].waterQuality.dissolvedOxygen}
                    </span>
                  </div>
                  <Progress
                    percent={(monitors[0].waterQuality.dissolvedOxygen / 10) * 100}
                    size="small"
                    strokeColor="#4CAF50"
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">农药残留 (mg/L)</span>
                    <span
                      className={`font-mono ${
                        monitors[0].waterQuality.pesticideResidue > waterStandards.pesticideResidue.max
                          ? 'text-danger-400'
                          : 'text-primary-400'
                      }`}
                    >
                      {monitors[0].waterQuality.pesticideResidue.toFixed(3)}
                    </span>
                  </div>
                  <Progress
                    percent={(monitors[0].waterQuality.pesticideResidue / 0.2) * 100}
                    size="small"
                    strokeColor={
                      monitors[0].waterQuality.pesticideResidue > 0.1 ? '#F44336' : '#4CAF50'
                    }
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">亚硝酸盐 (mg/L)</span>
                    <span
                      className={`font-mono ${
                        monitors[0].waterQuality.nitrite > waterStandards.nitrite.max
                          ? 'text-warning-400'
                          : 'text-primary-400'
                      }`}
                    >
                      {monitors[0].waterQuality.nitrite.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    percent={(monitors[0].waterQuality.nitrite / 0.3) * 100}
                    size="small"
                    strokeColor="#FF9800"
                    showInfo={false}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Mountain size={18} className="text-primary-400" />
              土壤监测详情
            </h3>
            {monitors[0] && (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">pH值</span>
                    <span className="font-mono text-primary-400">{monitors[0].soilQuality.ph}</span>
                  </div>
                  <Progress percent={((monitors[0].soilQuality.ph - 4) / 5) * 100} size="small" strokeColor="#8BC34A" showInfo={false} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">有机质 (g/kg)</span>
                    <span className="font-mono text-primary-400">{monitors[0].soilQuality.organicMatter}</span>
                  </div>
                  <Progress percent={(monitors[0].soilQuality.organicMatter / 40) * 100} size="small" strokeColor="#4CAF50" showInfo={false} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">农药残留 (mg/kg)</span>
                    <span
                      className={`font-mono ${
                        monitors[0].soilQuality.pesticideResidue > soilStandards.pesticideResidue.max
                          ? 'text-danger-400'
                          : 'text-primary-400'
                      }`}
                    >
                      {monitors[0].soilQuality.pesticideResidue.toFixed(3)}
                    </span>
                  </div>
                  <Progress
                    percent={(monitors[0].soilQuality.pesticideResidue / 0.2) * 100}
                    size="small"
                    strokeColor={
                      monitors[0].soilQuality.pesticideResidue > 0.1 ? '#F44336' : '#4CAF50'
                    }
                    showInfo={false}
                  />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">重金属 (mg/kg)</span>
                    <span
                      className={`font-mono ${
                        monitors[0].soilQuality.heavyMetals > soilStandards.heavyMetals.max
                          ? 'text-danger-400'
                          : 'text-primary-400'
                      }`}
                    >
                      {monitors[0].soilQuality.heavyMetals.toFixed(2)}
                    </span>
                  </div>
                  <Progress
                    percent={(monitors[0].soilQuality.heavyMetals / 0.5) * 100}
                    size="small"
                    strokeColor={monitors[0].soilQuality.heavyMetals > 0.3 ? '#F44336' : '#4CAF50'}
                    showInfo={false}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">最新告警</h3>
          <Button type="link" onClick={() => navigate('/environment/alerts')}>
            查看全部 →
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {mockEnvAlerts.slice(0, 4).map((alert) => (
            <div
              key={alert.id}
              className={`p-4 rounded-lg border ${
                alert.level === 'danger'
                  ? 'bg-danger-500/10 border-danger-500/30'
                  : 'bg-warning-500/10 border-warning-500/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle
                  size={16}
                  className={alert.level === 'danger' ? 'text-danger-500' : 'text-warning-500'}
                />
                <span className="text-white font-medium text-sm">{alert.plotName}</span>
              </div>
              <div className="text-dark-300 text-xs mb-2">
                {alert.type === 'water' ? '水质' : '土壤'} - {alert.indicator}
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-dark-400">当前值</span>
                <span className={alert.level === 'danger' ? 'text-danger-400' : 'text-warning-400'}>
                  {alert.value} / 标准 {alert.standard}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Environment;
