'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, CheckCircle, Clock, Truck, MapPin, PackageCheck, Filter } from 'lucide-react';

interface Order {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    totalPrice: number;
    paymentMethod: string;
    paymentResult?: {
        id: string;
        status: string;
    };
    isPaid: boolean;
    paidAt?: string;
    isConfirmed: boolean;
    confirmedAt?: string;
    isShipped: boolean;
    shippedAt?: string;
    isOutForDelivery: boolean;
    outForDeliveryAt?: string;
    isDelivered: boolean;
    deliveredAt?: string;
    createdAt: string;
}

export default function AdminOrdersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [paymentFilter, setPaymentFilter] = useState('ALL');

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/login/seller');
            return;
        }

        const fetchOrders = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/orders', {
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

    const confirmOrder = async (id: string) => {
        if (window.confirm('Are you sure you want to confirm this order?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${id}/confirm`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });

                if (res.ok) {
                    // Refresh orders
                    setOrders(orders.map(order =>
                        order._id === id ? { ...order, isConfirmed: true } : order
                    ));
                } else {
                    const error = await res.json();
                    alert(error.message || 'Failed to confirm order');
                }
            } catch (err) {
                console.error(err);
                alert('Error confirming order');
            }
        }
    };

    const markAsPaid = async (id: string) => {
        if (window.confirm('Mark this COD order as paid?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/orders/${id}/admin-pay`, {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });

                if (res.ok) {
                    setOrders(orders.map(order =>
                        order._id === id ? { ...order, isPaid: true } : order
                    ));
                } else {
                    const error = await res.json();
                    alert(error.message || 'Failed to update payment status');
                }
            } catch (err) {
                console.error(err);
                alert('Error updating payment status');
            }
        }
    };

    const markAsShipped = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/shipped`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (res.ok) {
                setOrders(orders.map(o => o._id === id ? { ...o, isShipped: true, shippedAt: new Date().toISOString() } : o));
            }
        } catch (error) {
            console.error('Ship error', error);
        }
    };

    const markAsOutForDelivery = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/out-for-delivery`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (res.ok) {
                setOrders(orders.map(o => o._id === id ? { ...o, isOutForDelivery: true, outForDeliveryAt: new Date().toISOString() } : o));
            }
        } catch (error) {
            console.error('Out for delivery error', error);
        }
    };

    const markAsDelivered = async (id: string) => {
        try {
            const res = await fetch(`http://localhost:5000/api/orders/${id}/deliver`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (res.ok) {
                setOrders(orders.map(o => o._id === id ? { ...o, isDelivered: true, deliveredAt: new Date().toISOString() } : o));
            }
        } catch (error) {
            console.error('Deliver error', error);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl font-bold">Orders Management</h1>
                <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                    <Filter className="w-4 h-4 text-gray-400 ml-1" />
                    <span className="text-sm font-medium text-gray-500 mr-2">Payment:</span>
                    <select 
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="text-sm border-none focus:ring-0 cursor-pointer bg-transparent font-bold text-green-700"
                    >
                        <option value="ALL">All Methods</option>
                        <option value="COD">COD</option>
                        <option value="UPI">UPI</option>
                        <option value="Credit Card">Credit Card</option>
                    </select>
                </div>
            </div>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {orders
                        .filter(order => paymentFilter === 'ALL' || order.paymentMethod === paymentFilter)
                        .map((order) => (
                        <li key={order._id}>
                            <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-medium text-green-600 truncate">
                                            Order #{order._id}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            User: {order.user?.name} ({order.user?.email})
                                        </p>
                                    </div>
                                    <div className="ml-2 flex-shrink-0 flex flex-wrap gap-2 justify-end">
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {order.isPaid ? 'Paid' : 'Unpaid'}
                                        </p>
                                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.isConfirmed ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {order.isConfirmed ? 'Confirmed' : 'Pending'}
                                        </p>
                                        {order.isShipped && (
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                Shipped
                                            </p>
                                        )}
                                        {order.isOutForDelivery && (
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                                                Out for Delivery
                                            </p>
                                        )}
                                        {order.isDelivered && (
                                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Delivered
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="mt-2 sm:flex sm:justify-between items-center">
                                    <div className="sm:flex">
                                        <p className="flex items-center text-sm text-gray-500">
                                            Total: ${(order.totalPrice || 0).toFixed(2)}
                                        </p>
                                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                            Date: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="mt-2 flex items-center gap-3 sm:mt-0">
                                        {order.paymentMethod === 'COD' && !order.isPaid && (
                                            <button
                                                onClick={() => markAsPaid(order._id)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Mark Paid
                                            </button>
                                        )}
                                        {order.paymentMethod === 'UPI' && !order.isPaid && order.paymentResult?.status === 'PENDING_VERIFICATION' && (
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-700 border border-gray-200">
                                                    UTR: {order.paymentResult.id}
                                                </span>
                                                <button
                                                    onClick={() => markAsPaid(order._id)}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs"
                                                >
                                                    Verify
                                                </button>
                                            </div>
                                        )}
                                        {!order.isConfirmed && (
                                            <button
                                                onClick={() => confirmOrder(order._id)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs"
                                            >
                                                Confirm
                                            </button>
                                        )}
                                        {order.isConfirmed && !order.isShipped && (
                                            <button onClick={() => markAsShipped(order._id)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-xs">
                                                Ship
                                            </button>
                                        )}
                                        {order.isShipped && !order.isOutForDelivery && (
                                            <button onClick={() => markAsOutForDelivery(order._id)} className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs">
                                                Out for Delivery
                                            </button>
                                        )}
                                        {order.isOutForDelivery && !order.isDelivered && (
                                            <button onClick={() => markAsDelivered(order._id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs">
                                                Deliver
                                            </button>
                                        )}
                                        <Link
                                            href={`/order/${order._id}`}
                                            className="text-green-600 hover:text-green-900 text-sm font-medium ml-2"
                                        >
                                            Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
