import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Printer, Download } from 'lucide-react';
import { Challan } from '../types';
import { getChallanById, confirmChallan, cancelChallan } from '../services/challan.service';
import { PageHeader } from '../components/ui/PageHeader';
import { ChallanStatusBadge } from '../components/ui/Badge';
import { LoadingSpinner, ErrorState } from '../components/ui/States';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function ChallanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [challan, setChallan] = useState<Challan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [dialogType, setDialogType] = useState<'confirm' | 'cancel' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      try {
        setIsLoading(true);
        const data = await getChallanById(Number(id));
        setChallan(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleAction() {
    if (!challan || !dialogType) return;
    setIsProcessing(true);
    try {
      if (dialogType === 'confirm') {
        const updated = await confirmChallan(challan.id, user?.name || 'Unknown');
        setChallan(updated);
        toast.success(`Challan ${challan.challanNumber} confirmed successfully.`, 'Inventory has been updated.');
      } else {
        const updated = await cancelChallan(challan.id);
        setChallan(updated);
        toast.success(`Challan ${challan.challanNumber} cancelled.`);
      }
      setDialogType(null);
    } catch (err) {
      toast.error(dialogType === 'confirm' ? 'Unable to confirm challan.' : 'Unable to cancel challan.', getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  }

  if (isLoading) return <LoadingSpinner message="Loading challan details…" />;
  if (error) return <ErrorState title="Unable to load challan" description={error} onRetry={() => window.location.reload()} />;
  if (!challan) return <ErrorState title="Challan not found" />;

  const isDraft = challan.status === 'draft';
  const totalValue = challan.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);

  return (
    <div>
      <PageHeader
        title={`Challan ${challan.challanNumber}`}
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Challans', to: '/challans' },
          { label: challan.challanNumber }
        ]}
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => window.print()}>
              <Printer size={14} /> Print
            </button>
            <button className="btn btn-secondary btn-sm">
              <Download size={14} /> PDF
            </button>
          </div>
        }
      />

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challans')}>
          <ArrowLeft size={15} /> Back to list
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
        {challan.status === 'draft' && (
          <div className="info-banner info" style={{ margin: 0, flex: 1 }}>
            <strong>Draft — </strong> Inventory has not been affected yet.
          </div>
        )}
        {challan.status === 'confirmed' && (
          <div className="info-banner success" style={{ margin: 0, flex: 1 }}>
            <strong>Confirmed — </strong> Inventory has been updated.
          </div>
        )}
        {challan.status === 'cancelled' && (
          <div className="info-banner error" style={{ margin: 0, flex: 1 }}>
            <strong>Cancelled — </strong> This challan is void.
          </div>
        )}
      </div>

      <div className="detail-grid" style={{ marginBottom: 'var(--space-5)' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Challan Details</h3>
          </div>
          <div className="card-body">
            <div className="detail-grid">
              <div className="detail-field">
                <span className="detail-field-label">Status</span>
                <div><ChallanStatusBadge status={challan.status} /></div>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Date Created</span>
                <p className="detail-field-value">{formatDateTime(challan.createdAt)}</p>
              </div>
              <div className="detail-field">
                <span className="detail-field-label">Created By</span>
                <p className="detail-field-value">{challan.createdBy}</p>
              </div>
              {challan.status !== 'draft' && (
                <div className="detail-field">
                  <span className="detail-field-label">Last Updated</span>
                  <p className="detail-field-value">{formatDateTime(challan.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Customer Information</h3>
          </div>
          <div className="card-body">
            <div className="detail-field">
              <span className="detail-field-label">Customer Name / Business</span>
              <p className="detail-field-value">
                <Link to={`/customers/${challan.customerId}`} style={{ color: 'var(--color-primary)' }}>
                  {challan.customerName}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h3 className="card-title">Products ({challan.items.length})</h3>
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Total Qty: {challan.totalQuantity}</span>
        </div>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>SKU</th>
                <th style={{ textAlign: 'right' }}>Unit Price</th>
                <th style={{ textAlign: 'right' }}>Quantity</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {challan.items.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td style={{ color: 'var(--color-text-secondary)' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 500 }}>{item.productName}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)' }}>{item.productSku}</td>
                  <td style={{ textAlign: 'right' }}>₹{item.unitPrice.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>{item.quantity}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: 'var(--color-bg-secondary)' }}>
                <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, padding: 'var(--space-3) var(--space-4)' }}>Grand Total:</td>
                <td style={{ textAlign: 'right', fontWeight: 700, padding: 'var(--space-3) var(--space-4)' }}>{challan.totalQuantity}</td>
                <td style={{ textAlign: 'right', fontWeight: 700, padding: 'var(--space-3) var(--space-4)' }}>₹{totalValue.toLocaleString('en-IN')}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {isDraft && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
          <button className="btn btn-danger-outline" onClick={() => setDialogType('cancel')}>
            <XCircle size={16} /> Cancel Challan
          </button>
          <button className="btn btn-primary" onClick={() => setDialogType('confirm')}>
            <CheckCircle size={16} /> Confirm Challan
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={dialogType === 'confirm'}
        title="Confirm Challan"
        message={`Are you sure you want to confirm ${challan.challanNumber}? This will permanently deduct inventory.`}
        confirmLabel="Yes, Confirm"
        variant="warning"
        isLoading={isProcessing}
        onConfirm={handleAction}
        onCancel={() => setDialogType(null)}
      />
      <ConfirmDialog
        isOpen={dialogType === 'cancel'}
        title="Cancel Challan"
        message={`Are you sure you want to cancel ${challan.challanNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleAction}
        onCancel={() => setDialogType(null)}
      />
    </div>
  );
}
