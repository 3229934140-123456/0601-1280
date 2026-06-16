export type ApplicationStatus = 'pending' | 'planning' | 'approved' | 'rejected' | 'in_progress' | 'completed';
export type PestLevel = 'mild' | 'moderate' | 'severe';

export interface PesticideFormula {
  pesticideId: string;
  pesticideName: string;
  dosage: number;
  unit: 'g' | 'ml';
  price: number;
  totalAmount: number;
}

export interface WorkPlan {
  id: string;
  applicationId: string;
  droneIds: string[];
  droneNames: string[];
  pilotIds: string[];
  pilotNames: string[];
  scheduledDate: string;
  estimatedDuration: number;
  estimatedArea: number;
  flightHeight: number;
  sprayVolume: number;
  formulas: PesticideFormula[];
  totalCost: number;
  status: 'pending' | 'approved' | 'rejected';
  supervisorOpinion?: string;
  createdAt: string;
}

export interface Application {
  id: string;
  farmerId: string;
  farmerName: string;
  plotId: string;
  plotName: string;
  plotArea: number;
  cropType: string;
  cropStage: string;
  pestType: string;
  pestLevel: PestLevel;
  requirement: string;
  expectedDate: string;
  status: ApplicationStatus;
  workPlan?: WorkPlan;
  region: string;
  createdAt: string;
}
