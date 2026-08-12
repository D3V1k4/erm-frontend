import { Challan, ChallanFormData, ChallanStatus, PaginatedResponse } from '../types';
import apiClient from './api';
import { adjustStock, getMockProducts } from './product.service';
import { addMockMovement } from './inventory.service';

const MOCK_CHALLANS: Challan[] = [
  {
    id: 1,
    challanNumber: 'CH-2026-0001',
    customerId: 1,
    customerName: 'Kumar Traders',
    items: [
      { id: 1, productId: 1, productName: 'Surf Excel Detergent 1kg', productSku: 'SE-DET-001', unitPrice: 148, quantity: 50 },
      { id: 2, productId: 4, productName: 'Vim Dishwash Bar 200g', productSku: 'VM-DW-004', unitPrice: 28, quantity: 100 },
    ],
    totalQuantity: 150,
    status: 'confirmed',
    createdBy: 'Sales Team',
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T10:30:00Z',
  },
  {
    id: 2,
    challanNumber: 'CH-2026-0002',
    customerId: 2,
    customerName: 'Mehta Textiles Pvt Ltd',
    items: [
      { id: 3, productId: 6, productName: 'Colgate Toothpaste 150g', productSku: 'CG-TP-006', unitPrice: 89, quantity: 30 },
    ],
    totalQuantity: 30,
    status: 'draft',
    createdBy: 'Sales Team',
    createdAt: '2026-08-05T09:00:00Z',
    updatedAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 3,
    challanNumber: 'CH-2026-0003',
    customerId: 5,
    customerName: 'Arif Wholesale Supplies',
    items: [
      { id: 4, productId: 2, productName: 'Ariel Matic Powder 2kg', productSku: 'AM-DET-002', unitPrice: 295, quantity: 20 },
      { id: 5, productId: 7, productName: 'Maggi Noodles 70g (Pack of 12)', productSku: 'MG-NOO-007', unitPrice: 150, quantity: 40 },
    ],
    totalQuantity: 60,
    status: 'confirmed',
    createdBy: 'Admin',
    createdAt: '2026-08-06T08:00:00Z',
    updatedAt: '2026-08-06T09:00:00Z',
  },
  {
    id: 4,
    challanNumber: 'CH-2026-0004',
    customerId: 3,
    customerName: 'Singh General Store',
    items: [
      { id: 6, productId: 5, productName: 'Lifebuoy Soap 100g', productSku: 'LB-SOAP-005', unitPrice: 42, quantity: 24 },
    ],
    totalQuantity: 24,
    status: 'cancelled',
    createdBy: 'Sales Team',
    createdAt: '2026-08-07T11:00:00Z',
    updatedAt: '2026-08-07T12:00:00Z',
  },
  {
    id: 5,
    challanNumber: 'CH-2026-0005',
    customerId: 1,
    customerName: 'Kumar Traders',
    items: [
      { id: 7, productId: 1, productName: 'Surf Excel Detergent 1kg', productSku: 'SE-DET-001', unitPrice: 148, quantity: 30 },
      { id: 8, productId: 8, productName: 'Tata Salt 1kg', productSku: 'TS-SAL-008', unitPrice: 22, quantity: 50 },
    ],
    totalQuantity: 80,
    status: 'draft',
    createdBy: 'Sales Team',
    createdAt: '2026-08-09T14:00:00Z',
    updatedAt: '2026-08-09T14:00:00Z',
  },
];

let mockChallans = [...MOCK_CHALLANS];
let nextChallanId = 6;
let nextChallanNum = 6;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatChallanNumber(num: number): string {
  return `CH-2026-${String(num).padStart(4, '0')}`;
}

export async function getChallans(params?: {
  search?: string;
  status?: ChallanStatus | '';
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Challan>> {
  await delay(400);
  let filtered = [...mockChallans].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.challanNumber.toLowerCase().includes(q) ||
        c.customerName.toLowerCase().includes(q)
    );
  }
  if (params?.status) {
    filtered = filtered.filter((c) => c.status === params.status);
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

export async function getChallanById(id: number): Promise<Challan> {
  await delay(300);
  const challan = mockChallans.find((c) => c.id === id);
  if (!challan) throw new Error('Challan not found');
  return challan;
}

export async function createChallan(
  data: ChallanFormData,
  createdBy: string,
  saveDraft: boolean
): Promise<Challan> {
  await delay(700);
  if (!data.customerId) throw new Error('Customer is required');
  if (!data.items.length) throw new Error('At least one product is required');

  const products = getMockProducts();
  const customerService = await import('./customer.service');
  const resolvedCustomer = await customerService.getCustomerById(data.customerId!);

  const items = data.items.map((item, idx) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      id: idx + 1,
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      availableStock: product?.currentStock,
    };
  });

  const newChallan: Challan = {
    id: nextChallanId++,
    challanNumber: formatChallanNumber(nextChallanNum++),
    customerId: data.customerId,
    customerName: resolvedCustomer.businessName || resolvedCustomer.name,
    items,
    totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
    status: saveDraft ? 'draft' : 'confirmed',
    createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!saveDraft) {
    // Validate and deduct stock
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error(`Product not found: ${item.productName}`);
      if (product.currentStock < item.quantity) {
        throw new Error(`Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`);
      }
    }
    for (const item of items) {
      adjustStock(item.productId, -item.quantity);
      addMockMovement({
        productId: item.productId,
        productName: item.productName,
        productSku: item.productSku,
        quantity: item.quantity,
        movementType: 'OUT',
        reason: `Sales Challan ${newChallan.challanNumber}`,
        createdBy,
      });
    }
  }

  mockChallans.push(newChallan);
  return newChallan;
}

export async function confirmChallan(id: number, confirmedBy: string): Promise<Challan> {
  await delay(700);
  const idx = mockChallans.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Challan not found');
  const challan = mockChallans[idx];
  if (challan.status !== 'draft') throw new Error('Only draft challans can be confirmed');

  const products = getMockProducts();
  // Validate stock
  for (const item of challan.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) throw new Error(`Product not found: ${item.productName}`);
    if (product.currentStock < item.quantity) {
      throw new Error(`Insufficient stock for "${product.name}". Available: ${product.currentStock}, Requested: ${item.quantity}`);
    }
  }
  // Deduct stock
  for (const item of challan.items) {
    adjustStock(item.productId, -item.quantity);
    addMockMovement({
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      quantity: item.quantity,
      movementType: 'OUT',
      reason: `Sales Challan ${challan.challanNumber} confirmed`,
      createdBy: confirmedBy,
    });
  }

  mockChallans[idx] = {
    ...challan,
    status: 'confirmed',
    updatedAt: new Date().toISOString(),
  };
  return mockChallans[idx];
}

export async function cancelChallan(id: number): Promise<Challan> {
  await delay(500);
  const idx = mockChallans.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Challan not found');
  if (mockChallans[idx].status === 'confirmed') throw new Error('Confirmed challans cannot be cancelled');
  mockChallans[idx] = {
    ...mockChallans[idx],
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
  };
  return mockChallans[idx];
}

export async function getDashboardStats() {
  await delay(300);
  const products = getMockProducts();
  return {
    totalCustomers: 5,
    totalProducts: products.length,
    pendingChallans: mockChallans.filter((c) => c.status === 'draft').length,
    lowStockProducts: products.filter((p) => p.currentStock <= p.minimumStock).length,
  };
}

export function getRecentChallans(limit = 5): Challan[] {
  return [...mockChallans]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}
