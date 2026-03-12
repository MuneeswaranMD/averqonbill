import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar, Download, TrendingUp, Package, Users,
    ShoppingCart, ArrowUpRight, ArrowDownRight, Filter,
    FileText, PieChart as PieIcon, BarChart3, RefreshCw
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell,
    BarChart, Bar
} from 'recharts';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subDays } from 'date-fns';

const COLORS = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#6366F1'];

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function ReportsPage() {
    const { companyId } = useAuth();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);

    // Filters
    const [dateRange, setDateRange] = useState({
        start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd')
    });
    const [activeTab, setActiveTab] = useState('Overview');

    useEffect(() => {
        if (!companyId) return;
        loadData();
    }, [companyId]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [o, p, c] = await Promise.all([
                FirestoreService.getOrders(companyId),
                FirestoreService.getProducts(companyId),
                FirestoreService.getCustomers(companyId)
            ]);
            setOrders(o);
            setProducts(p);
            setCustomers(c);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // Derived Data
    const filteredOrders = useMemo(() => {
        return orders.filter(o => {
            if (!o.date) return false;
            return o.date >= dateRange.start && o.date <= dateRange.end;
        });
    }, [orders, dateRange]);

    const stats = useMemo(() => {
        const revenue = filteredOrders.reduce((a, o) => a + Number(o.totalAmount || 0), 0);
        const productsSold = filteredOrders.reduce((a, o) => a + Number(o.quantity || 0), 0);
        const avgOrderValue = filteredOrders.length ? revenue / filteredOrders.length : 0;

        return {
            revenue,
            orders: filteredOrders.length,
            customers: customers.length,
            productsSold,
            avgOrderValue
        };
    }, [filteredOrders, customers]);

    const salesTrendData = useMemo(() => {
        const days = eachDayOfInterval({
            start: new Date(dateRange.start),
            end: new Date(dateRange.end)
        });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayOrders = filteredOrders.filter(o => o.date === dateStr);
            return {
                name: format(day, 'dd MMM'),
                sales: dayOrders.reduce((a, o) => a + Number(o.totalAmount || 0), 0),
                count: dayOrders.length
            };
        });
    }, [filteredOrders, dateRange]);

    const orderStatusData = useMemo(() => {
        const counts = {};
        filteredOrders.forEach(o => {
            const s = o.status || 'Pending';
            counts[s] = (counts[s] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [filteredOrders]);

    const topProducts = useMemo(() => {
        const map = {};
        filteredOrders.forEach(o => {
            // Some orders might have structured products array
            if (o.products && Array.isArray(o.products)) {
                o.products.forEach(p => {
                    map[p.name] = (map[p.name] || 0) + (p.qty || 1);
                });
            } else if (o.productName) {
                // Legacy flat format
                map[o.productName] = (map[o.productName] || 0) + (o.quantity || 1);
            }
        });
        return Object.entries(map)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, qty]) => ({ name, qty }));
    }, [filteredOrders]);

    const paymentMethodData = useMemo(() => {
        const map = {};
        filteredOrders.forEach(o => {
            const m = o.paymentMethod || 'Other';
            map[m] = (map[m] || 0) + Number(o.totalAmount || 0);
        });
        return Object.entries(map).map(([name, value]) => ({ name, value }));
    }, [filteredOrders]);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-100 border-t-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header & Global Filters */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Analytics Report</h1>
                    <p className="text-sm text-gray-500">Business performance metrics and insights</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 px-3 border-r border-gray-100">
                        <Calendar size={14} className="text-gray-400" />
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                            className="text-xs font-medium border-none focus:ring-0 outline-none p-1 bg-transparent"
                        />
                        <span className="text-gray-300">to</span>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                            className="text-xs font-medium border-none focus:ring-0 outline-none p-1 bg-transparent"
                        />
                    </div>
                    <button onClick={loadData} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${fmt(stats.revenue)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Total Customers', value: stats.customers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Products Sold', value: stats.productsSold, icon: Package, color: 'text-amber-600', bg: 'bg-amber-50' }
                ].map((s, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between group transition-all hover:border-blue-200 hover:shadow-md">
                        <div>
                            <p className="text-xs font-semibold text-gray-500 mb-1">{s.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{s.value}</h3>
                        </div>
                        <div className={`h-11 w-11 ${s.bg} rounded-xl flex items-center justify-center ${s.color}`}>
                            <s.icon size={20} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Sales Chart */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <BarChart3 size={15} className="text-blue-600" /> Sales Trend
                        </h3>
                        <div className="flex gap-2">
                            <button className="px-3 py-1 text-[10px] font-bold bg-blue-50 text-blue-600 rounded-lg">Daily</button>
                            <button className="px-3 py-1 text-[10px] font-bold text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">Export CSV</button>
                        </div>
                    </div>
                    <div className="h-64 sm:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={1}>
                            <AreaChart data={salesTrendData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                                    minTickGap={20}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: '#94A3B8' }}
                                    tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val}`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                                    formatter={(val) => [`₹${fmt(val)}`, 'Revenue']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#3B82F6"
                                    strokeWidth={2}
                                    fillOpacity={1}
                                    fill="url(#colorSales)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Order Status Distribution */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col">
                    <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-6">
                        <PieIcon size={15} className="text-purple-600" /> Order Status
                    </h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={1}>
                                <PieChart>
                                    <Pie
                                        data={orderStatusData}
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {orderStatusData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 w-full px-4">
                            {orderStatusData.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                    <span className="text-[10px] font-semibold text-gray-500 uppercase flex-1">{entry.name}</span>
                                    <span className="text-xs font-bold text-gray-700">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <h3 className="text-sm font-bold text-gray-900">Top Performing Products</h3>
                        <Package size={14} className="text-amber-500" />
                    </div>
                    <div className="p-0 flex-1">
                        {topProducts.length === 0 ? (
                            <div className="py-12 text-center text-xs text-gray-400">No product data found</div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                        <th className="text-left px-5 py-2.5">Product Name</th>
                                        <th className="text-right px-5 py-2.5">Sold</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {topProducts.map((p, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-gray-700 truncate max-w-[150px]">{p.name}</td>
                                            <td className="px-5 py-3 text-right">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold">
                                                    {p.qty}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                {/* Inventory Overview */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <h3 className="text-sm font-bold text-gray-900">Current Stock Levels</h3>
                        <ShoppingCart size={14} className="text-green-500" />
                    </div>
                    <div className="p-0 flex-1">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-tight">
                                    <th className="text-left px-5 py-2.5">Item</th>
                                    <th className="text-right px-5 py-2.5">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.slice(0, 5).map((p, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-3 font-medium text-gray-700 truncate max-w-[150px]">{p.name}</td>
                                        <td className="px-5 py-3 text-right">
                                            <span className={`text-xs font-bold ${Number(p.stock) < 10 ? 'text-red-500' : 'text-gray-500'}`}>
                                                {p.stock} {p.unit}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {products.length > 5 && (
                            <div className="p-3 border-t border-gray-50 text-center">
                                <button className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider">View All Inventory</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Payment Methods */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                        <h3 className="text-sm font-bold text-gray-900">Revenue by Payment</h3>
                        <ArrowUpRight size={14} className="text-indigo-500" />
                    </div>
                    <div className="p-5 flex-1 space-y-4">
                        {paymentMethodData.map((item, idx) => {
                            const percent = (item.value / stats.revenue) * 100;
                            return (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-bold">
                                        <span className="text-gray-600 uppercase tracking-tight">{item.name}</span>
                                        <span className="text-gray-900">₹{fmt(item.value)}</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{
                                                width: `${percent}%`,
                                                backgroundColor: COLORS[idx % COLORS.length]
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Export Section */}
            <div className="bg-blue-600 rounded-2xl p-6 shadow-lg shadow-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center text-white border border-white/20">
                        <Download size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white leading-tight">Export Full Summary</h3>
                        <p className="text-xs text-blue-100 italic">Generate PDF or Excel reports for stakeholders</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-5 py-2.5 bg-white text-blue-600 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-2">
                        <FileText size={14} /> PDF Report
                    </button>
                    <button className="px-5 py-2.5 bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm hover:bg-blue-800 transition-colors flex items-center gap-2">
                        <Download size={14} /> Excel
                    </button>
                </div>
            </div>
        </div>
    );
}
