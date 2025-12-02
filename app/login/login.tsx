'use client';

import { useRouter } from 'next/navigation';
// Import the type here
import TelegramLogin, { TelegramUser } from '../components/TelegramLogin';

export default function LoginPage() {
  const router = useRouter();
  
  // REPLACE with your actual bot username
  const BOT_USERNAME = 'Your_Bot_Username_Here'; 

  // Use TelegramUser type instead of 'any'
  const handleAuth = (user: TelegramUser) => {
    console.log("Authorized:", user);
    localStorage.setItem('user_session', JSON.stringify(user));
    router.push('/');
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800">Smart Recycle Bin</h1>
        <p className="text-gray-500 mt-2">Login to track your recycling score</p>
        
        <TelegramLogin botName={BOT_USERNAME} onAuth={handleAuth} />
      </div>
    </div>
  );
}