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
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            setSubmitted(true);
        }, 1500);
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="pt-24 pb-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Let's <span className="text-violet-600">Connect.</span></h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed">
                        Have questions about our industry solutions? Our team is here to help you get started.
                    </p>
                </div>
            </section>

            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Contact Info */}
                        <div>
                            <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">Contact Information</h2>
                            <div className="space-y-10">
                                {[
                                    { icon: Mail, title: 'Email Support', detail: 'support@averqon.in', sub: 'Receive a response within 2 hours.' },
                                    { icon: Phone, title: 'Sales Inquiry', detail: '+91 999 444 2221', sub: 'Mon-Sat, 9AM to 7PM IST' },
                                    { icon: MessageCircle, title: 'Live Chat', detail: 'Available on platform', sub: 'Instant support for active users.' },
                                    { icon: MapPin, title: 'Office', detail: 'Global Tech Park, Chennai, India', sub: 'Visit us for a demo (Appointment required).' }
                                ].map((item, idx) => (
                                    <div key={idx} className="flex gap-6 group">
                                        <div className="h-14 w-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-violet-600 group-hover:text-white transition-all duration-300 transform group-hover:-rotate-6 shadow-sm">
                                            <item.icon size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-1">{item.title}</h4>
                                            <p className="text-xl font-black text-violet-600 mb-1">{item.detail}</p>
                                            <p className="text-sm font-medium text-slate-500">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="relative">
                            <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 md:p-12 relative z-10">
                                <AnimatePresence mode="wait">
                                    {!submitted ? (
                                        <motion.form
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-6"
                                        >
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 italic">Your Name</label>
                                                    <input required type="text" placeholder="John Doe" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 italic">Work Email</label>
                                                    <input required type="email" placeholder="john@company.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 italic">Subject</label>
                                                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all appearance-none">
                                                    <option>Sales Inquiry</option>
                                                    <option>Technical Support</option>
                                                    <option>Partnership</option>
                                                    <option>Job Opportunity</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 italic">How can we help?</label>
                                                <textarea required rows={4} placeholder="Tell us more about your business needs..." className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 outline-none transition-all resize-none"></textarea>
                                            </div>
                                            <button
                                                disabled={loading}
                                                type="submit"
                                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-slate-800 transition-all hover:shadow-2xl hover:shadow-slate-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {loading ? 'Sending...' : <><Send size={20} className="fill-white" /> Send Message</>}
                                            </button>
                                        </motion.form>
                                    ) : (
                                        <motion.div
                                            key="success"
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="py-12 text-center"
                                        >
                                            <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8">
                                                <CheckCircle2 size={40} />
                                            </div>
                                            <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Message Sent!</h3>
                                            <p className="text-slate-500 font-medium mb-8">Thanks for reaching out. A team member will respond to you shortly.</p>
                                            <button onClick={() => setSubmitted(false)} className="text-violet-600 font-bold hover:underline uppercase tracking-widest text-xs">
                                                Send another message
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Decorative Blob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-violet-600/5 blur-[100px] rounded-full -z-10" />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
