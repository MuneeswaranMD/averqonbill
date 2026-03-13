import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2, ShoppingCart, Truck, Factory,
    Wrench, Plane, Construction, User, Utensils,
    ArrowRight, CheckCircle2, Package, Layers, Zap, LayoutDashboard
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
        <div className="bg-[#0B0F1A] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                {/* Dot Matrix Background */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}
                />

                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="text-[#DFFF1B] font-black tracking-[0.5em] uppercase text-[10px] mb-6 block italic">Verticalized Architecture</span>
                        <h1 className="text-6xl md:text-9xl font-black text-white mb-8 tracking-tighter uppercase italic leading-[0.85]">
                            BUILT FOR <br /><span className="text-[#DFFF1B]">FOUNDATIONAL</span> <br /> GROWTH
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-slate-500 font-bold leading-relaxed italic border-t border-white/5 pt-8 mt-8">
                            We've verticalized our system to support 9+ distinct industries with specialized modules that load automatically.
                        </p>
                    </motion.div>
                </div>

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#DFFF1B]/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
            </section>

            {/* Industry Grid */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {INDUSTRIES.map((ind, i) => (
                            <motion.div
                                key={ind.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: (i % 3) * 0.1 }}
                                className="group relative p-1 border border-white/5 rounded-[3.5rem] bg-[#1A1F2E]/30 backdrop-blur-xl hover:border-[#DFFF1B]/20 transition-all duration-500 overflow-hidden"
                            >
                                <div className="p-10 relative z-10">
                                    <div className="flex items-center justify-between mb-10">
                                        <div className={`w-16 h-16 rounded-[1.5rem] bg-[#DFFF1B] flex items-center justify-center text-black shadow-2xl shadow-[#DFFF1B]/10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                            <ind.icon size={30} strokeWidth={2.5} />
                                        </div>
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic group-hover:text-[#DFFF1B] transition-colors">
                                            Sector {String(i + 1).padStart(2, '0')}
                                        </div>
                                    </div>

                                    <h3 className="text-3xl font-black text-white mb-4 tracking-tight uppercase italic">{ind.name}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed mb-10 text-sm italic">{ind.desc}</p>

                                    <Link
                                        to={`/industry/${ind.id}`}
                                        className="group/link inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white hover:bg-[#DFFF1B] hover:text-black px-6 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all mb-10"
                                    >
                                        Explore Solutions <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                    </Link>

                                    <div className="space-y-4 pt-8 border-t border-white/5">
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Core Native Modules</p>
                                        <div className="flex flex-wrap gap-2">
                                            {ind.modules.map(mod => (
                                                <span key={mod} className="inline-flex items-center gap-2 px-4 py-2 bg-black/40 text-slate-400 rounded-full text-[10px] font-bold border border-white/5 group-hover:border-white/10 transition-colors">
                                                    <div className="w-1 h-1 rounded-full bg-[#DFFF1B]" /> {mod}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Background Card Decoration */}
                                <div className="absolute -bottom-10 -right-10 opacity-0 group-hover:opacity-5 transition-opacity duration-700">
                                    <ind.icon size={200} className="text-white" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Engine explanation */}
            <section className="py-40 relative">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-[#1A1F2E]/20 backdrop-blur-3xl rounded-[4rem] border border-white/5 shadow-2xl p-12 md:p-24 overflow-hidden relative group">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                            <div className="relative z-10">
                                <span className="text-[#DFFF1B] font-black tracking-[0.5em] text-[10px] uppercase mb-6 inline-block italic">Operational Intelligence</span>
                                <h2 className="text-5xl md:text-6xl font-black text-white mb-10 tracking-tighter uppercase italic leading-[0.9]">DYNAMIC <br /> INDUSTRY <br /> ENGINE v2</h2>
                                <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10 italic border-l-2 border-[#DFFF1B]/20 pl-8">
                                    Averqon is not just an ERP. It's a foundational system that adapts. When you select an industry, our engine automates the entire vertical setup.
                                </p>
                                <ul className="space-y-6">
                                    {[
                                        { t: 'Activates specialized modules', i: Layers },
                                        { t: 'Configures custom dashboard KPIs', i: LayoutDashboard },
                                        { t: 'Sets up contextual terminology', i: Zap },
                                        { t: 'Loads vertical-specific automations', i: CheckCircle2 }
                                    ].map((item, idx) => (
                                        <motion.li
                                            key={idx}
                                            initial={{ opacity: 0, x: -10 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="flex gap-4 items-center"
                                        >
                                            <div className="h-2 w-8 bg-[#DFFF1B] rounded-full shadow-[0_0_15px_rgba(223,255,27,0.4)]" />
                                            <span className="text-white font-black text-sm tracking-widest uppercase italic">{item.t}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                            </div>

                            <div className="relative">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="p-12 bg-black/40 border border-white/5 rounded-[3.5rem] shadow-3xl backdrop-blur-xl relative z-10"
                                >
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="h-4 w-1/3 bg-[#DFFF1B]/20 rounded-full" />
                                            <div className="h-2 w-2 rounded-full bg-[#DFFF1B] animate-pulse" />
                                        </div>
                                        <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-24 bg-[#DFFF1B]/5 border border-white/5 rounded-2xl" />
                                            <div className="h-24 bg-white/5 border border-white/5 rounded-2xl" />
                                        </div>
                                        <div className="h-10 w-full bg-[#DFFF1B] rounded-xl flex items-center justify-center">
                                            <div className="h-2 w-12 bg-black/20 rounded-full" />
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Background Decorative Blobs */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[#DFFF1B]/5 blur-[100px] rounded-full pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
