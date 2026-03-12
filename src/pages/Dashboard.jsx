import React from 'react';
import {
    ShoppingBag,
    Users,
    TrendingUp,
    AlertTriangle,
    Clock,
    CheckCircle2,
    Truck,
    IndianRupee
} from 'lucide-react';

const stats = [
    { name: "Today's Orders", value: '24', icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Confirmations', value: '12', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Paid Orders', value: '18', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Pending Dispatch', value: '08', icon: Truck, color: 'text-orange-600', bg: 'bg-orange-100' },
    { name: 'Total Sales', value: '₹45,230', icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Stock Alerts', value: '05', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
];

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stats.map((stat) => (
                    <div key={stat.name} className="card relative flex flex-col items-center justify-center p-4 hover:shadow-md transition-shadow">
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full ${stat.bg}`}>
                            <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                        <p className="text-xs font-medium text-gray-500  tracking-widest">{stat.name}</p>
                        <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Recent Orders Table */}
                <div className="card">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
                        <button className="text-sm font-medium text-primary-600 hover:text-primary-700">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50  tracking-wider text-[10px] font-bold text-gray-500">
                                <tr>
                                    <th className="px-4 py-3 text-left">Order ID</th>
                                    <th className="px-4 py-3 text-left">Customer</th>
                                    <th className="px-4 py-3 text-left">Amount</th>
                                    <th className="px-4 py-3 text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900">#ORD-00{i}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600">Customer {i}</td>
                                        <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-gray-900">₹{1200 * i}</td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-[10px] font-bold  text-yellow-700">
                                                Pending
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Stock Alerts / Quick Stats */}
                <div className="card">
                    <h3 className="mb-4 text-lg font-bold text-gray-800">Inventory Status</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-3">
                                    <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center font-bold text-gray-400">P{i}</div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-800">Product {i}</h4>
                                        <p className="text-xs text-gray-500">Category {i}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-red-600 underline">Low Stock: {5 + i}</p>
                                    <p className="text-[10px] text-gray-400">Min required: 20</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="mt-6 w-full btn btn-secondary text-sm">Update Inventory</button>
                </div>
            </div>
        </div>
    );
}
