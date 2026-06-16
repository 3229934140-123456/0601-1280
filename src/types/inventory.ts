export type PesticideCategory = 'insecticide' | 'fungicide' | 'herbicide' | 'other';
export type InventoryStatus = 'normal' | 'warning' | 'shortage';

export interface Inventory {
  id: string;
  pesticideId: string;
  pesticideName: string;
  category: PesticideCategory;
  specification: string;
  unit: 'kg' | 'L' | 'box' | 'bottle';
  totalQuantity: number;
  availableQuantity: number;
  reservedQuantity: number;
  safetyStock: number;
  unitPrice: number;
  supplier: string;
  productionDate: string;
  expiryDate: string;
  batchNumber: string;
  warehouse: string;
  status: InventoryStatus;
}

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'escalated';

export interface ApprovalRecord {
  id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  status: ApprovalStatus;
  opinion: string;
  approvedAt?: string;
}

export interface OutboundOrder {
  id: string;
  applicationId: string;
  applicationPlotName: string;
  items: {
    inventoryId: string;
    pesticideName: string;
    quantity: number;
    unit: string;
  }[];
  totalCost: number;
  applicantId: string;
  applicantName: string;
  status: ApprovalStatus;
  currentLevel: number;
  approvals: ApprovalRecord[];
  createdAt: string;
  escalatedAt?: string;
}

export interface PurchaseOrder {
  id: string;
  inventoryId: string;
  pesticideName: string;
  quantity: number;
  unit: string;
  estimatedPrice: number;
  supplier: string;
  reason: string;
  applicantId: string;
  applicantName: string;
  status: ApprovalStatus;
  currentLevel: number;
  approvals: ApprovalRecord[];
  createdAt: string;
  escalatedAt?: string;
}
