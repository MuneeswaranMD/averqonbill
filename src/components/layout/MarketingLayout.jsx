import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MarketingLayout() {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const navigate = useNavigate();

    const navItems = [
        { name: 'Features', href: '/features' },
        { name: 'Industries', href: '/marketing-industries' },
        { name: 'Pricing', href: '/pricing' },
        { name: 'Contact', href: '/contact' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                                <Shield className="text-white w-6 h-6" />
                            </div>
                            <span className="text-xl font-black tracking-tight text-slate-900">Averqon<span className="text-violet-600">.</span></span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    className={({ isActive }) =>
                                        `text-sm font-bold transition-colors hover:text-violet-600 ${isActive ? 'text-violet-600' : 'text-slate-600'
                                        }`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            ))}
                        </div>

                        {/* Desktop CTAs */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link to="/login" className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                                Log in
                            </Link>
                            <Link
                                to="/login?mode=signup"
                                className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-800 transition-all hover:shadow-xl hover:shadow-slate-200 active:scale-95"
                            >
                                Start Free Trial <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="p-2 text-slate-600 hover:text-slate-900"
                            >
                                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Nav */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-b border-slate-100 overflow-hidden"
                        >
                            <div className="px-4 py-6 space-y-4">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="block text-lg font-bold text-slate-900"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="pt-4 flex flex-col gap-3">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center py-3 text-lg font-bold text-slate-600 border border-slate-200 rounded-2xl"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/login?mode=signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center py-3 text-lg font-bold bg-violet-600 text-white rounded-2xl shadow-lg shadow-violet-200"
                                    >
                                        Start Free Trial
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="pt-20">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 border-t border-slate-100 pt-20 pb-10 mt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <Link to="/" className="flex items-center gap-2.5 mb-6">
                                <div className="h-8 w-8 rounded-lg bg-slate-900 flex items-center justify-center">
                                    <Shield className="text-white w-5 h-5" />
                                </div>
                                <span className="text-lg font-black tracking-tight text-slate-900">Averqon</span>
                            </Link>
                            <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                The all-in-one business operating system for modern industries. Scale faster with smart automation.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Product</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li><Link to="/features" className="hover:text-violet-600">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-violet-600">Pricing</Link></li>
                                <li><Link to="/marketing-industries" className="hover:text-violet-600">Industries</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Company</h4>
                            <ul className="space-y-4 text-sm text-slate-600">
                                <li><Link to="/contact" className="hover:text-violet-600">Contact</Link></li>
                                <li><Link to="#" className="hover:text-violet-600">Privacy Policy</Link></li>
                                <li><Link to="#" className="hover:text-violet-600">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 mb-6">Connect</h4>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all cursor-pointer">
                                    <Shield size={18} />
                                </div>
                                {/* Add social icons as needed */}
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-slate-200 text-center">
                        <p className="text-sm text-slate-500 font-medium">
                            &copy; {new Date().getFullYear()} Averqon Bill. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
