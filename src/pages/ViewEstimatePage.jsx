import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Download, Edit2, Printer,
    FileText, CheckCircle2, Phone, MapPin
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import { useCompanySettings, getCurrencySymbol } from '../hooks/useCompanySettings';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function ViewEstimatePage() {
    const { id } = useParams();
    const { companyId } = useAuth();
    const navigate = useNavigate();
    const { settings } = useCompanySettings(companyId);
    const currSym = getCurrencySymbol(settings.currency);

    const [estimate, setEstimate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!companyId || !id) return;
        FirestoreService.getById('estimates', id)
            .then(est => {
                if (!est) { setNotFound(true); return; }
                setEstimate(est);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [companyId, id]);

    const handleDownload = () => {
        if (!estimate) return;
        generateInvoicePDF(
            {
                ...estimate,
                totalAmount: estimate.amount || estimate.totalAmount,
                currencySymbol: currSym
            },
            {
                name: estimate.customerName,
                address: estimate.customerAddress || '',
                phone: estimate.customerPhone || ''
            },
            estimate.template || settings.defaultTemplate || 'classic'
        );
    };

    if (loading) return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600"></div>
        </div>
    );

    if (notFound) return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
            <FileText size={48} className="mb-4 opacity-20" />
            <h2 className="text-xl font-bold text-gray-900">Estimate Not Found</h2>
            <p className="mt-1">The estimate you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/estimates')} className="mt-6 text-blue-600 font-semibold hover:underline flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Estimates
            </button>
        </div>
    );

    const subtotal = estimate.products?.reduce((acc, row) => acc + (Number(row.price || 0) * Number(row.qty || 1)), 0) || 0;
    const taxAmount = (subtotal * Number(estimate.taxPercent || 0)) / 100;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/estimates')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {estimate.estimateNumber || `EST-${id.slice(-8).toUpperCase()}`}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Valid until {estimate.validUntil || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => navigate(`/estimates/edit/${id}`)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Edit2 size={15} /> Edit
                    </button>
                    <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Printer size={15} /> Print
                    </button>
                    <button onClick={handleDownload} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center gap-2">
                        <Download size={15} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Design View */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[800px] flex flex-col p-8 md:p-12 print:shadow-none print:border-none">
                {/* Branding */}
                <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                            {settings.name?.[0] || 'A'}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">{settings.name || 'AVERQON BILL'}</h2>
                            <p className="text-sm text-gray-500 mt-1 max-w-xs">{settings.address || 'Company Address'}</p>
                        </div>
                    </div>
                    <div className="text-left md:text-right">
                        <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">ESTIMATE</h1>
                        <div className="space-y-1 text-sm">
                            <div className="flex md:justify-end gap-4"><span className="text-gray-400 font-medium">Estimate No.</span> <span className="text-gray-900 font-bold">{estimate.estimateNumber || 'N/A'}</span></div>
                            <div className="flex md:justify-end gap-4"><span className="text-gray-400 font-medium">Valid Until</span> <span className="text-gray-900 font-semibold">{estimate.validUntil || 'N/A'}</span></div>
                            <div className="flex md:justify-end gap-4 pt-2">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${estimate.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                    }`}>
                                    {estimate.status || 'Draft'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Billing Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 py-8 border-t border-b border-gray-100">
                    <div>
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Prepared For</p>
                        <h3 className="text-lg font-bold text-gray-900">{estimate.customerName || 'N/A'}</h3>
                        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-[240px]">{estimate.customerAddress || 'N/A'}</p>
                        <div className="flex items-center gap-2 mt-4 text-sm text-gray-400 font-medium">
                            <Phone size={14} /> {estimate.customerPhone || 'N/A'}
                        </div>
                    </div>
                    <div className="md:text-right text-gray-400">
                        <h4 className="text-sm font-bold text-gray-900 mb-2">Terms & Conditions</h4>
                        <p className="text-xs leading-relaxed max-w-xs md:ml-auto">
                            This estimate is valid for the period specified above.
                            Pricing is subject to change based on project scope modifications.
                        </p>
                    </div>
                </div>

                {/* Items Table */}
                <div className="flex-1 overflow-x-auto mb-12">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-900">
                                <th className="text-left py-4 text-xs font-bold text-gray-900 uppercase">Item Description</th>
                                <th className="text-center py-4 text-xs font-bold text-gray-900 uppercase px-4">Qty</th>
                                <th className="text-right py-4 text-xs font-bold text-gray-900 uppercase">Rate</th>
                                <th className="text-right py-4 text-xs font-bold text-gray-900 uppercase pl-4">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {estimate.products?.map((item, i) => (
                                <tr key={i}>
                                    <td className="py-5 text-sm">
                                        <p className="font-bold text-gray-900">{item.name}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">{item.description || ''}</p>
                                    </td>
                                    <td className="py-5 text-sm text-center font-medium text-gray-600">{item.qty} {item.unit}</td>
                                    <td className="py-5 text-sm text-right font-medium text-gray-600">{currSym}{fmt(item.price)}</td>
                                    <td className="py-5 text-sm text-right font-bold text-gray-900">{currSym}{fmt(item.price * item.qty)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Summary */}
                <div className="flex flex-col md:flex-row justify-between gap-12 mt-auto pt-12 border-t border-gray-100">
                    <div className="md:max-w-xs space-y-4 text-xs text-gray-500 italic">
                        <p>{estimate.notes || 'N/A'}</p>
                    </div>
                    <div className="flex flex-col gap-3 min-w-[240px]">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-500 font-medium">Subtotal</span>
                            <span className="text-gray-900 font-bold">{currSym}{fmt(subtotal)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm pb-4 border-b border-gray-100">
                            <span className="text-gray-500 font-medium">Tax ({estimate.taxPercent}%)</span>
                            <span className="text-gray-900 font-bold">{currSym}{fmt(taxAmount)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                            <span className="text-lg font-black text-gray-900 tracking-tighter">ESTIMATED TOTAL</span>
                            <span className="text-2xl font-black text-blue-600 tracking-tighter">
                                {currSym}{fmt(estimate.amount || estimate.totalAmount)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
