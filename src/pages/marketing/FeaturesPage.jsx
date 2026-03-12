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
        <div className="bg-white">
            {/* Hero */}
            <section className="pt-24 pb-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Powerful Capabilities. <br /><span className="text-violet-600 italic">Built for Scale.</span></h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed">
                        Explore the core modules that power Averqon. Everything you need to manage and grow your small business in one place.
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {FEATURES.map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-10 rounded-[2.5rem] border border-slate-100 bg-white hover:border-violet-200 hover:shadow-2xl hover:shadow-violet-100 transition-all group"
                            >
                                <div className={`w-16 h-16 rounded-2xl ${feature.color} flex items-center justify-center mb-8 transition-transform group-hover:scale-110 duration-300`}>
                                    <feature.icon size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-slate-500 font-medium leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Integration highlight */}
            <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1">
                            <div className="relative aspect-square max-w-md mx-auto lg:mx-0">
                                <div className="absolute inset-0 bg-violet-600/20 blur-[100px] rounded-full" />
                                <div className="p-8 border-2 border-slate-800 rounded-[3rem] bg-slate-800/50 backdrop-blur-xl h-full flex flex-col items-center justify-center gap-6">
                                    <div className="flex gap-4">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl">
                                            <Zap className="text-slate-900 w-8 h-8 font-black" />
                                        </div>
                                        <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center shadow-2xl">
                                            <Database className="text-white w-8 h-8" />
                                        </div>
                                    </div>
                                    <div className="text-center font-bold text-lg opacity-80">Connected with 1,000+ Apps</div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="text-violet-400 font-black tracking-widest uppercase text-xs mb-4 inline-block">Automation & Integrations</span>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Seamlessly Integrated with <span className="text-violet-400 italic font-medium">Everything.</span></h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed mb-10">
                                Connect Averqon with n8n, Zapier, Slack, and Shopify. Post notifications to Telegram, sync orders with Excel, or trigger custom webhooks effortlessly.
                            </p>
                            <ul className="space-y-4">
                                {['Direct n8n Integration', 'REST API Access', 'Webhooks Support'].map((item) => (
                                    <li key={item} className="flex items-center gap-3 font-bold text-slate-200">
                                        <div className="h-6 w-6 rounded-full bg-violet-600 flex items-center justify-center">
                                            <CheckCircle2 size={14} className="text-white" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
