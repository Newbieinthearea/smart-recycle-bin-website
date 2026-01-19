"use client";

import { useState } from "react";
import { Trophy, Leaf, Recycle, Coins } from "lucide-react";
import Image from "next/image";

interface LeaderboardUser {
  id: string;
  name: string | null;
  points: number;
  recycledCount: number; // Needed for the filter
  image: string | null;
}

interface Props {
  usersByPoints: LeaderboardUser[];
  usersByRecycled: LeaderboardUser[];
}

export default function Leaderboard({ usersByPoints, usersByRecycled }: Props) {
  const [filter, setFilter] = useState<"points" | "recycled" | "co2">("points");

  // Determine which data to show based on filter
  const activeData = filter === "points" ? usersByPoints : usersByRecycled;

  return (
    <div className="flex flex-col h-full overflow-hidden transition-colors bg-white border border-green-100 shadow-sm dark:bg-slate-800 rounded-2xl dark:border-slate-700">
      
      {/* HEADER & TABS */}
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 text-yellow-600 bg-yellow-100 rounded-lg dark:bg-yellow-900/30">
            <Trophy className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Top Recyclers</h2>
        </div>

        {/* Filter Tabs */}
        <div className="flex p-1 mb-2 bg-gray-100 rounded-lg dark:bg-slate-700">
            <button 
                onClick={() => setFilter("points")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${filter === "points" ? "bg-white shadow text-green-700 dark:bg-slate-600 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
            >
                Points
            </button>
            <button 
                onClick={() => setFilter("recycled")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${filter === "recycled" ? "bg-white shadow text-blue-700 dark:bg-slate-600 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
            >
                Recycled
            </button>
            <button 
                onClick={() => setFilter("co2")}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition ${filter === "co2" ? "bg-white shadow text-orange-700 dark:bg-slate-600 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
            >
                CO₂ Saved
            </button>
        </div>
      </div>

      {/* SCROLLABLE LIST (Matches RewardSystem styling) */}
      <div className="flex-1 p-6 pt-0 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          {activeData.map((user, index) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 transition border rounded-xl bg-slate-50 border-slate-100 dark:bg-slate-900/50 dark:border-slate-700 hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Rank Badge */}
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm shrink-0 ${
                  index === 0 ? "bg-yellow-100 text-yellow-700" :
                  index === 1 ? "bg-gray-100 text-gray-700" :
                  index === 2 ? "bg-orange-100 text-orange-700" :
                  "bg-white text-slate-500 border border-slate-200 dark:bg-slate-800 dark:border-slate-600"
                }`}>
                  {index + 1}
                </div>

                {/* User Avatar & Name */}
                <div className="flex items-center gap-3">
                   <div className="relative w-10 h-10 overflow-hidden bg-gray-200 rounded-full shrink-0 dark:bg-slate-700">
                      {user.image ? (
                        <Image src={user.image} alt={user.name || "User"} fill className="object-cover" />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full text-xs font-bold text-gray-500">
                            {user.name?.charAt(0) || "U"}
                        </div>
                      )}
                   </div>
                   <span className="text-sm font-bold truncate text-zinc-900 dark:text-white max-w-[100px]">
                      {user.name?.split(" ")[0] || "Anonymous"}
                   </span>
                </div>
              </div>

              {/* Dynamic Score Display */}
              <div className="text-right">
                  {filter === "points" && (
                    <div className="flex items-center justify-end gap-1 font-bold text-green-600 dark:text-green-400">
                        <Coins className="w-3 h-3"/> {user.points}
                    </div>
                  )}
                  {filter === "recycled" && (
                    <div className="flex items-center justify-end gap-1 font-bold text-blue-600 dark:text-blue-400">
                        <Recycle className="w-3 h-3"/> {user.recycledCount}
                    </div>
                  )}
                  {filter === "co2" && (
                    <div className="flex items-center justify-end gap-1 font-bold text-orange-600 dark:text-orange-400">
                        <Leaf className="w-3 h-3"/> {(user.recycledCount * 0.15).toFixed(1)}kg
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    {filter === "co2" ? "Saved" : filter}
                  </p>
              </div>
            </div>
          ))}

          {activeData.length === 0 && (
            <p className="py-10 text-center text-gray-500">No data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}