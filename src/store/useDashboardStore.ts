import { create } from 'zustand';
import type { DashboardStats } from '../types/report';
import {
  mockDashboardStats,
  weeklyAreaData,
  monthlyEnvAlertData,
  cropDistribution,
  regionData,
} from '../mock/reports';

interface DashboardState {
  stats: DashboardStats;
  weeklyArea: typeof weeklyAreaData;
  monthlyAlerts: typeof monthlyEnvAlertData;
  cropDist: typeof cropDistribution;
  regions: typeof regionData;
  lastUpdate: string;
  refreshData: () => void;
  selectedRegion: string;
  selectedCrop: string;
  selectedDate: string;
  setFilters: (region: string, crop: string, date: string) => void;
}

const fluctuate = (value: number, range: number = 0.05) => {
  return Math.round((value * (1 + (Math.random() - 0.5) * range)) * 100) / 100;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: mockDashboardStats,
  weeklyArea: weeklyAreaData,
  monthlyAlerts: monthlyEnvAlertData,
  cropDist: cropDistribution,
  regions: regionData,
  lastUpdate: new Date().toLocaleString('zh-CN'),
  selectedRegion: '全部',
  selectedCrop: '全部',
  selectedDate: '今日',

  refreshData: () => {
    set((state) => ({
      stats: {
        ...state.stats,
        todayArea: fluctuate(state.stats.todayArea),
        activeDrones: Math.min(state.stats.totalDrones, state.stats.activeDrones + (Math.random() > 0.7 ? 1 : Math.random() > 0.5 ? -1 : 0)),
        envAlertsCount: Math.max(0, state.stats.envAlertsCount + (Math.random() > 0.8 ? 1 : Math.random() > 0.9 ? -1 : 0)),
        farmerSatisfaction: Math.min(100, Math.max(80, fluctuate(state.stats.farmerSatisfaction, 0.02))),
        pendingApplications: Math.max(0, state.stats.pendingApplications + (Math.random() > 0.6 ? 1 : Math.random() > 0.7 ? -1 : 0)),
        completedToday: state.stats.completedToday + (Math.random() > 0.7 ? 1 : 0),
      },
      lastUpdate: new Date().toLocaleString('zh-CN'),
    }));
  },

  setFilters: (region, crop, date) => {
    set({ selectedRegion: region, selectedCrop: crop, selectedDate: date });
  },
}));
