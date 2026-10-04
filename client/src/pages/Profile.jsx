import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../services/api';
import Header from '../components/Header';

const Profile = () => {
    const { user, logout } = useAuth();
    const { setActiveOrder } = useCart();
    const [history, setHistory] = useState([]);
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // 'history' or 'orders'
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                const [historyRes, ordersRes] = await Promise.all([
                    api.get('/history'),
                    api.get('/orders')
                ]);
                setHistory(historyRes.data);
                setOrders(ordersRes.data);
            } catch (err) {
                console.error("Failed to fetch profile data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchProfileData();
        }
    }, [user]);

    if (!user) return <div className="min-h-screen flex items-center justify-center text-slate-500">Access Denied</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
            <Header />
            <main className="container mx-auto p-4 max-w-4xl mt-24">
                
                {/* Profile Card Header */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                    <div className="flex items-center gap-4 z-10">
                        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl shadow-inner">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800">Welcome, {user.name} 👋</h1>
                            <p className="text-slate-500 text-sm">{user.email}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { logout(); window.location.href = '/'; }}
                        className="px-6 py-2.5 border border-red-200 text-red-600 font-medium rounded-xl hover:bg-red-50 hover:border-red-300 transition-all z-10 shadow-sm cursor-pointer"
                    >
                        Logout
                    </button>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-6 border-b border-slate-200 mb-6">
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-3 text-base sm:text-lg font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'history'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span>📜</span> Health Reports ({history.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`pb-3 text-base sm:text-lg font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                            activeTab === 'orders'
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <span>📦</span> Medicine Orders ({orders.length})
                    </button>
                </div>

                {/* Tab Contents */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-white rounded-xl animate-pulse"></div>
                        ))}
                    </div>
                ) : activeTab === 'history' ? (
                    // Health Reports history
                    history.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm animate-fade-in">
                            <div className="text-6xl mb-4 opacity-50">📂</div>
                            <p className="text-slate-500 text-lg font-medium">No history found</p>
                            <p className="text-slate-400 mb-6 max-w-xs mx-auto">Run a checkup to see your past analysis results here.</p>
                            <a href="/chatbot" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all inline-block">
                                Start Analysis
                            </a>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {history.map(report => (
                                <div key={report._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group animate-fade-in">
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                {new Date(report.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            <p className="font-semibold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                                                {report.symptoms.join(', ')}
                                            </p>
                                        </div>
                                        <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>

                                    <div className="space-y-3 pt-4 border-t border-slate-50">
                                        {report.analysis.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                                <span className="font-semibold text-slate-700">{item.condition}</span>
                                                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide
                                                    ${item.severity === 'Critical' ? 'bg-rose-100 text-rose-700' :
                                                        item.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                                                            item.severity === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-emerald-100 text-emerald-700'
                                                    }`}>
                                                    {item.severity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    // Medicine Orders list
                    orders.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm animate-fade-in">
                            <div className="text-6xl mb-4 opacity-50">💊</div>
                            <p className="text-slate-500 text-lg font-medium">No medicine orders found</p>
                            <p className="text-slate-400 mb-6 max-w-xs mx-auto">Get symptom checker recommendations to order medicines directly.</p>
                            <a href="/chatbot" className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 transition-all inline-block">
                                Order Medicines
                            </a>
                        </div>
                    ) : (
                        <div className="grid gap-6 animate-fade-in">
                            {orders.map(order => (
                                <div key={order._id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-all group">
                                    <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2">
                                        <div>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                                                Order Placed: {new Date(order.createdAt).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                ID: #{order._id.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                                order.status === 'Delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                                order.status === 'Out for Delivery' ? 'bg-amber-50 text-amber-700 border-amber-100 animate-pulse' :
                                                'bg-blue-50 text-blue-700 border-blue-100'
                                            }`}>
                                                ● {order.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="py-4 border-t border-b border-slate-100/50 space-y-3">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Items</h4>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center text-sm">
                                                <div>
                                                    <span className="font-bold text-slate-700">{item.name}</span>
                                                    <span className="text-slate-400 text-xs ml-1.5">x{item.quantity}</span>
                                                    <p className="text-[10px] text-slate-400">Fulfilled by: {item.pharmacyName}</p>
                                                </div>
                                                <span className="font-semibold text-slate-700">₹{item.price * item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between items-center pt-4">
                                        <div>
                                            <p className="text-xs text-slate-400">Paid via {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                            <p className="text-sm font-extrabold text-slate-800 mt-0.5">Total: ₹{order.totalAmount}</p>
                                        </div>
                                        <button
                                            onClick={() => setActiveOrder(order)}
                                            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <span>🛵</span> Track Delivery
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
};

export default Profile;
