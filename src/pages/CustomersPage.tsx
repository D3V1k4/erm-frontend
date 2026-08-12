import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Eye, Pencil } from 'lucide-react';
import { Customer, CustomerFormData, PaginationMeta } from '../types';
import {
  getCustomers,
  createCustomer,
  updateCustomer,
} from '../services/customer.service';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { CustomerTypeBadge, CustomerStatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CustomerForm } from '../components/customers/CustomerForm';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

const DEFAULT_META: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function CustomersPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [meta, setMeta]           = useState<PaginationMeta>(DEFAULT_META);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter]     = useState('');
  const [page, setPage]           = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSaving, setIsSaving]   = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');
      const result = await getCustomers({
        search: search || undefined,
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        page,
        limit: 20,
      });
      setCustomers(result.data);
      setMeta(result.meta);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, typeFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  async function handleSave(data: CustomerFormData) {
    setIsSaving(true);
    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, data);
        toast.success('Customer updated successfully.');
      } else {
        await createCustomer(data);
        toast.success('Customer added successfully.');
      }
      setModalOpen(false);
      setEditingCustomer(null);
      load();
    } catch (err) {
      toast.error(editingCustomer ? 'Unable to update customer.' : 'Unable to create customer.', getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  function openAdd() {
    setEditingCustomer(null);
    setModalOpen(true);
  }

  function openEdit(customer: Customer, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingCustomer(customer);
    setModalOpen(true);
  }

  function handleSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage your customer relationships and CRM follow-ups."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Customers' }]}
        actions={
          <button className="btn btn-primary" onClick={openAdd}>
            <Plus size={16} />
            Add Customer
          </button>
        }
      />

      {/* Toolbar */}
      <div className="toolbar">
        <SearchInput
          value={search}
          onChange={handleSearch}
          placeholder="Search by name, business, mobile…"
        />
        <div className="toolbar-filters">
          <select
            className="form-control"
            style={{ width: 'auto', height: 36 }}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="lead">Lead</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            className="form-control"
            style={{ width: 'auto', height: 36 }}
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            aria-label="Filter by type"
          >
            <option value="">All Types</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
            <option value="distributor">Distributor</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="card">
        {error && <ErrorState description={error} onRetry={load} />}

        {!error && (
          <>
            <div className="table-wrapper">
              <table className="data-table" aria-label="Customers table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Business</th>
                    <th>Mobile</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Follow-up</th>
                    <th style={{ width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <TableSkeleton rows={6} cols={7} />
                  ) : customers.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <EmptyState
                          icon={<Users size={24} />}
                          title="No customers found"
                          description={
                            search || statusFilter || typeFilter
                              ? 'No customers match your current filters. Try adjusting your search.'
                              : 'Get started by adding your first customer.'
                          }
                          action={
                            !search && !statusFilter && !typeFilter ? (
                              <button className="btn btn-primary" onClick={openAdd}>
                                <Plus size={16} /> Add Customer
                              </button>
                            ) : undefined
                          }
                        />
                      </td>
                    </tr>
                  ) : (
                    customers.map((customer) => (
                      <tr
                        key={customer.id}
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/customers/${customer.id}`)}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                            <div className="topbar-avatar" style={{ background: 'var(--color-primary-muted)', color: 'var(--color-primary)', fontSize: 11 }}>
                              {customer.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
                            </div>
                            <div>
                              <p style={{ fontWeight: 500, color: 'var(--color-text)' }}>{customer.name}</p>
                              {customer.email && (
                                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>{customer.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>{customer.businessName || '—'}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>{customer.mobileNumber}</td>
                        <td><CustomerTypeBadge type={customer.customerType} /></td>
                        <td><CustomerStatusBadge status={customer.status} /></td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {formatDate(customer.followUpDate)}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="table-action-btn"
                              title="View customer"
                              onClick={(e) => { e.stopPropagation(); navigate(`/customers/${customer.id}`); }}
                              aria-label={`View ${customer.name}`}
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              className="table-action-btn"
                              title="Edit customer"
                              onClick={(e) => openEdit(customer, e)}
                              aria-label={`Edit ${customer.name}`}
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!isLoading && meta.total > 0 && (
              <Pagination meta={meta} onPageChange={setPage} />
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        title={editingCustomer ? 'Edit Customer' : 'Add Customer'}
        size="lg"
        onClose={() => { setModalOpen(false); setEditingCustomer(null); }}
      >
        <CustomerForm
          initialData={editingCustomer || undefined}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditingCustomer(null); }}
          isLoading={isSaving}
        />
      </Modal>
    </div>
  );
}
