'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    AreaChart,
    Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface MonthlySale {
    name: string;
    revenue: number;
    orders: number;
}

interface OrderStatus {
    name: string;
    value: number;
}

interface UserGrowth {
    name: string;
    users: number;
}

interface AnalyticsData {
    monthlySales: MonthlySale[];
    orderStatusData: OrderStatus[];
    userGrowth: UserGrowth[];
    stats: {
        totalRevenue: number;
        totalProducts: number;
        totalOrders: number;
        totalUsers: number;
        lowStockProducts: number;
    };
}

export default function AnalyticsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
        monthlySales: [],
        orderStatusData: [],
        userGrowth: [],
        stats: {
            totalRevenue: 0,
            totalProducts: 0,
            totalOrders: 0,
            totalUsers: 0,
            lowStockProducts: 0
        }
    });

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/login/seller');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/analytics', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch analytics');

                const data = await res.json();
                setAnalyticsData(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user, router]);

    if (loading) return <div className="p-6">Loading analytics...</div>;

    return (
        <div className="p-6 space-y-8">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Revenue & Orders Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-6">Revenue & Orders (Monthly)</h3>
                {analyticsData.monthlySales.length > 0 ? (
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.monthlySales}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="revenue" fill="#10B981" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                                <Bar yAxisId="right" dataKey="orders" fill="#3B82F6" name="Orders" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-80 flex items-center justify-center text-gray-500">
                        No sales data available yet
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Growth Area Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">User Growth</h3>
                    {analyticsData.userGrowth.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData.userGrowth}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                                    <YAxis axisLine={false} tickLine={false} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="users" stroke="#8884d8" fillOpacity={1} fill="url(#colorUsers)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-500">
                            No user growth data available yet
                        </div>
                    )}
                </div>

                {/* Order Status Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Order Status Distribution</h3>
                    {analyticsData.orderStatusData.length > 0 && analyticsData.orderStatusData.some(item => item.value > 0) ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={analyticsData.orderStatusData.filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {analyticsData.orderStatusData.filter(item => item.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-72 flex items-center justify-center text-gray-500">
                            No order data available yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
