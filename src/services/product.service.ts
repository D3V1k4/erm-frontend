import { Product, ProductFormData, PaginatedResponse, getStockStatus } from '../types';
import apiClient from './api';

const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Surf Excel Detergent 1kg',
    sku: 'SE-DET-001',
    category: 'Detergents',
    unitPrice: 148,
    currentStock: 250,
    minimumStock: 50,
    warehouseLocation: 'Section A - Rack 3',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-01T08:00:00Z',
  },
  {
    id: 2,
    name: 'Ariel Matic Powder 2kg',
    sku: 'AM-DET-002',
    category: 'Detergents',
    unitPrice: 295,
    currentStock: 12,
    minimumStock: 30,
    warehouseLocation: 'Section A - Rack 4',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-08-09T08:00:00Z',
  },
  {
    id: 3,
    name: 'Dettol Antiseptic Liquid 500ml',
    sku: 'DT-ANT-003',
    category: 'Healthcare',
    unitPrice: 165,
    currentStock: 0,
    minimumStock: 20,
    warehouseLocation: 'Section B - Rack 1',
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-08-07T08:00:00Z',
  },
  {
    id: 4,
    name: 'Vim Dishwash Bar 200g',
    sku: 'VM-DW-004',
    category: 'Dishwash',
    unitPrice: 28,
    currentStock: 500,
    minimumStock: 100,
    warehouseLocation: 'Section C - Rack 2',
    createdAt: '2026-02-15T08:00:00Z',
    updatedAt: '2026-08-03T08:00:00Z',
  },
  {
    id: 5,
    name: 'Lifebuoy Soap 100g',
    sku: 'LB-SOAP-005',
    category: 'Personal Care',
    unitPrice: 42,
    currentStock: 80,
    minimumStock: 100,
    warehouseLocation: 'Section D - Rack 1',
    createdAt: '2026-03-01T08:00:00Z',
    updatedAt: '2026-08-06T08:00:00Z',
  },
  {
    id: 6,
    name: 'Colgate Toothpaste 150g',
    sku: 'CG-TP-006',
    category: 'Personal Care',
    unitPrice: 89,
    currentStock: 200,
    minimumStock: 60,
    warehouseLocation: 'Section D - Rack 3',
    createdAt: '2026-03-10T08:00:00Z',
    updatedAt: '2026-08-05T08:00:00Z',
  },
  {
    id: 7,
    name: 'Maggi Noodles 70g (Pack of 12)',
    sku: 'MG-NOO-007',
    category: 'Food & Beverages',
    unitPrice: 150,
    currentStock: 340,
    minimumStock: 80,
    warehouseLocation: 'Section E - Rack 2',
    createdAt: '2026-04-01T08:00:00Z',
    updatedAt: '2026-08-08T08:00:00Z',
  },
  {
    id: 8,
    name: 'Tata Salt 1kg',
    sku: 'TS-SAL-008',
    category: 'Food & Beverages',
    unitPrice: 22,
    currentStock: 5,
    minimumStock: 50,
    warehouseLocation: 'Section E - Rack 5',
    createdAt: '2026-04-10T08:00:00Z',
    updatedAt: '2026-08-09T08:00:00Z',
  },
];

let mockProducts = [...MOCK_PRODUCTS];
let nextProductId = 9;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getProducts(params?: {
  search?: string;
  category?: string;
  stockStatus?: string;
  warehouseLocation?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Product>> {
  // Replace with: const response = await apiClient.get('/products', { params }); return response.data;
  await delay(400);
  let filtered = [...mockProducts];

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }
  if (params?.category) {
    filtered = filtered.filter((p) => p.category === params.category);
  }
  if (params?.stockStatus) {
    filtered = filtered.filter((p) => getStockStatus(p) === params.stockStatus);
  }
  if (params?.warehouseLocation) {
    filtered = filtered.filter((p) =>
      p.warehouseLocation.toLowerCase().includes(params.warehouseLocation!.toLowerCase())
    );
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

export async function getProductById(id: number): Promise<Product> {
  await delay(300);
  const product = mockProducts.find((p) => p.id === id);
  if (!product) throw new Error('Product not found');
  return product;
}

export async function createProduct(data: ProductFormData): Promise<Product> {
  await delay(600);
  const newProduct: Product = {
    id: nextProductId++,
    name: data.name,
    sku: data.sku,
    category: data.category,
    unitPrice: Number(data.unitPrice),
    currentStock: Number(data.currentStock),
    minimumStock: Number(data.minimumStock),
    warehouseLocation: data.warehouseLocation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockProducts.push(newProduct);
  return newProduct;
}

export async function updateProduct(id: number, data: ProductFormData): Promise<Product> {
  await delay(600);
  const idx = mockProducts.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error('Product not found');
  const updated: Product = {
    ...mockProducts[idx],
    name: data.name,
    sku: data.sku,
    category: data.category,
    unitPrice: Number(data.unitPrice),
    currentStock: Number(data.currentStock),
    minimumStock: Number(data.minimumStock),
    warehouseLocation: data.warehouseLocation,
    updatedAt: new Date().toISOString(),
  };
  mockProducts[idx] = updated;
  return updated;
}

export function getCategories(): string[] {
  return [...new Set(mockProducts.map((p) => p.category))].sort();
}

export function getWarehouseLocations(): string[] {
  return [...new Set(mockProducts.map((p) => p.warehouseLocation.split(' - ')[0]))].sort();
}

// Expose mock products for other services (e.g., challan stock check)
export function getMockProducts(): Product[] {
  return mockProducts;
}

export function adjustStock(productId: number, delta: number): void {
  const idx = mockProducts.findIndex((p) => p.id === productId);
  if (idx !== -1) {
    mockProducts[idx].currentStock = Math.max(0, mockProducts[idx].currentStock + delta);
    mockProducts[idx].updatedAt = new Date().toISOString();
  }
}
