import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight, CheckCircle2, Zap, LayoutDashboard, Shield,
    Globe, BarChart3, Package, Users, MessageSquare, PlayCircle, 
    Cloud, Smartphone, Database, Layers, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INDUSTRIES = [
    { id: 'retail', name: 'Retail', icon: '🛍️', tag: 'Fast' },
    { id: 'wholesale', name: 'Wholesale', icon: '🚚', tag: 'Native' },
    { id: 'manufacturing', name: 'Factory', icon: '🏭', tag: 'Batch' },
    { id: 'service', name: 'Service', icon: '🔧', tag: 'Scale' },
    { id: 'restaurant', name: 'Food', icon: '🍽️', tag: 'POS' },
];

const PARTNERS = [
    { name: 'Algorand', icon: Globe },
    { name: 'Immutable', icon: Layers },
    { name: 'Polygon', icon: Zap },
    { name: 'BNB Chain', icon: Database },
    { name: 'Solana', icon: Cloud },
    { name: 'Tezos', icon: Smartphone },
];

export default function LandingPage() {
    const [activeFeature, setActiveFeature] = useState('fast');

    return (
        <div className="bg-[#0B0F1A] min-h-screen text-white selection:bg-[#DFFF1B] selection:text-black">
            {/* Ambient Background Glows */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#DFFF1B]/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[120px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/5 blur-[100px] rounded-full" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-40 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-xl"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-[#DFFF1B]" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Next Gen Enterprise v4.0</span>
                        </motion.div>

                        <motion.h1 
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.9] mb-8"
                        >
                            DISCOVER YOUR <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-slate-500">SYSTEM FLOW</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium mb-12 italic"
                        >
                            The foundational system for automating and protecting <br className="hidden md:block" />
                            large volumes of business intelligence.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6"
                        >
                            <Link to="/login?mode=signup" className="group relative px-10 py-5 bg-[#DFFF1B] text-black rounded-full font-black text-lg overflow-hidden transition-all hover:scale-105 active:scale-95">
                                <span className="relative z-10 flex items-center gap-2">Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                            </Link>
                            <Link to="/marketing-features" className="flex items-center gap-3 text-white font-black uppercase tracking-widest text-xs hover:text-[#DFFF1B] transition-colors">
                                <div className="h-10 w-10 rounded-full border border-white/20 flex items-center justify-center">
                                    <PlayCircle size={18} />
                                </div>
                                Watch System Demo
                            </Link>
                        </motion.div>
                    </div>

                    {/* Floating Device Visual */}
                    <div className="relative mt-24 lg:mt-32 max-w-5xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 100 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                            className="relative"
                        >
                            {/* The Phone Face */}
                            <div className="relative z-20 aspect-[16/9] lg:aspect-[21/9] bg-[#0B0F1A] rounded-[3rem] border border-white/5 shadow-[0_0_100px_rgba(223,255,27,0.05)] overflow-hidden group">
                                <img 
                                    src="/hero_3d_illustration_1773411693050.png" 
                                    alt="System Interface" 
                                    className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-1000"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0F1A] via-transparent to-transparent opacity-60" />
                            </div>

                            {/* Floating Icons Style from Image */}
                            <div className="absolute -top-10 -left-10 z-30 animate-bounce transition-all duration-1000" style={{ animationDuration: '3s' }}>
                                <div className="p-5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl">
                                    <Package size={32} className="text-[#DFFF1B]" />
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 z-30 animate-bounce transition-all duration-1000" style={{ animationDuration: '4s', animationDelay: '0.5s' }}>
                                <div className="p-6 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-2xl">
                                    <Zap size={40} className="text-purple-400" />
                                </div>
                            </div>
                            <div className="absolute top-[20%] -right-12 z-10 animate-pulse">
                                <div className="p-4 bg-indigo-600/20 backdrop-blur-3xl border border-indigo-500/20 rounded-2xl">
                                    <BarChart3 size={24} className="text-indigo-400" />
                                </div>
                            </div>
                        </motion.div>
                        
                        {/* Glow Behind */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#DFFF1B]/10 blur-[150px] -z-10 rounded-full" />
                    </div>
                </div>
            </section>

            {/* Tabs Feature Section (Style inspired by image) */}
            <section className="py-24 lg:py-40 border-t border-white/5 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div>
                            {/* Feature Navigation */}
                            <div className="flex flex-col gap-6 mb-12">
                                {[
                                    { id: 'fast', title: 'Fast', desc: 'Execute transactions at sub-second latency with our proprietary engine.', icon: Zap },
                                    { id: 'indepth', title: 'In-depth', desc: 'Granular analytics for every unit movement in your supply chain.', icon: BarChart3 },
                                    { id: 'mobile', title: 'Mobile', desc: 'Manage your entire enterprise from your pocket with native apps.', icon: Smartphone }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveFeature(tab.id)}
                                        className={`text-left p-8 rounded-[2.5rem] transition-all duration-500 border group ${
                                            activeFeature === tab.id 
                                            ? 'bg-white/5 border-white/20 shadow-2xl' 
                                            : 'bg-transparent border-transparent grayscale hover:grayscale-0'
                                        }`}
                                    >
                                        <div className="flex items-center gap-6">
                                            <div className={`h-14 w-14 rounded-2xl flex items-center justify-center transition-colors ${
                                                activeFeature === tab.id ? 'bg-[#DFFF1B] text-black' : 'bg-white/5 text-slate-500'
                                            }`}>
                                                <tab.icon size={24} />
                                            </div>
                                            <div>
                                                <h3 className={`text-2xl font-black uppercase italic ${activeFeature === tab.id ? 'text-white' : 'text-slate-500'}`}>{tab.title}</h3>
                                                <p className={`text-sm mt-2 font-medium ${activeFeature === tab.id ? 'text-slate-400' : 'text-slate-600 group-hover:text-slate-500'}`}>{tab.desc}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeFeature}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="relative aspect-[9/16] max-w-[320px] mx-auto"
                                >
                                    <div className="absolute inset-0 bg-indigo-600/20 blur-[80px] rounded-full" />
                                    <div className="relative h-full w-full bg-[#0B0F1A] border-[8px] border-white/5 rounded-[3.5rem] overflow-hidden shadow-3xl">
                                        <div className="p-8">
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="h-4 w-4 rounded-full bg-white/20" />
                                                <div className="h-1 w-12 bg-white/10 rounded-full" />
                                            </div>
                                            <div className="space-y-6">
                                                <div className="h-40 bg-white/5 rounded-3xl animate-pulse" />
                                                <div className="h-12 w-full bg-[#DFFF1B]/10 border border-[#DFFF1B]/20 rounded-2xl" />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="h-24 bg-white/5 rounded-2xl" />
                                                    <div className="h-24 bg-white/5 rounded-2xl" />
                                                </div>
                                                <div className="h-32 w-full bg-white/5 rounded-3xl" />
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Floating Indicator */}
                                    <motion.div 
                                        animate={{ y: [0, -10, 0] }}
                                        transition={{ duration: 4, repeat: Infinity }}
                                        className="absolute -right-10 top-1/4 p-4 bg-[#DFFF1B] text-black rounded-2xl shadow-2xl font-black text-[10px] uppercase tracking-widest italic"
                                    >
                                        Live Pulse
                                    </motion.div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Cards Style from Image (Hackathon Cards) */}
            <section className="py-24 bg-white/0">
                <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
                    <div className="flex justify-between items-end w-full mb-16 px-4">
                        <div className="max-w-xl text-left">
                            <span className="text-purple-500 font-black tracking-[0.5em] text-[10px] uppercase mb-4 block">Vertical Engines</span>
                            <h2 className="text-5xl font-black tracking-tighter uppercase italic">Ready for <br /> <span className="text-slate-500">Deployment</span></h2>
                        </div>
                        <div className="hidden md:flex gap-4">
                            <div className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-xs font-black uppercase tracking-widest">Industries</div>
                            <div className="px-6 py-3 bg-white border border-white text-black rounded-full text-xs font-black uppercase tracking-widest">View All</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                        {INDUSTRIES.map((ind, i) => (
                            <motion.div
                                key={ind.id}
                                whileHover={{ y: -10 }}
                                className="group relative bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden backdrop-blur-xl transition-all hover:border-[#DFFF1B]/20"
                            >
                                {/* Top Image/Graphic Area */}
                                <div className="h-64 bg-black/40 relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-transparent" />
                                    <div className="absolute inset-0 flex items-center justify-center text-7xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">{ind.icon}</div>
                                    
                                    {/* Glass Badge */}
                                    <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-[#DFFF1B] animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">{ind.tag} Native</span>
                                    </div>
                                </div>

                                <div className="p-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-3xl font-black tracking-tighter uppercase italic mb-1">{ind.name} v2</h3>
                                            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest italic">Global Standard</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] font-black text-[#DFFF1B] uppercase tracking-widest mb-1 italic">Setup Cost</div>
                                            <div className="text-2xl font-black tracking-tighter italic">₹0.00</div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 mb-8">
                                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">Inventory</div>
                                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">Billing</div>
                                        <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400">+4 more</div>
                                    </div>

                                    <Link to={`/marketing-industries`} className="flex items-center justify-center w-full py-5 bg-[#DFFF1B] text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] transform group-hover:translate-y-[-5px] transition-all shadow-xl shadow-black/20 active:translate-y-0">
                                        Initialize Workspace
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners Section Grid Style from Image */}
            <section className="py-24 border-y border-white/5 bg-black/50 overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="text-slate-600 font-black tracking-[0.5em] text-[10px] uppercase block mb-4 italic">Operational Hub</span>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white/80">Our Strategic Partners</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {PARTNERS.map((partner) => (
                            <motion.div
                                key={partner.name}
                                whileHover={{ scale: 1.05, border: '1px solid rgba(255,255,255,0.2)' }}
                                className="h-32 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-3 backdrop-blur-xl group cursor-pointer transition-all"
                            >
                                <partner.icon size={24} className="text-slate-500 group-hover:text-[#DFFF1B] transition-colors" />
                                <span className="text-[11px] font-black uppercase tracking-widest text-slate-600 group-hover:text-white transition-colors">{partner.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials Style from Image */}
            <section className="py-40 relative">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] uppercase italic mb-10">
                                THERE'S NO <br />
                                BETTER WAY <br />
                                <span className="text-[#DFFF1B]">TO SCALE.</span>
                            </h2>
                            <p className="text-xl text-slate-400 font-bold leading-relaxed mb-12 italic border-l-2 border-indigo-500/30 pl-8">
                                That's why we've assembled the world's best tech <br /> stack to help you find your path from startup to <br /> enterprise. No friction, just results.
                            </p>
                            <Link to="/contact" className="px-10 py-5 bg-white text-black rounded-full font-black text-sm uppercase tracking-widest hover:bg-[#DFFF1B] transition-all">
                                Consult Engineering
                            </Link>
                        </div>

                        <div className="lg:w-1/2 w-full space-y-8">
                            {[1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 50 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="p-10 bg-white/5 border border-white/10 rounded-[3.5rem] backdrop-blur-3xl flex gap-8 items-start relative group"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Globe size={100} />
                                    </div>
                                    <div className="h-16 w-16 rounded-3xl bg-slate-800 overflow-hidden flex-shrink-0 shadow-2xl">
                                        <img src={`https://i.pravatar.cc/100?u=${i + 20}`} alt="user" className="w-full h-full object-cover grayscale" />
                                    </div>
                                    <div>
                                        <div className="flex gap-1 text-[#DFFF1B] mb-6">
                                            {[...Array(5)].map((_, i) => <Zap key={i} size={10} className="fill-current" />)}
                                        </div>
                                        <p className="text-lg text-white font-bold italic leading-relaxed mb-6">
                                            "Averqon transformed how we track global units. The switch to automate our entire inventory was the best decision of the cycle."
                                        </p>
                                        <div>
                                            <h4 className="text-sm font-black uppercase italic tracking-widest">James O'Brien</h4>
                                            <p className="text-[10px] font-black text-[#DFFF1B] uppercase tracking-[0.3em] mt-1">Founding Member, Nexus</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Final Download/CTA Section inspired by Image Footer */}
            <section className="py-40 relative">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-[#0B0F1A] border border-white/5 rounded-[5rem] p-16 md:p-32 text-center relative overflow-hidden group">
                        <div className="relative z-10 select-none">
                            <h2 className="text-5xl md:text-[6rem] font-black tracking-tighter uppercase mb-6 italic leading-none">INITIALIZE <br /> <span className="text-[#DFFF1B]">PHASE 1</span></h2>
                            <p className="text-slate-400 font-bold text-xl mb-12 italic max-w-xl mx-auto">
                                Join 5,000+ businesses running on Averqon's foundational architecture today.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link to="/login?mode=signup" className="px-12 py-6 bg-white text-black rounded-full font-black text-xl hover:bg-[#DFFF1B] transition-all flex items-center gap-3">
                                    Launch Hub <ArrowRight size={24} />
                                </Link>
                                <div className="flex gap-4">
                                    <div className="h-14 w-40 bg-black rounded-2xl flex items-center justify-center gap-3 border border-white/10 group-hover:border-white/20 transition-all cursor-pointer">
                                        <Smartphone size={20} />
                                        <div className="text-left">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Get it on</p>
                                            <p className="text-xs font-black uppercase tracking-widest">App Store</p>
                                        </div>
                                    </div>
                                    <div className="h-14 w-40 bg-black rounded-2xl flex items-center justify-center gap-3 border border-white/10 group-hover:border-white/20 transition-all cursor-pointer">
                                        <Database size={20} />
                                        <div className="text-left">
                                            <p className="text-[8px] font-black uppercase tracking-widest opacity-40">Get it on</p>
                                            <p className="text-xs font-black uppercase tracking-widest">Google Play</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Floating System Visual in CTA */}
                        <motion.div 
                            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                            transition={{ duration: 6, repeat: Infinity }}
                            className="absolute -bottom-20 -left-20 h-80 w-80 bg-indigo-500/10 rounded-full blur-[80px]" 
                        />
                        <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                             <Zap size={400} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
