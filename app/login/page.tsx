'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// Make sure this path points to where you saved File 1
import TelegramLogin, { TelegramUser } from '../components/TelegramLogin'; 

export default function LoginPage() {
  const router = useRouter();

  // ✅ CORRECT: No '@' symbol
  const BOT_USERNAME = 'thungthungbot'; 

  useEffect(() => {
    // Redirect if already logged in
    const existingSession = localStorage.getItem('user_session');
    if (existingSession) {
      router.push('/');
    }
  }, [router]);

  const handleAuth = (user: TelegramUser) => {
    console.log("Authorized:", user);
    // Save the user data to browser storage
    localStorage.setItem('user_session', JSON.stringify(user));
    // Redirect to the dashboard
    router.push('/');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800">Smart Recycle Bin</h1>
        <p className="text-gray-500 mt-2">Login to track your recycling score</p>
        
        <TelegramLogin 
          botName={BOT_USERNAME}
          onAuth={handleAuth}
          buttonSize="large"
          cornerRadius={10}
          requestAccess="write"
        />
      </div>
    </div>
  );
}