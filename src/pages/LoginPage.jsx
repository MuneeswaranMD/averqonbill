import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input } from '../components/ui';
import { ShoppingBag, Lock, Mail, ArrowRight, User, Eye, EyeOff, Building2, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (isRegistering) {
                if (password.length < 6) throw { code: 'auth/weak-password' };
                const res = await register(email, password, name);
                // Store phone in user profile if provided
                navigate('/');
            } else {
                await login(email, password);
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            const msg =
                err.code === 'auth/user-not-found' ? 'No account found with this email.' :
                    err.code === 'auth/wrong-password' ? 'Incorrect password.' :
                        err.code === 'auth/invalid-credential' ? 'Invalid email or password.' :
                            err.code === 'auth/email-already-in-use' ? 'An account with this email already exists.' :
                                err.code === 'auth/weak-password' ? 'Password must be at least 6 characters.' :
                                    err.code === 'auth/invalid-email' ? 'Please enter a valid email address.' :
                                        'Authentication failed. Please try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const switchMode = () => {
        setIsRegistering(!isRegistering);
        setError('');
        setName('');
        setPhone('');
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/60 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-100/60 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
                <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-indigo-50/30 rounded-full blur-3xl" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="w-full max-w-sm relative z-10"
            >
                {/* Brand */}
                <div className="flex flex-col items-center mb-8">
                    <div className="h-16 w-16 mb-4 rounded-2xl overflow-hidden shadow-lg shadow-blue-100">
                        <img src="/logo.jpg" alt="Averqon Logo" className="h-full w-full object-contain mix-blend-multiply" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Averqon Bill</h1>
                    <p className="text-sm text-gray-500 mt-1">Business Management Platform</p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                    <h2 className="text-base font-semibold text-gray-800 mb-1">
                        {isRegistering ? 'Create your account' : 'Sign in to your account'}
                    </h2>
                    <p className="text-xs text-gray-400 mb-6">
                        {isRegistering
                            ? 'Start your free trial — no credit card required'
                            : 'Welcome back! Please enter your credentials'}
                    </p>

                    {error && (
                        <div className="mb-4 px-3 py-2.5 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <AnimatePresence>
                            {isRegistering && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden space-y-4"
                                >
                                    {/* Full Name */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Full Name *</label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                <User size={15} />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Your full name"
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={isRegistering}
                                                className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone Number</label>
                                        <div className="relative">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                <Phone size={15} />
                                            </div>
                                            <input
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email Address *</label>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Mail size={15} />
                                </div>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-gray-500">Password *</label>
                                {!isRegistering && (
                                    <button type="button" className="text-xs text-blue-600 hover:underline">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <Lock size={15} />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder={isRegistering ? 'Min. 6 characters' : '••••••••'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="block w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder:text-gray-400 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>

                        {/* Terms notice on register */}
                        {isRegistering && (
                            <p className="text-[11px] text-gray-400">
                                By creating an account, you agree to our{' '}
                                <span className="text-blue-600 cursor-pointer hover:underline">Terms of Service</span>{' '}
                                and{' '}
                                <span className="text-blue-600 cursor-pointer hover:underline">Privacy Policy</span>.
                            </p>
                        )}

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                            >
                                {loading ? 'Please wait...' : (isRegistering ? 'Create Account' : 'Sign In')}
                                {!loading && <ArrowRight size={15} />}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center mt-5">
                    <button
                        onClick={switchMode}
                        className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        {isRegistering
                            ? 'Already have an account? Sign in →'
                            : "Don't have an account? Sign up →"}
                    </button>
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    © {new Date().getFullYear()} Averqon Bill. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}
