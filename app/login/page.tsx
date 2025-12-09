'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ComponentType } from 'react';
import TelegramLogin, { TelegramUser } from '../components/TelegramLogin';

export default function LoginPage() {
  const router = useRouter();
  
  // Use your bot username WITH @ symbol
  const BOT_USERNAME = 'thungthung_bot'; // Replace with your actual bot username

  // Check if user is already logged in
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const existingSession = localStorage.getItem('user_session');
      if (existingSession) {
        router.push('/');
      }
    }
  }, [router]);

  const handleAuth = (user: TelegramUser) => {
    console.log("Authorized:", user);
    localStorage.setItem('user_session', JSON.stringify(user));
    router.push('/');
  };

  const TelegramLoginAny = TelegramLogin as unknown as ComponentType<{
    botName: string;
    onAuth: (user: TelegramUser) => void;
    buttonSize?: 'large' | 'medium' | 'small';
    cornerRadius?: number;
    requestAccess?: 'write' | 'read';
  }>;

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800">Smart Recycle Bin</h1>
        <p className="text-gray-500 mt-2">Login to track your recycling score</p>
        
        <TelegramLoginAny 
          botName={BOT_USERNAME}
          onAuth={handleAuth}
          buttonSize="large"
          cornerRadius={10}
          requestAccess="write"
        />
        
        <p className="text-xs text-gray-400 mt-4">

        </p>
      </div>
    </div>
  );
}