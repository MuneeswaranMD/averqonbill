import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Edit2, Trash2, Eye, X, RefreshCw,
    ShoppingCart, Clock, CheckCircle2, Truck, Package,
    User, Phone, FileText, CreditCard, ChevronRight,
    Download, Calendar
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import { AutomationService } from '../utils/automation';
import { useCompanySettings } from '../hooks/useCompanySettings';

/* ── Constants ─────────────────────────────────────── */
const ORDER_STATUSES = [
    'Pending',
    'Estimate Sent',
    'Customer Accepted',
    'Payment Received',
    'Invoice Generated',
    'Dispatched',
    'Completed',
    'Cancelled',
];

const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'];

const STATUS_STYLE = {
    'Pending': 'bg-amber-50 text-amber-700',
    'Estimate Sent': 'bg-blue-50 text-blue-700',
    'Customer Accepted': 'bg-indigo-50 text-indigo-700',
    'Payment Received': 'bg-green-50 text-green-700',
    'Invoice Generated': 'bg-teal-50 text-teal-700',
    'Dispatched': 'bg-purple-50 text-purple-700',
    'Completed': 'bg-gray-100 text-gray-600',
    'Cancelled': 'bg-red-50 text-red-600',
};

const PAYMENT_STYLE = {
    'Unpaid': 'text-red-600',
    'Partial': 'text-amber-600',
    'Paid': 'text-green-600',
};

const EMPTY_ORDER = {
    customerName: '', customerPhone: '', items: [{ name: '', qty: 1, price: 0, total: 0 }],
    totalAmount: 0, status: 'Pending',
    payment: 'Unpaid', notes: '', date: new Date().toISOString().slice(0, 10),
};

