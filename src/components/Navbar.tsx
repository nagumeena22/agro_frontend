'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, ShoppingCart, User as UserIcon, LogOut, Leaf } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Globe } from 'lucide-react';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const { language, setLanguage, t } = useLanguage();

    return (
        <nav className="bg-green-700 text-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
                            <Leaf className="h-8 w-8 text-yellow-400" />
                            <span className="font-bold text-xl tracking-wider">LakshmiAgro</span>
                        </Link>
                    </div>
                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link href="/" className="hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition">{t('nav_home')}</Link>
                            <Link href={user ? "/shop" : "/login/buyer"} className="hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition">{t('nav_shop')}</Link>
                            <Link href="/disease-prediction" className="hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition">{t('nav_prediction')}</Link>
                            <Link href="/farmer-stories" className="hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition">{t('nav_community')}</Link>
                            <Link href="/cart" className="hover:bg-green-600 px-3 py-2 rounded-md text-sm font-medium transition flex items-center gap-1 relative">
                                <ShoppingCart className="h-4 w-4" /> {t('nav_cart')}
                                {totalItems > 0 && (
                                    <span className="absolute -top-1 -right-2 bg-yellow-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                                        {totalItems}
                                    </span>
                                )}
                            </Link>

                            {/* Language Toggle */}
                            <div className="relative group ml-4 flex items-center">
                                <button className="flex items-center gap-1 hover:text-yellow-300 transition px-3 py-2 rounded-md bg-green-800 border border-green-600">
                                    <Globe className="h-4 w-4" />
                                    <span className="uppercase font-bold text-xs">{language}</span>
                                </button>
                                <div className="absolute top-full right-0 mt-1 w-32 bg-white rounded-md shadow-xl text-gray-800 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-1 z-50">
                                    {[
                                        { code: 'en', label: 'English' },
                                        { code: 'hi', label: 'हिन्दी' },
                                        { code: 'ta', label: 'தமிழ்' },
                                        { code: 'te', label: 'తెలుగు' },
                                        { code: 'mr', label: 'मराठी' }
                                    ].map((lang) => (
                                        <button
                                            key={lang.code}
                                            onClick={() => setLanguage(lang.code as any)}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition ${language === lang.code ? 'font-bold text-green-700 bg-green-50' : ''}`}
                                        >
                                            {lang.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {user ? (
                                <div className="relative group ml-4 flex items-center gap-4">
                                    <Link href="/profile" className="font-bold text-yellow-300 hover:text-yellow-100 flex items-center gap-1">
                                        <UserIcon className="h-4 w-4" /> {user.name}
                                    </Link>
                                    <button onClick={logout} className="flex items-center gap-1 hover:text-red-300 transition">
                                        <LogOut className="h-4 w-4" /> {t('nav_logout')}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <Link href="/login" className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-md text-sm font-bold transition flex items-center gap-1">
                                        <UserIcon className="h-4 w-4" /> {t('nav_login')}
                                    </Link>
                                    <Link href="/register" className="bg-white hover:bg-gray-100 text-green-700 px-4 py-2 rounded-md text-sm font-bold transition">
                                        {t('nav_register')}
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="bg-green-800 inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-white hover:bg-green-600 focus:outline-none"
                        >
                            <span className="sr-only">Open main menu</span>
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link href="/" className="hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
                        <Link href="/shop" className="hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium">Shop</Link>
                        <Link href="/disease-prediction" className="hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium">Disease Prediction</Link>
                        <Link href="/farmer-stories" className="hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium">Farmer Stories</Link>
                        <Link href="/cart" className="hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium">Cart</Link>
                        {user ? (
                            <button onClick={logout} className="text-left w-full hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium text-red-300">
                                Logout ({user.name})
                            </button>
                        ) : (
                            <>
                                <Link href="/login" className="hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium">Login</Link>
                                <Link href="/register" className="hover:bg-green-600 block px-3 py-2 rounded-md text-base font-medium">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
