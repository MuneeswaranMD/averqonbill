import React, { useState, useEffect } from 'react';
import {
    Globe, Plus, Edit3, Trash2, CheckCircle2, Package,
    ToggleLeft, ToggleRight, Search, X, Save, ChevronDown, ChevronUp
} from 'lucide-react';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc,
    doc, serverTimestamp, orderBy, query
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

import { ALL_MODULES, ALL_INDUSTRIES } from '../../config/industryModules';

const INDUSTRY_COLORS = [
    { label: 'Blue', value: 'from-blue-500 to-blue-600', preview: 'bg-blue-500' },
    { label: 'Emerald', value: 'from-emerald-500 to-emerald-600', preview: 'bg-emerald-500' },
    { label: 'Violet', value: 'from-violet-500 to-violet-600', preview: 'bg-violet-500' },
    { label: 'Orange', value: 'from-orange-500 to-orange-600', preview: 'bg-orange-500' },
    { label: 'Sky', value: 'from-sky-500 to-sky-600', preview: 'bg-sky-500' },
    { label: 'Amber', value: 'from-amber-500 to-amber-600', preview: 'bg-amber-500' },
    { label: 'Pink', value: 'from-pink-500 to-pink-600', preview: 'bg-pink-500' },
    { label: 'Red', value: 'from-red-500 to-red-600', preview: 'bg-red-500' },
    { label: 'Indigo', value: 'from-indigo-500 to-indigo-600', preview: 'bg-indigo-500' },
];

const EMPTY_FORM = {
    name: '', description: '', icon: '🏪', color: 'from-blue-500 to-blue-600',
    modules: [], status: 'active'
};

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
}

