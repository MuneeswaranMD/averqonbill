import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit2,
    Trash2,
    AlertCircle,
    Package,
    ArrowUpDown
} from 'lucide-react';
import { FirestoreService } from '../services/firestoreService';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await FirestoreService.getProducts();
            setProducts(data);
        } catch (e) {
            console.error(e);
            // Fallback to sample data if firebase not configured
            setProducts([
                { id: '1', name: 'Almond Crackers', category: 'Food', price: 120, stock: 45, sku: 'CRK-001' },
                { id: '2', name: 'Cheese Biscuits', category: 'Food', price: 85, stock: 8, sku: 'BIS-022' },
                { id: '3', name: 'Salted Peanuts', category: 'Snacks', price: 50, stock: 120, sku: 'PNT-331' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 w-64 text-sm"
                        />
                    </div>
                    <button className="flex items-center space-x-2 text-sm text-gray-600 bg-white border px-3 py-2 rounded-lg hover:bg-gray-50">
                        <Filter size={18} />
                        <span>Filter</span>
                    </button>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold text-sm transition-all"
                >
                    <Plus size={18} />
                    <span>Add New Product</span>
                </button>
            </div>

            {/* Product List */}
            <div className="card !p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50  tracking-wider text-[10px] font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4 text-left">Product Details</th>
                                <th className="px-6 py-4 text-left">SKU</th>
                                <th className="px-6 py-4 text-left">Category</th>
                                <th className="px-6 py-4 text-left">Price</th>
                                <th className="px-6 py-4 text-left">Stock Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {products.map((product) => (
                                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{product.name}</p>
                                                <p className="text-xs text-gray-400">ID: {product.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-500">{product.sku}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 border border-slate-200  tracking-tight">
                                            {product.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{product.price}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <span className={`text-sm font-bold ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                                                {product.stock} Units
                                            </span>
                                            {product.stock < 10 && <AlertCircle size={14} className="text-red-500 animate-pulse" />}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                            <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                                                <MoreVertical size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {loading && (
                <div className="flex justify-center p-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
                </div>
            )}
        </div>
    );
}
