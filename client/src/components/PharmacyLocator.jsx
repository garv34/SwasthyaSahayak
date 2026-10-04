import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent';
import locationService from '../services/locationService';
import SkeletonLoader from './SkeletonLoader';
import { useCart } from '../context/CartContext';

const PharmacyLocator = ({ medicineName, onClose, onOpenCart }) => {
    const { addToCart } = useCart();
    const [userLocation, setUserLocation] = useState(null);
    const [pharmacies, setPharmacies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAddress, setUserAddress] = useState("Locating...");

    useEffect(() => {
        const fetchLocationAndPharmacies = async () => {
            try {
                setLoading(true);
                // 1. Get User Location
                let location;
                try {
                    location = await locationService.getUserLocation();
                } catch (locErr) {
                    console.warn("Could not get geo-location, using Delhi default:", locErr);
                    location = { lat: 28.6139, lng: 77.2090 }; // Delhi coordinates as default fallback
                }
                setUserLocation(location);

                // 2. Get address
                try {
                    const address = await locationService.getAddressFromCoordinates(location.lat, location.lng);
                    setUserAddress(address);
                } catch (addrErr) {
                    setUserAddress("New Delhi, Delhi, India");
                }

                // 3. Search for Pharmacies nearby
                const results = await locationService.searchNearbyPharmacies(location.lat, location.lng);
                
                // Add mock pricing and inventory for the specific medicine
                const enrichedResults = results.map((ph, idx) => {
                    const seed = idx + medicineName.length;
                    const price = Math.round(30 + (seed % 7) * 15); // mock price between ₹30 and ₹135
                    const inStock = (seed % 6) !== 0; // 5 out of 6 in stock
                    const rating = (4.0 + (seed % 10) * 0.1).toFixed(1);
                    return { ...ph, price, inStock, rating };
                });

                setPharmacies(enrichedResults);
            } catch (err) {
                console.error("Pharmacy Locator Error:", err);
                setError(err.message || "Failed to search nearby pharmacies.");
            } finally {
                setLoading(false);
            }
        };

        fetchLocationAndPharmacies();
    }, [medicineName]);

    const handleOrder = (pharmacy, medicine) => {
        addToCart(medicine, pharmacy.name, pharmacy.price);
        onClose();
        if (onOpenCart) onOpenCart();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-green-600 text-white">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span>🏥</span> Pharmacy Finder
                        </h2>
                        <p className="text-xs text-emerald-100 mt-0.5">Finding stock for: <strong className="text-white">{medicineName}</strong></p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-emerald-700 rounded-full transition-colors text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Address Bar */}
                <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
                    <span className="text-sm">📍</span>
                    <span className="truncate">Your Location: {userAddress}</span>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-0 flex flex-col md:flex-row">

                    {/* Map Section */}
                    <div className="w-full md:w-2/3 h-[300px] md:h-auto min-h-[300px] relative bg-slate-50">
                        {loading && !userLocation && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-3"></div>
                                    <p className="text-gray-500 text-sm">Searching nearby medical stores...</p>
                                </div>
                            </div>
                        )}

                        {!loading && userLocation && (
                            <MapComponent userLocation={userLocation} hospitals={pharmacies} />
                        )}

                        {error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-red-50 z-10 p-4 text-center text-red-600">
                                <div>
                                    <p className="font-bold mb-2">Error</p>
                                    <p className="text-sm">{error}</p>
                                    <button
                                        onClick={onClose}
                                        className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* List Section */}
                    <div className="w-full md:w-1/3 bg-slate-50 border-l border-slate-200 overflow-y-auto max-h-[300px] md:max-h-none flex flex-col">
                        <div className="p-3 sticky top-0 bg-slate-50 border-b border-slate-200 z-10 flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 text-sm">Stores Nearby ({pharmacies.length})</h3>
                        </div>

                        {loading && (
                            <div className="p-4 space-y-4">
                                <SkeletonLoader />
                                <SkeletonLoader />
                            </div>
                        )}

                        {!loading && pharmacies.length === 0 && !error && (
                            <div className="p-8 text-center text-slate-500">
                                <p className="text-sm">No pharmacies found nearby.</p>
                            </div>
                        )}

                        <div className="divide-y divide-slate-200 flex-1">
                            {pharmacies.map(pharmacy => (
                                <div key={pharmacy.id} className="p-4 bg-white hover:bg-emerald-50/20 transition-colors">
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{pharmacy.name}</h4>
                                        <span className="text-xs text-amber-500 font-bold shrink-0">⭐ {pharmacy.rating}</span>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1 mb-2">
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                                            pharmacy.inStock ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {pharmacy.inStock ? 'In Stock' : 'Out of Stock'}
                                        </span>
                                        <span className="text-slate-300 text-xs">•</span>
                                        <span className="text-xs font-semibold text-emerald-600">
                                            {pharmacy.distance < 1
                                                ? `${(pharmacy.distance * 1000).toFixed(0)} m`
                                                : `${pharmacy.distance.toFixed(1)} km`}
                                        </span>
                                        <span className="text-slate-300 text-xs">•</span>
                                        <span className="text-xs font-bold text-slate-700">₹{pharmacy.price}</span>
                                    </div>

                                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">{pharmacy.address}</p>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleOrder(pharmacy, medicineName)}
                                            disabled={!pharmacy.inStock}
                                            className={`flex-1 text-center py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                                                pharmacy.inStock
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:scale-[1.02]'
                                                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                            }`}
                                        >
                                            🛒 Order & Deliver
                                        </button>
                                        <a
                                            href={`tel:${pharmacy.phone}`}
                                            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-xs flex items-center justify-center"
                                            title="Call Store"
                                        >
                                            📞
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PharmacyLocator;
