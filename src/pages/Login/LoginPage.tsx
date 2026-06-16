import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Eye, EyeOff, User, Lock } from 'lucide-react';
import { Button, Input, Select, message } from 'antd';
import { useAuthStore } from '../../store/useAuthStore';
import type { UserRole } from '../../types/user';
import { roleNames } from '../../mock/users';

const LoginPage = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<UserRole>('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleLogin = async () => {
    if (!username || !password) {
      message.warning('请输入用户名和密码');
      return;
    }
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    const success = login(username, password, role);
    setLoading(false);
    if (success) {
      message.success('登录成功');
      navigate('/dashboard');
    } else {
      message.error('用户名或密码错误，请重试');
    }
  };

  const roleOptions: { value: UserRole; label: string }[] = [
    { value: 'admin', label: '系统管理员' },
    { value: 'supervisor', label: '植保主管' },
    { value: 'env_officer', label: '环保监管员' },
    { value: 'pilot', label: '飞手' },
    { value: 'farmer', label: '农户' },
  ];

  const defaultAccounts: Record<string, string> = {
    admin: 'admin',
    supervisor: 'supervisor1',
    env_officer: 'env_officer1',
    pilot: 'pilot1',
    farmer: 'farmer1',
  };

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setUsername(defaultAccounts[newRole]);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-980 via-dark-950 to-primary-950 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-tech-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="hidden md:block">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-tech-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Leaf className="text-white" size={28} />
              </div>
              <span className="text-2xl font-bold text-gradient">智农植保</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              智慧农业无人机
              <br />
              <span className="text-gradient">植保监管平台</span>
            </h1>
            <p className="text-dark-300 text-lg leading-relaxed">
              整合农户需求、植保服务、无人机调度、农药管理与环保监测，
              打造全链路数字化智慧农业解决方案。
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { label: '智能调度', desc: 'AI最优路径规划' },
              { label: '实时监控', desc: '无人机轨迹追踪' },
              { label: '两级审批', desc: '农药出库严格管控' },
              { label: '环保监测', desc: '土壤水质实时检测' },
            ].map((item, index) => (
              <div
                key={index}
                className="bg-dark-900/50 backdrop-blur-sm border border-dark-700 rounded-xl p-4 hover:border-primary-500/50 transition-colors"
              >
                <div className="text-primary-400 font-semibold mb-1">
                  {item.label}
                </div>
                <div className="text-dark-400 text-sm">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-dark-900/80 backdrop-blur-xl border border-dark-700 rounded-2xl p-8 shadow-2xl">
          <div className="md:hidden mb-6 flex items-center justify-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-tech-500 rounded-xl flex items-center justify-center">
              <Leaf className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold text-gradient">智农植保</span>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">欢迎登录</h2>
          <p className="text-dark-400 mb-8">请选择角色并登录系统</p>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-dark-300 mb-2">选择角色</label>
              <Select
                value={role}
                onChange={handleRoleChange}
                options={roleOptions}
                size="large"
                className="w-full"
                style={{ backgroundColor: '#0F1419' }}
              />
            </div>

            <div>
              <label className="block text-sm text-dark-300 mb-2">用户名</label>
              <div className="relative">
                <User
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"
                  size={18}
                />
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  size="large"
                  className="pl-10 bg-dark-950 border-dark-700 text-white"
                  style={{ backgroundColor: '#0F1419' }}
                  onPressEnter={handleLogin}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-dark-300 mb-2">密码</label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500"
                  size={18}
                />
                <Input.Password
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  size="large"
                  className="pl-10"
                  style={{ backgroundColor: '#0F1419' }}
                  iconRender={(visible) =>
                    visible ? <Eye size={18} /> : <EyeOff size={18} />
                  }
                  onPressEnter={handleLogin}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-dark-400 cursor-pointer">
                <input type="checkbox" className="rounded border-dark-600 bg-dark-800" />
                <span>记住登录</span>
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300">
                忘记密码？
              </a>
            </div>

            <Button
              type="primary"
              size="large"
              block
              loading={loading}
              onClick={handleLogin}
              className="h-12 text-base font-medium bg-gradient-to-r from-primary-600 to-tech-600 hover:from-primary-500 hover:to-tech-500 border-none"
            >
              登 录
            </Button>

            <div className="text-center text-xs text-dark-500 mt-6">
              <p>演示账号：选择角色后自动填充用户名，密码均为 123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
