import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Inventory, OutboundOrder, PurchaseOrder, ApprovalRecord } from '../types/inventory';
import { mockInventory, mockOutboundOrders, mockPurchaseOrders } from '../mock/inventory';
import { useAuthStore } from './useAuthStore';

interface InventoryState {
  inventory: Inventory[];
  outboundOrders: OutboundOrder[];
  purchaseOrders: PurchaseOrder[];
  approveOutbound: (orderId: string, opinion: string) => boolean;
  rejectOutbound: (orderId: string, opinion: string) => boolean;
  approvePurchase: (orderId: string, opinion: string) => boolean;
  rejectPurchase: (orderId: string, opinion: string) => boolean;
  getOutboundOrdersByRole: () => OutboundOrder[];
  getPurchaseOrdersByRole: () => PurchaseOrder[];
  canApproveOutbound: (order: OutboundOrder) => boolean;
  canApprovePurchase: (order: PurchaseOrder) => boolean;
}

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      inventory: mockInventory,
      outboundOrders: mockOutboundOrders,
      purchaseOrders: mockPurchaseOrders,

      canApproveOutbound: (order) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (order.status !== 'pending') return false;
        if (user.role === 'supervisor' && order.currentLevel === 1) return true;
        if (user.role === 'env_officer' && order.currentLevel === 2) return true;
        return false;
      },

      canApprovePurchase: (order) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;
        if (order.status !== 'pending') return false;
        if (user.role === 'supervisor' && order.currentLevel === 1) return true;
        if (user.role === 'supervisor' && order.currentLevel === 2) return true;
        if (user.role === 'admin' && order.currentLevel === 3) return true;
        return false;
      },

      getOutboundOrdersByRole: () => {
        const { user } = useAuthStore.getState();
        const { outboundOrders } = get();
        return outboundOrders;
      },

      getPurchaseOrdersByRole: () => {
        const { user } = useAuthStore.getState();
        const { purchaseOrders } = get();
        return purchaseOrders;
      },

      approveOutbound: (orderId, opinion) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;

        set((state) => {
          const orders = [...state.outboundOrders];
          const orderIndex = orders.findIndex((o) => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...orders[orderIndex] };
          const approvals = [...order.approvals];
          const approvalIndex = approvals.findIndex((a) => a.status === 'pending');
          
          if (approvalIndex === -1) return state;

          const roleNames: Record<string, string> = {
            supervisor: '植保主管',
            env_officer: '环保监管员',
            admin: '系统管理员',
          };

          approvals[approvalIndex] = {
            ...approvals[approvalIndex],
            approverId: user.id,
            approverName: user.name,
            approverRole: roleNames[user.role] || approvals[approvalIndex].approverRole,
            status: 'approved',
            opinion,
            approvedAt: new Date().toLocaleString('zh-CN'),
          };

          const nextLevel = order.currentLevel + 1;
          const totalLevels = 2;
          const isComplete = nextLevel > totalLevels;

          orders[orderIndex] = {
            ...order,
            approvals,
            currentLevel: isComplete ? totalLevels + 1 : nextLevel,
            status: isComplete ? 'approved' : 'pending',
          };

          return { outboundOrders: orders };
        });

        return true;
      },

      rejectOutbound: (orderId, opinion) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;

        set((state) => {
          const orders = [...state.outboundOrders];
          const orderIndex = orders.findIndex((o) => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...orders[orderIndex] };
          const approvals = [...order.approvals];
          const approvalIndex = approvals.findIndex((a) => a.status === 'pending');
          
          if (approvalIndex === -1) return state;

          const roleNames: Record<string, string> = {
            supervisor: '植保主管',
            env_officer: '环保监管员',
            admin: '系统管理员',
          };

          approvals[approvalIndex] = {
            ...approvals[approvalIndex],
            approverId: user.id,
            approverName: user.name,
            approverRole: roleNames[user.role] || approvals[approvalIndex].approverRole,
            status: 'rejected',
            opinion,
            approvedAt: new Date().toLocaleString('zh-CN'),
          };

          orders[orderIndex] = {
            ...order,
            approvals,
            status: 'rejected',
          };

          return { outboundOrders: orders };
        });

        return true;
      },

      approvePurchase: (orderId, opinion) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;

        set((state) => {
          const orders = [...state.purchaseOrders];
          const orderIndex = orders.findIndex((o) => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...orders[orderIndex] };
          const approvals = [...order.approvals];
          const approvalIndex = approvals.findIndex((a) => a.status === 'pending');
          
          if (approvalIndex === -1) return state;

          const roleNames: Record<string, string> = {
            supervisor: '植保主管',
            admin: '总经理',
          };

          approvals[approvalIndex] = {
            ...approvals[approvalIndex],
            approverId: user.id,
            approverName: user.name,
            approverRole: roleNames[user.role] || approvals[approvalIndex].approverRole,
            status: 'approved',
            opinion,
            approvedAt: new Date().toLocaleString('zh-CN'),
          };

          const nextLevel = order.currentLevel + 1;
          const totalLevels = 2;
          const isComplete = nextLevel > totalLevels;

          orders[orderIndex] = {
            ...order,
            approvals,
            currentLevel: isComplete ? totalLevels + 1 : nextLevel,
            status: isComplete ? 'approved' : 'pending',
          };

          return { purchaseOrders: orders };
        });

        return true;
      },

      rejectPurchase: (orderId, opinion) => {
        const { user } = useAuthStore.getState();
        if (!user) return false;

        set((state) => {
          const orders = [...state.purchaseOrders];
          const orderIndex = orders.findIndex((o) => o.id === orderId);
          if (orderIndex === -1) return state;

          const order = { ...orders[orderIndex] };
          const approvals = [...order.approvals];
          const approvalIndex = approvals.findIndex((a) => a.status === 'pending');
          
          if (approvalIndex === -1) return state;

          const roleNames: Record<string, string> = {
            supervisor: '植保主管',
            admin: '总经理',
          };

          approvals[approvalIndex] = {
            ...approvals[approvalIndex],
            approverId: user.id,
            approverName: user.name,
            approverRole: roleNames[user.role] || approvals[approvalIndex].approverRole,
            status: 'rejected',
            opinion,
            approvedAt: new Date().toLocaleString('zh-CN'),
          };

          orders[orderIndex] = {
            ...order,
            approvals,
            status: 'rejected',
          };

          return { purchaseOrders: orders };
        });

        return true;
      },
    }),
    {
      name: 'inventory-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        outboundOrders: state.outboundOrders,
        purchaseOrders: state.purchaseOrders,
        inventory: state.inventory,
      }),
    }
  )
);
