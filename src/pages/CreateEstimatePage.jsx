import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, User, Package,
    FileText, CheckCircle2, ChevronDown, UserPlus,
    ShoppingCart, X, Calendar, CreditCard, Banknote
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import { AutomationService } from '../utils/automation';
import { useCompanySettings, getCurrencySymbol, buildDocNumber } from '../hooks/useCompanySettings';

/* ── helpers ──────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');
const empty_row = () => ({ _id: Date.now() + Math.random(), productId: '', name: '', price: '', qty: 1, unit: '' });

const EST_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];

export default function CreateEstimatePage() {
    const { companyId } = useAuth();
    const navigate = useNavigate();
    const { settings, loading: settingsLoading } = useCompanySettings(companyId);

    /* Data */
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    /* Customer form */
    const [customerMode, setCustomerMode] = useState('select');
    const [selectedCustomerId, setSelectedCustomerId] = useState('');
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '' });

    /* Estimate fields */
    const [rows, setRows] = useState([empty_row()]);
    const [status, setStatus] = useState('Draft');
    const [validUntil, setValidUntil] = useState('');
    const [discount, setDiscount] = useState('');
    const [taxPercent, setTaxPercent] = useState('');
    const [notes, setNotes] = useState('');
    const [estimateDate, setEstimateDate] = useState(new Date().toISOString().slice(0, 10));

    /* UI state */
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(null);
    const [selectedTemplate, setSelectedTemplate] = useState('classic');

    /* ── Pre-fill from settings once loaded ─── */
    useEffect(() => {
        if (settingsLoading) return;
        if (settings.enableGST && settings.gstRate)
            setTaxPercent(String(settings.gstRate));
        if (settings.footerNote)
            setNotes(settings.footerNote);
        if (settings.defaultTemplate)
            setSelectedTemplate(settings.defaultTemplate);
        // Valid-until = today + paymentTerms days
        if (settings.paymentTerms && settings.paymentTerms !== 'Immediate' && settings.paymentTerms !== 'Custom') {
            const days = parseInt(settings.paymentTerms.replace('Net ', '')) || 30;
            const d = new Date();
            d.setDate(d.getDate() + days);
            setValidUntil(d.toISOString().slice(0, 10));
        }
    }, [settingsLoading]);


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
    const customerName = customerMode === 'select' ? (selectedCustomer?.name || '') : newCustomer.name;
    const customerPhone = customerMode === 'select' ? (selectedCustomer?.phone || '') : newCustomer.phone;
    const customerAddress = customerMode === 'select' ? (selectedCustomer?.address || '') : newCustomer.address;

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

    /* ── Save estimate ────────────────────────── */
    const handleSave = async (generatePDF = false) => {
        if (!customerName.trim()) { alert('Please select or enter a customer name.'); return; }
        if (validRows.length === 0) { alert('Please add at least one item.'); return; }

        setSaving(true);
        try {
            if (customerMode === 'new' && newCustomer.name) {
                const custRef = await FirestoreService.add('customers', newCustomer, companyId);
                AutomationService.trigger(companyId, 'customer.created', { id: custRef.id, ...newCustomer });
            }

            const estimateNumber = buildDocNumber(
                settings.estimatePrefix || 'EST-',
                settings.nextInvoiceSequence || 1001
            );
            const currencySymbol = getCurrencySymbol(settings.currency);

            const estimateData = {
                estimateNumber,
                estimatePrefix: settings.estimatePrefix || 'EST-',
                customerName,
                customerPhone,
                customerAddress,
                companyName: settings.name || '',
                companyAddress: settings.address || '',
                companyPhone: settings.phone || '',
                companyGSTIN: settings.taxId || '',
                currency: settings.currency || 'INR (₹)',
                currencySymbol,
                paymentTerms: settings.paymentTerms || '',
                enableGST: settings.enableGST || false,
                gstRate: settings.gstRate || 0,
                showHSN: settings.showHSN || false,
                footerNote: notes,
                productName: validRows.map(r => r.name).join(', '),
                quantity: validRows.reduce((a, r) => a + Number(r.qty || 1), 0),
                amount: total,
                totalAmount: total,
                subtotal,
                discount: discountAmt,
                tax: taxAmt,
                taxPercent: Number(taxPercent) || 0,
                status: status,
                validUntil,
                estimateDate,
                notes,
                products: validRows.map(r => ({
                    name: r.name,
                    price: Number(r.price),
                    qty: Number(r.qty || 1),
                    unit: r.unit || '',
                    total: Number(r.price) * Number(r.qty || 1),
                })),
            };

            const ref = await FirestoreService.add('estimates', estimateData, companyId);
            const created = { id: ref.id, ...estimateData };
            setSaved(created);

            // 3. Trigger Automation
            AutomationService.trigger(companyId, 'estimate.created', created);

            if (generatePDF) {
                const enriched = {
                    ...estimateData,
                    id: ref.id,
                    template: selectedTemplate
                };
                generateInvoicePDF(
                    enriched,
                    { name: customerName, address: customerAddress, phone: customerPhone },
                    selectedTemplate
                );
            }
        } catch (e) {
            alert('Failed to save estimate: ' + e.message);
        } finally {
            setSaving(false);
        }
    };

    if (saved) {
        const currSym = getCurrencySymbol(settings.currency);
        return (
            <div className="max-w-xl mx-auto py-16 flex flex-col items-center text-center px-4">
                <div className="h-16 w-16 bg-blue-50 rounded-full flex items-center justify-center mb-5">
                    <FileText size={32} className="text-blue-600" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 mb-2">Estimate Created Successfully</h1>
                <p className="text-sm text-gray-500 mb-1">Estimate Number: <span className="font-mono font-semibold text-gray-700">{saved.estimateNumber || `EST-${String(saved.id).slice(-8).toUpperCase()}`}</span></p>
                <p className="text-sm text-gray-500 mb-6">Customer: <strong>{saved.customerName}</strong> &middot; Total: <strong className="text-blue-700">₹{fmt(saved.totalAmount)}</strong></p>

                <div className="flex flex-wrap gap-3 justify-center">
                    <button
                        onClick={() => generateInvoicePDF(
                            { ...saved, template: selectedTemplate },
                            { name: saved.customerName, address: saved.customerAddress, phone: saved.customerPhone },
                            selectedTemplate
                        )}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                        <FileText size={15} /> Download Estimate PDF
                    </button>
                    <button
                        onClick={() => { setSaved(null); setRows([empty_row()]); setCustomerMode('select'); setSelectedCustomerId(''); setDiscount(''); setTaxPercent(''); setNotes(''); }}
                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        <Plus size={15} /> Create Another Estimate
                    </button>
                    <button onClick={() => navigate('/estimates')}
                        className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        View All Estimates
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
                        <h1 className="text-xl font-semibold text-gray-900">Create Estimate</h1>
                        <p className="text-sm text-gray-500">Provide an estimated quote to your customer</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    {/* Customer */}
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
                            <div className="relative">
                                <select value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}
                                    className="block w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 appearance-none bg-white pr-9">
                                    <option value="">Select a customer...</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <input type="text" value={newCustomer.name} onChange={e => setNewCustomer(p => ({ ...p, name: e.target.value }))} placeholder="Customer name" className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                    <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer(p => ({ ...p, phone: e.target.value }))} placeholder="Phone number" className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                                </div>
                                <input type="text" value={newCustomer.address} onChange={e => setNewCustomer(p => ({ ...p, address: e.target.value }))} placeholder="Customer address" className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
                            </div>
                        )}
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
                                                <select value={row.productId} onChange={e => updateRow(row._id, 'productId', e.target.value)}
                                                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 appearance-none bg-white pr-8">
                                                    <option value="">Select product...</option>
                                                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                                </select>
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
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                            <select value={status} onChange={e => setStatus(e.target.value)} className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400">
                                {EST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Sidebar Summary */}
                <div className="space-y-4">
                    {/* PDF Options */}
                    <div className="bg-white rounded-xl border border-gray-200 p-5">
                        <h2 className="text-sm font-semibold text-gray-900 mb-4">PDF Options</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Estimate Template</label>
                                <select
                                    value={selectedTemplate}
                                    onChange={e => setSelectedTemplate(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400"
                                >
                                    <option value="classic">Classic</option>
                                    <option value="modern">Modern</option>
                                    <option value="retail">Retail Receipt</option>
                                    <option value="minimal">Minimal</option>
                                    <option value="professional">Professional</option>
                                </select>
                            </div>
                            <button onClick={() => handleSave(true)} disabled={saving} className="w-full py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                                <FileText size={15} />
                                {saving ? 'Generating...' : 'Save & Download PDF'}
                            </button>
                            <button onClick={() => handleSave(false)} disabled={saving} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                {saving ? 'Saving...' : 'Save Estimate Only'}
                            </button>
                        </div>
                    </div>

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
                    </div>
                </div>
            </div>
        </div>
    );
}
