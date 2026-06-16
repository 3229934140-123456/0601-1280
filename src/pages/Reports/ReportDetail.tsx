import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Plane,
  Package,
  DollarSign,
  MapPin,
  Download,
  CheckCircle,
} from 'lucide-react';
import { Button, Card, Descriptions, Divider, Tag, List, Progress } from 'antd';
import ReactECharts from 'echarts-for-react';
import { mockReports } from '../../mock/reports';

const ReportDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const report = mockReports.find((r) => r.id === id);

  if (!report) {
    return <div className="text-dark-400">报告不存在</div>;
  }

  const sprayChartOption = {
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['0分', '15分', '30分', '45分', '60分', '75分', '90分', '105分', '120分', '135分'],
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      name: '喷洒量(L)',
      axisLine: { lineStyle: { color: '#455A64' } },
      axisLabel: { color: '#78909C' },
      splitLine: { lineStyle: { color: '#37474F' } },
    },
    series: [
      {
        type: 'line',
        smooth: true,
        data: [0, 12, 25, 38, 52, 65, 72, 80, 85, 90],
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} className="bg-dark-800 border-dark-600">
          返回
        </Button>
        <h2 className="text-xl font-bold text-white">作业报告详情</h2>
        <Tag color="success" className="ml-auto">
          {report.status === 'confirmed' ? '已确认' : '草稿'}
        </Tag>
        <Button icon={<Download size={16} />} type="primary">
          导出报告
        </Button>
      </div>

      <div className="card-glow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{report.plotName}</h3>
            <p className="text-dark-400 text-sm">
              报告编号：<span className="font-mono text-tech-400">{report.id}</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-warning-400 font-mono">
              ¥{report.settlement.actualPayment}
            </div>
            <div className="text-dark-400 text-sm">实际结算金额</div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-dark-950 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white font-mono">{report.actualArea}</div>
            <div className="text-dark-400 text-sm">作业面积(亩)</div>
          </div>
          <div className="bg-dark-950 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white font-mono">{report.flightDuration}</div>
            <div className="text-dark-400 text-sm">飞行时长(分钟)</div>
          </div>
          <div className="bg-dark-950 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white font-mono">{report.totalSprayVolume}</div>
            <div className="text-dark-400 text-sm">喷洒总量(L)</div>
          </div>
          <div className="bg-dark-950 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white font-mono">{report.droneNames.length}</div>
            <div className="text-dark-400 text-sm">无人机数量</div>
          </div>
        </div>

        <Divider className="border-dark-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-dark-200 font-medium mb-3 flex items-center gap-2">
              <MapPin size={16} className="text-primary-400" />
              基本信息
            </h4>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="农户">{report.farmerName}</Descriptions.Item>
              <Descriptions.Item label="作物类型">{report.cropType}</Descriptions.Item>
              <Descriptions.Item label="所属区域">{report.region}</Descriptions.Item>
              <Descriptions.Item label="开始时间">{report.startTime}</Descriptions.Item>
              <Descriptions.Item label="结束时间">{report.endTime}</Descriptions.Item>
              <Descriptions.Item label="飞手">{report.pilotNames.join('、')}</Descriptions.Item>
              <Descriptions.Item label="无人机">{report.droneNames.join('、')}</Descriptions.Item>
            </Descriptions>
          </div>

          <div>
            <h4 className="text-dark-200 font-medium mb-3 flex items-center gap-2">
              <Package size={16} className="text-warning-400" />
              农药使用明细
            </h4>
            <List
              size="small"
              dataSource={report.pesticideUsage}
              renderItem={(item) => (
                <List.Item className="!border-b !border-dark-700 px-0">
                  <span className="text-dark-300">{item.name}</span>
                  <span className="font-mono text-dark-100">
                    {item.amount} {item.unit}
                  </span>
                </List.Item>
              )}
              className="bg-transparent"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-glow p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Plane size={18} className="text-tech-400" />
            喷洒量趋势
          </h3>
          <ReactECharts option={sprayChartOption} style={{ height: '220px' }} opts={{ renderer: 'svg' }} />
        </div>

        <div className="card-glow p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign size={18} className="text-warning-400" />
            费用结算
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-dark-700">
              <span className="text-dark-400">农药费用</span>
              <span className="font-mono text-dark-200">¥{report.settlement.pesticideCost}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-700">
              <span className="text-dark-400">服务费用</span>
              <span className="font-mono text-dark-200">¥{report.settlement.serviceCost}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-dark-700">
              <span className="text-dark-400">优惠折扣</span>
              <span className="font-mono text-primary-400">-¥{report.settlement.discount}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-white font-medium">实付金额</span>
              <span className="text-xl font-bold text-warning-400 font-mono">
                ¥{report.settlement.actualPayment}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <Tag color={report.settlement.status === 'paid' ? 'success' : 'warning'}>
                {report.settlement.status === 'paid' ? '已支付' : '待支付'}
              </Tag>
            </div>
          </div>
        </div>
      </div>

      <div className="card-glow p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-primary-400" />
          作业效果评估
        </h3>
        <div className="bg-dark-950 rounded-lg p-4">
          <p className="text-dark-200 leading-relaxed">{report.effectEvaluation}</p>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <span className="text-dark-400 text-sm">作业质量评分：</span>
          <div className="flex-1 flex items-center gap-3">
            <Progress percent={92} size="small" strokeColor="#4CAF50" />
            <span className="text-primary-400 font-mono">92分</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
