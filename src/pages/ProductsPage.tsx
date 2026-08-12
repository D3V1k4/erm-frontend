import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Package, Pencil } from 'lucide-react';
import { Product, ProductFormData, PaginationMeta } from '../types';
import { getProducts, createProduct, updateProduct, getCategories, getWarehouseLocations } from '../services/product.service';
import { getStockStatus } from '../types';
import { PageHeader } from '../components/ui/PageHeader';
import { SearchInput } from '../components/ui/SearchInput';
import { StockStatusBadge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Pagination } from '../components/ui/Pagination';
import { TableSkeleton, EmptyState, ErrorState } from '../components/ui/States';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../services/api';
import { AlertCircle } from 'lucide-react';

const DEFAULT_META: PaginationMeta = { page: 1, limit: 20, total: 0, totalPages: 0 };

const EMPTY_FORM: ProductFormData = {
  name: '', sku: '', category: '', unitPrice: '',
  currentStock: '', minimumStock: '', warehouseLocation: '',
};

type FormErrors = Partial<Record<keyof ProductFormData, string>>;

function ProductForm({
  initialData, onSubmit, onCancel, isLoading, categories,
}: {
  initialData?: Product;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  categories: string[];
}) {
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        sku: initialData.sku,
        category: initialData.category,
        unitPrice: initialData.unitPrice,
        currentStock: initialData.currentStock,
        minimumStock: initialData.minimumStock,
        warehouseLocation: initialData.warehouseLocation,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initialData]);

  function update(field: keyof ProductFormData, value: string | number) {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: undefined }));
  }

  function validate(): boolean {
    const e: FormErrors = {};
    if (!form.name.trim()) e.name = 'Product name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (!form.category.trim()) e.category = 'Category is required';
    if (form.unitPrice === '' || Number(form.unitPrice) < 0) e.unitPrice = 'Unit price must be 0 or more';
    if (form.currentStock === '' || Number(form.currentStock) < 0) e.currentStock = 'Stock cannot be negative';
    if (form.minimumStock === '' || Number(form.minimumStock) < 0) e.minimumStock = 'Minimum stock cannot be negative';
    if (!form.warehouseLocation.trim()) e.warehouseLocation = 'Warehouse location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="p-name">Product Name <span className="required">*</span></label>
            <input id="p-name" type="text" className={`form-control ${errors.name ? 'error' : ''}`}
              value={form.name} onChange={e => update('name', e.target.value)}
              placeholder="Product name" autoFocus disabled={isLoading} />
            {errors.name && <span className="form-error"><AlertCircle size={12} />{errors.name}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="p-sku">SKU / Code <span className="required">*</span></label>
            <input id="p-sku" type="text" className={`form-control ${errors.sku ? 'error' : ''}`}
              value={form.sku} onChange={e => update('sku', e.target.value.toUpperCase())}
              placeholder="SE-DET-001" disabled={isLoading} />
            {errors.sku && <span className="form-error"><AlertCircle size={12} />{errors.sku}</span>}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="p-category">Category <span className="required">*</span></label>
            <input id="p-category" type="text" className={`form-control ${errors.category ? 'error' : ''}`}
              value={form.category} onChange={e => update('category', e.target.value)}
              placeholder="e.g. Detergents" list="categories-list" disabled={isLoading} />
            <datalist id="categories-list">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
            {errors.category && <span className="form-error"><AlertCircle size={12} />{errors.category}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="p-price">Unit Price (₹) <span className="required">*</span></label>
            <input id="p-price" type="number" className={`form-control ${errors.unitPrice ? 'error' : ''}`}
              value={form.unitPrice} onChange={e => update('unitPrice', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0.00" min="0" step="0.01" disabled={isLoading} />
            {errors.unitPrice && <span className="form-error"><AlertCircle size={12} />{errors.unitPrice}</span>}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label" htmlFor="p-stock">Current Stock <span className="required">*</span></label>
            <input id="p-stock" type="number" className={`form-control ${errors.currentStock ? 'error' : ''}`}
              value={form.currentStock} onChange={e => update('currentStock', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0" min="0" disabled={isLoading} />
            {errors.currentStock && <span className="form-error"><AlertCircle size={12} />{errors.currentStock}</span>}
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="p-minstock">Minimum Stock Alert <span className="required">*</span></label>
            <input id="p-minstock" type="number" className={`form-control ${errors.minimumStock ? 'error' : ''}`}
              value={form.minimumStock} onChange={e => update('minimumStock', e.target.value === '' ? '' : Number(e.target.value))}
              placeholder="0" min="0" disabled={isLoading} />
            {errors.minimumStock && <span className="form-error"><AlertCircle size={12} />{errors.minimumStock}</span>}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="p-warehouse">Warehouse Location <span className="required">*</span></label>
          <input id="p-warehouse" type="text" className={`form-control ${errors.warehouseLocation ? 'error' : ''}`}
            value={form.warehouseLocation} onChange={e => update('warehouseLocation', e.target.value)}
            placeholder="Section A - Rack 3" disabled={isLoading} />
          {errors.warehouseLocation && <span className="form-error"><AlertCircle size={12} />{errors.warehouseLocation}</span>}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={isLoading}>
            {isLoading && <span className="spinner" />}
            {isLoading ? 'Saving…' : initialData ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </div>
    </form>
  );
}

export function ProductsPage() {
  const toast = useToast();
  const [products, setProducts]   = useState<Product[]>([]);
  const [meta, setMeta]           = useState<PaginationMeta>(DEFAULT_META);
  const [search, setSearch]       = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [stockFilter, setStockFilter]       = useState('');
  const [page, setPage]           = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSaving, setIsSaving]   = useState(false);

  const load = useCallback(async () => {
    try {
      setIsLoading(true); setError('');
      const result = await getProducts({
        search: search || undefined,
        category: categoryFilter || undefined,
        stockStatus: stockFilter || undefined,
        page, limit: 20,
      });
      setProducts(result.data);
      setMeta(result.meta);
      setCategories(getCategories());
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setIsLoading(false); }
  }, [search, categoryFilter, stockFilter, page]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  async function handleSave(data: ProductFormData) {
    setIsSaving(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success('Product updated successfully.');
      } else {
        await createProduct(data);
        toast.success('Product added successfully.');
      }
      setModalOpen(false); setEditingProduct(null); load();
    } catch (err) {
      toast.error(editingProduct ? 'Unable to update product.' : 'Unable to add product.', getErrorMessage(err));
    } finally { setIsSaving(false); }
  }

  return (
    <div>
      <PageHeader
        title="Products"
        description="Manage your product catalogue and stock information."
        breadcrumbs={[{ label: 'Dashboard', to: '/dashboard' }, { label: 'Products' }]}
        actions={
          <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div className="toolbar">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name, SKU, category…" />
        <div className="toolbar-filters">
          <select className="form-control" style={{ width: 'auto', height: 36 }}
            value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }} aria-label="Filter by category">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="form-control" style={{ width: 'auto', height: 36 }}
            value={stockFilter} onChange={e => { setStockFilter(e.target.value); setPage(1); }} aria-label="Filter by stock status">
            <option value="">All Stock Status</option>
            <option value="in-stock">In Stock</option>
            <option value="low-stock">Low Stock</option>
            <option value="out-of-stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="card">
        {error && <ErrorState description={error} onRetry={load} />}
        {!error && (
          <>
            <div className="table-wrapper">
              <table className="data-table" aria-label="Products table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Unit Price</th>
                    <th>Stock</th>
                    <th>Warehouse</th>
                    <th>Status</th>
                    <th style={{ width: 70 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? <TableSkeleton rows={6} cols={8} /> :
                  products.length === 0 ? (
                    <tr><td colSpan={8}>
                      <EmptyState icon={<Package size={24} />} title="No products found"
                        description={search || categoryFilter || stockFilter ? 'Try adjusting your filters.' : 'Add your first product to get started.'}
                        action={!search && !categoryFilter && !stockFilter ? (
                          <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setModalOpen(true); }}>
                            <Plus size={16} /> Add Product
                          </button>
                        ) : undefined}
                      />
                    </td></tr>
                  ) : (
                    products.map((product) => {
                      const stockStatus = getStockStatus(product);
                      return (
                        <tr key={product.id}>
                          <td>
                            <p style={{ fontWeight: 500 }}>{product.name}</p>
                          </td>
                          <td>
                            <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-xs)', background: 'var(--color-bg-secondary)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-secondary)' }}>
                              {product.sku}
                            </span>
                          </td>
                          <td>{product.category}</td>
                          <td style={{ fontWeight: 500 }}>₹{product.unitPrice.toLocaleString('en-IN')}</td>
                          <td>
                            <div className="stock-cell">
                              <span className="stock-qty" style={{
                                color: stockStatus === 'out-of-stock' ? 'var(--color-error)'
                                     : stockStatus === 'low-stock' ? 'var(--color-warning)'
                                     : 'var(--color-text)',
                                fontWeight: 600,
                              }}>
                                {product.currentStock}
                              </span>
                              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                                Min: {product.minimumStock}
                              </span>
                            </div>
                          </td>
                          <td style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)' }}>
                            {product.warehouseLocation}
                          </td>
                          <td>
                            <StockStatusBadge status={stockStatus} currentStock={product.currentStock} />
                          </td>
                          <td>
                            <div className="table-actions">
                              <button className="table-action-btn"
                                title="Edit product"
                                onClick={() => { setEditingProduct(product); setModalOpen(true); }}
                                aria-label={`Edit ${product.name}`}>
                                <Pencil size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            {!isLoading && meta.total > 0 && <Pagination meta={meta} onPageChange={setPage} />}
          </>
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        size="lg"
        onClose={() => { setModalOpen(false); setEditingProduct(null); }}
      >
        <ProductForm
          initialData={editingProduct || undefined}
          onSubmit={handleSave}
          onCancel={() => { setModalOpen(false); setEditingProduct(null); }}
          isLoading={isSaving}
          categories={categories}
        />
      </Modal>
    </div>
  );
}
