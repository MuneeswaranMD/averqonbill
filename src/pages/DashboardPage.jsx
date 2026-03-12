import React, { useState, useEffect, useMemo } from 'react';
import {
    TrendingUp, ShoppingCart, Users, AlertTriangle,
    Package, DollarSign, Clock, CheckCircle2,
    Compass, Calendar, MapPin, Star, Wrench, HardHat,
    Laptop2, UtensilsCrossed, Truck, ArrowUpRight, Zap, UserCheck, ExternalLink, Copy
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../lib/firestore';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Card, Badge, Button } from '../components/ui';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

// ─── Industry Meta ─────────────────────────────────────────────────────────────
const INDUSTRY_META = {
    retail: { label: 'Retail Store', icon: ShoppingCart, variant: 'primary' },
    wholesale: { label: 'Wholesale', icon: Truck, variant: 'success' },
    manufacturing: { label: 'Manufacturing', icon: Package, variant: 'warning' },
    service: { label: 'Service Business', icon: Wrench, variant: 'primary' },
    tours: { label: 'Tours & Travels', icon: Compass, variant: 'primary' },
    construction: { label: 'Construction', icon: HardHat, variant: 'warning' },
    freelancer: { label: 'Freelancer', icon: Laptop2, variant: 'primary' },
    restaurant: { label: 'Restaurant / Food', icon: UtensilsCrossed, variant: 'danger' },
    ecommerce: { label: 'E-commerce', icon: ShoppingCart, variant: 'primary' },
    custom: { label: 'Business', icon: Zap, variant: 'neutral' },
};

// ─── Industry-specific stat cards ─────────────────────────────────────────────
function getIndustryStats(industry, orders, products, customers) {
    const totalRevenue = orders.reduce((a, o) => a + Number(o.totalAmount || 0), 0);
    const lowStockItems = products.filter(p => Number(p.stock) < 10);
    const pendingOrders = orders.filter(o => o.status === 'Pending');

    const base = [
        { title: 'Total Revenue', value: `₹${fmt(totalRevenue)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', sub: 'All time' },
        { title: 'Total Customers', value: customers.length, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Registered' },
    ];

    switch (industry) {
        case 'retail':
        case 'ecommerce':
            return [
                ...base,
                { title: "Today's Orders", value: pendingOrders.length, icon: ShoppingCart, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Pending' },
                { title: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Need restock' },
            ];
        case 'wholesale':
            return [
                ...base,
                { title: 'Bulk Orders', value: orders.length, icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50', sub: 'All time' },
                { title: 'Low Stock', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Items' },
            ];
        case 'tours':
            return [
                ...base,
                { title: "Today's Bookings", value: pendingOrders.length, icon: Compass, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Confirmed' },
                { title: 'Tour Packages', value: products.length, icon: MapPin, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Active' },
            ];
        case 'service':
        case 'freelancer':
            return [
                ...base,
                { title: 'Appointments', value: orders.length, icon: Calendar, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Total' },
                { title: 'Pending Invoices', value: pendingOrders.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Awaiting payment' },
            ];
        case 'construction':
            return [
                ...base,
                { title: 'Active Projects', value: orders.filter(o => o.status !== 'Completed').length, icon: HardHat, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'In progress' },
                { title: 'Materials', value: products.length, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', sub: 'Catalog items' },
            ];
        case 'restaurant':
            return [
                ...base,
                { title: "Today's Orders", value: pendingOrders.length, icon: UtensilsCrossed, color: 'text-red-600', bg: 'bg-red-50', sub: 'Active' },
                { title: 'Menu Items', value: products.length, icon: Star, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Available' },
            ];
        default:
            return [
                ...base,
                { title: 'Total Orders', value: orders.length, icon: ShoppingCart, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'All time' },
                { title: 'Low Stock', value: lowStockItems.length, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', sub: 'Items' },
            ];
    }
}

// ─── SetupProgress banner (shown when company is new) ─────────────────────────
function SetupBanner({ industry, onDismiss }) {
    const steps = [
        '✅ Workspace Created',
        industry ? `✅ Industry: ${industry}` : '⏳ Choose Industry',
        '⏳ Add First Record',
        '⏳ Create Invoice',
    ];
    return (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
                    <Zap size={17} className="text-white" />
                </div>
                <div>
                    <p className="text-sm font-semibold text-primary-900">Setup in progress</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                        {steps.map((s, i) => (
                            <span key={i} className="text-[11px] text-primary-700 font-medium">{s}</span>
                        ))}
                    </div>
                </div>
            </div>
            <button onClick={onDismiss} className="text-xs text-primary-600 hover:text-primary-800 font-bold shrink-0 transition-colors uppercase tracking-wider">
                Dismiss
            </button>
        </div>
    );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────
export default function DashboardPage() {
    const { companyId } = useAuth();
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [staff, setStaff] = useState([]);
    const [company, setCompany] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBanner, setShowBanner] = useState(true);

    useEffect(() => {
        if (!companyId) return;
        Promise.all([
            FirestoreService.getOrders(companyId),
            FirestoreService.getProducts(companyId),
            FirestoreService.getCustomers(companyId),
            FirestoreService.getBookings(companyId),
            FirestoreService.getStaff(companyId),
            FirestoreService.getCompany(companyId),
        ])
            .then(([o, p, c, b, s, comp]) => {
                setOrders(o);
                setProducts(p);
                setCustomers(c);
                setBookings(b || []);
                setStaff(s || []);
                setCompany(comp);
            })
            .finally(() => setLoading(false));
    }, [companyId]);

    const industry = company?.industry || 'custom';
    const industryMeta = INDUSTRY_META[industry] || INDUSTRY_META.custom;
    const IndustryIcon = industryMeta.icon;

    const copyBookingLink = () => {
        const url = `${window.location.origin}/book/${companyId}`;
        navigator.clipboard.writeText(url);
        alert("Booking portal link copied!");
    };

    const stats = useMemo(() => {
        const totalRevenue = orders.reduce((a, o) => a + Number(o.totalAmount || 0), 0);
        const totalCustomers = customers.length;
        const totalBookings = bookings.length;
        const activeStaff = staff.length;

        const base = [
            { title: 'Total Revenue', value: `₹${fmt(totalRevenue)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50', sub: 'All time' },
            { title: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Registered' },
        ];

        if (industry === 'service' || industry === 'tours' || industry === 'restaurant') {
            return [
                ...base,
                { title: 'Appointments', value: totalBookings, icon: Calendar, color: 'text-primary-600', bg: 'bg-primary-50', sub: 'Bookings' },
                { title: 'Active Staff', value: activeStaff, icon: UserCheck, color: 'text-blue-600', bg: 'bg-blue-50', sub: 'Team size' },
            ];
        }

        return getIndustryStats(industry, orders, products, customers);
    }, [industry, orders, products, customers, bookings, staff]);

    const recentOrders = useMemo(() => {
        if (!orders || orders.length === 0) return [];
        return [...orders].sort((a, b) => {
            const aTime = a.createdAt?.seconds || a.createdAt?._seconds || 0;
            const bTime = b.createdAt?.seconds || b.createdAt?._seconds || 0;
            return bTime - aTime;
        }).slice(0, 5);
    }, [orders]);

    const topProducts = useMemo(() => {
        const map = {};
        orders.forEach(o => {
            if (o.products && Array.isArray(o.products)) {
                o.products.forEach(p => { map[p.name] = (map[p.name] || 0) + (p.qty || 1); });
            } else if (o.productName) {
                map[o.productName] = (map[o.productName] || 0) + (o.quantity || 1);
            }
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [orders]);

    const salesChartData = useMemo(() => {
        const last14Days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
        return last14Days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayOrders = orders.filter(o =>
                o.date === dateStr ||
                (o.createdAt && new Date(o.createdAt.seconds * 1000).toISOString().slice(0, 10) === dateStr)
            );
            return {
                name: format(day, 'dd MMM'),
                revenue: dayOrders.reduce((a, o) => a + Number(o.totalAmount || 0), 0),
                orders: dayOrders.length,
            };
        });
    }, [orders]);

    const isNewBusiness = orders.length === 0 && products.length === 0;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-10">
            {/* Setup Banner */}
            {isNewBusiness && showBanner && (
                <SetupBanner industry={industry} onDismiss={() => setShowBanner(false)} />
            )}

            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
                        <Badge variant={industryMeta.variant} className="flex items-center gap-1.5 px-3 py-1">
                            <IndustryIcon size={12} />
                            {industryMeta.label}
                        </Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                        Welcome back{company?.name ? `, ${company.name}` : ''}. Here's your business overview.
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(), 'EEEE, dd MMM yyyy')}</p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={copyBookingLink}
                            className="gap-2 h-8 text-[10px] bg-white border-gray-100 text-gray-600 hover:bg-gray-50 uppercase tracking-wider font-bold"
                        >
                            <Copy size={12} /> Copy Link
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/book/${companyId}`, '_blank')}
                            className="gap-2 h-8 text-[10px] bg-white border-gray-100 text-gray-600 hover:bg-gray-50 uppercase tracking-wider font-bold"
                        >
                            <ExternalLink size={12} /> View Portal
                        </Button>
                        {company?.plan && (
                            <Badge variant="primary" className="h-8 flex items-center px-4 uppercase tracking-widest text-[9px]">
                                {company.plan}
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="flex items-center justify-between p-5 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">{stat.title}</p>
                            <h3 className="text-2xl font-bold text-gray-900 leading-tight">{stat.value}</h3>
                            {stat.sub && <p className="text-[10px] text-gray-400 mt-1 font-medium">{stat.sub}</p>}
                        </div>
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-sm border border-black/5`}>
                            <stat.icon size={22} />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2 p-6">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">Revenue Trend</h3>
                            <p className="text-xs text-gray-400 font-medium">Last 14 days performance</p>
                        </div>
                        <div className="h-8 w-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="h-64 w-full relative min-h-[256px]">
                        <ResponsiveContainer width="100%" height="100%" debounce={1}>
                            <AreaChart data={salesChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} minTickGap={20} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8', fontWeight: 600 }} tickFormatter={v => v >= 1000 ? (v / 1000) + 'k' : v} dx={-10} />
                                <Tooltip
                                    formatter={(val, name) => [name === 'revenue' ? `₹${fmt(val)}` : val, name === 'revenue' ? 'Revenue' : 'Orders']}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 600 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4, fill: '#2563EB', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Items */}
                <Card noPad className="flex flex-col">
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-bold text-gray-900">
                                {industry === 'tours' ? 'Top Packages' : industry === 'service' ? 'Top Services' : 'Top Products'}
                            </h3>
                            <p className="text-xs text-gray-400 font-medium italic">By quantity sold</p>
                        </div>
                        <Package size={18} className="text-gray-400" />
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {topProducts.length === 0 ? (
                            <div className="p-10 text-center">
                                <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Package size={20} className="text-gray-300" />
                                </div>
                                <p className="text-xs text-gray-400 font-medium">No sales data yet.</p>
                                <Button variant="ghost" size="sm" className="mt-3 text-xs">Explore Catalog</Button>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                        <th className="text-left px-5 py-3">Item Name</th>
                                        <th className="text-right px-5 py-3">Sales</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {topProducts.map(([name, qty], idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 transition-colors group">
                                            <td className="px-5 py-3.5 font-semibold text-gray-700 text-xs truncate max-w-[150px]">
                                                <span className="text-gray-300 font-bold mr-2 group-hover:text-primary-400">0{idx + 1}</span>{name}
                                            </td>
                                            <td className="px-5 py-3.5 text-right font-bold text-gray-900 text-xs">{qty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card noPad>
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900">
                            {industry === 'tours' ? 'Recent Bookings' :
                                industry === 'service' ? 'Recent Appointments' :
                                    industry === 'construction' ? 'Recent Projects' : 'Recent Invoices'}
                        </h3>
                        <Button variant="ghost" size="sm" className="text-xs font-bold uppercase tracking-widest">View All</Button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-5 py-3">Reference</th>
                                    <th className="px-4 py-3">Client</th>
                                    <th className="px-4 py-3">Value</th>
                                    <th className="px-5 py-3 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentOrders.length === 0 ? (
                                    <tr><td colSpan="4" className="px-5 py-12 text-center text-xs text-gray-400 font-medium italic">No activity recorded yet</td></tr>
                                ) : recentOrders.map((o, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-5 py-4 font-mono text-[11px] font-bold text-gray-400">
                                            #{o.id.slice(-6).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-4 font-bold text-gray-900 text-xs">{o.customerName || 'Walk-in'}</td>
                                        <td className="px-4 py-4 font-bold text-gray-900 text-xs">₹{fmt(o.totalAmount)}</td>
                                        <td className="px-5 py-4 text-center">
                                            <Badge variant={o.status === 'Completed' ? 'success' : o.status === 'Pending' ? 'warning' : 'primary'} size="sm" className="text-[9px] uppercase tracking-widest px-2 py-0.5">
                                                {o.status || 'Pending'}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Alerts Section */}
                <Card noPad>
                    <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                        <h3 className="text-base font-bold text-gray-900">
                            {industry === 'tours' ? 'Upcoming Bookings' :
                                industry === 'construction' ? 'Critical Tasks' : 'Inventory Alerts'}
                        </h3>
                        {products.filter(p => Number(p.stock) < 10).length > 0 && <Badge variant="danger" className="animate-pulse">Action Required</Badge>}
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead>
                                <tr className="bg-gray-50/50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                    <th className="px-5 py-3">Description</th>
                                    <th className="px-4 py-3 text-right">In Stock</th>
                                    <th className="px-5 py-3 text-right">Label</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {products.filter(p => Number(p.stock) < 10).length === 0 ? (
                                    <tr>
                                        <td colSpan="3" className="px-5 py-12 text-center">
                                            <div className="h-10 w-10 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-green-100">
                                                <CheckCircle2 size={18} />
                                            </div>
                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">All systems optimal</p>
                                        </td>
                                    </tr>
                                ) : products.filter(p => Number(p.stock) < 10).slice(0, 5).map((p, idx) => (
                                    <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                                        <td className="px-5 py-4 font-bold text-gray-800 text-xs truncate max-w-[150px]">{p.name}</td>
                                        <td className="px-4 py-4 font-black text-red-600 text-xs text-right">{p.stock}</td>
                                        <td className="px-5 py-4 text-right">
                                            <Badge variant="danger" size="sm" className="text-[9px] uppercase tracking-widest">Critical</Badge>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>

            {/* Active Modules strip */}
            {company?.modules && company.modules.length > 0 && (
                <Card className="p-5 bg-gradient-to-br from-gray-50 to-white flex items-center justify-between gap-6 border-dashed border-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-primary-600">
                            <Zap size={20} />
                        </div>
                        <div>
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-0.5">Enabled Capabilities</h3>
                            <p className="text-[10px] text-gray-400 font-medium italic">Active features currently available in this workspace</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 justify-end">
                        {company.modules.map(mod => (
                            <Badge key={mod} variant="primary" className="bg-white border-primary-100 text-primary-600 shadow-sm hover:bg-primary-50 transition-all cursor-default flex items-center gap-1.5 font-bold text-[10px]">
                                <CheckCircle2 size={10} className="text-primary-400" />
                                {mod}
                            </Badge>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
