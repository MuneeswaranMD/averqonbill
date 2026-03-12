import React from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, CheckCircle2, Zap, LayoutDashboard, Shield,
    Globe, BarChart3, Package, Users, MessageSquare, PlayCircle
} from 'lucide-react';
import { motion } from 'framer-motion';

const INDUSTRIES = [
    { name: 'Retail', icon: '🛍️' },
    { name: 'Wholesale', icon: '🚚' },
    { name: 'Manufacturing', icon: '🏭' },
    { name: 'Service', icon: '🔧' },
    { name: 'Tours', icon: '✈️' },
    { name: 'Construction', icon: '🏗️' },
    { name: 'Restaurant', icon: '🍽️' },
    { name: 'Freelancer', icon: '💻' },
    { name: 'E-commerce', icon: '🛒' },
];

export default function LandingPage() {
    return (
        <div className="overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative pt-16 pb-24 lg:pt-32 lg:pb-40 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-8 border border-violet-100 italic">
                            <Zap size={14} className="fill-violet-700" /> Version 2.0 Now Live
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
                            One Platform<span className="text-violet-600">.</span> <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-indigo-600">Every Industry.</span>
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium mb-12 leading-relaxed">
                            Averqon is the modern operating system for small businesses. Whether you run a retail shop, a tour agency, or a construction firm — we've got you covered.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                to="/login?mode=signup"
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-5 rounded-2xl text-lg font-bold transition-all hover:bg-slate-800 hover:shadow-2xl hover:shadow-slate-200 active:scale-95 group"
                            >
                                Start Your Free Trial <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border-2 border-slate-100 text-slate-900 px-8 py-5 rounded-2xl text-lg font-bold transition-all hover:bg-slate-50 hover:border-slate-200 active:scale-95">
                                <PlayCircle className="text-violet-600" /> Watch Demo
                            </button>
                        </div>
                        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400 font-semibold">
                            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> No Credit Card Required</div>
                            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-500" /> Set up in 2 Minutes</div>
                        </div>
                    </motion.div>
                </div>

                {/* Floating Decorative Elements */}
                <div className="absolute top-1/2 left-0 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-violet-400/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-0 right-0 translate-y-1/2 translate-x-1/4 w-[500px] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full" />
            </section>

            {/* Trust Section */}
            <section className="py-12 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 italic">Trusted by 5,000+ Businesses Worldwide</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Logo Placeholders */}
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">NIKE</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter italic">RELIANCE</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter uppercase">TATA</span>
                        <span className="text-2xl font-black text-slate-900 tracking-tighter">ZOHO</span>
                    </div>
                </div>
            </section>

            {/* Industries Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl font-black text-slate-900 mb-6 tracking-tight">Tailored for Your Business</h2>
                    <p className="max-w-xl mx-auto text-slate-500 font-medium mb-16">
                        Switch to an industry-specific template and get pre-configured modules instantly.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {INDUSTRIES.map((ind) => (
                            <Link
                                key={ind.name}
                                to={`/marketing-industries`}
                                className="group p-8 rounded-3xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-violet-200 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center"
                            >
                                <div className="text-4xl mb-4 transform group-hover:scale-125 transition-transform duration-300">{ind.icon}</div>
                                <h3 className="font-bold text-slate-900">{ind.name}</h3>
                                <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mt-2 group-hover:opacity-100 opacity-0 transition-opacity">Explore <ArrowRight size={10} className="inline ml-1" /></p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <span className="inline-block text-violet-400 font-black uppercase text-xs tracking-widest mb-4">Core Capabilities</span>
                            <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight">Everything you need to <span className="text-violet-400">scale.</span></h2>
                            <div className="space-y-6">
                                {[
                                    { title: 'Smart Inventory', desc: 'Real-time stock tracking across multiple warehouses.', icon: Package },
                                    { title: 'POS & Billing', icon: BarChart3, desc: 'Accept payments and issue GST invoices in seconds.' },
                                    { title: 'Customer CRM', icon: Users, desc: 'Keep track of every customer interaction and purchase.' },
                                    { title: 'Workflow Automation', icon: Zap, desc: 'Connect with n8n to automate notifications and emails.' }
                                ].map((feat, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="h-12 w-12 rounded-2xl bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-600 transition-colors">
                                            <feat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold mb-1">{feat.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-violet-600 to-indigo-600 shadow-2xl overflow-hidden p-8 flex items-center justify-center">
                                {/* Mock Dashboard UI */}
                                <div className="w-full aspect-video bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-center">
                                        <div className="h-4 w-24 bg-white/20 rounded-full" />
                                        <div className="h-4 w-4 bg-white/20 rounded-full" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <div className="bg-white/5 rounded-2xl border border-white/5" />
                                        <div className="bg-violet-500/20 rounded-2xl border border-white/5" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-white">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-gradient-to-br from-violet-700 to-indigo-800 rounded-[3rem] p-12 md:p-20 text-center text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-5xl font-black mb-8">Ready to transform your business?</h2>
                            <p className="text-violet-100 max-w-xl mx-auto text-lg mb-12">
                                Join 5,000+ businesses growing with Averqon. No hidden fees, cancel anytime.
                            </p>
                            <Link to="/login?mode=signup" className="inline-flex items-center gap-2 bg-white text-slate-900 px-10 py-5 rounded-2xl text-xl font-black hover:bg-slate-50 transition-all hover:scale-105 active:scale-95 shadow-2xl">
                                Get Started Free <ArrowRight />
                            </Link>
                        </div>
                        {/* Background Blobs */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-violet-400 blur-[80px] rounded-full opacity-50" />
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-blue-400 blur-[80px] rounded-full opacity-50" />
                    </div>
                </div>
            </section>
        </div>
    );
}
