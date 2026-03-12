import React, { useState, useEffect } from 'react';
import {
    Cpu, Zap, Bell, Globe, FileText, RefreshCw, AlertTriangle, TrendingUp,
    ArrowRight, Plus, Trash2, Save,
    CheckCircle2, AlertCircle, ExternalLink, Send, Download
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function AutomationPage() {
    const { companyId } = useAuth();
    const [webhookUrl, setWebhookUrl] = useState('https://n8n-m45f.onrender.com/webhook/averqon-events');
    const [isEnabled, setIsEnabled] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (companyId) {
            getDoc(doc(db, 'automations', companyId)).then(snap => {
                if (snap.exists()) {
                    const data = snap.data();
                    setWebhookUrl(data.webhookUrl || '');
                    setIsEnabled(data.isEnabled || false);
                }
            });
        }
    }, [companyId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            await setDoc(doc(db, 'automations', companyId), {
                webhookUrl,
                isEnabled,
                updatedAt: new Date()
            }, { merge: true });
            setMessage({ type: 'success', text: 'Automation settings saved successfully!' });
        } catch (e) {
            setMessage({ type: 'error', text: 'Failed to save: ' + e.message });
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Zoho Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Workflow Automation</h1>
                    <p className="text-xs text-gray-400 mt-1">Connect your business events to external applications using webhooks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600">
                        <div className={`h-2 w-2 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        {isEnabled ? 'Engine Online' : 'Engine Paused'}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8 no-scrollbar">
                <div className="max-w-4xl mx-auto space-y-8">
                    {/* Settings Card */}
                    <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 bg-gray-50/30 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Primary Configuration</h3>
                            {message && (
                                <span className={`text-xs font-bold ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-600'} animate-in fade-in duration-300`}>
                                    {message.text}
                                </span>
                            )}
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                                <div className="md:col-span-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Webhook URL</label>
                                    <p className="text-[10px] text-gray-400">The endpoint where event payloads will be sent.</p>
                                </div>
                                <div className="md:col-span-3">
                                    <input
                                        type="url"
                                        value={webhookUrl}
                                        onChange={(e) => setWebhookUrl(e.target.value)}
                                        placeholder="https://your-automation-server.com/webhook"
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm font-mono text-blue-600 focus:ring-1 focus:ring-blue-600 outline-none transition-all"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-2">Webhooks are sent as POST requests with a JSON payload.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center border-t border-gray-50 pt-6">
                                <div className="md:col-span-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase block">Streaming Status</label>
                                </div>
                                <div className="md:col-span-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setIsEnabled(!isEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all ${isEnabled ? 'bg-blue-600' : 'bg-gray-200'}`}
                                        >
                                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                        <span className="text-sm font-medium text-gray-700">{isEnabled ? 'Active' : 'Inactive'}</span>
                                    </div>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-[#0067ff] hover:bg-[#0056d6] text-white px-6 py-2 rounded text-sm font-bold shadow-sm disabled:opacity-50 transition-all"
                                    >
                                        {saving ? 'Saving...' : 'Save Settings'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Workflow Library */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Default Triggers</h3>
                            <span className="text-[10px] font-bold text-gray-400">SYSTEM GENERATED</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { id: '01', name: 'Order Telegram Sync', desc: 'Push new orders to your Telegram channel.', event: 'order.created', icon: Send, color: 'text-blue-500' },
                                { id: '02', name: 'Inventory Alerts', desc: 'Notify team when stock levels hit threshold.', event: 'stock.low', icon: AlertTriangle, color: 'text-amber-500' },
                                { id: '03', name: 'Payment Webhooks', desc: 'Reconcile invoice status on payment success.', event: 'payment.received', icon: Zap, color: 'text-emerald-500' },
                                { id: '04', name: 'Daily Insight Sync', desc: 'Summary of daily sales to Google Sheets.', event: 'daily.cron', icon: TrendingUp, color: 'text-indigo-500' },
                            ].map((wf) => (
                                <div key={wf.id} className="p-5 bg-white rounded-lg border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all group">
                                    <div className="flex items-start gap-4">
                                        <div className={`mt-1 h-10 w-10 rounded bg-gray-50 flex items-center justify-center ${wf.color} group-hover:bg-blue-50 transition-colors`}>
                                            <wf.icon size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-bold text-gray-800">{wf.name}</h4>
                                                <span className="text-[10px] font-mono text-gray-300">TRIGGER: {wf.event}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{wf.desc}</p>
                                            <div className="mt-4 flex items-center justify-between">
                                                <div className="flex items-center gap-1.5 opacity-60">
                                                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Ready to sync</span>
                                                </div>
                                                <button className="text-[10px] font-bold text-blue-600 uppercase hover:underline">Config Logic</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Developer Note */}
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-6">
                        <div className="flex items-start gap-4">
                            <div className="mt-1 text-slate-400">
                                <Globe size={20} />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-slate-700">Developer Documentation</h4>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                                    Each event is sent with a <code className="bg-slate-200 px-1 rounded">X-AVERQON-SIG</code> header. You can use our n8n template to quickly parse these events and build complex workflows.
                                </p>
                                <button className="mt-3 text-xs font-bold text-blue-600 flex items-center gap-1">
                                    View Security Specs <ExternalLink size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Bar */}
            <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    AES-256 Event Encryption Active
                </div>
                <div>Averqon Automation v1.2</div>
            </div>
        </div>
    );
}
