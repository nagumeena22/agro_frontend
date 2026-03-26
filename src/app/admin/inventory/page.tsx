'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    category: string;
    countInStock: number;
    minThreshold: number;
}

export default function InventoryPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'low'>('all');

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/login/seller');
            return;
        }

        fetchProducts();
    }, [user, router]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('https://agro-backend-dirj.onrender.com/api/products');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const lowStockProducts = products.filter(p => p.countInStock <= (p.minThreshold || 5));
    const displayedProducts = filter === 'low' ? lowStockProducts : products;

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Package className="h-6 w-6" /> Inventory Management
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-md ${filter === 'all' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        All Items
                    </button>
                    <button
                        onClick={() => setFilter('low')}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 ${filter === 'low' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        <AlertTriangle className="h-4 w-4" />
                        Low Stock ({lowStockProducts.length})
                    </button>
                </div>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {displayedProducts.map((product) => {
                            const isLowStock = product.countInStock <= (product.minThreshold || 5);
                            return (
                                <tr key={product._id} className={isLowStock ? 'bg-red-50' : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-center font-bold ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                                        {product.countInStock}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                                        {product.minThreshold || 5}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        {isLowStock ? (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                Low Stock
                                            </span>
                                        ) : (
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                In Stock
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {displayedProducts.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        No products found.
                    </div>
                )}
            </div>
        </div>
    );
}
