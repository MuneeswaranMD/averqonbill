import React, { useState } from 'react';
import {
    Truck, Search, Package, CheckCircle2, Clock,
    ArrowRight, MapPin, ExternalLink, Copy, ChevronRight,
    AlertCircle, Loader2
} from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { COURIERS, getTrackingUrl } from './DispatchPage';

/* ── Status timeline steps ─────────────────────────────── */
const STEPS = [
    { key: 'Pending', label: 'Order Confirmed', icon: Package },
    { key: 'Packed', label: 'Packed', icon: Package },
    { key: 'Shipped', label: 'Shipped', icon: Truck },
    { key: 'In Transit', label: 'In Transit', icon: Truck },
    { key: 'Out for Delivery', label: 'Out for Delivery', icon: MapPin },
    { key: 'Delivered', label: 'Delivered', icon: CheckCircle2 },
];

const STATUS_ORDER = STEPS.map(s => s.key);

function getStepIndex(status) {
    const i = STATUS_ORDER.indexOf(status);
    return i >= 0 ? i : 0;
}

export default function TrackOrderPage() {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);       // dispatch doc
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const handleTrack = async (e) => {
        e.preventDefault();
        const val = input.trim().toUpperCase();
        if (!val) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Search by tracking number first, then by orderRef
            let found = null;

            const byTracking = query(
                collection(db, 'dispatches'),
                where('trackingNumber', '==', val)
            );
            const snap1 = await getDocs(byTracking);
            if (!snap1.empty) {
                found = { id: snap1.docs[0].id, ...snap1.docs[0].data() };
            }

            // Try original case as well (tracking numbers are case-sensitive sometimes)
            if (!found) {
                const byTrackingLower = query(
                    collection(db, 'dispatches'),
                    where('trackingNumber', '==', input.trim())
                );
                const snap1b = await getDocs(byTrackingLower);
                if (!snap1b.empty) {
                    found = { id: snap1b.docs[0].id, ...snap1b.docs[0].data() };
                }
            }

            if (!found) {
                const byOrderRef = query(
                    collection(db, 'dispatches'),
                    where('orderRef', '==', val)
                );
                const snap2 = await getDocs(byOrderRef);
                if (!snap2.empty) {
                    found = { id: snap2.docs[0].id, ...snap2.docs[0].data() };
                }
            }

            if (!found) {
                setError('No shipment found for that tracking number or order ID. Please check and try again.');
            } else {
                setResult(found);
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const reset = () => { setResult(null); setError(''); setInput(''); };

    const courier = result ? COURIERS.find(c => c.name === result.courierName) : null;
    const trackUrl = result ? (result.trackingUrl || getTrackingUrl(result.courierName, result.trackingNumber)) : null;
    const stepIndex = result ? getStepIndex(result.status) : 0;
    const isDelivered = result?.status === 'Delivered';
    const isReturned = result?.status === 'Returned';

    const copyLink = () => {
        if (!trackUrl) return;
        navigator.clipboard.writeText(trackUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col">
            {/* Top nav bar */}
            <nav className="px-6 py-4 flex items-center justify-between border-b border-white/10">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                        <Truck size={16} className="text-white" />
                    </div>
                    <span className="text-white font-bold text-sm tracking-wide">Averqon</span>
                    <span className="text-white/40 text-sm">/ Track Order</span>
                </div>
            </nav>

            <div className="flex-1 flex flex-col items-center justify-start px-4 pt-14 pb-20">
                {/* Hero */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
                        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Live Order Tracking
                    </div>
                    <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
                        Track Your Shipment
                    </h1>
                    <p className="text-white/50 text-base max-w-md mx-auto">
                        Enter your tracking number or order ID to get real-time status of your delivery.
                    </p>
                </div>

                {/* Search box */}
                {!result && (
                    <form onSubmit={handleTrack} className="w-full max-w-xl">
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-2 flex gap-2">
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    value={input}
                                    onChange={e => setInput(e.target.value)}
                                    placeholder="e.g. DT123456789IN or ORD-ABC123"
                                    className="w-full bg-transparent text-white placeholder-white/30 pl-10 pr-4 py-3 text-sm outline-none"
                                    autoFocus
                                />
                            </div>
                            <button type="submit" disabled={loading || !input.trim()}
                                className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading
                                    ? <Loader2 size={15} className="animate-spin" />
                                    : <><Search size={15} /> Track</>
                                }
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="mt-3 flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm px-4 py-3 rounded-xl">
                                <AlertCircle size={15} className="flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <p className="text-center text-white/30 text-xs mt-4">
                            Tracking number provided by the seller on your order confirmation
                        </p>
                    </form>
                )}

                {/* Result card */}
                {result && (
                    <div className="w-full max-w-xl space-y-4">
                        {/* Courier + status header */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                            <div className="flex items-start justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-xl flex items-center justify-center"
                                        style={{ background: courier?.bg || '#1E293B' }}>
                                        <Truck size={22} style={{ color: courier?.color || '#94A3B8' }} />
                                    </div>
                                    <div>
                                        <p className="text-white font-bold text-base">{result.courierName || 'Courier'}</p>
                                        <p className="text-white/50 text-xs font-mono mt-0.5">{result.trackingNumber}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${isDelivered ? 'bg-green-500/20 text-green-300' :
                                        isReturned ? 'bg-red-500/20 text-red-300' :
                                            'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {result.status}
                                </span>
                            </div>

                            {/* Progress timeline */}
                            {!isReturned && (
                                <div className="relative">
                                    <div className="flex justify-between items-start gap-1">
                                        {STEPS.map((step, i) => {
                                            const done = i <= stepIndex;
                                            const active = i === stepIndex;
                                            const Icon = step.icon;
                                            return (
                                                <div key={step.key} className="flex flex-col items-center flex-1 min-w-0">
                                                    {/* connector line */}
                                                    <div className="flex items-center w-full mb-2">
                                                        {i > 0 && (
                                                            <div className={`flex-1 h-0.5 rounded-full transition-all ${done ? 'bg-blue-500' : 'bg-white/10'}`} />
                                                        )}
                                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${active ? 'bg-blue-500 ring-4 ring-blue-500/25 scale-110' :
                                                                done ? 'bg-blue-600/80' :
                                                                    'bg-white/10'
                                                            }`}>
                                                            <Icon size={12} className={done ? 'text-white' : 'text-white/30'} />
                                                        </div>
                                                        {i < STEPS.length - 1 && (
                                                            <div className={`flex-1 h-0.5 rounded-full transition-all ${i < stepIndex ? 'bg-blue-500' : 'bg-white/10'}`} />
                                                        )}
                                                    </div>
                                                    <p className={`text-center text-[10px] leading-tight ${active ? 'text-blue-300 font-semibold' : done ? 'text-white/60' : 'text-white/25'}`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {isReturned && (
                                <div className="text-center py-3 bg-red-500/10 rounded-xl">
                                    <p className="text-red-300 text-sm font-semibold">This shipment has been returned.</p>
                                </div>
                            )}
                        </div>

                        {/* Order details */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3">
                            <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">Shipment Details</h3>
                            {[
                                { label: 'Customer', value: result.customerName },
                                { label: 'Order Ref', value: result.orderRef },
                                { label: 'Dispatch Date', value: result.dispatchDate },
                                { label: 'Courier', value: result.courierName },
                                { label: 'Tracking No.', value: result.trackingNumber, mono: true },
                            ].filter(r => r.value).map(row => (
                                <div key={row.label} className="flex items-center justify-between py-1 border-b border-white/5 last:border-0">
                                    <span className="text-white/40 text-sm">{row.label}</span>
                                    <span className={`text-white/80 text-sm ${row.mono ? 'font-mono' : 'font-medium'}`}>{row.value}</span>
                                </div>
                            ))}
                            {result.notes && (
                                <p className="text-white/40 text-xs pt-1 italic">"{result.notes}"</p>
                            )}
                        </div>

                        {/* CTA buttons */}
                        {trackUrl && (
                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3">
                                <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">Live Courier Tracking</h3>
                                <div className="flex items-center gap-2 bg-black/20 rounded-xl px-3 py-2">
                                    <span className="flex-1 text-xs text-white/40 font-mono truncate">{trackUrl}</span>
                                    <button onClick={copyLink}
                                        className={`text-xs font-semibold px-2 py-1 rounded-md transition-colors ${copied ? 'text-green-400' : 'text-blue-400 hover:text-blue-300'}`}>
                                        <Copy size={12} />
                                    </button>
                                </div>
                                <a href={trackUrl} target="_blank" rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors">
                                    <ExternalLink size={15} />
                                    Track on {result.courierName} Website
                                    <ArrowRight size={14} />
                                </a>
                            </div>
                        )}

                        {/* Search again */}
                        <button onClick={reset}
                            className="w-full py-3 border border-white/10 text-white/50 hover:text-white/80 hover:border-white/20 rounded-xl text-sm font-medium transition-colors">
                            ← Track Another Order
                        </button>
                    </div>
                )}

                {/* How it works */}
                {!result && !loading && (
                    <div className="mt-16 w-full max-w-xl">
                        <p className="text-center text-white/30 text-xs font-semibold uppercase tracking-wider mb-6">How it works</p>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { num: '01', title: 'Enter Tracking ID', desc: 'Use the tracking number from your order confirmation' },
                                { num: '02', title: 'Get Status', desc: 'See your shipment status and current location' },
                                { num: '03', title: 'Track Live', desc: 'Click to track on the courier\'s official website' },
                            ].map(step => (
                                <div key={step.num} className="bg-white/5 rounded-xl p-4 text-center border border-white/5">
                                    <div className="text-blue-400 font-bold text-lg mb-2">{step.num}</div>
                                    <p className="text-white/70 text-xs font-semibold mb-1">{step.title}</p>
                                    <p className="text-white/30 text-xs leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/10 px-6 py-4 text-center">
                <p className="text-white/20 text-xs">Powered by <span className="text-white/40 font-semibold">Averqon Billing</span></p>
            </footer>
        </div>
    );
}
