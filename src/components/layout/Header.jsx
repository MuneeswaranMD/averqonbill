import React from 'react';
import { Bell, Search, ShieldAlert, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ pageTitle, isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const { userData } = useAuth();
    const navigate = useNavigate();
    const isSuperAdmin = userData?.role === 'super_admin';

    return (
        <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 shadow-sm">
            {/* Left: Sidebar Toggle & Page Title */}
            <div className="flex items-center gap-4">
                {/* Mobile Toggle */}
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
                    title="Menu"
                >
                    <Menu size={20} />
                </button>

                {/* Desktop Toggle (only if sidebar is collapsed) */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden lg:flex p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
                </button>

                <div>
                    <h1 className="text-xl font-bold text-gray-900 tracking-tight">{pageTitle}</h1>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 md:gap-4">
                {/* Search - Hidden on small mobile */}
                <div className="hidden md:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl text-sm text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors w-40 lg:w-60">
                    <Search size={14} className="text-gray-400 flex-shrink-0" />
                    <span className="text-sm text-gray-400 font-medium">Search for anything...</span>
                </div>

                {/* Super Admin Buttons */}
                {isSuperAdmin && (
                    <button
                        onClick={() => navigate('/superadmin')}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                        title="Super Admin Portal"
                    >
                        <ShieldAlert size={14} />
                        <span className="hidden lg:inline">Admin Portal</span>
                    </button>
                )}

                {/* Action Icons */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors">
                        <Bell size={18} />
                        <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
                    </button>

                    <div className="hidden sm:block h-6 w-px bg-gray-200 mx-1"></div>

                    {/* User Profile */}
                    <div
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 md:p-1.5 rounded-xl transition-all"
                    >
                        <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-200">
                            {userData?.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="hidden xl:block">
                            <p className="text-xs font-bold text-gray-900 leading-none">{userData?.name || 'Admin'}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-tighter font-bold leading-none mt-1">
                                {userData?.role?.replace('_', ' ') || 'User'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
