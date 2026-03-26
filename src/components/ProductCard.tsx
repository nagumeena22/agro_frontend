'use client';

import Link from 'next/link';
import { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
    product: Product;
}

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Star } from 'lucide-react';
export default function ProductCard({ product }: ProductCardProps) {
    const { addToCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const { t } = useLanguage();

    const handleAddToCart = () => {
        if (!user) {
            alert('Please login to add items to cart');
            router.push('/login/buyer');
            return;
        }
        addToCart(product, 1);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100">
            <Link href={`/product/${product._id}`} className="block h-48 bg-gray-200 relative">
                <img
                    src={product.image || 'https://placehold.co/600x400?text=No+Image'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded text-xs font-bold text-gray-700 uppercase tracking-wide">
                    {product.category}
                </div>
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                    <Link href={`/product/${product._id}`}>
                        <h3 className="text-lg font-bold text-gray-800 hover:text-green-700 transition-colors line-clamp-1" title={product.name}>{product.name}</h3>
                    </Link>
                    <span className="flex items-center text-yellow-500 text-sm font-bold">
                        ★ {product.rating} <span className="text-gray-400 font-normal ml-1">({product.numReviews})</span>
                    </span>
                </div>
                <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow" title={product.description}>
                    {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xl font-bold text-green-700">₹{product.price.toFixed(2)}</span>
                    <Link
                        href={`/product/${product._id}`}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm font-bold"
                    >
                        {t('btn_buy_now')}
                    </Link>
                </div>
            </div>
        </div>
    );
}
