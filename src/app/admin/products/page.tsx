'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2, Edit, Minus } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    countInStock: number;
}

export default function AdminProductsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/login/seller');
            return;
        }

        fetchProducts();
    }, [user, router]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/products');
            const data = await res.json();
            setProducts(data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const updateStock = async (id: string, currentStock: number, change: number) => {
        const newStock = currentStock + change;
        if (newStock < 0) return;

        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user?.token}`,
                },
                body: JSON.stringify({ countInStock: newStock }),
            });

            if (res.ok) {
                setProducts(products.map(p => p._id === id ? { ...p, countInStock: newStock } : p));
            } else {
                alert('Failed to update stock');
            }
        } catch (err) {
            console.error(err);
            alert('Error updating stock');
        }
    };

    const deleteHandler = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                    method: 'DELETE',
                    headers: {
                        Authorization: `Bearer ${user?.token}`,
                    },
                });

                if (res.ok) {
                    fetchProducts();
                } else {
                    alert('Failed to delete product');
                }
            } catch (err) {
                console.error(err);
                alert('Error deleting product');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Products</h1>
                <Link
                    href="/admin/products/add"
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Create Product
                </Link>
            </div>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product._id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateStock(product._id, product.countInStock, -1)}
                                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                                            disabled={product.countInStock <= 0}
                                        >
                                            <Minus className="h-3 w-3" />
                                        </button>
                                        <span className="w-8 text-center">{product.countInStock}</span>
                                        <button
                                            onClick={() => updateStock(product._id, product.countInStock, 1)}
                                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                        >
                                            <Plus className="h-3 w-3" />
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => deleteHandler(product._id)}
                                        className="text-red-600 hover:text-red-900 ml-4"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
