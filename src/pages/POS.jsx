import React, { useState, useEffect } from 'react';
import {
    Search,
    ShoppingCart,
    User,
    Trash2,
    Plus,
    Minus,
    Receipt,
    RotateCcw,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';

const MOCK_PRODUCTS = [
    { id: '1', name: 'Product A', price: 100, stock: 50, image: 'https://placehold.co/100x100?text=A' },
    { id: '2', name: 'Product B', price: 200, stock: 30, image: 'https://placehold.co/100x100?text=B' },
    { id: '3', name: 'Product C', price: 150, stock: 20, image: 'https://placehold.co/100x100?text=C' },
    { id: '4', name: 'Product D', price: 300, stock: 10, image: 'https://placehold.co/100x100?text=D' },
];

export default function POS() {
    const [products, setProducts] = useState(MOCK_PRODUCTS);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (product) => {
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.id === product.id ? { ...item, qty: item.qty + 1 } : item
            ));
        } else {
            setCart([...cart, { ...product, qty: 1 }]);
        }
    };

    const removeFromCart = (id) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQty = (id, delta) => {
        setCart(cart.map(item => {
            if (item.id === id) {
                const newQty = Math.max(1, item.qty + delta);
                return { ...item, qty: newQty };
            }
            return item;
        }));
    };

    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    return (
        <div className="flex h-screen w-full flex-col bg-gray-100 overflow-hidden">
            {/* Header */}
            <header className="flex h-16 items-center justify-between bg-white px-6 shadow-sm border-b">
                <div className="flex items-center space-x-4">
                    <Link to="/" className="text-gray-500 hover:text-gray-700">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800 tracking-tight">POS System</h1>
                </div>

                <div className="flex flex-1 max-w-xl mx-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary-500 border-none bg-gray-50"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <button className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg hover:bg-gray-100 border">
                        <User size={18} />
                        <span>Select Customer</span>
                    </button>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <div className="text-right">
                        <span className="block text-xs text-gray-400 font-bold ">Cashier</span>
                        <span className="text-sm font-bold text-gray-800">Admin</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex flex-1 overflow-hidden">
                {/* Products Grid */}
                <section className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredProducts.map(product => (
                            <button
                                key={product.id}
                                onClick={() => addToCart(product)}
                                className="group flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm hover:ring-2 hover:ring-primary-500 transition-all p-3 text-left"
                            >
                                <div className="mb-3 aspect-square overflow-hidden rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                                    <img src={product.image} alt={product.name} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                </div>
                                <h3 className="font-bold text-gray-800 line-clamp-1">{product.name}</h3>
                                <div className="mt-1 flex items-center justify-between">
                                    <span className="text-sm font-bold text-primary-600">₹{product.price}</span>
                                    <span className={`text-[10px] font-bold  px-1.5 py-0.5 rounded ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                        Qty: {product.stock}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Cart Sidebar */}
                <aside className="w-96 bg-white border-l flex flex-col shadow-2xl z-20">
                    <div className="p-4 border-b flex items-center gap-2">
                        <ShoppingCart className="text-primary-600" size={24} />
                        <h2 className="text-lg font-bold text-gray-800  tracking-tight">Your Cart</h2>
                        <span className="ml-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                            {cart.reduce((a, c) => a + c.qty, 0)}
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {cart.length === 0 ? (
                            <div className="flex h-full flex-col items-center justify-center text-gray-400 space-y-3 opacity-50">
                                <ShoppingCart size={48} strokeWidth={1.5} />
                                <p className="font-medium">Cart is empty</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="flex flex-col border-b border-gray-50 pb-4">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center space-x-1 border rounded-lg p-0.5">
                                            <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-gray-100 rounded">
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center text-sm font-bold">{item.qty}</span>
                                            <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-gray-100 rounded">
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className="font-bold text-gray-900">₹{item.price * item.qty}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-6 bg-slate-50 border-t space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{total}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax (0%)</span>
                                <span>₹0</span>
                            </div>
                            <div className="flex justify-between text-xl font-black text-gray-900 border-t pt-2">
                                <span>Total</span>
                                <span>₹{total}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setCart([])}
                                className="flex items-center justify-center space-x-2 py-3 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-all font-bold"
                            >
                                <RotateCcw size={18} />
                                <span>Reset</span>
                            </button>
                            <button
                                className="flex items-center justify-center space-x-2 py-3 rounded-xl bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-100 transition-all font-bold"
                                disabled={cart.length === 0}
                            >
                                <Receipt size={18} />
                                <span>Pay Now</span>
                            </button>
                        </div>
                    </div>
                </aside>
            </main>
        </div>
    );
}
