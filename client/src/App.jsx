import React, { useState } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Header from './components/Header';
import { useCart } from './context/CartContext';
import CartDrawer from './components/CartDrawer';
import OrderProgress from './components/OrderProgress';
import { useLanguage } from './context/LanguageContext';
import { useAuth } from './context/AuthContext';
import Lottie from 'lottie-react';
import doctorAnimation from './Animations/doctor.json';

import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import ChatBot from './pages/ChatBot';
import DoctorLocator from './components/DoctorLocator';

import BMICalculator from './components/BMICalculator';
import Features from './components/Features';
import BMILottie from './Animations/BMI.json';
import WaterTracker from './components/WaterTracker';
import CalorieTracker from './components/CalorieTracker';
import HowItWorks from './components/HowItWorks';

function Home() {
  const { t } = useLanguage();
  const [showLocator, setShowLocator] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-4 flex flex-col md:flex-row items-center justify-center pt-20">
        {/* Left Side: Heading and Text */}
        <div className="w-full md:w-1/2 p-4 md:p-12 text-center md:text-left z-10">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium animate-fade-in">
            ✨ Your Personal AI Health Assistant
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-800 mb-6 leading-tight animate-fade-in" style={{ animationDelay: '0.1s' }}>
            Identify Symptoms with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI Precision
            </span>
          </h1>
          <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto md:mx-0 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            Describe how you feel, and get instant insights into possible conditions, severity, and advice. Fast, private, and powered by advanced AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <Link
              to="/chatbot"
              className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:scale-105 transition-all duration-300"
            >
              <span>Start Symptom Check</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>

            <button
              onClick={() => setShowLocator(true)}
              className="inline-flex items-center justify-center gap-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all duration-300"
            >
              <span>Find Nearby Help</span>
              <span className="text-xl">🏥</span>
            </button>
          </div>
        </div>

        {/* Right Side: Doctor Animation */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex justify-center items-center">
          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl animate-float">
            <Lottie animationData={doctorAnimation} loop={true} />
          </div>
        </div>
      </main>


      {/* BMI Section with Animation */}
      <section className="container mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
        {/* BMI Animation on the left */}
        <div className="w-full md:w-1/2 flex justify-center items-center">
          <div className="w-full max-w-md md:max-w-lg lg:max-w-xl animate-float bg-white rounded-xl shadow p-6">
            <Lottie animationData={BMILottie} loop={true} />
          </div>
        </div>
        {/* BMI Calculator on the right */}
        <div className="w-full md:w-1/2">
          <BMICalculator />
        </div>
      </section>

      {/* Health Trackers Section */}
      <section className="container mx-auto px-4 py-12 bg-blue-50/50 rounded-3xl mb-12">
        <div className="text-center mb-10">
          <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Daily Tracking</span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mt-2">Monitor Your Daily Habits</h2>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">Keep track of your hydration and nutrition to maintain a healthy lifestyle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <WaterTracker />
          <CalorieTracker />
        </div>
      </section>

      {/* Features Section */}
      <Features />

      {/* How It Works Section */}
      <HowItWorks />

      {showLocator && <DoctorLocator onClose={() => setShowLocator(false)} />}

      <footer className="text-center p-6 text-slate-400 text-sm bg-white border-t border-slate-100">
        <p>&copy; {new Date().getFullYear()} SwasthyaSahayak. All rights reserved.</p>
      </footer>
    </div>
  );
}

function App() {
  const { isCartOpen, setIsCartOpen, activeOrder, setActiveOrder } = useCart();

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/chatbot" element={<ChatBot />} />
      </Routes>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckoutSuccess={(order) => setActiveOrder(order)}
      />

      {activeOrder && (
        <OrderProgress
          order={activeOrder}
          onClose={() => setActiveOrder(null)}
        />
      )}
    </>
  );
}

export default App;
