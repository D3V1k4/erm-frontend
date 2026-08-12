import React, { useEffect, useState, useCallback } from 'react';
import { Warehouse, TrendingUp, TrendingDown } from 'lucide-react';
import { InventoryMovement, MovementType, PaginationMeta } from '../types';
import { getInventoryMovements, getInventorySummary } from '../services/inventory.service';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { MovementTypeBadge } from '../components/ui/Badge';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton, EmptyState, ErrorState, StatCardSkeleton } from '../components/ui/States';
import { getErrorMessage } from '../services/api';

const DEFAULT_META: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function InventoryPage() {
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [meta, setMeta]           = useState<PaginationMeta>(DEFAULT_META);
  const [search, setSearch]       = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType | ''>('');
  const [page, setPage]           = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [summary, setSummary]     = useState<{ totalProducts: number; lowStock: number; outOfStock: number } | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setIsLoading(true); setError('');
      const result = await getInventoryMovements({
        search: search || undefined,
        movementType: typeFilter || undefined,
        page, limit: 20,
      });
      setMovements(result.data);
      setMeta(result.meta);
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setIsLoading(false); }
  }, [search, typeFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  useEffect(() => {
    getInventorySummary().then(setSummary).finally(() => setSummaryLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="Inventory"
        description="Track stock movements and monitor inventory levels."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Inventory' }]}
      />

      {/* Summary Cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 'var(--space-6)' }}>
        {summaryLoading ? (
          Array.from({ length: 3 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : summary && (
          <>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Total Products</span>
                <div className="stat-card-icon blue"><Warehouse size={18} /></div>
              </div>
              <p className="stat-card-value">{summary.totalProducts}</p>
              <p className="stat-card-meta">In product catalogue</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Low Stock</span>
                <div className="stat-card-icon amber"><TrendingDown size={18} /></div>
              </div>
              <p className="stat-card-value" style={{ color: summary.lowStock > 0 ? 'var(--color-warning-text)' : undefined }}>
                {summary.lowStock}
              </p>
              <p className="stat-card-meta">Products below minimum</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Out of Stock</span>
                <div className="stat-card-icon red"><TrendingDown size={18} /></div>
              </div>
              <p className="stat-card-value" style={{ color: summary.outOfStock > 0 ? 'var(--color-error)' : undefined }}>
                {summary.outOfStock}
              </p>
              <p className="stat-card-meta">Products with zero stock</p>
            </div>
          </>
        )}
      </div>

      {/* Movements Table */}
      <div className="toolbar">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by product, reason…" />
        <div className="toolbar-filters">
          <select
            className="form-control" style={{ width: 'auto', height: 36 }}
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value as MovementType | ''); setPage(1); }}
            aria-label="Filter by movement type"
          >
            <option value="">All Movements</option>
            <option value="IN">Inbound (IN)</option>
            <option value="OUT">Outbound (OUT)</option>
          </select>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Stock Movement History</h2>
          {!isLoading && <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{meta.total} records</span>}
        </div>

        {error && <ErrorState description={error} onRetry={load} />}
        {!error && (
          <>
            <div className="table-wrapper">
              <table className="data-table" aria-label="Inventory movements table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Reason</th>
                    <th>Created By</th>
                    <th>Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? <TableSkeleton rows={6} cols={6} /> :
                  movements.length === 0 ? (
                    <tr><td colSpan={6}>
                      <EmptyState
                        icon={<Warehouse size={24} />}
                        title="No movements found"
                        description={search || typeFilter ? 'Try adjusting your filters.' : 'Inventory movements will appear here as challans are confirmed.'}
                      />
                    </td></tr>
                  ) : (
                    movements.map((m) => (
                      <tr key={m.id}>
                        <td>
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{m.productName}</p>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{m.productSku}</p>
                          </div>
                        </td>
                        <td><MovementTypeBadge type={m.movementType} /></td>
                        <td>
                          <span style={{
                            fontWeight: 700,
                            fontSize: 'var(--font-size-base)',
                            color: m.movementType === 'IN' ? 'var(--color-success-text)' : 'var(--color-warning-text)',
                          }}>
                            {m.movementType === 'IN' ? '+' : '-'}{m.quantity}
                          </span>
                        </td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                          {m.reason || '—'}
                        </td>
                        <td style={{ fontSize: 'var(--font-size-sm)' }}>{m.createdBy}</td>
                        <td style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                          {formatDateTime(m.createdAt)}
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
    </div>
  );
}
