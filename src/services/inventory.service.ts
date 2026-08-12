import { InventoryMovement, MovementType, PaginatedResponse } from '../types';
import apiClient from './api';

const MOCK_MOVEMENTS: InventoryMovement[] = [
  {
    id: 1,
    productId: 1,
    productName: 'Surf Excel Detergent 1kg',
    productSku: 'SE-DET-001',
    quantity: 100,
    movementType: 'IN',
    reason: 'Purchase Order PO-2026-001',
    createdBy: 'Admin',
    createdAt: '2026-08-01T09:00:00Z',
  },
  {
    id: 2,
    productId: 2,
    productName: 'Ariel Matic Powder 2kg',
    productSku: 'AM-DET-002',
    quantity: 50,
    movementType: 'OUT',
    reason: 'Sales Challan CH-2026-0003',
    createdBy: 'Sales Team',
    createdAt: '2026-08-03T11:00:00Z',
  },
  {
    id: 3,
    productId: 3,
    productName: 'Dettol Antiseptic Liquid 500ml',
    productSku: 'DT-ANT-003',
    quantity: 30,
    movementType: 'OUT',
    reason: 'Sales Challan CH-2026-0004',
    createdBy: 'Sales Team',
    createdAt: '2026-08-04T10:30:00Z',
  },
  {
    id: 4,
    productId: 4,
    productName: 'Vim Dishwash Bar 200g',
    productSku: 'VM-DW-004',
    quantity: 200,
    movementType: 'IN',
    reason: 'Purchase Order PO-2026-002',
    createdBy: 'Warehouse Team',
    createdAt: '2026-08-05T08:00:00Z',
  },
  {
    id: 5,
    productId: 5,
    productName: 'Lifebuoy Soap 100g',
    productSku: 'LB-SOAP-005',
    quantity: 20,
    movementType: 'OUT',
    reason: 'Sales Challan CH-2026-0005',
    createdBy: 'Sales Team',
    createdAt: '2026-08-06T14:00:00Z',
  },
  {
    id: 6,
    productId: 1,
    productName: 'Surf Excel Detergent 1kg',
    productSku: 'SE-DET-001',
    quantity: 50,
    movementType: 'OUT',
    reason: 'Sales Challan CH-2026-0006',
    createdBy: 'Sales Team',
    createdAt: '2026-08-07T09:45:00Z',
  },
  {
    id: 7,
    productId: 8,
    productName: 'Tata Salt 1kg',
    productSku: 'TS-SAL-008',
    quantity: 100,
    movementType: 'IN',
    reason: 'Purchase Order PO-2026-003',
    createdBy: 'Warehouse Team',
    createdAt: '2026-08-08T07:30:00Z',
  },
  {
    id: 8,
    productId: 6,
    productName: 'Colgate Toothpaste 150g',
    productSku: 'CG-TP-006',
    quantity: 10,
    movementType: 'OUT',
    reason: 'Damage adjustment',
    createdBy: 'Admin',
    createdAt: '2026-08-09T12:00:00Z',
  },
];

let mockMovements = [...MOCK_MOVEMENTS];
let nextMovementId = 9;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getInventoryMovements(params?: {
  search?: string;
  movementType?: MovementType | '';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<InventoryMovement>> {
  // Replace with: const response = await apiClient.get('/inventory/movements', { params }); return response.data;
  await delay(400);
  let filtered = [...mockMovements].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.productName.toLowerCase().includes(q) ||
        m.productSku.toLowerCase().includes(q) ||
        m.reason?.toLowerCase().includes(q)
    );
  }
  if (params?.movementType) {
    filtered = filtered.filter((m) => m.movementType === params.movementType);
  }

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return {
    data,
    meta: { page, limit, total: filtered.length, totalPages: Math.ceil(filtered.length / limit) },
  };
}

export async function getInventorySummary(): Promise<{
  totalProducts: number;
  lowStock: number;
  outOfStock: number;
}> {
  // Replace with: const response = await apiClient.get('/inventory/summary'); return response.data;
  await delay(200);
  // Dynamically computed from product service
  const { getMockProducts } = await import('./product.service');
  const products = getMockProducts();
  return {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.currentStock > 0 && p.currentStock <= p.minimumStock).length,
    outOfStock: products.filter((p) => p.currentStock === 0).length,
  };
}

export function addMockMovement(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): InventoryMovement {
  const newMovement: InventoryMovement = {
    ...movement,
    id: nextMovementId++,
    createdAt: new Date().toISOString(),
  };
  mockMovements.unshift(newMovement);
  return newMovement;
}