export default function IndustriesPage() {
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // null | 'create' | 'edit'
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'industries'), orderBy('createdAt', 'desc')));
            if (snap.empty) {
                // Seed defaults if empty
                setIndustries(DEFAULT_INDUSTRIES);
            } else {
                setIndustries(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            }
        } catch (e) {
            setIndustries(DEFAULT_INDUSTRIES);
        } finally { setLoading(false); }
    };

    const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
    const openEdit = (ind) => { setForm({ ...ind }); setModal('edit'); };

    const save = async () => {
        if (!form.name.trim()) return;
        setSaving(true);
        try {
            const payload = { ...form, updatedAt: serverTimestamp() };
            if (modal === 'create') {
                const ref = await addDoc(collection(db, 'industries'), { ...payload, createdAt: serverTimestamp() });
                setIndustries(prev => [{ id: ref.id, ...payload }, ...prev]);
            } else {
                await updateDoc(doc(db, 'industries', form.id), payload);
                setIndustries(prev => prev.map(i => i.id === form.id ? { ...i, ...payload } : i));
            }
            setModal(null);
        } catch (e) { console.error(e); }
        finally { setSaving(false); }
    };

    const remove = async (id) => {
        if (!confirm('Delete this industry? This cannot be undone.')) return;
        await deleteDoc(doc(db, 'industries', id));
        setIndustries(prev => prev.filter(i => i.id !== id));
    };

    const toggleModule = (mod) => {
        setForm(prev => ({
            ...prev,
            modules: prev.modules.includes(mod)
                ? prev.modules.filter(m => m !== mod)
                : [...prev.modules, mod]
        }));
    };

    const toggleStatus = async (industry) => {
        const newStatus = industry.status === 'active' ? 'disabled' : 'active';
        await updateDoc(doc(db, 'industries', industry.id), { status: newStatus });
        setIndustries(prev => prev.map(i => i.id === industry.id ? { ...i, status: newStatus } : i));
    };

    const filtered = industries.filter(i =>
        !search || i.name?.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-violet-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Industry Management</h1>
                    <p className="text-sm text-gray-500">Create and configure industries with module assignments.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                    <Plus size={16} /> New Industry
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Industries', value: industries.length, color: 'text-violet-600', bg: 'bg-violet-50' },
                    { label: 'Active', value: industries.filter(i => i.status !== 'disabled').length, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Disabled', value: industries.filter(i => i.status === 'disabled').length, color: 'text-red-600', bg: 'bg-red-50' },
                    { label: 'Total Modules', value: ALL_MODULES.length, color: 'text-blue-600', bg: 'bg-blue-50' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search industries..."
                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                />
            </div>

            {/* Industry Cards */}
            <div className="space-y-3">
                {filtered.map(ind => (
                    <div key={ind.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between p-4 gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${ind.color || 'from-blue-500 to-blue-600'} flex items-center justify-center text-2xl shadow-sm flex-shrink-0`}>
                                    {ind.icon || '🏪'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-sm font-bold text-gray-900">{ind.name}</h3>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.status === 'disabled' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                            {ind.status === 'disabled' ? 'Disabled' : 'Active'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">{ind.description || 'No description'}</p>
                                    <p className="text-[10px] text-gray-400 mt-1">{(ind.modules || []).length} modules enabled</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <button onClick={() => toggleStatus(ind)} title={ind.status === 'disabled' ? 'Enable' : 'Disable'}
                                    className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                                    {ind.status === 'disabled' ? <ToggleLeft size={20} /> : <ToggleRight size={20} className="text-green-600" />}
                                </button>
                                <button onClick={() => openEdit(ind)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit3 size={16} />
                                </button>
                                <button onClick={() => remove(ind.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                                <button onClick={() => setExpanded(expanded === ind.id ? null : ind.id)}
                                    className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    {expanded === ind.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>
                        {/* Expanded modules */}
                        <AnimatePresence>
                            {expanded === ind.id && (
                                <motion.div
                                    initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                                    className="overflow-hidden border-t border-gray-100"
                                >
                                    <div className="p-4 bg-gray-50/50">
                                        <p className="text-xs font-bold text-gray-500 mb-3">Enabled Modules</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(ind.modules || []).map(m => (
                                                <span key={m} className="inline-flex items-center gap-1 px-2.5 py-1 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
                                                    <CheckCircle2 size={10} />{m}
                                                </span>
                                            ))}
                                            {(!ind.modules || ind.modules.length === 0) && (
                                                <span className="text-xs text-gray-400">No modules assigned</span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-16 text-sm text-gray-400">No industries found</div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <AnimatePresence>
                {modal && (
                    <Modal title={modal === 'create' ? 'Create New Industry' : 'Edit Industry'} onClose={() => setModal(null)}>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Industry Name *</label>
                                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                                        placeholder="e.g. Retail Store"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Icon (emoji)</label>
                                    <input value={form.icon} onChange={e => setForm(p => ({ ...p, icon: e.target.value }))}
                                        placeholder="🏪"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 text-center text-xl" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    placeholder="Brief description of this industry..."
                                    rows={2}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Color Theme</label>
                                <div className="flex flex-wrap gap-2">
                                    {INDUSTRY_COLORS.map(c => (
                                        <button key={c.value} onClick={() => setForm(p => ({ ...p, color: c.value }))}
                                            className={`h-7 w-7 rounded-lg ${c.preview} transition-all ${form.color === c.value ? 'ring-2 ring-offset-1 ring-violet-500 scale-110' : 'opacity-70 hover:opacity-100'}`}
                                            title={c.label} />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">
                                    Assign Modules ({form.modules.length} selected)
                                </label>
                                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-1">
                                    {ALL_MODULES.map(mod => (
                                        <button key={mod} onClick={() => toggleModule(mod)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.modules.includes(mod)
                                                ? 'bg-violet-600 text-white border-violet-600'
                                                : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'
                                                }`}>
                                            {mod}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                                <button onClick={save} disabled={saving || !form.name.trim()}
                                    className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 disabled:opacity-60">
                                    <Save size={14} />
                                    {saving ? 'Saving...' : modal === 'create' ? 'Create Industry' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}

// Default seed data for first load
const DEFAULT_INDUSTRIES = ALL_INDUSTRIES;
