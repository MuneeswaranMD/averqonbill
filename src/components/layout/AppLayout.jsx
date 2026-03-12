import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { motion, AnimatePresence } from 'framer-motion';

const pageTitles = {
    '/': 'Dashboard',
    '/products': 'Products',
    '/stock': 'Stock Management',
    '/suppliers': 'Suppliers Management',
    '/customers': 'Customers',
    '/orders': 'Orders',
    '/orders/create': 'Create Order',
    '/invoices/create': 'Create Invoice',
    '/estimates/create': 'Create Estimate',
    '/pos': 'POS Terminal',
    '/estimates': 'Estimates',
    '/invoices': 'Invoices',
    '/dispatch': 'Dispatch',
    '/automation': 'Workflow Automation',
    '/reports': 'Reports',
    '/settings': 'Settings',
    '/companies': 'Companies',
    '/superadmin': 'Platform Overview',
};

export default function AppLayout() {
    const location = useLocation();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);
    const [isMobileOpen, setIsMobileOpen] = React.useState(false);

    const title = pageTitles[location.pathname] || 'Averqon Billing Software';
    const isPOS = location.pathname === '/pos';

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileOpen(false);
    }, [location.pathname]);

    return (
        <div className="flex h-screen w-full bg-[#F8FAFC] font-sans antialiased overflow-hidden relative">
            {/* Mobile Backdrop */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
                isMobileOpen={isMobileOpen}
                setIsMobileOpen={setIsMobileOpen}
            />

            <div className="flex flex-1 flex-col overflow-hidden">
                <Header
                    pageTitle={title}
                    isCollapsed={isSidebarCollapsed}
                    setIsCollapsed={setIsSidebarCollapsed}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />
                <main className="flex-1 overflow-hidden">
                    {isPOS ? (
                        /* POS: full area, no padding, no max-width */
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="h-full"
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    ) : (
                        /* All other pages: standard p-6 padded layout */
                        <div className="h-full overflow-y-auto no-scrollbar">
                            <div className="p-4 sm:p-6 mx-auto max-w-[1600px] w-full">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={location.pathname}
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.2, ease: 'easeOut' }}
                                    >
                                        <Outlet />
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
