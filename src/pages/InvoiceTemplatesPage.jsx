import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Layout, CheckCircle2, Eye, ArrowLeft,
    FileText, ShoppingBag, Briefcase, Minus, Palette
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCompanySettings } from '../hooks/useCompanySettings';
import { FirestoreService } from '../lib/firestore';
import toast from 'react-hot-toast';

const TEMPLATES = [
    {
        id: 'editorial',
        name: 'Editorial (Temp 1)',
        desc: 'Clean, editorial design with cream background, giant heading, and two-column payment footer.',
        icon: FileText,
        color: 'bg-amber-900',
        previewBg: 'bg-amber-50',
        features: ['Cream background', 'Bold typography', 'Two-column footer']
    },
    {
        id: 'classic',
        name: 'Classic',
        desc: 'Traditional table layout with header.',
        icon: Layout,
        color: 'bg-blue-500',
        features: ['GST compliant', 'Standard grids', 'Branding header']
    },
    {
        id: 'modern',
        name: 'Modern',
        desc: 'Clean, minimal with accent colour.',
        icon: Palette,
        color: 'bg-indigo-500',
        features: ['Indigo accent', 'Clean spacing', 'Modern fonts']
    },
    {
        id: 'retail',
        name: 'Retail',
        desc: 'Compact POS-style receipt.',
        icon: ShoppingBag,
        color: 'bg-green-500',
        features: ['Thermal printer ready', '80mm width', 'Compact details']
    },
    {
        id: 'minimal',
        name: 'Minimal',
        desc: 'Borderless, white-space design.',
        icon: Minus,
        color: 'bg-gray-800',
        features: ['No borders', 'Premium spacing', 'Typography focus']
    },
    {
        id: 'professional',
        name: 'Professional',
        desc: 'Navy header with corporate grid layout.',
        icon: Briefcase,
        color: 'bg-slate-900',
        features: ['Solid navy header', 'Sophisticated grid', 'Corporate style']
    },
    {
        id: 'crackers',
        name: 'Crackers Special',
        desc: 'Teal branding with evaluation watermark, "Content" column, and estimation layout.',
        icon: Layout,
        color: 'bg-[#009688]',
        features: ['Teal branding', 'Evaluation watermark', 'Specific product details']
    }
];

export default function InvoiceTemplatesPage() {
    const { companyId } = useAuth();
    const { settings } = useCompanySettings(companyId);
    const navigate = useNavigate();
    const [saving, setSaving] = useState(false);

    const handleSelect = async (templateId) => {
        if (!companyId) return;
        setSaving(true);
        try {
            await FirestoreService.update('companies', companyId, {
                defaultTemplate: templateId
            });
            toast.success(`Default template updated to ${templateId}`);
        } catch (e) {
            console.error(e);
            toast.error('Failed to update default template');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Invoice Templates</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Choose the design that represents your brand best.</p>
                    </div>
                </div>
            </div>

            {/* Template Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {TEMPLATES.map((t) => {
                    const isDefault = settings.defaultTemplate === t.id;
                    return (
                        <div
                            key={t.id}
                            className={`group bg-white rounded-3xl border-2 transition-all overflow-hidden flex flex-col ${isDefault ? 'border-blue-600 ring-4 ring-blue-50' : 'border-gray-100 hover:border-gray-300'
                                }`}
                        >
                            {/* Visual Preview (Mockup) */}
                            <div className={`h-48 relative overflow-hidden flex items-center justify-center border-b border-gray-100 ${t.id === 'editorial' ? 'bg-amber-50' : 'bg-gray-50'}`}>
                                {t.id === 'editorial' ? (
                                    /* Editorial custom preview */
                                    <div className="w-36 h-44 bg-[#f8f6ed] shadow-lg rounded-sm p-3 scale-100 group-hover:scale-110 transition-transform duration-500">
                                        <div className="text-[11px] font-black text-gray-900 leading-none mb-1">Invoice</div>
                                        <div className="h-[0.5px] bg-gray-400 w-full mb-1" />
                                        <div className="text-[5px] text-gray-500 mb-2">Billed to: Customer Name</div>
                                        <div className="h-[0.5px] bg-gray-300 w-full mb-1" />
                                        <div className="flex justify-between text-[4px] font-bold text-gray-700 border-b border-gray-300 pb-0.5 mb-0.5">
                                            <span>Description</span><span>Rate</span><span>Hrs</span><span>Amt</span>
                                        </div>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex justify-between text-[4px] text-gray-500 border-b border-gray-100 py-0.5">
                                                <span>Service {i}</span><span>$50</span><span>{i * 5}</span><span>$250</span>
                                            </div>
                                        ))}
                                        <div className="mt-1 text-right text-[4px] font-bold text-gray-800">Total $750</div>
                                        <div className="absolute bottom-2 left-0 right-0 h-[0.5px] mx-3 bg-gray-300" />
                                        <div className="absolute bottom-1 left-3 right-3 flex justify-between text-[3.5px] text-gray-400">
                                            <span>Payment Info</span><span>Company</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Generic mockup for other templates */
                                    <div className={`w-32 h-44 bg-white shadow-lg rounded-sm border-t-8 ${t.color.replace('bg-', 'border-')} p-2 space-y-1 scale-100 group-hover:scale-110 transition-transform duration-500`}>
                                        <div className="h-1 w-8 bg-gray-200" />
                                        <div className="h-1 w-12 bg-gray-100" />
                                        <div className="h-8 w-full border border-gray-50 mt-2" />
                                        <div className="h-4 w-full bg-gray-50" />
                                        <div className="h-4 w-full bg-gray-50" />
                                        <div className="absolute bottom-2 right-2 h-2 w-8 bg-blue-100" />
                                    </div>
                                )}

                                {isDefault && (
                                    <div className="absolute top-4 right-4 bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                                        <CheckCircle2 size={16} />
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className={`p-2 rounded-xl text-white ${t.color}`}>
                                        <t.icon size={16} />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{t.name}</h3>
                                </div>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{t.desc}</p>

                                <div className="space-y-2 mb-6">
                                    {t.features.map(f => (
                                        <div key={f} className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                            <div className="h-1 w-1 rounded-full bg-gray-300" />
                                            {f}
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-auto flex items-center gap-2">
                                    <button
                                        onClick={() => handleSelect(t.id)}
                                        disabled={isDefault || saving}
                                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${isDefault
                                            ? 'bg-gray-100 text-gray-500 cursor-default'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                            }`}
                                    >
                                        {isDefault ? 'Current Default' : 'Set as Default'}
                                    </button>
                                    <button className="p-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors">
                                        <Eye size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
