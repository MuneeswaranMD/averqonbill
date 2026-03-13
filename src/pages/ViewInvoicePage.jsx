import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, Download, Edit2, Share2, Printer,
    FileText, CheckCircle2, Clock, MapPin, Phone, Mail, Building2
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import { useCompanySettings, getCurrencySymbol } from '../hooks/useCompanySettings';

const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

export default function ViewInvoicePage() {
    const { id } = useParams();
    const { companyId } = useAuth();
    const navigate = useNavigate();
    const { settings } = useCompanySettings(companyId);
    const currSym = getCurrencySymbol(settings.currency);

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!companyId || !id) return;
        FirestoreService.getById('invoices', id)
            .then(inv => {
                if (!inv) { setNotFound(true); return; }
                setInvoice(inv);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [companyId, id]);

    const handleDownload = () => {
        if (!invoice) return;
        generateInvoicePDF(
            {
                ...invoice,
                totalAmount: invoice.amount || invoice.totalAmount,
                currencySymbol: currSym
            },
            {
                name: invoice.customerName,
                address: invoice.customerAddress || '',
                phone: invoice.customerPhone || ''
            },
            invoice.template || settings.defaultTemplate || 'classic'
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
            <h2 className="text-xl font-bold text-gray-900">Invoice Not Found</h2>
            <p className="mt-1">The invoice you're looking for doesn't exist or has been deleted.</p>
            <button onClick={() => navigate('/invoices')} className="mt-6 text-blue-600 font-semibold hover:underline flex items-center gap-2">
                <ArrowLeft size={16} /> Back to Invoices
            </button>
        </div>
    );

    const subtotal = invoice.products?.reduce((acc, row) => acc + (Number(row.price || 0) * Number(row.qty || 1)), 0) || 0;
    const taxAmount = (subtotal * Number(invoice.taxPercent || 0)) / 100;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            {/* Header / Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 no-print">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/invoices')} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            {invoice.invoiceNumber || `INV-${id.slice(-8).toUpperCase()}`}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Created on {invoice.invoiceDate || 'N/A'}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => navigate(`/invoices/edit/${id}`)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Edit2 size={15} /> Edit
                    </button>
                    <button onClick={() => window.print()} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2">
                        <Printer size={15} /> Print
                    </button>
                    <button onClick={handleDownload} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-shadow shadow-sm flex items-center gap-2">
                        <Download size={15} /> Download PDF
                    </button>
                </div>
            </div>

            {/* Invoice Design View */}
            {invoice.template === 'crackers' ? (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[1000px] flex flex-col relative print:shadow-none print:border-none">
                    {/* Watermark Logo */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
                        <div className="relative w-[500px] h-[500px] border-[10px] border-[#009688] rounded-full flex items-center justify-center">
                            <div className="absolute inset-0">
                                {[...Array(36)].map((_, i) => (
                                    <div key={i} className="absolute w-full h-[2px] bg-[#009688] top-1/2 left-0" style={{ transform: `rotate(${i * 10}deg)` }}>
                                        <div className="w-20 h-full bg-[#009688] float-right" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-[120px] font-black text-[#009688] flex flex-col items-center leading-none">
                                <span>M</span>
                                <span>P</span>
                                <span>D</span>
                            </div>
                            <div className="absolute right-10 bottom-20 text-[200px] font-black text-[#009688]">Q</div>
                        </div>
                    </div>

                    {/* Teal Header Bar */}
                    <div className="bg-[#009688] px-6 py-2 flex justify-between items-center text-white text-xs font-bold">
                        <span>Enquiry No : {invoice.invoiceNumber || 'N/A'}</span>
                        <span className="text-lg uppercase tracking-widest">Estimation</span>
                        <span>Date : {invoice.invoiceDate || 'N/A'}</span>
                    </div>

                    <div className="p-8 md:p-12 flex-1 flex flex-col relative z-10">
                        {/* Store & Customer Info */}
                        <div className="flex flex-col md:flex-row justify-between gap-8 mb-10">
                            <div>
                                <h2 className="text-2xl font-black text-[#009688] mb-1">{settings.name || 'Sree kaliswari Traders'}</h2>
                                <p className="text-sm font-bold text-gray-700">{settings.address || 'Sivakasi'}</p>
                                <p className="text-sm text-gray-500 mt-2">Phone : {settings.phone || '9943749750 , 9943749750'}</p>
                            </div>
                            <div className="md:text-right">
                                <h3 className="text-xl font-bold text-gray-900">{invoice.customerName || 'Customer Name'}</h3>
                                <p className="text-sm text-gray-500 mt-1 max-w-[240px] md:ml-auto">{invoice.customerAddress || 'Customer Address'}</p>
                                <p className="text-sm text-gray-500 mt-2">Email : {invoice.customerEmail || 'N/A'}</p>
                                <p className="text-sm text-gray-500">Phone : {invoice.customerPhone || 'N/A'}</p>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="flex-1 overflow-x-auto mb-10">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-[#009688] text-white">
                                        <th className="border border-teal-700/20 py-3 px-4 text-xs font-bold uppercase w-16">S No</th>
                                        <th className="border border-teal-700/20 py-3 px-4 text-left text-xs font-bold uppercase">Product Name</th>
                                        <th className="border border-teal-700/20 py-3 px-4 text-center text-xs font-bold uppercase w-24">Content</th>
                                        <th className="border border-teal-700/20 py-3 px-4 text-center text-xs font-bold uppercase w-20">Qty</th>
                                        <th className="border border-teal-700/20 py-3 px-4 text-right text-xs font-bold uppercase w-28">Rate</th>
                                        <th className="border border-teal-700/20 py-3 px-4 text-right text-xs font-bold uppercase w-32">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {invoice.products?.map((item, i) => (
                                        <tr key={i} className="border-b border-gray-100 italic font-medium text-gray-700">
                                            <td className="border border-gray-100 py-3 px-4 text-center text-sm">{i + 1}</td>
                                            <td className="border border-gray-100 py-3 px-4 text-sm uppercase">{item.name}</td>
                                            <td className="border border-gray-100 py-3 px-4 text-center text-sm">{item.unit || '1 BOX'}</td>
                                            <td className="border border-gray-100 py-3 px-4 text-center text-sm">{item.qty}</td>
                                            <td className="border border-gray-100 py-3 px-4 text-right text-sm">{fmt(item.price)}</td>
                                            <td className="border border-gray-100 py-3 px-4 text-right text-sm font-bold text-gray-900">{fmt(item.price * item.qty)}</td>
                                        </tr>
                                    ))}
                                    {/* Fill empty rows to maintain height if needed */}
                                    {[...Array(Math.max(0, 10 - (invoice.products?.length || 0)))].map((_, i) => (
                                        <tr key={`empty-${i}`} className="border-b border-gray-50 h-10">
                                            <td className="border border-gray-50" /><td className="border border-gray-50" /><td className="border border-gray-50" /><td className="border border-gray-50" /><td className="border border-gray-50" /><td className="border border-gray-50" />
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-gray-200 mt-auto">
                            <div className="p-6 border-r border-gray-200">
                                <h4 className="text-sm font-black text-[#009688] uppercase mb-4">Payments Details</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p><span className="font-bold">Bank name :</span> {settings.bankName || 'N/A'}</p>
                                    <p><span className="font-bold">Acc Holder Name :</span> {settings.name || 'N/A'}</p>
                                    <p><span className="font-bold">IFSC Code :</span> {settings.bankIFSC || 'N/A'}</p>
                                    <p><span className="font-bold">UPI ID :</span> {settings.phone || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between p-3 border-b border-gray-200 text-sm">
                                        <span className="text-gray-500 font-bold">Net Total:</span>
                                        <span className="font-bold">{fmt(subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between p-3 border-b border-gray-200 text-sm">
                                        <span className="text-gray-500 font-bold">Discount With Total:</span>
                                        <span className="font-bold text-red-600">-{fmt(invoice.discount)}</span>
                                    </div>
                                    <div className="flex justify-between p-3 border-b border-gray-200 text-sm">
                                        <span className="text-gray-500 font-bold">Package Charge:</span>
                                        <span className="font-bold">0.00</span>
                                    </div>
                                    <div className="flex justify-between p-4 bg-gray-50 text-xl font-black text-[#009688]">
                                        <span>Total:</span>
                                        <span>{currSym}{fmt(invoice.amount || invoice.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="text-center mt-8 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                            Page 1 of 1
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden min-h-[800px] flex flex-col p-8 md:p-12 print:shadow-none print:border-none">
                    {/* Branding & Meta */}
                    <div className="flex flex-col md:flex-row justify-between gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                                {settings.name?.[0] || 'A'}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{settings.name || 'AVERQON BILL'}</h2>
                                <p className="text-sm text-gray-500 mt-1 max-w-xs">{settings.address || 'Company Address'}</p>
                                <p className="text-sm text-gray-500">GST: {settings.taxId || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">INVOICE</h1>
                            <div className="space-y-1 text-sm">
                                <div className="flex md:justify-end gap-4"><span className="text-gray-400 font-medium">Invoice No.</span> <span className="text-gray-900 font-bold">{invoice.invoiceNumber || 'N/A'}</span></div>
                                <div className="flex md:justify-end gap-4"><span className="text-gray-400 font-medium">Date</span> <span className="text-gray-900 font-semibold">{invoice.invoiceDate || 'N/A'}</span></div>
                                <div className="flex md:justify-end gap-4"><span className="text-gray-400 font-medium">Due Date</span> <span className="text-gray-900 font-semibold">{invoice.dueDate || 'N/A'}</span></div>
                                <div className="flex md:justify-end gap-4 pt-2">
                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${invoice.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                        {invoice.status || 'Draft'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Billing Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12 py-8 border-t border-b border-gray-100">
                        <div>
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Bill To</p>
                            <h3 className="text-lg font-bold text-gray-900">{invoice.customerName || 'N/A'}</h3>
                            <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-[240px]">{invoice.customerAddress || 'N/A'}</p>
                            <div className="flex items-center gap-2 mt-4 text-sm text-gray-400 font-medium">
                                <Phone size={14} /> {invoice.customerPhone || 'N/A'}
                            </div>
                        </div>
                        <div className="md:text-right">
                            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">Contact Details</p>
                            <p className="text-sm text-gray-900 font-semibold">{settings.supportEmail || 'billing@example.com'}</p>
                            <p className="text-sm text-gray-500 mt-1">{settings.phone || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{settings.website || 'www.averqon.com'}</p>
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
                                {invoice.products?.map((item, i) => (
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
                        <div className="md:max-w-xs space-y-4">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Terms & Notes</p>
                                <p className="text-xs text-gray-500 italic leading-relaxed">{invoice.notes || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Info</p>
                                <div className="text-[11px] text-gray-500 space-y-0.5">
                                    <p>Bank: {settings.bankName || 'N/A'}</p>
                                    <p>Acc: {settings.bankAccount || 'N/A'}</p>
                                    <p>IFSC: {settings.bankIFSC || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 min-w-[240px]">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-500 font-medium">Subtotal</span>
                                <span className="text-gray-900 font-bold">{currSym}{fmt(subtotal)}</span>
                            </div>
                            {invoice.discount > 0 && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-500 font-medium">Discount</span>
                                    <span className="text-red-500 font-bold">-{currSym}{fmt(invoice.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm pb-4 border-b border-gray-100">
                                <span className="text-gray-500 font-medium">GST ({invoice.taxPercent}%)</span>
                                <span className="text-gray-900 font-bold">{currSym}{fmt(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-lg font-black text-gray-900 tracking-tighter">TOTAL AMOUNT</span>
                                <span className="text-2xl font-black text-blue-600 tracking-tighter">
                                    {currSym}{fmt(invoice.amount || invoice.totalAmount)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
