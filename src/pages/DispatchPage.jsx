import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Plus, Search, Edit2, Trash2, Truck,
    Package, CheckCircle2, X, Save, ChevronDown, User,
    ClipboardList, RefreshCw, Link2, Copy, ExternalLink,
    MessageCircle, Send, QrCode, Eye
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useCompanySettings, buildDocNumber } from '../hooks/useCompanySettings';
import { AutomationService } from '../utils/automation';

/* ── Courier catalog with tracking URL builders ─────────── */
export const COURIERS = [
    { name: 'DTDC', trackUrl: (n) => `https://www.dtdc.in/tracking/${n}`, color: '#E87722', bg: '#FFF5EC' },
    { name: 'Delhivery', trackUrl: (n) => `https://www.delhivery.com/track/package/${n}`, color: '#D9232D', bg: '#FEF2F2' },
    { name: 'BlueDart', trackUrl: (n) => `https://www.bluedart.com/tracking/${n}`, color: '#00549F', bg: '#EFF6FF' },
    { name: 'India Post', trackUrl: (n) => `https://www.indiapost.gov.in/VAS/Pages/IndiaPOSTHome.aspx?q=${n}`, color: '#15803D', bg: '#F0FDF4' },
    { name: 'DHL', trackUrl: (n) => `https://www.dhl.com/in-en/home/tracking.html?tracking-id=${n}`, color: '#FFCC00', bg: '#FEFCE8' },
    { name: 'FedEx', trackUrl: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`, color: '#4D148C', bg: '#F5F3FF' },
    { name: 'Ekart', trackUrl: (n) => `https://ekartlogistics.com/track/${n}`, color: '#2563EB', bg: '#EFF6FF' },
    { name: 'Xpressbees', trackUrl: (n) => `https://www.xpressbees.com/shipment/tracking?awb=${n}`, color: '#0891B2', bg: '#ECFEFF' },
    { name: 'Shadowfax', trackUrl: (n) => `https://tracker.shadowfax.in/${n}`, color: '#7C3AED', bg: '#F5F3FF' },
    { name: 'Professional Couriers', trackUrl: (n) => `https://www.tpcindia.com/tracking/${n}`, color: '#374151', bg: '#F9FAFB' },
    { name: 'Shiprocket', trackUrl: (n) => `https://shiprocket.co/tracking/${n}`, color: '#EA580C', bg: '#FFF7ED' },
    { name: 'Other', trackUrl: (n) => null, color: '#6B7280', bg: '#F9FAFB' },
];

export const getTrackingUrl = (courierName, trackingNumber) => {
    if (!courierName || !trackingNumber) return null;
    const courier = COURIERS.find(c => c.name === courierName);
    return courier?.trackUrl(trackingNumber) || null;
};

const DISPATCH_STATUSES = ['Pending', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Returned'];
const STATUS_STYLES = {
    'Pending': 'bg-amber-50 text-amber-700',
    'Packed': 'bg-yellow-50 text-yellow-700',
    'Shipped': 'bg-blue-50 text-blue-700',
    'In Transit': 'bg-purple-50 text-purple-700',
    'Out for Delivery': 'bg-indigo-50 text-indigo-700',
    'Delivered': 'bg-green-50 text-green-700',
    'Returned': 'bg-red-50 text-red-600',
};

const EMPTY = {
    orderId: '', orderRef: '', customerName: '', customerPhone: '',
    courierName: '', trackingNumber: '', dispatchDate: '', status: 'Pending', notes: ''
};

/* ── Searchable ComboBox ────────────────────────────────── */
function ComboBox({ label, value, onChange, options, placeholder, icon: Icon, required = false, renderOption, getLabel }) {
    const [open, setOpen] = useState(false);
    const [qry, setQry] = useState('');
    const boxRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const filtered = options.filter(o => (getLabel(o) || '').toLowerCase().includes(qry.toLowerCase()));

    const handleSelect = (opt) => { onChange(opt); setQry(''); setOpen(false); };
    const handleClear = (e) => { e.stopPropagation(); onChange(null); setQry(''); };

    return (
        <div ref={boxRef} className="relative">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
                {Icon && <Icon size={11} className="inline mr-1 text-blue-500" />}
                {label}{required && <span className="text-red-400 ml-0.5">*</span>}
            </label>
            <div onClick={() => setOpen(o => !o)}
                className={`flex items-center w-full px-3 py-2 border rounded-lg text-sm cursor-pointer select-none bg-white transition-colors ${open ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'}`}>
                <span className={`flex-1 truncate ${value ? 'text-gray-900' : 'text-gray-400'}`}>{value || placeholder}</span>
                {value
                    ? <button type="button" onClick={handleClear} className="ml-1 p-0.5 text-gray-300 hover:text-gray-500 rounded"><X size={12} /></button>
                    : <ChevronDown size={13} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />}
            </div>
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                        <div className="flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg">
                            <Search size={12} className="text-gray-400 flex-shrink-0" />
                            <input autoFocus type="text" value={qry} onChange={e => setQry(e.target.value)}
                                placeholder={`Search ${label.toLowerCase()}...`}
                                className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
                                onClick={e => e.stopPropagation()} />
                        </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {filtered.length === 0
                            ? <div className="py-4 text-center text-xs text-gray-400">No results found</div>
                            : filtered.map((opt, i) => (
                                <button key={i} type="button" onClick={() => handleSelect(opt)}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors">
                                    {renderOption ? renderOption(opt) : getLabel(opt)}
                                </button>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Tracking Link Card (inside form) ───────────────────── */
function TrackingLinkCard({ courierName, trackingNumber, customerName, customerPhone, orderRef }) {
    const [copied, setCopied] = useState(false);
    const trackUrl = getTrackingUrl(courierName, trackingNumber);
    if (!trackUrl) return null;

    const copy = () => {
        navigator.clipboard.writeText(trackUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    };

    const whatsappMsg = encodeURIComponent(
        `Hello ${customerName || 'Customer'},\n\nYour order has been dispatched! 🚚\n\nCourier: ${courierName}\nTracking No: ${trackingNumber}${orderRef ? `\nOrder Ref: ${orderRef}` : ''}\n\nTrack your order here:\n${trackUrl}\n\nThank you for your order!`
    );
    const whatsappUrl = customerPhone
        ? `https://wa.me/91${customerPhone.replace(/\D/g, '')}?text=${whatsappMsg}`
        : `https://wa.me/?text=${whatsappMsg}`;

    return (
        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Link2 size={14} className="text-blue-600" />
                <p className="text-xs font-semibold text-blue-700">Tracking Link Generated</p>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg border border-blue-100 px-3 py-2 mb-3">
                <span className="flex-1 text-xs text-gray-600 font-mono truncate">{trackUrl}</span>
                <button type="button" onClick={copy}
                    className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md transition-colors ${copied ? 'text-green-600 bg-green-50' : 'text-blue-600 hover:bg-blue-50'}`}>
                    <Copy size={11} /> {copied ? 'Copied!' : 'Copy'}
                </button>
                <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-md text-gray-600 hover:bg-gray-100 transition-colors">
                    <ExternalLink size={11} /> Open
                </a>
            </div>
            <div className="flex flex-wrap gap-2">
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
                    <MessageCircle size={13} /> Send via WhatsApp
                </a>
                <button type="button" onClick={copy}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors">
                    <Copy size={13} /> Copy Link
                </button>
            </div>
        </div>
    );
}

/* ── Inline Form Panel ──────────────────────────────────── */
function DispatchForm({ initial, onSave, onCancel, customers, orders }) {
    const [form, setForm] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
    const [saving, setSaving] = useState(false);

    const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

    const handleSelectCustomer = (cust) => {
        if (!cust) setForm(p => ({ ...p, customerName: '', customerPhone: '' }));
        else setForm(p => ({ ...p, customerName: cust.name || '', customerPhone: cust.phone || '' }));
    };

    const handleSelectOrder = (order) => {
        if (!order) setForm(p => ({ ...p, orderId: '', orderRef: '' }));
        else setForm(p => ({
            ...p,
            orderId: order.id || '',
            orderRef: order.orderNumber || `ORD-${order.id?.slice(-8).toUpperCase()}`,
            customerName: p.customerName || order.customerName || '',
            customerPhone: p.customerPhone || order.customerPhone || '',
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trackUrl = getTrackingUrl(form.courierName, form.trackingNumber);
        setSaving(true);
        await onSave({ ...form, trackingUrl: trackUrl || '' });
        setSaving(false);
    };

    const inputCls = "block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-white";
    const selectedCustomerLabel = form.customerName || '';
    const selectedOrderLabel = form.orderRef || (form.orderId ? `ORD-${form.orderId.slice(-8).toUpperCase()}` : '');
    const selectedCourier = COURIERS.find(c => c.name === form.courierName);

    return (
        <div className="bg-white rounded-xl border border-blue-200 shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <Truck size={15} className="text-blue-600" />
                    {initial?.id ? 'Edit Dispatch' : 'Add New Dispatch'}
                </h2>
                <button type="button" onClick={onCancel}
                    className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Order ID */}
                    <ComboBox label="Order ID" icon={ClipboardList}
                        value={selectedOrderLabel} placeholder="Select order..."
                        options={orders} getLabel={(o) => o.orderNumber || `ORD-${o.id?.slice(-8).toUpperCase()}`}
                        renderOption={(o) => (
                            <div>
                                <p className="font-semibold text-gray-800 text-xs">{o.orderNumber || `ORD-${o.id?.slice(-8).toUpperCase()}`}</p>
                                {o.customerName && <p className="text-xs text-gray-400 mt-0.5">{o.customerName}</p>}
                            </div>
                        )}
                        onChange={handleSelectOrder} />

                    {/* Customer */}
                    <ComboBox label="Customer Name" icon={User} required
                        value={selectedCustomerLabel} placeholder="Select customer..."
                        options={customers} getLabel={(c) => c.name || ''}
                        renderOption={(c) => (
                            <div>
                                <p className="font-semibold text-gray-800 text-xs">{c.name}</p>
                                {c.phone && <p className="text-xs text-gray-400 mt-0.5">{c.phone}</p>}
                            </div>
                        )}
                        onChange={handleSelectCustomer} />

                    {/* Phone */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Customer Phone</label>
                        <input type="tel" value={form.customerPhone} onChange={set('customerPhone')}
                            placeholder="Auto-filled or enter manually" className={inputCls} />
                    </div>

                    {/* Courier dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">
                            Courier / Carrier<span className="text-red-400 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                            <select value={form.courierName} onChange={set('courierName')} required
                                className={`${inputCls} pr-8 appearance-none`}
                                style={selectedCourier ? { borderColor: selectedCourier.color + '55', color: selectedCourier.color } : {}}>
                                <option value="">Select courier...</option>
                                {COURIERS.map(c => (
                                    <option key={c.name} value={c.name}>{c.name}</option>
                                ))}
                            </select>
                            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Tracking Number */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Tracking Number</label>
                        <input type="text" value={form.trackingNumber} onChange={set('trackingNumber')}
                            placeholder="e.g. DT123456789IN" className={inputCls} />
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Dispatch Date</label>
                        <input type="date" value={form.dispatchDate} onChange={set('dispatchDate')} className={inputCls} />
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                        <select value={form.status} onChange={set('status')} className={inputCls}>
                            {DISPATCH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>

                {/* Notes */}
                <div className="mt-4">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                    <textarea value={form.notes} onChange={set('notes')} rows={2}
                        placeholder="e.g. Fragile, handle with care..."
                        className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none" />
                </div>

                {/* Auto-generated tracking link */}
                <TrackingLinkCard
                    courierName={form.courierName}
                    trackingNumber={form.trackingNumber}
                    customerName={form.customerName}
                    customerPhone={form.customerPhone}
                    orderRef={form.orderRef}
                />

                <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={onCancel}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={saving}
                        className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60">
                        <Save size={14} />
                        {saving ? 'Saving...' : (initial?.id ? 'Update Dispatch' : 'Add Dispatch')}
                    </button>
                </div>
            </form>
        </div>
    );
}

/* ── Tracking Quick-view row popup ──────────────────────── */
function TrackingPopup({ dispatch: d, onClose }) {
    const [copied, setCopied] = useState(false);
    const trackUrl = d.trackingUrl || getTrackingUrl(d.courierName, d.trackingNumber);

    const copy = () => {
        if (!trackUrl) return;
        navigator.clipboard.writeText(trackUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
    };

    const whatsappMsg = encodeURIComponent(
        `Hello ${d.customerName || 'Customer'},\n\nYour order has been dispatched! 🚚\n\nCourier: ${d.courierName}\nTracking No: ${d.trackingNumber}${d.orderRef ? `\nOrder Ref: ${d.orderRef}` : ''}\n\nTrack your order here:\n${trackUrl}\n\nThank you for your order!`
    );
    const whatsappUrl = d.customerPhone
        ? `https://wa.me/91${d.customerPhone.replace(/\D/g, '')}?text=${whatsappMsg}`
        : `https://wa.me/?text=${whatsappMsg}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Tracking Details</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{d.customerName} · {d.courierName}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"><X size={16} /></button>
                </div>
                <div className="p-5 space-y-4">
                    {/* Courier badge */}
                    {(() => {
                        const courier = COURIERS.find(c => c.name === d.courierName);
                        return (
                            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: courier?.bg || '#F9FAFB' }}>
                                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm border border-white/50">
                                    <Truck size={18} style={{ color: courier?.color || '#6B7280' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold" style={{ color: courier?.color || '#374151' }}>{d.courierName}</p>
                                    <p className="text-xs text-gray-500 font-mono">{d.trackingNumber}</p>
                                </div>
                                <span className={`ml-auto text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[d.status] || STATUS_STYLES['Pending']}`}>
                                    {d.status}
                                </span>
                            </div>
                        );
                    })()}

                    {/* Info rows */}
                    <div className="space-y-2 text-sm">
                        {d.orderRef && <div className="flex justify-between"><span className="text-gray-400">Order Ref</span><span className="font-mono font-semibold text-gray-700">{d.orderRef}</span></div>}
                        {d.customerName && <div className="flex justify-between"><span className="text-gray-400">Customer</span><span className="font-medium text-gray-800">{d.customerName}</span></div>}
                        {d.customerPhone && <div className="flex justify-between"><span className="text-gray-400">Phone</span><span className="text-gray-700">{d.customerPhone}</span></div>}
                        {d.dispatchDate && <div className="flex justify-between"><span className="text-gray-400">Dispatch Date</span><span className="text-gray-700">{d.dispatchDate}</span></div>}
                    </div>

                    {/* Tracking link */}
                    {trackUrl ? (
                        <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                            <p className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Link2 size={11} /> Tracking Link</p>
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 px-3 py-2">
                                <span className="flex-1 text-xs text-gray-600 font-mono truncate">{trackUrl}</span>
                                <button onClick={copy}
                                    className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors ${copied ? 'text-green-600 bg-green-50' : 'text-blue-600 hover:bg-blue-50'}`}>
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                                    <ExternalLink size={12} /> Open Tracking
                                </a>
                                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition-colors">
                                    <MessageCircle size={12} /> Send WhatsApp
                                </a>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-400">
                            No tracking link available. Add a courier and tracking number to generate one.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── Main Page ──────────────────────────────────────────── */
export default function DispatchPage() {
    const { companyId } = useAuth();
    const { settings } = useCompanySettings(companyId);
    const [dispatches, setDispatches] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [liveConnected, setLiveConnected] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [formItem, setFormItem] = useState(null);
    const [deleting, setDeleting] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);
    const [trackingPopup, setTrackingPopup] = useState(null);

    const unsubRef = useRef(null);

    /* Load customers + orders */
    useEffect(() => {
        if (!companyId) return;
        Promise.all([
            FirestoreService.getCustomers(companyId),
            FirestoreService.getOrders(companyId),
        ]).then(([custs, ords]) => {
            setCustomers(custs);
            setOrders(ords);
        }).catch(console.error);
    }, [companyId]);

    /* Real-time listener */
    const attachListener = useCallback(() => {
        if (!companyId) return;
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
        setLoading(true); setLiveConnected(false); setError(null);

        const q = query(
            collection(db, 'dispatches'),
            where('companyId', '==', companyId),
            orderBy('createdAt', 'desc')
        );
        const unsub = onSnapshot(q,
            (snap) => {
                setDispatches(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                setLoading(false); setRefreshing(false); setLiveConnected(true);
                setError(null); setLastUpdated(new Date());
            },
            (err) => {
                console.error(err); setError(err.message);
                setLoading(false); setRefreshing(false); setLiveConnected(false);
            }
        );
        unsubRef.current = unsub;
    }, [companyId]);

    useEffect(() => { attachListener(); return () => { if (unsubRef.current) unsubRef.current(); }; }, [attachListener]);

    const handleManualRefresh = () => { setRefreshing(true); attachListener(); };

    /* CRUD */
    const handleSave = async (data) => {
        try {
            const dispatchNumber = buildDocNumber(
                settings.dispatchPrefix || 'DSP-',
                dispatches.length + 1
            );
            const enriched = {
                ...data,
                dispatchNumber,
                companyName: settings.name || '',
            };
            if (formItem?.id) {
                await FirestoreService.update('dispatches', formItem.id, enriched);
                AutomationService.trigger(companyId, 'dispatch.updated', { id: formItem.id, ...enriched });
            } else {
                const ref = await FirestoreService.add('dispatches', enriched, companyId);
                AutomationService.trigger(companyId, 'dispatch.created', { id: ref.id, ...enriched });
            }
            setFormItem(null);
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try { await FirestoreService.delete('dispatches', id); }
        catch (e) { console.error(e); }
        finally { setDeleting(null); setConfirmDelete(null); }
    };

    const updateStatus = async (id, status) => {
        try {
            await FirestoreService.update('dispatches', id, { status });
            AutomationService.trigger(companyId, 'dispatch.updated', { id, status });
        }
        catch (e) { console.error(e); }
    };

    /* Derived */
    const filtered = dispatches.filter(d =>
        d.customerName?.toLowerCase().includes(search.toLowerCase()) ||
        d.courierName?.toLowerCase().includes(search.toLowerCase()) ||
        d.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
        (d.orderRef || '').toLowerCase().includes(search.toLowerCase())
    );

    const stats = {
        total: dispatches.length,
        inTransit: dispatches.filter(d => ['Shipped', 'In Transit', 'Out for Delivery'].includes(d.status)).length,
        delivered: dispatches.filter(d => d.status === 'Delivered').length,
    };

    const fmtTime = (date) => date?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) || '';

    return (
        <div className="space-y-5">
            {/* Tracking popup */}
            {trackingPopup && <TrackingPopup dispatch={trackingPopup} onClose={() => setTrackingPopup(null)} />}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div><p className="text-xs text-gray-500">Total Shipments</p><p className="text-2xl font-bold text-gray-900 mt-0.5">{stats.total}</p></div>
                    <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Truck size={17} /></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div><p className="text-xs text-gray-500">In Transit</p><p className="text-2xl font-bold text-purple-600 mt-0.5">{stats.inTransit}</p></div>
                    <div className="h-9 w-9 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center"><Package size={17} /></div>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div><p className="text-xs text-gray-500">Delivered</p><p className="text-2xl font-bold text-green-600 mt-0.5">{stats.delivered}</p></div>
                    <div className="h-9 w-9 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><CheckCircle2 size={17} /></div>
                </div>
            </div>

            {/* Inline form */}
            {formItem !== null && (
                <DispatchForm
                    initial={formItem?.id ? formItem : null}
                    onSave={handleSave}
                    onCancel={() => setFormItem(null)}
                    customers={customers}
                    orders={orders}
                />
            )}

            {/* Delete confirmation */}
            {confirmDelete && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center justify-between">
                    <p className="text-sm text-red-700 font-medium">
                        Delete dispatch for <span className="font-semibold">{dispatches.find(d => d.id === confirmDelete)?.customerName || 'this record'}</span>?
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(null)}
                            className="px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">Cancel</button>
                        <button onClick={() => handleDelete(confirmDelete)} disabled={deleting === confirmDelete}
                            className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
                            {deleting === confirmDelete ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-wrap gap-3">
                    <div className="relative w-72">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search customer, courier, tracking..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50" />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleManualRefresh} disabled={refreshing || loading}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
                            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Refreshing...' : 'Refresh'}
                        </button>
                        <button onClick={() => { setFormItem({}); setConfirmDelete(null); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                            <Plus size={13} /> Add Dispatch
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600" />
                        <p className="text-xs text-gray-400">Loading dispatch records...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-sm text-red-400 mb-2">{error}</p>
                        <button onClick={handleManualRefresh} className="text-sm text-blue-600 hover:underline">Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Truck size={36} strokeWidth={1} className="mb-3 opacity-40" />
                        <p className="text-sm">{search ? 'No dispatches match your search' : 'No dispatch records yet'}</p>
                        {!search && <button onClick={() => setFormItem({})} className="mt-3 text-sm text-blue-600 hover:underline">Add your first dispatch</button>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Order / Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Courier</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Tracking</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Date</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(d => {
                                    const trackUrl = d.trackingUrl || getTrackingUrl(d.courierName, d.trackingNumber);
                                    const courier = COURIERS.find(c => c.name === d.courierName);
                                    return (
                                        <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3.5">
                                                <p className="text-sm font-semibold text-gray-900">{d.customerName || '—'}</p>
                                                {d.orderRef && (
                                                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded mt-0.5 inline-block">
                                                        {d.orderRef}
                                                    </span>
                                                )}
                                                {d.customerPhone && <p className="text-xs text-gray-400">{d.customerPhone}</p>}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                {d.courierName ? (
                                                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg"
                                                        style={{ background: courier?.bg || '#F9FAFB', color: courier?.color || '#374151' }}>
                                                        <Truck size={10} />
                                                        {d.courierName}
                                                    </span>
                                                ) : '—'}
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono text-gray-600">{d.trackingNumber || '—'}</span>
                                                    {trackUrl && (
                                                        <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                                                            className="p-1 rounded text-blue-500 hover:bg-blue-50 transition-colors" title="Open tracking page">
                                                            <ExternalLink size={11} />
                                                        </a>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5 text-sm text-gray-500">{d.dispatchDate || '—'}</td>
                                            <td className="px-4 py-3.5">
                                                <select value={d.status || 'Pending'} onChange={e => updateStatus(d.id, e.target.value)}
                                                    className={`text-xs font-medium px-2 py-1 rounded-md border-0 outline-none cursor-pointer ${STATUS_STYLES[d.status] || STATUS_STYLES['Pending']}`}>
                                                    {DISPATCH_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                </select>
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <div className="flex items-center justify-end gap-1">
                                                    {/* Track button */}
                                                    <button onClick={() => setTrackingPopup(d)}
                                                        className="px-2.5 py-1.5 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg flex items-center gap-1 transition-colors"
                                                        title="View tracking info">
                                                        <Eye size={12} /> Track
                                                    </button>
                                                    {/* WhatsApp */}
                                                    {trackUrl && d.customerPhone && (() => {
                                                        const msg = encodeURIComponent(`Hello ${d.customerName || 'Customer'},\n\nYour order has been dispatched! 🚚\n\nCourier: ${d.courierName}\nTracking No: ${d.trackingNumber}\n\nTrack here:\n${trackUrl}`);
                                                        return (
                                                            <a href={`https://wa.me/91${d.customerPhone.replace(/\D/g, '')}?text=${msg}`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="px-2.5 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50 rounded-lg flex items-center gap-1 transition-colors"
                                                                title="Send tracking via WhatsApp">
                                                                <MessageCircle size={12} />
                                                            </a>
                                                        );
                                                    })()}
                                                    <button onClick={() => { setFormItem(d); setConfirmDelete(null); }}
                                                        className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                                                        <Edit2 size={12} /> Edit
                                                    </button>
                                                    <button onClick={() => setConfirmDelete(d.id)} disabled={deleting === d.id}
                                                        className="px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 disabled:opacity-40">
                                                        <Trash2 size={12} /> {deleting === d.id ? '...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-400">{filtered.length} of {dispatches.length} dispatch records</p>
                    <div className="flex items-center gap-2">
                        {liveConnected ? (
                            <span className="flex items-center gap-1.5 text-xs text-green-600">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Live · {lastUpdated ? `Updated ${fmtTime(lastUpdated)}` : 'Connected'}
                            </span>
                        ) : loading || refreshing ? (
                            <span className="flex items-center gap-1.5 text-xs text-gray-400">
                                <span className="h-2 w-2 rounded-full bg-gray-300 animate-pulse" />
                                Connecting...
                            </span>
                        ) : (
                            <button onClick={handleManualRefresh} className="flex items-center gap-1 text-xs text-amber-600 hover:underline">
                                <span className="h-2 w-2 rounded-full bg-amber-400" />
                                Disconnected · Reconnect
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
