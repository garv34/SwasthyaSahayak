import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';

const CartDrawer = ({ isOpen, onClose, onCheckoutSuccess }) => {
    const { cartItems, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
    const { user } = useAuth();

    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Online sub-options state
    const [onlineOption, setOnlineOption] = useState('UPI');
    const [upiId, setUpiId] = useState('');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [selectedBank, setSelectedBank] = useState('State Bank of India');

    if (!isOpen) return null;

    const deliveryFee = cartTotal > 0 ? 30 : 0;
    const tax = Math.round(cartTotal * 0.18);
    const grandTotal = cartTotal + deliveryFee + tax;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            setError("You must be logged in to place an order.");
            return;
        }

        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        if (!address.trim() || !phone.trim()) {
            setError("Please fill in both address and phone number.");
            return;
        }

        let finalPaymentMethod = paymentMethod;
        let finalPaymentDetails = '';

        if (paymentMethod === 'Online') {
            if (onlineOption === 'UPI') {
                if (!upiId.trim()) {
                    setError("Please enter a valid UPI ID.");
                    return;
                }
                finalPaymentMethod = 'Online - UPI';
                finalPaymentDetails = `UPI ID: ${upiId}`;
            } else if (onlineOption === 'Card') {
                if (cardNumber.length < 16 || !cardExpiry || cardCvv.length < 3) {
                    setError("Please complete all credit/debit card fields.");
                    return;
                }
                finalPaymentMethod = 'Online - Card';
                finalPaymentDetails = `Card: **** **** **** ${cardNumber.slice(-4)}`;
            } else if (onlineOption === 'Net Banking') {
                finalPaymentMethod = 'Online - Net Banking';
                finalPaymentDetails = selectedBank;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const formattedItems = cartItems.map(item => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                pharmacyName: item.pharmacyName
            }));

            const res = await api.post('/orders', {
                items: formattedItems,
                totalAmount: grandTotal,
                address,
                phone,
                paymentMethod: finalPaymentMethod,
                paymentDetails: finalPaymentDetails
            });

            clearCart();
            onClose();
            if (onCheckoutSuccess) {
                onCheckoutSuccess(res.data);
            }
        } catch (err) {
            console.error("Checkout failed:", err);
            setError(err.response?.data?.msg || "Failed to place order. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Slide-over Container */}
            <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full transform transition-all duration-300 animate-slide-in">
                    
                    {/* Header */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <span>🛒</span> Medicine Cart
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-blue-700/50 rounded-full transition-colors text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Cart Items List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-20 text-slate-500">
                                <span className="text-5xl block mb-4">🛒</span>
                                <p className="font-bold text-slate-700">Your cart is empty</p>
                                <p className="text-sm text-slate-400 mt-1">Symptom check results will suggest medicines you can add here.</p>
                                <button
                                    onClick={onClose}
                                    className="mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-md hover:bg-blue-700 transition-colors"
                                >
                                    Browse Medicines
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item, idx) => (
                                    <div key={idx} className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 relative group hover:border-blue-100 transition-colors">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-slate-800 text-sm leading-snug">{item.name}</h4>
                                            <p className="text-xs text-slate-400 mt-0.5">Store: {item.pharmacyName}</p>
                                            <p className="text-xs font-bold text-blue-600 mt-1.5">₹{item.price} each</p>
                                        </div>

                                        <div className="flex flex-col items-end justify-between shrink-0">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.name, item.pharmacyName, -1)}
                                                    className="px-2 py-1 text-slate-500 hover:bg-slate-50 active:bg-slate-100 font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="px-2 text-xs font-bold text-slate-700">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.name, item.pharmacyName, 1)}
                                                    className="px-2 py-1 text-slate-500 hover:bg-slate-50 active:bg-slate-100 font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => removeFromCart(item.name, item.pharmacyName)}
                                                className="text-xs text-rose-500 hover:text-rose-700 font-semibold mt-2 underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {/* Price Details Card */}
                                <div className="p-4 bg-blue-50/50 border border-blue-100/50 rounded-xl space-y-2.5">
                                    <h3 className="font-bold text-blue-900 text-xs uppercase tracking-wider mb-1">Bill Summary</h3>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Items Subtotal</span>
                                        <span>₹{cartTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Delivery Fee</span>
                                        <span>₹{deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-slate-600">
                                        <span>Govt Taxes (GST 18%)</span>
                                        <span>₹{tax}</span>
                                    </div>
                                    <div className="h-px bg-slate-200 my-1"></div>
                                    <div className="flex justify-between text-sm font-bold text-slate-800">
                                        <span>Total Amount</span>
                                        <span className="text-blue-600 text-base">₹{grandTotal}</span>
                                    </div>
                                </div>

                                {/* Delivery & Checkout Form */}
                                <form onSubmit={handleSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                                    <h3 className="font-bold text-slate-800 text-sm">Delivery Information</h3>
                                    
                                    {error && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 font-medium">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Delivery Address</label>
                                        <textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            required
                                            rows={2}
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                                            placeholder="Enter your full home address"
                                        ></textarea>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Contact Phone Number</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                            placeholder="e.g. 9876543210"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500">Payment Option</label>
                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('COD')}
                                                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                    paymentMethod === 'COD'
                                                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                💵 Cash on Delivery
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPaymentMethod('Online')}
                                                className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                                    paymentMethod === 'Online'
                                                        ? 'bg-blue-50 border-blue-600 text-blue-700'
                                                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                                }`}
                                            >
                                                💳 Online Payment
                                            </button>
                                        </div>
                                    </div>

                                    {paymentMethod === 'Online' && (
                                        <div className="p-4 bg-slate-100/50 rounded-xl border border-slate-200/50 space-y-3 animate-fade-in">
                                            <div className="flex gap-2 border-b border-slate-200/60 pb-2">
                                                {['UPI', 'Card', 'Net Banking'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setOnlineOption(opt)}
                                                        className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                                            onlineOption === opt
                                                                ? 'bg-white shadow-sm border border-blue-600 text-blue-600 font-extrabold'
                                                                : 'text-slate-500 hover:bg-white/40'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>

                                            {onlineOption === 'UPI' && (
                                                <div className="space-y-1 animate-fade-in">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">UPI ID</label>
                                                    <input
                                                        type="text"
                                                        value={upiId}
                                                        onChange={(e) => setUpiId(e.target.value)}
                                                        required={paymentMethod === 'Online' && onlineOption === 'UPI'}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                                                        placeholder="e.g. name@upi / phone@okaxis"
                                                    />
                                                </div>
                                            )}

                                            {onlineOption === 'Card' && (
                                                <div className="space-y-2 animate-fade-in">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Card Number</label>
                                                        <input
                                                            type="text"
                                                            value={cardNumber}
                                                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').substring(0, 16))}
                                                            required={paymentMethod === 'Online' && onlineOption === 'Card'}
                                                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                                                            placeholder="1234 5678 1234 5678"
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry</label>
                                                            <input
                                                                type="text"
                                                                value={cardExpiry}
                                                                onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                                                                required={paymentMethod === 'Online' && onlineOption === 'Card'}
                                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                                                                placeholder="MM/YY"
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-400 uppercase">CVV</label>
                                                            <input
                                                                type="password"
                                                                value={cardCvv}
                                                                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                                                required={paymentMethod === 'Online' && onlineOption === 'Card'}
                                                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                                                                placeholder="•••"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {onlineOption === 'Net Banking' && (
                                                <div className="space-y-1 animate-fade-in">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Select Bank</label>
                                                    <select
                                                        value={selectedBank}
                                                        onChange={(e) => setSelectedBank(e.target.value)}
                                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:border-blue-500"
                                                    >
                                                        <option value="State Bank of India">State Bank of India</option>
                                                        <option value="HDFC Bank">HDFC Bank</option>
                                                        <option value="ICICI Bank">ICICI Bank</option>
                                                        <option value="Axis Bank">Axis Bank</option>
                                                        <option value="Punjab National Bank">Punjab National Bank</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {user ? (
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-[1.01] flex items-center justify-center gap-2 mt-4"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <>
                                                    <span>🔒 Place Order</span>
                                                    <span>₹{grandTotal}</span>
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                                            <p className="text-xs text-amber-800 font-bold mb-2">Login Required to Order</p>
                                            <p className="text-[11px] text-amber-700 mb-3">Please sign in or create an account to process this order.</p>
                                            <div className="flex gap-2 justify-center">
                                                <Link
                                                    to="/login"
                                                    className="px-4 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"
                                                >
                                                    Login
                                                </Link>
                                                <Link
                                                    to="/register"
                                                    className="px-4 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-50"
                                                >
                                                    Register
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartDrawer;
