import React, { useState, useEffect } from 'react';
import {
    Package, Search, Plus, Minus, Edit2, Trash2,
    AlertTriangle, ArrowUp, ArrowDown, RefreshCw,
    History, X, TrendingUp, CheckCircle2, Archive
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import {
    collection, query, where, orderBy, addDoc,
    onSnapshot, serverTimestamp, doc, updateDoc, increment
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AutomationService } from '../utils/automation';

/* ─── Adjust Stock Modal ─────────────────────────────────── */
function AdjustModal({ open, product, onClose, onAdjust, suppliers = [] }) {
    const [type, setType] = useState('add');      // 'add' | 'remove' | 'set'
    const [qty, setQty] = useState('');
    const [reason, setReason] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setQty('');
        setReason('');
        setType(product?._quickType || 'add');
        setSupplierId('');
    }, [open, product]);

    if (!open || !product) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!qty || Number(qty) <= 0) return;
        setSaving(true);
        await onAdjust({ type, qty: Number(qty), reason, supplierId });
        setSaving(false);
    };

    const preview = () => {
        const q = Number(qty) || 0;
        const cur = Number(product.stock) || 0;
        if (type === 'add') return cur + q;
        if (type === 'remove') return Math.max(0, cur - q);
        return q;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Adjust Inventory for {product.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Type Tabs */}
                        <div className="flex border-b border-gray-200">
                            {[
                                { val: 'add', label: 'Add Stock' },
                                { val: 'remove', label: 'Subtract' },
                                { val: 'set', label: 'Set Manually' },
                            ].map(({ val, label }) => (
                                <button key={val} type="button" onClick={() => setType(val)}
                                    className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${type === val ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        <div className="bg-blue-50/50 p-4 rounded border border-blue-100/50 grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Stock on Hand</label>
                                <p className="text-lg font-bold text-gray-800">{product.stock} units</p>
                            </div>
                            {qty && (
                                <div className="text-right">
                                    <label className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Post Adjustment</label>
                                    <p className="text-lg font-bold text-blue-600">{preview()} units</p>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-600 block mb-1.5">Quantity *</label>
                                <input type="number" min="1" value={qty} onChange={e => setQty(e.target.value)} required
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-600 outline-none" />
                            </div>
                            <div className="col-span-1">
                                <label className="text-xs font-bold text-gray-600 block mb-1.5">Date</label>
                                <input type="date" value={new Date().toISOString().split('T')[0]} readOnly
                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-400 outline-none" />
                            </div>
                        </div>

                        {type === 'add' && suppliers.length > 0 && (
                            <div>
                                <label className="text-xs font-bold text-gray-600 block mb-1.5">Supplier</label>
                                <select
                                    value={supplierId}
                                    onChange={e => setSupplierId(e.target.value)}
                                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-600 outline-none appearance-none"
                                >
                                    <option value="">Select a vendor</option>
                                    {suppliers.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-600 block mb-1.5">Reason / Description</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)}
                                placeholder="Enter reason for adjustment..." rows="2"
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-600 outline-none resize-none" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mt-8 justify-end border-t border-gray-100 pt-6">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors">Cancel</button>
                        <button type="submit" disabled={saving || !qty}
                            className="bg-[#0067ff] hover:bg-[#0056d6] text-white px-6 py-2 rounded text-sm font-bold shadow-sm disabled:opacity-50 transition-all">
                            {saving ? 'Adjusting...' : 'Save Adjustment'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

/* ─── Stock History Modal ────────────────────────────────── */
function HistoryModal({ open, product, onClose, history }) {
    if (!open || !product) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
                    <h2 className="text-lg font-bold text-gray-800">Transaction History: {product.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <table className="w-full text-left">
                        <thead className="sticky top-0 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Type</th>
                                <th className="px-6 py-3">Quantity</th>
                                <th className="px-6 py-3">Balance</th>
                                <th className="px-6 py-3">Reference</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-gray-400">
                                        <History size={32} className="mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">No recent activities</p>
                                    </td>
                                </tr>
                            ) : history.map((h, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-medium text-gray-600">
                                        {h.createdAt?.toDate ? h.createdAt.toDate().toLocaleDateString('en-GB') : '—'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${h.type === 'add' ? 'bg-emerald-50 text-emerald-600' : h.type === 'remove' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {h.type}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-xs font-bold ${h.type === 'add' ? 'text-emerald-600' : h.type === 'remove' ? 'text-red-600' : 'text-gray-900'}`}>
                                        {h.type === 'add' ? '+' : h.type === 'remove' ? '-' : ''}{h.qty}
                                    </td>
                                    <td className="px-6 py-4 text-xs font-semibold text-gray-900">
                                        {h.newStock}
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500 italic max-w-[150px] truncate">
                                        {h.reason || (h.supplierId ? 'Vendor Restock' : 'Audit')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Stock Page ───────────────────────────────────── */
export default function StockPage() {
    const { companyId, userData } = useAuth();
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');   // all | low | out
    const [adjustModal, setAdjustModal] = useState({ open: false, product: null });
    const [historyModal, setHistoryModal] = useState({ open: false, product: null, logs: [] });

    /* Load initial data */
    useEffect(() => {
        if (!companyId) return;

        // 1. Real-time Firestore sync
        const q = query(
            collection(db, 'products'),
            where('companyId', '==', companyId),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q, async (snap) => {
            const firestoreProds = snap.docs.map(d => ({ id: d.id, ...d.data() }));

            // 2. Fetch Backend products
            let backendProds = [];
            try {
                const resp = await fetch(`https://averqonbill-1.onrender.com/api/products/${companyId}`);
                if (resp.ok) {
                    const data = await resp.json();
                    backendProds = data.map(p => ({
                        id: p._id,
                        name: p.name,
                        sku: p.sku || p.externalId,
                        price: p.price,
                        stock: p.stock,
                        category: p.category || 'Integrated',
                        source: p.platform,
                        ...p
                    }));
                }
            } catch (err) { console.warn('Backend products load error:', err); }

            // 3. Unify
            const combined = [...firestoreProds, ...backendProds].sort((a, b) =>
                new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt)
            );

            setProducts(combined);
            setLoading(false);
        });

        FirestoreService.getAllByCompany('suppliers', companyId).then(setSuppliers);
        return unsub;
    }, [companyId]);

    const handleAdjust = async ({ type, qty, reason, supplierId }) => {
        const p = adjustModal.product;
        if (!p) return;
        let newStock;
        if (type === 'add') newStock = Number(p.stock) + qty;
        else if (type === 'remove') newStock = Math.max(0, Number(p.stock) - qty);
        else newStock = qty;

        try {
            // Update Firestore for local management
            await updateDoc(doc(db, 'products', p.id), {
                stock: newStock,
                updatedAt: serverTimestamp()
            });

            // If it's an integrated product, push to backend so it can sync to Shopify/WooCommerce
            if (p.platform) {
                try {
                    await fetch(`https://averqonbill-1.onrender.com/api/products/${p._id}/adjust-stock`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ qty: newStock, companyId })
                    });
                } catch (err) {
                    console.error('Failed to push stock update to platform:', err);
                }
            }

            const logEntry = {
                companyId,
                productId: p.id,
                productName: p.name,
                type,
                qty,
                previousStock: Number(p.stock),
                newStock,
                reason: reason || '',
                supplierId: supplierId || null,
                by: userData?.name || 'Admin',
                createdAt: serverTimestamp(),
            };

            await addDoc(collection(db, 'stock_logs'), logEntry);
            AutomationService.trigger(companyId, 'stock.adjusted', { id: p.id, ...logEntry, createdAt: new Date().toISOString() });
            setAdjustModal({ open: false, product: null });
        } catch (e) {
            alert('Failed to update stock: ' + e.message);
        }
    };

    const openHistory = async (product) => {
        try {
            const logs = await FirestoreService.getAllByCompany(
                'stock_logs', companyId,
                [where('productId', '==', product.id)],
                [orderBy('createdAt', 'desc')]
            );
            setHistoryModal({ open: true, product, logs });
        } catch (e) {
            const logs = await FirestoreService.getAllByCompany('stock_logs', companyId, [where('productId', '==', product.id)]);
            setHistoryModal({ open: true, product, logs });
        }
    };

    const filtered = products.filter(p => {
        const matchSearch = !search ||
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.sku?.toLowerCase().includes(search.toLowerCase());
        const matchFilter =
            filter === 'all' ? true :
                filter === 'low' ? (Number(p.stock) > 0 && Number(p.stock) < 10) :
                    filter === 'out' ? Number(p.stock) === 0 : true;
        return matchSearch && matchFilter;
    });

    const stats = {
        totalValue: products.reduce((a, p) => a + (Number(p.price || 0) * Number(p.stock || 0)), 0),
        low: products.filter(p => Number(p.stock) > 0 && Number(p.stock) < 10).length,
        out: products.filter(p => Number(p.stock) === 0).length,
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            <AdjustModal
                open={adjustModal.open}
                product={adjustModal.product}
                suppliers={suppliers}
                onClose={() => setAdjustModal({ open: false, product: null })}
                onAdjust={handleAdjust}
            />
            <HistoryModal
                open={historyModal.open}
                product={historyModal.product}
                history={historyModal.logs}
                onClose={() => setHistoryModal({ open: false, product: null, logs: [] })}
            />

            {/* Zoho Header with Filter Tabs */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1 className="text-xl font-semibold text-gray-800">Inventory Status</h1>
                    <div className="flex border-l border-gray-300 ml-2 pl-6 gap-6">
                        {['all', 'low', 'out'].map(f => (
                            <button key={f} onClick={() => setFilter(f)}
                                className={`text-sm font-medium transition-colors relative pb-1 ${filter === f ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                                {f.charAt(0).toUpperCase() + f.slice(1)} Items
                                {filter === f && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-full" />}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Find items..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Summary Strips */}
            <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center gap-8">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Asset Value</span>
                    <span className="text-sm font-bold text-gray-800">₹{stats.totalValue.toLocaleString()}</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Low Stock</span>
                    <span className={`text-sm font-bold ${stats.low > 0 ? 'text-amber-600' : 'text-gray-800'}`}>{stats.low}</span>
                </div>
                <div className="w-px h-4 bg-gray-200"></div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Stock Out</span>
                    <span className={`text-sm font-bold ${stats.out > 0 ? 'text-rose-600' : 'text-gray-800'}`}>{stats.out}</span>
                </div>
            </div>

            {/* High Density Items Table */}
            <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 z-10">
                        <tr>
                            <th className="px-6 py-3 min-w-[300px]">Item Details</th>
                            <th className="px-6 py-3">Category</th>
                            <th className="px-6 py-3">Stock on Hand</th>
                            <th className="px-6 py-3">Price (₹)</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => <tr key={i} className="animate-pulse h-16 bg-gray-50/50" />)
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="py-20 text-center text-gray-400">
                                    <Package size={48} className="mx-auto mb-3 opacity-10" />
                                    <p className="text-sm font-medium">No inventory data matches your selection.</p>
                                </td>
                            </tr>
                        ) : filtered.map(p => {
                            const stock = Number(p.stock || 0);
                            const isLow = stock > 0 && stock < 10;
                            const isOut = stock === 0;

                            return (
                                <tr key={p.id} className="hover:bg-blue-50/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-8 w-8 rounded flex items-center justify-center border font-bold text-xs ${isOut ? 'bg-red-50 border-red-100 text-red-600' : isLow ? 'bg-amber-50 border-amber-100 text-amber-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>
                                                {p.name.slice(0, 1).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900 leading-none">{p.name}</p>
                                                <p className="text-[11px] text-gray-400 mt-1 font-mono">{p.sku || '--'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase px-2 py-0.5 bg-gray-100 rounded">
                                            {p.category || 'Retail'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <p className={`text-sm font-bold ${isOut ? 'text-red-500' : isLow ? 'text-amber-600' : 'text-gray-900'}`}>{stock} units</p>
                                            {isOut && <span className="text-[9px] font-bold text-red-400 uppercase tracking-tighter">Out of Stock</span>}
                                            {isLow && <span className="text-[9px] font-bold text-amber-500 uppercase tracking-tighter">Reorder Soon</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-medium text-gray-600">{p.price}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => setAdjustModal({ open: true, product: p })}
                                                className="px-3 py-1 bg-white border border-gray-300 text-xs font-semibold text-gray-600 rounded hover:border-blue-600 hover:text-blue-600 transition-colors"
                                            >
                                                Adjust
                                            </button>
                                            <button
                                                onClick={() => openHistory(p)}
                                                className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                                                title="View History"
                                            >
                                                <History size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer Status Bar */}
            <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Live Cloud Sync Active
                </div>
                <div>Showing {filtered.length} items</div>
            </div>
        </div>
    );
}
