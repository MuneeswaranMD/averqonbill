import React, { useState } from 'react';
import {
    Mail, Phone, MapPin, MessageCircle,
    Send, CheckCircle2, Globe, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactPage() {
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="bg-[#0B0F1A] min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="text-[#DFFF1B] font-black tracking-[0.5em] uppercase text-[10px] mb-8 block italic">Communication Protocols v2.1</span>
                        <h1 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase italic leading-[0.85]">
                            INITIALIZE <br /><span className="text-[#DFFF1B]">CONTACT</span> <br /> LINK
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-slate-500 font-bold leading-relaxed italic mt-10">
                            Have questions about our foundational system? Our engineering team is here to help you get integrated across all business modules.
                        </p>
                    </motion.div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#DFFF1B]/5 blur-[100px] rounded-full" />
            </section>

            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
                        {/* Contact Info */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl font-black text-white mb-16 tracking-tighter uppercase italic underline decoration-[#DFFF1B]/20 decoration-8">Native Channels</h2>

                            <div className="space-y-12">
                                {[
                                    { icon: Mail, title: 'Network Support', detail: 'support@averqon.in', sub: 'Receive a response within 2 business cycles.' },
                                    { icon: Phone, title: 'Integration Inquiry', detail: '+91 999 444 2221', sub: '0900 to 1900 IST | Mon-Sat' },
                                    { icon: MessageCircle, title: 'Live Terminal', detail: 'In-app Command Center', sub: 'Instant support for validated users.' },
                                    { icon: MapPin, title: 'HQ Coordinates', detail: 'Global Tech Park, Chennai', sub: 'Physical visit requires appointment token.' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-8 group">
                                        <div className="h-16 w-16 rounded-[1.5rem] bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 group-hover:bg-[#DFFF1B] group-hover:text-black transition-all duration-500 transform group-hover:-rotate-12 shadow-2xl">
                                            <item.icon size={28} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-[#DFFF1B] mb-2 uppercase tracking-[0.3em] italic">{item.title}</h4>
                                            <p className="text-2xl font-black text-white mb-2 italic tracking-tighter">{item.detail}</p>
                                            <div className="h-px w-8 bg-white/10 group-hover:w-16 transition-all duration-500 mb-3" />
                                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="bg-[#1A1F2E]/30 backdrop-blur-3xl rounded-[4rem] border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] p-12 md:p-16 relative z-10 overflow-hidden">
                                <AnimatePresence mode="wait">
                                    {!submitted ? (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-10"
                                        >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-[#DFFF1B] uppercase tracking-[0.5em] italic">Identity Label</label>
                                                    <input required type="text" placeholder="John O'Connor" className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-[#DFFF1B] outline-none transition-all placeholder:text-slate-700 italic" />
                                                </div>
                                                <div className="space-y-4">
                                                    <label className="block text-[10px] font-black text-[#DFFF1B] uppercase tracking-[0.5em] italic">Network Address</label>
                                                    <input required type="email" placeholder="john@enterprise.com" className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-[#DFFF1B] outline-none transition-all placeholder:text-slate-700 italic" />
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-[#DFFF1B] uppercase tracking-[0.5em] italic">Transmission Topic</label>
                                                <div className="relative">
                                                    <select className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-[#DFFF1B] outline-none transition-all appearance-none italic">
                                                        <option className="bg-[#0B0F1A]">Enterprise Integration</option>
                                                        <option className="bg-[#0B0F1A]">Technical Architecture</option>
                                                        <option className="bg-[#0B0F1A]">Strategic Partnership</option>
                                                        <option className="bg-[#0B0F1A]">Infrastructure Support</option>
                                                    </select>
                                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[#DFFF1B]">
                                                        <Clock size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="block text-[10px] font-black text-[#DFFF1B] uppercase tracking-[0.5em] italic">Transmission Payload</label>
                                                <textarea required rows={5} placeholder="Describe your data volume and architectural requirements..." className="w-full px-6 py-5 bg-black/40 border border-white/5 rounded-2xl text-sm font-bold text-white focus:border-[#DFFF1B] outline-none transition-all resize-none placeholder:text-slate-700 italic"></textarea>
                                            </div>

                                            <button
                                                disabled={loading}
                                                type="submit"
                                                className="group w-full bg-[#DFFF1B] text-black py-6 rounded-2xl font-black text-xl hover:bg-white transition-all shadow-[0_0_50px_rgba(223,255,27,0.15)] active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50 uppercase italic tracking-[0.2em]"
                                            >
                                                {loading ? 'MODULATING...' : <><Send size={24} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" /> START TRANSMISSION</>}
                                            </button>
                                        </motion.form>
                                    ) : (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="py-20 text-center"
                                        >
                                            <div className="h-24 w-24 bg-[#DFFF1B]/10 text-[#DFFF1B] rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-[0_0_40px_rgba(223,255,27,0.3)] animate-pulse">
                                                <CheckCircle2 size={48} strokeWidth={3} />
                                            </div>
                                            <h3 className="text-5xl font-black text-white mb-6 tracking-tighter uppercase italic leading-tight">LINK <br /> ESTABLISHED</h3>
                                            <p className="text-slate-500 font-bold mb-10 italic max-w-sm mx-auto uppercase tracking-wider text-xs">Transmission successfully captured by our core relay team. Stand by for response within 2 cycles.</p>
                                            <button onClick={() => setSubmitted(false)} className="text-[#DFFF1B] font-black hover:text-white uppercase tracking-[0.4em] text-[10px] transition-colors">
                                                Initialize New Connection
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Background Accent In Form */}
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Globe size={150} className="text-[#DFFF1B]" />
                                </div>
                            </div>

                            {/* Outer Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[130%] h-[130%] bg-[#DFFF1B]/5 blur-[120px] rounded-full -z-10 pointer-events-none" />
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    );
}
