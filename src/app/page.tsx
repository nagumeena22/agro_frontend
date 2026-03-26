'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/types';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('https://agro-backend-dirj.onrender.com/api/products');
        const data = await res.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const fertilizers = products.filter(p => p.category === 'Fertilizer').slice(0, 3);
  const pesticides = products.filter(p => p.category === 'Pesticide').slice(0, 3);
  const seeds = products.filter(p => p.category === 'Seeds').slice(0, 3);
  const newProducts = [...products].reverse().slice(0, 3);

  const renderSection = (title: string, items: Product[], link: string) => (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
        <Link href={link} className="text-green-600 hover:text-green-700 font-semibold mb-1">
          {t('view_all')} &rarr;
        </Link>
      </div>
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {items.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-green-50">
      {/* Hero Section */}
      <section className="relative bg-green-700 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {t('hero_title')}
          </h1>
          <p className="text-xl md:text-2xl mb-8">
            {t('hero_subtitle')}
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/shop"
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-full transition duration-300"
            >
              {t('btn_shop_now')}
            </Link>
            <Link
              href="/disease-prediction"
              className="bg-transparent border-2 border-white hover:bg-white hover:text-green-700 font-bold py-3 px-8 rounded-full transition duration-300"
            >
              {t('btn_detect_disease')}
            </Link>
          </div>
        </div>
      </section>

      {/* Product Categories */}
      {renderSection(t('section_fertilizers'), fertilizers, '/shop')}
      {renderSection(t('section_pesticides'), pesticides, '/shop')}
      {renderSection('High-Yield Seeds', seeds, '/shop')}
      {renderSection('New Arrivals', newProducts, '/shop')}

    </div>
  );
}
