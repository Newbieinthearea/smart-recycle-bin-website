'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TelegramUser } from './components/TelegramLogin';
import { Trophy, Leaf, LogOut, Award, TrendingUp, History } from 'lucide-react';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<TelegramUser | null>(null);

  // Mock Data for Prototype
  const myStats = {
    cans: 42,
    points: 420,
    rank: 12,
    co2Saved: 0.85 // kg
  };

  const leaderboard = [
    { rank: 1, name: "Sokha Dev", cans: 156, points: 1560, avatar: "🦁" },
    { rank: 2, name: "Visal Tech", cans: 132, points: 1320, avatar: "🐯" },
    { rank: 3, name: "Green Earth", cans: 98, points: 980, avatar: "🌍" },
    { rank: 4, name: "Dara Code", cans: 85, points: 850, avatar: "🧑‍💻" },
    { rank: 5, name: "Bopha", cans: 64, points: 640, avatar: "🌸" },
  ];

  useEffect(() => {
    const session = localStorage.getItem('user_session');
    if (!session) {
      router.push('/login');
    } else {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      setUser(JSON.parse(session) as TelegramUser);
    }
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F0FDF4] pb-20 font-sans">
      
      {/* 1. Header Section */}
      <header className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
           <div className="bg-green-100 p-2 rounded-lg">
             <Leaf className="text-green-600 w-5 h-5" />
           </div>
           <span className="font-bold text-xl text-green-900 tracking-tight">EcoBin</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">{user.first_name}</p>
            <p className="text-xs text-green-600">Rank #{myStats.rank}</p>
          </div>
          <img 
            src={user.photo_url || `https://ui-avatars.com/api/?name=${user.first_name}&background=16a34a&color=fff`} 
            alt="Profile" 
            className="w-10 h-10 rounded-full border-2 border-green-100"
          />
        </div>
      </header>

      <main className="max-w-md mx-auto pt-6 px-4">
        
        {/* 2. Welcome Card */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
          
          <p className="text-green-100 text-sm font-medium mb-1">Hello, {user.first_name} 👋</p>
          <h2 className="text-2xl font-bold mb-4">Let&apos;s save the world!</h2>
          <h2 className="text-2xl font-bold mb-4">SANNA PMO SO BAD OH MY DAY</h2>
          <div className="flex gap-4">
             <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex-1 text-center">
                <span className="block text-3xl font-bold">{myStats.cans}</span>
                <span className="text-xs text-green-100 uppercase tracking-wider">Cans</span>
             </div>
             <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl flex-1 text-center">
                <span className="block text-3xl font-bold">{myStats.points}</span>
                <span className="text-xs text-green-100 uppercase tracking-wider">Points</span>
             </div>
          </div>
        </div>

        {/* 3. My Impact (Grid) */}
        <h3 className="text-gray-800 font-bold text-lg mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" /> Your Impact
        </h3>
        <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-50 flex flex-col items-center justify-center py-6">
                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">💨</span>
                </div>
                <span className="text-xl font-bold text-gray-800">{myStats.co2Saved}kg</span>
                <span className="text-xs text-gray-400">CO2 Saved</span>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-green-50 flex flex-col items-center justify-center py-6">
                <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center mb-2">
                    <span className="text-2xl">⚡</span>
                </div>
                <span className="text-xl font-bold text-gray-800">0.2kW</span>
                <span className="text-xs text-gray-400">Energy Saved</span>
            </div>
        </div>

        {/* 4. Leaderboard */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" /> Leaderboard
                </h3>
                <button className="text-xs font-bold text-green-600 hover:underline">View All</button>
            </div>
            
            <div className="divide-y divide-gray-50">
                {leaderboard.map((player, index) => (
                    <div key={index} className={`flex items-center p-4 hover:bg-green-50/30 transition ${index < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-transparent' : ''}`}>
                        <div className="w-8 text-center font-bold text-gray-400 mr-2">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${player.rank}`}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl mr-3 shadow-sm">
                            {player.avatar}
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-sm">{player.name}</h4>
                            <p className="text-xs text-green-600 font-medium">{player.cans} cans</p>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-gray-800">{player.points}</span>
                            <span className="text-[10px] text-gray-400 uppercase">pts</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* 5. Logout Button */}
        <button 
            onClick={() => { localStorage.removeItem('user_session'); router.push('/login'); }}
            className="w-full mt-8 flex items-center justify-center gap-2 text-red-500 py-4 font-medium hover:bg-red-50 rounded-xl transition"
        >
            <LogOut className="w-4 h-4" /> Logout
        </button>

      </main>
    </div>
  );
}