'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { CreditCard, Smartphone, Banknote } from 'lucide-react';

export default function CheckoutPage() {
    const router = useRouter();
    const { cartItems, totalPrice, clearCart } = useCart();
    const { user } = useAuth();

    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Credit Card / PayPal');

    useEffect(() => {
        if (!user) {
            router.push('/login?redirect=/checkout');
        }
    }, [user, router]);

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        const orderData = {
            orderItems: cartItems.map(item => ({
                product: item._id,
                name: item.name,
                image: item.image,
                price: item.price,
                qty: item.qty,
            })),
            shippingAddress: { address, city, postalCode, country },
            paymentMethod,
            itemsPrice: totalPrice,
            shippingPrice: 0, // Free shipping for now
            taxPrice: 0, // No tax for now
            totalPrice: totalPrice,
        };

        try {
            const res = await fetch('https://agro-backend-dirj.onrender.com/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify(orderData),
            });

            if (res.ok) {
                clearCart();
                const data = await res.json();
                router.push(`/order/${data._id}`);
            } else {
                alert('Order Failed');
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong');
        }
    };

    if (cartItems.length === 0) {
        return <div className="p-10 text-center">Your cart is empty</div>;
    }

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <h1 className="text-3xl font-bold mb-6">Checkout</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
                    <form onSubmit={submitHandler} id="checkout-form">
                        <div className="mb-4">
                            <label className="block text-gray-700">Address</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 rounded"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">City</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 rounded"
                                value={city}
                                onChange={(e) => setCity(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Postal Code</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 rounded"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Country</label>
                            <input
                                type="text"
                                required
                                className="w-full border p-2 rounded"
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                            />
                        </div>

                        <h2 className="text-xl font-semibold mb-4 mt-6">Payment Method</h2>
                        <div className="space-y-3">
                            <label className={`flex items-center p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'Credit Card / PayPal' ? 'border-green-600 bg-green-50 shadow' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    value="Credit Card / PayPal"
                                    checked={paymentMethod === 'Credit Card / PayPal'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="hidden"
                                />
                                <CreditCard className={`h-6 w-6 mr-3 flex-shrink-0 ${paymentMethod === 'Credit Card / PayPal' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={`font-medium ${paymentMethod === 'Credit Card / PayPal' ? 'text-green-800' : 'text-gray-700'}`}>Credit Card / PayPal</span>
                            </label>

                            <label className={`flex items-center p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'UPI' ? 'border-green-600 bg-green-50 shadow' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    value="UPI"
                                    checked={paymentMethod === 'UPI'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="hidden"
                                />
                                <Smartphone className={`h-6 w-6 mr-3 flex-shrink-0 ${paymentMethod === 'UPI' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={`font-medium ${paymentMethod === 'UPI' ? 'text-green-800' : 'text-gray-700'}`}>UPI Payment</span>
                            </label>

                            <label className={`flex items-center p-4 border rounded cursor-pointer transition-all ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50 shadow' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input
                                    type="radio"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="hidden"
                                />
                                <Banknote className={`h-6 w-6 mr-3 flex-shrink-0 ${paymentMethod === 'COD' ? 'text-green-600' : 'text-gray-500'}`} />
                                <span className={`font-medium ${paymentMethod === 'COD' ? 'text-green-800' : 'text-gray-700'}`}>Cash on Delivery (COD)</span>
                            </label>
                        </div>
                    </form>
                </div>

                <div className="bg-gray-50 p-6 rounded shadow-md h-fit">
                    <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                            <span>Items</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>$0.00</span>
                        </div>
                        <div className="border-t pt-2 font-bold flex justify-between">
                            <span>Total</span>
                            <span>${totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                    <button
                        type="submit"
                        form="checkout-form"
                        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
                    >
                        Place Order
                    </button>
                    <div className="mt-4">
                        {cartItems.map(item => (
                            <div key={item._id} className="flex justify-between text-sm text-gray-600 mb-1">
                                <span>{item.name} x {item.qty}</span>
                                <span>${(item.price * item.qty).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
