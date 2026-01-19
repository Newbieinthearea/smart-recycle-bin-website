"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "react-qr-code";
import { ShoppingBag, Ticket, Loader2, CheckCircle } from "lucide-react";

interface Reward {
  id: string;
  name: string;
  cost: number;
  description: string;
  image?: string | null;
  stock: number;
}

interface Redemption {
  id: string;
  uniqueCode: string;
  reward: { name: string; image?: string | null };
  status: string;
  createdAt: Date;
}

interface Props {
  userPoints: number;
  rewards: Reward[];
  redemptions: Redemption[];
}

export default function RewardSystem({ userPoints, rewards, redemptions }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"market" | "inventory">("market");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRedeem = async (rewardId: string) => {
    setLoadingId(rewardId);
    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Redemption Successful!");
        router.refresh(); 
        setActiveTab("inventory"); 
      } else {
        alert(data.error || "Failed to redeem");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-green-100 dark:border-slate-700 overflow-hidden transition-colors h-full flex flex-col">
      
      {/* TABS */}
      <div className="flex border-b border-gray-100 dark:border-slate-700 shrink-0">
        <button
          onClick={() => setActiveTab("market")}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === "market"
              ? "text-green-600 border-b-2 border-green-600 bg-green-50/50 dark:bg-slate-700/50"
              : "text-gray-500 hover:text-green-600 dark:text-gray-400"
          }`}
        >
          <ShoppingBag className="w-4 h-4" /> Rewards Market
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 transition ${
            activeTab === "inventory"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-slate-700/50"
              : "text-gray-500 hover:text-blue-600 dark:text-gray-400"
          }`}
        >
          <Ticket className="w-4 h-4" /> My Items ({redemptions.filter(r => r.status !== 'COMPLETED').length})
        </button>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="p-6 overflow-y-auto custom-scrollbar h-[500px]">
        
        {/* MARKETPLACE TAB */}
        {activeTab === "market" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-10">No rewards available right now.</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward.id} className="border border-gray-100 dark:border-slate-600 rounded-xl p-4 flex flex-col hover:shadow-md transition bg-white dark:bg-slate-900">
                  <div className="relative w-full aspect-square bg-gray-100 dark:bg-slate-800 rounded-lg mb-4 overflow-hidden">
                     {reward.image ? (
                       <Image 
                         src={reward.image} 
                         alt={reward.name} 
                         fill
                         className="object-cover hover:scale-105 transition-transform" 
                       />
                     ) : (
                       <div className="flex items-center justify-center w-full h-full text-4xl">🎁</div>
                     )}
                  </div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{reward.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3 line-clamp-2">{reward.description}</p>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-green-600 dark:text-green-400">{reward.cost} Pts</span>
                    <button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={userPoints < reward.cost || reward.stock <= 0 || loadingId === reward.id}
                      className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 hover:bg-green-600 transition"
                    >
                      {loadingId === reward.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Redeem"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* INVENTORY TAB */}
        {activeTab === "inventory" && (
          <div className="space-y-4">
            {redemptions.length === 0 ? (
              <div className="text-center py-10 text-gray-500">You haven&apos;t redeemed any rewards yet.</div>
            ) : (
              redemptions.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 border border-gray-200 dark:border-slate-600 rounded-xl p-4 bg-white dark:bg-slate-900">
                  <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
                     {item.status === "COMPLETED" ? (
                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded text-gray-400"><CheckCircle /></div>
                     ) : (
                        <QRCode value={item.uniqueCode} size={80} />
                     )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100">{item.reward.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{item.uniqueCode}</p>
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                        item.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                        {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}