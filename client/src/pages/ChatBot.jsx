import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useConnectivity from '../hooks/useConnectivity';
import useSymptomAnalysis from '../hooks/useSymptomAnalysis';
import Disclaimer from '../components/Disclaimer';
import SymptomForm from '../components/SymptomForm';
import ResultCard from '../components/ResultCard';
import SkeletonLoader from '../components/SkeletonLoader';
import DoctorLocator from '../components/DoctorLocator';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import Hero from '../components/Hero';

const ChatBot = () => {
    const { language, toggleLanguage, t } = useLanguage();
    const isOffline = useConnectivity();
    const { results, loading, error, searched, analyze, clearSearch } = useSymptomAnalysis();
    const { cartCount, setIsCartOpen } = useCart();
    const [showLocator, setShowLocator] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 selection:bg-blue-100 selection:text-blue-900">

            {/* Custom Simple Header for ChatBot */}
            <header className="fixed w-full top-0 z-50 glass border-b border-slate-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Back Button */}
                        <Link to="/" className="p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-600 hover:text-blue-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                        </Link>

                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <img src="/logo.jpeg" alt="SwasthyaSahayak Logo" className="h-10 w-10 rounded-xl shadow-lg shadow-blue-500/30 transition-transform group-hover:scale-110 object-cover" />
                            <span className="text-xl font-bold text-slate-800 tracking-tight">
                                Swasthya<span className="text-blue-600">Sahayak</span>
                            </span>
                        </Link>
                    </div>

                    {/* Right Side Options */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative flex items-center justify-center p-2 rounded-full border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-700 hover:text-blue-600 cursor-pointer"
                            title="View Cart"
                        >
                            <span className="text-lg">🛒</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-sm font-medium text-slate-700"
                        >
                            <span>{language === 'en' ? '🇮🇳' : '🇺🇸'}</span>
                            <span className="hidden sm:inline">{language === 'en' ? 'HI' : 'EN'}</span>
                        </button>
                    </div>
                </div>
            </header>

            {isOffline && (
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 text-center text-sm font-medium animate-fade-in fixed top-[72px] w-full z-40 shadow-sm">
                    <p>You are currently offline. Using limited local database.</p>
                </div>
            )}

            {/* Floating Action Button for Locator */}
            <div className="fixed bottom-8 right-8 z-40">
                <button
                    onClick={() => setShowLocator(true)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-full shadow-lg shadow-blue-600/30 transition-all duration-300 hover:scale-105 hover:-translate-y-1 group"
                >
                    <span className="text-2xl group-hover:animate-bounce">🏥</span>
                    <span className="font-bold hidden md:inline">Find Nearby Help</span>
                </button>
            </div>

            {showLocator && <DoctorLocator onClose={() => setShowLocator(false)} />}

            <main className="container mx-auto p-4 max-w-3xl -mt-8 relative z-10 pt-28">

                <SymptomForm onAnalyze={analyze} loading={loading} />

                {error === 'LIMIT_REACHED' ? (
                    <div className="p-8 mb-8 bg-blue-50 rounded-2xl border border-blue-100 shadow-sm text-center animate-fade-in">
                        <div className="text-4xl mb-3">🔒</div>
                        <h3 className="text-xl font-bold text-blue-900 mb-2">Free Limit Reached</h3>
                        <p className="text-blue-700 mb-6 max-w-md mx-auto">
                            You've used your 3 free analyses. Please login or create an account to continue using SwasthyaSahayak for free.
                        </p>
                        <div className="flex justify-center gap-4">
                            <a href="/login" className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30">
                                Login
                            </a>
                            <a href="/register" className="px-6 py-2.5 bg-white text-blue-600 font-semibold rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors">
                                Sign Up
                            </a>
                        </div>
                    </div>
                ) : error && (
                    <div className="p-4 mb-8 text-rose-700 bg-rose-50 rounded-xl border border-rose-100 shadow-sm animate-fade-in flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                {loading && <SkeletonLoader />}

                {searched && !loading && results.length === 0 && !error && (
                    <div className="p-12 text-center bg-white rounded-2xl shadow-sm border border-slate-100 animate-fade-in">
                        <div className="text-6xl mb-4 opacity-50">🔍</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">No Matches Found</h3>
                        <p className="text-slate-500 max-w-md mx-auto">{t.noMatch || "We couldn't identify a condition matching those symptoms. Try describing them differently."}</p>
                        <button
                            onClick={clearSearch}
                            className="mt-6 text-blue-600 font-semibold hover:text-blue-800 transition-colors"
                        >
                            Clear Search
                        </button>
                    </div>
                )}

                <div className="space-y-6">
                    {results.map((result, index) => (
                        <ResultCard key={index} result={result} />
                    ))}
                </div>
            </main>

            {!searched && (
                <footer className="text-center p-8 text-slate-400 text-sm mt-12 bg-white border-t border-slate-100">
                    <p>&copy; {new Date().getFullYear()} SwasthyaSahayak. All rights reserved.</p>
                    <div className="flex justify-center gap-4 mt-2">
                        <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-500 transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-500 transition-colors">About</a>
                    </div>
                </footer>
            )}
        </div>
    );
};

export default ChatBot;
