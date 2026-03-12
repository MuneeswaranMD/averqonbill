import React, { useState, useEffect } from 'react';
import {
    Truck, Plus, Search, Mail, Phone, MapPin,
    MoreVertical, Edit2, Trash2, ExternalLink,
    CheckCircle2, X, Save, Building2, Globe
} from 'lucide-react';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import {
    collection, query, where, onSnapshot,
    addDoc, updateDoc, deleteDoc, doc, serverTimestamp
} from 'firebase/firestore';

export default function SuppliersPage() {
    const { companyId } = useAuth();
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        gstin: '',
        category: ''
    });

    useEffect(() => {
        if (!companyId) return;
        const q = query(collection(db, 'suppliers'), where('companyId', '==', companyId));
        const unsub = onSnapshot(q, (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSuppliers(list);
            if (list.length > 0 && !selectedSupplier) {
                setSelectedSupplier(list[0]);
            }
            setLoading(false);
        });
        return unsub;
    }, [companyId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingSupplier) {
                await updateDoc(doc(db, 'suppliers', editingSupplier.id), {
                    ...formData,
                    updatedAt: serverTimestamp()
                });
            } else {
                await addDoc(collection(db, 'suppliers'), {
                    ...formData,
                    companyId,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                });
            }
            setShowModal(false);
            setEditingSupplier(null);
            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', category: '' });
        } catch (error) {
            console.error("Error saving supplier:", error);
        }
    };

    const handleEdit = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name || '',
            contactPerson: supplier.contactPerson || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            gstin: supplier.gstin || '',
            category: supplier.category || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this supplier?')) {
            await deleteDoc(doc(db, 'suppliers', id));
            if (selectedSupplier?.id === id) setSelectedSupplier(null);
        }
    };

    const filteredSuppliers = suppliers.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.contactPerson?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Zoho Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-gray-800">All Suppliers</h1>
                    <span className="text-xs text-gray-400 font-medium">({suppliers.length})</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Find a supplier..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all w-64"
                        />
                    </div>
                    <button
                        onClick={() => {
                            setEditingSupplier(null);
                            setFormData({ name: '', contactPerson: '', email: '', phone: '', address: '', gstin: '', category: '' });
                            setShowModal(true);
                        }}
                        className="bg-[#0067ff] hover:bg-[#0056d6] text-white px-4 py-2 rounded text-sm font-medium shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16} /> New Supplier
                    </button>
                </div>
            </div>

            {/* Split View */}
            <div className="flex-1 flex overflow-hidden">
                {/* Fixed List (Left) */}
                <div className="w-80 border-r border-gray-200 overflow-y-auto bg-white no-scrollbar">
                    {loading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-gray-50 rounded animate-pulse" />)}
                        </div>
                    ) : filteredSuppliers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                            <Truck size={32} className="mb-2 opacity-20" />
                            <p className="text-sm">No suppliers found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {filteredSuppliers.map((supplier) => (
                                <div
                                    key={supplier.id}
                                    onClick={() => setSelectedSupplier(supplier)}
                                    className={`px-4 py-4 cursor-pointer transition-all ${selectedSupplier?.id === supplier.id ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'}`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className={`text-sm font-semibold truncate ${selectedSupplier?.id === supplier.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                            {supplier.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-gray-500 truncate">{supplier.contactPerson || 'No contact'}</p>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                                            {supplier.category?.slice(0, 10) || 'Retail'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View (Right) */}
                <div className="flex-1 overflow-y-auto bg-white p-8 no-scrollbar">
                    {selectedSupplier ? (
                        <div className="max-w-4xl animate-in fade-in slide-in-from-right-4 duration-300">
                            {/* Detail Header */}
                            <div className="flex items-start justify-between border-b border-gray-100 pb-8 mb-8">
                                <div className="flex items-center gap-6">
                                    <div className="h-20 w-20 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 shadow-inner">
                                        <Building2 size={40} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{selectedSupplier.name}</h2>
                                        <div className="flex items-center gap-4 mt-2">
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Mail size={14} /> {selectedSupplier.email || 'No email'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                <Phone size={14} /> {selectedSupplier.phone || 'No phone'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleEdit(selectedSupplier)}
                                        className="px-4 py-1.5 border border-gray-300 text-gray-700 rounded text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                                    >
                                        <Edit2 size={14} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedSupplier.id)}
                                        className="px-4 py-1.5 border border-red-200 text-red-600 rounded text-sm font-medium hover:bg-red-50 transition-colors flex items-center gap-2"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </div>

                            {/* Info Tabs Area */}
                            <div className="grid grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div>
                                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Core Information</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-0.5">Contact Person</label>
                                                <p className="text-sm font-semibold text-gray-800">{selectedSupplier.contactPerson || 'Not specified'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-0.5">Category</label>
                                                <p className="text-sm font-semibold text-gray-800">{selectedSupplier.category || 'General Vendor'}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-400 block mb-0.5">GST Identification</label>
                                                <p className="text-sm font-semibold text-gray-800">{selectedSupplier.gstin || 'No GST registered'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Communication</h3>
                                        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-4">
                                            <div className="flex items-start gap-3">
                                                <MapPin size={16} className="text-gray-400 mt-1" />
                                                <div>
                                                    <label className="text-xs text-gray-400 block">Office Address</label>
                                                    <p className="text-sm font-medium text-gray-600 mt-1 leading-relaxed">
                                                        {selectedSupplier.address || 'Address not listed for this partner.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <div className="bg-blue-50/50 rounded-lg border border-blue-100 p-6">
                                        <h3 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-4">Account Overview</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100/50">
                                                <label className="text-[10px] text-gray-400 block uppercase">Total Orders</label>
                                                <p className="text-lg font-bold text-gray-900 italic">Coming Soon</p>
                                            </div>
                                            <div className="bg-white p-4 rounded-md shadow-sm border border-blue-100/50">
                                                <label className="text-[10px] text-gray-400 block uppercase">Total Spent</label>
                                                <p className="text-lg font-bold text-gray-900">₹0.00</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 border border-dashed border-gray-200 rounded-lg text-center">
                                        <Globe size={24} className="mx-auto text-gray-300 mb-3" />
                                        <p className="text-xs text-gray-500 font-medium">No recent transactions or activities recorded for this supplier.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                            <Truck size={48} className="mb-4 opacity-10" />
                            <p className="text-lg font-medium">Select a supplier to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal - Standard Zoho Style Form */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
                    <div className="bg-white rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 border border-gray-100">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-800">{editingSupplier ? 'Edit Supplier' : 'New Supplier'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Supplier Name *</label>
                                    <input
                                        type="text" required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0067ff] focus:border-[#0067ff] outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Contact Person</label>
                                    <input
                                        type="text"
                                        value={formData.contactPerson}
                                        onChange={e => setFormData({ ...formData, contactPerson: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0067ff] focus:border-[#0067ff] outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Category</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0067ff] focus:border-[#0067ff] outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0067ff] focus:border-[#0067ff] outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Phone</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0067ff] focus:border-[#0067ff] outline-none"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-xs font-bold text-gray-600 block mb-1.5">GSTIN</label>
                                    <input
                                        type="text"
                                        value={formData.gstin}
                                        onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0067ff] focus:border-[#0067ff] outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Address</label>
                                    <textarea
                                        rows="2"
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-[#0067ff] focus:border-[#0067ff] outline-none resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-10 justify-end">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded transition-colors">Cancel</button>
                                <button type="submit" className="bg-[#0067ff] hover:bg-[#0056d6] text-white px-8 py-2 rounded text-sm font-bold shadow-md transition-all">
                                    {editingSupplier ? 'Save Changes' : 'Create Supplier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}