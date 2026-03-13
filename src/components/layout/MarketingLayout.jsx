import React from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { Shield, Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
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
        <div className="min-h-screen bg-[#0B0F1A] font-sans text-white scroll-smooth selection:bg-[#DFFF1B] selection:text-black">
            {/* Navbar: RADOM Inspired Redesign */}
            <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-6 px-4 pointer-events-none">
                <div className="w-full max-w-7xl bg-[#0B0F1A]/60 backdrop-blur-2xl border border-white/5 rounded-full px-8 py-3 flex items-center justify-between pointer-events-auto shadow-2xl shadow-black/50">

                    {/* Logo Section */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="h-8 w-8 rounded-lg bg-[#DFFF1B] flex items-center justify-center shadow-[0_0_20px_rgba(223,255,27,0.2)] group-hover:rotate-12 transition-transform">
                            <Shield className="text-black w-5 h-5 fill-current" />
                        </div>
                        <span className="text-lg font-black tracking-tighter text-white uppercase italic">
                            Averqon<span className="text-[#DFFF1B]">.</span>
                        </span>
                    </Link>

                    {/* Centered Desktop Nav */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={({ isActive }) =>
                                    `text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 group/nav ${isActive ? 'text-[#DFFF1B]' : 'text-slate-400 hover:text-white'
                                    }`
                                }
                            >
                                <div className="w-1 h-1 rounded-full bg-[#DFFF1B] opacity-40 group-hover/nav:opacity-100 transition-opacity" />
                                {item.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Utility & CTA Area */}
                    <div className="hidden md:flex items-center gap-6">
                        {/* Decorative Theme Switcher */}
                        <div className="flex items-center bg-black/40 border border-white/5 p-1 rounded-full">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer">
                                <Sun size={14} />
                            </div>
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white text-black shadow-lg">
                                <Moon size={14} className="fill-current" />
                            </div>
                        </div>

                        <div className="h-6 w-[1px] bg-white/10" />

                        <Link
                            to="/login?mode=signup"
                            className="bg-[#DFFF1B] text-black px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white hover:shadow-[0_0_30px_rgba(223,255,27,0.3)] transition-all active:scale-95"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Trigger */}
                    <div className="lg:hidden flex items-center gap-4">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-slate-400 hover:text-white transition-colors"
                        >
                            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Nav Overlay */}
                <AnimatePresence>
                    {isMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="lg:hidden absolute top-full left-4 right-4 mt-4 bg-[#0B0F1A] border border-white/5 rounded-3xl overflow-hidden shadow-2xl z-[100] pointer-events-auto"
                        >
                            <div className="px-6 py-8 space-y-6">
                                {navItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        to={item.href}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="flex items-center gap-4 text-sm font-black text-slate-400 hover:text-[#DFFF1B] uppercase tracking-widest transition-colors"
                                    >
                                        <div className="w-1 h-1 rounded-full bg-[#DFFF1B]" />
                                        {item.name}
                                    </Link>
                                ))}
                                <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                    <Link
                                        to="/login"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center py-4 text-xs font-black text-slate-400 border border-white/5 rounded-2xl uppercase tracking-widest"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        to="/login?mode=signup"
                                        onClick={() => setIsMenuOpen(false)}
                                        className="w-full text-center py-4 text-xs font-black bg-[#DFFF1B] text-black rounded-2xl shadow-lg uppercase tracking-widest"
                                    >
                                        Get Started
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            <main className="pt-32">
                <Outlet />
            </main>


            {/* Footer */}
            <footer className="bg-[#0B0F1A] border-t border-white/5 pt-20 pb-10 mt-20 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-[#DFFF1B]/20 to-transparent" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                        <div className="col-span-1 md:col-span-1">
                            <Link to="/" className="flex items-center gap-2.5 mb-6 group">
                                <div className="h-8 w-8 rounded-lg bg-[#DFFF1B] flex items-center justify-center group-hover:rotate-12 transition-transform">
                                    <Shield className="text-black w-5 h-5" />
                                </div>
                                <span className="text-lg font-black tracking-tight text-white uppercase italic">Averqon</span>
                            </Link>
                            <p className="text-slate-400 text-sm leading-relaxed mb-6">
                                The foundational system for modern business operations. Secure, automated, and lightning fast.
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Product</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link to="/features" className="hover:text-[#DFFF1B] transition-colors">Features</Link></li>
                                <li><Link to="/pricing" className="hover:text-[#DFFF1B] transition-colors">Pricing</Link></li>
                                <li><Link to="/marketing-industries" className="hover:text-[#DFFF1B] transition-colors">Industries</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Company</h4>
                            <ul className="space-y-4 text-sm text-slate-400">
                                <li><Link to="/contact" className="hover:text-[#DFFF1B] transition-colors">Contact</Link></li>
                                <li><Link to="#" className="hover:text-[#DFFF1B] transition-colors">Privacy Policy</Link></li>
                                <li><Link to="#" className="hover:text-[#DFFF1B] transition-colors">Terms of Service</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-xs">Connect</h4>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#DFFF1B] hover:text-black transition-all cursor-pointer">
                                    <Shield size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                            &copy; {new Date().getFullYear()} Averqon Systems. Built for the future.
                        </p>
                    </div>
                </div>
            </footer>

        </div>
    );
}