/* ── Create / Edit Modal ───────────────────────────── */
function OrderModal({ open, onClose, onSave, initial, products = [] }) {
    const [form, setForm] = useState(EMPTY_ORDER);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initial) {
            // Normalize items for editing
            const normalizedItems = initial.items && initial.items.length > 0
                ? initial.items.map(i => ({
                    name: i.name || i.productName || '',
                    qty: i.qty || i.quantity || 1,
                    price: i.price || (i.total / (i.qty || 1)) || 0,
                    total: i.total || 0
                }))
                : [{
                    name: initial.productName || '',
                    qty: initial.quantity || 1,
                    price: (initial.totalAmount / (initial.quantity || 1)) || 0,
                    total: initial.totalAmount || 0
                }];

            setForm({ ...EMPTY_ORDER, ...initial, items: normalizedItems });
        } else {
            setForm(EMPTY_ORDER);
        }
    }, [initial, open]);

    if (!open) return null;

    const calculateTotals = (items) => {
        return items.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
    };

    const updateItem = (index, field, value) => {
        const newItems = [...form.items];
        const item = { ...newItems[index], [field]: value };

        if (field === 'name') {
            const found = products.find(p => p.name === value);
            if (found) {
                item.price = found.price;
                item.total = Number(found.price) * (Number(item.qty) || 1);
            }
        }

        if (field === 'qty' || field === 'price') {
            item.total = (Number(item.qty) || 0) * (Number(item.price) || 0);
        }

        newItems[index] = item;
        setForm(f => ({ ...f, items: newItems, totalAmount: calculateTotals(newItems) }));
    };

    const addItem = () => {
        const newItems = [...form.items, { name: '', qty: 1, price: 0, total: 0 }];
        setForm(f => ({ ...f, items: newItems }));
    };

    const removeItem = (index) => {
        if (form.items.length <= 1) return;
        const newItems = form.items.filter((_, i) => i !== index);
        setForm(f => ({ ...f, items: newItems, totalAmount: calculateTotals(newItems) }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const summaryName = form.items.length > 1 ? `${form.items[0].name} +${form.items.length - 1} more` : form.items[0]?.name || '';
        await onSave({ ...form, productName: summaryName, totalAmount: Number(form.totalAmount) });
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">
                        {initial?.id ? 'Edit Order' : 'New Order'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Customer Name *</label>
                            <input type="text" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} required placeholder="Client Name"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                            <input type="tel" value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))} placeholder="+91 ..."
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order Items</h3>
                            <button type="button" onClick={addItem} className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                <Plus size={12} /> Add Item
                            </button>
                        </div>

                        <div className="space-y-2">
                            {form.items.map((item, idx) => (
                                <div key={idx} className="flex gap-2 items-start bg-gray-50/50 p-2 rounded-xl border border-gray-100">
                                    <div className="flex-1">
                                        <input type="text" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} required placeholder="Product Name" list="order-products"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 bg-white" />
                                    </div>
                                    <div className="w-20">
                                        <input type="number" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} required placeholder="Qty"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 bg-white" />
                                    </div>
                                    <div className="w-28">
                                        <input type="number" value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} required placeholder="Price"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 bg-white" />
                                    </div>
                                    <div className="w-20 pt-2 text-right">
                                        <p className="text-sm font-semibold text-gray-900">₹{item.total}</p>
                                    </div>
                                    {form.items.length > 1 && (
                                        <button type="button" onClick={() => removeItem(idx)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10">
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Payment</label>
                            <select value={form.payment} onChange={e => setForm(f => ({ ...f, payment: e.target.value }))}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10">
                                {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-left">
                            <p className="text-xs text-gray-400 uppercase font-bold">Total Amount</p>
                            <p className="text-xl font-bold text-blue-600">₹{(form.totalAmount || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={saving} className="px-8 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-500/20">
                                {saving ? 'Saving...' : 'Save Order'}
                            </button>
                        </div>
                    </div>

                    <datalist id="order-products">
                        {products.map(p => <option key={p.id} value={p.name}>{`₹${p.price} - ${p.sku || ''}`}</option>)}
                    </datalist>
                </form>
            </div>
        </div>
    );
}

/* ── Order Details Side Drawer ─────────────────────── */
function OrderDrawer({ order, onClose, onEdit, onDelete, onStatusChange, onPaymentChange }) {
    if (!order) return null;

    const timeline = ORDER_STATUSES.slice(0, -1); // exclude Cancelled from timeline
    const currentIdx = timeline.indexOf(order.status);

    return (
        <div className="fixed inset-0 z-50 flex" onClick={onClose}>
            {/* Overlay */}
            <div className="flex-1 bg-black/20 backdrop-blur-[2px]" />
            {/* Drawer */}
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-base font-semibold text-gray-900">Order Details</h2>
                            {order.source && (
                                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-600 text-[10px] font-bold rounded uppercase tracking-widest border border-indigo-100">
                                    {order.source}
                                </span>
                            )}
                        </div>
                        <p className="text-xs font-mono text-gray-400 mt-0.5">ORD-{order.id?.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => onEdit(order)}
                            className="px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                            <Edit2 size={12} /> Edit
                        </button>
                        <button onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    {/* Customer Info */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-gray-400 mb-2">Customer</p>
                        <div className="flex items-center gap-2">
                            <div className="h-9 w-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {order.customerName?.[0]?.toUpperCase() || 'C'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-900">{order.customerName || '—'}</p>
                                {order.customerPhone && (
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        <Phone size={10} /> {order.customerPhone}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 mb-3">Products</p>
                        <div className="space-y-3">
                            {order.items && order.items.length > 0 ? (
                                order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between pb-2 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-2">
                                            <Package size={14} className="text-gray-400 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm text-gray-900 font-medium line-clamp-1">{item.name}</p>
                                                {item.sku && <p className="text-[10px] text-gray-400 font-mono">{item.sku}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs text-gray-900 font-bold">₹{item.price?.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500">x{item.qty}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Package size={15} className="text-gray-400" />
                                        <span className="text-sm text-gray-900 font-medium">{order.productName || '—'}</span>
                                    </div>
                                    {order.quantity && (
                                        <span className="text-sm text-gray-500">x{order.quantity}</span>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-700">Total Amount</span>
                                <span className="text-lg font-bold text-gray-900">₹{Number(order.totalAmount || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Status & Payment */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 mb-2">Order Status</p>
                            <select value={order.status} onChange={e => onStatusChange(order.id, e.target.value)}
                                className={`text-xs font-semibold px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer w-full ${STATUS_STYLE[order.status] || STATUS_STYLE['Pending']}`}>
                                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 mb-2">Payment</p>
                            <select value={order.payment || 'Unpaid'} onChange={e => onPaymentChange(order.id, e.target.value)}
                                className={`text-xs font-bold px-2 py-1.5 rounded-lg border-0 outline-none cursor-pointer w-full ${PAYMENT_STYLE[order.payment] || PAYMENT_STYLE['Unpaid']}`}>
                                {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Order Timeline */}
                    <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-400 mb-4">Order Timeline</p>
                        <div className="space-y-3">
                            {timeline.map((step, idx) => {
                                const done = idx <= currentIdx;
                                const current = idx === currentIdx;
                                return (
                                    <div key={step} className="flex items-center gap-3">
                                        <div className={`h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold border-2 transition-colors ${done ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-200 text-gray-400'}`}>
                                            {done ? <CheckCircle2 size={11} /> : idx + 1}
                                        </div>
                                        <span className={`text-xs font-medium ${current ? 'text-blue-700 font-semibold' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                                            {step}
                                        </span>
                                        {current && (
                                            <span className="ml-auto px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-semibold rounded">Current</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div className="bg-gray-50 rounded-xl p-4">
                            <p className="text-xs font-semibold text-gray-400 mb-1">Notes</p>
                            <p className="text-sm text-gray-600">{order.notes}</p>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400">Quick Actions</p>
                        <button onClick={() => generateInvoicePDF(
                            order,
                            { name: order.customerName, address: order.customerAddress || '', phone: order.customerPhone || '' }
                        )} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2"><FileText size={14} className="text-blue-500" /> Generate Invoice</div>
                            <ChevronRight size={14} className="text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2"><CreditCard size={14} className="text-green-500" /> Send Payment Link</div>
                            <ChevronRight size={14} className="text-gray-400" />
                        </button>
                        <button onClick={() => { if (window.confirm('Mark this order as Dispatched?')) onStatusChange(order.id, 'Dispatched'); }} className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-2"><Truck size={14} className="text-purple-500" /> Dispatch Order</div>
                            <ChevronRight size={14} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 px-5 py-4">
                    <button onClick={() => { if (window.confirm('Delete this order?')) onDelete(order.id); }}
                        className="w-full px-4 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                        <Trash2 size={13} /> Delete Order
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Orders Page ──────────────────────────────── */
export default function OrdersPage() {
    const { companyId } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [modal, setModal] = useState({ open: false, item: null });
    const [drawer, setDrawer] = useState(null);
    const [deleting, setDeleting] = useState(null);

    useEffect(() => {
        if (companyId) {
            load();
            loadProducts();
        }
    }, [companyId]);

    const loadProducts = async () => {
        try {
            const fsProducts = await FirestoreService.getProducts(companyId);
            let beProducts = [];
            try {
                const resp = await fetch(`https://averqonbill-1.onrender.com/api/products/${companyId}`);
                if (resp.ok) beProducts = await resp.json();
            } catch (e) { }

            const normalizedBackend = beProducts.map(p => ({
                id: p._id,
                ...p,
                image: p.images?.[0] || '',
            }));

            setProducts([...fsProducts, ...normalizedBackend]);
        } catch (e) {
            console.error('Failed to load products for selection', e);
        }
    };

    const load = async () => {
        setLoading(true);
        try {
            const firestoreOrders = await FirestoreService.getOrders(companyId);
            let backendOrders = [];
            try {
                const resp = await fetch(`https://averqonbill-1.onrender.com/api/orders/${companyId}`);
                if (resp.ok) backendOrders = await resp.json();
            } catch (err) { console.warn('Backend orders failed to load', err); }

            // Normalize backend orders to match UI expectation if necessary
            const normalizedBackend = backendOrders.map(o => ({
                id: o._id,
                customerName: o.customerName || o.customer?.name,
                totalAmount: o.totalAmount || o.pricing?.total,
                status: o.status,
                payment: o.paymentStatus || o.payment?.status,
                date: o.createdAt,
                source: o.source,
                ...o
            }));

            // Combine and sort
            const combined = [...firestoreOrders, ...normalizedBackend].sort((a, b) =>
                new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
            );

            setOrders(combined);
        }
        catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSave = async (data) => {
        try {
            if (modal.item?.id) {
                await FirestoreService.update('orders', modal.item.id, data);
                setOrders(p => p.map(o => o.id === modal.item.id ? { ...o, ...data } : o));
                // Update drawer if open
                if (drawer?.id === modal.item.id) setDrawer(prev => ({ ...prev, ...data }));
            } else {
                const ref = await FirestoreService.add('orders', data, companyId);
                const newOrder = { id: ref.id, ...data, companyId };
                setOrders(p => [newOrder, ...p]);

                // 3. Trigger Automation
                AutomationService.trigger(companyId, 'order.created', newOrder);
            }
            setModal({ open: false, item: null });
        } catch (e) { alert('Error saving order: ' + e.message); }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        setDrawer(null);
        try {
            await FirestoreService.delete('orders', id);
            setOrders(p => p.filter(o => o.id !== id));
        } catch (e) { alert('Delete failed: ' + e.message); }
        finally { setDeleting(null); }
    };

    const handleStatusChange = async (id, status) => {
        try {
            await FirestoreService.update('orders', id, { status });

            const order = orders.find(o => o.id === id);
            if (order && order.platform) {
                try {
                    await fetch(`https://averqonbill-1.onrender.com/api/orders/${order._id || id}/update-status`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ status, companyId })
                    });
                } catch (err) {
                    console.error('Failed to sync status to platform:', err);
                }
            }

            setOrders(p => p.map(o => o.id === id ? { ...o, status } : o));
            if (drawer?.id === id) setDrawer(prev => ({ ...prev, status }));

            // Trigger Automation
            AutomationService.trigger(companyId, 'order.status_updated', { id, status });
        } catch (e) { console.error(e); }
    };

    const handlePaymentChange = async (id, payment) => {
        try {
            await FirestoreService.update('orders', id, { payment });
            setOrders(p => p.map(o => o.id === id ? { ...o, payment } : o));
            if (drawer?.id === id) setDrawer(prev => ({ ...prev, payment }));

            // 3. Trigger Automation
            if (payment === 'Paid') {
                AutomationService.trigger(companyId, 'payment.received', { id, type: 'order' });
            }
        } catch (e) { console.error(e); }
    };

    const filtered = orders.filter(o => {
        const matchSearch = !search ||
            o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            o.id.toLowerCase().includes(search.toLowerCase()) ||
            o.productName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || o.status === statusFilter;
        const matchPayment = paymentFilter === 'all' || o.payment === paymentFilter;
        return matchSearch && matchStatus && matchPayment;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        paid: orders.filter(o => o.payment === 'Paid').length,
        dispatched: orders.filter(o => o.status === 'Dispatched' || o.status === 'Completed').length,
    };

    const formatDate = (d) => {
        if (!d) return '—';
        if (d.toDate) return d.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        if (typeof d === 'string') return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        return '—';
    };

    return (
        <div className="space-y-5">
            {/* Modals */}
            <OrderModal open={modal.open} initial={modal.item} products={products}
                onClose={() => setModal({ open: false, item: null })}
                onSave={handleSave} />
            <OrderDrawer
                order={drawer}
                onClose={() => setDrawer(null)}
                onEdit={(o) => { setModal({ open: true, item: o }); setDrawer(null); }}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                onPaymentChange={handlePaymentChange}
            />

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: stats.total, icon: ShoppingCart, color: 'blue' },
                    { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber' },
                    { label: 'Paid', value: stats.paid, icon: CheckCircle2, color: 'green' },
                    { label: 'Dispatched', value: stats.dispatched, icon: Truck, color: 'purple' },
                ].map(({ label, value, icon: Icon, color }) => {
                    const colorMap = {
                        blue: 'bg-blue-50 text-blue-600',
                        amber: 'bg-amber-50 text-amber-700',
                        green: 'bg-green-50 text-green-600',
                        purple: 'bg-purple-50 text-purple-600',
                    };
                    const valColor = { blue: 'text-gray-900', amber: 'text-amber-700', green: 'text-green-600', purple: 'text-purple-600' };
                    return (
                        <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs text-gray-500">{label}</p>
                                <p className={`text-2xl font-bold mt-0.5 ${valColor[color]}`}>{value}</p>
                            </div>
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
                                <Icon size={17} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-xl border border-gray-200">
                {/* Toolbar */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-wrap gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                        {/* Search */}
                        <div className="relative w-56">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search orders..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50" />
                        </div>

                        {/* Status filter */}
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-600 bg-gray-50 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400">
                            <option value="all">All Status</option>
                            {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        {/* Payment filter */}
                        <select value={paymentFilter} onChange={e => setPaymentFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-600 bg-gray-50 focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400">
                            <option value="all">All Payments</option>
                            {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button onClick={() => navigate('/orders/create')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                            <Plus size={13} /> Create Order
                        </button>
                    </div>
                </div>

                {/* Table */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600"></div>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <ShoppingCart size={36} strokeWidth={1} className="mb-3 opacity-40" />
                        <p className="text-sm">{search ? 'No orders match your search' : 'No orders yet'}</p>
                        {!search && <button onClick={() => navigate('/orders/create')} className="mt-3 text-sm text-blue-600 hover:underline">Create your first order</button>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Order ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Items</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Payment</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(o => (
                                    <tr key={o.id} className="hover:bg-gray-50 transition-colors cursor-pointer"
                                        onClick={() => setDrawer(o)}>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col">
                                                <span className="font-mono text-[10px] text-gray-500 font-semibold tracking-tighter">
                                                    ORD-{o.id?.toString().slice(-8).toUpperCase()}
                                                </span>
                                                {o.source && (
                                                    <span className="text-[9px] font-black text-indigo-500 uppercase flex items-center gap-1 mt-0.5">
                                                        <span className="h-1 w-1 rounded-full bg-indigo-500" /> {o.source}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                                                    {o.customerName?.[0]?.toUpperCase() || 'C'}
                                                </div>
                                                <span className="font-medium text-gray-900">{o.customerName || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5 text-gray-600 text-xs">
                                            {o.items && o.items.length > 0 ? (
                                                <span title={o.items.map(i => i.name).join(', ')} className="truncate max-w-[120px] block">
                                                    {o.items[0].name}
                                                    {o.items.length > 1 && ` +${o.items.length - 1} more`}
                                                </span>
                                            ) : o.productName ? (
                                                <span title={o.productName} className="truncate max-w-[120px] block">
                                                    {o.quantity ? `${o.quantity}x ` : ''}{o.productName}
                                                </span>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3.5 font-semibold text-gray-900">
                                            ₹{Number(o.totalAmount || 0).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLE[o.status] || STATUS_STYLE['Pending']}`}>
                                                {o.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                                            <span className={`text-xs font-semibold ${PAYMENT_STYLE[o.payment] || PAYMENT_STYLE['Unpaid']}`}>
                                                {o.payment || 'Unpaid'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">
                                            {formatDate(o.date || o.createdAt)}
                                        </td>
                                        <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setDrawer(o)}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1">
                                                    <Eye size={12} /> View
                                                </button>
                                                <button onClick={() => setModal({ open: true, item: o })}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                                                    <Edit2 size={12} /> Edit
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
                    <p className="text-xs text-gray-400">{filtered.length} of {orders.length} orders</p>
                </div>
            </div>
        </div>
    );
}
