import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Plus, Phone, Mail, MapPin, Building2, FileText, Calendar } from 'lucide-react';
import { Customer, FollowUp, FollowUpFormData } from '../types';
import { getCustomerById, updateCustomer, getFollowUps, addFollowUp } from '../services/customer.service';
import { CustomerTypeBadge, CustomerStatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { CustomerForm } from '../components/customers/CustomerForm';
import { LoadingSpinner, ErrorState, Skeleton, EmptyState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';
import { PageHeader } from '../components/ui/PageHeader';

function formatDate(iso?: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [customer, setCustomer]   = useState<Customer | null>(null);
  const [followups, setFollowups] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  // Edit modal
  const [editOpen, setEditOpen]   = useState(false);
  const [isSaving, setIsSaving]   = useState(false);

  // Follow-up modal
  const [fuOpen, setFuOpen]       = useState(false);
  const [fuForm, setFuForm]       = useState<FollowUpFormData>({ note: '', followUpDate: '' });
  const [fuErrors, setFuErrors]   = useState<{ note?: string; followUpDate?: string }>({});
  const [fuLoading, setFuLoading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setIsLoading(true);
        const [cust, fups] = await Promise.all([
          getCustomerById(Number(id)),
          getFollowUps(Number(id)),
        ]);
        setCustomer(cust);
        setFollowups(fups.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSaveEdit(data: Parameters<typeof updateCustomer>[1]) {
    if (!customer) return;
    setIsSaving(true);
    try {
      const updated = await updateCustomer(customer.id, data);
      setCustomer(updated);
      setEditOpen(false);
      toast.success('Customer updated successfully.');
    } catch (err) {
      toast.error('Unable to update customer.', getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAddFollowUp(e: React.FormEvent) {
    e.preventDefault();
    const errs: typeof fuErrors = {};
    if (!fuForm.note.trim()) errs.note = 'Note is required';
    if (!fuForm.followUpDate) errs.followUpDate = 'Follow-up date is required';
    setFuErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFuLoading(true);
    try {
      const newFu = await addFollowUp(Number(id), fuForm, user?.name || 'Unknown');
      setFollowups((prev) => [newFu, ...prev]);
      setCustomer((prev) => prev ? { ...prev, followUpDate: fuForm.followUpDate } : prev);
      setFuOpen(false);
      setFuForm({ note: '', followUpDate: '' });
      toast.success('Follow-up added successfully.');
    } catch (err) {
      toast.error('Unable to add follow-up.', getErrorMessage(err));
    } finally {
      setFuLoading(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading customer details…" />;
  if (error) return <ErrorState title="Unable to load customer" description={error} onRetry={() => window.location.reload()} />;
  if (!customer) return <ErrorState title="Customer not found" />;

  return (
    <div>
      <PageHeader
        title={customer.name}
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Customers', to: '/customers' },
          { label: customer.name },
        ]}
        actions={
          <button className="btn btn-secondary" onClick={() => setEditOpen(true)}>
            <Pencil size={15} /> Edit Customer
          </button>
        }
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/customers')}>
          <ArrowLeft size={15} /> Back to Customers
        </button>
      </div>

      {/* Customer Header Card */}
      <div className="card" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card-body">
          <div className="customer-header">
            <div className="customer-avatar-lg">
              {customer.name.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {customer.name}
                </h2>
                <CustomerTypeBadge type={customer.customerType} />
                <CustomerStatusBadge status={customer.status} />
              </div>
              {customer.businessName && (
                <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-1)' }}>
                  {customer.businessName}
                </p>
              )}
              {customer.gstNumber && (
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>
                  GST: {customer.gstNumber}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        {/* Contact Info */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Contact Information</h3>
          </div>
          <div className="card-body">
            <div className="detail-field">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <Phone size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="detail-field-label">Mobile</span>
              </div>
              <p className="detail-field-value" style={{ fontFamily: 'monospace' }}>{customer.mobileNumber}</p>
            </div>

            {customer.email && (
              <div className="detail-field">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <Mail size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="detail-field-label">Email</span>
                </div>
                <p className="detail-field-value">
                  <a href={`mailto:${customer.email}`}>{customer.email}</a>
                </p>
              </div>
            )}

            {customer.businessName && (
              <div className="detail-field">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <Building2 size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="detail-field-label">Business</span>
                </div>
                <p className="detail-field-value">{customer.businessName}</p>
              </div>
            )}

            {customer.gstNumber && (
              <div className="detail-field">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="detail-field-label">GST Number</span>
                </div>
                <p className="detail-field-value" style={{ fontFamily: 'monospace' }}>{customer.gstNumber}</p>
              </div>
            )}

            {customer.address && (
              <div className="detail-field">
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                  <MapPin size={14} style={{ color: 'var(--color-text-muted)' }} />
                  <span className="detail-field-label">Address</span>
                </div>
                <p className="detail-field-value">{customer.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* CRM Section */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">CRM & Follow-up</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setFuOpen(true)}>
              <Plus size={14} /> Add Follow-up
            </button>
          </div>
          <div className="card-body">
            <div className="detail-field">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span className="detail-field-label">Next Follow-up</span>
              </div>
              <p className="detail-field-value" style={{ color: customer.followUpDate ? 'var(--color-text)' : 'var(--color-text-muted)' }}>
                {formatDate(customer.followUpDate)}
              </p>
            </div>

            {customer.notes && (
              <div className="detail-field">
                <p className="detail-field-label" style={{ marginBottom: 'var(--space-2)' }}>Notes</p>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', lineHeight: 1.6, padding: 'var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-base)', border: '1px solid var(--color-border)' }}>
                  {customer.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Follow-up History */}
      <div className="card" style={{ marginTop: 'var(--space-5)' }}>
        <div className="card-header">
          <h3 className="card-title">Follow-up History</h3>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
            {followups.length} record{followups.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {followups.length === 0 ? (
            <EmptyState
              icon={<Calendar size={22} />}
              title="No follow-up records"
              description="Add your first follow-up note to track CRM activity."
              action={
                <button className="btn btn-primary btn-sm" onClick={() => setFuOpen(true)}>
                  <Plus size={14} /> Add Follow-up
                </button>
              }
            />
          ) : (
            followups.map((fu) => (
              <div key={fu.id} className="followup-item" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div className="followup-dot" />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', lineHeight: 1.6, marginBottom: 'var(--space-2)' }}>
                    {fu.note}
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-4)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                    <span>By: {fu.createdBy}</span>
                    <span>{formatDateTime(fu.createdAt)}</span>
                  </div>
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary)', fontWeight: 500, flexShrink: 0 }}>
                  {formatDate(fu.followUpDate)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={editOpen}
        title="Edit Customer"
        size="lg"
        onClose={() => setEditOpen(false)}
      >
        <CustomerForm
          initialData={customer}
          onSubmit={handleSaveEdit}
          onCancel={() => setEditOpen(false)}
          isLoading={isSaving}
        />
      </Modal>

      {/* Add Follow-up Modal */}
      <Modal
        isOpen={fuOpen}
        title="Add Follow-up"
        size="sm"
        onClose={() => { setFuOpen(false); setFuForm({ note: '', followUpDate: '' }); }}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setFuOpen(false)} disabled={fuLoading}>
              Cancel
            </button>
            <button className="btn btn-primary" form="followup-form" type="submit" disabled={fuLoading}>
              {fuLoading && <span className="spinner" />}
              {fuLoading ? 'Saving…' : 'Add Follow-up'}
            </button>
          </>
        }
      >
        <form id="followup-form" onSubmit={handleAddFollowUp}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="fu-date">
                Follow-up Date <span className="required">*</span>
              </label>
              <input
                id="fu-date"
                type="date"
                className={`form-control ${fuErrors.followUpDate ? 'error' : ''}`}
                value={fuForm.followUpDate}
                onChange={(e) => setFuForm((p) => ({ ...p, followUpDate: e.target.value }))}
              />
              {fuErrors.followUpDate && <span className="form-error">{fuErrors.followUpDate}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fu-note">
                Note <span className="required">*</span>
              </label>
              <textarea
                id="fu-note"
                className={`form-control ${fuErrors.note ? 'error' : ''}`}
                value={fuForm.note}
                onChange={(e) => setFuForm((p) => ({ ...p, note: e.target.value }))}
                placeholder="What was discussed or what needs to happen?"
                rows={4}
              />
              {fuErrors.note && <span className="form-error">{fuErrors.note}</span>}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
