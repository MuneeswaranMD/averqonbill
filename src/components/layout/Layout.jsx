import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const routeToTitle = {
    '/': 'Dashboard',
    '/products': 'Products',
    '/customers': 'Customers',
    '/orders': 'Orders',
    '/estimates': 'Estimates',
    '/invoices': 'Invoices',
    '/dispatch': 'Dispatch',
    '/pos': 'POS',
    '/reports': 'Reports',
    '/settings': 'Settings',
};

export default function Layout() {
    const location = useLocation();
    const pageTitle = routeToTitle[location.pathname] || 'Averqon Billing Software';

    return (
        <div className="flex h-screen w-full overflow-hidden bg-gray-50">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <Header pageTitle={pageTitle} />
                <main className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
