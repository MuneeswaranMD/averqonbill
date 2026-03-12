import React, { useState } from 'react';
import { Package, Plus, Edit3, Trash2, ToggleRight, ToggleLeft, X, Save, Search, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_INDUSTRIES = ['retail', 'wholesale', 'manufacturing', 'service', 'tours', 'construction', 'freelancer', 'restaurant', 'ecommerce', 'custom'];

const SEED_MODULES = [
    { id: 'm1', name: 'Products', description: 'Manage product catalog', category: 'Core', industries: ['retail', 'wholesale', 'ecommerce', 'manufacturing', 'restaurant'], permissions: ['view', 'create', 'edit', 'delete'], status: 'active' },
    { id: 'm2', name: 'Inventory', description: 'Track stock levels and alerts', category: 'Core', industries: ['retail', 'wholesale', 'ecommerce', 'manufacturing'], permissions: ['view', 'edit'], status: 'active' },
    { id: 'm3', name: 'POS Billing', description: 'Point-of-sale terminal', category: 'Sales', industries: ['retail', 'restaurant'], permissions: ['view', 'create'], status: 'active' },
    { id: 'm4', name: 'Orders', description: 'Order management and tracking', category: 'Sales', industries: ['retail', 'wholesale', 'ecommerce', 'restaurant'], permissions: ['view', 'create', 'edit'], status: 'active' },
    { id: 'm5', name: 'Customers', description: 'Customer CRM and history', category: 'CRM', industries: ALL_INDUSTRIES, permissions: ['view', 'create', 'edit', 'delete'], status: 'active' },
    { id: 'm6', name: 'Invoices', description: 'Generate and manage invoices', category: 'Finance', industries: ALL_INDUSTRIES, permissions: ['view', 'create', 'edit', 'delete'], status: 'active' },
    { id: 'm7', name: 'Payments', description: 'Payment tracking and gateways', category: 'Finance', industries: ALL_INDUSTRIES, permissions: ['view', 'create'], status: 'active' },
    { id: 'm8', name: 'Bookings', description: 'Booking and reservation management', category: 'Operations', industries: ['tours', 'service', 'restaurant'], permissions: ['view', 'create', 'edit', 'delete'], status: 'active' },
    { id: 'm9', name: 'Projects', description: 'Project planning and tracking', category: 'Operations', industries: ['construction', 'freelancer', 'service'], permissions: ['view', 'create', 'edit'], status: 'active' },
    { id: 'm10', name: 'Reports', description: 'Business analytics and reports', category: 'Analytics', industries: ALL_INDUSTRIES, permissions: ['view'], status: 'active' },
    { id: 'm11', name: 'Automation', description: 'n8n workflow automation', category: 'System', industries: ALL_INDUSTRIES, permissions: ['view', 'configure'], status: 'active' },
    { id: 'm12', name: 'Notifications', description: 'Push and email alerts', category: 'System', industries: ALL_INDUSTRIES, permissions: ['view', 'configure'], status: 'active' },
    { id: 'm13', name: 'Staff', description: 'Employee management', category: 'HR', industries: ['service', 'restaurant', 'construction', 'retail'], permissions: ['view', 'create', 'edit', 'delete'], status: 'active' },
    { id: 'm14', name: 'CRM', description: 'Sales pipeline and leads', category: 'CRM', industries: ['service', 'freelancer', 'ecommerce'], permissions: ['view', 'create', 'edit'], status: 'beta' },
    { id: 'm15', name: 'API Access', description: 'REST API and webhooks', category: 'System', industries: ALL_INDUSTRIES, permissions: ['configure'], status: 'active' },
];

const CATEGORIES = ['All', 'Core', 'Sales', 'Finance', 'CRM', 'Operations', 'Analytics', 'HR', 'System'];
const PERMISSION_COLORS = { view: 'bg-gray-100 text-gray-600', create: 'bg-blue-50 text-blue-600', edit: 'bg-amber-50 text-amber-700', delete: 'bg-red-50 text-red-600', configure: 'bg-violet-50 text-violet-700' };

const EMPTY_MOD = { name: '', description: '', category: 'Core', industries: [], permissions: ['view'], status: 'active' };

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
}

