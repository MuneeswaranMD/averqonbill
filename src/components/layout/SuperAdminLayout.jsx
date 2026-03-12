import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard, Building2, Package, Layers, DollarSign,
    LayoutTemplate, BarChart3, Zap, ScrollText, Settings,
    LogOut, ChevronLeft, ChevronRight, X, Menu, Shield,
    Users, Globe, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV = [
    { section: 'Overview' },
    { name: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
    { name: 'Analytics', href: '/superadmin/analytics', icon: BarChart3 },
    { section: 'Platform' },
    { name: 'Industries', href: '/superadmin/industries', icon: Globe },
    { name: 'Modules', href: '/superadmin/modules', icon: Package },
    { name: 'Templates', href: '/superadmin/templates', icon: Layers },
    { name: 'Feature Flags', href: '/superadmin/feature-flags', icon: Zap },
    { section: 'Business' },
    { name: 'Businesses', href: '/companies', icon: Building2 },
    { name: 'Plans & Billing', href: '/superadmin/plans', icon: DollarSign },
    { section: 'System' },
    { name: 'Roles & Access', href: '/superadmin/roles', icon: Shield },
    { name: 'Activity Logs', href: '/superadmin/logs', icon: ScrollText },
    { name: 'Settings', href: '/superadmin/settings', icon: Settings },
];

function cn(...classes) { return classes.filter(Boolean).join(' '); }

export default function SuperAdminLayout() {
    const { logout, userData } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const sidebarW = collapsed ? 'w-[68px]' : 'w-60';

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className={cn('flex items-center h-16 border-b border-slate-700/50 px-4 gap-3 overflow-hidden', collapsed && 'justify-center px-0')}>
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Shield size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <p className="text-sm font-black text-white tracking-tight">Super Admin</p>
                        <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Control Panel</p>
                    </div>
                )}
                <button onClick={() => setMobileOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-white">
                    <X size={18} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 no-scrollbar">
                {NAV.map((item, idx) => {
                    if (item.section) {
                        return !collapsed ? (
                            <p key={idx} className="text-[9px] font-black text-slate-600 uppercase tracking-[0.12em] px-3 pt-5 pb-2 first:pt-2">
                                {item.section}
                            </p>
                        ) : <div key={idx} className="my-2 border-t border-slate-800" />;
                    }
                    return (
                        <NavLink
                            key={item.href}
                            to={item.href}
                            end={item.href === '/superadmin'}
                            title={collapsed ? item.name : ''}
                            className={({ isActive }) => cn(
                                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                isActive
                                    ? 'bg-violet-600/20 text-violet-300 border border-violet-500/20'
                                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                            )}
                        >
                            <item.icon size={collapsed ? 20 : 17} className={cn('flex-shrink-0', collapsed && 'mx-auto')} />
                            {!collapsed && <span className="truncate">{item.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 space-y-1">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-800/60 hover:text-white transition-all"
                >
                    {collapsed ? <ChevronRight size={18} className="mx-auto" /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
                </button>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all"
                >
                    <LogOut size={collapsed ? 18 : 16} className={collapsed ? 'mx-auto' : ''} />
                    {!collapsed && <span>Sign Out</span>}
                </button>
            </div>

            {/* Profile */}
            {userData && (
                <div className={cn('px-4 py-3 border-t border-slate-800 bg-slate-900/60', collapsed ? 'flex justify-center' : 'flex items-center gap-3')}>
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                        {userData.name?.[0]?.toUpperCase() || 'S'}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">{userData.name || 'Super Admin'}</p>
                            <p className="text-[10px] text-violet-400 font-semibold uppercase tracking-wider">Platform Owner</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex h-screen w-full bg-[#F0F2F8] font-sans antialiased overflow-hidden">
            {/* Mobile backdrop */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setMobileOpen(false)}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar — desktop */}
            <aside className={cn(
                'hidden lg:flex flex-col bg-[#0F172A] border-r border-slate-800 flex-shrink-0 transition-all duration-300',
                sidebarW
            )}>
                <SidebarContent />
            </aside>

            {/* Sidebar — mobile */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.aside
                        initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 left-0 z-[60] w-60 flex flex-col bg-[#0F172A] border-r border-slate-800 lg:hidden"
                    >
                        <SidebarContent />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Top bar */}
                <header className="h-16 flex items-center px-6 bg-white border-b border-gray-200 gap-4 flex-shrink-0 shadow-sm">
                    <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 text-gray-400 hover:text-gray-700">
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center">
                            <Shield size={13} className="text-white" />
                        </div>
                        <span className="text-sm font-bold text-gray-800">Averqon</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-sm text-gray-500 font-medium capitalize">
                            {location.pathname.split('/').filter(Boolean).slice(1).join(' › ') || 'dashboard'}
                        </span>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-violet-50 text-violet-700 px-3 py-1.5 rounded-full border border-violet-100">
                            <Activity size={11} />
                            System Active
                        </span>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-6 max-w-[1600px] mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </div>
    );
}
