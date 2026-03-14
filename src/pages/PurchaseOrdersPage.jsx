import React, { useState, useEffect } from 'react';
import {
    ShoppingBag, Plus, Search, Filter, MoreVertical,
    Eye, Edit2, Trash2, CheckCircle, Package, Truck,
    AlertCircle, ChevronRight, X, Calendar, Download, Save
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function PurchaseOrdersPage() {
    const { companyId } = useAuth();
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [warehouses, setWarehouses] = useState([]);
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [receiveModal, setReceiveModal] = useState({ open: false, po: null });
    const [formData, setFormData] = useState({
        supplierId: '',
        warehouseId: '',
        items: [{ variantId: '', qty: 1, price: 0 }]
    });

    const API_BASE = 'https://averqonbill-1.onrender.com/api';

    const fetchData = async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const [poRes, supRes, whRes, varRes] = await Promise.all([
                fetch(`${API_BASE}/purchase-orders?companyId=${companyId}`),
                fetch(`${API_BASE}/suppliers?companyId=${companyId}`),
                fetch(`${API_BASE}/warehouses?companyId=${companyId}`),
                fetch(`${API_BASE}/inventory?companyId=${companyId}`) // Fetching inventory to get variants
            ]);

            if (poRes.ok) setPurchaseOrders(await poRes.json());
            if (supRes.ok) setSuppliers(await supRes.json());
            if (whRes.ok) {
                const whs = await whRes.json();
                setWarehouses(whs);
                if (whs.length > 0) setFormData(prev => ({ ...prev, warehouseId: whs[0]._id }));
            }
            if (varRes.ok) {
                const inv = await varRes.json();
                setVariants(inv.map(i => i.variantId));
            }
        } catch (error) {
            console.error("Error fetching PO data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [companyId]);

    const handleCreatePO = async (e) => {
        e.preventDefault();
        try {
            const totalAmount = formData.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
            const response = await fetch(`${API_BASE}/purchase-orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, companyId, totalAmount, status: 'ordered' })
            });

            if (response.ok) {
                fetchData();
                setShowModal(false);
                setFormData({ supplierId: '', warehouseId: warehouses[0]?._id || '', items: [{ variantId: '', qty: 1, price: 0 }] });
            }
        } catch (error) {
            console.error("Error creating PO:", error);
        }
    };

    const handleReceive = async (poId, receivedItems) => {
        try {
            const response = await fetch(`${API_BASE}/purchase-orders/${poId}/receive`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: receivedItems, companyId })
            });

            if (response.ok) {
                fetchData();
                setReceiveModal({ open: false, po: null });
            }
        } catch (error) {
            console.error("Error receiving items:", error);
        }
    };

    const addItem = () => setFormData({ ...formData, items: [...formData.items, { variantId: '', qty: 1, price: 0 }] });
    const removeItem = (index) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'received': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'partially_received': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'ordered': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-semibold text-gray-800">Purchase Orders</h1>
                    <span className="text-xs text-gray-400 font-medium">({purchaseOrders.length})</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-4 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none w-64"
                        />
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-[#0067ff] hover:bg-[#0056d6] text-white px-4 py-2 rounded text-sm font-medium shadow-sm flex items-center gap-2 transition-colors"
                    >
                        <Plus size={16} /> New Order
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-auto no-scrollbar">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-gray-200 z-10">
                        <tr>
                            <th className="px-6 py-3">Order #</th>
                            <th className="px-6 py-3">Supplier</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Amount</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            [1, 2, 3, 4, 5].map(i => <tr key={i} className="animate-pulse h-16 bg-gray-50/50" />)
                        ) : purchaseOrders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="py-20 text-center text-gray-400">
                                    <ShoppingBag size={48} className="mx-auto mb-3 opacity-10" />
                                    <p className="text-sm font-medium">No purchase orders found.</p>
                                </td>
                            </tr>
                        ) : purchaseOrders.map(po => (
                            <tr key={po._id} className="hover:bg-blue-50/20 transition-colors group">
                                <td className="px-6 py-4 font-bold text-blue-600 text-sm">#{po.orderNumber}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">{po.supplierId?.name || 'Unknown Supplier'}</span>
                                        <span className="text-[10px] text-gray-400 italic">{po.supplierId?.contactPerson || '--'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-600">
                                    {new Date(po.createdAt).toLocaleDateString('en-GB')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(po.status)}`}>
                                        {po.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                    ₹{po.totalAmount?.toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        {po.status !== 'received' && (
                                            <button
                                                onClick={() => setReceiveModal({ open: true, po })}
                                                className="px-3 py-1 bg-emerald-600 text-white text-[10px] font-bold rounded hover:bg-emerald-700 transition-colors shadow-sm"
                                            >
                                                Receive
                                            </button>
                                        )}
                                        <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                                            <MoreVertical size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create PO Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl overflow-hidden animate-in zoom-in duration-200 h-[80vh] flex flex-col">
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">New Purchase Order</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreatePO} className="flex-1 overflow-hidden flex flex-col">
                            <div className="p-8 flex-1 overflow-y-auto no-scrollbar">
                                <div className="grid grid-cols-2 gap-8 mb-8">
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 block mb-1.5">Supplier *</label>
                                        <select
                                            required
                                            value={formData.supplierId}
                                            onChange={e => setFormData({ ...formData, supplierId: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                                        >
                                            <option value="">Select Supplier</option>
                                            {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-600 block mb-1.5">Deliver To (Warehouse)</label>
                                        <select
                                            required
                                            value={formData.warehouseId}
                                            onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                                            className="w-full px-4 py-2 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                                        >
                                            {warehouses.map(w => <option key={w._id} value={w._id}>{w.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Line Items</h3>
                                <div className="space-y-4">
                                    {formData.items.map((item, index) => (
                                        <div key={index} className="flex items-end gap-4 p-4 bg-gray-50 rounded border border-gray-100 relative group">
                                            <div className="flex-1">
                                                <label className="text-[10px] text-gray-400 uppercase mb-1 block">Product / Variant</label>
                                                <select
                                                    required
                                                    value={item.variantId}
                                                    onChange={e => updateItem(index, 'variantId', e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-600 outline-none"
                                                >
                                                    <option value="">Select Product</option>
                                                    {variants.map(v => (
                                                        <option key={v._id} value={v._id}>
                                                            {v.sku} - {v.productId?.name || 'Local Variant'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="w-24">
                                                <label className="text-[10px] text-gray-400 uppercase mb-1 block">Quantity</label>
                                                <input
                                                    type="number" min="1" required
                                                    value={item.qty}
                                                    onChange={e => updateItem(index, 'qty', e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-600 outline-none"
                                                />
                                            </div>
                                            <div className="w-32">
                                                <label className="text-[10px] text-gray-400 uppercase mb-1 block">Unit Price (₹)</label>
                                                <input
                                                    type="number" step="0.01" required
                                                    value={item.price}
                                                    onChange={e => updateItem(index, 'price', e.target.value)}
                                                    className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded text-sm text-right focus:ring-1 focus:ring-blue-600 outline-none"
                                                />
                                            </div>
                                            {formData.items.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeItem(index)}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addItem}
                                        className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:text-blue-700 mt-2"
                                    >
                                        <Plus size={14} /> Add Another Item
                                    </button>
                                </div>
                            </div>
                            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                                <div className="text-sm font-medium text-gray-500">
                                    Total Amount: <span className="text-xl font-bold text-gray-900 ml-2">₹{formData.items.reduce((acc, item) => acc + (item.qty * item.price), 0).toLocaleString()}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 text-sm text-gray-600 font-medium">Cancel</button>
                                    <button type="submit" className="bg-[#0067ff] hover:bg-[#0056d6] text-white px-8 py-2 rounded text-sm font-bold shadow-md transition-all">
                                        Save & Place Order
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Receive Modal */}
            {receiveModal.open && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
                        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <h2 className="text-lg font-bold text-gray-800">Receive Inventory: #{receiveModal.po.orderNumber}</h2>
                            <button onClick={() => setReceiveModal({ open: false, po: null })} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">Confirm quantity received for each line item.</p>
                            <div className="space-y-4 max-h-80 overflow-y-auto pr-2 no-scrollbar">
                                {receiveModal.po.items.map((item, idx) => (
                                    <div key={idx} className="p-4 bg-gray-50 rounded border border-gray-100 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-800">{item.variantId?.sku || 'Item'}</p>
                                            <p className="text-[10px] text-gray-400">Ordered: {item.qty} | Current: {item.receivedQty || 0}</p>
                                        </div>
                                        <input
                                            type="number"
                                            id={`receive-${idx}`}
                                            defaultValue={item.qty - (item.receivedQty || 0)}
                                            className="w-20 px-2 py-1 bg-white border border-gray-300 rounded text-sm text-right font-bold outline-none"
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="flex items-center gap-4 mt-8 justify-end">
                                <button onClick={() => setReceiveModal({ open: false, po: null })} className="px-4 py-2 text-sm text-gray-600 font-medium">Cancel</button>
                                <button
                                    onClick={() => {
                                        const items = receiveModal.po.items.map((item, idx) => ({
                                            variantId: item.variantId._id || item.variantId,
                                            receivedQty: document.getElementById(`receive-${idx}`).value
                                        }));
                                        handleReceive(receiveModal.po._id, items);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded text-sm font-bold shadow-md transition-all"
                                >
                                    Confirm Receipt
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
