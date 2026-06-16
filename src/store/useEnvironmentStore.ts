import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EnvironmentMonitor, EnvAlert, RectificationOrder } from '../types/environment';
import { mockEnvMonitors, mockEnvAlerts, mockRectificationOrders } from '../mock/environment';
import { useAuthStore } from './useAuthStore';

interface LockedPlot {
  plotId: string;
  plotName: string;
  region: string;
  lockedAt: string;
  lockedBy: string;
  reason: string;
  orderId?: string;
}

interface EnvironmentState {
  monitors: EnvironmentMonitor[];
  alerts: EnvAlert[];
  rectificationOrders: RectificationOrder[];
  lockedPlots: LockedPlot[];
  getMonitors: () => EnvironmentMonitor[];
  getAlerts: () => EnvAlert[];
  getOrders: () => RectificationOrder[];
  isPlotLocked: (plotId: string) => boolean;
  lockPlot: (plotId: string, reason: string) => boolean;
  unlockPlot: (plotId: string) => boolean;
  createRectificationOrder: (alertId: string, plotId: string, description: string, requirement: string) => RectificationOrder | null;
  approveRectificationOrder: (orderId: string) => boolean;
  resolveAlert: (alertId: string) => boolean;
  processAlert: (alertId: string) => boolean;
}

export const useEnvironmentStore = create<EnvironmentState>()(
  persist(
    (set, get) => ({
      monitors: mockEnvMonitors,
      alerts: mockEnvAlerts,
      rectificationOrders: mockRectificationOrders,
      lockedPlots: [
        {
          plotId: 'plot003',
          plotName: '北庄村3号田',
          region: '华北区',
          lockedAt: '2025-06-17 11:00:00',
          lockedBy: '系统',
          reason: '水体农药残留超标2.5倍，土壤重金属超标0.5倍',
          orderId: 'rect001',
        },
      ],

      getMonitors: () => {
        const { user } = useAuthStore.getState();
        const { monitors } = get();
        return monitors;
      },

      getAlerts: () => {
        const { user } = useAuthStore.getState();
        const { alerts } = get();
        return alerts;
      },

      getOrders: () => {
        const { user } = useAuthStore.getState();
        const { rectificationOrders } = get();
        if (user?.role === 'farmer') {
          return rectificationOrders.filter((o) => o.farmerId === user.id);
        }
        return rectificationOrders;
      },

      isPlotLocked: (plotId) => {
        return get().lockedPlots.some((p) => p.plotId === plotId);
      },

      lockPlot: (plotId, reason) => {
        const { user } = useAuthStore.getState();
        const { monitors } = get();
        const monitor = monitors.find((m) => m.plotId === plotId);
        if (!monitor) return false;

        const existingLock = get().lockedPlots.find((p) => p.plotId === plotId);
        if (existingLock) return false;

        const lockedPlot: LockedPlot = {
          plotId,
          plotName: monitor.plotName,
          region: monitor.region,
          lockedAt: new Date().toLocaleString('zh-CN'),
          lockedBy: user?.name || '系统',
          reason,
        };

        set((state) => ({
          lockedPlots: [...state.lockedPlots, lockedPlot],
          alerts: state.alerts.map((a) =>
            a.plotId === plotId && a.status === 'pending' ? { ...a, status: 'processing' } : a
          ),
        }));

        return true;
      },

      unlockPlot: (plotId) => {
        const { lockedPlots, alerts, rectificationOrders } = get();
        
        const hasUnverifiedOrder = rectificationOrders.some(
          (o) => o.plotId === plotId && o.status !== 'verified'
        );
        if (hasUnverifiedOrder) return false;

        set((state) => ({
          lockedPlots: state.lockedPlots.filter((p) => p.plotId !== plotId),
          alerts: state.alerts.map((a) =>
            a.plotId === plotId ? { ...a, status: 'resolved', resolvedAt: new Date().toLocaleString('zh-CN') } : a
          ),
        }));

        return true;
      },

      createRectificationOrder: (alertId, plotId, description, requirement) => {
        const { monitors, alerts } = get();
        const { user } = useAuthStore.getState();
        const monitor = monitors.find((m) => m.plotId === plotId);
        const alert = alerts.find((a) => a.id === alertId);
        if (!monitor || !alert) return null;

        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);

        const newOrder: RectificationOrder = {
          id: `rect${Date.now()}`,
          alertId,
          plotId,
          plotName: monitor.plotName,
          farmerId: `u0${Math.floor(Math.random() * 3) + 9}`,
          farmerName: monitor.plotName.includes('东河') ? '孙农户' : monitor.plotName.includes('南湖') ? '朱农户' : '马农户',
          description,
          requirement,
          deadline: deadline.toLocaleDateString('zh-CN'),
          status: 'in_progress',
          createdAt: new Date().toLocaleString('zh-CN'),
        };

        set((state) => {
          const lockedPlot = state.lockedPlots.find((p) => p.plotId === plotId);
          return {
            rectificationOrders: [newOrder, ...state.rectificationOrders],
            alerts: state.alerts.map((a) =>
              a.id === alertId ? { ...a, status: 'processing' } : a
            ),
            lockedPlots: lockedPlot
              ? state.lockedPlots.map((p) =>
                  p.plotId === plotId ? { ...p, orderId: newOrder.id } : p
                )
              : [
                  ...state.lockedPlots,
                  {
                    plotId,
                    plotName: monitor.plotName,
                    region: monitor.region,
                    lockedAt: new Date().toLocaleString('zh-CN'),
                    lockedBy: useAuthStore.getState().user?.name || '系统',
                    reason: description,
                    orderId: newOrder.id,
                  },
                ],
          };
        });

        return newOrder;
      },

      approveRectificationOrder: (orderId) => {
        const { user } = useAuthStore.getState();
        if (!user || (user.role !== 'env_officer' && user.role !== 'admin' && user.role !== 'supervisor')) {
          return false;
        }

        set((state) => {
          const order = state.rectificationOrders.find((o) => o.id === orderId);
          if (!order) return state;

          const updatedOrders = state.rectificationOrders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'verified' as const,
                  verifiedAt: new Date().toLocaleString('zh-CN'),
                }
              : o
          );

          const allOrdersForPlot = updatedOrders.filter((o) => o.plotId === order.plotId);
          const allVerified = allOrdersForPlot.every((o) => o.status === 'verified');

          return {
            rectificationOrders: updatedOrders,
            lockedPlots: allVerified
              ? state.lockedPlots.filter((p) => p.plotId !== order.plotId)
              : state.lockedPlots,
            alerts: allVerified
              ? state.alerts.map((a) =>
                  a.plotId === order.plotId
                    ? { ...a, status: 'resolved' as const, resolvedAt: new Date().toLocaleString('zh-CN') }
                    : a
                )
              : state.alerts,
          };
        });

        return true;
      },

      resolveAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, status: 'resolved', resolvedAt: new Date().toLocaleString('zh-CN') } : a
          ),
        }));
        return true;
      },

      processAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, status: 'processing' } : a
          ),
        }));
        return true;
      },
    }),
    {
      name: 'environment-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        monitors: state.monitors,
        alerts: state.alerts,
        rectificationOrders: state.rectificationOrders,
        lockedPlots: state.lockedPlots,
      }),
    }
  )
);
