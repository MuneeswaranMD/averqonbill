import React, { useState, useEffect } from 'react';
import {
    Globe, Plus, ShieldCheck, ExternalLink, RefreshCw,
    Trash2, Save, X, Settings2, Info, CheckCircle2,
    ShoppingBag, Zap, Layers, Package, Code2, AlertTriangle, Link2
} from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { INTEGRATION_PLATFORMS } from '../config/integrations';
import * as Icons from 'lucide-react';
import { toast } from 'react-hot-toast';

const WEBHOOK_BASE_URL = window.location.origin + '/api/integrations';

export default function IntegrationsPage() {
    const { companyId } = useAuth();
    const [integrations, setIntegrations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null); // { platformId, action: 'connect' | 'view' }
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (companyId) loadIntegrations();
    }, [companyId]);

    const loadIntegrations = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'integrations'), where('companyId', '==', companyId));
            const snap = await getDocs(q);
            setIntegrations(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (e) {
            console.error(e);
            toast.error('Failed to load integrations');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = (platform) => {
        const initialForm = platform.fields.reduce((acc, f) => {
            acc[f.id] = f.id === 'apiKey' && platform.id === 'custom' ? Math.random().toString(36).substring(2, 15) : '';
            return acc;
        }, {});
        setForm(initialForm);
        setModal({ platformId: platform.id, action: 'connect' });
    };

    const saveIntegration = async () => {
        setSaving(true);
        try {
            const platform = INTEGRATION_PLATFORMS.find(p => p.id === modal.platformId);
            const payload = {
                companyId,
                platformId: modal.platformId,
                platformName: platform.name,
                config: form,
                status: 'active',
                webhookUrl: `${WEBHOOK_BASE_URL}/${modal.platformId}/${companyId}`,
                createdAt: serverTimestamp(),
                lastSync: null
            };

            const ref = await addDoc(collection(db, 'integrations'), payload);
            setIntegrations(prev => [{ id: ref.id, ...payload }, ...prev]);
            setModal(null);
            toast.success(`${platform.name} connected successfully!`);
        } catch (e) {
            console.error(e);
            toast.error('Failed to save integration');
        } finally {
            setSaving(false);
        }
    };

    const disconnect = async (id, name) => {
        if (!confirm(`Are you sure you want to disconnect ${name}? Order syncing will stop.`)) return;
        try {
            await deleteDoc(doc(db, 'integrations', id));
            setIntegrations(prev => prev.filter(i => i.id !== id));
            toast.success('Disconnected successfully');
        } catch (e) {
            toast.error('Failed to disconnect');
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full" /></div>;

    return (
        <div className="space-y-8 pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Integrations</h1>
                    <p className="text-sm text-gray-500 mt-1">Connect your e-commerce platforms to pull orders automatically.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Bank-grade Security</span>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                    { label: 'Active Channels', value: integrations.length, icon: Globe, color: 'indigo' },
                    { label: 'Orders Synced', value: '4.2k', icon: RefreshCw, color: 'emerald' },
                    { label: 'System Health', value: '100%', icon: CheckCircle2, color: 'blue' },
                ].map((s, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{s.label}</p>
                            <p className="text-2xl font-black text-gray-900">{s.value}</p>
                        </div>
                        <div className={`h-12 w-12 rounded-2xl bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center`}>
                            <s.icon size={22} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Available Platforms */}
                <div className="xl:col-span-2 space-y-6">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Link2 size={16} className="text-indigo-600" /> Choose a Platform
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {INTEGRATION_PLATFORMS.map((platform) => {
                            const isConnected = integrations.some(i => i.platformId === platform.id);
                            const IconComp = Icons[platform.icon] || Globe;

                            return (
                                <div
                                    key={platform.id}
                                    className={`group bg-white p-5 rounded-2xl border transition-all relative overflow-hidden ${isConnected ? 'border-indigo-200 shadow-md' : 'border-gray-200 hover:border-indigo-300 hover:shadow-lg'
                                        }`}
                                >
                                    {platform.badge && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-indigo-600 text-[9px] font-bold text-white rounded-bl-xl uppercase tracking-widest">
                                            {platform.badge}
                                        </div>
                                    )}
                                    <div className="flex items-start gap-4">
                                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-white shadow-lg ${platform.color}`}>
                                            <IconComp size={24} />
                                        </div>
                                        <div className="flex-1 pr-6">
                                            <h3 className="text-sm font-black text-gray-900">{platform.name}</h3>
                                            <p className="text-[11px] text-gray-500 leading-relaxed mt-1">{platform.description}</p>
                                        </div>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-50">
                                        {isConnected ? (
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-[11px] uppercase">
                                                <CheckCircle2 size={14} /> Linked
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 font-medium italic">Supports Webhooks</span>
                                        )}
                                        <button
                                            onClick={() => handleConnect(platform)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${isConnected
                                                    ? 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                                                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                                                }`}
                                        >
                                            {isConnected ? 'Manage' : 'Connect'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Sidebar */}
                <div className="space-y-6">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                        <Globe size={16} className="text-emerald-600" /> Active Connections
                    </h2>
                    <div className="space-y-3">
                        {integrations.length === 0 ? (
                            <div className="bg-gray-50 border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                                <Info size={24} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-xs text-gray-400 font-medium">No active store connections</p>
                            </div>
                        ) : integrations.map((int) => {
                            const platform = INTEGRATION_PLATFORMS.find(p => p.id === int.platformId) || {};
                            const IconComp = Icons[platform.icon] || Globe;
                            return (
                                <div key={int.id} className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition-all group">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white ${platform.color || 'bg-gray-400'}`}>
                                        <IconComp size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-900 truncate">{int.config.storeUrl || int.platformName}</p>
                                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">Active Network</p>
                                    </div>
                                    <button
                                        onClick={() => disconnect(int.id, int.platformName)}
                                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl">
                        <h3 className="font-bold flex items-center gap-2 mb-2">
                            <Zap size={18} /> Automation Ready
                        </h3>
                        <p className="text-xs text-indigo-100 leading-relaxed mb-4">
                            Orders from your connected stores will automatically trigger your active automation workflows.
                        </p>
                        <button className="w-full bg-white/20 hover:bg-white/30 text-white rounded-xl py-2.5 text-xs font-bold transition-all border border-white/10 backdrop-blur-sm">
                            Configure Workflows
                        </button>
                    </div>
                </div>
            </div>

            {/* Connection Modal */}
            <AnimatePresence>
                {modal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white ${INTEGRATION_PLATFORMS.find(p => p.id === modal.platformId).color}`}>
                                        {React.createElement(Icons[INTEGRATION_PLATFORMS.find(p => p.id === modal.platformId).icon] || Globe, { size: 20 })}
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black text-gray-900">Connect {INTEGRATION_PLATFORMS.find(p => p.id === modal.platformId).name}</h2>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Configure API Handshake</p>
                                    </div>
                                </div>
                                <button onClick={() => setModal(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Modal Content */}
                            <div className="p-8 space-y-6">
                                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                                    <Info size={18} className="text-amber-600 flex-shrink-0" />
                                    <p className="text-[11px] text-amber-700 font-medium leading-relaxed">
                                        You'll need to generate API credentials in your store's admin panel to complete the connection.
                                        Once connected, we'll provide a <b>Webhook URL</b> to enable real-time order sync.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    {INTEGRATION_PLATFORMS.find(p => p.id === modal.platformId).fields.map((field) => (
                                        <div key={field.id} className="space-y-1.5">
                                            <label className="text-xs font-bold text-gray-600 px-1">{field.label}</label>
                                            <div className="relative">
                                                <input
                                                    type={field.type}
                                                    value={form[field.id] || ''}
                                                    readOnly={field.readOnly}
                                                    onChange={(e) => setForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all font-medium"
                                                />
                                                {field.readOnly && (
                                                    <button
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(form[field.id]);
                                                            toast.success('Copied to clipboard');
                                                        }}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    >
                                                        <Icons.Copy size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {integrations.find(i => i.platformId === modal.platformId) && (
                                    <div className="space-y-1.5 pt-4 border-t border-gray-100">
                                        <label className="text-xs font-bold text-gray-600 px-1">Webhook URL (Target URL)</label>
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                                            <code className="text-[10px] font-mono text-indigo-600 flex-1 truncate">
                                                {integrations.find(i => i.platformId === modal.platformId).webhookUrl}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(integrations.find(i => i.platformId === modal.platformId).webhookUrl);
                                                    toast.success('Webhook URL copied');
                                                }}
                                                className="p-1 px-2.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                                            >
                                                Copy URL
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                                <button
                                    onClick={() => setModal(null)}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                                {!integrations.find(i => i.platformId === modal.platformId) && (
                                    <button
                                        disabled={saving}
                                        onClick={saveIntegration}
                                        className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-black rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
                                    >
                                        {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                        Initialize Integration
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
