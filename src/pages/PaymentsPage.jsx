import React, { useState, useEffect } from 'react';
import {
    DollarSign, Search, Filter, ArrowUpRight, ArrowDownRight,
    Download, Plus, CheckCircle2, Clock, X, Save, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../lib/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export default function PaymentsPage() {
    const { userData } = useAuth();
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPayment, setNewPayment] = useState({
        customerName: '',
        amount: '',
        method: 'Cash',
        status: 'Completed',
        date: format(new Date(), 'yyyy-MM-dd'),
        reference: ''
    });

    useEffect(() => {
        if (userData?.companyId) {
            loadPayments();
        }
    }, [userData]);

    const loadPayments = async () => {
        try {
            const data = await FirestoreService.getAllByCompany('payments', userData.companyId);
            setPayments(data);
        } catch (error) {
            console.error("Error loading payments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        try {
            await FirestoreService.add('payments', {
                ...newPayment,
                amount: parseFloat(newPayment.amount),
                createdAt: new Date()
            }, userData.companyId);
            setIsModalOpen(false);
            loadPayments();
            setNewPayment({
                customerName: '',
                amount: '',
                method: 'Cash',
                status: 'Completed',
                date: format(new Date(), 'yyyy-MM-dd'),
                reference: ''
            });
        } catch (error) {
            console.error("Error adding payment:", error);
        }
    };

    const filteredPayments = payments.filter(p => {
        const matchesSearch = p.customerName?.toLowerCase().includes(search.toLowerCase()) ||
            p.reference?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = filterStatus === 'all' || p.status.toLowerCase() === filterStatus.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const totalReceived = payments.filter(p => p.status === 'Completed').reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalPending = payments.filter(p => p.status === 'Pending').reduce((sum, p) => sum + (p.amount || 0), 0);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments</h1>
                    <p className="text-sm font-medium text-slate-500">Track and manage all business transactions.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
                >
                    <Plus size={18} /> Record Payment
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <ArrowUpRight size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Received</p>
                            <p className="text-2xl font-black text-slate-900">₹{totalReceived.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[70%]" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Pending</p>
                            <p className="text-2xl font-black text-slate-900">₹{totalPending.toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 w-[30%]" />
                    </div>
                </div>
                <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-200 text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-2xl bg-white/10 text-white flex items-center justify-center">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-white/50 uppercase tracking-widest">Net Cashflow</p>
                            <p className="text-2xl font-black">₹{(totalReceived - totalPending).toLocaleString()}</p>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-white/40">Updated real-time from your invoice data.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-3xl border border-slate-100">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by customer or reference..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 transition-all outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="flex-1 md:w-40 px-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none appearance-none"
                    >
                        <option value="all">All Status</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                    <button className="p-3 bg-slate-50 text-slate-600 rounded-2xl hover:bg-slate-100 transition-colors">
                        <Download size={20} />
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-50/50">
                            <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Customer</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Method</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                            <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                            <th className="px-8 py-5"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {loading ? (
                            <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic">Loading payments...</td></tr>
                        ) : filteredPayments.length === 0 ? (
                            <tr><td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold italic">No payments found.</td></tr>
                        ) : filteredPayments.map((p) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-8 py-5">
                                    <p className="text-sm font-black text-slate-900">{p.customerName}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.reference || 'No Reference'}</p>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="text-sm font-black text-slate-900">₹{p.amount.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider">
                                        {p.method}
                                    </span>
                                </td>
                                <td className="px-6 py-5">
                                    <p className="text-xs font-bold text-slate-500">{p.date}</p>
                                </td>
                                <td className="px-6 py-5 text-center">
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'Completed' ? 'bg-emerald-50 text-emerald-600' :
                                            p.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                        }`}>
                                        <div className={`h-1.5 w-1.5 rounded-full ${p.status === 'Completed' ? 'bg-emerald-500' :
                                                p.status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
                                            }`} />
                                        {p.status}
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button className="p-2 text-slate-400 hover:text-slate-900 transition-colors">
                                        <Download size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Manual Payment Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Record Manual Payment</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-900">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleAddPayment} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Customer Name *</label>
                                    <input
                                        required type="text"
                                        value={newPayment.customerName}
                                        onChange={(e) => setNewPayment({ ...newPayment, customerName: e.target.value })}
                                        placeholder="e.g. Ramesh Kumar"
                                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Amount (₹) *</label>
                                        <input
                                            required type="number"
                                            value={newPayment.amount}
                                            onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Payment Method</label>
                                        <select
                                            value={newPayment.method}
                                            onChange={(e) => setNewPayment({ ...newPayment, method: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all appearance-none"
                                        >
                                            <option>Cash</option>
                                            <option>Bank Transfer</option>
                                            <option>UPI</option>
                                            <option>Card</option>
                                            <option>Cheque</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Date</label>
                                        <input
                                            type="date"
                                            value={newPayment.date}
                                            onChange={(e) => setNewPayment({ ...newPayment, date: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 italic">Reference / Invoice #</label>
                                        <input
                                            type="text"
                                            value={newPayment.reference}
                                            onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                                            placeholder="INV-2024-001"
                                            className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-slate-800 transition-all hover:shadow-2xl hover:shadow-slate-200 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Save size={20} /> Record Transaction
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
