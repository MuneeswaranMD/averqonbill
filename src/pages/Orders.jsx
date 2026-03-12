import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, MoreVertical, Eye, Download, Truck, CheckCircle2, Clock } from 'lucide-react';

const statusColors = {
    'Pending': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'Estimate Sent': 'bg-blue-100 text-blue-700 border-blue-200',
    'Accepted': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Paid': 'bg-green-100 text-green-700 border-green-200',
    'Dispatched': 'bg-orange-100 text-orange-700 border-orange-200',
    'Completed': 'bg-teal-100 text-teal-700 border-teal-200',
};

export default function Orders() {
    const [orders, setOrders] = useState([
        { id: 'ORD-1001', customer: 'John Doe', amount: 4500, status: 'Pending', date: '2026-03-10', type: 'Online' },
        { id: 'ORD-1002', customer: 'Alina Smith', amount: 1200, status: 'Paid', date: '2026-03-09', type: 'POS' },
        { id: 'ORD-1003', customer: 'Robert Brown', amount: 800, status: 'Dispatched', date: '2026-03-08', type: 'Online' },
        { id: 'ORD-1004', customer: 'Jane Smith', amount: 3200, status: 'Estimate Sent', date: '2026-03-10', type: 'Online' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 w-64 text-sm bg-white"
                        />
                    </div>
                    <button className="btn btn-secondary text-sm">
                        <Filter size={18} className="mr-2" />
                        <span>Status</span>
                    </button>
                </div>
            </div>

            <div className="card !p-0">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50  tracking-wider text-[10px] font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4 text-left">Order Details</th>
                                <th className="px-6 py-4 text-left">Customer</th>
                                <th className="px-6 py-4 text-left">Amount</th>
                                <th className="px-6 py-4 text-left">Date</th>
                                <th className="px-6 py-4 text-left">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${order.type === 'POS' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                                {order.type === 'POS' ? <Clock size={14} /> : <ShoppingCart size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{order.id}</p>
                                                <p className="text-[10px] font-bold text-gray-400 ">{order.type} Order</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium">{order.customer}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">₹{order.amount}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">{order.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold  border ${statusColors[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end space-x-2">
                                            <button className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="View Details">
                                                <Eye size={16} />
                                            </button>
                                            {order.status === 'Paid' && (
                                                <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Download Invoice">
                                                    <Download size={16} />
                                                </button>
                                            )}
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
        </div>
    );
}
