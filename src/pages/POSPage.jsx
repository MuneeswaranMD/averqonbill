import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    Search, ShoppingCart, User, Package, Plus, Minus,
    Trash2, X, CreditCard, Banknote, FileText, Clock,
    ChevronDown, CheckCircle2, Zap, RefreshCw, ReceiptText
} from 'lucide-react';
import { FirestoreService } from '../lib/firestore';
import { useAuth } from '../contexts/AuthContext';
import { generateInvoicePDF } from '../utils/invoicePdf';
import { AutomationService } from '../utils/automation';

/* ── helpers ──────────────────────────────────────── */
const fmt = (n) => Number(n || 0).toLocaleString('en-IN');

const CATEGORY_COLORS = [
    'bg-blue-50 text-blue-700 border-blue-200',
    'bg-purple-50 text-purple-700 border-purple-200',
    'bg-green-50 text-green-700 border-green-200',
    'bg-amber-50 text-amber-700 border-amber-200',
    'bg-red-50 text-red-700 border-red-200',
    'bg-indigo-50 text-indigo-700 border-indigo-200',
];

/* ── Success Receipt Modal ────────────────────────── */
function ReceiptModal({ open, order, onClose }) {
    if (!open || !order) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
                <div className="flex flex-col items-center py-8 px-6 text-center">
                    <div className="h-14 w-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 size={28} className="text-green-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">Payment Successful</h2>
                    <p className="text-sm text-gray-500">Order has been created</p>

                    <div className="w-full border border-dashed border-gray-200 rounded-xl p-4 mt-5 space-y-2 text-left">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Order ID</span>
                            <span className="font-mono font-semibold text-gray-800">ORD-{String(order.id).slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Customer</span>
                            <span className="font-medium text-gray-800">{order.customerName}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Items</span>
                            <span className="font-medium text-gray-800">{order.items} item{order.items !== 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-2">
                            <span className="font-semibold text-gray-700">Total Paid</span>
                            <span className="font-bold text-green-700 text-base">₹{fmt(order.total)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Method</span>
                            <span className="text-gray-600">{order.method}</span>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-5 w-full">
                        <button onClick={() => {
                            generateInvoicePDF(
                                { id: order.id, totalAmount: order.total, products: order.products },
                                { name: order.customerName, address: '', phone: '' }
                            );
                        }} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                            <FileText size={14} /> Download PDF
                        </button>
                        <button onClick={onClose} className="flex-1 px-3 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                            New Sale
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Main POS Page ────────────────────────────────── */
export default function POSPage() {
    const { companyId } = useAuth();
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [cart, setCart] = useState([]);
    const [search, setSearch] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [selectedCustomer, setSelectedCustomer] = useState('Walk-in Customer');
    const [discount, setDiscount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [receipt, setReceipt] = useState({ open: false, order: null });
    const [showCartMobile, setShowCartMobile] = useState(false);
    const searchRef = useRef(null);

    /* Load data */
    useEffect(() => {
        if (!companyId) return;
        Promise.all([
            FirestoreService.getProducts(companyId),
            FirestoreService.getCustomers(companyId),
        ]).then(([prods, custs]) => {
            setProducts(prods);
            setCustomers(custs);
        }).catch(console.error)
            .finally(() => setLoading(false));
    }, [companyId]);

    /* Keyboard shortcut: F2 → focus search */
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'F2') { e.preventDefault(); searchRef.current?.focus(); }
            if (e.key === 'F5') { e.preventDefault(); if (cart.length > 0) handleCheckout('Cash'); }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [cart]);

    /* Categories */
    const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

    /* Filtered products */
    const filteredProducts = products.filter(p => {
        const matchSearch = !search ||
            p.name?.toLowerCase().includes(search.toLowerCase()) ||
            p.sku?.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    /* Cart actions */
    const addToCart = useCallback((product) => {
        if (Number(product.stock) === 0) return;
        setCart(prev => {
            const existing = prev.find(i => i.id === product.id);
            if (existing) return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
            return [...prev, { ...product, qty: 1 }];
        });
    }, []);

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const updateQty = (id, delta) => setCart(prev => prev.map(i => {
        if (i.id !== id) return i;
        const newQty = i.qty + delta;
        if (newQty <= 0) return null;
        return { ...i, qty: newQty };
    }).filter(Boolean));

    const clearCart = () => { setCart([]); setDiscount(0); };

    /* Totals */
    const subtotal = cart.reduce((a, i) => a + (Number(i.price) * i.qty), 0);
    const discountAmt = Math.min(Number(discount) || 0, subtotal);
    const total = subtotal - discountAmt;
    const itemCount = cart.reduce((a, i) => a + i.qty, 0);

    /* Checkout */
    const handleCheckout = async (method = 'Cash') => {
        if (cart.length === 0 || processing) return;
        setProcessing(true);
        try {
            const orderData = {
                customerName: selectedCustomer,
                productName: cart.map(i => i.name).join(', '),
                quantity: itemCount,
                totalAmount: total,
                status: 'Payment Received',
                payment: 'Paid',
                paymentMethod: method,
                products: cart.map(i => ({
                    productId: i.id || '',
                    name: i.name,
                    price: Number(i.price),
                    qty: i.qty
                })),
                date: new Date().toISOString().slice(0, 10),
            };
            const ref = await FirestoreService.add('orders', orderData, companyId);

            // ── Automated Stock Reduction ──
            await FirestoreService.reduceStock(
                cart.map(i => ({ ...i, productId: i.id })),
                companyId,
                `POS Sale #${ref.id.slice(-6).toUpperCase()}`
            );

            setReceipt({
                open: true,
                order: {
                    id: ref.id,
                    customerName: selectedCustomer,
                    total: total,
                    items: itemCount,
                    method,
                    products: orderData.products,
                }
            });

            // 3. Trigger Webhook
            AutomationService.trigger(companyId, 'order.created', { id: ref.id, ...orderData });

            clearCart();
        } catch (e) {
            alert('Checkout failed: ' + e.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex h-full overflow-hidden bg-gray-100 relative">
            <ReceiptModal
                open={receipt.open}
                order={receipt.order}
                onClose={() => setReceipt({ open: false, order: null })}
            />

            {/* ── LEFT: Product Catalog ─────────────────── */}
            <div className="flex flex-col flex-1 overflow-hidden">
                {/* Top bar */}
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 flex-shrink-0">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            ref={searchRef}
                            type="text"
                            placeholder="Search product or scan barcode... (F2)"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50"
                        />
                    </div>

                    {/* Customer select */}
                    <div className="relative">
                        <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        <select
                            value={selectedCustomer}
                            onChange={e => setSelectedCustomer(e.target.value)}
                            className="pl-8 pr-8 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 bg-gray-50 text-gray-700 appearance-none cursor-pointer"
                        >
                            <option value="Walk-in Customer">Walk-in Customer</option>
                            {customers.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    <button onClick={() => { setLoading(true); FirestoreService.getProducts(companyId).then(setProducts).finally(() => setLoading(false)); }}
                        className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>

                    <div className="ml-auto hidden sm:flex items-center gap-2 text-xs text-gray-400">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500 font-mono">F2</kbd> Search
                        <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-500 font-mono">F5</kbd> Pay Cash
                    </div>
                    {/* Cart toggle for mobile */}
                    <button onClick={() => setShowCartMobile(true)}
                        className="sm:hidden relative p-2 bg-blue-600 text-white rounded-xl shadow-lg ml-auto">
                        <ShoppingCart size={18} />
                        {itemCount > 0 && <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center border border-white">{itemCount}</span>}
                    </button>
                </div>

                {/* Category chips */}
                <div className="flex items-center gap-2 px-4 py-2.5 bg-white border-b border-gray-100 overflow-x-auto flex-shrink-0 no-scrollbar">
                    {categories.map((cat, idx) => (
                        <button key={cat} onClick={() => setActiveCategory(cat)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${activeCategory === cat
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                }`}>
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-100 border-t-blue-600"></div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                            <Package size={32} strokeWidth={1} className="mb-2 opacity-40" />
                            <p className="text-sm">{search ? 'No products match your search' : 'No products found'}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredProducts.map(product => {
                                const inCart = cart.find(i => i.id === product.id);
                                const outOfStock = Number(product.stock) === 0;
                                return (
                                    <button
                                        key={product.id}
                                        onClick={() => addToCart(product)}
                                        disabled={outOfStock}
                                        className={`relative flex flex-col bg-white rounded-xl border p-3 text-left transition-all group active:scale-95 ${outOfStock
                                            ? 'border-gray-100 opacity-50 cursor-not-allowed'
                                            : inCart
                                                ? 'border-blue-300 shadow-md shadow-blue-100 ring-1 ring-blue-200'
                                                : 'border-gray-200 hover:border-blue-200 hover:shadow-md hover:shadow-blue-50 cursor-pointer'
                                            }`}
                                    >
                                        {/* Product Image area */}
                                        <div className="h-20 w-full flex items-center justify-center mb-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors overflow-hidden border border-gray-100/50">
                                            {product.image ? (
                                                <img src={product.image} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                            ) : (
                                                <Package size={24} className="text-gray-300" />
                                            )}
                                        </div>


                                        {/* Name */}
                                        <p className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">{product.name}</p>

                                        {/* Price + Stock */}
                                        <div className="mt-auto pt-2 flex items-center justify-between">
                                            <span className="text-sm font-bold text-blue-700">₹{fmt(product.price)}</span>
                                            <span className={`text-[10px] font-medium ${Number(product.stock) < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                                                {outOfStock ? 'Out' : `${product.stock}`}
                                            </span>
                                        </div>

                                        {/* In-cart badge */}
                                        {inCart && (
                                            <div className="absolute top-1.5 right-1.5 h-5 w-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                                                {inCart.qty}
                                            </div>
                                        )}
                                        {outOfStock && (
                                            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/60">
                                                <span className="text-xs font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded">Out of Stock</span>
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* ── RIGHT: Cart + Checkout ────────────────── */}
            {/* Overlay for mobile cart */}
            {showCartMobile && <div className="sm:hidden fixed inset-0 bg-black/50 z-20 backdrop-blur-xs" onClick={() => setShowCartMobile(false)} />}

            <div className={`
                fixed sm:static right-0 top-16 bottom-0 z-30
                w-full sm:w-80 xl:w-96 flex flex-col bg-white border-l border-gray-200 flex-shrink-0
                transform transition-transform duration-300 ease-in-out
                ${showCartMobile ? 'translate-x-0' : 'translate-x-full sm:translate-x-0'}
            `}>
                {/* Cart header */}
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={16} className="text-blue-600" />
                        <h2 className="text-sm font-bold text-gray-900">Cart</h2>
                        {itemCount > 0 && (
                            <span className="h-5 min-w-5 px-1.5 bg-blue-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        {cart.length > 0 && (
                            <button onClick={clearCart} className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1">
                                <X size={12} /> Clear
                            </button>
                        )}
                        <button onClick={() => setShowCartMobile(false)} className="sm:hidden p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Cart items */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-32 text-gray-300 mt-6">
                            <ShoppingCart size={28} strokeWidth={1} className="mb-2" />
                            <p className="text-xs">Click products to add them</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.id} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2.5 group">
                            <div className="h-9 w-9 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-100 overflow-hidden">
                                {item.image ? (
                                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                ) : (
                                    <Package size={14} className="text-gray-300" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.name}</p>
                                <p className="text-xs text-blue-600 font-bold">₹{fmt(Number(item.price) * item.qty)}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-white rounded-lg border border-gray-200 px-1 flex-shrink-0">
                                <button onClick={() => updateQty(item.id, -1)}
                                    className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                                    <Minus size={10} />
                                </button>
                                <span className="text-xs font-bold w-5 text-center text-gray-800">{item.qty}</span>
                                <button onClick={() => updateQty(item.id, 1)}
                                    className="h-6 w-6 flex items-center justify-center text-gray-400 hover:text-green-600 transition-colors">
                                    <Plus size={10} />
                                </button>
                            </div>
                            <button onClick={() => removeFromCart(item.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Order Summary + Checkout */}
                <div className="border-t border-gray-100 px-5 py-4 space-y-3 flex-shrink-0">
                    {/* Discount */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 whitespace-nowrap">Discount (₹)</label>
                        <input
                            type="number" min="0" value={discount}
                            onChange={e => setDiscount(e.target.value)}
                            className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-400 w-0"
                            placeholder="0"
                        />
                    </div>

                    {/* Totals */}
                    <div className="space-y-1.5 py-2 border-t border-gray-100">
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Subtotal</span>
                            <span>₹{fmt(subtotal)}</span>
                        </div>
                        {discountAmt > 0 && (
                            <div className="flex justify-between text-xs text-green-600">
                                <span>Discount</span>
                                <span>- ₹{fmt(discountAmt)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>Tax</span>
                            <span>₹0</span>
                        </div>
                        <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100 mt-1">
                            <span>Total</span>
                            <span className="text-blue-700">₹{fmt(total)}</span>
                        </div>
                    </div>

                    {/* Customer reminder */}
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                        <User size={13} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-gray-700 truncate">{selectedCustomer}</span>
                    </div>

                    {/* Payment buttons */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleCheckout('Cash')}
                            disabled={cart.length === 0 || processing}
                            className="flex items-center justify-center gap-1.5 py-3 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        >
                            <Banknote size={15} />
                            {processing ? 'Processing...' : 'Pay Cash'}
                        </button>
                        <button
                            onClick={() => handleCheckout('Online')}
                            disabled={cart.length === 0 || processing}
                            className="flex items-center justify-center gap-1.5 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        >
                            <CreditCard size={15} />
                            {processing ? '...' : 'Pay Online'}
                        </button>
                    </div>

                    <button
                        onClick={() => handleCheckout('Invoice')}
                        disabled={cart.length === 0 || processing}
                        className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                        <ReceiptText size={14} /> Generate Invoice & Hold
                    </button>
                </div>
            </div>
        </div>
    );
}
