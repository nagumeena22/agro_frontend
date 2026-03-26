'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Product } from '@/types';
import { useAuth } from '@/context/AuthContext';

export interface CartItem extends Product {
    qty: number;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, qty: number) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    totalPrice: number;
    totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const { user } = useAuth(); // Get user from AuthContext

    // Storage key depends on user
    const storageKey = user ? `cart_${user._id}` : 'cart_guest';

    // Load from local storage when user changes or on mount
    useEffect(() => {
        setIsLoaded(false);
        const storedCart = localStorage.getItem(storageKey);
        if (storedCart) {
            setCartItems(JSON.parse(storedCart));
        } else {
            setCartItems([]);
        }
        setIsLoaded(true);
    }, [storageKey]);

    // Save to local storage whenever cart changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(storageKey, JSON.stringify(cartItems));
        }
    }, [cartItems, isLoaded, storageKey]);

    const addToCart = (product: Product, qty: number) => {
        const existItem = cartItems.find((x) => x._id === product._id);

        if (existItem) {
            setCartItems(
                cartItems.map((x) =>
                    x._id === existItem._id ? { ...existItem, qty: existItem.qty + qty } : x
                )
            );
        } else {
            setCartItems([...cartItems, { ...product, qty }]);
        }
    };

    const removeFromCart = (id: string) => {
        setCartItems(cartItems.filter((x) => x._id !== id));
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const totalPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const totalItems = cartItems.reduce((acc, item) => acc + item.qty, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, totalPrice, totalItems }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
