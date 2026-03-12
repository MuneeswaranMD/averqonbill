import React, { useState, useEffect } from 'react';
import {
    Bell, CheckCircle2, AlertTriangle, Info,
    Trash2, Search, Filter, Settings,
    Clock, Package, DollarSign, Calendar,
    ArrowRight, MoreVertical
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { FirestoreService } from '../lib/firestore';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

import { db } from '../lib/firebase';
import {
    collection, query, where, orderBy, onSnapshot,
    updateDoc, doc, deleteDoc, writeBatch
} from 'firebase/firestore';

export default function NotificationsPage() {
    const { companyId, currentUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!companyId) return;

        const q = query(
            collection(db, 'notifications'),
            where('companyId', '==', companyId),
            orderBy('createdAt', 'desc')
        );

        const unsub = onSnapshot(q, (snap) => {
            setNotifications(snap.docs.map(d => ({
                id: d.id,
                ...d.data(),
                createdAt: d.data().createdAt?.toDate() || new Date()
            })));
            setLoading(false);
        });

        return unsub;
    }, [companyId]);

    const markAllRead = async () => {
        const batch = writeBatch(db);
        notifications.filter(n => !n.read).forEach(n => {
            batch.update(doc(db, 'notifications', n.id), { read: true });
        });
        await batch.commit();
    };

    const deleteNotification = async (id) => {
        await deleteDoc(doc(db, 'notifications', id));
    };

    const markRead = async (id) => {
        await updateDoc(doc(db, 'notifications', id), { read: true });
    };

    const filtered = notifications.filter(n => {
        if (filter === 'all') return true;
        if (filter === 'unread') return !n.read;
        return n.type === filter;
    });

    const getIcon = (type) => {
        switch (type) {
            case 'order': return <Package size={18} />;
            case 'payment': return <DollarSign size={18} />;
            case 'stock': return <AlertTriangle size={18} />;
            case 'booking': return <Calendar size={18} />;
            default: return <Bell size={18} />;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'order': return 'text-blue-600 bg-blue-50';
            case 'payment': return 'text-emerald-600 bg-emerald-50';
            case 'stock': return 'text-rose-600 bg-rose-50';
            case 'booking': return 'text-amber-600 bg-amber-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Zoho Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">Notifications</h1>
                    <p className="text-xs text-gray-400 mt-1">Stay updated with your business activities and alerts.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={markAllRead}
                        className="px-4 py-1.5 bg-white border border-gray-200 text-xs font-semibold text-gray-600 rounded hover:bg-gray-100 transition-colors"
                    >
                        Mark All as Read
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Filter Sidebar */}
                <div className="w-56 border-r border-gray-100 bg-gray-50/20 flex flex-col p-4 gap-1">
                    {[
                        { id: 'all', label: 'All Alerts', icon: Bell },
                        { id: 'unread', label: 'Unread', icon: CheckCircle2 },
                        { id: 'order', label: 'Orders', icon: Package },
                        { id: 'payment', label: 'Payments', icon: DollarSign },
                        { id: 'stock', label: 'Inventory', icon: AlertTriangle },
                        { id: 'booking', label: 'Bookings', icon: Calendar },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-all ${filter === item.id
                                    ? 'bg-blue-50 text-blue-700 font-semibold'
                                    : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </div>

                {/* Main Activity List */}
                <div className="flex-1 overflow-auto p-0 no-scrollbar">
                    {loading ? (
                        <div className="py-20 text-center text-gray-400">
                            <div className="animate-pulse flex flex-col items-center">
                                <Bell className="mb-2 opacity-20" size={32} />
                                <p className="text-sm">Fetching alerts...</p>
                            </div>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="py-32 text-center text-gray-400">
                            <Bell className="mx-auto mb-4 opacity-10" size={48} />
                            <p className="text-sm font-medium">All caught up! No notifications here.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {filtered.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => !note.read && markRead(note.id)}
                                    className={`group px-6 py-4 flex items-start gap-4 transition-all cursor-pointer ${!note.read ? 'bg-blue-50/30' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className={`mt-1 h-9 w-9 rounded flex items-center justify-center shrink-0 ${getTypeColor(note.type)}`}>
                                        {getIcon(note.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4">
                                            <h4 className={`text-sm ${!note.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                {note.title}
                                            </h4>
                                            <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                                                {format(note.createdAt, 'MMM d, h:mm a')}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                            {note.message}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteNotification(note.id); }}
                                            className="p-1.5 text-gray-300 hover:text-red-500 rounded hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Bar */}
            <div className="px-6 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    System Alerts Live
                </div>
                <div>{notifications.filter(n => !n.read).length} Unread Updates</div>
            </div>
        </div>
    );
}

