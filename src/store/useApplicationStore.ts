import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Application, WorkPlan, PesticideFormula, ApplicationStatus } from '../types/application';
import { mockApplications, regions, cropTypes, pestTypes } from '../mock/applications';
import { mockDrones } from '../mock/drones';
import { mockInventory } from '../mock/inventory';
import { mockUsers } from '../mock/users';
import { useAuthStore } from './useAuthStore';

interface NewApplicationData {
  plotName: string;
  plotArea: number;
  cropType: string;
  cropStage: string;
  pestType: string;
  pestLevel: 'mild' | 'moderate' | 'severe';
  requirement: string;
  expectedDate: string;
  region: string;
}

interface ApplicationState {
  applications: Application[];
  getApplications: () => Application[];
  getApplicationById: (id: string) => Application | undefined;
  createApplication: (data: NewApplicationData) => Application | null;
  generateWorkPlan: (application: Application) => WorkPlan;
  updateApplicationStatus: (id: string, status: ApplicationStatus) => void;
}

const pesticideMap: Record<string, { id: string; name: string; dosage: number; unit: 'g' | 'ml'; price: number }[]> = {
  '稻飞虱': [{ id: 'p001', name: '吡虫啉', dosage: 30, unit: 'g', price: 25 }],
  '稻瘟病': [{ id: 'p005', name: '三环唑', dosage: 35, unit: 'g', price: 28 }],
  '蚜虫': [{ id: 'p001', name: '吡虫啉', dosage: 25, unit: 'g', price: 25 }],
  '锈病': [{ id: 'p004', name: '百菌清', dosage: 40, unit: 'g', price: 35 }],
  '杂草': [{ id: 'p002', name: '草甘膦', dosage: 200, unit: 'ml', price: 12 }],
  '豆荚螟': [{ id: 'p007', name: '阿维菌素', dosage: 15, unit: 'ml', price: 45 }],
  '菜青虫': [{ id: 'p006', name: '苏云金杆菌', dosage: 100, unit: 'ml', price: 15 }],
  '红蜘蛛': [{ id: 'p007', name: '阿维菌素', dosage: 20, unit: 'ml', price: 45 }],
  '蚜虫+锈病': [
    { id: 'p001', name: '吡虫啉', dosage: 30, unit: 'g', price: 25 },
    { id: 'p004', name: '百菌清', dosage: 40, unit: 'g', price: 35 },
  ],
};

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: mockApplications,

      getApplications: () => {
        const { user } = useAuthStore.getState();
        const { applications } = get();
        
        if (!user) return [];
        if (user.role === 'farmer') {
          return applications.filter((app) => app.farmerId === user.id);
        }
        if (user.role === 'supervisor' || user.role === 'admin') {
          return applications;
        }
        return applications;
      },

      getApplicationById: (id) => {
        const { getApplications } = get();
        return getApplications().find((app) => app.id === id);
      },

      generateWorkPlan: (application) => {
        const availableDrones = mockDrones.filter((d) => d.status === 'idle' && d.region === application.region);
        const drone = availableDrones[0] || mockDrones.filter((d) => d.region === application.region)[0];
        
        const pilots = mockUsers.filter((u) => u.role === 'pilot');
        const pilot = pilots.find((p) => p.region === application.region) || pilots[0];
        
        const pesticideConfigs = pesticideMap[application.pestType] || [
          { id: 'p001', name: '吡虫啉', dosage: 30, unit: 'g', price: 25 },
        ];

        const formulas: PesticideFormula[] = pesticideConfigs.map((cfg) => ({
          pesticideId: cfg.id,
          pesticideName: cfg.name,
          dosage: cfg.dosage,
          unit: cfg.unit,
          price: cfg.price,
          totalAmount: Math.round(cfg.dosage * cfg.price * application.plotArea / 100),
        }));

        const totalCost = formulas.reduce((sum, f) => sum + f.totalAmount, 0);

        return {
          id: `plan${Date.now()}`,
          applicationId: application.id,
          droneIds: drone ? [drone.id] : ['d001'],
          droneNames: drone ? [drone.name] : ['植保-001'],
          pilotIds: pilot ? [pilot.id] : ['u006'],
          pilotNames: pilot ? [pilot.name] : ['陈飞手'],
          scheduledDate: application.expectedDate,
          estimatedDuration: Math.round(application.plotArea * 2.5),
          estimatedArea: application.plotArea,
          flightHeight: 3,
          sprayVolume: 1.5,
          formulas,
          totalCost,
          status: 'pending',
          createdAt: new Date().toLocaleDateString('zh-CN'),
        };
      },

      createApplication: (data) => {
        const { user } = useAuthStore.getState();
        if (!user || user.role !== 'farmer') return null;

        const newId = `app${String(get().applications.length + 1).padStart(3, '0')}`;
        const newPlotId = `plot${String(get().applications.length + 1).padStart(3, '0')}`;

        const newApplication: Application = {
          id: newId,
          farmerId: user.id,
          farmerName: user.name,
          plotId: newPlotId,
          plotName: data.plotName,
          plotArea: data.plotArea,
          cropType: data.cropType,
          cropStage: data.cropStage,
          pestType: data.pestType,
          pestLevel: data.pestLevel,
          requirement: data.requirement,
          expectedDate: data.expectedDate,
          status: 'planning',
          region: data.region,
          createdAt: new Date().toLocaleDateString('zh-CN'),
        };

        const workPlan = get().generateWorkPlan(newApplication);
        newApplication.workPlan = workPlan;

        set((state) => ({
          applications: [newApplication, ...state.applications],
        }));

        return newApplication;
      },

      updateApplicationStatus: (id, status) => {
        set((state) => ({
          applications: state.applications.map((app) =>
            app.id === id ? { ...app, status } : app
          ),
        }));
      },
    }),
    {
      name: 'application-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        applications: state.applications,
      }),
    }
  )
);

export { regions, cropTypes, pestTypes };
