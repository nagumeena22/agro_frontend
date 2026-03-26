'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    ClipboardList,
    BarChart2,
    Users,
    Quote,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Products', icon: ShoppingBag, href: '/admin/products' },
    { name: 'Inventory', icon: Package, href: '/admin/inventory' },
    { name: 'Orders', icon: ClipboardList, href: '/admin/orders' },
    { name: 'Analytics', icon: BarChart2, href: '/admin/analytics' },
    { name: 'Customers', icon: Users, href: '/admin/customers' },
    { name: 'Stories', icon: Quote, href: '/admin/stories' },
];

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    return (
        <div className="w-64 bg-green-900 text-white min-h-screen flex flex-col">
            <div className="p-6 border-b border-green-800">
                <h1 className="text-2xl font-bold tracking-wider">AgroAdmin</h1>
            </div>

            <nav className="flex-grow p-4 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-green-700 text-white shadow-md'
                                    : 'text-green-100 hover:bg-green-800 hover:text-white'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-green-800">
                <Link href="/admin/settings" className="flex items-center gap-3 px-4 py-3 text-green-100 hover:bg-green-800 rounded-lg transition-colors mb-2">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                </Link>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                </button>
            </div>
        </div>
    );
}
