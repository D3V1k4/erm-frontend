import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, Plus, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Challan, ChallanStatus, PaginationMeta } from '../types';
import { getChallans, cancelChallan, confirmChallan } from '../services/challan.service';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { ChallanStatusBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

const DEFAULT_META: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function ChallansPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();

  const [challans, setChallans]   = useState<Challan[]>([]);
  const [meta, setMeta]           = useState<PaginationMeta>(DEFAULT_META);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState<ChallanStatus | ''>('');
  const [page, setPage]           = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  // Dialog states
  const [actionChallan, setActionChallan] = useState<Challan | null>(null);
  const [dialogType, setDialogType]       = useState<'confirm' | 'cancel' | null>(null);
  const [isProcessing, setIsProcessing]   = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true); setError('');
      const result = await getChallans({
        search: search || undefined,
        status: statusFilter || undefined,
        page, limit: 20,
      });
      setChallans(result.data);
      setMeta(result.meta);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setIsLoading(false); }
  }, [search, statusFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  function openConfirmDialog(c: Challan, e: React.MouseEvent) {
    e.stopPropagation();
    setActionChallan(c);
    setDialogType('confirm');
  }

  function openCancelDialog(c: Challan, e: React.MouseEvent) {
    e.stopPropagation();
    setActionChallan(c);
    setDialogType('cancel');
  }

  async function handleAction() {
    if (!actionChallan || !dialogType) return;
    setIsProcessing(true);
    try {
      if (dialogType === 'confirm') {
        await confirmChallan(actionChallan.id, user?.name || 'Unknown');
        toast.success(`Challan ${actionChallan.challanNumber} confirmed successfully.`, 'Inventory has been updated.');
      } else {
        await cancelChallan(actionChallan.id);
        toast.success(`Challan ${actionChallan.challanNumber} cancelled.`);
      }
      setDialogType(null); setActionChallan(null); load();
    } catch (err) {
      toast.error(dialogType === 'confirm' ? 'Unable to confirm challan.' : 'Unable to cancel challan.', getErrorMessage(err));
    } finally { setIsProcessing(false); }
  }

  return (
    <div>
      <PageHeader
        title="Sales Challans"
        description="Manage draft, confirmed, and cancelled sales orders."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Challans' }]}
        actions={
          <Link to="/challans/create" className="btn btn-primary">
            <Plus size={16} /> Create Challan
          </Link>
        }
      />

      <div className="toolbar">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search challan no. or customer…" />
        <div className="toolbar-filters">
          <select
            className="form-control" style={{ width: 'auto', height: 36 }}
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as ChallanStatus | ''); setPage(1); }}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="card">
        {error && <ErrorState description={error} onRetry={load} />}
        {!error && (
          <>
            <div className="table-wrapper">
              <table className="data-table" aria-label="Challans table">
                <thead>
                  <tr>
                    <th>Challan No.</th>
                    <th>Customer</th>
                    <th>Total Qty</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Date</th>
                    <th style={{ width: 120 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? <TableSkeleton rows={6} cols={7} /> :
                  challans.length === 0 ? (
                    <tr><td colSpan={7}>
                      <EmptyState
                        icon={<FileText size={24} />}
                        title="No challans found"
                        description={search || statusFilter ? 'Try adjusting your filters.' : 'Create your first sales challan to get started.'}
                        action={!search && !statusFilter ? (
                          <Link to="/challans/create" className="btn btn-primary">
                            <Plus size={16} /> Create Challan
                          </Link>
                        ) : undefined}
                      />
                    </td></tr>
                  ) : (
                    challans.map((challan) => (
                      <tr key={challan.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/challans/${challan.id}`)}>
                        <td>
                          <span style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{challan.challanNumber}</span>
                        </td>
                        <td>{challan.customerName}</td>
                        <td style={{ fontWeight: 500 }}>{challan.totalQuantity}</td>
                        <td><ChallanStatusBadge status={challan.status} /></td>
                        <td style={{ fontSize: 'var(--font-size-sm)' }}>{challan.createdBy}</td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {formatDate(challan.createdAt)}
                        </td>
                        <td>
                          <div className="table-actions" onClick={e => e.stopPropagation()}>
                            <button className="table-action-btn" title="View details" onClick={() => navigate(`/challans/${challan.id}`)}>
                              <Eye size={15} />
                            </button>
                            {challan.status === 'draft' && (
                              <>
                                <button className="table-action-btn" title="Confirm challan"
                                  onClick={(e) => openConfirmDialog(challan, e)} style={{ color: 'var(--color-success)' }}>
                                  <CheckCircle size={15} />
                                </button>
                                <button className="table-action-btn danger" title="Cancel challan"
                                  onClick={(e) => openCancelDialog(challan, e)}>
                                  <XCircle size={15} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {!isLoading && meta.total > 0 && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={dialogType === 'confirm'}
        title="Confirm Challan"
        message={`Are you sure you want to confirm ${actionChallan?.challanNumber}? This will permanently deduct inventory.`}
        confirmLabel="Yes, Confirm"
        variant="warning"
        isLoading={isProcessing}
        onConfirm={handleAction}
        onCancel={() => { setDialogType(null); setActionChallan(null); }}
      />
      <ConfirmDialog
        isOpen={dialogType === 'cancel'}
        title="Cancel Challan"
        message={`Are you sure you want to cancel ${actionChallan?.challanNumber}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel"
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleAction}
        onCancel={() => { setDialogType(null); setActionChallan(null); }}
      />
    </div>
  );
}
