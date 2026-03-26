'use client';

import Link from 'next/link';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export default function CartPage() {
    const { cartItems, removeFromCart, totalPrice } = useCart();
    const { user } = useAuth();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center space-y-4">
                <div className="bg-green-100 p-6 rounded-full">
                    <ShoppingBag className="h-16 w-16 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
                <p className="text-gray-600">Looks like you haven't added any products yet.</p>
                <Link href="/shop" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {cartItems.map((item) => (
                            <li key={item._id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img
                                        src={item.image || 'https://placehold.co/100'}
                                        alt={item.name}
                                        className="h-full w-full object-cover object-center"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col sm:flex-row sm:justify-between w-full">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            <Link href={`/product/${item._id}`}>{item.name}</Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">{item.brand}</p>
                                        <p className="mt-1 text-sm font-medium text-green-600">${item.price}</p>
                                    </div>

                                    <div className="flex items-center justify-between sm:flex-col sm:items-end mt-4 sm:mt-0 gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-md">
                                            {/* Quantity controls could go here */}
                                            <span className="px-3 py-1 font-medium text-gray-700">Qty: {item.qty}</span>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeFromCart(item._id)}
                                            className="font-medium text-red-600 hover:text-red-500 flex items-center gap-1"
                                        >
                                            <Trash2 className="h-4 w-4" /> Remove
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="border-t border-gray-200 p-6 bg-gray-50">
                        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                            <p>Subtotal</p>
                            <p>${totalPrice.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500 mb-6">
                            Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                            <Link
                                href={user ? "/checkout" : "/login?redirect=/checkout"}
                                className="flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-600 hover:bg-green-700"
                            >
                                Checkout
                            </Link>
                        </div>
                        <div className="mt-6 flex justify-center text-sm text-center text-gray-500">
                            <p>
                                or{' '}
                                <Link href="/shop" className="text-green-600 font-medium hover:text-green-500">
                                    Continue Shopping<span aria-hidden="true"> &rarr;</span>
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
