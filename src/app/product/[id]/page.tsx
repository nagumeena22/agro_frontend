'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft, Star, ShieldCheck, Truck, Package } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export default function ProductDetails() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { t } = useLanguage();

    const [product, setProduct] = useState<Product | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`https://agro-backend-dirj.onrender.com/api/products/${id}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                setProduct(data);

                // Fetch related products
                const relatedRes = await fetch(`https://agro-backend-dirj.onrender.com/api/products?category=${data.category}`);
                if (relatedRes.ok) {
                    const relatedData = await relatedRes.json();
                    // Filter out current product and limit to 4
                    setRelatedProducts(relatedData.filter((p: Product) => p._id !== id).slice(0, 4));
                }

                setLoading(false);
            } catch (error) {
                console.error('Error fetching product:', error);
                setLoading(false);
            }
        };

        if (id) fetchProduct();
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            alert('Please login to add items to cart');
            router.push('/login/buyer');
            return;
        }
        if (product) {
            addToCart(product, qty);
            alert(`${product.name} added to cart!`);
        }
    };

    const submitHandler = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            alert('Please login to write a review');
            router.push('/login/buyer');
            return;
        }
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch(`https://agro-backend-dirj.onrender.com/api/products/${id}/reviews`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
                body: JSON.stringify({ rating, comment }),
            });

            if (res.ok) {
                alert('Review Submitted!');
                setRating(0);
                setComment('');
                // Refresh product data
                const updatedRes = await fetch(`https://agro-backend-dirj.onrender.com/api/products/${id}`);
                const updatedData = await updatedRes.json();
                setProduct(updatedData);
            } else {
                const data = await res.json();
                alert(data.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Review error:', error);
            alert('Error submitting review');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-green-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-green-50 py-12 px-4 shadow-sm">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
                    <Link href="/shop" className="text-green-600 hover:underline">
                        Return to Shop
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-green-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Navigation */}
                <Link href="/shop" className="inline-flex items-center text-green-700 hover:text-green-800 font-bold mb-8 transition-colors">
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    {t('pd_back_to_shop')}
                </Link>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
                        {/* Image Section */}
                        <div className="space-y-4">
                            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shadow-inner group">
                                <img
                                    src={product.image || 'https://placehold.co/800x800?text=Product+Image'}
                                    alt={product.name}
                                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </div>

                        {/* Details Section */}
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <span className="inline-block bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                                    {t(`cat_${product.category.toLowerCase()}`)}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="flex items-center text-yellow-500">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
                                        ))}
                                        <span className="ml-2 text-gray-900 font-bold">{product.rating}</span>
                                    </div>
                                    <span className="text-gray-500 border-l border-gray-300 pl-4">
                                        {product.numReviews} {t('pd_reviews')}
                                    </span>
                                </div>
                                <div className="text-3xl font-bold text-green-700 mb-6">
                                    ₹{product.price.toFixed(2)}
                                </div>
                            </div>

                            {/* Short Description */}
                            <div className="mb-8 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                                <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">{t('pd_summary')}</h3>
                                <p className="text-gray-700 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>

                            {/* Controls */}
                            <div className="mt-auto space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="flex items-center border-2 border-green-200 rounded-lg overflow-hidden bg-white">
                                        <button
                                            onClick={() => setQty(Math.max(1, qty - 1))}
                                            className="px-4 py-2 hover:bg-green-50 text-green-700 font-bold transition-colors"
                                        >
                                            -
                                        </button>
                                        <span className="px-6 py-2 font-bold text-gray-900 border-x-2 border-green-200 min-w-[3rem] text-center">
                                            {qty}
                                        </span>
                                        <button
                                            onClick={() => setQty(qty + 1)}
                                            className="px-4 py-2 hover:bg-green-50 text-green-700 font-bold transition-colors"
                                        >
                                            +
                                        </button>
                                    </div>
                                    <div className="text-sm">
                                        <span className={`font-bold ${product.countInStock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                            {product.countInStock > 0 ? t('in_stock') : t('out_of_stock')}
                                        </span>
                                        <p className="text-gray-500">{product.countInStock} {t('pd_items_available')}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    disabled={product.countInStock === 0}
                                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-extrabold text-lg flex items-center justify-center gap-3 shadow-lg shadow-green-200 transition-all duration-300 transform hover:-translate-y-1 active:scale-95 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none"
                                >
                                    <ShoppingCart className="h-6 w-6" />
                                    {t('btn_add_to_cart')}
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-100">
                                <div className="text-center">
                                    <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <ShieldCheck className="h-5 w-5 text-green-700" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase">100% Genuine</span>
                                </div>
                                <div className="text-center">
                                    <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Truck className="h-5 w-5 text-blue-700" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase">Fast Delivery</span>
                                </div>
                                <div className="text-center">
                                    <div className="bg-orange-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Package className="h-5 w-5 text-orange-700" />
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-600 uppercase">Safe Packing</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Extended Description Tabs Section */}
                    <div className="border-t border-gray-100 bg-gray-50/50 p-8">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package className="h-6 w-6 text-green-600" />
                                {t('pd_detailed_info')}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-green-800 mb-4 border-b pb-2">{t('pd_why_used')}</h3>
                                    <p className="text-gray-700 leading-relaxed italic">
                                        {t('pd_usage_desc')}
                                    </p>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-bold text-green-800 mb-4 border-b pb-2">{t('pd_items_inside')}</h3>
                                    <ul className="space-y-3">
                                        <li className="flex items-start gap-3 text-gray-700">
                                            <div className="h-5 w-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                                                <div className="h-2 w-2 rounded-full bg-white"></div>
                                            </div>
                                            <span>Main {product.name} Container ({product.category === 'Seeds' ? 'Pack' : 'Bottle/Bag'})</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-gray-700">
                                            <div className="h-5 w-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                                                <div className="h-2 w-2 rounded-full bg-white"></div>
                                            </div>
                                            <span>Detailed Usage Instruction Manual</span>
                                        </li>
                                        <li className="flex items-start gap-3 text-gray-700">
                                            <div className="h-5 w-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                                                <div className="h-2 w-2 rounded-full bg-white"></div>
                                            </div>
                                            <span>Safety & Precautionary Leaflet</span>
                                        </li>
                                        {product.category !== 'Equipment' && (
                                            <li className="flex items-start gap-3 text-gray-700">
                                                <div className="h-5 w-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center mt-0.5">
                                                    <div className="h-2 w-2 rounded-full bg-white"></div>
                                                </div>
                                                <span>Composition Certificate</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products Section */}
                {relatedProducts.length > 0 && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b-2 border-green-500 pb-2 inline-block">{t('pd_related_products')}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((rel) => (
                                <Link key={rel._id} href={`/product/${rel._id}`} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-green-50">
                                    <div className="h-40 bg-gray-50 relative overflow-hidden">
                                        <img
                                            src={rel.image}
                                            alt={rel.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-[10px] font-bold text-green-700 uppercase">
                                            {t(`cat_${rel.category.toLowerCase()}`)}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h3 className="font-bold text-gray-800 text-sm line-clamp-1 mb-1 group-hover:text-green-700 transition-colors">{rel.name}</h3>
                                        <div className="flex justify-between items-center">
                                            <span className="text-green-700 font-bold text-sm">₹{rel.price.toFixed(2)}</span>
                                            <div className="flex items-center text-yellow-500 text-[10px]">
                                                ★ {rel.rating}
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reviews Section */}
                <div className="mt-16 bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100 p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 border-b pb-4">Customer Reviews</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Reviews List */}
                        <div>
                            {product.reviews && product.reviews.length === 0 ? (
                                <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500 italic">
                                    {t('pd_no_reviews')}
                                </div>
                            ) : (
                                <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4">
                                    {product.reviews?.map((review) => (
                                        <div key={review._id} className="bg-green-50/50 p-6 rounded-xl border border-green-100">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-gray-900">{review.name}</h4>
                                                <span className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center text-yellow-500 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            <p className="text-gray-700 italic">"{review.comment}"</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Leave a Review Form */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h3>
                            {user ? (
                                <form onSubmit={submitHandler} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Rating</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    <Star className={`h-8 w-8 ${star <= rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Comment</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            rows={4}
                                            placeholder="Tell other farmers about your experience..."
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none text-gray-900"
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold shadow-lg transition-all disabled:bg-gray-400"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Post Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">You must be logged in to leave a review.</p>
                                    <Link href="/login/buyer" className="bg-green-700 text-white px-6 py-2 rounded-lg font-bold">
                                        Login Now
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
