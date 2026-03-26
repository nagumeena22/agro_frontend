'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    DollarSign,
    ShoppingBag,
    ShoppingCart,
    AlertTriangle,
    Users
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface Product {
    _id: string;
    name: string;
    countInStock: number;
    minThreshold: number;
    category: string;
}

interface AnalyticsData {
    monthlySales: Array<{ name: string; revenue: number; orders: number }>;
    orderStatusData: Array<{ name: string; value: number }>;
    userGrowth: Array<{ name: string; users: number }>;
    stats: {
        totalRevenue: number;
        totalProducts: number;
        totalOrders: number;
        totalUsers: number;
        lowStockProducts: number;
    };
}

interface Notification {
    id: string;
    type: 'low_stock' | 'new_order' | 'info';
    message: string;
    time: string;
    createdAt: number;
}

export default function AdminDashboard() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [lowStockItems, setLowStockItems] = useState<Product[]>([]);
    const [categoryData, setCategoryData] = useState<Array<{ name: string; value: number }>>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/login/seller');
            return;
        }

        const fetchDashboardData = async () => {
            try {
                const notifs: Notification[] = [];

                // Fetch analytics data
                const analyticsRes = await fetch('http://localhost:5000/api/analytics', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (analyticsRes.ok) {
                    const data = await analyticsRes.json();
                    setAnalyticsData(data);
                }

                // Fetch recent orders (last 3 days for dashboard)
                const ordersRes = await fetch('http://localhost:5000/api/orders', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (ordersRes.ok) {
                    const orders = await ordersRes.json();
                    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

                    const recentOrders = orders.filter((order: any) =>
                        new Date(order.createdAt) > threeDaysAgo
                    );

                    recentOrders.forEach((order: any) => {
                        notifs.push({
                            id: `order-${order._id}`,
                            type: 'new_order' as const,
                            message: `New order #${order._id.slice(-6)} received (₹${order.totalPrice})`,
                            time: getTimeAgo(order.createdAt),
                            createdAt: new Date(order.createdAt).getTime()
                        });
                    });
                }

                // Fetch recent customers (last 3 days for dashboard)
                const usersRes = await fetch('http://localhost:5000/api/users', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (usersRes.ok) {
                    const users = await usersRes.json();
                    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

                    const newUsers = users.filter((u: any) =>
                        new Date(u.createdAt) > threeDaysAgo && !u.isAdmin
                    );

                    newUsers.forEach((newUser: any) => {
                        notifs.push({
                            id: `user-${newUser._id}`,
                            type: 'info' as const,
                            message: `New customer registered: ${newUser.name}`,
                            time: getTimeAgo(newUser.createdAt),
                            createdAt: new Date(newUser.createdAt).getTime()
                        });
                    });
                }

                // Fetch low stock products
                const productsRes = await fetch('http://localhost:5000/api/products');
                if (productsRes.ok) {
                    const products: Product[] = await productsRes.json();
                    const lowStock = products.filter(p => p.countInStock <= p.minThreshold);
                    setLowStockItems(lowStock.slice(0, 5)); // Show top 5

                    // Add low stock notifications
                    lowStock.forEach((p: any) => {
                        notifs.push({
                            id: `stock-${p._id}`,
                            type: 'low_stock' as const,
                            message: `${p.name} stock is low (${p.countInStock} left)`,
                            time: 'Active alert',
                            createdAt: Date.now() // Always newest
                        });
                    });

                    // Calculate category distribution
                    const categoryCount: { [key: string]: number } = {};
                    products.forEach(p => {
                        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
                    });
                    const catData = Object.entries(categoryCount).map(([name, value]) => ({
                        name,
                        value
                    }));
                    setCategoryData(catData);
                }

                // Sort notifications by timestamp: Newest first
                notifs.sort((a, b) => b.createdAt - a.createdAt);

                setNotifications(notifs);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user, router]);

    // Helper function to calculate time ago
    const getTimeAgo = (date: string) => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

        if (seconds < 60) return 'Just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
        return `${Math.floor(seconds / 86400)} days ago`;
    };

    if (loading) {
        return <div className="p-6">Loading dashboard...</div>;
    }

    // Use last 7 days of sales data for the line chart
    const salesData = analyticsData?.monthlySales.slice(-7) || [];

    return (
        <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    {
                        label: 'Total Revenue',
                        value: `$${analyticsData?.stats.totalRevenue.toLocaleString() || '0'}`,
                        icon: DollarSign,
                        color: 'text-green-600',
                        bg: 'bg-green-100'
                    },
                    {
                        label: 'Total Products',
                        value: analyticsData?.stats.totalProducts.toString() || '0',
                        icon: ShoppingBag,
                        color: 'text-blue-600',
                        bg: 'bg-blue-100'
                    },
                    {
                        label: 'Total Orders',
                        value: analyticsData?.stats.totalOrders.toString() || '0',
                        icon: ShoppingCart,
                        color: 'text-purple-600',
                        bg: 'bg-purple-100'
                    },
                    {
                        label: 'Low Stock',
                        value: analyticsData?.stats.lowStockProducts.toString() || '0',
                        icon: AlertTriangle,
                        color: 'text-red-600',
                        bg: 'bg-red-100'
                    },
                    {
                        label: 'Total Farmers',
                        value: analyticsData?.stats.totalUsers.toString() || '0',
                        icon: Users,
                        color: 'text-yellow-600',
                        bg: 'bg-yellow-100'
                    },
                ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                            <div className={`p-3 rounded-full ${stat.bg}`}>
                                <Icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                                <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Overview */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Sales Overview</h3>
                    {salesData.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={salesData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280' }} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-500">
                            No sales data available yet
                        </div>
                    )}
                </div>

                {/* Product Category Distribution */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Product Distribution</h3>
                    {categoryData.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-500">
                            No product data available yet
                        </div>
                    )}
                </div>
            </div>

            {/* Low Stock & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Low Stock Alerts */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-red-50 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-red-800 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            Low Stock Alerts
                        </h3>
                        <button
                            onClick={() => router.push('/admin/inventory')}
                            className="text-sm font-medium text-red-600 hover:text-red-800 underline"
                        >
                            View All
                        </button>
                    </div>
                    <div className="p-0">
                        {lowStockItems.length > 0 ? (
                            <table className="w-full">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Product Name</th>
                                        <th className="px-6 py-3 text-center">Current Stock</th>
                                        <th className="px-6 py-3 text-center">Threshold</th>
                                        <th className="px-6 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {lowStockItems.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                                            <td className="px-6 py-4 text-center font-bold text-red-600">{item.countInStock}</td>
                                            <td className="px-6 py-4 text-center text-gray-500">{item.minThreshold}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-bold">
                                                    {item.countInStock === 0 ? 'Out of Stock' : 'Critical'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="p-6 text-center text-gray-500">
                                All products are well stocked!
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Notifications */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Notifications</h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.slice(0, 10).map((notif) => (
                                <div
                                    key={notif.id}
                                    className={`flex items-start gap-3 p-3 rounded-lg ${notif.type === 'low_stock' ? 'bg-red-50' :
                                        notif.type === 'new_order' ? 'bg-blue-50' : 'bg-green-50'
                                        }`}
                                >
                                    <div className={`h-2 w-2 mt-2 rounded-full flex-shrink-0 ${notif.type === 'low_stock' ? 'bg-red-500' :
                                        notif.type === 'new_order' ? 'bg-blue-500' : 'bg-green-500'
                                        }`}></div>
                                    <div>
                                        <p className="text-sm text-gray-800">{notif.message}</p>
                                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="h-2 w-2 mt-2 rounded-full bg-gray-400 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm text-gray-600">No recent notifications</p>
                                    <p className="text-xs text-gray-500 mt-1">All systems normal</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
