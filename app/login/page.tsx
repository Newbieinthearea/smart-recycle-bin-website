'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TelegramLogin, { TelegramUser } from '../components/TelegramLogin';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Replace with your actual bot username (without @)
  const BOT_USERNAME = 'thungthungbot';
  
  // Check if user is already logged in
  useEffect(() => {
    const existingSession = localStorage.getItem('user_session');
    if (existingSession) {
      console.log('👤 User already logged in, redirecting...');
      router.push('/');
    }
  }, [router]);
  
  const handleTelegramAuth = async (user: TelegramUser) => {
    console.log('🔥 Telegram auth callback triggered!', user);
    setIsLoading(true);
    
    try {
      // Validate user data
      if (!user || !user.id) {
        throw new Error('Invalid user data received from Telegram');
      }
      
      console.log('✅ Storing user session...');
      // Store user data (you might want to send this to your backend)
      localStorage.setItem('user_session', JSON.stringify(user));
      
      // You can also send user data to your backend API here
      // const response = await fetch('/api/auth/telegram', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(user)
      // });
      
      console.log('🚀 Redirecting to dashboard...');
      // Small delay to ensure localStorage is written
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error) {
      console.error('❌ Authentication error:', error);
      alert('Authentication failed. Please try again.');
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
          <div className="space-y-4">
            {/* Telegram Login Widget */}
            <TelegramLogin 
              botName={BOT_USERNAME}
              onAuth={handleTelegramAuth}
            />
            
            {/* Alternative: Direct Telegram Auth Link */}
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-2">Having issues? Try direct login:</p>
              <a 
                href={`https://oauth.telegram.org/auth?bot_id=${BOT_USERNAME}&origin=${typeof window !== 'undefined' ? window.location.origin : ''}&return_to=${typeof window !== 'undefined' ? window.location.origin : ''}/login`}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Login with Telegram (Direct)
              </a>
            </div>
          </div>
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