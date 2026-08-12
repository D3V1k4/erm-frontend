// ── User & Auth ─────────────────────────────────────────────

export type Role = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ── Customer ─────────────────────────────────────────────────

export type CustomerType = 'retail' | 'wholesale' | 'distributor';
export type CustomerStatus = 'lead' | 'active' | 'inactive';

export interface Customer {
  id: number;
  name: string;
  mobileNumber: string;
  email?: string;
  businessName?: string;
  gstNumber?: string;
  customerType: CustomerType;
  address?: string;
  status: CustomerStatus;
  followUpDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFormData {
  name: string;
  mobileNumber: string;
  email: string;
  businessName: string;
  gstNumber: string;
  customerType: CustomerType | '';
  address: string;
  status: CustomerStatus | '';
  followUpDate: string;
  notes: string;
}

// ── Follow-up ─────────────────────────────────────────────────

export interface FollowUp {
  id: number;
  customerId: number;
  note: string;
  followUpDate: string;
  createdBy: string;
  createdAt: string;
}

export interface FollowUpFormData {
  note: string;
  followUpDate: string;
}

// ── Product ──────────────────────────────────────────────────

export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  category: string;
  unitPrice: number | '';
  currentStock: number | '';
  minimumStock: number | '';
  warehouseLocation: string;
}

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export function getStockStatus(product: Pick<Product, 'currentStock' | 'minimumStock'>): StockStatus {
  if (product.currentStock === 0) return 'out-of-stock';
  if (product.currentStock <= product.minimumStock) return 'low-stock';
  return 'in-stock';
}

// ── Inventory Movement ────────────────────────────────────────

export type MovementType = 'IN' | 'OUT';

export interface InventoryMovement {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  movementType: MovementType;
  reason?: string;
  createdBy: string;
  createdAt: string;
}

// ── Challan ──────────────────────────────────────────────────

export type ChallanStatus = 'draft' | 'confirmed' | 'cancelled';

export interface ChallanItem {
  id?: number;
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  availableStock?: number;
}

export interface Challan {
  id: number;
  challanNumber: string;
  customerId: number;
  customerName: string;
  items: ChallanItem[];
  totalQuantity: number;
  status: ChallanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChallanFormData {
  customerId: number | null;
  items: ChallanItemInput[];
}

export interface ChallanItemInput {
  productId: number;
  productName: string;
  productSku: string;
  unitPrice: number;
  availableStock: number;
  quantity: number;
}

// ── Pagination ───────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// ── API Response ─────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string>;
}

// ── Dashboard ─────────────────────────────────────────────────

export interface DashboardStats {
  totalCustomers: number;
  totalProducts: number;
  pendingChallans: number;
  lowStockProducts: number;
}
