import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  Plane,
  Package,
  Leaf,
  BarChart3,
  Settings,
  Users,
  ShieldCheck,
} from 'lucide-react';

export interface MenuItem {
  key: string;
  label: string;
  icon: LucideIcon;
  path: string;
  roles: string[];
}

export const menuItems: MenuItem[] = [
  {
    key: 'dashboard',
    label: '首页大屏',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['farmer', 'pilot', 'supervisor', 'env_officer', 'admin'],
  },
  {
    key: 'applications',
    label: '植保申请',
    icon: FileText,
    path: '/applications',
    roles: ['farmer', 'supervisor', 'admin'],
  },
  {
    key: 'drones',
    label: '无人机监控',
    icon: Plane,
    path: '/drones',
    roles: ['pilot', 'supervisor', 'admin'],
  },
  {
    key: 'inventory',
    label: '农药库存',
    icon: Package,
    path: '/inventory',
    roles: ['supervisor', 'admin'],
  },
  {
    key: 'environment',
    label: '环保监测',
    icon: Leaf,
    path: '/environment',
    roles: ['env_officer', 'supervisor', 'admin'],
  },
  {
    key: 'reports',
    label: '作业报告',
    icon: BarChart3,
    path: '/reports',
    roles: ['farmer', 'supervisor', 'admin'],
  },
  {
    key: 'system',
    label: '系统管理',
    icon: Settings,
    path: '/system/users',
    roles: ['admin'],
  },
];

export const systemSubMenus = [
  {
    key: 'users',
    label: '用户管理',
    icon: Users,
    path: '/system/users',
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: ShieldCheck,
    path: '/system/settings',
  },
];
