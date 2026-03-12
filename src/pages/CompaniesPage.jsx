import React, { useState, useEffect } from 'react';
import {
    Building2, Search, ArrowLeft, MoreVertical, ShieldAlert,
    CreditCard, Package, Users, ShoppingCart, Activity, ArrowUpRight, CheckCircle2, XCircle, Clock, Trash2, Shield
} from 'lucide-react';
import { collection, getDocs, query, orderBy, doc, updateDoc, serverTimestamp, deleteDoc, where, getCountFromServer, addDoc, setDoc } from 'firebase/firestore';
import { db, firebaseConfig } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { Plus, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Input, Button } from '../components/ui';

const PLAN_BADGE = {
    starter: 'bg-gray-100 text-gray-600',
    growth: 'bg-blue-50 text-blue-700',
    enterprise: 'bg-purple-50 text-purple-700',
};

const PLAN_LIMITS = {
    starter: { orders: 50, label: 'Starter' },
    growth: { orders: 500, label: 'Growth' },
    enterprise: { orders: 'Unlimited', label: 'Enterprise' }
};

const STATUS_BADGE = {
    active: 'bg-green-50 text-green-700 pt-0.5',
    suspended: 'bg-red-50 text-red-700 pt-0.5',
    pending: 'bg-amber-50 text-amber-700 pt-0.5',
};

