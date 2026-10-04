import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const local = localStorage.getItem('swasthya_sahayak_cart');
        return local ? JSON.parse(local) : [];
    });

    const [isCartOpen, setIsCartOpen] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);

    useEffect(() => {
        localStorage.setItem('swasthya_sahayak_cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (medicineName, pharmacyName = "Swasthya Express Pharmacy", price = 45) => {
        setCartItems(prevItems => {
            const existing = prevItems.find(item => item.name === medicineName && item.pharmacyName === pharmacyName);
            if (existing) {
                return prevItems.map(item =>
                    item.name === medicineName && item.pharmacyName === pharmacyName
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { name: medicineName, pharmacyName, price, quantity: 1 }];
        });
    };

    const removeFromCart = (medicineName, pharmacyName) => {
        setCartItems(prevItems =>
            prevItems.filter(item => !(item.name === medicineName && item.pharmacyName === pharmacyName))
        );
    };

    const updateQuantity = (medicineName, pharmacyName, delta) => {
        setCartItems(prevItems =>
            prevItems.map(item => {
                if (item.name === medicineName && item.pharmacyName === pharmacyName) {
                    const newQty = item.quantity + delta;
                    return newQty > 0 ? { ...item, quantity: newQty } : item;
                }
                return item;
            }).filter(item => item.quantity > 0)
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            cartCount,
            cartTotal,
            isCartOpen,
            setIsCartOpen,
            activeOrder,
            setActiveOrder
        }}>
            {children}
        </CartContext.Provider>
    );
};
