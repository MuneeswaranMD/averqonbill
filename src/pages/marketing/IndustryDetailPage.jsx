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
    const data = INDUSTRY_DATA[industryId] || INDUSTRY_DATA.retail; // Fallback for demo

    return (
        <div className="bg-white">
            {/* Hero */}
            <section className="relative pt-24 pb-20 bg-slate-900 text-white overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                            <div className={`h-16 w-16 ${data.color} rounded-2xl flex items-center justify-center mb-8 shadow-2xl`}>
                                <data.icon size={32} />
                            </div>
                            <span className="text-violet-400 font-black tracking-widest uppercase text-xs mb-4 inline-block italic">Vertical Solution</span>
                            <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">{data.name}<span className="text-violet-500">.</span></h1>
                            <p className="text-2xl text-slate-300 font-bold mb-8 italic">"{data.tagline}"</p>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-12 max-w-lg">
                                {data.desc}
                            </p>
                            <Link to="/login?mode=signup" className="inline-flex items-center gap-2 bg-white text-slate-900 px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                                Start Industry Trial <ArrowRight />
                            </Link>
                        </motion.div>
                        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative">
                            <img src={data.image} alt={data.name} className="w-full aspect-[4/5] object-cover rounded-[4rem] shadow-2xl border-4 border-slate-800" />
                            <div className="absolute bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-2xl text-slate-900 border border-slate-100 hidden md:block max-w-xs">
                                <div className="flex gap-4 items-center mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                                        <Zap />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest">Industry Pulse</p>
                                </div>
                                <p className="text-slate-500 text-xs font-bold leading-relaxed">
                                    Averqon automatically pre-configures 8 modules for your {data.name.toLowerCase()} workflow.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
                <div className="absolute top-0 right-0 h-full w-1/3 bg-violet-600/5 blur-[100px] rounded-full pointer-events-none" />
            </section>

            {/* Modules List */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Everything you need for {data.name}</h2>
                        <p className="max-w-xl mx-auto text-slate-500 font-medium">Industry-specific features engineered for your unique business requirements.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {data.modules.map((mod, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] border border-slate-100 bg-white hover:border-violet-200 hover:shadow-2xl transition-all group">
                                <div className="h-14 w-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-violet-600 group-hover:text-white flex items-center justify-center mb-8 transition-all">
                                    <CheckCircle2 size={24} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">{mod}</h3>
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                    Optimized workflow for high-volume {data.name.toLowerCase()} environments with real-time sync.
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Workflow Section */}
            <section className="py-24 bg-slate-50">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="bg-white rounded-[3.5rem] p-12 md:p-20 shadow-xl border border-slate-100">
                        <h2 className="text-3xl font-black text-slate-900 mb-12 text-center tracking-tight uppercase tracking-widest">Integrated Workflow</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="text-center md:col-span-1">
                                <div className="h-20 w-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 italic font-black text-xl">1</div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Sign Up</p>
                            </div>
                            <div className="hidden md:block text-slate-200 text-center"><ArrowRight size={40} className="mx-auto" /></div>
                            <div className="text-center md:col-span-1">
                                <div className="h-20 w-20 rounded-3xl bg-violet-600 text-white flex items-center justify-center mx-auto mb-4 italic font-black text-xl">2</div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Select {data.name}</p>
                            </div>
                            <div className="hidden md:block text-slate-200 text-center"><ArrowRight size={40} className="mx-auto" /></div>
                            <div className="text-center md:col-span-1">
                                <div className="h-20 w-20 rounded-3xl bg-slate-900 text-white flex items-center justify-center mx-auto mb-4 italic font-black text-xl">3</div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Auto-Load Modules</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 text-center">
                <div className="max-w-2xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight italic">Stop managing, start growing.</h2>
                    <p className="text-slate-500 font-medium mb-12">Experience the power of a verticalized SaaS build specifically for your {data.name.toLowerCase()} business.</p>
                    <Link to="/login?mode=signup" className="inline-flex items-center gap-2 bg-slate-900 text-white px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-800 transition-all hover:scale-110 active:scale-95 shadow-2xl">
                        Try it Free <ArrowRight />
                    </Link>
                </div>
            </section>
        </div>
    );
}
