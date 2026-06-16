import { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useDashboardStore } from '../../store/useDashboardStore';
import { mockDrones } from '../../mock/drones';
import { mockApplications } from '../../mock/applications';
import { mockEnvAlerts } from '../../mock/environment';

const MapView = () => {
  const { selectedRegion } = useDashboardStore();
  const [dronePositions, setDronePositions] = useState(
    mockDrones.filter((d) => d.status !== 'offline').map((d) => d.currentLocation)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setDronePositions((prev) =>
        prev.map((pos) => ({
          lat: pos.lat + (Math.random() - 0.5) * 0.002,
          lng: pos.lng + (Math.random() - 0.5) * 0.002,
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const regions = [
    { name: '华东区', x: 380, y: 180, color: '#4CAF50' },
    { name: '华北区', x: 350, y: 120, color: '#03A9F4' },
    { name: '华南区', x: 340, y: 280, color: '#FF9800' },
    { name: '西南区', x: 250, y: 230, color: '#9C27B0' },
    { name: '西北区', x: 220, y: 130, color: '#795548' },
  ];

  const activeDrones = mockDrones.filter(
    (d) => d.status === 'in_task' || d.status === 'idle'
  );

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(26, 35, 41, 0.9)',
      borderColor: '#455A64',
      textStyle: { color: '#ECEFF1' },
    },
    series: [
      {
        type: 'scatter',
        coordinateSystem: 'cartesian2d',
        symbolSize: 12,
        data: activeDrones.map((d, i) => ({
          value: [
            150 + i * 60 + Math.sin(i) * 30,
            100 + i * 40 + Math.cos(i) * 20,
          ],
          name: d.name,
          itemStyle: {
            color: d.status === 'in_task' ? '#4CAF50' : '#03A9F4',
            shadowBlur: 10,
            shadowColor: d.status === 'in_task' ? '#4CAF50' : '#03A9F4',
          },
        })),
        animation: true,
      },
    ],
    xAxis: { show: false, min: 0, max: 600 },
    yAxis: { show: false, min: 0, max: 400 },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
  };

  return (
    <div className="card-glow h-full relative overflow-hidden">
      <div className="absolute top-4 left-4 z-10">
        <h3 className="text-white font-semibold">区域分布地图</h3>
        <p className="text-dark-400 text-xs">无人机实时位置</p>
      </div>

      <div className="absolute top-4 right-4 z-10 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary-500 animate-breathe" />
          <span className="text-dark-300">作业中</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tech-500" />
          <span className="text-dark-300">待命</span>
        </div>
      </div>

      <div className="w-full h-full min-h-[300px] relative">
        <svg viewBox="0 0 600 400" className="w-full h-full">
          <defs>
            <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1B5E20" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#0277BD" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <path
            d="M100,80 Q200,40 350,60 T520,100 Q550,200 500,300 Q400,360 280,340 Q150,350 80,280 Q50,180 100,80 Z"
            fill="url(#mapGrad)"
            stroke="#455A64"
            strokeWidth="1"
            opacity="0.5"
          />

          {regions.map((region, i) => (
            <g key={i} className="cursor-pointer hover:opacity-80 transition-opacity">
              <circle
                cx={region.x}
                cy={region.y}
                r="25"
                fill={region.color}
                fillOpacity="0.2"
                stroke={region.color}
                strokeWidth="2"
                filter="url(#glow)"
              />
              <text
                x={region.x}
                y={region.y + 5}
                textAnchor="middle"
                fill="#ECEFF1"
                fontSize="12"
                fontWeight="500"
              >
                {region.name}
              </text>
            </g>
          ))}

          {activeDrones.map((drone, i) => {
            const baseX = 180 + i * 70;
            const baseY = 140 + (i % 3) * 50;
            const offsetX = Math.sin(Date.now() / 2000 + i) * 15;
            const offsetY = Math.cos(Date.now() / 2500 + i) * 10;
            return (
              <g key={drone.id}>
                <circle
                  cx={baseX + offsetX}
                  cy={baseY + offsetY}
                  r="6"
                  fill={drone.status === 'in_task' ? '#4CAF50' : '#03A9F4'}
                  className={drone.status === 'in_task' ? 'animate-pulse' : ''}
                  filter="url(#glow)"
                />
                <text
                  x={baseX + offsetX}
                  y={baseY + offsetY - 10}
                  textAnchor="middle"
                  fill="#B0BEC5"
                  fontSize="10"
                >
                  {drone.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs">
        <div className="text-dark-400">
          共 <span className="text-white font-medium">{mockDrones.length}</span> 架无人机
        </div>
        <div className="text-primary-400 animate-pulse">● 实时更新</div>
      </div>
    </div>
  );
};

export default MapView;
