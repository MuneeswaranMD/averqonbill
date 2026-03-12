import React, { useState } from 'react';
import { Shield, Plus, Edit3, Trash2, CheckCircle2, X, Save, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ALL_PERMISSIONS = [
    { key: 'manage_business', label: 'Manage Business', desc: 'Create, edit, delete workspace settings' },
    { key: 'manage_modules', label: 'Manage Modules', desc: 'Enable/disable modules for the workspace' },
    { key: 'manage_users', label: 'Manage Users', desc: 'Invite, remove and assign roles to users' },
    { key: 'view_reports', label: 'View Reports', desc: 'Access analytics and reporting pages' },
    { key: 'manage_settings', label: 'Manage Settings', desc: 'Modify system and business settings' },
    { key: 'manage_products', label: 'Manage Products', desc: 'Create, update and delete products' },
    { key: 'manage_orders', label: 'Manage Orders', desc: 'Create and process orders' },
    { key: 'manage_invoices', label: 'Manage Invoices', desc: 'Generate and send invoices' },
    { key: 'manage_customers', label: 'Manage Customers', desc: 'Add and edit customer records' },
    { key: 'view_only', label: 'View Only', desc: 'Read-only access to all sections' },
    { key: 'manage_payments', label: 'Manage Payments', desc: 'Record and verify payments' },
    { key: 'manage_staff', label: 'Manage Staff', desc: 'Add and manage staff members' },
    { key: 'use_pos', label: 'Use POS', desc: 'Operate the POS terminal' },
    { key: 'export_data', label: 'Export Data', desc: 'Export reports and data files' },
    { key: 'manage_automation', label: 'Manage Automation', desc: 'Configure workflows and webhooks' },
];

const SEED_ROLES = [
    { id: 'r1', name: 'Super Admin', description: 'Platform owner with full control', color: 'from-violet-600 to-purple-700', isSystem: true, permissions: ALL_PERMISSIONS.map(p => p.key), userCount: 1 },
    { id: 'r2', name: 'Admin', description: 'Business workspace administrator', color: 'from-blue-500 to-blue-600', isSystem: true, permissions: ['manage_business', 'manage_modules', 'manage_users', 'view_reports', 'manage_settings', 'manage_products', 'manage_orders', 'manage_invoices', 'manage_customers', 'manage_payments', 'manage_staff', 'export_data'], userCount: 12 },
    { id: 'r3', name: 'Manager', description: 'Department manager with elevated access', color: 'from-sky-500 to-sky-600', isSystem: false, permissions: ['view_reports', 'manage_orders', 'manage_invoices', 'manage_customers', 'manage_products', 'manage_staff', 'manage_payments'], userCount: 8 },
    { id: 'r4', name: 'Employee', description: 'Standard employee with operational access', color: 'from-emerald-500 to-emerald-600', isSystem: false, permissions: ['manage_orders', 'manage_customers', 'use_pos', 'view_only'], userCount: 34 },
    { id: 'r5', name: 'Accountant', description: 'Finance focused access', color: 'from-amber-500 to-amber-600', isSystem: false, permissions: ['manage_invoices', 'manage_payments', 'view_reports', 'export_data'], userCount: 5 },
    { id: 'r6', name: 'Viewer', description: 'Read-only access to all sections', color: 'from-gray-400 to-gray-500', isSystem: false, permissions: ['view_only', 'view_reports'], userCount: 18 },
];

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-base font-bold text-gray-900">{title}</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                </div>
                <div className="p-6">{children}</div>
            </motion.div>
        </div>
    );
}

