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
        <div className="bg-white">
            {/* Hero */}
            <section className="pt-24 pb-20 bg-slate-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight">Flexible Pricing for <br /><span className="text-violet-600">Businesses of All Sizes.</span></h1>
                    <p className="max-w-2xl mx-auto text-xl text-slate-500 font-medium leading-relaxed italic">
                        Simple, transparent pricing. No setup fees, no contracts.
                    </p>
                </div>
            </section>

            {/* Grid */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {PLANS.map((plan, i) => (
                            <div
                                key={i}
                                className={`relative p-8 rounded-[2.5rem] border-2 flex flex-col transition-all duration-300 hover:shadow-2xl ${plan.popular
                                        ? 'border-violet-600 shadow-xl shadow-violet-100'
                                        : 'border-slate-100 bg-white hover:border-violet-200 shadow-sm'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-violet-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest italic">
                                        Most Popular
                                    </div>
                                )}
                                <h3 className="text-xl font-black text-slate-900 mb-2 mt-2">{plan.name}</h3>
                                <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">{plan.desc}</p>
                                <div className="flex items-baseline gap-1 mb-8">
                                    <span className="text-4xl font-black text-slate-900">₹{plan.price}</span>
                                    <span className="text-slate-400 font-bold">/month</span>
                                </div>
                                <ul className="space-y-4 mb-10 flex-1">
                                    {plan.features.map((feat) => (
                                        <li key={feat} className="flex items-start gap-3 text-sm font-semibold text-slate-700">
                                            <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-3 h-3 text-slate-900" />
                                            </div>
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/login?mode=signup"
                                    className={`w-full text-center py-4 rounded-2xl font-black text-sm transition-all active:scale-95 ${plan.popular
                                            ? 'bg-violet-600 text-white hover:bg-violet-700 shadow-lg shadow-violet-200'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-100'
                                        }`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Link */}
            <section className="py-20 bg-slate-50">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-6 tracking-tight">Need a custom plan?</h2>
                    <p className="text-slate-500 font-medium mb-10">We offer specialized enterprise pricing for high-volume transactions and larger teams.</p>
                    <Link to="/contact" className="inline-flex items-center gap-2 text-violet-600 font-black hover:underline uppercase tracking-widest text-sm">
                        Talk to our Sales Team <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        </div>
    );
}
