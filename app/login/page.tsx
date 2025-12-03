'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import TelegramLogin, { TelegramUser } from '../components/TelegramLogin';

function LoginContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  // Replace with your actual bot ID (the numeric part before the colon)
  const BOT_ID = '8299146600';
  
  // Check if user is already logged in OR handle OAuth callback
  useEffect(() => {
    const existingSession = localStorage.getItem('user_session');
    if (existingSession) {
      console.log('👤 User already logged in, redirecting...');
      router.push('/');
      return;
    }

    // Handle OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const first_name = urlParams.get('first_name');
    const auth_date = urlParams.get('auth_date');
    const hash = urlParams.get('hash');

    if (id && first_name && auth_date && hash) {
      console.log('🔗 OAuth callback detected in URL');
      const user: TelegramUser = {
        id: parseInt(id),
        first_name: first_name,
        username: urlParams.get('username') || undefined,
        photo_url: urlParams.get('photo_url') || undefined,
        auth_date: parseInt(auth_date),
        hash: hash
      };
      
      handleTelegramAuth(user);
      
      // Clean up URL parameters
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
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
            {/* Direct Telegram Login */}
            <TelegramLogin 
              botId={BOT_ID}
              onAuth={handleTelegramAuth}
            />
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