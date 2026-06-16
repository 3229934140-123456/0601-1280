import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DashboardStats } from '../types/report';
import {
  mockDashboardStats,
  weeklyAreaData,
  monthlyEnvAlertData,
  cropDistribution,
  regionData,
  mockReports,
} from '../mock/reports';
import { mockApplications } from '../mock/applications';
import { mockDrones } from '../mock/drones';
import { mockEnvAlerts } from '../mock/environment';
import { useApplicationStore } from './useApplicationStore';
import { useDroneStore } from './useDroneStore';
import { useEnvironmentStore } from './useEnvironmentStore';

interface FilteredData {
  stats: DashboardStats;
  weeklyArea: typeof weeklyAreaData;
  monthlyAlerts: typeof monthlyEnvAlertData;
  cropDist: typeof cropDistribution;
  regions: typeof regionData;
  recentApplications: typeof mockApplications;
  recentAlerts: typeof mockEnvAlerts;
  activeDrones: typeof mockDrones;
}

interface DashboardState {
  baseStats: DashboardStats;
  baseWeeklyArea: typeof weeklyAreaData;
  baseMonthlyAlerts: typeof monthlyEnvAlertData;
  baseCropDist: typeof cropDistribution;
  baseRegions: typeof regionData;
  lastUpdate: string;
  selectedRegion: string;
  selectedCrop: string;
  selectedDate: string;
  filteredData: FilteredData;
  refreshData: () => void;
  setFilters: (region: string, crop: string, date: string) => void;
  recalculateFilteredData: () => void;
  exportMonthlyReport: () => void;
  getFilteredApplications: () => typeof mockApplications;
  getFilteredReports: () => typeof mockReports;
}

const fluctuate = (value: number, range: number = 0.05) => {
  return Math.round((value * (1 + (Math.random() - 0.5) * range)) * 100) / 100;
};

const filterByRegion = <T extends { region?: string }>(data: T[], region: string): T[] => {
  if (region === '全部') return data;
  return data.filter((d) => d.region === region);
};

