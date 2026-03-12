import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../lib/firestore';
import {
    Building2, ArrowRight, ShieldCheck, Phone, MapPin, FileText, User,
    Globe, CheckCircle2, ChevronRight, Loader2, Sparkles,
    ShoppingBag, Truck, Factory, Wrench, Compass, HardHat,
    Laptop2, UtensilsCrossed, ShoppingCart, LayoutGrid,
    Package, Users, CreditCard, Plus, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Industry Configuration ───────────────────────────────────────────────────
const INDUSTRIES = [
    { id: 'retail', label: 'Retail Store', icon: ShoppingBag, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', description: 'Manage products, POS & inventory' },
    { id: 'wholesale', label: 'Wholesale', icon: Truck, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', description: 'Bulk orders, suppliers & delivery' },
    { id: 'manufacturing', label: 'Manufacturing', icon: Factory, color: 'from-orange-500 to-orange-600', bg: 'bg-orange-50', text: 'text-orange-700', description: 'Production, materials & labor' },
    { id: 'service', label: 'Service Business', icon: Wrench, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-700', description: 'Appointments, staff & billing' },
    { id: 'tours', label: 'Tours & Travels', icon: Compass, color: 'from-sky-500 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-700', description: 'Packages, bookings & agents' },
    { id: 'construction', label: 'Construction', icon: HardHat, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-700', description: 'Projects, materials & labor' },
    { id: 'freelancer', label: 'Freelancer', icon: Laptop2, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50', text: 'text-pink-700', description: 'Clients, projects & invoicing' },
    { id: 'restaurant', label: 'Restaurant / Food', icon: UtensilsCrossed, color: 'from-red-500 to-red-600', bg: 'bg-red-50', text: 'text-red-700', description: 'Menu, orders & tables' },
    { id: 'ecommerce', label: 'E-commerce', icon: ShoppingCart, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', description: 'Online store, orders & shipping' },
    { id: 'custom', label: 'Custom Business', icon: LayoutGrid, color: 'from-gray-500 to-gray-600', bg: 'bg-gray-50', text: 'text-gray-700', description: 'Build your own module set' },
];

const INDUSTRY_MODULES = {
    retail: ['Dashboard', 'Products', 'Inventory', 'POS Billing', 'Customers', 'Orders', 'Invoices', 'Payments', 'Reports'],
    wholesale: ['Dashboard', 'Products', 'Bulk Orders', 'Inventory', 'Suppliers', 'Purchase Orders', 'Invoices', 'Payments', 'Delivery', 'Reports'],
    manufacturing: ['Dashboard', 'Products', 'Materials', 'Production', 'Inventory', 'Customers', 'Invoices', 'Reports'],
    service: ['Dashboard', 'Services', 'Appointments', 'Customers', 'Invoices', 'Payments', 'Staff', 'Reports'],
    tours: ['Dashboard', 'Destinations', 'Tour Packages', 'Bookings', 'Customers', 'Payments', 'Schedules', 'Agents', 'Reports'],
    construction: ['Dashboard', 'Projects', 'Clients', 'Materials', 'Labor', 'Invoices', 'Payments', 'Reports'],
    freelancer: ['Dashboard', 'Projects', 'Clients', 'Time Tracking', 'Invoices', 'Payments', 'Reports'],
    restaurant: ['Dashboard', 'Menu / Products', 'Tables', 'Orders', 'Customers', 'Payments', 'Staff', 'Reports'],
    ecommerce: ['Dashboard', 'Products', 'Inventory', 'Orders', 'Customers', 'Shipping', 'Invoices', 'Payments', 'Reports'],
    custom: ['Dashboard', 'Products', 'Customers', 'Orders', 'Invoices', 'Payments', 'Reports'],
};

const WIZARD_STEPS = {
    retail: [
        { title: 'Add First Product', desc: 'Add your products to get started', icon: Package, route: '/products' },
        { title: 'Add a Customer', desc: 'Create your first customer record', icon: Users, route: '/customers' },
        { title: 'Create an Invoice', desc: 'Generate your first invoice', icon: FileText, route: '/invoices/create' },
        { title: 'Connect Payment Method', desc: 'Set up your payment gateway', icon: CreditCard, route: '/settings' },
    ],
    wholesale: [
        { title: 'Add a Supplier', desc: 'Add your first supplier record', icon: Truck, route: '/customers' },
        { title: 'Add Products', desc: 'Set up your product catalog', icon: Package, route: '/products' },
        { title: 'Create Purchase Order', desc: 'Place your first bulk order', icon: FileText, route: '/orders/create' },
        { title: 'Setup Payments', desc: 'Configure payment methods', icon: CreditCard, route: '/settings' },
    ],
    service: [
        { title: 'Add a Service', desc: 'Define your first service offering', icon: Wrench, route: '/products' },
        { title: 'Add a Client', desc: 'Create your first client record', icon: Users, route: '/customers' },
        { title: 'Schedule Appointment', desc: 'Book your first appointment', icon: FileText, route: '/orders/create' },
        { title: 'Create Invoice', desc: 'Bill your first client', icon: CreditCard, route: '/invoices/create' },
    ],
    tours: [
        { title: 'Add a Destination', desc: 'List your first destination', icon: Compass, route: '/products' },
        { title: 'Create Tour Package', desc: 'Build your first tour package', icon: Package, route: '/products' },
        { title: 'Record a Booking', desc: 'Add your first booking', icon: Users, route: '/orders/create' },
        { title: 'Setup Payments', desc: 'Configure payment collection', icon: CreditCard, route: '/settings' },
    ],
    construction: [
        { title: 'Create a Project', desc: 'Start your first project', icon: HardHat, route: '/orders/create' },
        { title: 'Add a Client', desc: 'Create your first client', icon: Users, route: '/customers' },
        { title: 'Add Materials', desc: 'List your materials catalog', icon: Package, route: '/products' },
        { title: 'Create Invoice', desc: 'Invoice your first client', icon: CreditCard, route: '/invoices/create' },
    ],
    default: [
        { title: 'Add First Product / Service', desc: 'Set up your first item', icon: Package, route: '/products' },
        { title: 'Add a Customer', desc: 'Create your first customer', icon: Users, route: '/customers' },
        { title: 'Create First Invoice', desc: 'Generate your first invoice', icon: FileText, route: '/invoices/create' },
        { title: 'Connect Payment Method', desc: 'Set up payment collection', icon: CreditCard, route: '/settings' },
    ],
};

// ─── Shared Components ─────────────────────────────────────────────────────────
function StepIndicator({ current, total }) {
    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {Array.from({ length: total }).map((_, i) => (
                <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i < current ? 'w-6 bg-blue-600' : i === current ? 'w-10 bg-blue-600' : 'w-6 bg-gray-200'}`}
                />
            ))}
        </div>
    );
}

function PageHeader({ step, label, title, subtitle }) {
    return (
        <div className="flex flex-col items-center mb-8 text-center">
            <div className="h-16 w-16 mb-4">
                <img src="/logo.jpg" alt="Averqon Logo" className="h-full w-full object-contain mix-blend-multiply" />
            </div>
            <span className="text-xs font-semibold text-blue-600 mb-1 uppercase tracking-wider">{label}</span>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        </div>
    );
}

// ─── Step 1: Business Info ──────────────────────────────────────────────────────
function StepBusinessInfo({ onNext }) {
    const { currentUser } = useAuth();
    const [form, setForm] = useState({
        name: '',
        ownerName: currentUser?.displayName || '',
        phone: '',
        address: '',
        gstin: '',
        country: 'India',
        businessSize: '',
    });
    const [error, setError] = useState('');

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

    const handleNext = (e) => {
        e.preventDefault();
        if (!form.name.trim()) return setError('Business name is required.');
        if (!form.ownerName.trim()) return setError('Owner name is required.');
        if (!form.phone.trim()) return setError('Phone number is required.');
        setError('');
        onNext(form);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <PageHeader step={1} label="Step 1 of 3" title="Set up your workspace" subtitle="Tell us about your business" />
            <StepIndicator current={0} total={3} />
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-sm font-semibold text-gray-500 mb-6">Business Information</h2>
                {error && <div className="mb-5 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}
                <form onSubmit={handleNext} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Business Name *" placeholder="e.g. ABC Traders" icon={<Building2 size={15} />} value={form.name} onChange={set('name')} />
                        <Field label="Owner Name *" placeholder="Your full name" icon={<User size={15} />} value={form.ownerName} onChange={set('ownerName')} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Phone Number *" placeholder="+91 98765 43210" icon={<Phone size={15} />} value={form.phone} onChange={set('phone')} />
                        <Field label="Country" placeholder="India" icon={<Globe size={15} />} value={form.country} onChange={set('country')} />
                    </div>
                    <Field label="Business Address" placeholder="Street, City, State, PIN" icon={<MapPin size={15} />} value={form.address} onChange={set('address')} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="GSTIN (Optional)" placeholder="e.g. 33AAAAA0000A1Z5" icon={<FileText size={15} />} value={form.gstin} onChange={set('gstin')} />
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Business Size (Optional)</label>
                            <select
                                value={form.businessSize}
                                onChange={set('businessSize')}
                                className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                            >
                                <option value="">Select size...</option>
                                <option value="solo">Solo / Freelancer</option>
                                <option value="small">Small (2–10 employees)</option>
                                <option value="medium">Medium (11–50 employees)</option>
                                <option value="large">Large (50+ employees)</option>
                            </select>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                            Continue to Industry Selection
                            <ArrowRight size={15} />
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}

function Field({ label, placeholder, icon, value, onChange, type = 'text' }) {
    return (
        <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
            <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">{icon}</div>
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                />
            </div>
        </div>
    );
}

// ─── Step 2: Industry Selection ────────────────────────────────────────────────
function StepIndustry({ onNext, onBack }) {
    const [selected, setSelected] = useState(null);
    const [error, setError] = useState('');

    const handleNext = () => {
        if (!selected) return setError('Please select your industry to continue.');
        setError('');
        onNext(selected);
    };

    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <PageHeader step={2} label="Step 2 of 3" title="Choose your industry" subtitle="We'll auto-configure modules based on your business type" />
            <StepIndicator current={1} total={3} />

            {error && <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">{error}</div>}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {INDUSTRIES.map(({ id, label, icon: Icon, color, bg, text, description }) => (
                    <button
                        key={id}
                        onClick={() => setSelected(id)}
                        className={`group relative flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 text-center transition-all duration-200
                            ${selected === id
                                ? `border-blue-500 ${bg} shadow-md scale-[1.03]`
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                            }`}
                    >
                        {selected === id && (
                            <div className="absolute top-2 right-2">
                                <CheckCircle2 size={14} className="text-blue-600" />
                            </div>
                        )}
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${color} shadow-sm`}>
                            <Icon size={20} className="text-white" />
                        </div>
                        <span className={`text-xs font-semibold leading-tight ${selected === id ? text : 'text-gray-700'}`}>{label}</span>
                        <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">{description}</span>
                    </button>
                ))}
            </div>

            {/* Module Preview */}
            {selected && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl border border-blue-100 shadow-sm p-5 mb-6"
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Sparkles size={14} className="text-blue-600" />
                        <p className="text-xs font-semibold text-blue-700">Modules that will be activated for <span className="capitalize">{selected}</span></p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(INDUSTRY_MODULES[selected] || INDUSTRY_MODULES.custom).map(mod => (
                            <span key={mod} className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                                <CheckCircle2 size={10} />
                                {mod}
                            </span>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="flex gap-3">
                <button onClick={onBack} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all">
                    Back
                </button>
                <button onClick={handleNext} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                    Configure My Workspace
                    <ArrowRight size={15} />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Step 3: Setup Wizard ──────────────────────────────────────────────────────
function StepSetupWizard({ industry, onComplete, loading }) {
    const navigate = useNavigate();
    const steps = WIZARD_STEPS[industry] || WIZARD_STEPS.default;

    return (
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.3 }}>
            <PageHeader
                step={3} label="Step 3 of 3"
                title="Almost ready! 🎉"
                subtitle="Quick setup steps to maximize your productivity"
            />
            <StepIndicator current={2} total={3} />

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
                <div className="flex items-center gap-2 mb-5">
                    <Star size={15} className="text-amber-500" />
                    <h2 className="text-sm font-semibold text-gray-700">
                        Recommended setup for <span className="capitalize text-blue-600">{industry}</span>
                    </h2>
                </div>

                <div className="space-y-3">
                    {steps.map((step, idx) => (
                        <motion.button
                            key={idx}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.05 * idx }}
                            onClick={() => navigate(step.route)}
                            className="w-full flex items-center justify-between gap-3 p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                    <step.icon size={17} />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-semibold text-gray-800">
                                        <span className="text-blue-600 mr-1.5">Step {idx + 1}.</span>{step.title}
                                    </p>
                                    <p className="text-xs text-gray-500">{step.desc}</p>
                                </div>
                            </div>
                            <ChevronRight size={15} className="text-gray-400 group-hover:text-blue-600 transition-colors shrink-0" />
                        </motion.button>
                    ))}
                </div>
            </div>

            <button
                onClick={onComplete}
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
            >
                {loading ? (
                    <><Loader2 size={16} className="animate-spin" /> Creating your workspace...</>
                ) : (
                    <><Sparkles size={16} /> Go to My Dashboard</>
                )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-3">You can complete the setup steps anytime from your dashboard</p>
        </motion.div>
    );
}

// ─── Main Onboarding Page ──────────────────────────────────────────────────────
export default function OnboardingPage() {
    const { currentUser, refreshUserData } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(0); // 0 = biz info, 1 = industry, 2 = wizard
    const [bizData, setBizData] = useState(null);
    const [industry, setIndustry] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleBizNext = (data) => {
        setBizData(data);
        setStep(1);
    };

    const handleIndustryNext = (selectedIndustry) => {
        setIndustry(selectedIndustry);
        setStep(2);
    };

    const handleComplete = async () => {
        setLoading(true);
        setError('');
        try {
            await FirestoreService.setupNewCompany(currentUser.uid, {
                ...bizData,
                ownerName: bizData.ownerName || currentUser.displayName || bizData.name,
                ownerEmail: currentUser.email,
                industry,
                modules: INDUSTRY_MODULES[industry] || INDUSTRY_MODULES.custom,
            });
            await refreshUserData();
            window.location.href = '/';
        } catch (err) {
            console.error(err);
            setError('Failed to create your workspace. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/70 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-100/70 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-50/30 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-2xl relative z-10">
                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 text-center">
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 0 && (
                        <motion.div key="step0">
                            <StepBusinessInfo onNext={handleBizNext} />
                        </motion.div>
                    )}
                    {step === 1 && (
                        <motion.div key="step1">
                            <StepIndustry
                                onNext={handleIndustryNext}
                                onBack={() => setStep(0)}
                            />
                        </motion.div>
                    )}
                    {step === 2 && (
                        <motion.div key="step2">
                            <StepSetupWizard
                                industry={industry}
                                onComplete={handleComplete}
                                loading={loading}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
                    <ShieldCheck size={13} />
                    <p className="text-xs">Your data is encrypted and secure</p>
                </div>
            </div>
        </div>
    );
}
