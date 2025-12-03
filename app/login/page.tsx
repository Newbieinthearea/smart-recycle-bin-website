'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function LoginContent() {
  const searchParams = useSearchParams();
  
  // 1. SETUP: Put your REAL bot username here (No @ symbol)
  const BOT_ID = '8299146600:AAGMVHCgwBN4l2ZFQ4cg_BgXnDSMQUZEU7I'; 
  
  // 2. LOGIC: The "Redirect" URL
  // This tells Telegram: "Ask the user for permission, then send them back to my site"
  // Note: We use the 'domain' parameter implicitly by using the widget link format
  const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${BOT_ID}&origin=https://thungthung.vercel.app&embed=0&request_access=write`;
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h1>
        <p className="text-gray-500 mb-8">Sign in to track your recycling impact.</p>
        
        {/* The Button */}
        <a
          href={telegramAuthUrl}
          className="block w-full bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2"
        >
          {/* Telegram Plane Icon */}
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.694 0M10.154 15.652L9.62 21.056c.386 0 .558-.17.755-.372l1.812-1.783 3.754 2.82c.69.39 1.176.19 1.346-.64l2.435-11.66c.25-1.127-.417-1.574-1.15-1.28L3.13 13.918c-1.11.453-1.103 1.08-.202 1.36l4.28 1.36 9.924-6.39c.47-.318.9.145.545.47l-8.523 7.924"/>
          </svg>
          Log in with Telegram
        </a>
        
        <p className="text-xs text-gray-400 mt-4">
          No password required. Secure login via Telegram.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}