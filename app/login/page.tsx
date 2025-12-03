'use client';

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TelegramLogin, { TelegramUser } from '../components/TelegramLogin';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Replace with your actual bot username (without @)
  const BOT_USERNAME = 'thungthungbot';
  
  const handleTelegramAuth = async (user: TelegramUser) => {
    setIsLoading(true);
    console.log('Telegram user authenticated:', user);
    
    try {
      // Store user data (you might want to send this to your backend)
      localStorage.setItem('telegramUser', JSON.stringify(user));
      
      // You can also send user data to your backend API here
      // const response = await fetch('/api/auth/telegram', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(user)
      // });
      
      // Redirect to main page or dashboard
      router.push('/');
    } catch (error) {
      console.error('Authentication error:', error);
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Join Smart Recycle</h1>
        <p className="text-gray-500 mb-8">Sign up or log in to track your recycling impact.</p>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-gray-600">Authenticating...</span>
          </div>
        ) : (
          /* Telegram Login Widget */
          <TelegramLogin 
            botName={BOT_USERNAME}
            onAuth={handleTelegramAuth}
          />
        )}
        
        <p className="text-xs text-gray-400 mt-4">
          No password required. Secure signup/login via Telegram.
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