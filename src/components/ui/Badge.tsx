import React from 'react';
import { CustomerType, CustomerStatus, ChallanStatus, StockStatus } from '../../types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'orange' | 'purple';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  dot?: boolean;
}

export function Badge({ variant, children, dot = false }: BadgeProps) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span className="badge-dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

// ── Specific Status Badges ────────────────────────────────────

export function CustomerTypeBadge({ type }: { type: CustomerType }) {
  const map: Record<CustomerType, { variant: BadgeVariant; label: string }> = {
    retail:      { variant: 'info',    label: 'Retail' },
    wholesale:   { variant: 'purple',  label: 'Wholesale' },
    distributor: { variant: 'orange',  label: 'Distributor' },
  };
  const { variant, label } = map[type];
  return <Badge variant={variant}>{label}</Badge>;
}

export function CustomerStatusBadge({ status }: { status: CustomerStatus }) {
  const map: Record<CustomerStatus, { variant: BadgeVariant; label: string }> = {
    lead:     { variant: 'warning', label: 'Lead' },
    active:   { variant: 'success', label: 'Active' },
    inactive: { variant: 'neutral', label: 'Inactive' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant} dot>{label}</Badge>;
}

export function ChallanStatusBadge({ status }: { status: ChallanStatus }) {
  const map: Record<ChallanStatus, { variant: BadgeVariant; label: string }> = {
    draft:     { variant: 'neutral', label: 'Draft' },
    confirmed: { variant: 'success', label: 'Confirmed' },
    cancelled: { variant: 'error',   label: 'Cancelled' },
  };
  const { variant, label } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function StockStatusBadge({ status, currentStock }: { status: StockStatus; currentStock: number }) {
  if (status === 'out-of-stock') {
    return (
      <Badge variant="error">
        <span aria-label="Out of stock">Out of Stock</span>
      </Badge>
    );
  }
  if (status === 'low-stock') {
    return (
      <Badge variant="warning">
        <span aria-label={`Low stock: ${currentStock} remaining`}>Low Stock</span>
      </Badge>
    );
  }
  return (
    <Badge variant="success">
      <span aria-label={`In stock: ${currentStock} units`}>In Stock</span>
    </Badge>
  );
}

export function MovementTypeBadge({ type }: { type: 'IN' | 'OUT' }) {
  return (
    <Badge variant={type === 'IN' ? 'success' : 'warning'}>
      {type === 'IN' ? '↑ IN' : '↓ OUT'}
    </Badge>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, BadgeVariant> = {
    admin:     'purple',
    sales:     'info',
    warehouse: 'orange',
    accounts:  'success',
  };
  return (
    <Badge variant={map[role] || 'neutral'}>
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  );
}
