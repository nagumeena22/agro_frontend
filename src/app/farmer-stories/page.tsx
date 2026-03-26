'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Quote, Plus, Image as ImageIcon, Send, Star, User, Calendar } from 'lucide-react';
import Link from 'next/link';

interface Story {
    _id: string;
    user: {
        name: string;
    };
    title: string;
    content: string;
    image: string;
    createdAt: string;
    product?: {
        name: string;
        image: string;
    };
}

export default function FarmerStories() {
    const { user } = useAuth();
    const { t } = useLanguage();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchStories = async () => {
            try {
                const res = await fetch('https://agro-backend-dirj.onrender.com/api/stories');
                const data = await res.json();
                setStories(data);
            } catch (error) {
                console.error('Error fetching stories:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStories();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSubmitting(true);
        try {
            const res = await fetch('https://agro-backend-dirj.onrender.com/api/stories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ title, content, image }),
            });

            if (res.ok) {
                alert('Your story has been submitted for approval!');
                setShowForm(false);
                setTitle('');
                setContent('');
                setImage('');
            } else {
                alert('Failed to submit story');
            }
        } catch (error) {
            console.error('Submit error:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-green-900 mb-4 animate-fade-in">
                        Farmer Success Stories
                    </h1>
                    <p className="text-xl text-green-700 max-w-2xl mx-auto italic">
                        "Real stories from real farmers. Witness the growth of our community through the power of LakshmiAgro."
                    </p>
                    {user && (
                        <button
                            onClick={() => setShowForm(!showForm)}
                            className="mt-8 bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 mx-auto transition-all transform hover:scale-105"
                        >
                            {showForm ? 'Cancel' : <><Plus className="h-5 w-5" /> Share Your Story</>}
                        </button>
                    )}
                </div>

                {/* Submission Form */}
                {showForm && (
                    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl p-8 mb-16 border border-green-200 animate-slide-up">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Send className="h-6 w-6 text-green-600" />
                            Write Your Success Story
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                    placeholder="e.g., Higher yield in my tomato crop"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Story Content</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    required
                                    rows={6}
                                    placeholder="Share your experience using LakshmiAgro products..."
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <ImageIcon className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            value={image}
                                            onChange={(e) => setImage(e.target.value)}
                                            placeholder="Paste a photo link of your harvest (optional)"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-green-700 hover:bg-green-800 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-green-100 transition-all disabled:bg-gray-400"
                            >
                                {submitting ? 'Submitting...' : 'Submit Story for Approval'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Stories Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
                    </div>
                ) : stories.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-inner border border-green-100">
                        <Quote className="h-16 w-16 text-green-200 mx-auto mb-4" />
                        <p className="text-gray-500 text-xl italic">No success stories shared yet. Be the first!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {stories.map((story) => (
                            <div key={story._id} className="group bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-green-50 flex flex-col transform hover:-translate-y-2">
                                <div className="h-64 relative overflow-hidden bg-green-100">
                                    <img
                                        src={story.image || 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&q=80&w=800'}
                                        alt={story.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                                        <h3 className="text-xl font-bold text-white leading-tight">{story.title}</h3>
                                    </div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-green-100 p-2 rounded-full">
                                            <User className="h-4 w-4 text-green-700" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{story.user.name}</p>
                                            <p className="text-[10px] text-gray-500 flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(story.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="relative flex-1">
                                        <Quote className="absolute -left-2 -top-2 h-8 w-8 text-green-100 -z-0" />
                                        <p className="text-gray-700 leading-relaxed italic relative z-10 line-clamp-4 mb-6">
                                            "{story.content}"
                                        </p>
                                    </div>
                                    {story.product && (
                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center gap-3">
                                            <img src={story.product.image} className="w-10 h-10 rounded-lg object-cover" />
                                            <div>
                                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Used Product</p>
                                                <p className="text-xs font-bold text-green-700">{story.product.name}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 1s ease-out; }
                .animate-slide-up { animation: slide-up 0.8s ease-out; }
            `}</style>
        </div>
    );
}
