import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, MapPin, Sprout, Bug, Calendar } from 'lucide-react';
import { Button, Form, Input, Select, InputNumber, DatePicker, message, Card } from 'antd';
import { cropTypes, pestTypes, regions } from '../../mock/applications';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

const NewApplication = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const onFinish = (values: any) => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      message.success('申请提交成功，等待系统制定作业方案');
      navigate('/applications');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button icon={<ArrowLeft size={16} />} onClick={() => navigate(-1)} className="bg-dark-800 border-dark-600">
          返回
        </Button>
        <h2 className="text-xl font-bold text-white">提交植保申请</h2>
      </div>

      <div className="card-glow p-6">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            expectedDate: dayjs().add(3, 'day'),
          }}
        >
          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-primary-400" />
              地块信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="地块名称"
                name="plotName"
                rules={[{ required: true, message: '请输入地块名称' }]}
              >
                <Input placeholder="请输入地块名称" size="large" />
              </Form.Item>
              <Form.Item
                label="所属区域"
                name="region"
                rules={[{ required: true, message: '请选择所属区域' }]}
              >
                <Select placeholder="请选择区域" size="large">
                  {regions.map((r) => (
                    <Option key={r} value={r}>
                      {r}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="地块面积(亩)"
                name="plotArea"
                rules={[{ required: true, message: '请输入地块面积' }]}
              >
                <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} size="large" placeholder="请输入面积" />
              </Form.Item>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sprout size={18} className="text-primary-400" />
              作物信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="作物类型"
                name="cropType"
                rules={[{ required: true, message: '请选择作物类型' }]}
              >
                <Select placeholder="请选择作物类型" size="large">
                  {cropTypes.map((c) => (
                    <Option key={c} value={c}>
                      {c}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="生育期"
                name="cropStage"
                rules={[{ required: true, message: '请输入生育期' }]}
              >
                <Input placeholder="如：分蘖期、拔节期" size="large" />
              </Form.Item>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Bug size={18} className="text-warning-400" />
              病虫害信息
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                label="病虫害类型"
                name="pestType"
                rules={[{ required: true, message: '请选择病虫害类型' }]}
              >
                <Select placeholder="请选择病虫害类型" size="large" mode="tags">
                  {pestTypes.map((p) => (
                    <Option key={p} value={p}>
                      {p}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item
                label="危害程度"
                name="pestLevel"
                rules={[{ required: true, message: '请选择危害程度' }]}
              >
                <Select placeholder="请选择危害程度" size="large">
                  <Option value="mild">轻度</Option>
                  <Option value="moderate">中度</Option>
                  <Option value="severe">重度</Option>
                </Select>
              </Form.Item>
            </div>
            <Form.Item label="详细描述" name="requirement">
              <TextArea rows={4} placeholder="请详细描述植保需求和病虫害情况" />
            </Form.Item>
          </div>

          <div className="mb-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-tech-400" />
              作业安排
            </h3>
            <Form.Item
              label="期望作业日期"
              name="expectedDate"
              rules={[{ required: true, message: '请选择期望作业日期' }]}
            >
              <DatePicker style={{ width: '100%' }} size="large" placeholder="选择期望作业日期" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-dark-700">
            <Button size="large" onClick={() => navigate(-1)} className="bg-dark-800 border-dark-600">
              取消
            </Button>
            <Button type="primary" size="large" htmlType="submit" loading={submitting} icon={<Send size={16} />}>
              提交申请
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default NewApplication;