export default function CompaniesPage() {
    const { isSuperAdmin } = useAuth();
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterPlan, setFilterPlan] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');

    // Details View State
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companyStats, setCompanyStats] = useState({ users: 0, orders: 0, revenue: 0, products: 0 });
    const [companyChartData, setCompanyChartData] = useState([]);
    const [actionLoading, setActionLoading] = useState(false);

    // Create View State
    const [isCreating, setIsCreating] = useState(false);
    const [newCompany, setNewCompany] = useState({ name: '', ownerName: '', ownerEmail: '', phone: '', password: '', plan: 'starter' });
    const [createError, setCreateError] = useState('');

    useEffect(() => {
        if (isSuperAdmin) {
            loadCompanies();
        }
    }, [isSuperAdmin]);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const compSnap = await getDocs(query(collection(db, 'companies'), orderBy('createdAt', 'desc')));
            const companiesList = await Promise.all(compSnap.docs.map(async (docSnap) => {
                const data = docSnap.data();

                let userCount = 0;
                let orderCount = 0;
                try {
                    const uq = query(collection(db, 'users'), where('companyId', '==', docSnap.id));
                    const oq = query(collection(db, 'orders'), where('companyId', '==', docSnap.id));
                    const [uSnap, oSnap] = await Promise.all([getCountFromServer(uq), getCountFromServer(oq)]);
                    userCount = uSnap.data().count;
                    orderCount = oSnap.data().count;
                } catch (err) { console.error(err); }

                return {
                    id: docSnap.id,
                    ...data,
                    userCount,
                    orderCount,
                };
            }));
            setCompanies(companiesList);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const loadCompanyDetails = async (company) => {
        setSelectedCompany(company);
        setActionLoading(true);
        try {
            const usersSnap = await getDocs(query(collection(db, 'users'), where('companyId', '==', company.id)));
            const ordersSnap = await getDocs(query(collection(db, 'orders'), where('companyId', '==', company.id)));
            const productsSnap = await getDocs(query(collection(db, 'products'), where('companyId', '==', company.id)));

            const orders = ordersSnap.docs.map(d => d.data());
            const totalRevenue = orders.reduce((acc, doc) => acc + (Number(doc.totalAmount) || 0), 0);

            setCompanyStats({
                users: usersSnap.size,
                orders: ordersSnap.size,
                revenue: totalRevenue,
                products: productsSnap.size
            });

            // Build 30 Days chart
            const last30Days = Array.from({ length: 30 }).map((_, i) => subDays(new Date(), 29 - i));
            const chartData = last30Days.map(date => {
                const dayOrders = orders.filter(o => o.createdAt?.toDate && isSameDay(o.createdAt.toDate(), date));
                const dayRev = dayOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
                return { name: format(date, 'MMM dd'), orders: dayOrders.length, revenue: dayRev };
            });
            setCompanyChartData(chartData);

        } catch (e) {
            console.error("Details fetch error:", e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleAction = async (companyId, actionType, payload = null) => {
        setActionLoading(true);
        try {
            const docRef = doc(db, 'companies', companyId);
            if (actionType === 'suspend') {
                const currentStatus = companies.find(c => c.id === companyId)?.status;
                const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
                await updateDoc(docRef, { status: newStatus, updatedAt: serverTimestamp() });
                setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, status: newStatus } : c));
                if (selectedCompany?.id === companyId) setSelectedCompany(prev => ({ ...prev, status: newStatus }));
            }
            if (actionType === 'upgrade') {
                await updateDoc(docRef, { plan: payload, updatedAt: serverTimestamp() });
                setCompanies(prev => prev.map(c => c.id === companyId ? { ...c, plan: payload } : c));
                if (selectedCompany?.id === companyId) setSelectedCompany(prev => ({ ...prev, plan: payload }));
            }
            if (actionType === 'delete') {
                if (window.confirm("Are you sure? This action is destructive and removes the company context.")) {
                    await deleteDoc(docRef);
                    setCompanies(prev => prev.filter(c => c.id !== companyId));
                    setSelectedCompany(null);
                }
            }
        } catch (e) {
            console.error("Action Error:", e);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCreateCompany = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setCreateError('');

        try {
            // 1. Initialize secondary app to avoid logging out the super admin
            const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp" + Date.now());
            const secondaryAuth = getAuth(secondaryApp);

            const credential = await createUserWithEmailAndPassword(secondaryAuth, newCompany.ownerEmail, newCompany.password);
            const uid = credential.user.uid;

            // 2. Create Company
            const compRef = await addDoc(collection(db, 'companies'), {
                name: newCompany.name,
                ownerName: newCompany.ownerName,
                ownerEmail: newCompany.ownerEmail,
                phone: newCompany.phone || '',
                status: 'active',
                plan: newCompany.plan,
                ownerUid: uid,
                createdAt: serverTimestamp()
            });

            // 3. Create User Document
            await setDoc(doc(db, 'users', uid), {
                uid: uid,
                name: newCompany.ownerName,
                email: newCompany.ownerEmail,
                role: 'admin',
                companyId: compRef.id,
                createdAt: serverTimestamp()
            });

            // Clean up
            await signOut(secondaryAuth);

            setIsCreating(false);
            setNewCompany({ name: '', ownerName: '', ownerEmail: '', phone: '', password: '', plan: 'starter' });
            loadCompanies();

        } catch (err) {
            console.error("Create workspace error:", err);
            setCreateError(err.message || 'Failed to create workspace.');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredCompanies = companies.filter(c => {
        const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.ownerEmail?.toLowerCase().includes(search.toLowerCase());
        const matchPlan = filterPlan === 'all' || (c.plan || 'starter').toLowerCase() === filterPlan;
        const matchStatus = filterStatus === 'all' || c.status === filterStatus;
        return matchSearch && matchPlan && matchStatus;
    });

    if (!isSuperAdmin) return <div className="p-10 flex justify-center text-gray-400">Loading Access Check...</div>;

    if (loading) return <div className="flex justify-center p-20"><div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div></div>;

    if (isCreating) {
        return (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 pb-12">
                <button onClick={() => { setIsCreating(false); setCreateError(''); }} className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={14} className="mr-1" /> Back to Directory
                </button>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-10 max-w-3xl mx-auto">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Provision New Workspace</h2>
                    <p className="text-sm text-gray-500 mb-8 border-b border-gray-100 pb-6">Create a new business instance and owner account.</p>

                    {createError && (
                        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                            {createError}
                        </div>
                    )}

                    <form onSubmit={handleCreateCompany} className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-900">Business Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Business Name" required value={newCompany.name} onChange={e => setNewCompany({ ...newCompany, name: e.target.value })} icon={<Building2 />} placeholder="E.g. Averqon Retail" />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-500">Subscription Tier</label>
                                    <select value={newCompany.plan} onChange={e => setNewCompany({ ...newCompany, plan: e.target.value })} className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                                        <option value="starter">Starter</option>
                                        <option value="growth">Growth</option>
                                        <option value="enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-bold text-gray-900">Owner Account</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input label="Owner Name" required value={newCompany.ownerName} onChange={e => setNewCompany({ ...newCompany, ownerName: e.target.value })} icon={<UserIcon />} placeholder="Full Name" />
                                <Input label="Email Address" type="email" required value={newCompany.ownerEmail} onChange={e => setNewCompany({ ...newCompany, ownerEmail: e.target.value })} icon={<Mail />} placeholder="owner@business.com" />
                                <Input label="Temporary Password" type="password" required value={newCompany.password} onChange={e => setNewCompany({ ...newCompany, password: e.target.value })} icon={<Lock />} placeholder="Min 6 characters" />
                            </div>
                        </div>

                        <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
                            <button type="button" onClick={() => setIsCreating(false)} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">Cancel</button>
                            <Button type="submit" disabled={actionLoading} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2">
                                {actionLoading ? 'Provisioning...' : 'Provision Workspace'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }

    if (selectedCompany) {
        // --- COMPANY DETAILS PAGE ---
        const planKey = (selectedCompany.plan || 'starter').toLowerCase();

        return (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300 pb-12">
                <button onClick={() => setSelectedCompany(null)} className="flex items-center text-xs font-bold text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={14} className="mr-1" /> Back to Directory
                </button>

                {/* Company Header Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 text-2xl font-black shadow-inner border border-gray-200">
                            {selectedCompany.name?.[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{selectedCompany.name || 'Unnamed Company'}</h1>
                            <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-xs font-medium text-gray-500">ID: <span className="font-mono">{selectedCompany.id}</span></span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[selectedCompany.status] || STATUS_BADGE.pending}`}>
                                    {selectedCompany.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => handleAction(selectedCompany.id, 'suspend')}
                            disabled={actionLoading}
                            className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ${selectedCompany.status === 'active' ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-green-600 border-green-600 text-green-50 hover:bg-green-700'
                                }`}
                        >
                            <ShieldAlert size={14} />
                            {selectedCompany.status === 'active' ? 'Suspend Instance' : 'Reactivate Instance'}
                        </button>
                        <button
                            onClick={() => handleAction(selectedCompany.id, 'delete')}
                            disabled={actionLoading}
                            className="px-4 py-2 bg-white border border-gray-200 text-red-500 hover:bg-red-50 hover:border-red-200 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column (Info) */}
                    <div className="space-y-6">
                        {/* Business Info */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Business Information</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Owner Contact</p>
                                    <p className="text-sm font-semibold text-gray-800">{selectedCompany.ownerName || '—'}</p>
                                    <p className="text-xs text-gray-500">{selectedCompany.ownerEmail || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Registration Date</p>
                                    <p className="text-xs font-semibold text-gray-800">
                                        {selectedCompany.createdAt?.toDate ? selectedCompany.createdAt.toDate().toLocaleDateString() : 'Unknown'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Subscription Management */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Subscription Details</h3>

                            <div className="mb-6 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Tier</p>
                                    <span className={`inline-flex px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${PLAN_BADGE[planKey] || PLAN_BADGE.starter}`}>
                                        {PLAN_LIMITS[planKey]?.label || 'Starter'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Network Quota</p>
                                    <p className="text-sm font-black text-gray-800">{PLAN_LIMITS[planKey]?.orders} Orders/mo</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Upgrade / Downgrade Plan</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(PLAN_LIMITS).map(([key, limit]) => (
                                        <button
                                            key={key}
                                            onClick={() => handleAction(selectedCompany.id, 'upgrade', key)}
                                            disabled={key === planKey || actionLoading}
                                            className={`py-2 px-1 rounded-lg text-[10px] uppercase tracking-widest font-bold border transition-all ${key === planKey ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white border-blue-200 text-blue-600 hover:bg-blue-50 shadow-sm'
                                                }`}
                                        >
                                            {limit.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column (Metrics) */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Company Performance Insights Overview */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
                                <Users size={16} className="text-indigo-500 mb-2" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Active Users</p>
                                    <p className="text-xl font-black text-gray-900">{companyStats.users}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
                                <ShoppingCart size={16} className="text-amber-500 mb-2" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total Orders</p>
                                    <p className="text-xl font-black text-gray-900">{companyStats.orders}</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
                                <Activity size={16} className="text-green-500 mb-2" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Revenue</p>
                                    <p className="text-xl font-black text-gray-900 cursor-help" title={`₹${companyStats.revenue.toLocaleString()}`}>
                                        ₹{companyStats.revenue >= 1000 ? (companyStats.revenue / 1000).toFixed(1) + 'k' : companyStats.revenue}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between">
                                <Package size={16} className="text-purple-500 mb-2" />
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase">Products</p>
                                    <p className="text-xl font-black text-gray-900">{companyStats.products}</p>
                                </div>
                            </div>
                        </div>

                        {/* Order Trend Chart */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-bold text-gray-900">Orders Velocity (30 Days)</h3>
                                <ArrowUpRight size={16} className="text-gray-400" />
                            </div>
                            <div className="w-full">
                                <ResponsiveContainer width="100%" height={224}>
                                    <AreaChart data={companyChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                                        <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Area type="monotone" dataKey="orders" stroke="#F59E0B" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        );
    }

    // --- COMPANIES DIRECTORY TABLE ---
    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Virtual Workspaces</h1>
                    <p className="text-sm text-gray-500">Manage all businesses operating within the platform.</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors w-full sm:w-auto justify-center"
                >
                    <Plus size={16} />
                    New Workspace
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex w-full md:w-auto flex-col sm:flex-row gap-4">
                    <div className="relative w-full sm:w-72">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by company or owner..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex w-full md:w-auto items-center gap-3">
                    <select
                        value={filterPlan}
                        onChange={e => setFilterPlan(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none cursor-pointer"
                    >
                        <option value="all">Any Billing Tier</option>
                        <option value="starter">Starter</option>
                        <option value="growth">Growth</option>
                        <option value="enterprise">Enterprise</option>
                    </select>

                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        className="w-full sm:w-auto px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 outline-none cursor-pointer"
                    >
                        <option value="all">Any Status</option>
                        <option value="active">Active Nodes</option>
                        <option value="suspended">Suspended Nodes</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-100">
                                <th className="px-5 py-3">Tenant Enterprise</th>
                                <th className="px-4 py-3">Principal Owner</th>
                                <th className="px-4 py-3">Tier</th>
                                <th className="px-4 py-3 text-right">Members</th>
                                <th className="px-4 py-3 text-right">Orders</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-5 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCompanies.length === 0 ? (
                                <tr><td colSpan="7" className="px-5 py-12 text-center text-xs text-gray-400 font-medium">No valid companies matched the filter string.</td></tr>
                            ) : filteredCompanies.map((company) => (
                                <tr key={company.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                                {company.name?.[0]?.toUpperCase() || 'C'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors" onClick={() => loadCompanyDetails(company)}>
                                                    {company.name || 'Unnamed'}
                                                </p>
                                                <p className="text-[10px] uppercase font-mono tracking-tighter text-gray-400">{company.id.slice(0, 10)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-gray-800 text-xs">{company.ownerName || '—'}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{company.ownerEmail || '—'}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-widest flex w-max items-center justify-center ${PLAN_BADGE[(company.plan || 'starter').toLowerCase()] || PLAN_BADGE.starter}`}>
                                            {PLAN_LIMITS[(company.plan || 'starter').toLowerCase()]?.label || 'Starter'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-bold text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded">{company.userCount}</span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <span className="font-bold text-gray-600 font-mono bg-gray-50 px-2 py-0.5 rounded">{company.orderCount}</span>
                                    </td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[company.status] || STATUS_BADGE.pending}`}>
                                            {company.status === 'active' ? <CheckCircle2 size={12} /> : company.status === 'suspended' ? <XCircle size={12} /> : <Clock size={12} />}
                                            {company.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => loadCompanyDetails(company)}
                                                className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded cursor-pointer transition-colors"
                                                title="View Business Specs"
                                            >
                                                <ArrowUpRight size={16} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
