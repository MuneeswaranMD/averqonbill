import React from 'react';
import {
    Package, LayoutDashboard, Users, BarChart3, Zap,
    Shield, Globe, MessageSquare, CreditCard, Layers,
    Settings, Database, Smartphone, Cloud
} from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
    {
        title: 'Smart Inventory',
        icon: Package,
        desc: 'Real-time stock management with low-stock alerts, multi-warehouse support, and barcode scanning.',
        color: 'bg-blue-50 text-blue-600',
    },
    {
        title: 'Powerful Dashboard',
        icon: LayoutDashboard,
        desc: 'Get a 360-degree view of your business with interactive charts and critical alerts.',
        color: 'bg-violet-50 text-violet-600',
    },
    {
        title: 'Customer CRM',
        icon: Users,
        desc: 'Build loyalty with detailed customer profiles, purchase history, and automated marketing.',
        color: 'bg-emerald-50 text-emerald-600',
    },
    {
        title: 'Point of Sale (POS)',
        icon: CreditCard,
        desc: 'Fast, secure and easy-to-use POS system for retail stores and restaurants.',
        color: 'bg-rose-50 text-rose-600',
    },
    {
        title: 'Advanced Analytics',
        icon: BarChart3,
        desc: 'Deep dive into your sales, revenue, and product performance with custom reports.',
        color: 'bg-amber-50 text-amber-600',
    },
    {
        title: 'Workflow Automation',
        icon: Zap,
        desc: 'Seamless n8n integration to automate your emails, SMS, and accounting flows.',
        color: 'bg-sky-50 text-sky-600',
    },
    {
        title: 'Multi-Industry Templates',
        icon: Layers,
        desc: 'Switch industries and your modules adapt automatically to your business type.',
        color: 'bg-indigo-50 text-indigo-600',
    },
    {
        title: 'Role-Based Access',
        icon: Shield,
        desc: 'Secure your data with granular permissions for staff, managers, and admins.',
        color: 'bg-slate-50 text-slate-600',
    }
];

export default function FeaturesPage() {
    return (
        <div className="bg-[#0B0F1A] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                    style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}
                />

                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[#DFFF1B] font-black tracking-[0.5em] uppercase text-[10px] mb-8 block italic">System Capabilities v4.2</span>
                        <h1 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase italic leading-[0.85]">
                            POWERFUL <br /><span className="text-[#DFFF1B]">NATIVE</span> <br /> MODULES
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-slate-500 font-bold leading-relaxed italic mt-10">
                            Explore the foundational blocks that power Averqon. Everything you need to manage and grow your enterprise in one secure hub.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="p-12 rounded-[3.5rem] border border-white/5 bg-[#1A1F2E]/20 backdrop-blur-xl hover:border-[#DFFF1B]/20 hover:shadow-2xl hover:shadow-[#DFFF1B]/5 transition-all group relative overflow-hidden"
                            >
                                <div className="relative z-10">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-[#DFFF1B] flex items-center justify-center mb-10 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 text-black shadow-xl">
                                        <feature.icon size={32} strokeWidth={2.5} />
                                    </div>
                                    <h3 className="text-3xl font-black text-white mb-6 tracking-tight uppercase italic">{feature.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed text-sm italic">
                                        {feature.desc}
                                    </p>
                                </div>

                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-5 transition-opacity duration-700">
                                    <feature.icon size={120} className="text-white" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration Section: RADOM Style Upgrade */}
            <section className="py-40 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
                        <div className="relative group">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                className="relative aspect-square max-w-md mx-auto lg:mx-0 p-1 bg-gradient-to-br from-[#DFFF1B]/20 to-transparent rounded-[4rem]"
                            >
                                <div className="relative h-full w-full bg-[#0B0F1A] rounded-[3.8rem] flex flex-col items-center justify-center gap-12 border border-white/5">
                                    {/* Central Orbit Visual */}
                                    <div className="relative h-48 w-48 flex items-center justify-center">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 border-2 border-dashed border-[#DFFF1B]/20 rounded-full"
                                        />
                                        <div className="h-24 w-24 bg-[#DFFF1B] rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(223,255,27,0.3)]">
                                            <Zap size={40} className="text-black fill-current" />
                                        </div>

                                        {/* Orbiting Icons */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                                            <Database size={20} className="text-[#DFFF1B]" />
                                        </div>
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-4 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-xl">
                                            <Cloud size={20} className="text-[#DFFF1B]" />
                                        </div>
                                    </div>

                                    <div className="text-center">
                                        <div className="text-sm font-black text-white uppercase tracking-[0.3em] mb-2 italic">Hyper-Connectivity</div>
                                        <div className="h-1 w-12 bg-[#DFFF1B] mx-auto rounded-full" />
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        <div>
                            <span className="text-[#DFFF1B] font-black tracking-[0.5em] uppercase text-[10px] mb-6 block italic">Integrations & API</span>
                            <h2 className="text-5xl md:text-7xl font-black text-white mb-10 leading-[0.9] tracking-tighter uppercase italic">SEAMLESS <br /> DATA <br /><span className="text-[#DFFF1B]">PIPELINES</span></h2>
                            <p className="text-slate-500 text-lg font-medium leading-relaxed mb-12 italic border-l-2 border-white/5 pl-8">
                                Connect Averqon with n8n, Zapier, Slack, and Shopify. Post notifications to Telegram, sync orders with Excel, or trigger custom webhooks effortlessly.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {['Direct n8n Native', 'REST API v4.0', 'Webhook Callbacks', 'Enterprise Sync'].map((item) => (
                                    <motion.div
                                        key={item}
                                        whileHover={{ x: 10 }}
                                        className="flex items-center gap-4 bg-white/5 border border-white/5 p-4 rounded-2xl"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-[#DFFF1B] shadow-[0_0_10px_rgba(223,255,27,0.5)]" />
                                        <span className="text-xs font-black text-white uppercase tracking-widest">{item}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
