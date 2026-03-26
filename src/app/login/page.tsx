'use client';

import Link from 'next/link';

export default function LoginSelection() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white bg-gradient-to-b from-pink-50 to-white">
            <h1 className="text-4xl font-bold text-gray-800 mb-12 tracking-wide text-center">LOGIN AS</h1>

            <div className="flex flex-col md:flex-row gap-8">
                <Link
                    href="/login/seller"
                    className="w-64 h-32 flex items-center justify-center bg-pink-200 hover:bg-pink-300 text-gray-800 text-xl font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Seller Login
                </Link>

                <Link
                    href="/login/buyer"
                    className="w-64 h-32 flex items-center justify-center bg-pink-200 hover:bg-pink-300 text-gray-800 text-xl font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
                >
                    Buyer Login
                </Link>
            </div>
        </div>
    );
}
