import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Trash2, ArrowLeft, Info, AlertTriangle } from 'lucide-react';
import { Customer, Product, ChallanFormData } from '../types';
import { getCustomers } from '../services/customer.service';
import { getProducts } from '../services/product.service';
import { createChallan } from '../services/challan.service';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';

export function ChallanCreatePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [custLoading, setCustLoading] = useState(true);
  const [prodLoading, setProdLoading] = useState(true);

  // Form State
  const [selectedCust, setSelectedCust] = useState<number | null>(null);
  const [items, setItems] = useState<ChallanFormData['items']>([]);
  
  // Product Search State
  const [prodSearch, setProdSearch] = useState('');
  
  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    getCustomers({ limit: 100 }).then(res => setCustomers(res.data)).finally(() => setCustLoading(false));
    getProducts({ limit: 100 }).then(res => setProducts(res.data)).finally(() => setProdLoading(false));
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(prodSearch.toLowerCase()) || 
    p.sku.toLowerCase().includes(prodSearch.toLowerCase())
  );

  function addProduct(p: Product) {
    if (items.some(i => i.productId === p.id)) {
      toast.warning('Product already added.');
      return;
    }
    setItems(prev => [...prev, {
      productId: p.id,
      productName: p.name,
      productSku: p.sku,
      unitPrice: p.unitPrice,
      availableStock: p.currentStock,
      quantity: 1
    }]);
    setProdSearch('');
  }

  function updateQuantity(idx: number, qty: number) {
    const newItems = [...items];
    newItems[idx].quantity = Math.max(1, qty);
    setItems(newItems);
  }

  function removeItem(idx: number) {
    setItems(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSave(saveDraft: boolean) {
    if (!selectedCust) {
      toast.error('Validation Error', 'Please select a customer.');
      return;
    }
    if (items.length === 0) {
      toast.error('Validation Error', 'Please add at least one product.');
      return;
    }

    // UX Validation for stock if confirming
    if (!saveDraft) {
      for (const item of items) {
        if (item.quantity > item.availableStock) {
          toast.error('Insufficient Stock', `Only ${item.availableStock} units available for ${item.productName}.`);
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const data: ChallanFormData = { customerId: selectedCust, items };
      const res = await createChallan(data, user?.name || 'Unknown', saveDraft);
      toast.success(saveDraft ? 'Draft saved.' : 'Challan confirmed successfully.', `Challan ${res.challanNumber} created.`);
      navigate(`/challans/${res.id}`);
    } catch (err) {
      toast.error('Failed to create challan', getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div>
      <PageHeader
        title="Create Challan"
        breadcrumbs={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Challans', to: '/challans' },
          { label: 'Create' }
        ]}
      />
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/challans')}>
          <ArrowLeft size={15} /> Back to list
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 'var(--space-6)', alignItems: 'start' }} className="challan-create-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Customer Selection */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">1. Select Customer</h2>
            </div>
            <div className="card-body">
              <div className="form-group">
                <select 
                  className="form-control" 
                  value={selectedCust || ''} 
                  onChange={e => setSelectedCust(Number(e.target.value) || null)}
                  disabled={custLoading || isSubmitting}
                >
                  <option value="">Select a customer…</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Selection */}
          <div className="card">
            <div className="card-header">
              <h2 className="card-title">2. Add Products</h2>
            </div>
            <div className="card-body">
              <div className="input-wrapper" style={{ marginBottom: 'var(--space-4)' }}>
                <Search size={15} className="input-icon-left" />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search products to add…"
                  value={prodSearch}
                  onChange={e => setProdSearch(e.target.value)}
                  disabled={prodLoading || isSubmitting}
                />
              </div>

              {prodSearch && (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', maxHeight: 200, overflowY: 'auto', marginBottom: 'var(--space-4)' }}>
                  {filteredProducts.length === 0 ? (
                    <div style={{ padding: 'var(--space-3)', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                      No products found
                    </div>
                  ) : (
                    filteredProducts.map(p => (
                      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
                        <div>
                          <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{p.name}</p>
                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>Stock: {p.currentStock}</p>
                        </div>
                        <button className="btn btn-secondary btn-sm" onClick={() => addProduct(p)}>
                          <Plus size={14} /> Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* Selected Items */}
              {items.length > 0 ? (
                <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                  <div className="challan-product-row challan-product-header">
                    <div>Product</div>
                    <div>Price</div>
                    <div>Stock</div>
                    <div>Quantity</div>
                    <div style={{ textAlign: 'right' }}>Total</div>
                    <div></div>
                  </div>
                  {items.map((item, idx) => (
                    <div key={item.productId} className="challan-product-row">
                      <div>
                        <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>{item.productName}</p>
                        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', fontFamily: 'monospace' }}>{item.productSku}</p>
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)' }}>₹{item.unitPrice}</div>
                      <div style={{ fontSize: 'var(--font-size-sm)', color: item.quantity > item.availableStock ? 'var(--color-error)' : 'inherit' }}>
                        {item.availableStock}
                      </div>
                      <div>
                        <input 
                          type="number" 
                          className="form-control" 
                          style={{ height: 32, padding: '0 8px', width: 70 }}
                          value={item.quantity}
                          onChange={e => updateQuantity(idx, Number(e.target.value))}
                          min="1"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, textAlign: 'right' }}>
                        ₹{(item.unitPrice * item.quantity).toLocaleString('en-IN')}
                      </div>
                      <div>
                        <button className="table-action-btn danger" onClick={() => removeItem(idx)} disabled={isSubmitting}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.some(i => i.quantity > i.availableStock) && (
                    <div className="info-banner error" style={{ margin: 'var(--space-3)', border: 'none' }}>
                      <AlertTriangle size={16} style={{ flexShrink: 0 }} />
                      <span>One or more items exceed available stock. You can save as draft, but cannot confirm.</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ padding: 'var(--space-6)', textAlign: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', color: 'var(--color-text-muted)' }}>
                  Search and add products to the challan
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Summary */}
        <div className="card" style={{ position: 'sticky', top: 'calc(var(--topbar-height) + var(--space-6))' }}>
          <div className="card-header">
            <h2 className="card-title">Summary</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
              <span className="text-secondary">Customer:</span>
              <span style={{ fontWeight: 500, textAlign: 'right' }}>
                {selectedCust ? customers.find(c => c.id === selectedCust)?.name : 'Not selected'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-3)', fontSize: 'var(--font-size-sm)' }}>
              <span className="text-secondary">Products:</span>
              <span style={{ fontWeight: 500 }}>{items.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
              <span className="text-secondary">Total Qty:</span>
              <span style={{ fontWeight: 600 }}>{totalQty}</span>
            </div>

            <div className="info-banner info" style={{ marginBottom: 'var(--space-5)', padding: 'var(--space-2) var(--space-3)' }}>
              <Info size={14} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: '11px', lineHeight: 1.4 }}>
                <strong>Draft:</strong> Saves without reducing inventory.<br/>
                <strong>Confirm:</strong> Instantly deducts from stock.
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button 
                className="btn btn-secondary w-full" 
                onClick={() => handleSave(true)}
                disabled={isSubmitting || items.length === 0 || !selectedCust}
              >
                Save as Draft
              </button>
              <button 
                className="btn btn-primary w-full" 
                onClick={() => handleSave(false)}
                disabled={isSubmitting || items.length === 0 || !selectedCust || items.some(i => i.quantity > i.availableStock)}
              >
                Confirm Challan
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 1024px) {
          .challan-create-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
