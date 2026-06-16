export type EnvStatus = 'normal' | 'warning' | 'exceeded';

export interface WaterQuality {
  ph: number;
  dissolvedOxygen: number;
  pesticideResidue: number;
  nitrite: number;
}

export interface SoilQuality {
  ph: number;
  organicMatter: number;
  pesticideResidue: number;
  heavyMetals: number;
}

export interface EnvironmentMonitor {
  id: string;
  plotId: string;
  plotName: string;
  region: string;
  monitorTime: string;
  waterQuality: WaterQuality;
  soilQuality: SoilQuality;
  status: EnvStatus;
}

export interface EnvAlert {
  id: string;
  plotId: string;
  plotName: string;
  region: string;
  type: 'water' | 'soil';
  indicator: string;
  value: number;
  standard: number;
  level: 'warning' | 'danger';
  status: 'pending' | 'processing' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

export interface RectificationOrder {
  id: string;
  alertId: string;
  plotId: string;
  plotName: string;
  farmerId: string;
  farmerName: string;
  description: string;
  requirement: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'verified';
  createdAt: string;
  completedAt?: string;
  verifiedAt?: string;
}
