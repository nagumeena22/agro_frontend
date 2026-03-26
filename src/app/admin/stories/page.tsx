'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Check, Trash2, User, Calendar, ExternalLink, AlertCircle } from 'lucide-react';

interface Story {
    _id: string;
    user: {
        name: string;
    };
    title: string;
    content: string;
    image: string;
    isApproved: boolean;
    createdAt: string;
}

export default function AdminStories() {
    const { user } = useAuth();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    const fetchStories = async () => {
        try {
            const res = await fetch('https://agro-backend-dirj.onrender.com/api/stories/admin', {
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            const data = await res.json();
            setStories(data);
        } catch (error) {
            console.error('Error fetching admin stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id: string) => {
        try {
            const res = await fetch(`https://agro-backend-dirj.onrender.com/api/stories/${id}/approve`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (res.ok) {
                setStories(stories.map(s => s._id === id ? { ...s, isApproved: true } : s));
            }
        } catch (error) {
            console.error('Error approving story:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this story?')) return;
        try {
            const res = await fetch(`https://agro-backend-dirj.onrender.com/api/stories/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${user?.token}`,
                },
            });
            if (res.ok) {
                setStories(stories.filter(s => s._id !== id));
            }
        } catch (error) {
            console.error('Error deleting story:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Farmer Story Moderation</h1>

            {stories.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
                    <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">No stories submitted yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {stories.map((story) => (
                        <div key={story._id} className={`bg-white rounded-2xl shadow-sm border p-6 flex flex-col md:flex-row gap-6 transition-all ${story.isApproved ? 'border-gray-100 opacity-75' : 'border-yellow-200 bg-yellow-50/30'}`}>
                            {/* Image Preview */}
                            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden shadow-inner flex-shrink-0 bg-gray-100">
                                <img src={story.image || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800'} alt={story.title} className="w-full h-full object-cover" />
                            </div>

                            {/* Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-xl font-bold text-gray-900">{story.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${story.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {story.isApproved ? 'Approved' : 'Pending Approval'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                    <span className="flex items-center gap-1 font-medium text-gray-700">
                                        <User className="h-4 w-4" /> {story.user.name}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" /> {new Date(story.createdAt).toLocaleDateString()}
                                    </span>
                                </div>

                                <p className="text-gray-700 line-clamp-2 italic mb-4">"{story.content}"</p>

                                <div className="flex gap-3">
                                    {!story.isApproved && (
                                        <button
                                            onClick={() => handleApprove(story._id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                                        >
                                            <Check className="h-4 w-4" /> Approve Story
                                        </button>
                                    )}
                                    <button
                                        onClick={() => handleDelete(story._id)}
                                        className="bg-white hover:bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                                    >
                                        <Trash2 className="h-4 w-4" /> Delete
                                    </button>
                                    <a
                                        href={story.image}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                                    >
                                        <ExternalLink className="h-4 w-4" /> View Image
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
