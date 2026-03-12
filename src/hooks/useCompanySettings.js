import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Fetches and caches company settings from Firestore using real-time listener.
 */
const DEFAULT_SETTINGS = {
    name: '', taxId: '', address: '', phone: '', supportEmail: '', website: '', logoUrl: '',
    invoicePrefix: 'INV-', estimatePrefix: 'EST-', dispatchPrefix: 'DSP-',
    nextInvoiceSequence: 1001, defaultTemplate: 'classic',
    currency: 'INR (₹)', paymentTerms: 'Net 30',
    enableGST: true, gstRate: 18, showHSN: false,
    enableCGST: true, enableIGST: false,
    footerNote: 'Thank you for your business!',
    upiId: '', bankName: '', bankAccount: '', bankIFSC: '',
    paymentMethods: { cash: true, upi: true, card: false, online: false, cheque: false },
};

export function useCompanySettings(companyId) {
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!companyId || companyId === 'platform') {
            setLoading(false);
            return;
        }

        setLoading(true);
        const unsubscribe = onSnapshot(doc(db, 'companies', companyId), (snap) => {
            if (snap.exists()) {
                setSettings({ ...DEFAULT_SETTINGS, ...snap.data() });
            } else {
                setSettings(DEFAULT_SETTINGS);
            }
            setLoading(false);
        }, (err) => {
            console.error('useCompanySettings error:', err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [companyId]);

    return { settings, loading };
}

/** Helper: derive currency symbol from settings.currency string */
export function getCurrencySymbol(currency = 'INR (₹)') {
    const match = currency.match(/\((.+)\)/);
    return match ? match[1] : '₹';
}

/** Helper: build the next invoice/estimate number string */
export function buildDocNumber(prefix = 'INV-', sequence = 1001) {
    return `${prefix}${String(sequence).padStart(4, '0')}`;
}
