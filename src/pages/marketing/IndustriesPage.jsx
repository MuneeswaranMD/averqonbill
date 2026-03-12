import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2, ShoppingCart, Truck, Factory,
    Wrench, Plane, Construction, User, Utensils,
    ArrowRight, CheckCircle2, Package, Layers, Zap
} from 'lucide-react';

const INDUSTRIES = [
    { id: 'retail', name: 'Retail Store', icon: ShoppingCart, desc: 'Real-time POS and inventory for brick & mortar shops.', modules: ['POS Billing', 'Inventory', 'Products', 'Invoices'], color: 'from-blue-500 to-cyan-500' },
    { id: 'wholesale', name: 'Wholesale', icon: Truck, desc: 'Manage bulk orders, deliveries and supplier stock.', modules: ['Bulk Orders', 'Logistics', 'Suppliers', 'Inventory'], color: 'from-emerald-500 to-green-500' },
    { id: 'manufacturing', name: 'Manufacturing', icon: Factory, desc: 'Track raw materials, production batches and orders.', modules: ['Raw Materials', 'Production', 'Inventory', 'Orders'], color: 'from-amber-500 to-orange-500' },
    { id: 'service', name: 'Service Business', icon: Wrench, desc: 'Booking, scheduling and invoicing for professionals.', modules: ['Appointments', 'Staff', 'Invoices', 'CRM'], color: 'from-violet-500 to-purple-500' },
    { id: 'tours', name: 'Tours & Travels', icon: Plane, desc: 'Packages, bookings and destination management.', modules: ['Tour Packages', 'Bookings', 'Destinations', 'Accounts'], color: 'from-sky-500 to-blue-500' },
    { id: 'construction', name: 'Construction', icon: Construction, desc: 'Project tracking, labor costs and material invoices.', modules: ['Projects', 'Materials', 'Labor', 'Escrow'], color: 'from-slate-600 to-slate-800' },
    { id: 'restaurant', name: 'Restaurant', icon: Utensils, desc: 'Table management, kitchen flow and POS billing.', modules: ['Table Orders', 'POS terminal', 'Staff', 'Inventory'], color: 'from-red-500 to-rose-500' },
    { id: 'freelancer', name: 'Freelancer', icon: User, desc: 'Simple invoicing, project tracking and payments.', modules: ['Projects', 'Time Track', 'Invoices', 'Payments'], color: 'from-indigo-500 to-blue-500' },
    { id: 'ecommerce', name: 'E-commerce', icon: ShoppingCart, desc: 'Stock sync, online orders and shipping integration.', modules: ['Stock Sync', 'Order flow', 'Customers', 'Reports'], color: 'from-pink-500 to-rose-500' },
];

export default function IndustriesMarketingPage() {
    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="pt-24 pb-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tight">Built for <span className="text-violet-400">Every Business.</span></h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-400 font-medium leading-relaxed">
                        We've verticalized our SaaS to support 9+ distinct industries with specialized modules that load automatically.
                    </p>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 grid grid-cols-10 gap-4 rotate-12">
                        {Array.from({ length: 100 }).map((_, i) => (
                            <div key={i} className="w-12 h-12 rounded-lg border border-white/20" />
                        ))}
                    </div>
                </div>
            </section>

            {/* Industry Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {INDUSTRIES.map((ind, i) => (
                            <motion.div
                                key={ind.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (i % 3) * 0.1 }}
                                className="p-1 border border-slate-100 rounded-[3rem] bg-white hover:border-violet-200 hover:shadow-2xl transition-all group overflow-hidden"
                            >
                                <div className="p-10">
                                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ind.color} flex items-center justify-center text-white mb-8 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-300`}>
                                        <ind.icon size={28} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{ind.name}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-8 text-sm">{ind.desc}</p>

                                    <Link
                                        to={`/industry/${ind.id}`}
                                        className="inline-flex items-center gap-2 text-violet-600 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all mb-8 group-hover:text-violet-700"
                                    >
                                        Explore Solutions <ArrowRight size={14} />
                                    </Link>

                                    <div className="space-y-3 pt-6 border-t border-slate-50">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Included Modules</p>
                                        <div className="flex flex-wrap gap-2">
                                            {ind.modules.map(mod => (
                                                <span key={mod} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 rounded-full text-xs font-bold border border-slate-100">
                                                    <div className="w-1 h-1 rounded-full bg-violet-600" /> {mod}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Engine explanation */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-white rounded-[3.5rem] border border-slate-100 shadow-2xl p-12 md:p-20 overflow-hidden relative">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="relative z-10">
                                <span className="text-violet-600 font-black tracking-widest text-xs uppercase mb-4 inline-block italic">Engine Technology</span>
                                <h2 className="text-4xl font-black text-slate-900 mb-8 tracking-tight leading-tight">Dynamic Industry Module Engine</h2>
                                <p className="text-slate-500 text-lg font-medium leading-relaxed mb-8">
                                    Unlike generic ERPs, Averqon adapts to you. When you sign up and select an industry, our template engine automatically:
                                </p>
                                <ul className="space-y-4">
                                    {[
                                        { t: 'Activates industry-specific modules', i: Layers },
                                        { t: 'Configures default dashboard widgets', i: LayoutDashboard },
                                        { t: 'Sets up contextual terminology (e.g., Bookings vs Orders)', i: Zap },
                                        { t: 'Loads pre-built reports and KPI trackers', i: CheckCircle2 }
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex gap-4">
                                            <div className="mt-1 h-6 w-6 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0">
                                                <item.i size={14} />
                                            </div>
                                            <span className="text-slate-800 font-bold text-sm tracking-tight">{item.t}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="hidden lg:block">
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] shadow-2xl skew-y-3 transform hover:skew-y-0 transition-transform duration-500">
                                    <div className="space-y-4 opacity-50">
                                        <div className="h-4 w-1/3 bg-white/20 rounded-full" />
                                        <div className="h-4 w-2/3 bg-white/20 rounded-full" />
                                        <div className="h-8 w-full bg-violet-500/20 rounded-xl" />
                                        <div className="h-8 w-full bg-blue-500/20 rounded-xl" />
                                        <div className="h-8 w-full bg-emerald-500/20 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
