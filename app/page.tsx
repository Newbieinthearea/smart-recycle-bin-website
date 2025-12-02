'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// Import the type
import { TelegramUser } from './components/TelegramLogin';

export default function Dashboard() {
  const router = useRouter();
  
  // FIX: Tell useState it holds a TelegramUser or null
  const [user, setUser] = useState<TelegramUser | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    
    if (!session) {
      router.push('/login');
    } else {
      // We need this update to happen after mount, so we suppress the warning
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setUser(JSON.parse(session) as TelegramUser);
    }
    // We only want this to run ONCE when the page loads, so we use []
  }, []);

  // If user is null, show loading
  if (!user) return <div className="p-10">Checking access...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold text-green-700">Recycle Leaderboard</h1>
            <p className="text-gray-600">Welcome, {user.first_name}!</p>
          </div>
          <button 
            onClick={() => { localStorage.removeItem('user_session'); router.push('/login'); }}
            className="text-sm text-red-500 hover:underline"
          >
            Logout
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
            <h2 className="text-gray-400 text-sm uppercase tracking-wide">Your Contribution</h2>
            <p className="text-4xl font-bold text-gray-800 mt-2">0 <span className="text-lg text-gray-400 font-normal">Cans</span></p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
                <h3 className="font-semibold text-gray-700">Top Recyclers</h3>
            </div>
            <div className="p-8 text-center text-gray-400 italic">
                Leaderboard data loading...
            </div>
        </div>

      </div>
    </div>
  );
}