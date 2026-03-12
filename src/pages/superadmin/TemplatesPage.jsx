import React, { useState } from 'react';
import { Layers, CheckCircle2, Edit3, Plus, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TEMPLATES = [
    { id: 'retail', name: 'Retail Store', icon: '🛍️', color: 'from-blue-500 to-blue-600', description: 'Complete retail solution with POS, inventory and customer management.', modules: ['Dashboard', 'Products', 'Inventory', 'POS Billing', 'Customers', 'Orders', 'Invoices', 'Payments', 'Reports'], flow: ['Signup', 'Select Retail', 'Auto-Enable: POS + Products + Inventory', 'Setup Wizard', 'Dashboard'] },
    { id: 'wholesale', name: 'Wholesale', icon: '🚚', color: 'from-emerald-500 to-emerald-600', description: 'Bulk ordering, supplier management and delivery tracking.', modules: ['Dashboard', 'Products', 'Bulk Orders', 'Inventory', 'Suppliers', 'Purchase Orders', 'Invoices', 'Delivery', 'Reports'], flow: ['Signup', 'Select Wholesale', 'Auto-Enable: Bulk Orders + Suppliers + Delivery', 'Setup Wizard', 'Dashboard'] },
    { id: 'tours', name: 'Tours & Travels', icon: '✈️', color: 'from-sky-500 to-sky-600', description: 'Destination management, tour packages, bookings and agent portal.', modules: ['Dashboard', 'Destinations', 'Tour Packages', 'Bookings', 'Customers', 'Payments', 'Schedules', 'Agents', 'Reports'], flow: ['Signup', 'Select Tours', 'Auto-Enable: Packages + Bookings + Agents', 'Setup Wizard', 'Dashboard'] },
    { id: 'service', name: 'Service Business', icon: '🔧', color: 'from-violet-500 to-violet-600', description: 'Appointment scheduling, staff management and service billing.', modules: ['Dashboard', 'Services', 'Appointments', 'Customers', 'Invoices', 'Payments', 'Staff', 'Reports'], flow: ['Signup', 'Select Service', 'Auto-Enable: Appointments + Staff + Invoices', 'Setup Wizard', 'Dashboard'] },
    { id: 'construction', name: 'Construction', icon: '🏗️', color: 'from-amber-500 to-amber-600', description: 'Project tracking, material management and labor cost control.', modules: ['Dashboard', 'Projects', 'Materials', 'Labor', 'Customers', 'Invoices', 'Payments', 'Reports'], flow: ['Signup', 'Select Construction', 'Auto-Enable: Projects + Materials + Labor', 'Setup Wizard', 'Dashboard'] },
    { id: 'restaurant', name: 'Restaurant / Food', icon: '🍽️', color: 'from-red-500 to-red-600', description: 'Menu management, table orders, kitchen flow and billing.', modules: ['Dashboard', 'Products', 'Orders', 'Customers', 'Payments', 'Staff', 'Reports'], flow: ['Signup', 'Select Restaurant', 'Auto-Enable: Menu + Tables + POS', 'Setup Wizard', 'Dashboard'] },
    { id: 'freelancer', name: 'Freelancer', icon: '💻', color: 'from-pink-500 to-pink-600', description: 'Project management, time tracking and professional invoicing.', modules: ['Dashboard', 'Services', 'Projects', 'Customers', 'Time Tracking', 'Invoices', 'Payments', 'Reports'], flow: ['Signup', 'Select Freelancer', 'Auto-Enable: Projects + Time Tracking + Invoices', 'Setup Wizard', 'Dashboard'] },
    { id: 'ecommerce', name: 'E-commerce', icon: '🛒', color: 'from-indigo-500 to-indigo-600', description: 'Online store with product catalog, order management and shipping.', modules: ['Dashboard', 'Products', 'Inventory', 'Orders', 'Customers', 'Invoices', 'Payments', 'Reports'], flow: ['Signup', 'Select E-commerce', 'Auto-Enable: Products + Orders + Shipping', 'Setup Wizard', 'Dashboard'] },
    { id: 'manufacturing', name: 'Manufacturing', icon: '🏭', color: 'from-orange-500 to-orange-600', description: 'Production tracking, raw materials and batch order management.', modules: ['Dashboard', 'Products', 'Materials', 'Inventory', 'Orders', 'Invoices', 'Payments', 'Reports'], flow: ['Signup', 'Select Manufacturing', 'Auto-Enable: Production + Materials + Inventory', 'Setup Wizard', 'Dashboard'] },
];

export default function TemplatesPage() {
    const [selected, setSelected] = useState(null);

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Industry Templates</h1>
                    <p className="text-sm text-gray-500">Pre-built workspace configurations loaded automatically on business signup.</p>
                </div>
                <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors">
                    <Plus size={16} /> New Template
                </button>
            </div>

            {/* Signup Flow Diagram */}
            <div className="bg-gradient-to-r from-violet-50 to-blue-50 border border-violet-100 rounded-2xl p-5">
                <p className="text-xs font-bold text-violet-700 mb-3">🔄 Auto-Configuration Flow</p>
                <div className="flex items-center gap-2 flex-wrap">
                    {['User Signup', 'Select Industry', 'Load Template', 'Create Workspace', 'Activate Modules', 'Open Dashboard'].map((step, i, arr) => (
                        <React.Fragment key={step}>
                            <span className="text-xs font-semibold bg-white text-violet-800 px-3 py-1.5 rounded-lg border border-violet-100 shadow-sm">{step}</span>
                            {i < arr.length - 1 && <ArrowRight size={14} className="text-violet-400 flex-shrink-0" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Total Templates</p>
                    <p className="text-2xl font-black text-gray-900">{TEMPLATES.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Avg Modules</p>
                    <p className="text-2xl font-black text-gray-900">
                        {Math.round(TEMPLATES.reduce((a, t) => a + t.modules.length, 0) / TEMPLATES.length)}
                    </p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Max Modules</p>
                    <p className="text-2xl font-black text-gray-900">{Math.max(...TEMPLATES.map(t => t.modules.length))}</p>
                </div>
            </div>

            {/* Template Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {TEMPLATES.map(t => (
                    <div key={t.id}
                        onClick={() => setSelected(selected?.id === t.id ? null : t)}
                        className={`bg-white rounded-2xl border-2 shadow-sm cursor-pointer transition-all hover:shadow-md ${selected?.id === t.id ? 'border-violet-400' : 'border-gray-200'}`}>
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${t.color} flex items-center justify-center text-2xl shadow-sm`}>
                                    {t.icon}
                                </div>
                                <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit3 size={15} />
                                </button>
                            </div>
                            <h3 className="text-sm font-bold text-gray-900 mb-1">{t.name}</h3>
                            <p className="text-xs text-gray-500 mb-4 leading-relaxed">{t.description}</p>
                            <div className="flex flex-wrap gap-1.5">
                                {t.modules.slice(0, 5).map(m => (
                                    <span key={m} className="inline-flex items-center gap-0.5 px-2 py-1 bg-gray-50 text-gray-600 rounded-lg text-[10px] font-semibold">
                                        <CheckCircle2 size={9} className="text-green-500" />{m}
                                    </span>
                                ))}
                                {t.modules.length > 5 && (
                                    <span className="px-2 py-1 bg-gray-50 text-gray-400 rounded-lg text-[10px] font-semibold">+{t.modules.length - 5} more</span>
                                )}
                            </div>
                        </div>
                        {selected?.id === t.id && (
                            <div className="border-t border-gray-100 p-4 bg-violet-50/50">
                                <p className="text-xs font-bold text-violet-700 mb-2">Setup Flow</p>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                    {t.flow.map((step, i, arr) => (
                                        <React.Fragment key={step}>
                                            <span className="text-[10px] font-semibold text-violet-800 bg-white px-2 py-1 rounded border border-violet-100">{step}</span>
                                            {i < arr.length - 1 && <ArrowRight size={10} className="text-violet-400" />}
                                        </React.Fragment>
                                    ))}
                                </div>
                                <p className="text-xs font-bold text-violet-700 mt-3 mb-2">All Modules ({t.modules.length})</p>
                                <div className="flex flex-wrap gap-1">
                                    {t.modules.map(m => (
                                        <span key={m} className="px-2 py-0.5 bg-violet-100 text-violet-700 rounded text-[10px] font-semibold">{m}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
