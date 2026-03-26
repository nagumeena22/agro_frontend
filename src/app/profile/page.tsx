'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Order {
    _id: string;
    createdAt: string;
    totalPrice: number;
    isPaid: boolean;
    isDelivered: boolean;
    isConfirmed: boolean;
}

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            router.push('/login/buyer');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/orders/myorders', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });
                const data = await res.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, router]);

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">User Profile</h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">{user.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-4">My Orders</h2>
                {loading ? (
                    <div>Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="bg-white p-6 rounded shadow">
                        <p>You haven't placed any orders yet.</p>
                        <Link href="/shop" className="text-green-600 hover:underline mt-2 inline-block">
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {orders.map((order) => (
                                <li key={order._id}>
                                    <Link href={`/order/${order._id}`} className="block hover:bg-gray-50">
                                        <div className="px-4 py-4 sm:px-6">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-green-600 truncate">
                                                    Order #{order._id}
                                                </p>
                                                <div className="ml-2 flex-shrink-0 flex">
                                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {order.isPaid ? 'Paid' : 'Not Paid'}
                                                    </p>
                                                    <p className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isConfirmed ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.isConfirmed ? 'Confirmed' : 'Pending'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="mt-2 sm:flex sm:justify-between">
                                                <div className="sm:flex">
                                                    <p className="flex items-center text-sm text-gray-500">
                                                        Total: ${order.totalPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                                    <p>
                                                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
