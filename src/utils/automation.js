import { db } from '../lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export const AutomationService = {
    /**
     * Triggers the configured webhook for a given company and event.
     */
    async trigger(companyId, eventName, data) {
        let webhookUrl = 'https://n8n-m45f.onrender.com/webhook/averqon-events';
        let isEnabled = true;

        try {
            // 1. Attempt to fetch custom automation settings
            const snap = await getDoc(doc(db, 'automations', companyId));
            
            if (snap.exists()) {
                const config = snap.data();
                if (config.webhookUrl) webhookUrl = config.webhookUrl;
                if (config.isEnabled !== undefined) isEnabled = config.isEnabled;
            }
        } catch (e) {
            // Silent fallback on permission errors or network issues
            console.warn('Automation: Using default fallback due to settings access restrictions.');
        }

        if (!isEnabled || !webhookUrl) return;

        try {
            // 2. Prepare payload
            const payload = {
                event: eventName,
                companyId: companyId,
                timestamp: new Date().toISOString(),
                data: data
            };

            // 3. Send Webhook (Fire and forget)
            // We use no-cors and text/plain to bypass CORS preflights (Simple Request)
            fetch(webhookUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'text/plain' },
                body: JSON.stringify(payload)
            }).catch(err => console.error('Webhook trigger failed:', err));

        } catch (err) {
            console.error('Payload dispatch error:', err);
        }
    }
};
