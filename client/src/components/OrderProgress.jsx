import React, { useState, useEffect } from 'react';

const OrderProgress = ({ order, onClose }) => {
    // If order.status is already 'Delivered', start at 3 (Delivered), else start at 0 (Placed)
    const getInitialStep = (status) => {
        switch (status) {
            case 'Preparing': return 1;
            case 'Out for Delivery': return 2;
            case 'Delivered': return 3;
            default: return 0; // Placed
        }
    };

    const [currentStep, setCurrentStep] = useState(() => getInitialStep(order.status));
    const [secondsRemaining, setSecondsRemaining] = useState(1500); // 25 minutes

    const steps = [
        { label: 'Order Placed', desc: 'We have received your order.', icon: '📝', statusName: 'Placed' },
        { label: 'Preparing Medicine', desc: 'Pharmacist is packaging your items.', icon: '💊', statusName: 'Preparing' },
        { label: 'Out for Delivery', desc: 'SwasthyaSahayak agent is on the way.', icon: '🛵', statusName: 'Out for Delivery' },
        { label: 'Delivered', desc: 'Items arrived safely at your doorstep.', icon: '🏡', statusName: 'Delivered' }
    ];

    // Simulate progress if the order is newly placed and not yet delivered
    useEffect(() => {
        if (order.status === 'Delivered') {
            setCurrentStep(3);
            return;
        }

        // Stepper simulation intervals
        const timer1 = setTimeout(() => {
            if (currentStep < 1) setCurrentStep(1);
        }, 6000); // 6s to Preparing

        const timer2 = setTimeout(() => {
            if (currentStep < 2) setCurrentStep(2);
        }, 15000); // 15s to Out for Delivery

        const timer3 = setTimeout(() => {
            if (currentStep < 3) setCurrentStep(3);
        }, 28000); // 28s to Delivered

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [order.status]);

    // Count down estimated arrival time
    useEffect(() => {
        if (currentStep === 3) return; // Stop timer if delivered

        const interval = setInterval(() => {
            setSecondsRemaining(prev => (prev > 10 ? prev - 1 : 10));
        }, 1000);

        return () => clearInterval(interval);
    }, [currentStep]);

    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const getProgressPercent = () => {
        return (currentStep / (steps.length - 1)) * 100;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in font-sans">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col relative">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors z-10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center pb-8">
                    <span className="text-sm font-semibold tracking-wider bg-white/20 px-3 py-1 rounded-full text-white/90">
                        Order #{order._id ? order._id.slice(-6).toUpperCase() : 'SIMULATED'}
                    </span>
                    <h2 className="text-2xl font-bold mt-3">Live Delivery Tracking</h2>
                    <p className="text-xs text-blue-100 mt-1">SwasthyaSahayak Express Delivery</p>
                </div>

                {/* Progress Animation area */}
                <div className="px-6 py-6 bg-slate-50 border-b border-slate-100 text-center relative">
                    {currentStep === 3 ? (
                        <div className="animate-fade-in">
                            <span className="text-5xl block animate-bounce mb-2">🎉</span>
                            <h3 className="text-lg font-bold text-slate-800">Your Medicine is Delivered!</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Thank you for ordering with SwasthyaSahayak.</p>
                        </div>
                    ) : (
                        <div className="animate-pulse">
                            <span className="text-4xl block animate-bounce mb-2">
                                {steps[currentStep].icon}
                            </span>
                            <h3 className="text-lg font-bold text-slate-800">
                                {currentStep === 2 ? 'Agent is arriving...' : 'Preparing your order...'}
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Estimated Delivery Time</p>
                            <span className="text-3xl font-extrabold text-blue-600 tracking-tight block mt-1">
                                {formatTime(secondsRemaining)} mins
                            </span>
                        </div>
                    )}

                    {/* Progress Bar Container */}
                    <div className="mt-6 relative h-1.5 bg-slate-200 rounded-full w-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out"
                            style={{ width: `${getProgressPercent()}%` }}
                        ></div>
                    </div>
                </div>

                {/* Stepper Details */}
                <div className="p-6 space-y-6 overflow-y-auto max-h-[300px] flex-1">
                    {steps.map((step, idx) => {
                        const isCompleted = idx < currentStep;
                        const isActive = idx === currentStep;
                        const isPending = idx > currentStep;

                        return (
                            <div key={idx} className="flex gap-4 items-start relative">
                                {/* Connector line */}
                                {idx < steps.length - 1 && (
                                    <div className={`absolute left-4 top-8 w-0.5 h-10 ${
                                        idx < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                                    }`}></div>
                                )}

                                {/* Step circle */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold z-10 transition-all ${
                                    isCompleted ? 'bg-blue-600 text-white shadow-md' :
                                        isActive ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-600 animate-pulse' :
                                            'bg-slate-100 text-slate-400'
                                }`}>
                                    {isCompleted ? '✓' : step.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <h4 className={`text-sm font-bold leading-tight ${
                                        isCompleted ? 'text-slate-700' :
                                            isActive ? 'text-blue-600' :
                                                'text-slate-400'
                                    }`}>
                                        {step.label}
                                    </h4>
                                    <p className={`text-xs mt-0.5 ${
                                        isActive ? 'text-slate-600' : 'text-slate-400'
                                    }`}>
                                        {step.desc}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Details */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                    <div className="flex justify-between items-start text-xs">
                        <span className="text-slate-400 shrink-0">Ordered From:</span>
                        <span className="text-slate-700 font-bold text-right truncate max-w-[200px]">
                            {order.items ? order.items.map(item => item.pharmacyName).filter((val, idx, self) => self.indexOf(val) === idx).join(', ') : 'Swasthya Express Pharmacy'}
                        </span>
                    </div>
                    <div className="flex justify-between items-start text-xs">
                        <span className="text-slate-400 shrink-0">Delivery Address:</span>
                        <span className="text-slate-700 font-medium text-right line-clamp-1">{order.address}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Payment Details:</span>
                        <span className="text-slate-700 font-medium text-right truncate max-w-[200px]">
                            {order.paymentMethod} {order.paymentDetails ? `(${order.paymentDetails})` : ''}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-2 mt-1">
                        <span className="text-slate-500 font-semibold">Total Amount Paid:</span>
                        <span className="text-blue-600 font-extrabold text-sm">₹{order.totalAmount}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-full mt-2 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                        Minimize Tracker
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderProgress;
