import { useEffect, useState } from 'react';
import {
  Plane,
  Sprout,
  Package,
  Leaf,
  FileCheck,
  Users,
  AlertTriangle,
  RefreshCw,
  Download,
  Filter,
} from 'lucide-react';
import { Select, DatePicker, Button, message } from 'antd';
import ReactECharts from 'echarts-for-react';
import dayjs from 'dayjs';
import StatCard from '../../components/StatCard/StatCard';
import MapView from '../../components/MapView/MapView';
import { useDashboardStore } from '../../store/useDashboardStore';

const { RangePicker } = DatePicker;

const Dashboard = () => {
  const { filteredData, lastUpdate, refreshData, selectedRegion, selectedCrop, selectedDate, setFilters, exportMonthlyReport } =
    useDashboardStore();
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleRefresh = () => {
    setUpdating(true);
    refreshData();
    setTimeout(() => setUpdating(false), 1000);
  };

  const handleExport = () => {
    exportMonthlyReport();
    message.success('报告导出中，请稍候...');
  };

  const { stats, weeklyArea, monthlyAlerts, cropDist, regions, recentApplications, recentAlerts } = filteredData;

  const areaChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 35, 41, 0.9)',
      borderColor: '#455A64',
      textStyle: { color: '#ECEFF1' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: weeklyArea.map((d) => d.day),
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C' },
    },
    yAxis: {
      type: 'value',
      name: '亩',
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C' },
      splitLine: { lineStyle: { color: '#37474F' } },
    },
    series: [
      {
        name: '作业面积',
        type: 'bar',
        data: weeklyArea.map((d) => d.area),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#66BB6A' },
              { offset: 1, color: '#2E7D32' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
        barWidth: '40%',
      },
    ],
  };

  const alertChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(26, 35, 41, 0.9)',
      borderColor: '#455A64',
      textStyle: { color: '#ECEFF1' },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: monthlyAlerts.map((d) => d.month),
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C' },
    },
    yAxis: {
      type: 'value',
      name: '次',
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C' },
      splitLine: { lineStyle: { color: '#37474F' } },
    },
    series: [
      {
        name: '环保告警',
        type: 'line',
        smooth: true,
        data: monthlyAlerts.map((d) => d.alerts),
        lineStyle: { color: '#FF9800', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 152, 0, 0.3)' },
              { offset: 1, color: 'rgba(255, 152, 0, 0.02)' },
            ],
          },
        },
        itemStyle: { color: '#FF9800' },
      },
    ],
  };

  const pieChartOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(26, 35, 41, 0.9)',
      borderColor: '#455A64',
      textStyle: { color: '#ECEFF1' },
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#B0BEC5' },
      itemGap: 12,
    },
    series: [
      {
        name: '作物分布',
        type: 'pie',
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: '#1A2329',
          borderWidth: 2,
        },
        label: { show: false },
        data: cropDist.map((d, i) => ({
          value: d.value,
          name: d.name,
          itemStyle: {
            color: ['#4CAF50', '#03A9F4', '#FF9800', '#9C27B0', '#00BCD4', '#795548'][i % 6],
          },
        })),
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">指挥大屏</h2>
          <p className="text-dark-400 text-sm">
            数据最后更新：{lastUpdate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-dark-400" />
            <Select
              value={selectedRegion}
              onChange={(v) => setFilters(v, selectedCrop, selectedDate)}
              style={{ width: 120 }}
              options={[
                { value: '全部', label: '全部区域' },
                { value: '华东区', label: '华东区' },
                { value: '华北区', label: '华北区' },
                { value: '华南区', label: '华南区' },
                { value: '西南区', label: '西南区' },
                { value: '西北区', label: '西北区' },
              ]}
            />
            <Select
              value={selectedCrop}
              onChange={(v) => setFilters(selectedRegion, v, selectedDate)}
              style={{ width: 120 }}
              options={[
                { value: '全部', label: '全部作物' },
                { value: '水稻', label: '水稻' },
                { value: '小麦', label: '小麦' },
                { value: '玉米', label: '玉米' },
                { value: '大豆', label: '大豆' },
              ]}
            />
            <Select
              value={selectedDate}
              onChange={(v) => setFilters(selectedRegion, selectedCrop, v)}
              style={{ width: 120 }}
              options={[
                { value: '今日', label: '今日' },
                { value: '本周', label: '本周' },
                { value: '本月', label: '本月' },
                { value: '本季度', label: '本季度' },
              ]}
            />
          </div>
          <Button icon={<Download size={16} />} onClick={handleExport} className="bg-dark-800 border-dark-600 text-dark-200 hover:text-white">
            导出报告
          </Button>
          <Button
            icon={<RefreshCw size={16} className={updating ? 'animate-spin' : ''} />}
            onClick={handleRefresh}
            className="bg-dark-800 border-dark-600 text-dark-200 hover:text-white"
          >
            刷新
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="今日作业面积"
          value={stats.todayArea}
          unit="亩"
          icon={<Sprout size={20} />}
          color="#4CAF50"
          trend={12.5}
          delay={0}
        />
        <StatCard
          title="活跃无人机"
          value={stats.activeDrones}
          unit="架"
          icon={<Plane size={20} />}
          color="#03A9F4"
          delay={100}
        />
        <StatCard
          title="库存周转率"
          value={stats.inventoryTurnover}
          unit="次/月"
          icon={<Package size={20} />}
          color="#FF9800"
          trend={5.2}
          delay={200}
        />
        <StatCard
          title="环保告警"
          value={stats.envAlertsCount}
          unit="起"
          icon={<AlertTriangle size={20} />}
          color="#F44336"
          trend={-8.3}
          delay={300}
        />
        <StatCard
          title="农户满意度"
          value={stats.farmerSatisfaction}
          unit="分"
          icon={<Users size={20} />}
          color="#9C27B0"
          trend={2.1}
          delay={400}
        />
        <StatCard
          title="待处理申请"
          value={stats.pendingApplications}
          unit="条"
          icon={<FileCheck size={20} />}
          color="#00BCD4"
          delay={500}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <MapView />
        </div>
        <div className="space-y-6">
          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4">本周作业面积</h3>
            <ReactECharts
              option={areaChartOption}
              style={{ height: '200px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
          <div className="card-glow p-5">
            <h3 className="text-white font-semibold mb-4">作物类型分布</h3>
            <ReactECharts
              option={pieChartOption}
              style={{ height: '200px' }}
              opts={{ renderer: 'svg' }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">最新植保申请</h3>
            <a href="#/applications" className="text-primary-400 text-sm hover:text-primary-300">
              查看全部 →
            </a>
          </div>
          <div className="space-y-3">
            {recentApplications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between p-3 bg-dark-950/50 rounded-lg hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      app.status === 'in_progress'
                        ? 'bg-primary-500 animate-breathe'
                        : app.status === 'pending'
                        ? 'bg-warning-500'
                        : app.status === 'completed'
                        ? 'bg-tech-500'
                        : 'bg-danger-500'
                    }`}
                  />
                  <div>
                    <div className="text-dark-100 text-sm font-medium">{app.plotName}</div>
                    <div className="text-dark-500 text-xs">
                      {app.cropType} · {app.pestType} · {app.plotArea}亩
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    app.status === 'in_progress'
                      ? 'bg-primary-500/20 text-primary-400'
                      : app.status === 'pending'
                      ? 'bg-warning-500/20 text-warning-400'
                      : app.status === 'completed'
                      ? 'bg-tech-500/20 text-tech-400'
                      : 'bg-danger-500/20 text-danger-400'
                  }`}
                >
                  {
                    {
                      pending: '待处理',
                      planning: '方案制定中',
                      approved: '已审批',
                      rejected: '已驳回',
                      in_progress: '作业中',
                      completed: '已完成',
                    }[app.status]
                  }
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-glow p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">环保告警动态</h3>
            <a href="#/environment/alerts" className="text-warning-400 text-sm hover:text-warning-300">
              查看全部 →
            </a>
          </div>
          <div className="space-y-3">
            {recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 bg-dark-950/50 rounded-lg hover:bg-dark-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle
                    size={18}
                    className={alert.level === 'danger' ? 'text-danger-500' : 'text-warning-500'}
                  />
                  <div>
                    <div className="text-dark-100 text-sm font-medium">{alert.plotName}</div>
                    <div className="text-dark-500 text-xs">
                      {alert.indicator}超标 · {alert.type === 'water' ? '水质' : '土壤'}
                    </div>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    alert.level === 'danger'
                      ? 'bg-danger-500/20 text-danger-400'
                      : 'bg-warning-500/20 text-warning-400'
                  }`}
                >
                  {alert.level === 'danger' ? '严重' : '警告'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <h3 className="text-white font-semibold mb-4">各区域数据统计</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-dark-400 border-b border-dark-700">
                <th className="text-left py-3 px-4 font-medium">区域</th>
                <th className="text-right py-3 px-4 font-medium">累计作业面积(亩)</th>
                <th className="text-right py-3 px-4 font-medium">无人机数量</th>
                <th className="text-right py-3 px-4 font-medium">环保告警</th>
                <th className="text-right py-3 px-4 font-medium">农户满意度</th>
              </tr>
            </thead>
            <tbody>
              {regions.map((region, i) => (
                <tr key={i} className="border-b border-dark-800 hover:bg-dark-800/30">
                  <td className="py-3 px-4 text-dark-100">{region.name}</td>
                  <td className="py-3 px-4 text-right font-mono text-white">{region.area}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-tech-400">{region.drones}</span> 架
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={region.alerts > 0 ? 'text-warning-400' : 'text-primary-400'}>
                      {region.alerts}
                    </span>{' '}
                    起
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-20 h-1.5 bg-dark-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-tech-500 rounded-full"
                          style={{ width: `${85 + i * 3}%` }}
                        />
                      </div>
                      <span className="text-dark-300 text-xs">{85 + i * 3}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
