import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, User, Package,
    FileText, CheckCircle2, Save
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const empty_row = () => ({ _id: Date.now() + Math.random(), productId: '', name: '', price: '', qty: 1, unit: '' });

const EST_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];

export default function EditEstimatePage() {
    const { id } = useParams();
    const { companyId } = useAuth();
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [loadingData, setLoadingData] = useState(true);
    const [notFound, setNotFound] = useState(false);

    /* Customer fields */
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerAddress, setCustomerAddress] = useState('');

    /* Estimate fields */
    const [rows, setRows] = useState([empty_row()]);
    const [status, setStatus] = useState('Draft');
    const [discount, setDiscount] = useState('');
    const [taxPercent, setTaxPercent] = useState('');
    const [notes, setNotes] = useState('');
    const [estimateDate, setEstimateDate] = useState('');
    const [validUntil, setValidUntil] = useState('');

    const [saving, setSaving] = useState(false);
    const [savedOk, setSavedOk] = useState(false);

    /* Load estimate on mount */
    useEffect(() => {
        if (!companyId || !id) return;
        Promise.all([
            FirestoreService.getProducts(companyId),
            FirestoreService.getById('estimates', id),
        ]).then(([prods, est]) => {
            if (!est) { setNotFound(true); return; }
            setProducts(prods);

            setCustomerName(est.customerName || '');
            setCustomerPhone(est.customerPhone || '');
            setCustomerAddress(est.customerAddress || '');
            setStatus(est.status || 'Draft');
            setDiscount(est.discount != null ? String(est.discount) : '');
            setTaxPercent(est.tax != null ? String(est.tax) : '');
            setNotes(est.notes || '');
            setEstimateDate(est.estimateDate || '');
            setValidUntil(est.validUntil || '');

            if (est.products && est.products.length > 0) {
                setRows(est.products.map((p, i) => ({
                    _id: i + 1,
                    productId: '',
                    name: p.name || '',
                    price: String(p.price || ''),
                    qty: p.qty || 1,
                    unit: '',
                })));
            }
        }).catch(console.error)
            .finally(() => setLoadingData(false));
    }, [companyId, id]);

    const addRow = () => setRows(r => [...r, empty_row()]);
    const removeRow = (rid) => setRows(r => r.filter(row => row._id !== rid));

    const updateRow = (rid, field, value) => {
        setRows(prev => prev.map(row => {
            if (row._id !== rid) return row;
            if (field === 'productId') {
                const prod = products.find(p => p.id === value);
                return { ...row, productId: value, name: prod?.name || '', price: prod?.price || '', unit: prod?.unit || '' };
            }
            return { ...row, [field]: value };
        }));
    };

    const subtotal = rows.reduce((a, r) => a + (Number(r.price) * Number(r.qty || 1)), 0);
    const discountAmt = Math.min(Number(discount) || 0, subtotal);
    const taxAmt = ((subtotal - discountAmt) * (Number(taxPercent) || 0)) / 100;
    const total = subtotal - discountAmt + taxAmt;

    const validRows = rows.filter(r => r.name && Number(r.price) > 0);

    const handleSave = async (generatePDF = false) => {
        if (!customerName.trim()) { alert('Please enter a customer name.'); return; }
        if (validRows.length === 0) { alert('Please add at least one item.'); return; }

        setSaving(true);
        try {
            const data = {
                customerName,
                customerPhone,
                customerAddress,
                productName: validRows.map(r => r.name).join(', '),
                quantity: validRows.reduce((a, r) => a + Number(r.qty || 1), 0),
                amount: total,
                totalAmount: total,
                subtotal,
                discount: discountAmt,
                tax: taxAmt,
                status,
                estimateDate,
                validUntil,
                notes,
                products: validRows.map(r => ({
                    name: r.name,
                    price: Number(r.price),
                    qty: Number(r.qty || 1),
                    total: Number(r.price) * Number(r.qty || 1),
                })),
            };

            await FirestoreService.update('estimates', id, data);

            if (generatePDF) {
                generateInvoicePDF(
                    { id, totalAmount: total, products: data.products },
                    { name: customerName, address: customerAddress, phone: customerPhone }
                );
            }
            setSavedOk(true);
        } catch (e) {
            console.error(e);
            alert('Failed to update estimate: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (loadingData) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600" />
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
                <FileText size={40} strokeWidth={1} className="mb-4 opacity-40" />
                <p className="text-sm">Estimate not found.</p>
                <button onClick={() => navigate('/estimates')} className="mt-3 text-sm text-blue-600 hover:underline">
                    Back to Estimates
                </button>
            </div>
        );
    }

    if (savedOk) {
        return (
            <div className="max-w-xl mx-auto py-16 flex flex-col items-center text-center px-4">
                <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mb-5">
                    <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Estimate Updated</h1>
                <p className="text-sm text-gray-500 mb-6">
                    Estimate <span className="font-mono font-semibold text-gray-700">EST-{id.slice(-8).toUpperCase()}</span> has been saved successfully.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={() => navigate('/estimates')}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        View All Estimates
                    </button>
                    <button
                        onClick={() => setSavedOk(false)}
                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Continue Editing
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-5 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/estimates')} className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-gray-900">Edit Estimate</h1>
                        <p className="text-sm text-gray-500 font-mono">EST-{id.slice(-8).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {/* Customer */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <User size={15} className="text-blue-600" /> Customer
                        </h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Customer Name <span className="text-red-400">*</span></label>
                                    <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer name"
                                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 mb-1">Phone</label>
                                    <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="Phone number"
                                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1">Address</label>
                                <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="Customer address"
                                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Products */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Package size={15} className="text-blue-600" /> Products / Quotes
                            </h2>
                            <button onClick={addRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                                <Plus size={13} /> Add Product
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100">
                                        <th className="text-left pb-2 text-xs font-semibold text-gray-500 pr-3">Product</th>
                                        <th className="text-right pb-2 text-xs font-semibold text-gray-500 px-3" style={{ width: 100 }}>Price (₹)</th>
                                        <th className="text-center pb-2 text-xs font-semibold text-gray-500 px-3" style={{ width: 80 }}>Qty</th>
                                        <th className="text-right pb-2 text-xs font-semibold text-gray-500 px-3" style={{ width: 100 }}>Total</th>
                                        <th className="pb-2" style={{ width: 40 }}></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {rows.map((row) => (
                                        <tr key={row._id} className="group">
                                            <td className="py-2.5 pr-3">
                                                <input type="text" value={row.name}
                                                    onChange={e => updateRow(row._id, 'name', e.target.value)}
                                                    placeholder="Product / description"
                                                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <input type="number" value={row.price} onChange={e => updateRow(row._id, 'price', e.target.value)} className="block w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                            </td>
                                            <td className="py-2.5 px-3">
                                                <input type="number" value={row.qty} onChange={e => updateRow(row._id, 'qty', e.target.value)} className="block w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                            </td>
                                            <td className="py-2.5 px-3 text-right text-sm font-semibold text-gray-800">
                                                ₹{fmt(Number(row.price) * Number(row.qty || 1))}
                                            </td>
                                            <td className="py-2.5">
                                                <button onClick={() => removeRow(row._id)} disabled={rows.length === 1} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors disabled:opacity-20"><Trash2 size={14} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Dates & Status */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5 grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Estimate Date</label>
                            <input type="date" value={estimateDate} onChange={e => setEstimateDate(e.target.value)} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Valid Until</label>
                            <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400">
                                {EST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} placeholder="Optional notes or terms..."
                                className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none" />
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-6">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">Estimate Summary</h2>
                        <div className="space-y-2 border-b border-gray-100 pb-4 mb-4">
                            <div className="flex justify-between text-sm text-gray-500"><span>Subtotal</span><span>₹{fmt(subtotal)}</span></div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 whitespace-nowrap">Discount (₹)</label>
                                <input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm text-right outline-none focus:border-blue-400" />
                            </div>
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 whitespace-nowrap">Tax (%)</label>
                                <input type="number" value={taxPercent} onChange={e => setTaxPercent(e.target.value)} className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm text-right outline-none focus:border-blue-400" />
                            </div>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-2">
                            <span>Total</span>
                            <span className="text-blue-700">₹{fmt(total)}</span>
                        </div>

                        <div className="mt-6 space-y-2">
                            <button onClick={() => handleSave(false)} disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                <Save size={15} />
                                {saving ? 'Saving...' : 'Update Estimate'}
                            </button>
                            <button onClick={() => handleSave(true)} disabled={saving} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                Save & Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
