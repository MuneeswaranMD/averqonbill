import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Zap, Star, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PLANS = [
    {
        name: 'Free',
        price: '0',
        desc: 'For small side projects and freelancers just starting out.',
        features: ['1 User Account', '50 Orders / month', '500MB Storage', 'Basic Invoicing', 'Customer CRM'],
        cta: 'Get Started',
        color: 'slate',
    },
    {
        name: 'Starter',
        price: '499',
        desc: 'Perfect for small shops and growing service businesses.',
        features: ['3 User Accounts', '500 Orders / month', '5GB Storage', 'Inventory Management', 'POS Billing', 'Standard Reports', 'Email Support'],
        cta: 'Try Starter',
        color: 'blue',
    },
    {
        name: 'Business',
        price: '1499',
        desc: 'The best value with full automation and advanced modules.',
        features: ['15 User Accounts', '5,000 Orders / month', '25GB Storage', 'Workflow Automation', 'API Access', 'Multi-Warehouse', 'Priority Support', 'White Label (beta)'],
        cta: 'Try Business',
        color: 'violet',
        popular: true,
    },
    {
        name: 'Enterprise',
        price: '4999',
        desc: 'Custom solutions for high-volume manufacturing and large teams.',
        features: ['Unlimited Users', 'Unlimited Orders', '200GB Storage', 'Custom Domain', 'Dedicated Manager', '24/7 Phone Support', 'SLA Guarantee'],
        cta: 'Contact Sales',
        color: 'indigo',
    }
];

export default function PricingPage() {
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
                        <span className="text-[#DFFF1B] font-black tracking-[0.5em] uppercase text-[10px] mb-8 block italic">Predictable Infrastructure Costs</span>
                        <h1 className="text-6xl md:text-9xl font-black text-white mb-10 tracking-tighter uppercase italic leading-[0.85]">
                            SCALABLE <br /><span className="text-[#DFFF1B]">REVENUE</span> <br /> MODELS
                        </h1>
                        <p className="max-w-2xl mx-auto text-xl text-slate-500 font-bold leading-relaxed italic mt-10">
                            Transparent, predictable pricing engineered for businesses that need high-volume reliability.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Pricing Grid */}
            <section className="py-32">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PLANS.map((plan, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className={`relative group p-10 rounded-[3.5rem] border-2 flex flex-col transition-all duration-500 ${plan.popular
                                    ? 'border-[#DFFF1B] bg-[#DFFF1B]/5 shadow-[0_0_50px_rgba(223,255,27,0.1)]'
                                    : 'border-white/5 bg-[#1A1F2E]/20 backdrop-blur-xl hover:border-white/10'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#DFFF1B] text-black px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-[0_0_20px_rgba(223,255,27,0.4)]">
                                        Primary Choice
                                    </div>
                                )}

                                <div className="mb-10">
                                    <h3 className={`text-2xl font-black mb-2 uppercase italic ${plan.popular ? 'text-white' : 'text-white'}`}>{plan.name}</h3>
                                    <div className="h-1 w-8 bg-[#DFFF1B]/30 rounded-full mb-6" />
                                    <p className="text-[13px] font-medium leading-relaxed italic text-slate-500">{plan.desc}</p>
                                </div>

                                <div className="flex items-baseline gap-2 mb-12">
                                    <span className="text-sm font-bold text-slate-500 italic uppercase">INR</span>
                                    <span className="text-5xl font-black text-white tracking-tighter">₹{plan.price}</span>
                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-widest">/cycle</span>
                                </div>

                                <ul className="space-y-4 mb-12 flex-1">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-3 text-[11px] font-black italic uppercase tracking-widest text-slate-400 group-hover:text-slate-200 transition-colors">
                                            <div className="h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-white/5 border border-white/5">
                                                <Check className="w-3 h-3 text-[#DFFF1B]" />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>

                                <Link
                                    to="/login?mode=signup"
                                    className={`group flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${plan.popular
                                        ? 'bg-[#DFFF1B] text-black hover:bg-white shadow-2xl shadow-[#DFFF1B]/20'
                                        : 'bg-white/5 text-white border border-white/10 hover:bg-white hover:text-black'
                                        }`}
                                >
                                    {plan.cta} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                                </Link>

                                {/* Background Glow for Popular */}
                                {plan.popular && (
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#DFFF1B]/5 to-transparent rounded-[3.5rem] -z-10" />
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Custom Inquiry Section */}
            <section className="py-40 relative">
                <div className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="bg-[#1A1F2E]/20 backdrop-blur-3xl rounded-[4rem] border border-white/5 p-16 md:p-24 text-center relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h2 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">Institutional Scale?</h2>
                            <p className="text-slate-500 font-medium mb-12 text-lg italic leading-relaxed">
                                We offer specialized enterprise pricing for high-volume transactions <br /> and mission-critical multi-region deployments.
                            </p>
                            <Link to="/contact" className="group inline-flex items-center gap-4 bg-white/5 border border-white/10 text-white hover:bg-[#DFFF1B] hover:text-black px-12 py-5 rounded-full font-black text-xs uppercase tracking-widest transition-all">
                                Consult Sales Engineering <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                            </Link>
                        </div>

                        {/* Decorative background blobs */}
                        <div className="absolute top-0 right-0 h-64 w-64 bg-[#DFFF1B]/5 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2" />
                        <div className="absolute bottom-0 left-0 h-64 w-64 bg-white/5 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2" />
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
