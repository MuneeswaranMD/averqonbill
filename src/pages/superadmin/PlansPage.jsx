import React, { useState } from 'react';
import { DollarSign, Plus, Edit3, Trash2, CheckCircle2, X, Save, Star, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SEED_PLANS = [
    {
        id: 'free', name: 'Free', price: 0, currency: '₹', billing: 'forever',
        color: 'from-gray-400 to-gray-500', badge: 'bg-gray-100 text-gray-600',
        userLimit: 1, storageGB: 0.5, ordersLimit: 50, automationLimit: 0,
        modules: ['Dashboard', 'Products', 'Customers', 'Invoices'],
        features: ['1 user', '50 orders/month', '500MB storage', 'Basic modules only'],
        popular: false, status: 'active'
    },
    {
        id: 'starter', name: 'Starter', price: 499, currency: '₹', billing: '/month',
        color: 'from-blue-500 to-blue-600', badge: 'bg-blue-50 text-blue-700',
        userLimit: 3, storageGB: 5, ordersLimit: 500, automationLimit: 5,
        modules: ['Dashboard', 'Products', 'Inventory', 'Customers', 'Orders', 'Invoices', 'Payments', 'Reports'],
        features: ['3 users', '500 orders/month', '5GB storage', '5 automations', 'All core modules', 'Email support'],
        popular: false, status: 'active'
    },
    {
        id: 'business', name: 'Business', price: 1499, currency: '₹', billing: '/month',
        color: 'from-violet-500 to-purple-600', badge: 'bg-violet-50 text-violet-700',
        userLimit: 15, storageGB: 25, ordersLimit: 5000, automationLimit: 50,
        modules: ['All modules', 'POS Billing', 'CRM', 'Automation', 'Notifications', 'API Access'],
        features: ['15 users', '5000 orders/month', '25GB storage', '50 automations', 'All modules', 'Priority support', 'API access'],
        popular: true, status: 'active'
    },
    {
        id: 'enterprise', name: 'Enterprise', price: 4999, currency: '₹', billing: '/month',
        color: 'from-amber-500 to-orange-600', badge: 'bg-amber-50 text-amber-700',
        userLimit: 999, storageGB: 200, ordersLimit: -1, automationLimit: -1,
        modules: ['All modules', 'White Label', 'Custom Domain', 'Dedicated Support'],
        features: ['Unlimited users', 'Unlimited orders', '200GB storage', 'Unlimited automations', 'Dedicated server', '24/7 support', 'White label'],
        popular: false, status: 'active'
    },
];

const PLAN_ICONS = { free: Shield, starter: Zap, business: Star, enterprise: Star };

function PlanCard({ plan, onEdit, onDelete, onToggle }) {
    const Icon = PLAN_ICONS[plan.id] || Shield;
    return (
        <div className={`relative bg-white rounded-2xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${plan.popular ? 'border-violet-300' : 'border-gray-200'}`}>
            {plan.popular && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600" />
            )}
            {plan.popular && (
                <div className="absolute top-4 right-4">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-violet-600 text-white px-2.5 py-1 rounded-full">Most Popular</span>
                </div>
            )}
            <div className="p-6">
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4 shadow-sm`}>
                    <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                    <span className="text-3xl font-black text-gray-900">{plan.currency}{plan.price.toLocaleString()}</span>
                    <span className="text-sm text-gray-400 ml-1">{plan.billing}</span>
                </div>
                <div className="space-y-1.5 mb-5">
                    {plan.features.map((f, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                            <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                            {f}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-xl mb-4 text-center">
                    <div>
                        <p className="text-xs font-black text-gray-900">{plan.userLimit === 999 ? '∞' : plan.userLimit}</p>
                        <p className="text-[10px] text-gray-400">Users</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-900">{plan.storageGB}GB</p>
                        <p className="text-[10px] text-gray-400">Storage</p>
                    </div>
                    <div>
                        <p className="text-xs font-black text-gray-900">{plan.automationLimit === -1 ? '∞' : plan.automationLimit}</p>
                        <p className="text-[10px] text-gray-400">Flows</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => onEdit(plan)} className="flex-1 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                        <Edit3 size={13} /> Edit
                    </button>
                    <button onClick={() => onDelete(plan.id)} className="p-2 border border-red-100 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
}

export default function PlansPage() {
    const [plans, setPlans] = useState(SEED_PLANS);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});

    const openCreate = () => {
        setForm({ name: '', price: 0, currency: '₹', billing: '/month', color: 'from-blue-500 to-blue-600', userLimit: 5, storageGB: 10, ordersLimit: 1000, automationLimit: 10, features: [''], modules: [], popular: false, status: 'active' });
        setModal('create');
    };
    const openEdit = (plan) => { setForm({ ...plan }); setModal('edit'); };

    const save = () => {
        if (modal === 'create') setPlans(prev => [...prev, { ...form, id: 'plan_' + Date.now() }]);
        else setPlans(prev => prev.map(p => p.id === form.id ? { ...p, ...form } : p));
        setModal(null);
    };

    const remove = (id) => { if (confirm('Delete this plan?')) setPlans(prev => prev.filter(p => p.id !== id)); };

    const Field = ({ label, type = 'text', field, placeholder }) => (
        <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5">{label}</label>
            <input type={type} value={form[field] ?? ''} onChange={e => setForm(p => ({ ...p, [field]: type === 'number' ? Number(e.target.value) : e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
        </div>
    );

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Plans & Billing</h1>
                    <p className="text-sm text-gray-500">Manage SaaS subscription plans and pricing tiers.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                    <Plus size={16} /> New Plan
                </button>
            </div>

            {/* Revenue Summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {plans.map(p => (
                    <div key={p.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                        <p className="text-xs font-semibold text-gray-500 mb-1">{p.name}</p>
                        <p className="text-xl font-black text-gray-900">₹{p.price.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400">{p.billing}</p>
                    </div>
                ))}
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {plans.map(plan => (
                    <PlanCard key={plan.id} plan={plan} onEdit={openEdit} onDelete={remove} />
                ))}
            </div>

            <AnimatePresence>
                {modal && (
                    <Modal title={modal === 'create' ? 'Create Plan' : 'Edit Plan'} onClose={() => setModal(null)}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Plan Name *" field="name" placeholder="e.g. Business" />
                                <Field label="Price" type="number" field="price" placeholder="0" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="User Limit" type="number" field="userLimit" />
                                <Field label="Storage (GB)" type="number" field="storageGB" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Orders/month (-1 = Unlimited)" type="number" field="ordersLimit" />
                                <Field label="Automations (-1 = Unlimited)" type="number" field="automationLimit" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <input type="checkbox" id="popular" checked={form.popular || false} onChange={e => setForm(p => ({ ...p, popular: e.target.checked }))} className="w-4 h-4 accent-violet-600" />
                                <label htmlFor="popular" className="text-sm font-semibold text-gray-700">Mark as Most Popular</label>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button onClick={save} className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2">
                                    <Save size={14} />{modal === 'create' ? 'Create Plan' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
