import {
  Customer,
  CustomerFormData,
  FollowUp,
  FollowUpFormData,
  PaginatedResponse,
} from '../types';
import apiClient from './api';

// ── Mock Data ────────────────────────────────────────────────
const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    mobileNumber: '9876543210',
    email: 'rajesh.kumar@example.com',
    businessName: 'Kumar Traders',
    gstNumber: '29AAPFK3356J1ZS',
    customerType: 'wholesale',
    address: '12, Industrial Area, Phase 2, Bengaluru, KA 560068',
    status: 'active',
    followUpDate: '2026-08-20',
    notes: 'Prefers bulk orders at end of month. Reliable payment history.',
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 2,
    name: 'Priya Mehta',
    mobileNumber: '9812345678',
    email: 'priya@mehtatextiles.com',
    businessName: 'Mehta Textiles Pvt Ltd',
    gstNumber: '27AAJCM2813Q1ZE',
    customerType: 'distributor',
    address: 'Dharavi, Mumbai, MH 400017',
    status: 'active',
    followUpDate: '2026-08-15',
    notes: 'Distributor for Maharashtra region. Monthly targets agreed.',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-08-05T09:00:00Z',
  },
  {
    id: 3,
    name: 'Amit Singh',
    mobileNumber: '9911223344',
    email: 'amit.singh@gmail.com',
    businessName: 'Singh General Store',
    gstNumber: '',
    customerType: 'retail',
    address: 'Shop No 5, Market Road, Jaipur, RJ 302001',
    status: 'lead',
    followUpDate: '2026-08-12',
    notes: 'Interested in our detergent product line. Awaiting quotation.',
    createdAt: '2026-07-20T11:00:00Z',
    updatedAt: '2026-08-08T11:00:00Z',
  },
  {
    id: 4,
    name: 'Sunita Desai',
    mobileNumber: '9823456789',
    email: 'sunita@desaitrading.in',
    businessName: 'Desai Trading Co.',
    gstNumber: '24AACFD1234K1Z5',
    customerType: 'wholesale',
    address: 'Rander Road, Surat, GJ 395005',
    status: 'inactive',
    followUpDate: undefined,
    notes: 'Paused orders due to warehouse renovation. Will resume in Q3.',
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-06-01T08:00:00Z',
  },
  {
    id: 5,
    name: 'Mohammed Arif',
    mobileNumber: '9000112233',
    email: 'arif.supplies@gmail.com',
    businessName: 'Arif Wholesale Supplies',
    gstNumber: '36AABCA1234E1Z2',
    customerType: 'wholesale',
    address: 'Secunderabad, Hyderabad, TS 500003',
    status: 'active',
    followUpDate: '2026-09-01',
    notes: 'New account opened Q2 2026. Growing account.',
    createdAt: '2026-04-05T07:00:00Z',
    updatedAt: '2026-08-07T07:00:00Z',
  },
];

const MOCK_FOLLOWUPS: FollowUp[] = [
  {
    id: 1,
    customerId: 1,
    note: 'Called and discussed Q3 order quantities. Will send updated pricing sheet.',
    followUpDate: '2026-08-01',
    createdBy: 'Sales Team',
    createdAt: '2026-08-01T10:30:00Z',
  },
  {
    id: 2,
    customerId: 1,
    note: 'Sent pricing sheet. Customer reviewing. Follow-up next week.',
    followUpDate: '2026-08-08',
    createdBy: 'Sales Team',
    createdAt: '2026-08-08T11:00:00Z',
  },
  {
    id: 3,
    customerId: 2,
    note: 'Met at trade fair. Discussed new distributor terms.',
    followUpDate: '2026-07-20',
    createdBy: 'Admin',
    createdAt: '2026-07-20T14:00:00Z',
  },
];

let nextId = 6;
let mockCustomers = [...MOCK_CUSTOMERS];
let mockFollowups = [...MOCK_FOLLOWUPS];

// ── Service Functions ─────────────────────────────────────────

export async function getCustomers(params?: {
  search?: string;
  status?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Customer>> {
  // When backend is ready, replace with:
  // const response = await apiClient.get('/customers', { params });
  // return response.data;

  await delay(400);
  let filtered = [...mockCustomers];

  if (params?.search) {
    const q = params.search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.businessName?.toLowerCase().includes(q) ||
        c.mobileNumber.includes(q) ||
        c.email?.toLowerCase().includes(q)
    );
  }
  if (params?.status) {
    filtered = filtered.filter((c) => c.status === params.status);
  }
  if (params?.type) {
    filtered = filtered.filter((c) => c.customerType === params.type);
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

export async function getCustomerById(id: number): Promise<Customer> {
  await delay(300);
  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) throw new Error('Customer not found');
  return customer;
}

export async function createCustomer(data: CustomerFormData): Promise<Customer> {
  await delay(600);
  const newCustomer: Customer = {
    id: nextId++,
    name: data.name,
    mobileNumber: data.mobileNumber,
    email: data.email || undefined,
    businessName: data.businessName || undefined,
    gstNumber: data.gstNumber || undefined,
    customerType: data.customerType as CustomerType,
    address: data.address || undefined,
    status: data.status as CustomerStatus,
    followUpDate: data.followUpDate || undefined,
    notes: data.notes || undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockCustomers.push(newCustomer);
  return newCustomer;
}

export async function updateCustomer(id: number, data: CustomerFormData): Promise<Customer> {
  await delay(600);
  const idx = mockCustomers.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error('Customer not found');
  const updated: Customer = {
    ...mockCustomers[idx],
    ...data,
    customerType: data.customerType as CustomerType,
    status: data.status as CustomerStatus,
    updatedAt: new Date().toISOString(),
  };
  mockCustomers[idx] = updated;
  return updated;
}

export async function getFollowUps(customerId: number): Promise<FollowUp[]> {
  await delay(300);
  return mockFollowups.filter((f) => f.customerId === customerId);
}

export async function addFollowUp(customerId: number, data: FollowUpFormData, createdBy: string): Promise<FollowUp> {
  await delay(500);
  const newFollowup: FollowUp = {
    id: mockFollowups.length + 1,
    customerId,
    note: data.note,
    followUpDate: data.followUpDate,
    createdBy,
    createdAt: new Date().toISOString(),
  };
  mockFollowups.push(newFollowup);
  // Also update customer follow-up date
  const customerIdx = mockCustomers.findIndex((c) => c.id === customerId);
  if (customerIdx !== -1) {
    mockCustomers[customerIdx].followUpDate = data.followUpDate;
  }
  return newFollowup;
}

// ── Type helpers re-exported for import convenience ──────────
import type { CustomerType, CustomerStatus } from '../types';
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
