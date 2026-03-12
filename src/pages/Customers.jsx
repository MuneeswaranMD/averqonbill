import React, { useState } from 'react';
import { Users, Search, Plus, Phone, Mail, MapPin, MoreVertical } from 'lucide-react';

export default function Customers() {
    const [customers, setCustomers] = useState([
        { id: '1', name: 'John Doe', phone: '+91 9876543210', email: 'john@example.com', address: '123 Market St, Chennai' },
        { id: '2', name: 'Alina Smith', phone: '+91 8876543211', email: 'alina@example.com', address: '45 Lake View, Madurai' },
        { id: '3', name: 'Robert Brown', phone: '+91 7876543212', email: 'robert@example.com', address: '12 Church Rd, Sivakasi' },
    ]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search customers..."
                        className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 w-64 text-sm bg-white"
                    />
                </div>

                <button className="flex items-center justify-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-bold text-sm transition-all shadow-md active:scale-95">
                    <Plus size={18} />
                    <span>Add New Customer</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {customers.map((customer) => (
                    <div key={customer.id} className="card hover:shadow-lg transition-all group border-l-4 border-l-primary-500">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-lg">
                                    {customer.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 leading-tight">{customer.name}</h3>
                                    <p className="text-xs text-gray-400">ID: CUST-{customer.id.padStart(3, '0')}</p>
                                </div>
                            </div>
                            <button className="text-gray-300 hover:text-gray-500">
                                <MoreVertical size={18} />
                            </button>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center space-x-2.5 text-sm text-gray-600">
                                <Phone size={14} className="text-gray-400" />
                                <span>{customer.phone}</span>
                            </div>
                            <div className="flex items-center space-x-2.5 text-sm text-gray-600">
                                <Mail size={14} className="text-gray-400" />
                                <span>{customer.email}</span>
                            </div>
                            <div className="flex items-center space-x-2.5 text-sm text-gray-600">
                                <MapPin size={14} className="text-gray-400" />
                                <span className="line-clamp-1">{customer.address}</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400  tracking-widest">Total Orders</p>
                                <p className="text-sm font-bold text-gray-800">12</p>
                            </div>
                            <button className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1.5 rounded-md hover:bg-primary-100 transition-colors">
                                View History
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
