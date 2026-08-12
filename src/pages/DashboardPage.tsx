import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Package, FileText, AlertTriangle,
  TrendingDown, Calendar, ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/ui/PageHeader';
import { ChallanStatusBadge } from '../components/ui/Badge';
import { StatCardSkeleton, TableSkeleton, ErrorState } from '../components/ui/States';
import { getDashboardStats, getRecentChallans } from '../services/challan.service';
import { getMockProducts } from '../services/product.service';
import { getStockStatus, Product, Challan, DashboardStats } from '../types';
import { getErrorMessage } from '../services/api';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats]           = useState<DashboardStats | null>(null);
  const [challans, setChallans]     = useState<Challan[]>([]);
  const [lowStock, setLowStock]     = useState<Product[]>([]);
  const [upcomingFollowups] = useState([
    { customer: 'Rajesh Kumar',  business: 'Kumar Traders',          date: '2026-08-20', note: 'Review Q3 pricing' },
    { customer: 'Priya Mehta',   business: 'Mehta Textiles Pvt Ltd', date: '2026-08-15', note: 'Distributor terms review' },
    { customer: 'Amit Singh',    business: 'Singh General Store',    date: '2026-08-12', note: 'Send quotation for detergents' },
  ]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true);
        const [statsData, recentChallansData] = await Promise.all([
          getDashboardStats(),
          Promise.resolve(getRecentChallans(5)),
        ]);
        const allProducts = getMockProducts();
        setStats(statsData);
        setChallans(recentChallansData);
        setLowStock(allProducts.filter((p) => getStockStatus(p) !== 'in-stock').slice(0, 6));
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      <PageHeader
        title={`${greeting}, ${user?.name?.split(' ')[0]}`}
        description="Here's what's happening with your operations today."
      />

      {error && <ErrorState description={error} onRetry={() => window.location.reload()} />}

      {/* Stat Cards */}
      <div className="stats-grid">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : stats && (
          <>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Total Customers</span>
                <div className="stat-card-icon blue"><Users size={18} /></div>
              </div>
              <p className="stat-card-value">{stats.totalCustomers}</p>
              <p className="stat-card-meta">Across all statuses</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Total Products</span>
                <div className="stat-card-icon green"><Package size={18} /></div>
              </div>
              <p className="stat-card-value">{stats.totalProducts}</p>
              <p className="stat-card-meta">In product catalogue</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Pending Challans</span>
                <div className="stat-card-icon amber"><FileText size={18} /></div>
              </div>
              <p className="stat-card-value">{stats.pendingChallans}</p>
              <p className="stat-card-meta">Awaiting confirmation</p>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Low Stock Products</span>
                <div className="stat-card-icon red"><AlertTriangle size={18} /></div>
              </div>
              <p className="stat-card-value" style={{ color: stats.lowStockProducts > 0 ? 'var(--color-warning-text)' : undefined }}>
                {stats.lowStockProducts}
              </p>
              <p className="stat-card-meta">Require restocking</p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Grid */}
      <div className="dashboard-grid">
        {/* Recent Challans */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Sales Challans</h2>
            <Link to="/challans" className="btn btn-ghost btn-sm">
              View all <ArrowRight size={14} />
            </Link>
          </div>
          {isLoading ? (
            <table className="data-table">
              <tbody><TableSkeleton rows={4} cols={4} /></tbody>
            </table>
          ) : challans.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              No challans yet
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Challan No.</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {challans.map((challan) => (
                    <tr key={challan.id}>
                      <td>
                        <Link
                          to={`/challans/${challan.id}`}
                          style={{ color: 'var(--color-primary)', fontWeight: 500 }}
                        >
                          {challan.challanNumber}
                        </Link>
                      </td>
                      <td>{challan.customerName}</td>
                      <td>{challan.totalQuantity}</td>
                      <td><ChallanStatusBadge status={challan.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Low Stock Alert</h2>
            <Link to="/inventory" className="btn btn-ghost btn-sm">
              View inventory <ArrowRight size={14} />
            </Link>
          </div>
          {isLoading ? (
            <table className="data-table">
              <tbody><TableSkeleton rows={4} cols={3} /></tbody>
            </table>
          ) : lowStock.length === 0 ? (
            <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-success-text)', fontSize: 'var(--font-size-sm)' }}>
              All products are adequately stocked ✓
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Min.</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => {
                    const status = getStockStatus(product);
                    return (
                      <tr key={product.id}>
                        <td>
                          <div>
                            <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)' }}>{product.name}</p>
                            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{product.sku}</p>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: status === 'out-of-stock' ? 'var(--color-error)' : 'var(--color-warning)' }}>
                            {product.currentStock}
                          </span>
                        </td>
                        <td style={{ color: 'var(--color-text-secondary)' }}>{product.minimumStock}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Upcoming CRM Follow-ups</h2>
            <Link to="/customers" className="btn btn-ghost btn-sm">
              View customers <ArrowRight size={14} />
            </Link>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {upcomingFollowups.map((f, i) => (
              <div key={i} className="followup-item" style={{ padding: 'var(--space-4) var(--space-5)' }}>
                <div className="followup-dot" style={{ marginTop: 6 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 500, fontSize: 'var(--font-size-sm)', color: 'var(--color-text)', marginBottom: 2 }}>
                    {f.customer}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 4 }}>
                    {f.business}
                  </p>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>{f.note}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                  <Calendar size={12} />
                  {formatDate(f.date)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operational Summary */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Stock Overview</h2>
          </div>
          <div className="card-body">
            {isLoading ? (
              <>
                <div className="skeleton skeleton-text" style={{ height: 48, marginBottom: 12 }} />
                <div className="skeleton skeleton-text" style={{ height: 48, marginBottom: 12 }} />
                <div className="skeleton skeleton-text" style={{ height: 48 }} />
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {[
                  { label: 'In Stock',     count: getMockProducts().filter(p => getStockStatus(p) === 'in-stock').length,     color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
                  { label: 'Low Stock',    count: getMockProducts().filter(p => getStockStatus(p) === 'low-stock').length,    color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
                  { label: 'Out of Stock', count: getMockProducts().filter(p => getStockStatus(p) === 'out-of-stock').length, color: 'var(--color-error)',   bg: 'var(--color-error-bg)' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-md)', background: item.bg }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                      <TrendingDown size={16} style={{ color: item.color }} />
                      <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-text)' }}>{item.label}</span>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: item.color }}>{item.count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
