import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Drone, DroneAlert, FlightRecord } from '../types/drone';
import { mockDrones, mockDroneAlerts, generateFlightPath } from '../mock/drones';
import { useAuthStore } from './useAuthStore';

interface BackupDispatch {
  id: string;
  alertId: string;
  originalDroneId: string;
  originalDroneName: string;
  backupDroneId: string;
  backupDroneName: string;
  plotName: string;
  reason: string;
  dispatchedAt: string;
  status: 'dispatched' | 'in_progress' | 'completed';
}

interface DroneState {
  drones: Drone[];
  alerts: DroneAlert[];
  backupDispatches: BackupDispatch[];
  getDrones: () => Drone[];
  getDroneById: (id: string) => Drone | undefined;
  getAlerts: () => DroneAlert[];
  getBackupDispatches: () => BackupDispatch[];
  getFlightRecords: (droneId: string) => FlightRecord[];
  resolveAlert: (alertId: string) => boolean;
  handleAlertWithBackup: (alertId: string) => BackupDispatch | null;
  updateDroneStatus: (droneId: string, status: Drone['status']) => void;
  refreshDroneData: () => void;
}

export const useDroneStore = create<DroneState>()(
  persist(
    (set, get) => ({
      drones: mockDrones,
      alerts: mockDroneAlerts,
      backupDispatches: [],

      getDrones: () => {
        const { user } = useAuthStore.getState();
        const { drones } = get();
        if (user?.role === 'pilot') {
          return drones.filter((d) => d.pilotId === user.id);
        }
        return drones;
      },

      getDroneById: (id) => {
        return get().drones.find((d) => d.id === id);
      },

      getAlerts: () => {
        return get().alerts;
      },

      getBackupDispatches: () => {
        return get().backupDispatches;
      },

      getFlightRecords: (droneId) => {
        const drone = get().getDroneById(droneId);
        if (!drone) return [];
        const path = generateFlightPath(drone.currentLocation.lat, drone.currentLocation.lng, 30);
        return path.map((p, i) => ({
          id: `rec${droneId}-${i}`,
          droneId,
          taskId: drone.currentTaskId || `task${droneId}`,
          timestamp: p.time,
          location: { lat: p.lat, lng: p.lng },
          altitude: 3 + Math.random() * 2,
          speed: 8 + Math.random() * 4,
          battery: Math.max(10, drone.battery - i * 2),
          liquid: Math.max(0, drone.currentLiquid - i * 0.5),
          sprayRate: drone.sprayRate,
        }));
      },

      resolveAlert: (alertId) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, resolved: true } : a
          ),
        }));
        return true;
      },

      handleAlertWithBackup: (alertId) => {
        const { drones, alerts } = get();
        const alert = alerts.find((a) => a.id === alertId);
        if (!alert || alert.resolved) return null;

        const originalDrone = drones.find((d) => d.id === alert.droneId);
        if (!originalDrone) return null;

        const backupDrone = drones.find(
          (d) =>
            d.status === 'idle' &&
            d.region === originalDrone.region &&
            d.id !== originalDrone.id &&
            d.battery > 50
        );

        if (!backupDrone) return null;

        const dispatch: BackupDispatch = {
          id: `dispatch${Date.now()}`,
          alertId,
          originalDroneId: originalDrone.id,
          originalDroneName: originalDrone.name,
          backupDroneId: backupDrone.id,
          backupDroneName: backupDrone.name,
          plotName: originalDrone.currentPlotName || '未知地块',
          reason: alert.message,
          dispatchedAt: new Date().toLocaleString('zh-CN'),
          status: 'dispatched',
        };

        set((state) => ({
          backupDispatches: [dispatch, ...state.backupDispatches],
          alerts: state.alerts.map((a) =>
            a.id === alertId ? { ...a, resolved: true } : a
          ),
          drones: state.drones.map((d) => {
            if (d.id === originalDrone.id) {
              return { ...d, status: 'maintenance' as const };
            }
            if (d.id === backupDrone.id) {
              return {
                ...d,
                status: 'in_task' as const,
                currentTaskId: originalDrone.currentTaskId,
                currentPlotName: originalDrone.currentPlotName,
                pilotId: originalDrone.pilotId,
                pilotName: originalDrone.pilotName,
              };
            }
            return d;
          }),
        }));

        return dispatch;
      },

      updateDroneStatus: (droneId, status) => {
        set((state) => ({
          drones: state.drones.map((d) =>
            d.id === droneId ? { ...d, status } : d
          ),
        }));
      },

      refreshDroneData: () => {
        set((state) => ({
          drones: state.drones.map((d) => ({
            ...d,
            battery: d.status === 'charging' 
              ? Math.min(100, d.battery + Math.random() * 5) 
              : d.status === 'in_task'
              ? Math.max(0, d.battery - Math.random() * 2)
              : d.battery,
            currentLiquid: d.status === 'in_task' 
              ? Math.max(0, d.currentLiquid - Math.random() * 0.5)
              : d.currentLiquid,
            currentLocation: {
              lat: d.currentLocation.lat + (Math.random() - 0.5) * 0.002,
              lng: d.currentLocation.lng + (Math.random() - 0.5) * 0.002,
            },
          })),
        }));
      },
    }),
    {
      name: 'drone-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        drones: state.drones,
        alerts: state.alerts,
        backupDispatches: state.backupDispatches,
      }),
    }
  )
);
