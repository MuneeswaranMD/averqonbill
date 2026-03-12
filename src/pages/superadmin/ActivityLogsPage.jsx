import React, { useState } from 'react';
import { ScrollText, Search, RefreshCw, Filter, Building2, Users, Package, ShoppingCart, Settings, Shield, Zap } from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';

const ACTION_ICONS = {
    'company': Building2, 'user': Users, 'order': ShoppingCart,
    'product': Package, 'settings': Settings, 'auth': Shield,
    'automation': Zap,
};

const ACTION_COLORS = {
    created: 'bg-green-50 text-green-600',
    updated: 'bg-blue-50 text-blue-600',
    deleted: 'bg-red-50 text-red-600',
    suspended: 'bg-amber-50 text-amber-700',
    login: 'bg-gray-100 text-gray-600',
    activated: 'bg-violet-50 text-violet-600',
};

// Simulated activity logs
const SAMPLE_LOGS = [
    { id: 'l1', entityType: 'company', action: 'created', detail: 'New workspace: ABC Retail', actor: 'muneeswaran@averqon.in', timestamp: new Date(Date.now() - 3600000 * 1) },
    { id: 'l2', entityType: 'user', action: 'login', detail: 'User login: john@shop.com', actor: 'john@shop.com', timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: 'l3', entityType: 'company', action: 'suspended', detail: 'Workspace suspended: XYZ Traders', actor: 'muneeswaran@averqon.in', timestamp: new Date(Date.now() - 3600000 * 3) },
    { id: 'l4', entityType: 'order', action: 'created', detail: 'Order #ORD-001 created (₹2,500)', actor: 'user@abcretail.com', timestamp: new Date(Date.now() - 3600000 * 4) },
    { id: 'l5', entityType: 'settings', action: 'updated', detail: 'Industry template updated: Retail', actor: 'muneeswaran@averqon.in', timestamp: new Date(Date.now() - 3600000 * 5) },
    { id: 'l6', entityType: 'user', action: 'created', detail: 'New user created: staff@tourco.com', actor: 'admin@tourco.com', timestamp: new Date(Date.now() - 3600000 * 6) },
    { id: 'l7', entityType: 'automation', action: 'activated', detail: 'Webhook triggered: order.created', actor: 'system', timestamp: new Date(Date.now() - 3600000 * 8) },
    { id: 'l8', entityType: 'product', action: 'created', detail: '15 products imported via CSV', actor: 'user@wholesale.com', timestamp: new Date(Date.now() - 3600000 * 10) },
    { id: 'l9', entityType: 'company', action: 'updated', detail: 'Plan upgraded to Business: Tours Co', actor: 'muneeswaran@averqon.in', timestamp: new Date(Date.now() - 3600000 * 12) },
    { id: 'l10', entityType: 'auth', action: 'login', detail: 'Super Admin login', actor: 'muneeswaran@averqon.in', timestamp: new Date(Date.now() - 3600000 * 15) },
    { id: 'l11', entityType: 'company', action: 'created', detail: 'New workspace: Modern Constructions', actor: 'owner@modern.in', timestamp: new Date(Date.now() - 3600000 * 20) },
    { id: 'l12', entityType: 'user', action: 'deleted', detail: 'User removed: ex@company.com', actor: 'admin@company.com', timestamp: new Date(Date.now() - 3600000 * 24) },
];

export default function ActivityLogsPage() {
    const [logs, setLogs] = useState(SAMPLE_LOGS);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [filterEntity, setFilterEntity] = useState('all');

    const filtered = logs.filter(l => {
        const matchSearch = !search || l.detail.toLowerCase().includes(search.toLowerCase()) || l.actor.toLowerCase().includes(search.toLowerCase());
        const matchAction = filterAction === 'all' || l.action === filterAction;
        const matchEntity = filterEntity === 'all' || l.entityType === filterEntity;
        return matchSearch && matchAction && matchEntity;
    });

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-sm text-gray-500">Audit trail of all platform actions and events.</p>
                </div>
                <button onClick={() => setLogs([...SAMPLE_LOGS])} className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm">
                    <RefreshCw size={15} /> Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Total Events', value: logs.length, color: 'text-gray-900' },
                    { label: 'Created', value: logs.filter(l => l.action === 'created').length, color: 'text-green-600' },
                    { label: 'Updated', value: logs.filter(l => l.action === 'updated').length, color: 'text-blue-600' },
                    { label: 'Deleted', value: logs.filter(l => l.action === 'deleted').length, color: 'text-red-600' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                        <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-48">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                </div>
                <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none cursor-pointer">
                    <option value="all">All Actions</option>
                    <option value="created">Created</option>
                    <option value="updated">Updated</option>
                    <option value="deleted">Deleted</option>
                    <option value="suspended">Suspended</option>
                    <option value="login">Login</option>
                </select>
                <select value={filterEntity} onChange={e => setFilterEntity(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none cursor-pointer">
                    <option value="all">All Types</option>
                    <option value="company">Company</option>
                    <option value="user">User</option>
                    <option value="order">Order</option>
                    <option value="product">Product</option>
                    <option value="auth">Auth</option>
                    <option value="automation">Automation</option>
                </select>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead>
                        <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                            <th className="px-5 py-3">Event</th>
                            <th className="px-4 py-3">Actor</th>
                            <th className="px-4 py-3 text-center">Type</th>
                            <th className="px-4 py-3 text-center">Action</th>
                            <th className="px-5 py-3 text-right">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filtered.length === 0 ? (
                            <tr><td colSpan={5} className="py-12 text-center text-xs text-gray-400">No matching logs</td></tr>
                        ) : filtered.map(log => {
                            const Icon = ACTION_ICONS[log.entityType] || ScrollText;
                            return (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                                                <Icon size={14} className="text-gray-500" />
                                            </div>
                                            <p className="text-xs font-semibold text-gray-800">{log.detail}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <p className="text-xs text-gray-500 truncate max-w-[160px]">{log.actor}</p>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded capitalize">{log.entityType}</span>
                                    </td>
                                    <td className="px-4 py-3.5 text-center">
                                        <span className={`inline-block px-2 py-1 text-[10px] font-bold rounded capitalize ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>{log.action}</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-right text-[11px] text-gray-400 font-medium whitespace-nowrap">
                                        {format(log.timestamp, 'MMM d, h:mm a')}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
