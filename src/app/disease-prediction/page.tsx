'use client';

import { useState } from 'react';
import { Upload, AlertCircle, ShoppingCart } from 'lucide-react';
import Link from 'next/link';

import { useLanguage } from '@/context/LanguageContext';

export default function DiseasePrediction() {
    const [image, setImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const { t } = useLanguage();

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!image) return;

        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', image);

        try {
            const res = await fetch('http://127.0.0.1:8000/predict', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Prediction failed');

            const data = await res.json();

            // Fetch real products for recommendations
            if (data.recommendation_keywords && data.recommendation_keywords.length > 0) {
                const recommendedProducts: any[] = [];
                for (const keyword of data.recommendation_keywords) {
                    try {
                        const productRes = await fetch(`https://agro-backend-dirj.onrender.com/api/products?keyword=${keyword}`);
                        if (productRes.ok) {
                            const products = await productRes.json();
                            if (products.length > 0) {
                                // Add first matching product if it's not already in recommendations
                                if (!recommendedProducts.find(p => p._id === products[0]._id)) {
                                    recommendedProducts.push(products[0]);
                                }
                            }
                        }
                    } catch (err) {
                        console.error(`Error fetching product for keyword ${keyword}:`, err);
                    }
                }
                data.recommendations = recommendedProducts;
            }

            setResult(data);

        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-center text-green-800 mb-8">{t('predict_title')}</h1>

            <div className="bg-white p-8 rounded-lg shadow-lg">
                <form onSubmit={handleSubmit} className="mb-8">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:bg-gray-50 transition">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            id="image-upload"
                        />
                        <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                            {preview ? (
                                <img src={preview} alt="Preview" className="max-h-64 object-contain mb-4" />
                            ) : (
                                <Upload className="h-16 w-16 text-gray-400 mb-4" />
                            )}
                            <span className="text-gray-500 font-medium">{t('predict_upload_label')}</span>
                        </label>
                    </div>

                    <button
                        type="submit"
                        disabled={!image || loading}
                        className={`w-full mt-6 bg-green-600 text-white font-bold py-3 px-4 rounded transition ${loading || !image ? 'opacity-50 cursor-not-allowed' : 'hover:bg-green-700'}`}
                    >
                        {loading ? t('predict_analyzing') : t('predict_btn_detect')}
                    </button>
                </form>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center gap-2 mb-6">
                        <AlertCircle className="h-5 w-5" />
                        <span>{error}</span>
                    </div>
                )}

                {result && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-green-900 mb-4">{t('predict_result_title')}</h2>
                        <div className="mb-6">
                            <p className="text-lg"><strong>{t('predict_disease_detected')}:</strong> <span className="text-red-600 font-bold">{result.disease}</span></p>
                            <p className="text-sm text-gray-600">{t('predict_confidence')}: {result.confidence}%</p>
                        </div>

                        <div className="mb-6">
                            <h3 className="font-bold text-lg mb-2">{t('predict_treatment')}:</h3>
                            <p className="text-gray-700">{result.treatment || result.prevention || 'Consult agricultural expert for treatment.'}</p>
                        </div>

                        <div>
                            <h3 className="font-bold text-lg mb-4">{t('predict_recommended')}:</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.recommendations && result.recommendations.length > 0 ? (
                                    result.recommendations.map((rec: any) => (
                                        <div key={rec._id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                                            <div>
                                                <p className="font-bold">{rec.name}</p>
                                                <p className="text-green-600">₹{rec.price?.toFixed(2)}</p>
                                            </div>
                                            <Link href={`/product/${rec._id}`} className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-1 rounded text-sm font-bold flex items-center gap-1">
                                                <ShoppingCart className="h-3 w-3" /> {t('btn_buy_now')}
                                            </Link>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic col-span-2">{t('predict_no_rec')}</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