export default function RolesPage() {
    const [roles, setRoles] = useState(SEED_ROLES);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({});

    const openCreate = () => { setForm({ name: '', description: '', color: 'from-blue-500 to-blue-600', permissions: [], isSystem: false, userCount: 0 }); setModal('create'); };
    const openEdit = (role) => { setForm({ ...role }); setModal('edit'); };

    const save = () => {
        if (!form.name.trim()) return;
        if (modal === 'create') setRoles(prev => [...prev, { ...form, id: 'r' + Date.now() }]);
        else setRoles(prev => prev.map(r => r.id === form.id ? { ...r, ...form } : r));
        setModal(null);
    };

    const remove = (id) => { if (confirm('Delete this role?')) setRoles(prev => prev.filter(r => r.id !== id)); };

    const togglePerm = (key) => setForm(prev => ({
        ...prev,
        permissions: prev.permissions.includes(key) ? prev.permissions.filter(p => p !== key) : [...prev.permissions, key]
    }));

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Roles & Access Control</h1>
                    <p className="text-sm text-gray-500">Manage roles and permission sets for platform users.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm">
                    <Plus size={16} /> New Role
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Total Roles</p>
                    <p className="text-2xl font-black text-gray-900">{roles.length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">System Roles</p>
                    <p className="text-2xl font-black text-violet-600">{roles.filter(r => r.isSystem).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Custom Roles</p>
                    <p className="text-2xl font-black text-blue-600">{roles.filter(r => !r.isSystem).length}</p>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Total Users</p>
                    <p className="text-2xl font-black text-gray-900">{roles.reduce((a, r) => a + r.userCount, 0)}</p>
                </div>
            </div>

            {/* Role Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {roles.map(role => (
                    <div key={role.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className={`h-1.5 bg-gradient-to-r ${role.color}`} />
                        <div className="p-5">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${role.color} flex items-center justify-center shadow-sm`}>
                                    <Shield size={20} className="text-white" />
                                </div>
                                <div className="flex items-center gap-1">
                                    {role.isSystem && (
                                        <span className="text-[9px] font-black uppercase tracking-widest bg-violet-50 text-violet-600 px-2 py-0.5 rounded-full">System</span>
                                    )}
                                    {!role.isSystem && (
                                        <>
                                            <button onClick={() => openEdit(role)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 size={14} /></button>
                                            <button onClick={() => remove(role.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                                        </>
                                    )}
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900">{role.name}</h3>
                            <p className="text-xs text-gray-500 mt-0.5 mb-3">{role.description}</p>

                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
                                <div className="flex items-center gap-1">
                                    <Users size={12} />
                                    <span className="font-semibold text-gray-600">{role.userCount} users</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 size={12} />
                                    <span className="font-semibold text-gray-600">{role.permissions.length} permissions</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {role.permissions.slice(0, 4).map(p => {
                                    const pObj = ALL_PERMISSIONS.find(x => x.key === p);
                                    return (
                                        <span key={p} className="px-2 py-0.5 bg-gray-50 text-gray-600 text-[10px] font-semibold rounded border border-gray-100">
                                            {pObj?.label || p}
                                        </span>
                                    );
                                })}
                                {role.permissions.length > 4 && (
                                    <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-semibold rounded border border-gray-100">+{role.permissions.length - 4}</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-sm font-bold text-gray-900">Permission Matrix</h3>
                    <p className="text-xs text-gray-400">Cross-reference roles and permissions</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="text-left px-4 py-3 font-bold text-gray-500 text-[10px] uppercase tracking-widest">Permission</th>
                                {roles.map(r => (
                                    <th key={r.id} className="px-3 py-3 font-bold text-[10px] uppercase tracking-widest text-center text-gray-500">{r.name}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {ALL_PERMISSIONS.slice(0, 8).map(p => (
                                <tr key={p.key} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-2.5 font-semibold text-gray-700">{p.label}</td>
                                    {roles.map(r => (
                                        <td key={r.id} className="px-3 py-2.5 text-center">
                                            {r.permissions.includes(p.key)
                                                ? <CheckCircle2 size={14} className="text-green-500 mx-auto" />
                                                : <div className="h-3.5 w-3.5 border-2 border-gray-200 rounded-full mx-auto" />
                                            }
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AnimatePresence>
                {modal && (
                    <Modal title={modal === 'create' ? 'Create New Role' : 'Edit Role'} onClose={() => setModal(null)}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Role Name *</label>
                                <input value={form.name || ''} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Sales Manager"
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1.5">Description</label>
                                <textarea value={form.description || ''} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2}
                                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-violet-500/20 resize-none" />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs font-bold text-gray-500">Permissions ({form.permissions?.length || 0} selected)</label>
                                    <button onClick={() => setForm(p => ({ ...p, permissions: p.permissions?.length === ALL_PERMISSIONS.length ? [] : ALL_PERMISSIONS.map(x => x.key) }))}
                                        className="text-xs font-semibold text-violet-600 hover:text-violet-800">
                                        {form.permissions?.length === ALL_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                                    </button>
                                </div>
                                <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-100 rounded-xl p-3">
                                    {ALL_PERMISSIONS.map(p => (
                                        <label key={p.key} className="flex items-start gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                            <input type="checkbox" checked={(form.permissions || []).includes(p.key)} onChange={() => togglePerm(p.key)}
                                                className="mt-0.5 w-4 h-4 accent-violet-600 flex-shrink-0" />
                                            <div>
                                                <p className="text-xs font-bold text-gray-800">{p.label}</p>
                                                <p className="text-[11px] text-gray-400">{p.desc}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                                <button onClick={() => setModal(null)} className="px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100 rounded-xl">Cancel</button>
                                <button onClick={save} disabled={!form.name?.trim()}
                                    className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-bold shadow-sm flex items-center gap-2 disabled:opacity-60">
                                    <Save size={14} />{modal === 'create' ? 'Create Role' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>
        </div>
    );
}
