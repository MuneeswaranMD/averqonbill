import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import {
    ArrowRight, CheckCircle2, ShoppingCart, Truck, Factory,
    Wrench, Plane, Construction, User, Utensils, Zap, LayoutDashboard,
    Layers, Database, Smartphone, Shield, BarChart3, Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const INDUSTRY_DATA = {
    retail: {
        name: 'Retail & POS',
        icon: ShoppingCart,
        color: 'bg-blue-600',
        tagline: 'Streamline your storefront with lightning-fast POS.',
        desc: 'Automate your inventory, process sales in seconds, and track every single item across multiple stores.',
        modules: ['Intelligent Inventory', 'Cloud POS terminal', 'GST Billing', 'Customer CRM', 'Multi-Store Sync'],
        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=800'
    },
    wholesale: {
        name: 'Wholesale & Distribution',
        icon: Truck,
        color: 'bg-emerald-600',
        tagline: 'Connect your supply chain with bulk distribution tools.',
        desc: 'Manage large-scale orders, track supplier deliveries, and maintain optimal stock levels for high-volume trade.',
        modules: ['Bulk Order Management', 'Supplier Portal', 'Logistics Tracking', 'Advanced Inventory', 'Payment Recovery'],
        image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800'
    },
    manufacturing: {
        name: 'Manufacturing & Production',
        icon: Factory,
        color: 'bg-orange-600',
        tagline: 'From raw materials to finished goods—tracked.',
        desc: 'Monitor production phases, track raw material consumption, and manage complex manufacturing orders with ease.',
        modules: ['Batch Tracking', 'Raw Materials Mgmt', 'Production Workflow', 'Cost Analysis', 'Quality Control'],
        image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800'
    },
    service: {
        name: 'Service Businesses',
        icon: Wrench,
        color: 'bg-violet-600',
        tagline: 'Booking, scheduling, and billing made easy.',
        desc: 'Manage appointments, assign field staff, and generate professional invoices for your service-based business.',
        modules: ['Appointment Scheduling', 'Staff Allocation', 'Recurring Billing', 'Lead Management', 'Service Analytics'],
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=800'
    },
    tours: {
        name: 'Tours & Travels',
        icon: Plane,
        color: 'bg-sky-500',
        tagline: 'Manage bookings and itineraries like a pro.',
        desc: 'Design beautiful travel packages, manage tour guides, and track customer bookings in one centralized dashboard.',
        modules: ['Bespoke Tour Designer', 'Booking Engine', 'Inventory tracking', 'Itinerary Builder', 'Agency Accounts'],
        image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800'
    },
    construction: {
        name: 'Construction & Projects',
        icon: Construction,
        color: 'bg-slate-700',
        tagline: 'Project tracking from foundation to finish.',
        desc: 'Track site-wise materials, manage labor costs, and handle complex project billing with built-in escrow support.',
        modules: ['Project Management', 'Material Tracking', 'Labor Costing', 'Milestone Invoicing', 'Site Reports'],
        image: 'https://images.unsplash.com/photo-1504307651254-35680f3344d7?auto=format&fit=crop&q=80&w=800'
    },
    restaurant: {
        name: 'Restaurants & Food',
        icon: Utensils,
        color: 'bg-rose-600',
        tagline: 'Kitchen and table management in perfect sync.',
        desc: 'Handle table orders, manage complex menus, and track kitchen prep times with our specialized food-industry POS.',
        modules: ['Table Management', 'KDS Integration', 'Menu Engineering', 'Expiry Tracking', 'Reservation System'],
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800'
    },
    freelancer: {
        name: 'Freelancers',
        icon: User,
        color: 'bg-indigo-600',
        tagline: 'Focus on your work, we’ll handle the paperwork.',
        desc: 'Professional invoicing, time tracking, and project management for independent consultants and creative professionals.',
        modules: ['Time Tracking', 'Expense Logging', 'Client CRM', 'Automated Invoicing', 'Proposal Builder'],
        image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&q=80&w=800'
    },
    ecommerce: {
        name: 'E-commerce',
        icon: ShoppingCart,
        color: 'bg-pink-600',
        tagline: 'Sell everywhere, manage in one place.',
        desc: 'Sync stock across channels, process online orders, and manage shipping with integrated delivery partner workflows.',
        modules: ['Stock Sync', 'Order Pipeline', 'Shipping Integration', 'Customer Analytics', 'Return Management'],
        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800'
    }
};

export default function IndustryDetailPage() {
    const { industryId } = useParams();
    const data = INDUSTRY_DATA[industryId] || INDUSTRY_DATA.retail;

    return (
        <div className="bg-[#0B0F1A] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                {/* Background Grid Accent */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />

                <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div
                            initial={{ x: -30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="flex items-center gap-4 mb-8">
                                <div className={`h-16 w-16 bg-[#DFFF1B] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(223,255,27,0.2)] text-black`}>
                                    <data.icon size={32} strokeWidth={2.5} />
                                </div>
                                <div>
                                    <span className="text-[#DFFF1B] font-black tracking-[0.3em] uppercase text-[10px] block mb-1">Vertical Engine v2.0</span>
                                    <div className="h-1 w-12 bg-[#DFFF1B]/30 rounded-full" />
                                </div>
                            </div>

                            <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tighter text-white uppercase italic">
                                {data.name}<span className="text-[#DFFF1B]">.</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-slate-400 font-bold mb-10 italic leading-tight">
                                "{data.tagline}"
                            </p>

                            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12 max-w-lg border-l-2 border-white/5 pl-8">
                                {data.desc}
                            </p>

                            <Link to="/login?mode=signup" className="group inline-flex items-center gap-4 bg-[#DFFF1B] text-black px-12 py-5 rounded-full text-xl font-black hover:bg-white transition-all shadow-[0_0_50px_rgba(223,255,27,0.1)] active:scale-95">
                                Start Free Trial <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="relative"
                        >
                            <div className="relative group">
                                <img src={data.image} alt={data.name} className="w-full aspect-[4/5] object-cover rounded-[3rem] shadow-2xl border border-white/10 grayscale group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 rounded-[3rem] bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />
                            </div>

                            {/* Floating Pulse Card */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-10 -left-10 bg-[#1A1F2E]/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-2xl border border-white/10 hidden md:block max-w-xs"
                            >
                                <div className="flex gap-4 items-center mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-[#DFFF1B]/10 text-[#DFFF1B] flex items-center justify-center">
                                        <Zap size={20} className="fill-current" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white">System Pulse</p>
                                </div>
                                <p className="text-slate-400 text-xs font-bold leading-relaxed italic">
                                    Averqon foundational engine has pre-configured <span className="text-[#DFFF1B]">{data.modules.length} modules</span> for {data.name.toLowerCase()} workflows.
                                </p>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modules Section */}
            <section className="py-32 relative">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
                        <div>
                            <span className="text-[#DFFF1B] font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Core Architecture</span>
                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">Everything you need <br /> for <span className="text-[#DFFF1B]">{data.name}</span></h2>
                        </div>
                        <p className="max-w-md text-slate-500 font-medium italic">Industry-specific features engineered for unit-level tracking and high-scale operations.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {data.modules.map((mod, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[3rem] border border-white/5 bg-[#1A1F2E]/30 backdrop-blur-xl hover:border-[#DFFF1B]/20 transition-all group relative overflow-hidden"
                            >
                                <div className="h-14 w-14 rounded-2xl bg-white/5 text-slate-500 group-hover:bg-[#DFFF1B] group-hover:text-black flex items-center justify-center mb-8 transition-all duration-500">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-4 tracking-tight uppercase italic">{mod}</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 italic">
                                    Optimized workflow for high-volume {data.name.toLowerCase()} environments with cloud-native sync.
                                </p>
                                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <Shield className="text-white w-20 h-20" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-32 bg-[#0B0F1A]">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-[#1A1F2E]/20 backdrop-blur-2xl rounded-[4rem] p-12 md:p-20 border border-white/5 relative overflow-hidden">
                        <h2 className="text-xs font-black text-[#DFFF1B] mb-12 text-center tracking-[0.5em] uppercase">Integrated Deployment Flow</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-center relative z-10">
                            {[
                                { step: '01', title: 'Sign Up' },
                                { step: '02', title: `Select ${data.name}` },
                                { step: '03', title: 'Auto-Load' }
                            ].map((item, idx) => (
                                <React.Fragment key={idx}>
                                    <div className="text-center group">
                                        <div className="h-24 w-24 rounded-[2rem] bg-black border border-white/5 text-white flex items-center justify-center mx-auto mb-6 italic font-black text-2xl group-hover:border-[#DFFF1B]/50 transition-colors shadow-2xl">
                                            {item.step}
                                        </div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-[#DFFF1B]">{item.title}</h4>
                                    </div>
                                    {idx < 2 && (
                                        <div className="hidden md:flex justify-center text-slate-800">
                                            <ArrowRight size={32} />
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                        {/* Background Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#DFFF1B]/5 blur-[100px] pointer-events-none" />
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 text-center relative overflow-hidden">
                <div className="max-w-2xl mx-auto px-4 relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter uppercase italic">Stop Managing, <br /> <span className="text-[#DFFF1B]">Start Growing.</span></h2>
                    <p className="text-slate-400 font-medium text-lg mb-12 italic">Experience the power of a foundational system built specifically for your {data.name.toLowerCase()} enterprise.</p>
                    <Link to="/login?mode=signup" className="inline-flex items-center gap-3 bg-[#DFFF1B] text-black px-12 py-5 rounded-full text-xl font-black hover:bg-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_50px_rgba(223,255,27,0.2)]">
                        Initialize Trial <ArrowRight />
                    </Link>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-[#DFFF1B]/50 to-transparent" />
            </section>
        </div>
    );
}
