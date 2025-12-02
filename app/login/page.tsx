'use client';

import { useRouter } from 'next/navigation';
import TelegramLogin, { TelegramUser } from '../components/TelegramLogin';
import { Leaf, Recycle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  
  // REPLACE with your actual bot username
  const BOT_USERNAME = 'thungthungbot'; 

  const handleAuth = (user: TelegramUser) => {
    localStorage.setItem('user_session', JSON.stringify(user));
    router.push('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      
      {/* Decorative Background Circles */}
      <div className="absolute top-10 left-10 w-32 h-32 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-10 right-10 w-32 h-32 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-white/20 text-center relative z-10">
        
        {/* Logo Section */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full shadow-inner">
            <Recycle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Smart <span className="text-green-600">Recycle</span>
        </h1>
        <p className="text-gray-500 mt-3 mb-8">
          Join the green revolution. Track your impact and climb the leaderboard.
        </p>
        
        {/* The Telegram Button */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Get Started</p>
          <TelegramLogin botName={BOT_USERNAME} onAuth={handleAuth} />
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-green-700/60 font-medium">
          <Leaf className="w-4 h-4" />
          <span>Saving the planet, one can at a time</span>
        </div>
      </div>
    </div>
  );
}