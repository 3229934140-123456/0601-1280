export interface Settlement {
  id: string;
  totalCost: number;
  pesticideCost: number;
  serviceCost: number;
  discount: number;
  actualPayment: number;
  status: 'unpaid' | 'paid';
}

export interface WorkReport {
  id: string;
  applicationId: string;
  taskId: string;
  plotName: string;
  farmerId: string;
  farmerName: string;
  droneIds: string[];
  droneNames: string[];
  pilotNames: string[];
  startTime: string;
  endTime: string;
  actualArea: number;
  flightDuration: number;
  totalSprayVolume: number;
  pesticideUsage: { name: string; amount: number; unit: string }[];
  effectEvaluation: string;
  settlement: Settlement;
  status: 'draft' | 'confirmed';
  region: string;
  cropType: string;
}

export interface DashboardStats {
  todayArea: number;
  totalDrones: number;
  activeDrones: number;
  inventoryTurnover: number;
  envAlertsCount: number;
  farmerSatisfaction: number;
  pendingApplications: number;
  completedToday: number;
}
