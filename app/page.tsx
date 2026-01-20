import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { authOptions } from "./api/auth/[...nextauth]/route"; 
import { Leaf, Recycle, Trophy } from "lucide-react";
import UserMenu from "./components/UserMenu";
import RewardSystem from "./components/RewardSystem";
import Leaderboard from "./components/Leaderboard"; 

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 1. Fetch Current User
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
        redemptions: {
            include: { reward: true },
            orderBy: { createdAt: 'desc' }
        }
    }
  });

  if (!user) return <div>User not found</div>;

  // 2. Fetch Rewards
  const rewards = await prisma.reward.findMany({
      where: { stock: { gt: 0 } }, 
      orderBy: { cost: 'asc' }
  });

  // 3. Fetch Leaderboard (By Points)
  const usersByPoints = await prisma.user.findMany({
    take: 10,
    orderBy: { points: 'desc' },
    select: { id: true, name: true, points: true, recycledCount: true, image: true }
  });

  // 4. Fetch Leaderboard (By Recycled Count)
  const usersByRecycled = await prisma.user.findMany({
    take: 10,
    orderBy: { recycledCount: 'desc' },
    select: { id: true, name: true, points: true, recycledCount: true, image: true }
  });

  const stats = {
    points: user.points ?? 0,
    recycled: user.recycledCount ?? 0,
  };

  return (
    <main className="min-h-screen pb-20 transition-colors bg-green-50 dark:bg-slate-900">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-green-100 dark:bg-slate-800 dark:border-slate-700">
        <div className="flex items-center justify-between h-16 px-4 mx-auto max-w-7xl">
          <div className="flex items-center gap-2 text-xl font-bold text-green-700 dark:text-green-400">
            <Leaf className="fill-green-600 dark:fill-green-500" />
            <span>ThungThung</span>
          </div>
          <UserMenu user={session.user} />
        </div>
      </header>

      <div className="px-4 py-8 mx-auto max-w-7xl">
        
        {/* WELCOME */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome back, <span className="text-green-600 dark:text-green-400">{user.name?.split(" ")[0]}!</span>
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">Ready to make a difference today?</p>
        </div>

        {/* STATS GRID (Uses gap-4) */}
        <div className="grid grid-cols-1 gap-4 mb-8 md:grid-cols-3">
          <div className="flex items-center gap-4 p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-green-100 dark:border-slate-700">
            <div className="p-3 bg-green-100 rounded-xl dark:bg-green-900/30">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Points</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.points}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-green-100 dark:border-slate-700">
            <div className="p-3 bg-blue-100 rounded-xl dark:bg-blue-900/30">
              <Recycle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Items Recycled</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.recycled}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-green-100 dark:border-slate-700">
            <div className="p-3 bg-orange-100 rounded-xl dark:bg-orange-900/30">
              <Leaf className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">CO₂ Saved</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{(stats.recycled * 0.15).toFixed(1)}kg</p>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        {/* 👇 FIXED: Changed 'gap-8' to 'gap-4' to align perfectly with Stats Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            
            {/* Left Side: Reward System */}
            <div className="lg:col-span-2 h-150">
                <RewardSystem
                    userPoints={stats.points}
                    rewards={rewards}
                    redemptions={user.redemptions}
                />
            </div>

            {/* Right Side: Leaderboard */}
            <div className="lg:col-span-1 h-150">
                 <Leaderboard 
                    usersByPoints={usersByPoints} 
                    usersByRecycled={usersByRecycled} 
                 />
            </div>
        </div>

      </div>
    </main>
  );
}