import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; // 👈 FIXED: Use shared instance
import { authOptions } from "./api/auth/[...nextauth]/route"; 
import { Leaf, Recycle, Trophy, MapPin, ScanLine } from "lucide-react";
import UserMenu from "./components/UserMenu";
import RewardSystem from "./components/RewardSystem"; // 👈 Import new component
import Link from "next/link";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    redirect("/login");
  }

  // 1. Fetch User Data
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

  // 2. Fetch Available Rewards
  const rewards = await prisma.reward.findMany({
      where: { stock: { gt: 0 } }, // Only show in-stock items
      orderBy: { cost: 'asc' }
  });

  const stats = {
    points: user.points ?? 0,
    recycled: user.recycledCount ?? 0,
    level: user.level ?? 1,
  };

  return (
    <main className="min-h-screen bg-green-50 dark:bg-slate-900 transition-colors pb-20">
      
      {/* HEADER */}
      <header className="bg-white dark:bg-slate-800 border-b border-green-100 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-bold text-xl">
            <Leaf className="fill-green-600 dark:fill-green-500" />
            <span>ThungThung</span>
          </div>
          <UserMenu user={session.user} />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        
        {/* WELCOME */}
        <div className="mb-8">
          {/* 👇 FIXED: Using text-zinc-900 ensures it is nearly black in light mode */}
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">
            Welcome back, <span className="text-green-600 dark:text-green-400">{user.name?.split(" ")[0]}!</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Ready to make a difference today?</p>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-slate-700 flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
              <Trophy className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Points</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.points}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-slate-700 flex items-center gap-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
              <Recycle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Items Recycled</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.recycled}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-slate-700 flex items-center gap-4">
            <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-xl">
              <Leaf className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">CO₂ Saved</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{(stats.recycled * 0.15).toFixed(1)}kg</p>
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        {/* <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition shadow-lg shadow-green-200 dark:shadow-none">
            <MapPin className="w-6 h-6" />
            <span className="font-bold">Find Bins</span>
          </button>
          {/* Linked to Admin Scan for testing easily
          <Link href="/admin/scan" className="bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition">
            <ScanLine className="w-6 h-6" />
            <span className="font-bold">Admin Scan (Test)</span>
          </Link>
        </div>  */}

        {/* REWARD SYSTEM SECTION */}
        <div className="mt-10">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-4">Rewards & Redemptions</h2>
            <RewardSystem
                userPoints={stats.points}
                rewards={rewards}
                redemptions={user.redemptions}
            />
        </div>

      </div>
    </main>
  );
}