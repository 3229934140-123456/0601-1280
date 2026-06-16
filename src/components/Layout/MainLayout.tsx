import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Bell,
  User,
  LogOut,
  Leaf,
} from 'lucide-react';
import { useAuthStore, roleNames } from '../../store/useAuthStore';
import { menuItems } from '../../config/menu';
import { Dropdown, Avatar, Badge } from 'antd';

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  const filteredMenus = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  const userMenuItems = [
    {
      key: 'profile',
      label: '个人中心',
      icon: <User size={16} />,
    },
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogOut size={16} />,
      onClick: handleLogout,
    },
  ];

  return (
    <div className="flex h-screen bg-dark-980">
      <aside
        className={`flex flex-col bg-dark-950 border-r border-dark-700 transition-all duration-300 ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-dark-700">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-tech-500 rounded-lg flex items-center justify-center">
                <Leaf className="text-white" size={18} />
              </div>
              <span className="font-bold text-gradient text-lg">智农植保</span>
            </div>
          )}
          {collapsed && (
            <div className="w-8 h-8 mx-auto bg-gradient-to-br from-primary-500 to-tech-500 rounded-lg flex items-center justify-center">
              <Leaf className="text-white" size={18} />
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {filteredMenus.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.key}
                onClick={() => handleMenuClick(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-200 ${
                  active
                    ? 'bg-primary-500/10 text-primary-400 border-r-2 border-primary-500'
                    : 'text-dark-300 hover:bg-dark-800/50 hover:text-dark-100'
                }`}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-12 border-t border-dark-700 flex items-center justify-center text-dark-400 hover:text-dark-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-dark-950 border-b border-dark-700 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-medium text-dark-100">
              {filteredMenus.find((m) => isActive(m.path))?.label || '首页大屏'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <Badge count={3} size="small" offset={[-2, 2]}>
              <button className="p-2 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-800 transition-colors">
                <Bell size={20} />
              </button>
            </Badge>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-3 cursor-pointer hover:bg-dark-800/50 px-3 py-2 rounded-lg transition-colors">
                <Avatar
                  size={32}
                  style={{ backgroundColor: '#4CAF50' }}
                  icon={<User size={16} />}
                />
                <div className="hidden md:block">
                  <div className="text-sm font-medium text-dark-100">
                    {user?.name}
                  </div>
                  <div className="text-xs text-dark-400">
                    {roleNames[user?.role || 'farmer']}
                  </div>
                </div>
              </div>
            </Dropdown>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
