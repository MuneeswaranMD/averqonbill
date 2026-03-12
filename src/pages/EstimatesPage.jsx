import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus, Search, Edit2, Trash2, RefreshCw,
    FileText, CheckCircle, Clock, Send, Download, Eye
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import { useCompanySettings } from '../hooks/useCompanySettings';

const EST_STATUSES = ['Draft', 'Sent', 'Accepted', 'Declined', 'Expired'];
const STATUS_STYLE = {
    'Draft': 'bg-gray-100 text-gray-600',
    'Sent': 'bg-blue-50 text-blue-700',
    'Accepted': 'bg-green-50 text-green-700',
    'Declined': 'bg-red-50 text-red-600',
    'Expired': 'bg-amber-50 text-amber-700',
};

export default function EstimatesPage() {
    const navigate = useNavigate();
    const { companyId } = useAuth();
    const { settings } = useCompanySettings(companyId);
    const [estimates, setEstimates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [deleting, setDeleting] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    useEffect(() => { if (companyId) load(); }, [companyId]);

    const load = async () => {
        setLoading(true); setError(null);
        try { setEstimates(await FirestoreService.getEstimates(companyId)); }
        catch (e) { setError(e.message); }
        finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        setDeleting(id);
        try { await FirestoreService.delete('estimates', id); setEstimates(p => p.filter(e => e.id !== id)); }
        catch (e) { console.error('Delete failed:', e); }
        finally { setDeleting(null); setConfirmDelete(null); }
    };

    const handleDownload = (est) => {
        try {
            generateInvoicePDF(
                {
                    ...est,
                    totalAmount: est.amount,
                    currencySymbol: settings.currency?.match(/\((.+)\)/)?.[1] || '₹'
                },
                {
                    name: est.customerName,
                    address: est.customerAddress || '',
                    phone: est.customerPhone || ''
                },
                est.template || settings.defaultTemplate || 'classic'
            );
        } catch (e) { alert('PDF generation failed: ' + e.message); }
    };

    const updateStatus = async (id, status) => {
        try {
            await FirestoreService.update('estimates', id, { status });
            setEstimates(p => p.map(e => e.id === id ? { ...e, status } : e));
        } catch (e) { console.error(e); }
    };

    const filtered = estimates.filter(e => {
        const matchSearch = !search ||
            e.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            e.id.includes(search);
        const matchStatus = statusFilter === 'all' || e.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = {
        total: estimates.length,
        sent: estimates.filter(e => e.status === 'Sent').length,
        accepted: estimates.filter(e => e.status === 'Accepted').length,
        pending: estimates.filter(e => e.status === 'Draft').length,
    };

    return (
        <div className="space-y-5">
            {/* Inline Delete Confirmation */}
            {confirmDelete && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-center justify-between">
                    <p className="text-sm text-red-700 font-medium">Delete estimate <span className="font-mono font-semibold">EST-{confirmDelete.slice(-8).toUpperCase()}</span>? This cannot be undone.</p>
                    <div className="flex gap-2">
                        <button onClick={() => setConfirmDelete(null)} className="px-3 py-1.5 border border-red-200 rounded-lg text-xs font-medium text-red-600 hover:bg-red-100 transition-colors">Cancel</button>
                        <button onClick={() => handleDelete(confirmDelete)} disabled={deleting === confirmDelete} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60">
                            {deleting === confirmDelete ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Estimates', value: stats.total, cls: 'bg-blue-50 text-blue-600', icon: FileText, vCls: 'text-gray-900' },
                    { label: 'Sent to Customers', value: stats.sent, cls: 'bg-indigo-50 text-indigo-600', icon: Send, vCls: 'text-indigo-700' },
                    { label: 'Accepted', value: stats.accepted, cls: 'bg-green-50 text-green-600', icon: CheckCircle, vCls: 'text-green-700' },
                    { label: 'Draft', value: stats.pending, cls: 'bg-gray-100 text-gray-600', icon: Clock, vCls: 'text-gray-700' },
                ].map(({ label, value, cls, icon: Icon, vCls }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                        <div><p className="text-xs text-gray-500">{label}</p><p className={`text-2xl font-bold mt-0.5 ${vCls}`}>{value}</p></div>
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${cls}`}><Icon size={17} /></div>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200">
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                        <div className="relative w-56">
                            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Search estimates..." value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50" />
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-600 bg-gray-50">
                            <option value="all">All Status</option>
                            {EST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button onClick={() => navigate('/estimates/create')}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
                            <Plus size={13} /> New Estimate
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p className="text-sm text-red-400 mb-2">{error}</p>
                        <button onClick={load} className="text-sm text-blue-600 hover:underline">Retry</button>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                        <FileText size={36} strokeWidth={1} className="mb-3 opacity-40" />
                        <p className="text-sm">{search ? 'No estimates match your search' : 'No estimates yet'}</p>
                        {!search && <button onClick={() => navigate('/estimates/create')} className="mt-3 text-sm text-blue-600 hover:underline">Create your first estimate</button>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Estimate ID</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Customer</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Product</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Amount</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Status</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">Valid Until</th>
                                    <th className="text-right px-5 py-3 text-xs font-semibold text-gray-500">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map(est => (
                                    <tr key={est.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3.5 font-mono text-xs font-semibold text-gray-500">
                                            EST-{est.id.slice(-8).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-3.5 font-medium text-gray-900">{est.customerName || '—'}</td>
                                        <td className="px-4 py-3.5 text-xs text-gray-500">{est.productName || '—'}</td>
                                        <td className="px-4 py-3.5 font-semibold text-gray-900">₹{Number(est.amount || 0).toLocaleString()}</td>
                                        <td className="px-4 py-3.5">
                                            <select value={est.status || 'Draft'} onChange={e => updateStatus(est.id, e.target.value)}
                                                className={`text-xs font-medium px-2 py-1 rounded-md border-0 outline-none cursor-pointer ${STATUS_STYLE[est.status] || STATUS_STYLE['Draft']}`}>
                                                {EST_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </td>
                                        <td className="px-4 py-3.5 text-xs text-gray-500">{est.validUntil || '—'}</td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <button onClick={() => navigate(`/estimates/view/${est.id}`)}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1" title="View Details">
                                                    <Eye size={12} /> View
                                                </button>
                                                <button onClick={() => handleDownload(est)}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-lg flex items-center gap-1" title="Download PDF">
                                                    <Download size={12} /> PDF
                                                </button>
                                                <button onClick={() => navigate(`/estimates/edit/${est.id}`)}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1">
                                                    <Edit2 size={12} /> Edit
                                                </button>
                                                <button onClick={() => setConfirmDelete(est.id)} disabled={deleting === est.id}
                                                    className="px-2.5 py-1.5 text-xs font-medium text-red-500 hover:bg-red-50 rounded-lg flex items-center gap-1 disabled:opacity-40">
                                                    <Trash2 size={12} />
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
                    <p className="text-xs text-gray-400">{filtered.length} of {estimates.length} estimates</p>
                </div>
            </div>
        </div>
    );
}
