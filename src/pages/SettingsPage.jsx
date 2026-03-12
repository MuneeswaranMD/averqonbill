import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2, CreditCard, Users, Bell, Shield, Layout,
    FileText, UserPlus, Save, Lock, Wallet, Trash2,
    CheckCircle2, Eye, EyeOff, Plus, Edit2, X,
    AlertCircle, Copy, ExternalLink, RefreshCw,
    ToggleLeft, ToggleRight, Smartphone, Globe,
    Banknote, IndianRupee, Hash, Tag, Percent, CalendarClock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import {
    doc, onSnapshot, updateDoc, serverTimestamp,
    collection, query, where, addDoc, deleteDoc
} from 'firebase/firestore';

/* ─── Tab config ─────────────────────────────────────────── */
const TABS = [
    { id: 'business', label: 'Business Profile', icon: Building2 },
    { id: 'invoices', label: 'Invoice Preferences', icon: FileText },
    { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
    { id: 'team', label: 'User Management', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
];

const ROLES = ['Admin', 'Staff', 'Accountant', 'Manager'];
const ROLE_STYLES = {
    Admin: 'bg-indigo-50 text-indigo-700',
    Staff: 'bg-blue-50 text-blue-700',
    Accountant: 'bg-emerald-50 text-emerald-700',
    Manager: 'bg-purple-50 text-purple-700',
};
const ROLE_PERMS = {
    Admin: 'Full system access — all modules',
    Staff: 'Orders, POS, Customers',
    Accountant: 'Invoices, Estimates, Reports',
    Manager: 'Orders, Dispatch, Inventory',
};

const PAYMENT_METHODS = [
    { key: 'cash', label: 'Cash', icon: Banknote },
    { key: 'upi', label: 'UPI / QR Code', icon: Smartphone },
    { key: 'card', label: 'Card / POS', icon: CreditCard },
    { key: 'online', label: 'Online Transfer', icon: Globe },
    { key: 'cheque', label: 'Cheque', icon: FileText },
];

const INV_TEMPLATES = [
    { id: 'classic', label: 'Classic', desc: 'Traditional table layout with header' },
    { id: 'modern', label: 'Modern', desc: 'Clean, minimal with accent colour' },
    { id: 'retail', label: 'Retail', desc: 'Compact POS-style receipt' },
    { id: 'minimal', label: 'Minimal', desc: 'Borderless, white-space design' },
    { id: 'professional', label: 'Professional', desc: 'Corporate navy-blue layout' },
];

const CURRENCIES = ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)', 'SGD (S$)'];
const PAYMENT_TERMS = ['Immediate', 'Net 7', 'Net 15', 'Net 30', 'Net 45', 'Net 60', 'Custom'];

/* ─── Reusable components ────────────────────────────────── */
function SectionHeader({ icon: Icon, color, title, desc, children }) {
    return (
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <p className="text-xs text-gray-500 font-medium">{desc}</p>
                </div>
            </div>
            {children}
        </div>
    );
}

function SaveBar({ saving, onSave, label = 'Save Changes' }) {
    return (
        <div className="p-5 bg-gray-50/60 rounded-b-2xl border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs text-gray-400">Changes apply to all new documents generated</p>
            <button onClick={onSave} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                <Save size={15} /> {saving ? 'Saving...' : label}
            </button>
        </div>
    );
}

function InputField({ label, placeholder, value, onChange, type = 'text', helper, icon: Icon }) {
    const [show, setShow] = useState(false);
    const isPass = type === 'password';
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-700">{label}</label>
            <div className="relative">
                {Icon && <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />}
                <input
                    type={isPass ? (show ? 'text' : 'password') : type}
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                    className={`w-full ${Icon ? 'pl-9' : 'pl-4'} ${isPass ? 'pr-10' : 'pr-4'} py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900`}
                />
                {isPass && (
                    <button type="button" onClick={() => setShow(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                )}
            </div>
            {helper && <p className="text-[10px] text-gray-400 font-medium">{helper}</p>}
        </div>
    );
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
            <div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
            </div>
            <button type="button" onClick={() => onChange(!checked)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}>
                <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}

function StatusBadge({ active }) {
    return (
        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

/* ─── Main component ─────────────────────────────────────── */
export default function SettingsPage() {
    const { userData, companyId, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('business');
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const [settings, setSettings] = useState({
        // Business
        name: '', taxId: '', address: '', phone: '', supportEmail: '', website: '', logoUrl: '',
        // Invoice
        invoicePrefix: 'INV-', estimatePrefix: 'EST-', dispatchPrefix: 'DSP-',
        nextInvoiceSequence: 1001, defaultTemplate: 'classic',
        currency: 'INR (₹)', paymentTerms: 'Net 30',
        enableGST: true, gstRate: 18, showHSN: false,
        enableCGST: true, enableIGST: false,
        footerNote: 'Thank you for your business!',
        // Payments
        razorpayKeyId: '', razorpaySecret: '', razorpayWebhookUrl: '',
        stripePublicKey: '', stripeSecretKey: '',
        upiId: '', bankName: '', bankAccount: '', bankIFSC: '',
        paymentMethods: { cash: true, upi: true, card: false, online: false, cheque: false },
        // Notifications
        webhooks: {
            booking_created: '',
            booking_updated: '',
            order_created: ''
        },
        whatsappEnabled: false, emailEnabled: false,
        // Security
        twoFactorEnabled: false, sessionTimeoutEnabled: false, loginAlertsEnabled: false,
    });

    const set = (key, val) => setSettings(p => ({ ...p, [key]: val }));
    const setNested = (parent, key, val) => setSettings(p => ({ ...p, [parent]: { ...p[parent], [key]: val } }));

    /* Real-time sync for company settings */
    useEffect(() => {
        if (!companyId || companyId === 'platform') return;

        const unsubscribe = onSnapshot(doc(db, 'companies', companyId), (snap) => {
            if (snap.exists()) {
                setSettings(p => ({ ...p, ...snap.data() }));
            }
        }, (err) => {
            console.error('Settings listener error:', err);
            showToast('Failed to sync settings in real-time', 'error');
        });

        return () => unsubscribe();
    }, [companyId]);

    const handleSave = async () => {
        if (!companyId || companyId === 'platform') return;
        setSaving(true);
        try {
            await updateDoc(doc(db, 'companies', companyId), { ...settings, updatedAt: serverTimestamp() });
            showToast('Settings saved successfully');
        } catch (e) {
            console.error(e);
            showToast('Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    /* ─── Team management state ───────────────────────── */
    const [team, setTeam] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Staff' });
    const [addingUser, setAddingUser] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    /* Real-time sync for team members */
    useEffect(() => {
        if (activeTab !== 'team' || !companyId) return;
        setTeamLoading(true);

        const q = query(collection(db, 'users'), where('companyId', '==', companyId));
        const unsubscribe = onSnapshot(q, (snap) => {
            setTeam(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setTeamLoading(false);
        }, (err) => {
            console.error('Team listener error:', err);
            setTeamLoading(false);
        });

        return () => unsubscribe();
    }, [activeTab, companyId]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        if (!newUser.name || !newUser.email) return;
        setAddingUser(true);
        try {
            const ref = await addDoc(collection(db, 'users'), {
                ...newUser,
                companyId,
                role: newUser.role.toLowerCase(),
                status: 'active',
                createdAt: serverTimestamp(),
            });
            setTeam(p => [...p, { id: ref.id, ...newUser, status: 'active' }]);
            setNewUser({ name: '', email: '', role: 'Staff' });
            setShowAddUser(false);
            showToast(`${newUser.name} added to team`);
        } catch (e) {
            showToast('Failed to add user', 'error');
        } finally {
            setAddingUser(false);
        }
    };

    const handleDeleteUser = async (id) => {
        try {
            await deleteDoc(doc(db, 'users', id));
            setTeam(p => p.filter(u => u.id !== id));
            showToast('User removed');
        } catch (e) {
            showToast('Failed to remove user', 'error');
        }
    };

    const handleUpdateRole = async (id, role) => {
        try {
            await updateDoc(doc(db, 'users', id), { role: role.toLowerCase() });
            setTeam(p => p.map(u => u.id === id ? { ...u, role: role.toLowerCase() } : u));
            setEditingUser(null);
            showToast('Role updated');
        } catch (e) {
            showToast('Failed to update role', 'error');
        }
    };

    const inputCls = "w-full pl-4 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-900";

    return (
        <div className="max-w-[1200px] mx-auto pb-12">
            {/* Toast */}
            {toast && (
                <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-sm font-semibold transition-all ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-gray-900 text-white'}`}>
                    {toast.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} className="text-green-400" />}
                    {toast.msg}
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Configure your workspace, billing, and team.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Sidebar nav */}
                <div className="w-full md:w-60 flex-shrink-0 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm overflow-x-auto flex md:flex-col gap-1">
                    {TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex-shrink-0 w-full text-left ${activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                            <tab.icon size={16} className={activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'} />
                            <span className="whitespace-nowrap">{tab.label}</span>
                        </button>
                    ))}
                    <div className="hidden md:block mt-3 pt-3 border-t border-gray-100">
                        <button onClick={logout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                            <Lock size={13} /> Log Out
                        </button>
                    </div>
                </div>

                {/* Content panel */}
                <div className="flex-1 w-full bg-white rounded-2xl border border-gray-200 shadow-sm">

                    {/* ── BUSINESS PROFILE ────────────────────────────── */}
                    {activeTab === 'business' && (
                        <div>
                            <SectionHeader icon={Building2} color="bg-blue-50 text-blue-600"
                                title="Business Profile" desc="Company details printed on all documents" />
                            <div className="p-6 space-y-5">
                                {/* Logo */}
                                <div className="flex items-center gap-5 pb-5 border-b border-gray-100">
                                    <div className="h-20 w-20 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 overflow-hidden relative group">
                                        {settings.logoUrl ? (
                                            <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Building2 size={22} className="mb-1" />
                                                <span className="text-[9px] font-bold uppercase tracking-wider">Logo</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">Company Logo</p>
                                        <p className="text-xs text-gray-500 mb-2">Provide a public URL for your company logo</p>
                                        <InputField
                                            label="Logo URL"
                                            value={settings.logoUrl}
                                            onChange={v => set('logoUrl', v)}
                                            placeholder="https://example.com/logo.png"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Company Legal Name" value={settings.name}
                                        onChange={v => set('name', v)} placeholder="Averqon Traders Pvt Ltd" icon={Building2} />
                                    <InputField label="GSTIN / Tax ID" value={settings.taxId}
                                        onChange={v => set('taxId', v)} placeholder="33AAAAA0000A1Z5" icon={Hash} />
                                </div>
                                <InputField label="Registered Address" value={settings.address}
                                    onChange={v => set('address', v)} placeholder="45 Industrial Estate, Sivakasi, Tamil Nadu 626189" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Phone Number" value={settings.phone}
                                        onChange={v => set('phone', v)} placeholder="+91 98765 43210" type="tel" />
                                    <InputField label="Support Email" value={settings.supportEmail}
                                        onChange={v => set('supportEmail', v)} placeholder="billing@company.in" type="email" />
                                </div>
                                <InputField label="Website" value={settings.website}
                                    onChange={v => set('website', v)} placeholder="https://company.in" type="url" icon={Globe} />
                            </div>
                            <SaveBar saving={saving} onSave={handleSave} />
                        </div>
                    )}

                    {/* ── INVOICE PREFERENCES ──────────────────────────── */}
                    {activeTab === 'invoices' && (
                        <div>
                            <SectionHeader icon={FileText} color="bg-purple-50 text-purple-600"
                                title="Invoice Preferences" desc="Numbering, templates, tax, and currency" />
                            <div className="p-6 space-y-8">

                                {/* Numbering */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Document Numbering</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                        <InputField label="Invoice Prefix" value={settings.invoicePrefix}
                                            onChange={v => set('invoicePrefix', v)} placeholder="INV-"
                                            helper={`Preview: ${settings.invoicePrefix}${settings.nextInvoiceSequence}`} icon={Tag} />
                                        <InputField label="Estimate Prefix" value={settings.estimatePrefix}
                                            onChange={v => set('estimatePrefix', v)} placeholder="EST-"
                                            helper={`Preview: ${settings.estimatePrefix}${settings.nextInvoiceSequence}`} icon={Tag} />
                                        <InputField label="Dispatch Prefix" value={settings.dispatchPrefix}
                                            onChange={v => set('dispatchPrefix', v)} placeholder="DSP-"
                                            helper={`Preview: ${settings.dispatchPrefix}001`} icon={Tag} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="Next Invoice Number" value={settings.nextInvoiceSequence}
                                            onChange={v => set('nextInvoiceSequence', Number(v))} type="number"
                                            helper="Auto-increments after each invoice" icon={Hash} />
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5">Default Currency</label>
                                            <select value={settings.currency} onChange={e => set('currency', e.target.value)} className={inputCls}>
                                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Default Template */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Invoice Template</p>
                                        <button
                                            onClick={() => navigate('/settings/templates')}
                                            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                        >
                                            <Layout size={12} /> Browse Gallery
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {INV_TEMPLATES.map(t => (
                                            <button key={t.id} type="button" onClick={() => set('defaultTemplate', t.id)}
                                                className={`p-4 rounded-xl border-2 text-left transition-all ${settings.defaultTemplate === t.id
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300'}`}>
                                                <div className={`h-14 rounded-lg mb-3 flex items-center justify-center ${settings.defaultTemplate === t.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                    <FileText size={20} className={settings.defaultTemplate === t.id ? 'text-blue-600' : 'text-gray-400'} />
                                                </div>
                                                <p className={`text-xs font-bold ${settings.defaultTemplate === t.id ? 'text-blue-700' : 'text-gray-700'}`}>{t.label}</p>
                                                <p className="text-[10px] text-gray-400 mt-0.5">{t.desc}</p>
                                                {settings.defaultTemplate === t.id && (
                                                    <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-blue-600">
                                                        <CheckCircle2 size={10} /> Selected
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Tax */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Tax Settings</p>
                                    <div className="bg-gray-50 rounded-xl p-4 space-y-0 border border-gray-100">
                                        <Toggle label="Enable GST" description="Show GST calculations on all invoices"
                                            checked={settings.enableGST} onChange={v => set('enableGST', v)} />
                                        {settings.enableGST && (
                                            <div className="pt-3 pb-2 border-b border-gray-100">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputField label="Default GST Rate (%)" value={settings.gstRate}
                                                        onChange={v => set('gstRate', Number(v))} type="number"
                                                        icon={Percent} helper="Applied to items without individual tax" />
                                                    <div className="space-y-3 pt-1">
                                                        <Toggle label="Enable CGST/SGST" description="For intra-state transactions"
                                                            checked={settings.enableCGST} onChange={v => set('enableCGST', v)} />
                                                        <Toggle label="Enable IGST" description="For inter-state transactions"
                                                            checked={settings.enableIGST} onChange={v => set('enableIGST', v)} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <Toggle label="Show HSN / SAC Codes" description="Include item classification in invoice tables"
                                            checked={settings.showHSN} onChange={v => set('showHSN', v)} />
                                    </div>
                                </div>

                                {/* Payment terms + footer */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5">Default Payment Terms</label>
                                        <select value={settings.paymentTerms} onChange={e => set('paymentTerms', e.target.value)} className={inputCls}>
                                            {PAYMENT_TERMS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <InputField label="Invoice Footer Note" value={settings.footerNote}
                                        onChange={v => set('footerNote', v)} placeholder="Thank you for your business!" />
                                </div>
                            </div>
                            <SaveBar saving={saving} onSave={handleSave} label="Update Preferences" />
                        </div>
                    )}

                    {/* ── PAYMENT GATEWAYS ──────────────────────────────── */}
                    {activeTab === 'payments' && (
                        <div>
                            <SectionHeader icon={Wallet} color="bg-emerald-50 text-emerald-600"
                                title="Payment Gateways" desc="Connect payment services and manage accepted methods" />
                            <div className="p-6 space-y-6">

                                {/* Accepted payment methods */}
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Accepted Payment Methods</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                        {PAYMENT_METHODS.map(({ key, label, icon: Icon }) => {
                                            const active = settings.paymentMethods?.[key];
                                            return (
                                                <button key={key} type="button"
                                                    onClick={() => setNested('paymentMethods', key, !active)}
                                                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                                    <Icon size={20} className={active ? 'text-blue-600' : 'text-gray-400'} />
                                                    <span className={`text-[11px] font-bold ${active ? 'text-blue-700' : 'text-gray-500'}`}>{label}</span>
                                                    {active && <CheckCircle2 size={12} className="text-blue-500" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Razorpay */}
                                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/40 to-transparent p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-blue-600 rounded-xl text-white flex items-center justify-center font-black text-xl">R</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Razorpay</p>
                                                <p className="text-xs text-gray-500">UPI, Cards, Netbanking, Wallets</p>
                                            </div>
                                        </div>
                                        <StatusBadge active={!!settings.razorpayKeyId} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                                        <InputField label="API Key ID" value={settings.razorpayKeyId}
                                            onChange={v => set('razorpayKeyId', v)} type="password" placeholder="rzp_live_..." />
                                        <InputField label="API Key Secret" value={settings.razorpaySecret}
                                            onChange={v => set('razorpaySecret', v)} type="password" placeholder="••••••••••••••••" />
                                    </div>
                                    <InputField label="Webhook URL (optional)" value={settings.razorpayWebhookUrl}
                                        onChange={v => set('razorpayWebhookUrl', v)} placeholder="https://your-n8n.com/webhook/razorpay"
                                        helper="Receives payment status updates automatically" />
                                </div>

                                {/* Stripe */}
                                <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/30 to-transparent p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-[#6772E5] rounded-xl text-white flex items-center justify-center font-black text-sm">S</div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">Stripe</p>
                                                <p className="text-xs text-gray-500">International card payments</p>
                                            </div>
                                        </div>
                                        <StatusBadge active={!!settings.stripePublicKey} />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="Publishable Key" value={settings.stripePublicKey}
                                            onChange={v => set('stripePublicKey', v)} type="password" placeholder="pk_live_..." />
                                        <InputField label="Secret Key" value={settings.stripeSecretKey}
                                            onChange={v => set('stripeSecretKey', v)} type="password" placeholder="sk_live_..." />
                                    </div>
                                </div>

                                {/* UPI / Bank */}
                                <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50/30 to-transparent p-5">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 bg-green-600 rounded-xl text-white flex items-center justify-center">
                                            <Smartphone size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">UPI & Bank Transfer</p>
                                            <p className="text-xs text-gray-500">Show on invoices for direct payment</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <InputField label="UPI ID" value={settings.upiId}
                                            onChange={v => set('upiId', v)} placeholder="business@upi" icon={Smartphone} />
                                        <InputField label="Bank Name" value={settings.bankName}
                                            onChange={v => set('bankName', v)} placeholder="State Bank of India" icon={Banknote} />
                                        <InputField label="Account Number" value={settings.bankAccount}
                                            onChange={v => set('bankAccount', v)} placeholder="1234567890" />
                                        <InputField label="IFSC Code" value={settings.bankIFSC}
                                            onChange={v => set('bankIFSC', v)} placeholder="SBIN0001234" />
                                    </div>
                                </div>
                            </div>
                            <SaveBar saving={saving} onSave={handleSave} label="Save Payment Settings" />
                        </div>
                    )}

                    {/* ── USER MANAGEMENT ──────────────────────────────── */}
                    {activeTab === 'team' && (
                        <div>
                            <SectionHeader icon={Users} color="bg-indigo-50 text-indigo-600"
                                title="User Management" desc="Manage team members, roles, and access">
                                <button onClick={() => setShowAddUser(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-sm transition-colors">
                                    <UserPlus size={14} /> Add User
                                </button>
                            </SectionHeader>

                            {/* Add User form */}
                            {showAddUser && (
                                <form onSubmit={handleAddUser} className="mx-6 mt-5 p-5 bg-blue-50 rounded-2xl border border-blue-100 space-y-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-sm font-bold text-blue-900">Add New Team Member</p>
                                        <button type="button" onClick={() => setShowAddUser(false)} className="p-1 text-blue-400 hover:text-blue-600">
                                            <X size={16} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-blue-700 mb-1.5">Full Name *</label>
                                            <input type="text" required value={newUser.name}
                                                onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))}
                                                placeholder="Ravi Kumar"
                                                className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-700 mb-1.5">Email Address *</label>
                                            <input type="email" required value={newUser.email}
                                                onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                                                placeholder="ravi@company.in"
                                                className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-blue-700 mb-1.5">Role</label>
                                            <select value={newUser.role} onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                                                className="w-full px-3 py-2 border border-blue-200 rounded-xl text-sm outline-none focus:border-blue-500 bg-white">
                                                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    {newUser.role && (
                                        <p className="text-xs text-blue-600 bg-blue-100 px-3 py-2 rounded-lg">
                                            <strong>{newUser.role}:</strong> {ROLE_PERMS[newUser.role]}
                                        </p>
                                    )}
                                    <div className="flex justify-end gap-2">
                                        <button type="button" onClick={() => setShowAddUser(false)}
                                            className="px-4 py-2 border border-blue-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-100">Cancel</button>
                                        <button type="submit" disabled={addingUser}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 disabled:opacity-60">
                                            {addingUser ? 'Adding...' : 'Add to Team'}
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Permissions reference */}
                            <div className="mx-6 mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {ROLES.map(role => (
                                    <div key={role} className={`p-3 rounded-xl border text-center ${ROLE_STYLES[role]?.replace('text-', 'border-').replace('700', '200') || ''}`}>
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ROLE_STYLES[role]}`}>{role}</span>
                                        <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">{ROLE_PERMS[role]}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Team table */}
                            <div className="mt-5">
                                {teamLoading ? (
                                    <div className="flex items-center justify-center py-12 text-gray-400 gap-2">
                                        <RefreshCw size={16} className="animate-spin" /> Loading team...
                                    </div>
                                ) : team.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <Users size={36} strokeWidth={1} className="mb-3 opacity-40" />
                                        <p className="text-sm">No team members yet</p>
                                        <button onClick={() => setShowAddUser(true)} className="mt-2 text-sm text-blue-600 hover:underline">Add your first team member</button>
                                    </div>
                                ) : (
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-y border-gray-100 bg-gray-50/60 text-[10px] font-bold text-gray-500 uppercase">
                                                <th className="px-6 py-3 text-left">Member</th>
                                                <th className="px-6 py-3 text-left">Role & Access</th>
                                                <th className="px-6 py-3 text-left">Status</th>
                                                <th className="px-6 py-3 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {team.map(usr => (
                                                <tr key={usr.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-sm ${ROLE_STYLES[usr.role?.charAt(0).toUpperCase() + usr.role?.slice(1)] || 'bg-gray-100 text-gray-600'}`}>
                                                                {usr.name?.[0]?.toUpperCase() || 'U'}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-900">{usr.name || 'Unnamed'}</p>
                                                                <p className="text-xs text-gray-400">{usr.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {editingUser === usr.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <select defaultValue={usr.role}
                                                                    onChange={e => handleUpdateRole(usr.id, e.target.value)}
                                                                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400">
                                                                    {ROLES.map(r => <option key={r} value={r.toLowerCase()}>{r}</option>)}
                                                                </select>
                                                                <button onClick={() => setEditingUser(null)} className="text-xs text-gray-400 hover:text-gray-600"><X size={13} /></button>
                                                            </div>
                                                        ) : (
                                                            <div>
                                                                <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${ROLE_STYLES[usr.role?.charAt(0).toUpperCase() + usr.role?.slice(1)] || 'bg-gray-100 text-gray-600'}`}>
                                                                    {usr.role || 'Staff'}
                                                                </span>
                                                                <p className="text-[10px] text-gray-400 mt-0.5">{ROLE_PERMS[usr.role?.charAt(0).toUpperCase() + usr.role?.slice(1)] || ''}</p>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <StatusBadge active={usr.status !== 'disabled'} />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => setEditingUser(editingUser === usr.id ? null : usr.id)}
                                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit role">
                                                                <Edit2 size={14} />
                                                            </button>
                                                            {usr.email !== userData?.email && (
                                                                <button onClick={() => handleDeleteUser(usr.id)}
                                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Remove user">
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                            <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                                <p className="text-xs text-gray-400">{team.length} member{team.length !== 1 ? 's' : ''} in workspace</p>
                            </div>
                        </div>
                    )}

                    {/* ── NOTIFICATIONS ────────────────────────────────── */}
                    {activeTab === 'notifications' && (
                        <div>
                            <SectionHeader icon={Bell} color="bg-orange-50 text-orange-600"
                                title="Automation & Webhooks" desc="Connect n8n to automate your business with event-driven workflows." />
                            <div className="p-6 space-y-6">
                                {/* Webhook Configuration Table */}
                                <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
                                    <div className="bg-gray-50/80 px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trigger Events</span>
                                        <span className="text-[10px] text-gray-400 font-medium">n8n / Callback URL</span>
                                    </div>

                                    {[
                                        {
                                            key: 'booking_created',
                                            icon: CalendarClock,
                                            label: 'Booking Created',
                                            desc: 'Triggers when a new booking is submitted.',
                                            color: 'text-blue-600 bg-blue-50'
                                        },
                                        {
                                            key: 'booking_updated',
                                            icon: RefreshCw,
                                            label: 'Booking Status Change',
                                            desc: 'Triggers on confirmation or cancellation.',
                                            color: 'text-amber-600 bg-amber-50'
                                        },
                                        {
                                            key: 'order_created',
                                            icon: Bell,
                                            label: 'Order / Invoice Created',
                                            desc: 'Triggers on every new POS or online order.',
                                            color: 'text-emerald-600 bg-emerald-50'
                                        }
                                    ].map((ev, i, arr) => {
                                        const Icon = ev.icon;
                                        const val = settings.webhooks?.[ev.key] || '';
                                        const isActive = val.trim().length > 5;

                                        return (
                                            <div key={ev.key} className={`flex items-center gap-6 px-5 py-4 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/50 transition-colors`}>
                                                {/* Left: Event Info */}
                                                <div className="w-52 flex items-center gap-3">
                                                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${ev.color}`}>
                                                        <Icon size={14} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-800 leading-tight">{ev.label}</p>
                                                        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{ev.desc}</p>
                                                    </div>
                                                </div>

                                                {/* Middle: URL Input */}
                                                <div className="flex-1">
                                                    <div className="relative group">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Globe size={12} className="text-gray-300 group-focus-within:text-blue-400 transition-colors" />
                                                        </div>
                                                        <input
                                                            type="url"
                                                            className="block w-full pl-8 pr-3 py-2 text-xs border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-50 focus:border-blue-300 outline-none transition-all placeholder:text-gray-200"
                                                            placeholder="https://n8n.yourdomain.com/webhook/..."
                                                            value={val}
                                                            onChange={e => setNested('webhooks', ev.key, e.target.value)}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Right: Status */}
                                                <div className="w-20 flex justify-end">
                                                    {isActive ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                            Active
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-400 text-[10px] font-semibold">
                                                            Inactive
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Channel Configuration */}
                                <div className="space-y-3">
                                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-1">Direct Channels</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-blue-100 transition-colors group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                                    <Smartphone size={18} />
                                                </div>
                                                <button
                                                    onClick={() => set('whatsappEnabled', !settings.whatsappEnabled)}
                                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${settings.whatsappEnabled ? 'bg-green-500 border-green-500' : 'bg-gray-100 border-gray-100'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${settings.whatsappEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">WhatsApp Business</h4>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Send instant order updates and dispatch alerts via WhatsApp API.</p>
                                        </div>

                                        <div className="p-5 border border-gray-100 rounded-2xl bg-white hover:border-blue-100 transition-colors group">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                                                    <Globe size={18} />
                                                </div>
                                                <button
                                                    onClick={() => set('emailEnabled', !settings.emailEnabled)}
                                                    className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${settings.emailEnabled ? 'bg-blue-500 border-blue-500' : 'bg-gray-100 border-gray-100'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${settings.emailEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
                                                </button>
                                            </div>
                                            <h4 className="text-sm font-bold text-gray-900 mb-1">Email Reports</h4>
                                            <p className="text-[11px] text-gray-500 leading-relaxed">Automatically email daily sales summaries and customer receipts.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Banner */}
                                <div className="flex items-start gap-4 p-4 bg-orange-50/40 border border-orange-100 rounded-2xl">
                                    <AlertCircle size={16} className="text-orange-500 mt-0.5" />
                                    <div>
                                        <p className="text-[11px] font-bold text-orange-800">Need help with n8n?</p>
                                        <p className="text-[10px] text-orange-700/70 mt-0.5">Automations require an active n8n workflow listening to the URLs above. Visit our <a href="#" className="underline font-bold">Automation Guide</a> to get started.</p>
                                    </div>
                                </div>
                            </div>
                            <SaveBar saving={saving} onSave={handleSave} label="Update Settings" />
                        </div>
                    )}

                    {/* ── SECURITY ─────────────────────────────────────── */}
                    {activeTab === 'security' && (
                        <div>
                            <SectionHeader icon={Shield} color="bg-gray-100 text-gray-600"
                                title="Security" desc="Password, sessions, and access control" />
                            <div className="p-6 space-y-4">
                                <div className="bg-gray-50 rounded-2xl border border-gray-100 p-5 space-y-0">
                                    <Toggle label="Two-Factor Authentication" description="Require OTP on every login"
                                        checked={settings.twoFactorEnabled} onChange={v => set('twoFactorEnabled', v)} />
                                    <Toggle label="Session Timeout" description="Auto-logout after 30 minutes of inactivity"
                                        checked={settings.sessionTimeoutEnabled} onChange={v => set('sessionTimeoutEnabled', v)} />
                                    <Toggle label="Login Activity Alerts" description="Email alert on new device login"
                                        checked={settings.loginAlertsEnabled} onChange={v => set('loginAlertsEnabled', v)} />
                                </div>

                                <div className="p-5 bg-red-50 border border-red-100 rounded-2xl">
                                    <p className="text-sm font-bold text-red-800 mb-1">Danger Zone</p>
                                    <p className="text-xs text-red-500 mb-4">These actions are irreversible. Proceed with caution.</p>
                                    <div className="flex flex-wrap gap-3">
                                        <button onClick={logout}
                                            className="flex items-center gap-2 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-xl text-xs font-bold hover:bg-red-50 transition-colors">
                                            <Lock size={13} /> Sign Out All Devices
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
