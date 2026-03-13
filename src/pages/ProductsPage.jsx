import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, X, Layers, RefreshCw } from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Badge, Button } from '../components/ui';
import { uploadImage } from '../lib/cloudinary';
import { ImagePlus, Camera } from 'lucide-react';


const EMPTY_FORM = { name: '', sku: '', category: '', price: '', stock: '', description: '', image: '' };


function ProductModal({ open, onClose, onSave, initial }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);



    useEffect(() => {
        setForm(initial ? { ...EMPTY_FORM, ...initial } : EMPTY_FORM);
    }, [initial, open]);

    if (!open) return null;

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const url = await uploadImage(file);
            setForm(prev => ({ ...prev, image: url }));
        } catch (err) {
            alert('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        await onSave({ ...form, price: Number(form.price), stock: Number(form.stock) });
        setSaving(false);
    };


    const field = (label, key, type = 'text', required = true, placeholder = '') => (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{required && <span className="text-red-400 ml-0.5">*</span>}</label>
            <input
                type={type}
                value={form[key]}
                onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                required={required}
                placeholder={placeholder}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white"
            />
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">{initial?.id ? 'Edit Product' : 'Add New Product'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="flex justify-center mb-6">
                        <div className="relative group">
                            <div className="h-24 w-24 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center relative">
                                {form.image ? (
                                    <img src={form.image} alt="Preview" className="h-full w-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Camera size={24} className="text-gray-300 mx-auto" />
                                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Add Image</p>
                                    </div>
                                )}
                                {uploading && (
                                    <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                        <RefreshCw size={16} className="text-blue-600 animate-spin" />
                                    </div>
                                )}
                            </div>
                            <label className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-2 border-white">
                                <ImagePlus size={14} />
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                            </label>
                            {form.image && !uploading && (
                                <button type="button" onClick={() => setForm(p => ({ ...p, image: '' }))} className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 border-2 border-white">
                                    <X size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                    {field('Product Name', 'name', 'text', true, 'e.g. Rocket Crackers')}

                    <div className="grid grid-cols-2 gap-4">
                        {field('SKU', 'sku', 'text', false, 'e.g. SKU-001')}
                        {field('Category', 'category', 'text', true, 'e.g. Crackers')}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {field('Price (₹)', 'price', 'number', true, '0')}
                        {field('Stock', 'stock', 'number', true, '0')}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            rows={2}
                            placeholder="Optional product description"
                            className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none"
                        />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
                            {saving ? 'Saving...' : (initial?.id ? 'Update Product' : 'Add Product')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirm({ open, name, onClose, onConfirm, loading }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                        <Trash2 size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900">Delete Product</h3>
                        <p className="text-xs text-gray-500 mt-0.5">This action cannot be undone.</p>
                    </div>
                </div>
                <p className="text-sm text-gray-600 mb-5">Are you sure you want to delete <strong>"{name}"</strong>?</p>
                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-60">
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function ProductsPage() {
    const { companyId } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, item: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, item: null, loading: false });

    useEffect(() => { if (companyId) load(); }, [companyId]);

    const load = async () => {
        setLoading(true); setError(null);
        try {
            const firestoreProducts = await FirestoreService.getProducts(companyId);
            let backendProducts = [];
            try {
                const resp = await fetch(`https://averqonbill-1.onrender.com/api/products/${companyId}`);
                if (resp.ok) backendProducts = await resp.json();
            } catch (err) { console.warn('Backend products failed to load', err); }

            const normalizedBackend = backendProducts.map(p => ({
                id: p._id,
                ...p,
                image: p.images?.[0] || '',
            }));

            // Combine and sort by name
            const combined = [...firestoreProducts, ...normalizedBackend].sort((a, b) =>
                (a.name || '').localeCompare(b.name || '')
            );

            setProducts(combined);
        }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const handleSave = async (data) => {
        try {
            if (modal.item?.id) {
                const isBackend = modal.item.platform;
                if (isBackend) {
                    const resp = await fetch(`https://averqonbill-1.onrender.com/api/products/${modal.item._id || modal.item.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ ...data, companyId })
                    });
                    if (!resp.ok) throw new Error('Backend sync failed');
                } else {
                    await FirestoreService.update('products', modal.item.id, data);
                }
                setProducts(prev => prev.map(p => p.id === modal.item.id ? { ...p, ...data } : p));
            } else {
                const ref = await FirestoreService.add('products', data, companyId);
                setProducts(prev => [{ id: ref.id, ...data, companyId }, ...prev]);
            }
            setModal({ open: false, item: null });
        } catch (e) { alert('Error: ' + e.message); }
    };

    const handleDelete = async () => {
        setDeleteModal(d => ({ ...d, loading: true }));
        try {
            const isBackend = deleteModal.item.platform;
            if (isBackend) {
                const resp = await fetch(`https://averqonbill-1.onrender.com/api/products/${deleteModal.item._id || deleteModal.item.id}`, {
                    method: 'DELETE'
                });
                if (!resp.ok) throw new Error('Backend delete failed');
            } else {
                await FirestoreService.delete('products', deleteModal.item.id);
            }
            setProducts(prev => prev.filter(p => p.id !== deleteModal.item.id));
            setDeleteModal({ open: false, item: null, loading: false });
        } catch (e) {
            alert('Delete failed: ' + e.message);
            setDeleteModal(d => ({ ...d, loading: false }));
        }
    };

    const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.sku?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    const totalValue = products.reduce((a, p) => a + (Number(p.price) * Number(p.stock)), 0);
    const lowStock = products.filter(p => p.stock < 10).length;

    return (
        <div className="space-y-5">
            {/* CRUD Modal */}
            <ProductModal
                open={modal.open}
                initial={modal.item}
                onClose={() => setModal({ open: false, item: null })}
                onSave={handleSave}
            />
            <DeleteConfirm
                open={deleteModal.open}
                name={deleteModal.item?.name}
                loading={deleteModal.loading}
                onClose={() => setDeleteModal({ open: false, item: null, loading: false })}
                onConfirm={handleDelete}
            />

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Total Products</p>
                        <p className="text-2xl font-bold text-gray-900 mt-0.5">{products.length}</p>
                    </div>
                    <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                        <Package size={17} />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Low Stock Alerts</p>
                        <p className="text-2xl font-bold text-red-600 mt-0.5">{lowStock}</p>
                    </div>
                    <div className="h-9 w-9 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                        <AlertCircle size={17} />
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500">Inventory Value</p>
                        <p className="text-2xl font-bold text-green-600 mt-0.5">₹{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="h-9 w-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                        <Layers size={17} />
                    </div>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="relative w-64">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button
                            onClick={() => setModal({ open: true, item: null })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={13} /> Add Product
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <AlertCircle size={36} className="text-red-300 mb-3" />
                        <p className="text-sm text-gray-500 mb-3">{error}</p>
                        <button onClick={load} className="text-sm text-blue-600 hover:underline">Try again</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Package size={36} strokeWidth={1} className="mb-3 opacity-40" />
                        <p className="text-sm">{search ? 'No products match your search' : 'No products yet'}</p>
                        {!search && (
                            <button onClick={() => setModal({ open: true, item: null })} className="mt-3 text-sm text-blue-600 hover:underline">
                                Add your first product
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Product</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">SKU</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Price</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Stock</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {p.image ? (
                                                        <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
                                                    ) : (
                                                        <Package size={16} className="text-gray-300" />
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">{p.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-xs text-gray-400 font-mono">#{p.id.slice(-6)}</p>
                                                        {p.platform && (
                                                            <span className={`px-1 rounded-[4px] text-[8px] font-black uppercase tracking-tighter border ${p.platform === 'shopify' ? 'bg-[#95BF47]/10 text-[#95BF47] border-[#95BF47]/20' :
                                                                'bg-[#96588A]/10 text-[#96588A] border-[#96588A]/20'
                                                                }`}>
                                                                {p.platform}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-sm text-gray-500">{p.sku || '—'}</td>
                                        <td className="px-4 py-3.5">
                                            {p.category && <Badge variant="primary">{p.category}</Badge>}
                                        </td>
                                        <td className="px-4 py-3.5 text-sm font-semibold text-gray-900">₹{Number(p.price).toLocaleString()}</td>
                                        <td className="px-4 py-3.5">
                                            <span className={`text-sm font-semibold ${p.stock < 10 ? 'text-red-600' : 'text-gray-800'}`}>
                                                {p.stock} units
                                            </span>
                                            {p.stock < 10 && <span className="ml-2 inline-flex h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => setModal({ open: true, item: p })}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <Edit2 size={12} /> Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteModal({ open: true, item: p, loading: false })}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1"
                                                >
                                                    <Trash2 size={12} /> Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-5 py-3 border-t border-gray-100">
                    <p className="text-xs text-gray-400">{filtered.length} of {products.length} products</p>
                </div>
            </div>
        </div>
    );
}