export default function ModulesPage() {
    const [modules, setModules] = useState(SEED_MODULES);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY_MOD);

    const filtered = modules.filter(m =>
        (category === 'All' || m.category === category) &&
        (!search || m.name.toLowerCase().includes(search.toLowerCase()))
    );

    const openCreate = () => { setForm(EMPTY_MOD); setModal('create'); };
    const openEdit = (m) => { setForm({ ...m }); setModal('edit'); };

    const save = () => {
        if (!form.name.trim()) return;
        if (modal === 'create') {
            setModules(prev => [{ ...form, id: 'm' + Date.now() }, ...prev]);
        } else {
            setModules(prev => prev.map(m => m.id === form.id ? { ...m, ...form } : m));
        }
        setModal(null);
    };

    const remove = (id) => { if (confirm('Delete module?')) setModules(prev => prev.filter(m => m.id !== id)); };

    const toggleStatus = (id) => {
        setModules(prev => prev.map(m => m.id === id ? { ...m, status: m.status === 'active' ? 'disabled' : 'active' } : m));
    };

    const togglePerm = (p) => setForm(prev => ({
        ...prev, permissions: prev.permissions.includes(p) ? prev.permissions.filter(x => x !== p) : [...prev.permissions, p]
    }));

    const toggleIndustry = (ind) => setForm(prev => ({
        ...prev, industries: prev.industries.includes(ind) ? prev.industries.filter(x => x !== ind) : [...prev.industries, ind]
    }));

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Module Management</h1>
                    <p className="text-sm text-gray-500">Create and manage reusable features for all industries.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                    <Plus size={16} /> New Module
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Modules', value: modules.length, color: 'text-violet-600' },
                    { label: 'Active', value: modules.filter(m => m.status === 'active').length, color: 'text-green-600' },
                    { label: 'Beta', value: modules.filter(m => m.status === 'beta').length, color: 'text-amber-600' },
                    { label: 'Disabled', value: modules.filter(m => m.status === 'disabled').length, color: 'text-red-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-64">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search modules..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                </div>
                <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCategory(c)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${category === c ? 'bg-violet-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-violet-300'}`}>
                            {c}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                            <th className="px-5 py-3">Module</th>
                            <th className="px-4 py-3">Category</th>
                            <th className="px-4 py-3">Permissions</th>
                            <th className="px-4 py-3">Industries</th>
                            <th className="px-4 py-3 text-center">Status</th>
                            <th className="px-5 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.map(m => (
                            <tr key={m.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center"><Package size={16} /></div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{m.name}</p>
                                            <p className="text-xs text-gray-400">{m.description}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-semibold">{m.category}</span>
                                </td>
                                <td className="px-4 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {m.permissions.map(p => (
                                            <span key={p} className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${PERMISSION_COLORS[p] || 'bg-gray-100 text-gray-600'}`}>{p}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-4">
                                    <span className="text-xs text-gray-500">{m.industries.length === ALL_INDUSTRIES.length ? 'All' : `${m.industries.length} industries`}</span>
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${m.status === 'active' ? 'bg-green-50 text-green-600' : m.status === 'beta' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td className="px-5 py-4 text-right">
                                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => toggleStatus(m.id)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-700 transition-colors">
                                            {m.status === 'active' ? <ToggleRight size={16} className="text-green-600" /> : <ToggleLeft size={16} />}
                                        </button>
                                        <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors"><Edit3 size={15} /></button>
                                        <button onClick={() => remove(m.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <AnimatePresence>
                {modal && (
                    <Modal title={modal === 'create' ? 'Create New Module' : 'Edit Module'} onClose={() => setModal(null)}>
                        <div className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Module Name *</label>
                                    <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Invoices"
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 mb-1.5">Category</label>
                                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500">
                                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Permissions</label>
                                <div className="flex flex-wrap gap-2">
                                    {['view', 'create', 'edit', 'delete', 'configure'].map(p => (
                                        <button key={p} onClick={() => togglePerm(p)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.permissions.includes(p) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}>
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Supported Industries ({form.industries.length})</label>
                                <div className="flex flex-wrap gap-2">
                                    <button onClick={() => setForm(p => ({ ...p, industries: p.industries.length === ALL_INDUSTRIES.length ? [] : [...ALL_INDUSTRIES] }))}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                                        {form.industries.length === ALL_INDUSTRIES.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                    {ALL_INDUSTRIES.map(ind => (
                                        <button key={ind} onClick={() => toggleIndustry(ind)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all capitalize ${form.industries.includes(ind) ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}>
                                            {ind}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-2">Status</label>
                                <div className="flex gap-2">
                                    {['active', 'beta', 'disabled'].map(s => (
                                        <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all capitalize ${form.status === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300'}`}>
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button onClick={save} disabled={!form.name.trim()}
                                    className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-60">
                                    <Save size={14} />
                                    {modal === 'create' ? 'Create Module' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
