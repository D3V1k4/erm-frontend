import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Customer, CustomerFormData } from '../../types';

interface CustomerFormProps {
  initialData?: Customer;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMPTY: CustomerFormData = {
  name: '',
  mobileNumber: '',
  email: '',
  businessName: '',
  gstNumber: '',
  customerType: '',
  address: '',
  status: '',
  followUpDate: '',
  notes: '',
};

type FormErrors = Partial<Record<keyof CustomerFormData, string>>;

export function CustomerForm({ initialData, onSubmit, onCancel, isLoading }: CustomerFormProps) {
  const [form, setForm] = useState<CustomerFormData>(EMPTY);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        mobileNumber: initialData.mobileNumber,
        email: initialData.email || '',
        businessName: initialData.businessName || '',
        gstNumber: initialData.gstNumber || '',
        customerType: initialData.customerType,
        address: initialData.address || '',
        status: initialData.status,
        followUpDate: initialData.followUpDate || '',
        notes: initialData.notes || '',
      });
    }
  }, [initialData]);

  function update(field: keyof CustomerFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Customer name is required';
    if (!form.mobileNumber.trim()) e.mobileNumber = 'Mobile number is required';
    else if (!/^[6-9]\d{9}$/.test(form.mobileNumber.trim()))
      e.mobileNumber = 'Enter a valid 10-digit mobile number';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address';
    if (!form.customerType) e.customerType = 'Customer type is required';
    if (!form.status) e.status = 'Status is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  function Field({ id, label, required, error, children }: {
    id: string; label: string; required?: boolean; error?: string; children: React.ReactNode;
  }) {
    return (
      <div className="form-group">
        <label className="form-label" htmlFor={id}>
          {label}
          {required && <span className="required" aria-hidden="true"> *</span>}
        </label>
        {children}
        {error && (
          <span className="form-error" role="alert">
            <AlertCircle size={12} /> {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

        <div className="form-grid">
          <Field id="name" label="Customer Name" required error={errors.name}>
            <input
              id="name"
              type="text"
              className={`form-control ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Full name"
              autoFocus
              aria-required="true"
              disabled={isLoading}
            />
          </Field>

          <Field id="mobileNumber" label="Mobile Number" required error={errors.mobileNumber}>
            <input
              id="mobileNumber"
              type="tel"
              className={`form-control ${errors.mobileNumber ? 'error' : ''}`}
              value={form.mobileNumber}
              onChange={(e) => update('mobileNumber', e.target.value)}
              placeholder="10-digit mobile number"
              aria-required="true"
              disabled={isLoading}
            />
          </Field>
        </div>

        <div className="form-grid">
          <Field id="email" label="Email Address" error={errors.email}>
            <input
              id="email"
              type="email"
              className={`form-control ${errors.email ? 'error' : ''}`}
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="email@company.com"
              disabled={isLoading}
            />
          </Field>

          <Field id="businessName" label="Business Name">
            <input
              id="businessName"
              type="text"
              className="form-control"
              value={form.businessName}
              onChange={(e) => update('businessName', e.target.value)}
              placeholder="Trading company or store name"
              disabled={isLoading}
            />
          </Field>
        </div>

        <div className="form-grid">
          <Field id="customerType" label="Customer Type" required error={errors.customerType}>
            <select
              id="customerType"
              className={`form-control ${errors.customerType ? 'error' : ''}`}
              value={form.customerType}
              onChange={(e) => update('customerType', e.target.value)}
              aria-required="true"
              disabled={isLoading}
            >
              <option value="">Select type…</option>
              <option value="retail">Retail</option>
              <option value="wholesale">Wholesale</option>
              <option value="distributor">Distributor</option>
            </select>
          </Field>

          <Field id="status" label="Status" required error={errors.status}>
            <select
              id="status"
              className={`form-control ${errors.status ? 'error' : ''}`}
              value={form.status}
              onChange={(e) => update('status', e.target.value)}
              aria-required="true"
              disabled={isLoading}
            >
              <option value="">Select status…</option>
              <option value="lead">Lead</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </Field>
        </div>

        <div className="form-grid">
          <Field id="gstNumber" label="GST Number">
            <input
              id="gstNumber"
              type="text"
              className="form-control"
              value={form.gstNumber}
              onChange={(e) => update('gstNumber', e.target.value.toUpperCase())}
              placeholder="22AAAAA0000A1Z5"
              maxLength={15}
              disabled={isLoading}
            />
          </Field>

          <Field id="followUpDate" label="Next Follow-up Date">
            <input
              id="followUpDate"
              type="date"
              className="form-control"
              value={form.followUpDate}
              onChange={(e) => update('followUpDate', e.target.value)}
              disabled={isLoading}
            />
          </Field>
        </div>

        <Field id="address" label="Address">
          <textarea
            id="address"
            className="form-control"
            value={form.address}
            onChange={(e) => update('address', e.target.value)}
            placeholder="Full business address"
            rows={2}
            disabled={isLoading}
          />
        </Field>

        <Field id="notes" label="Notes">
          <textarea
            id="notes"
            className="form-control"
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="Any additional information about this customer…"
            rows={3}
            disabled={isLoading}
          />
        </Field>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading && <span className="spinner" aria-hidden="true" />}
            {isLoading ? 'Saving…' : initialData ? 'Update Customer' : 'Add Customer'}
          </button>
        </div>
      </div>
    </form>
  );
}
