'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Mail, Shield, ShieldCheck } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

export default function CustomersPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.isAdmin) {
            router.push('/login/seller');
            return;
        }

        const fetchUsers = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/users', {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                });

                if (!res.ok) throw new Error('Failed to fetch users');

                const data = await res.json();
                if (Array.isArray(data)) {
                    setUsers(data);
                } else {
                    console.error('API did not return an array:', data);
                    setUsers([]);
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setUsers([]);
                setLoading(false);
            }
        };

        fetchUsers();
    }, [user, router]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="h-6 w-6" /> User Management
            </h1>

            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">{u._id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                    {u.email}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    {u.isAdmin ? (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 gap-1 items-center">
                                            <ShieldCheck className="h-3 w-3" /> Admin
                                        </span>
                                    ) : (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 gap-1 items-center">
                                            <Shield className="h-3 w-3" /> User
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {users.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    );
}
