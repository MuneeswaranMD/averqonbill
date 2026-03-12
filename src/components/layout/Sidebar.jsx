import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    BarChart3,
    Settings,
    LogOut,
    Zap,
    Building2,
    Package,
    Users,
    ShoppingCart,
    Receipt,
    Truck,
    LayoutDashboard,
    Layers,
    ChevronLeft,
    ChevronRight,
    X,
    FileText,
    Cpu,
    Compass,
    Calendar,
    HardHat,
    Wrench,
    MapPin,
    ShoppingBag,
    UtensilsCrossed,
    CheckCircle2,
    Bell,
    Users2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCompanySettings } from '../../hooks/useCompanySettings';
import { cn } from '../ui';

// ─── All possible navigation items ────────────────────────────────────────────
// `moduleKey` loosely matches the module name from the industry config
const ALL_NAV_ITEMS = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, alwaysShow: true },
    { name: 'POS Terminal', href: '/pos', icon: Zap, moduleKey: 'POS Billing', isAccent: true },
    { name: 'Products', href: '/products', icon: Package, moduleKey: 'Products' },
    { name: 'Stock', href: '/stock', icon: Layers, moduleKey: 'Inventory' },
    { name: 'Suppliers', href: '/suppliers', icon: Truck, moduleKey: 'Inventory' },
    { name: 'Customers', href: '/customers', icon: Users, moduleKey: 'Customers' },
    { name: 'Orders', href: '/orders', icon: ShoppingCart, moduleKey: 'Orders' },
    { name: 'Estimates', href: '/estimates', icon: FileText, moduleKey: 'Invoices' },
    { name: 'Invoices', href: '/invoices', icon: Receipt, moduleKey: 'Invoices' },
    { name: 'Dispatch', href: '/dispatch', icon: Truck, moduleKey: 'Delivery' },
    { name: 'Bookings', href: '/bookings', icon: Calendar, moduleKeys: ['Bookings', 'Appointments', 'Schedules'] },
    { name: 'Staff', href: '/staff', icon: Users2, moduleKey: 'Staff' },
    { name: 'Notifications', href: '/notifications', icon: Bell, alwaysShow: true },
    { name: 'Automation', href: '/automation', icon: Cpu, alwaysShow: true },
    { name: 'Reports', href: '/reports', icon: BarChart3, moduleKey: 'Reports' },
];

