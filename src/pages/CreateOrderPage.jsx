import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, User, Package,
    FileText, CheckCircle2, ChevronDown, UserPlus,
    ShoppingCart, X
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import { AutomationService } from '../utils/automation';

/* ── helpers ──────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const empty_row = () => ({ _id: Date.now() + Math.random(), productId: '', name: '', price: '', qty: 1, unit: '' });

const ORDER_STATUSES = ['Pending', 'Estimate Sent', 'Customer Accepted', 'Payment Received', 'Dispatched', 'Completed'];
const PAYMENT_STATUSES = ['Unpaid', 'Partial', 'Paid'];

export default function CreateOrderPage() {
    const { companyId } = useAuth();
    const navigate = useNavigate();

    /* Data */
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    /* Customer form */
    const [customerMode, setCustomerMode] = useState('select'); // 'select' | 'new'
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

    /* Order fields */
    const [rows, setRows] = useState([empty_row()]);
    const [orderStatus, setOrderStatus] = useState('Pending');
    const [paymentStatus, setPaymentStatus] = useState('Unpaid');
    const [discount, setDiscount] = useState('');
    const [taxPercent, setTaxPercent] = useState('');
    const [notes, setNotes] = useState('');
    const [orderDate, setOrderDate] = useState(new Date().toISOString().slice(0, 10));

    /* UI state */
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(null); // holds created order

    /* ── Load customers + products ─────────── */
    useEffect(() => {
        if (!companyId) return;
        Promise.all([
            FirestoreService.getProducts(companyId),
            FirestoreService.getCustomers(companyId),
        ]).then(([prods, custs]) => {
            setProducts(prods);
            setCustomers(custs);
        }).catch(console.error)
            .finally(() => setLoadingData(false));
    }, [companyId]);

    /* ── Derived customer info ─────────────── */
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const customerName = customerMode === 'select'
        ? (selectedCustomer?.name || '')
        : newCustomer.name;
    const customerPhone = customerMode === 'select'
        ? (selectedCustomer?.phone || '')
        : newCustomer.phone;
    const customerAddress = customerMode === 'select'
        ? (selectedCustomer?.address || '')
        : newCustomer.address;

    /* ── Row helpers ───────────────────────── */
    const addRow = () => setRows(r => [...r, empty_row()]);
    const removeRow = (id) => setRows(r => r.filter(row => row._id !== id));

    const updateRow = (id, field, value) => {
        setRows(prev => prev.map(row => {
            if (row._id !== id) return row;
            if (field === 'productId') {
                const prod = products.find(p => p.id === value);
                return { ...row, productId: value, name: prod?.name || '', price: prod?.price || '', unit: prod?.unit || '' };
            }
            return { ...row, [field]: value };
        }));
    };

    /* ── Totals ─────────────────────────────── */
    const subtotal = rows.reduce((a, r) => a + (Number(r.price) * Number(r.qty || 1)), 0);
    const discountAmt = Math.min(Number(discount) || 0, subtotal);
    const taxAmt = ((subtotal - discountAmt) * (Number(taxPercent) || 0)) / 100;
    const total = subtotal - discountAmt + taxAmt;

    const validRows = rows.filter(r => r.name && Number(r.price) > 0);

    /* ── Save order ─────────────────────────── */
    const handleSave = async (generatePDF = false) => {
        if (!customerName.trim()) { alert('Please select or enter a customer name.'); return; }
        if (validRows.length === 0) { alert('Please add at least one product.'); return; }

        setSaving(true);
        try {
            // Optionally create new customer in Firestore
            if (customerMode === 'new' && newCustomer.name) {
                const custRef = await FirestoreService.add('customers', newCustomer, companyId);
                AutomationService.trigger(companyId, 'customer.created', { id: custRef.id, ...newCustomer });
            }

            const orderData = {
                customerName,
                customerPhone,
                customerAddress,
                productName: validRows.map(r => r.name).join(', '),
                quantity: validRows.reduce((a, r) => a + Number(r.qty || 1), 0),
                totalAmount: total,
                subtotal,
                discount: discountAmt,
                tax: taxAmt,
                status: orderStatus,
                payment: paymentStatus,
                date: orderDate,
                notes,
                products: validRows.map(r => ({
                    productId: r.productId || '',
                    name: r.name,
                    price: Number(r.price),
                    qty: Number(r.qty || 1),
                    total: Number(r.price) * Number(r.qty || 1),
                })),
            };

            const ref = await FirestoreService.add('orders', orderData, companyId);
            const createdOrder = { id: ref.id, ...orderData };
            setSaved(createdOrder);

            // ── Automated Stock Reduction ──
            await FirestoreService.reduceStock(validRows, companyId, `Order #${ref.id.slice(-6).toUpperCase()}`);

            // 3. Trigger Webhook
            AutomationService.trigger(companyId, 'order.created', createdOrder);

            if (generatePDF) {
                generateInvoicePDF(
                    { id: ref.id, totalAmount: total, products: createdOrder.products },
                    { name: customerName, address: customerAddress, phone: customerPhone }
                );
            }
        } catch (e) {
            alert('Failed to save order: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    /* ── Success Screen ─────────────────────── */
    if (saved) {
        return (
            <div className="max-w-xl mx-auto py-16 flex flex-col items-center text-center px-4">
                <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Order Created Successfully</h1>
                <p className="text-sm text-gray-500 mb-1">Order ID: <span className="font-mono font-semibold text-gray-700">ORD-{String(saved.id).slice(-8).toUpperCase()}</span></p>
                <p className="text-sm text-gray-500 mb-6">Customer: <strong>{saved.customerName}</strong> &middot; Total: <strong className="text-green-700">₹{fmt(saved.totalAmount)}</strong></p>

                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={() => generateInvoicePDF(
                            { id: saved.id, totalAmount: saved.totalAmount, products: saved.products },
                            { name: saved.customerName, address: saved.customerAddress || '', phone: saved.customerPhone || '' }
                        )}
                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <FileText size={15} /> Download Invoice PDF
                    </button>
                    <button
                        onClick={() => { setSaved(null); setRows([empty_row()]); setCustomerMode('select'); setSelectedCustomerId(''); setDiscount(''); setTaxPercent(''); setNotes(''); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={15} /> Create Another Order
                    </button>
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        View All Orders
                    </button>
                </div>
            </div>
        );
    }

    /* ── Main Form ──────────────────────────── */
    return (
        <div className="max-w-4xl mx-auto space-y-5 pb-10">

            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/orders')}
                        className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Create Order</h1>
                        <p className="text-sm text-gray-500">Add products and create a new customer order</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                    <ShoppingCart size={12} />
                    {validRows.length} item{validRows.length !== 1 ? 's' : ''} · ₹{fmt(total)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* LEFT: Main Form */}
                <div className="lg:col-span-2 space-y-5">

                    {/* ── Customer Section ───────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <User size={15} className="text-blue-600" /> Customer
                            </h2>
                            <div className="flex bg-gray-100 rounded-lg p-1 text-xs font-semibold gap-1">
                                <button onClick={() => setCustomerMode('select')}
                                    className={`px-3 py-1 rounded-md transition-colors ${customerMode === 'select' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    Select Existing
                                </button>
                                <button onClick={() => setCustomerMode('new')}
                                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${customerMode === 'new' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                                    <UserPlus size={11} /> Add New
                                </button>
                            </div>
                        </div>

                        {customerMode === 'select' ? (
                            <div>
                                <div className="relative">
                                    <select
                                        value={selectedCustomerId}
                                        onChange={e => setSelectedCustomerId(e.target.value)}
                                        className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 appearance-none bg-white pr-9"
                                    >
                                        <option value="">Select a customer...</option>
                                        <option value="_walkin">Walk-in Customer</option>
                                        {customers.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}{c.phone ? ` · ${c.phone}` : ''}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                {selectedCustomer && (
                                    <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                                        <p className="font-semibold text-gray-800">{selectedCustomer.name}</p>
                                        {selectedCustomer.phone && <p className="text-gray-500 text-xs">📞 {selectedCustomer.phone}</p>}
                                        {selectedCustomer.email && <p className="text-gray-500 text-xs">✉ {selectedCustomer.email}</p>}
                                        {selectedCustomer.address && <p className="text-gray-500 text-xs">📍 {selectedCustomer.address}</p>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Name <span className="text-red-400">*</span></label>
                                        <input type="text" value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))}
                                            placeholder="Customer name"
                                            className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                                        <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))}
                                            placeholder="+91 98765 43210"
                                            className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                                    <input type="text" value={newCustomer.address} onChange={e => setNewCustomer(p => ({ ...p, address: e.target.value }))}
                                        placeholder="Street, City"
                                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                </div>
                                <p className="text-[11px] text-gray-400">This customer will also be saved to your customer list.</p>
                            </div>
                        )}
                    </div>

                    {/* ── Products Section ───────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Package size={15} className="text-blue-600" /> Products
                            </h2>
                            <button onClick={addRow}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                                <Plus size={13} /> Add Product
                            </button>
                        </div>

                        {/* Product table */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left pb-2 text-xs font-semibold text-gray-500 pr-3" style={{ minWidth: 180 }}>Product</th>
                                        <th className="text-right pb-2 text-xs font-semibold text-gray-500 px-3" style={{ width: 100 }}>Price (₹)</th>
                                        <th className="text-center pb-2 text-xs font-semibold text-gray-500 px-3" style={{ width: 90 }}>Qty</th>
                                        <th className="text-right pb-2 text-xs font-semibold text-gray-500 px-3" style={{ width: 100 }}>Total</th>
                                        <th className="pb-2" style={{ width: 40 }}></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rows.map((row, idx) => (
                                        <tr key={row._id} className="group">
                                            {/* Product selector */}
                                            <td className="py-2.5 pr-3">
                                                <div className="relative">
                                                    <select
                                                        value={row.productId}
                                                        onChange={e => updateRow(row._id, 'productId', e.target.value)}
                                                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 appearance-none bg-white pr-8"
                                                    >
                                                        <option value="">Select product...</option>
                                                        {products.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name} — ₹{Number(p.price).toLocaleString()}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                </div>
                                                {/* Or type custom product name */}
                                                {!row.productId && (
                                                    <input type="text" value={row.name} onChange={e => updateRow(row._id, 'name', e.target.value)}
                                                        placeholder="Or type product name..."
                                                        className="mt-1.5 block w-full px-3 py-1.5 border border-dashed border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 text-gray-600" />
                                                )}
                                            </td>

                                            {/* Price */}
                                            <td className="py-2.5 px-3">
                                                <input
                                                    type="number" min="0"
                                                    value={row.price}
                                                    onChange={e => updateRow(row._id, 'price', e.target.value)}
                                                    className="block w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400"
                                                    placeholder="0"
                                                />
                                            </td>

                                            {/* Qty */}
                                            <td className="py-2.5 px-3">
                                                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                                                    <button onClick={() => updateRow(row._id, 'qty', Math.max(1, Number(row.qty) - 1))}
                                                        className="px-2 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors text-xs">
                                                        −
                                                    </button>
                                                    <input type="number" min="1" value={row.qty}
                                                        onChange={e => updateRow(row._id, 'qty', Math.max(1, Number(e.target.value)))}
                                                        className="flex-1 py-2 text-sm text-center outline-none w-0 min-w-[32px] bg-white" />
                                                    <button onClick={() => updateRow(row._id, 'qty', Number(row.qty) + 1)}
                                                        className="px-2 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-colors text-xs">
                                                        +
                                                    </button>
                                                </div>
                                            </td>

                                            {/* Line total */}
                                            <td className="py-2.5 px-3 text-right text-sm font-semibold text-gray-800">
                                                ₹{fmt(Number(row.price) * Number(row.qty || 1))}
                                            </td>

                                            {/* Remove */}
                                            <td className="py-2.5">
                                                <button onClick={() => removeRow(row._id)} disabled={rows.length === 1}
                                                    className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-20">
                                                    <Trash2 size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button onClick={addRow}
                            className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 border border-dashed border-gray-200 rounded-lg text-xs text-gray-400 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-colors">
                            <Plus size={12} /> Add another product
                        </button>
                    </div>

                    {/* ── Order Details ───────────────────── */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Order Date</label>
                                <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Order Status</label>
                                <select value={orderStatus} onChange={e => setOrderStatus(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400">
                                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Status</label>
                                <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400">
                                    {PAYMENT_STATUSES.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes (optional)</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
                                placeholder="Delivery instructions, special requests, etc."
                                className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none" />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Summary + Actions */}
                <div className="space-y-4">

                    {/* Order Summary */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Order Summary</h2>

                        {/* Product mini-list */}
                        {validRows.length > 0 && (
                            <div className="space-y-2 mb-4">
                                {validRows.map(r => (
                                    <div key={r._id} className="flex items-center justify-between text-xs">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-700 truncate">{r.name}</p>
                                            <p className="text-gray-400">₹{Number(r.price).toLocaleString()} × {r.qty}</p>
                                        </div>
                                        <span className="font-semibold text-gray-800 ml-2">₹{fmt(Number(r.price) * Number(r.qty || 1))}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {validRows.length > 0 && <div className="border-t border-gray-100 pt-4 space-y-3" />}

                        {/* Discount */}
                        <div className="flex items-center gap-2 mb-3">
                            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap flex-shrink-0">Discount (₹)</label>
                            <input type="number" min="0" value={discount} onChange={e => setDiscount(e.target.value)}
                                placeholder="0"
                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 w-0" />
                        </div>

                        {/* Tax */}
                        <div className="flex items-center gap-2 mb-4">
                            <label className="text-xs font-semibold text-gray-500 whitespace-nowrap flex-shrink-0">Tax (%)</label>
                            <input type="number" min="0" max="100" value={taxPercent} onChange={e => setTaxPercent(e.target.value)}
                                placeholder="0"
                                className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 w-0" />
                        </div>

                        {/* Totals */}
                        <div className="space-y-2 border-t border-gray-100 pt-4">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{fmt(subtotal)}</span>
                            </div>
                            {discountAmt > 0 && (
                                <div className="flex justify-between text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>- ₹{fmt(discountAmt)}</span>
                                </div>
                            )}
                            {taxAmt > 0 && (
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>Tax ({taxPercent}%)</span>
                                    <span>+ ₹{fmt(taxAmt)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
                                <span>Total</span>
                                <span className="text-blue-700">₹{fmt(total)}</span>
                            </div>
                        </div>

                        {/* Customer info preview */}
                        {customerName && (
                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs font-semibold text-gray-400 mb-1">Bill To</p>
                                <p className="text-sm font-medium text-gray-800">{customerName}</p>
                                {customerPhone && <p className="text-xs text-gray-500">{customerPhone}</p>}
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className="mt-5 space-y-2">
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                            >
                                <CheckCircle2 size={15} />
                                {saving ? 'Creating...' : 'Create Order'}
                            </button>

                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
                            >
                                <FileText size={14} /> Create & Download Invoice
                            </button>

                            <button
                                onClick={() => navigate('/orders')}
                                className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={13} /> Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
