import React, { useState, useEffect, useMemo } from 'react';
import {
    Building2, Users, ShoppingCart, TrendingUp, DollarSign,
    Package, Activity, Globe, List, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { format, subMonths, isSameMonth } from 'date-fns';

function StatCard({ icon: Icon, label, value, color = 'blue' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        green: 'bg-green-50 text-green-600',
        purple: 'bg-purple-50 text-purple-600',
        amber: 'bg-amber-50 text-amber-700',
        indigo: 'bg-indigo-50 text-indigo-600'
    };
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 flex items-start justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
                <p className="text-xs font-bold text-gray-500 mb-1">{label}</p>
                <h3 className="text-2xl font-black text-gray-900">{value}</h3>
            </div>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
                <Icon size={20} />
            </div>
        </div>
    );
}

const PLAN_BADGE = {
    starter: 'bg-gray-100 text-gray-600 border border-gray-200',
    growth: 'bg-blue-50 text-blue-700 border border-blue-200',
    enterprise: 'bg-purple-50 text-purple-700 border border-purple-200',
};

export default function SuperAdminDashboard() {
    const { isSuperAdmin } = useAuth();
    const [stats, setStats] = useState({ companies: 0, users: 0, orders: 0, products: 0, revenue: 0 });
    const [recentCompanies, setRecentCompanies] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [companiesData, setCompaniesData] = useState([]);
    const [systemActivity, setSystemActivity] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch basic platform stats
                const compSnap = await getDocs(query(collection(db, 'companies'), orderBy('createdAt', 'desc')));
                const userSnap = await getDocs(collection(db, 'users'));
                const ordSnap = await getDocs(collection(db, 'orders'));
                const prodSnap = await getDocs(collection(db, 'products'));

                const orders = ordSnap.docs.map(d => d.data());
                const companies = compSnap.docs.map(d => ({ id: d.id, ...d.data() }));
                const users = userSnap.docs.map(d => d.data());

                const totalRevenue = orders.reduce((acc, curr) => acc + (Number(curr.totalAmount) || 0), 0);

                setStats({
                    companies: compSnap.size,
                    users: userSnap.size,
                    orders: ordSnap.size,
                    products: prodSnap.size,
                    revenue: totalRevenue
                });

                setRecentCompanies(companies.slice(0, 5));

                // Process Charts Data (Last 6 Months)
                const last6Months = Array.from({ length: 6 }).map((_, i) => subMonths(new Date(), 5 - i));

                const revChart = last6Months.map(date => {
                    const monthOrders = orders.filter(o => o.createdAt?.toDate && isSameMonth(o.createdAt.toDate(), date));
                    const monthRev = monthOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                    return { name: format(date, 'MMM'), revenue: monthRev };
                });
                setRevenueData(revChart);

                const compChart = last6Months.map(date => {
                    const monthComps = companies.filter(c => c.createdAt?.toDate && isSameMonth(c.createdAt.toDate(), date));
                    return { name: format(date, 'MMM'), count: monthComps.length };
                });
                setCompaniesData(compChart);

                // Build Activity Feed (Mix of top 5 newest companies and users and orders)
                let feed = [];
                companies.slice(0, 3).forEach(c => {
                    if (c.createdAt?.toDate) feed.push({ date: c.createdAt.toDate(), action: 'New company joined', detail: c.name || 'Unnamed' });
                });
                users.slice(0, 3).forEach(u => {
                    // Assuming users have createdAt, if not we fallback
                    if (u.createdAt?.toDate) feed.push({ date: u.createdAt.toDate(), action: 'New user added', detail: u.email });
                });
                orders.slice(0, 3).forEach(o => {
                    if (o.createdAt?.toDate) feed.push({ date: o.createdAt.toDate(), action: 'New order processed', detail: `₹${o.totalAmount} from platform` });
                });

                feed.sort((a, b) => b.date - a.date);
                setSystemActivity(feed.slice(0, 6).map(f => ({
                    time: format(f.date, 'MMM d, h:mm a'),
                    action: f.action,
                    detail: f.detail
                })));

            } catch (e) {
                console.error("Dashboard fetch error:", e);
            } finally {
                setLoading(false);
            }
        };

        if (isSuperAdmin) {
            loadData();
        }
    }, [isSuperAdmin]);

    if (!isSuperAdmin) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Spinner label="Verifying Permissions..." />
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-gray-900">Platform Overview</h1>
                <p className="text-sm text-gray-500">Real-time snapshot of platform activity and growth.</p>
            </div>

            {/* Platform Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard icon={Building2} label="Total Companies" value={stats.companies} color="blue" />
                <StatCard icon={Users} label="Active Users" value={stats.users} color="purple" />
                <StatCard icon={ShoppingCart} label="Total Orders" value={stats.orders.toLocaleString()} color="amber" />
                <StatCard icon={DollarSign} label="Platform Revenue" value={`₹${stats.revenue}`} color="green" />
                <StatCard icon={Package} label="Total Products" value={stats.products.toLocaleString()} color="indigo" />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Platform Revenue Chart */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Platform Revenue</h3>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-0.5">SaaS Subscriptions</p>
                        </div>
                        <TrendingUp size={16} className="text-gray-400" />
                    </div>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={revenueData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={v => '₹' + (v / 1000) + 'k'} />
                                <RechartsTooltip
                                    formatter={(value) => [`₹${value.toLocaleString()}`, "Revenue"]}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Companies Growth Chart */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Companies Joined</h3>
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mt-0.5">Platform Adoption Rate</p>
                        </div>
                        <Activity size={16} className="text-gray-400" />
                    </div>
                    <div className="w-full">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={companiesData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Recent Company Registrations Table */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">Recent Company Registrations</h3>
                        <Globe size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-5 py-3">Company</th>
                                    <th className="px-4 py-3">Owner</th>
                                    <th className="px-4 py-3">Plan</th>
                                    <th className="px-5 py-3 text-right">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentCompanies.length === 0 ? (
                                    <tr><td colSpan="4" className="px-5 py-8 text-center text-xs text-gray-400 font-medium">No registrations yet</td></tr>
                                ) : recentCompanies.map((comp) => (
                                    <tr key={comp.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-5 py-4 font-bold text-gray-900 text-xs">{comp.name || 'Unnamed Company'}</td>
                                        <td className="px-4 py-4 font-medium text-gray-600 text-[11px]">{comp.ownerName || comp.ownerEmail || '—'}</td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2 py-1 flex items-center justify-center w-max rounded-md text-[9px] font-bold uppercase tracking-widest ${PLAN_BADGE[(comp.plan || 'starter').toLowerCase()] || PLAN_BADGE.starter}`}>
                                                {comp.plan || 'Starter'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right text-[11px] font-medium text-gray-400">
                                            {comp.createdAt?.toDate ? comp.createdAt.toDate().toLocaleDateString() : 'Today'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* System Activity Feed */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-gray-900">System Activity</h3>
                        <List size={16} className="text-gray-400" />
                    </div>
                    <div className="p-0 overflow-y-auto max-h-[300px]">
                        <ul className="divide-y divide-gray-50">
                            {systemActivity.map((event, i) => (
                                <li key={i} className="p-5 hover:bg-gray-50/50 transition-colors flex gap-4 items-start">
                                    <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></div>
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-gray-900">{event.action}</p>
                                        <p className="text-[11px] font-medium text-gray-500 mt-0.5">{event.detail}</p>
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-400 flex-shrink-0">{event.time}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}

function Spinner({ label }) {
    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600"></div>
            {label && <p className="text-xs font-bold text-gray-400 animate-pulse">{label}</p>}
        </div>
    )
}