const filterByCrop = <T extends { cropType?: string }>(data: T[], crop: string): T[] => {
  if (crop === '全部') return data;
  return data.filter((d) => d.cropType === crop);
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      baseStats: mockDashboardStats,
      baseWeeklyArea: weeklyAreaData,
      baseMonthlyAlerts: monthlyEnvAlertData,
      baseCropDist: cropDistribution,
      baseRegions: regionData,
      lastUpdate: new Date().toLocaleString('zh-CN'),
      selectedRegion: '全部',
      selectedCrop: '全部',
      selectedDate: '今日',
      filteredData: {
        stats: mockDashboardStats,
        weeklyArea: weeklyAreaData,
        monthlyAlerts: monthlyEnvAlertData,
        cropDist: cropDistribution,
        regions: regionData,
        recentApplications: mockApplications.slice(0, 5),
        recentAlerts: mockEnvAlerts.filter((a) => a.status !== 'resolved').slice(0, 5),
        activeDrones: mockDrones.filter((d) => d.status === 'in_task'),
      },

      refreshData: () => {
        set((state) => ({
          baseStats: {
            ...state.baseStats,
            todayArea: fluctuate(state.baseStats.todayArea),
            activeDrones: Math.min(
              state.baseStats.totalDrones,
              state.baseStats.activeDrones + (Math.random() > 0.7 ? 1 : Math.random() > 0.5 ? -1 : 0)
            ),
            envAlertsCount: Math.max(
              0,
              state.baseStats.envAlertsCount + (Math.random() > 0.8 ? 1 : Math.random() > 0.9 ? -1 : 0)
            ),
            farmerSatisfaction: Math.min(
              100,
              Math.max(80, fluctuate(state.baseStats.farmerSatisfaction, 0.02))
            ),
            pendingApplications: Math.max(
              0,
              state.baseStats.pendingApplications + (Math.random() > 0.6 ? 1 : Math.random() > 0.7 ? -1 : 0)
            ),
            completedToday: state.baseStats.completedToday + (Math.random() > 0.7 ? 1 : 0),
          },
          lastUpdate: new Date().toLocaleString('zh-CN'),
        }));
        get().recalculateFilteredData();
      },

      setFilters: (region, crop, date) => {
        set({ selectedRegion: region, selectedCrop: crop, selectedDate: date });
        get().recalculateFilteredData();
      },

      getFilteredApplications: () => {
        const { selectedRegion, selectedCrop } = get();
        const apps = useApplicationStore.getState().getApplications();
        let filtered = filterByRegion(apps, selectedRegion);
        filtered = filterByCrop(filtered, selectedCrop);
        return filtered;
      },

      getFilteredReports: () => {
        const { selectedRegion, selectedCrop } = get();
        let filtered = filterByRegion(mockReports, selectedRegion);
        filtered = filterByCrop(filtered, selectedCrop);
        return filtered;
      },

      recalculateFilteredData: () => {
        const { selectedRegion, selectedCrop, baseStats, baseWeeklyArea, baseMonthlyAlerts, baseCropDist, baseRegions } = get();
        const apps = useApplicationStore.getState().applications;
        const drones = useDroneStore.getState().drones;
        const alerts = useEnvironmentStore.getState().alerts;
        const reports = mockReports;

        const regionFilter = (d: { region?: string }) => selectedRegion === '全部' || d.region === selectedRegion;
        const cropFilter = (d: { cropType?: string }) => selectedCrop === '全部' || d.cropType === selectedCrop;

        const filteredApps = apps.filter((a) => regionFilter(a) && cropFilter(a));
        const filteredDrones = drones.filter(regionFilter);
        const filteredAlerts = alerts.filter(regionFilter);
        const filteredReports = reports.filter((r) => regionFilter(r) && cropFilter(r));

        const regionMultiplier = selectedRegion === '全部' ? 1 : baseRegions.find((r) => r.name === selectedRegion) ? 
          baseRegions.find((r) => r.name === selectedRegion)!.area / baseRegions.reduce((sum, r) => sum + r.area, 0) : 0.3;
        
        const cropMultiplier = selectedCrop === '全部' ? 1 : 0.25;

        const multiplier = regionMultiplier * cropMultiplier;

        const filteredStats: DashboardStats = {
          todayArea: Math.round(baseStats.todayArea * multiplier * 100) / 100,
          totalDrones: filteredDrones.length,
          activeDrones: filteredDrones.filter((d) => d.status === 'in_task').length,
          inventoryTurnover: baseStats.inventoryTurnover,
          envAlertsCount: filteredAlerts.filter((a) => a.status !== 'resolved').length,
          farmerSatisfaction: baseStats.farmerSatisfaction,
          pendingApplications: filteredApps.filter((a) => a.status === 'pending' || a.status === 'planning').length,
          completedToday: Math.round(baseStats.completedToday * multiplier),
        };

        const filteredWeeklyArea = baseWeeklyArea.map((d) => ({
          ...d,
          area: Math.round(d.area * multiplier),
        }));

        const filteredCropDist = selectedCrop === '全部' 
          ? baseCropDist 
          : baseCropDist.map((c) => ({
              ...c,
              value: c.name === selectedCrop ? 100 : 0,
            })).filter((c) => c.value > 0);

        const filteredRegions = selectedRegion === '全部'
          ? baseRegions
          : baseRegions.filter((r) => r.name === selectedRegion);

        set({
          filteredData: {
            stats: filteredStats,
            weeklyArea: filteredWeeklyArea,
            monthlyAlerts: baseMonthlyAlerts,
            cropDist: filteredCropDist,
            regions: filteredRegions,
            recentApplications: filteredApps.slice(0, 5),
            recentAlerts: filteredAlerts.filter((a) => a.status !== 'resolved').slice(0, 5),
            activeDrones: filteredDrones.filter((d) => d.status === 'in_task'),
          },
        });
      },

      exportMonthlyReport: () => {
        const { selectedRegion, selectedCrop, selectedDate, getFilteredApplications, getFilteredReports } = get();
        const apps = getFilteredApplications();
        const reports = getFilteredReports();
        const inventory = useApplicationStore.getState();

        const now = new Date();
        const monthStr = `${now.getFullYear()}年${now.getMonth() + 1}月`;

        const totalArea = reports.reduce((sum, r) => sum + r.actualArea, 0);
        const totalCost = reports.reduce((sum, r) => sum + r.settlement.totalCost, 0);
        const pesticideSummary: Record<string, { name: string; amount: number; unit: string; cost: number }> = {};

        reports.forEach((r) => {
          r.pesticideUsage.forEach((p) => {
            if (!pesticideSummary[p.name]) {
              pesticideSummary[p.name] = { name: p.name, amount: 0, unit: p.unit, cost: 0 };
            }
            pesticideSummary[p.name].amount += p.amount;
          });
        });

        let csvContent = '\ufeff';
        csvContent += `${monthStr}植保作业分析报告\n`;
        csvContent += `筛选条件: 区域=${selectedRegion}, 作物=${selectedCrop}, 时间=${selectedDate}\n`;
        csvContent += `生成时间: ${new Date().toLocaleString('zh-CN')}\n\n`;

        csvContent += '=== 一、月度作业概览 ===\n';
        csvContent += `总作业面积,${totalArea.toFixed(1)},亩\n`;
        csvContent += `作业次数,${reports.length},次\n`;
        csvContent += `总费用,¥${totalCost.toFixed(0)},\n`;
        csvContent += `平均费用/亩,¥${(totalCost / Math.max(1, totalArea)).toFixed(2)},\n\n`;

        csvContent += '=== 二、农药使用明细 ===\n';
        csvContent += '农药名称,使用量,单位,占比\n';
        const totalPesticide = Object.values(pesticideSummary).reduce((sum, p) => sum + p.amount, 0);
        Object.values(pesticideSummary).forEach((p) => {
          const percent = ((p.amount / Math.max(0.001, totalPesticide)) * 100).toFixed(1);
          csvContent += `${p.name},${p.amount.toFixed(2)},${p.unit},${percent}%\n`;
        });
        csvContent += '\n';

        csvContent += '=== 三、作业报告明细 ===\n';
        csvContent += '报告编号,地块名称,农户,作物类型,作业面积(亩),作业时长(分钟),费用(元),状态\n';
        reports.forEach((r) => {
          csvContent += `${r.id},${r.plotName},${r.farmerName},${r.cropType},${r.actualArea},${r.flightDuration},${r.settlement.totalCost},${r.status === 'confirmed' ? '已确认' : '待确认'}\n`;
        });
        csvContent += '\n';

        csvContent += '=== 四、植保申请统计 ===\n';
        csvContent += '状态,数量\n';
        const statusCounts: Record<string, number> = {};
        apps.forEach((a) => {
          const statusText = {
            pending: '待处理',
            planning: '方案制定中',
            approved: '已审批',
            in_progress: '作业中',
            completed: '已完成',
            rejected: '已驳回',
          }[a.status] || a.status;
          statusCounts[statusText] = (statusCounts[statusText] || 0) + 1;
        });
        Object.entries(statusCounts).forEach(([status, count]) => {
          csvContent += `${status},${count}\n`;
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${monthStr}植保作业分析报告_${selectedRegion}_${selectedCrop}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
    }),
    {
      name: 'dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        baseStats: state.baseStats,
        selectedRegion: state.selectedRegion,
        selectedCrop: state.selectedCrop,
        selectedDate: state.selectedDate,
      }),
    }
  )
);
