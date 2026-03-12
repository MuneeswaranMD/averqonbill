import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Users, Phone, Mail, X, RefreshCw, MapPin } from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { AutomationService } from '../utils/automation';

const EMPTY = { name: '', phone: '', email: '', address: '', notes: '' };

function CustomerModal({ open, onClose, onSave, initial }) {
    const [form, setForm] = useState(EMPTY);
    const [saving, setSaving] = useState(false);

    useEffect(() => { setForm(initial ? { ...EMPTY, ...initial } : EMPTY); }, [initial, open]);
    if (!open) return null;

    const f = (label, key, type = 'text', req = true, ph = '') => (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">{label}{req && <span className="text-red-400 ml-0.5">*</span>}</label>
            <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                required={req} placeholder={ph}
                className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400" />
        </div>
    );

    const handleSubmit = async (e) => {
        e.preventDefault(); setSaving(true);
        await onSave(form);
        setSaving(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-base font-semibold text-gray-900">{initial?.id ? 'Edit Customer' : 'Add New Customer'}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {f('Customer Name', 'name', 'text', true, 'e.g. Ravi Kumar')}
                    <div className="grid grid-cols-2 gap-4">
                        {f('Phone', 'phone', 'tel', true, '+91 98765 43210')}
                        {f('Email', 'email', 'email', false, 'ravi@example.com')}
                    </div>
                    {f('Address', 'address', 'text', false, 'Street, City')}
                    <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1">Notes</label>
                        <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={2}
                            placeholder="Optional notes..." className="block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 resize-none" />
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                        <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60">
                            {saving ? 'Saving...' : (initial?.id ? 'Update Customer' : 'Add Customer')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function CustomersPage() {
    const { companyId } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState({ open: false, item: null });
    const [deleting, setDeleting] = useState(null);

    useEffect(() => { if (companyId) load(); }, [companyId]);

    const load = async () => {
        setLoading(true); setError(null);
        try { setCustomers(await FirestoreService.getCustomers(companyId)); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const handleSave = async (data) => {
        try {
            if (modal.item?.id) {
                await FirestoreService.update('customers', modal.item.id, data);
                setCustomers(p => p.map(c => c.id === modal.item.id ? { ...c, ...data } : c));
            } else {
                const ref = await FirestoreService.add('customers', data, companyId);
                const created = { id: ref.id, ...data, companyId };
                setCustomers(p => [created, ...p]);

                // 3. Trigger Automation
                AutomationService.trigger(companyId, 'customer.created', created);
            }
            setModal({ open: false, item: null });
        } catch (e) { alert('Error: ' + e.message); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this customer?')) return;
        setDeleting(id);
        try {
            await FirestoreService.delete('customers', id);
            setCustomers(p => p.filter(c => c.id !== id));
        } catch (e) { alert('Delete failed: ' + e.message); }
        finally { setDeleting(null); }
    };

    const filtered = customers.filter(c =>
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.phone?.includes(search) ||
        c.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-5">
            <CustomerModal open={modal.open} initial={modal.item}
                onClose={() => setModal({ open: false, item: null })}
                onSave={handleSave} />

            {/* Stat */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between w-48">
                <div>
                    <p className="text-xs text-gray-500">Total Customers</p>
                    <p className="text-2xl font-bold text-gray-900 mt-0.5">{customers.length}</p>
                </div>
                <div className="h-9 w-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                    <Users size={17} />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                    <div className="relative w-64">
                        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input type="text" placeholder="Search customers..." value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50" />
                    </div>
                    <div className="flex gap-2">
                        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button onClick={() => setModal({ open: true, item: null })}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700">
                            <Plus size={13} /> Add Customer
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <p className="text-sm text-red-400 mb-2">{error}</p>
                        <button onClick={load} className="text-sm text-blue-600 hover:underline">Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <Users size={36} strokeWidth={1} className="mb-3 opacity-40" />
                        <p className="text-sm">{search ? 'No customers match your search' : 'No customers yet'}</p>
                        {!search && <button onClick={() => setModal({ open: true, item: null })} className="mt-3 text-sm text-blue-600 hover:underline">Add your first customer</button>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Phone</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Email</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Address</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(c => (
                                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                    {c.name?.[0]?.toUpperCase() || 'C'}
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">{c.name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Phone size={12} className="text-gray-400" /> {c.phone || '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                <Mail size={12} className="text-gray-400" /> {c.email || '—'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3.5">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <MapPin size={12} className="text-gray-400 flex-shrink-0" />
                                                <span className="truncate max-w-[160px]">{c.address || '—'}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => setModal({ open: true, item: c })}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                                                    <Edit2 size={12} /> Edit
                                                </button>
                                                <button onClick={() => handleDelete(c.id)} disabled={deleting === c.id}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 disabled:opacity-40">
                                                    <Trash2 size={12} /> {deleting === c.id ? '...' : 'Delete'}
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
                    <p className="text-xs text-gray-400">{filtered.length} of {customers.length} customers</p>
                </div>
            </div>
        </div>
    );
}
