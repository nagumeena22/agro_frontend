'use client';

import { ReactNode, useState, useEffect, useRef } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { Bell, User, Leaf, LogOut, AlertTriangle, Package, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Notification {
    id: string;
    type: 'low_stock' | 'new_order' | 'info';
    message: string;
    time: string;
    createdAt: number;
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { user, logout } = useAuth();
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const notificationRef = useRef<HTMLDivElement>(null);

    // Fetch notifications (low stock items, recent orders, new customers)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const notifs: Notification[] = [];

                if (!user?.token) return;

                // Get read notifications from localStorage
                const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');

                // Fetch recent orders (last 24 hours for bell)
                const ordersRes = await fetch('http://localhost:5000/api/orders', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (ordersRes.ok) {
                    const orders = await ordersRes.json();
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                    const recentOrders = orders.filter((order: any) =>
                        new Date(order.createdAt) > oneDayAgo
                    );

                    recentOrders.forEach((order: any) => {
                        const notifId = `order-${order._id}`;
                        // Only add to bell if not read
                        if (!readNotifications.includes(notifId)) {
                            notifs.push({
                                id: notifId,
                                type: 'new_order' as const,
                                message: `New order #${order._id.slice(-6)} received (₹${order.totalPrice})`,
                                time: getTimeAgo(order.createdAt),
                                createdAt: new Date(order.createdAt).getTime()
                            });
                        }
                    });
                }

                // Fetch recent customers (last 24 hours for bell)
                const usersRes = await fetch('http://localhost:5000/api/users', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (usersRes.ok) {
                    const users = await usersRes.json();
                    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

                    const newUsers = users.filter((u: any) =>
                        new Date(u.createdAt) > oneDayAgo && !u.isAdmin
                    );

                    newUsers.forEach((newUser: any) => {
                        const notifId = `user-${newUser._id}`;
                        // Only add to bell if not read
                        if (!readNotifications.includes(notifId)) {
                            notifs.push({
                                id: notifId,
                                type: 'info' as const,
                                message: `New customer registered: ${newUser.name}`,
                                time: getTimeAgo(newUser.createdAt),
                                createdAt: new Date(newUser.createdAt).getTime()
                            });
                        }
                    });
                }

                // Fetch low stock products (always show - active alerts, not affected by read status)
                const productsRes = await fetch('http://localhost:5000/api/products');
                if (productsRes.ok) {
                    const products = await productsRes.json();
                    const lowStock = products.filter((p: any) => p.countInStock <= p.minThreshold);

                    lowStock.forEach((p: any) => {
                        notifs.push({
                            id: `stock-${p._id}`,
                            type: 'low_stock' as const,
                            message: `${p.name} stock is low (${p.countInStock} left)`,
                            time: 'Active alert',
                            createdAt: Date.now()
                        });
                    });
                }

                // Sort notifications by timestamp: Newest first
                notifs.sort((a, b) => b.createdAt - a.createdAt);

                setNotifications(notifs);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        if (user?.isAdmin) {
            fetchNotifications();
            // Refresh notifications every 5 minutes
            const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
            return () => clearInterval(interval);
        }
    }, [user]);

    // Helper function to calculate time ago
    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            <AdminSidebar />

            <div className="flex-grow flex flex-col">
                {/* Top Admin Navbar */}
                <nav className="bg-green-700 text-white shadow-lg h-16 flex items-center justify-between px-8">
                    <div className="flex items-center gap-2">
                        <Leaf className="h-8 w-8 text-yellow-400" />
                        <span className="font-bold text-xl tracking-wider">LakshmiAgro</span>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Notification Dropdown */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => {
                                    if (!showNotifications) {
                                        // Mark all current notifications as read
                                        const readNotifications = JSON.parse(localStorage.getItem('readNotifications') || '[]');
                                        const newReadNotifications = [...readNotifications, ...notifications.map(n => n.id)];
                                        const uniqueReadNotifications = Array.from(new Set(newReadNotifications));
                                        localStorage.setItem('readNotifications', JSON.stringify(uniqueReadNotifications));

                                        // Clear notifications from bell after marking as read
                                        setTimeout(() => {
                                            setNotifications([]);
                                        }, 120000); // Give user 2 minutes to see them before clearing
                                    }
                                    setShowNotifications(!showNotifications);
                                }}
                                className="relative text-white hover:text-yellow-300 transition"
                            >
                                <Bell className="h-6 w-6" />
                                {notifications.length > 0 && (
                                    <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                                )}
                            </button>

                            {/* Notification Dropdown Menu */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-200">
                                        <h3 className="text-sm font-bold text-gray-800">Notifications</h3>
                                        <p className="text-xs text-gray-500">{notifications.length} new alerts</p>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length > 0 ? (
                                            notifications.map((notif) => (
                                                <div
                                                    key={notif.id}
                                                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer ${notif.type === 'low_stock' ? 'bg-red-50' :
                                                        notif.type === 'new_order' ? 'bg-blue-50' : 'bg-green-50'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`p-2 rounded-full ${notif.type === 'low_stock' ? 'bg-red-100' :
                                                            notif.type === 'new_order' ? 'bg-blue-100' : 'bg-green-100'
                                                            }`}>
                                                            {notif.type === 'low_stock' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                                                            {notif.type === 'new_order' && <ShoppingCart className="h-4 w-4 text-blue-600" />}
                                                            {notif.type === 'info' && <Package className="h-4 w-4 text-green-600" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-800">{notif.message}</p>
                                                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center text-gray-500">
                                                <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                                                <p className="text-sm">No new notifications</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3 border-t border-gray-200 text-center">
                                        <Link
                                            href="/admin/inventory"
                                            onClick={() => setShowNotifications(false)}
                                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                                        >
                                            View All Alerts
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-yellow-300 flex items-center gap-1">
                                    <User className="h-4 w-4" /> {user?.name || 'Admin User'}
                                </p>
                                <p className="text-xs text-green-200">Shop Owner</p>
                            </div>
                            <button
                                onClick={logout}
                                className="flex items-center gap-1 hover:text-red-300 transition text-sm"
                            >
                                <LogOut className="h-4 w-4" /> Logout
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="p-8 overflow-y-auto h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    );
}
