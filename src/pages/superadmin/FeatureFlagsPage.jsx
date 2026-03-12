import React, { useState } from 'react';
import { Zap, ToggleRight, ToggleLeft, Edit3, Plus, X, Save, Globe, Shield, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_INDUSTRIES = ['retail', 'wholesale', 'manufacturing', 'service', 'tours', 'construction', 'freelancer', 'restaurant', 'ecommerce'];

const SEED_FLAGS = [
    { id: 'ff1', name: 'ai_automation', label: 'AI Automation', description: 'Enable OpenRouter AI-powered automation suggestions', globalEnabled: false, perIndustry: {}, plan: 'business', category: 'AI' },
    { id: 'ff2', name: 'pos_system', label: 'POS System', description: 'Point-of-sale terminal for retail and restaurant', globalEnabled: true, perIndustry: { retail: true, restaurant: true }, plan: 'starter', category: 'Core' },
    { id: 'ff3', name: 'booking_engine', label: 'Booking Engine', description: 'Full booking and reservation system', globalEnabled: true, perIndustry: { tours: true, service: true, restaurant: true }, plan: 'starter', category: 'Core' },
    { id: 'ff4', name: 'advanced_reports', label: 'Advanced Reports', description: 'Deep analytics, custom date ranges, export', globalEnabled: false, perIndustry: {}, plan: 'business', category: 'Analytics' },
    { id: 'ff5', name: 'api_access', label: 'API Access', description: 'REST API and webhook integrations', globalEnabled: false, perIndustry: {}, plan: 'enterprise', category: 'System' },
    { id: 'ff6', name: 'multi_currency', label: 'Multi-Currency', description: 'Support multiple currencies in invoices', globalEnabled: false, perIndustry: {}, plan: 'business', category: 'Finance' },
    { id: 'ff7', name: 'white_label', label: 'White Label', description: 'Custom branding and domain support', globalEnabled: false, perIndustry: {}, plan: 'enterprise', category: 'System' },
    { id: 'ff8', name: 'bulk_import', label: 'Bulk Data Import', description: 'Import products/customers via CSV or Excel', globalEnabled: true, perIndustry: {}, plan: 'starter', category: 'Core' },
    { id: 'ff9', name: 'sms_notifications', label: 'SMS Notifications', description: 'Send order/booking status via SMS', globalEnabled: false, perIndustry: {}, plan: 'business', category: 'Notifications' },
    { id: 'ff10', name: 'crm_pipeline', label: 'CRM Sales Pipeline', description: 'Lead tracking and sales pipeline management', globalEnabled: false, perIndustry: { service: true, freelancer: true, ecommerce: true }, plan: 'business', category: 'CRM' },
];

const PLAN_BADGE = { free: 'bg-gray-100 text-gray-600', starter: 'bg-blue-50 text-blue-700', business: 'bg-violet-50 text-violet-700', enterprise: 'bg-amber-50 text-amber-700' };
const CAT_COLORS = { AI: 'bg-purple-50 text-purple-700', Core: 'bg-blue-50 text-blue-700', Analytics: 'bg-sky-50 text-sky-700', System: 'bg-gray-100 text-gray-600', Finance: 'bg-green-50 text-green-700', Notifications: 'bg-orange-50 text-orange-700', CRM: 'bg-pink-50 text-pink-700' };

function FlagRow({ flag, onToggleGlobal, onToggleIndustry, onEdit }) {
    const [showIndustry, setShowIndustry] = useState(false);
    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between p-4 gap-3">
                <div className="flex items-center gap-4 min-w-0">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${flag.globalEnabled ? 'bg-violet-50' : 'bg-gray-100'}`}>
                        <Zap size={18} className={flag.globalEnabled ? 'text-violet-600' : 'text-gray-400'} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-bold text-gray-900">{flag.label}</p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${CAT_COLORS[flag.category] || 'bg-gray-100 text-gray-600'}`}>{flag.category}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${PLAN_BADGE[flag.plan] || PLAN_BADGE.starter}`}>{flag.plan}+</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{flag.description}</p>
                        <code className="text-[10px] text-gray-400 font-mono">{flag.name}</code>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setShowIndustry(!showIndustry)} className="text-xs text-gray-500 hover:text-violet-600 font-semibold px-2 py-1 rounded-lg hover:bg-violet-50 transition-colors hidden sm:block">
                        Per-Industry
                    </button>
                    <button onClick={() => onEdit(flag)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={15} /></button>
                    <button onClick={() => onToggleGlobal(flag.id)}
                        title={flag.globalEnabled ? 'Disable globally' : 'Enable globally'}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all text-xs font-bold"
                        style={flag.globalEnabled ? { background: '#7C3AED10', borderColor: '#7C3AED30', color: '#7C3AED' } : { background: '#F8FAFC', borderColor: '#E2E8F0', color: '#94A3B8' }}>
                        {flag.globalEnabled ? <><ToggleRight size={16} /> On</> : <><ToggleLeft size={16} /> Off</>}
                    </button>
                </div>
            </div>
            {/* Per-industry toggles */}
            <AnimatePresence>
                {showIndustry && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden border-t border-gray-100">
                        <div className="p-4 bg-gray-50">
                            <p className="text-xs font-bold text-gray-500 mb-3">Per-Industry Override</p>
                            <div className="flex flex-wrap gap-2">
                                {ALL_INDUSTRIES.map(ind => {
                                    const enabled = flag.perIndustry?.[ind] ?? flag.globalEnabled;
                                    return (
                                        <button key={ind} onClick={() => onToggleIndustry(flag.id, ind, !enabled)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border capitalize transition-all ${enabled ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}>
                                            {ind}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FeatureFlagsPage() {
    const [flags, setFlags] = useState(SEED_FLAGS);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});

    const toggleGlobal = (id) => setFlags(prev => prev.map(f => f.id === id ? { ...f, globalEnabled: !f.globalEnabled } : f));
    const toggleIndustry = (id, ind, val) => setFlags(prev => prev.map(f => f.id === id ? { ...f, perIndustry: { ...f.perIndustry, [ind]: val } } : f));

    const openEdit = (flag) => { setForm({ ...flag }); setModal('edit'); };
    const save = () => { setFlags(prev => prev.map(f => f.id === form.id ? { ...f, ...form } : f)); setModal(null); };

    const filtered = flags.filter(f => !search || f.label.toLowerCase().includes(search.toLowerCase()) || f.name.toLowerCase().includes(search.toLowerCase()));

    const enabledCount = flags.filter(f => f.globalEnabled).length;

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Feature Flags</h1>
                    <p className="text-sm text-gray-500">Control feature availability globally or per industry / plan.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-600">{enabledCount} / {flags.length} globally enabled</span>
                    <button onClick={() => { setForm({ name: '', label: '', description: '', category: 'Core', plan: 'starter', globalEnabled: false, perIndustry: {} }); setModal('create'); }}
                        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                        <Plus size={16} /> New Flag
                    </button>
                </div>
            </div>

            {/* Category summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['Core', 'AI', 'System', 'Analytics'].map(cat => (
                    <div key={cat} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-1">{cat} Features</p>
                        <p className="text-2xl font-black text-gray-900">{flags.filter(f => f.category === cat).length}</p>
                        <p className="text-xs text-green-600 font-semibold">{flags.filter(f => f.category === cat && f.globalEnabled).length} enabled</p>
                    </div>
                ))}
            </div>

            <div className="relative w-full sm:w-72">
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search flags..."
                    className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
            </div>

            <div className="space-y-3">
                {filtered.map(flag => (
                    <FlagRow key={flag.id} flag={flag} onToggleGlobal={toggleGlobal} onToggleIndustry={toggleIndustry} onEdit={openEdit} />
                ))}
            </div>

            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h2 className="font-bold text-gray-900">{modal === 'create' ? 'Create Feature Flag' : 'Edit Feature Flag'}</h2>
                                <button onClick={() => setModal(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Label *</label>
                                    <input value={form.label || ''} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. AI Automation"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Flag Key</label>
                                    <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value.toLowerCase().replace(/\s+/g, '_') }))} placeholder="ai_automation"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                                    <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Category</label>
                                        <select value={form.category || 'Core'} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none">
                                            {['Core', 'AI', 'Analytics', 'Finance', 'System', 'Notifications', 'CRM'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 mb-1.5">Required Plan</label>
                                        <select value={form.plan || 'starter'} onChange={e => setForm(p => ({ ...p, plan: e.target.value }))}
                                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none">
                                            {['free', 'starter', 'business', 'enterprise'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                    <input type="checkbox" id="genable" checked={form.globalEnabled || false} onChange={e => setForm(p => ({ ...p, globalEnabled: e.target.checked }))} className="w-4 h-4 accent-violet-600" />
                                    <label htmlFor="genable" className="text-sm font-semibold text-gray-700">Enabled globally</label>
                                </div>
                                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                    <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                    <button onClick={save} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
                                        <Save size={14} /> Save
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