// Industry-specific extra labels (cosmetic rename in sidebar)
const INDUSTRY_LABELS = {
    tours: { 'Products': 'Tour Packages', 'Orders': 'Bookings', 'Customers': 'Guests' },
    service: { 'Orders': 'Invoices', 'Products': 'Services', 'Bookings': 'Appointments' },
    construction: { 'Orders': 'Projects', 'Customers': 'Clients', 'Products': 'Materials' },
    freelancer: { 'Orders': 'Projects', 'Customers': 'Clients', 'Products': 'Services' },
    restaurant: { 'Products': 'Menu Items', 'Orders': 'Table Orders' },
};

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const { logout, userData, isSuperAdmin, companyId, activeModules, industry } = useAuth();
    const { settings } = useCompanySettings(companyId);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (e) {
            console.error(e);
        }
    };

    // Filter nav items based on active modules (if no modules set → show all)
    const navigation = useMemo(() => {
        const industryLabels = INDUSTRY_LABELS[industry] || {};
        const hasModules = activeModules && activeModules.length > 0;

        return ALL_NAV_ITEMS
            .filter(item => {
                if (item.alwaysShow) return true;
                if (!hasModules) return true; // No industry set → show everything

                const itemKeys = item.moduleKeys || (item.moduleKey ? [item.moduleKey] : []);
                if (itemKeys.length === 0) return true;

                // Check if any of this item's keys match any active module
                return activeModules.some(m =>
                    itemKeys.some(k =>
                        m.toLowerCase().includes(k.toLowerCase()) ||
                        k.toLowerCase().includes(m.toLowerCase())
                    )
                );
            })
            .map(item => ({
                ...item,
                // Apply industry-specific label renaming
                displayName: industryLabels[item.name] || item.name,
            }));
    }, [activeModules, industry]);

    const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';

    return (
        <aside
            className={cn(
                "fixed inset-y-0 left-0 z-[60] flex flex-col bg-[#1E293B] text-white transition-all duration-300 ease-in-out border-r border-slate-700/50",
                sidebarWidth,
                isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
                "lg:static lg:inset-auto"
            )}
        >
            {/* Header / Brand */}
            <div className={cn(
                "flex h-16 items-center border-b border-slate-700/50 relative overflow-hidden transition-all duration-300",
                isCollapsed ? "justify-center px-0" : "px-6"
            )}>
                {!isCollapsed ? (
                    <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-500">
                        <img
                            src={settings.logoUrl || "/logo.jpg"}
                            alt="Logo"
                            className="h-10 w-10 rounded-xl object-contain bg-white p-1 shadow-lg shadow-blue-500/10 flex-shrink-0"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="hidden h-9 w-9 rounded-xl bg-blue-600 items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/20 flex-shrink-0">
                            {settings.name?.[0] || 'A'}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-white truncate leading-tight uppercase tracking-wide">
                                {settings.name || 'AVERQON'}
                            </h2>
                            <p className="text-[9px] text-slate-500 truncate font-medium mt-0.5">
                                {settings.website || 'Business Dashboard'}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="h-10 w-10 flex items-center justify-center animate-in zoom-in duration-300">
                        <img
                            src={settings.logoUrl || "/logo.jpg"}
                            alt="Logo"
                            className="h-10 w-10 rounded-xl object-contain bg-white p-1 shadow-lg shadow-blue-500/10"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                            }}
                        />
                        <div className="hidden h-10 w-10 rounded-xl bg-blue-600 items-center justify-center font-black text-xl italic tracking-tighter shadow-lg shadow-blue-500/20">
                            {settings.name?.[0] || 'A'}
                        </div>
                    </div>
                )}

                {/* Mobile Close Button */}
                <button
                    onClick={() => setIsMobileOpen(false)}
                    className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Navigation Section */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1 no-scrollbar overflow-x-hidden">
                {/* Industry badge */}
                {!isCollapsed && industry && (
                    <div className="mb-4 px-3 py-2 bg-slate-800/60 rounded-xl border border-slate-700/50">
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Industry</p>
                        <p className="text-xs font-semibold text-slate-300 capitalize">{industry.replace('_', ' ')}</p>
                    </div>
                )}

                {navigation.map((item) => (
                    <NavLink
                        key={item.href + item.displayName}
                        to={item.href}
                        end={item.href === '/'}
                        title={isCollapsed ? item.displayName : ''}
                        className={({ isActive }) => cn(
                            "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200 relative",
                            item.isAccent
                                ? "bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white mb-4 border border-blue-500/10"
                                : isActive
                                    ? "bg-slate-800 text-white shadow-lg shadow-black/20"
                                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                        )}
                    >
                        <item.icon
                            size={isCollapsed ? 20 : 18}
                            className={cn(
                                "flex-shrink-0 transition-all duration-200",
                                item.isAccent && !isCollapsed && "text-blue-400 group-hover:text-white",
                                isCollapsed && "mx-auto"
                            )}
                        />
                        {!isCollapsed && <span className="truncate">{item.displayName}</span>}
                        {item.isAccent && !isCollapsed && (
                            <div className="ml-auto h-2 w-2 rounded-full bg-blue-400 animate-pulse ring-4 ring-blue-400/20" />
                        )}
                    </NavLink>
                ))}

                {/* Super Admin Section */}
                {isSuperAdmin && (
                    <div className={cn("mt-6 pt-6 border-t border-slate-800", isCollapsed && "flex flex-col items-center")}>
                        {!isCollapsed && <p className="px-3 text-[10px] font-bold text-slate-500 mb-3 uppercase tracking-widest">Platform</p>}
                        <NavLink
                            to="/superadmin"
                            title={isCollapsed ? "Platform Overview" : ""}
                            className={({ isActive }) => cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                                isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            <LayoutDashboard size={isCollapsed ? 20 : 18} className={isCollapsed ? "mx-auto" : ""} />
                            {!isCollapsed && <span>Overview</span>}
                        </NavLink>
                        <NavLink
                            to="/companies"
                            title={isCollapsed ? "Companies" : ""}
                            className={({ isActive }) => cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                                isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                            )}
                        >
                            <Building2 size={isCollapsed ? 20 : 18} className={isCollapsed ? "mx-auto" : ""} />
                            {!isCollapsed && <span>Companies</span>}
                        </NavLink>
                    </div>
                )}
            </nav>

            {/* Footer Actions */}
            <div className="mt-auto p-3 space-y-1">
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 hover:bg-slate-800/50 hover:text-white transition-all duration-200"
                >
                    {isCollapsed
                        ? <ChevronRight size={20} className="mx-auto" />
                        : <><ChevronLeft size={18} /><span>Collapse Sidebar</span></>
                    }
                </button>

                <NavLink
                    to="/settings"
                    title={isCollapsed ? "Settings" : ""}
                    className={({ isActive }) => cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-all duration-200",
                        isActive ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                    )}
                >
                    <Settings
                        size={isCollapsed ? 20 : 18}
                        className={cn("group-hover:rotate-90 transition-transform duration-500", isCollapsed && "mx-auto")}
                    />
                    {!isCollapsed && <span>Settings</span>}
                </NavLink>

                <button
                    onClick={handleLogout}
                    title={isCollapsed ? "Sign out" : ""}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-red-400/70 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
                >
                    <LogOut size={isCollapsed ? 20 : 18} className={isCollapsed ? "mx-auto" : ""} />
                    {!isCollapsed && <span>Sign out</span>}
                </button>
            </div>

            {/* Profile Info */}
            {userData && (
                <div className={cn(
                    "px-4 py-4 border-t border-slate-800 bg-slate-900/50 transition-all duration-300",
                    isCollapsed ? "flex flex-col items-center justify-center p-3" : "flex items-center gap-3"
                )}>
                    <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-blue-600/20">
                        {userData.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    {!isCollapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-white truncate">{userData.name || 'Admin'}</p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-tighter font-semibold truncate leading-tight mt-0.5">
                                {userData.role?.replace('_', ' ') || 'User'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </aside>
    );
}
