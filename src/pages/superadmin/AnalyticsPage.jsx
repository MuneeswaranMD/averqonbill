import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Building2, Package, Globe, Activity, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const INDUSTRY_COLORS_MAP = {
    retail: '#3B82F6', wholesale: '#10B981', manufacturing: '#F59E0B',
    service: '#8B5CF6', tours: '#06B6D4', construction: '#F97316',
    freelancer: '#EC4899', restaurant: '#EF4444', ecommerce: '#6366F1', custom: '#6B7280'
};

const MODULE_USAGE = [
    { module: 'Dashboard', count: 847 },
    { module: 'Products', count: 720 },
    { module: 'Invoices', count: 685 },
    { module: 'Customers', count: 634 },
    { module: 'Orders', count: 589 },
    { module: 'Payments', count: 521 },
    { module: 'Reports', count: 412 },
    { module: 'POS Billing', count: 287 },
    { module: 'Automation', count: 198 },
    { module: 'Inventory', count: 176 },
];

const REVENUE_TREND = [
    { month: 'Oct', revenue: 42000, businesses: 12 },
    { month: 'Nov', revenue: 68000, businesses: 18 },
    { month: 'Dec', revenue: 95000, businesses: 25 },
    { month: 'Jan', revenue: 128000, businesses: 31 },
    { month: 'Feb', revenue: 156000, businesses: 38 },
    { month: 'Mar', revenue: 189000, businesses: 46 },
];

function StatCard({ label, value, sub, icon: Icon, trend, color, bg }) {
    const isUp = trend >= 0;
    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
                    <h3 className="text-2xl font-black text-gray-900">{value}</h3>
                    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
                </div>
                <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${bg} ${color}`}>
                    <Icon size={20} />
                </div>
            </div>
            {trend !== undefined && (
                <div className={`mt-3 flex items-center gap-1 text-xs font-bold ${isUp ? 'text-green-600' : 'text-red-500'}`}>
                    {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}% vs last month
                </div>
            )}
        </div>
    );
}

export default function AnalyticsPage() {
    const [companies, setCompanies] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([getDocs(collection(db, 'companies')), getDocs(collection(db, 'users'))])
            .then(([cSnap, uSnap]) => {
                setCompanies(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
                setUsers(uSnap.docs.map(d => d.data()));
            })
            .finally(() => setLoading(false));
    }, []);

    const industryDist = useMemo(() => {
        const map = {};
        companies.forEach(c => { const ind = c.industry || 'custom'; map[ind] = (map[ind] || 0) + 1; });
        return Object.entries(map).map(([name, value]) => ({ name, value, color: INDUSTRY_COLORS_MAP[name] || '#6B7280' }));
    }, [companies]);

    const totalRevenue = 189000; // SaaS subscription revenue (simulated)

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500">Platform-wide performance insights and growth metrics.</p>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Platform Revenue" value={`₹${(totalRevenue / 1000).toFixed(0)}k`} sub="This month" icon={DollarSign} color="text-green-600" bg="bg-green-50" trend={21} />
                <StatCard label="Active Businesses" value={companies.filter(c => c.status !== 'suspended').length} sub="On platform" icon={Building2} color="text-blue-600" bg="bg-blue-50" trend={15} />
                <StatCard label="Total Users" value={users.length} sub="Across all workspaces" icon={Users} color="text-violet-600" bg="bg-violet-50" trend={8} />
                <StatCard label="Industries Active" value={new Set(companies.map(c => c.industry).filter(Boolean)).size} sub="Business types" icon={Globe} color="text-amber-600" bg="bg-amber-50" trend={0} />
            </div>

            {/* Revenue + Industry Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <div>
                            <h3 className="text-sm font-bold text-gray-900">Revenue Growth</h3>
                            <p className="text-xs text-gray-400">SaaS subscription revenue (last 6 months)</p>
                        </div>
                        <TrendingUp size={16} className="text-gray-400" />
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={REVENUE_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <defs>
                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.15} />
                                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={v => '₹' + (v / 1000) + 'k'} />
                            <Tooltip formatter={(v, name) => [name === 'revenue' ? `₹${v.toLocaleString()}` : v, name === 'revenue' ? 'Revenue' : 'Businesses']}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)', fontSize: '12px' }} />
                            <Line type="monotone" dataKey="revenue" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} />
                            <Line type="monotone" dataKey="businesses" stroke="#06B6D4" strokeWidth={2} dot={{ fill: '#06B6D4', r: 4 }} yAxisId={1} />
                            <YAxis yAxisId={1} orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Industry Distribution Pie */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Industry Distribution</h3>
                    <p className="text-xs text-gray-400 mb-4">Businesses by industry type</p>
                    {industryDist.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-xs text-gray-400">No data yet</div>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={industryDist} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                                        {industryDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="space-y-1.5 mt-3">
                                {industryDist.map(d => (
                                    <div key={d.name} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                                            <span className="text-gray-600 capitalize">{d.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-800">{d.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Module Usage + Business Growth */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Modules */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Most Used Modules</h3>
                    <p className="text-xs text-gray-400 mb-5">Usage count across all workspaces (simulated)</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={MODULE_USAGE} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                            <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                            <YAxis type="category" dataKey="module" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} width={85} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                            <Bar dataKey="count" fill="#7C3AED" radius={[0, 4, 4, 0]} maxBarSize={18} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Business Growth */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-gray-900 mb-1">Business Signups</h3>
                    <p className="text-xs text-gray-400 mb-5">New workspaces created each month</p>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={REVENUE_TREND} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                            <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: '12px' }} />
                            <Bar dataKey="businesses" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={36} name="Businesses" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
