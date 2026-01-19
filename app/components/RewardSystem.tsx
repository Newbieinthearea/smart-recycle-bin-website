"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // 👈 Using Next.js Image optimization
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
    <div className="mt-8 overflow-hidden transition-colors bg-white border border-green-100 shadow-sm dark:bg-slate-800 rounded-2xl dark:border-slate-700">
      
      {/* TABS */}
      <div className="flex border-b border-gray-100 dark:border-slate-700">
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

      <div className="p-6">
        {/* MARKETPLACE TAB */}
        {activeTab === "market" && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            {rewards.length === 0 ? (
              <p className="py-10 text-center text-gray-500 col-span-full">No rewards available right now. Check back later!</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward.id} className="flex flex-col h-full p-4 transition bg-white border border-gray-100 dark:bg-slate-900 rounded-xl dark:border-slate-600 hover:shadow-md">
                  
                  {/* 👇 UPDATED: Next/Image with Aspect Square */}
                  <div className="relative w-full mb-4 overflow-hidden bg-gray-100 rounded-lg aspect-square dark:bg-slate-800">
                     {reward.image ? (
                       <Image 
                         src={reward.image} 
                         alt={reward.name} 
                         fill
                         sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                         className="object-cover transition-transform hover:scale-105" 
                       />
                     ) : (
                       <div className="flex items-center justify-center w-full h-full">
                          <span className="text-4xl">🎁</span>
                       </div>
                     )}
                  </div>
                  
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{reward.name}</h3>
                  <p className="mb-3 mt-1 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">{reward.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-green-600 dark:text-green-400">{reward.cost} Pts</span>
                    <button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={userPoints < reward.cost || reward.stock <= 0 || loadingId === reward.id}
                      className="px-4 py-2 text-xs font-bold text-white transition bg-gray-900 rounded-lg dark:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600"
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
              <div className="py-10 text-center">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full dark:bg-slate-700">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">You haven&apos;t redeemed any rewards yet.</p>
              </div>
            ) : (
              redemptions.map((item) => (
                <div key={item.id} className="flex flex-col gap-6 p-6 bg-white border border-gray-200 md:flex-row dark:bg-slate-900 rounded-xl dark:border-slate-600">
                  {/* QR Code Section */}
                  <div className="p-2 bg-white border border-gray-100 shadow-sm rounded-lg shrink-0">
                     {item.status === "COMPLETED" ? (
                        <div className="flex items-center justify-center w-24 h-24 text-gray-400 bg-gray-100 rounded">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                     ) : (
                        <QRCode value={item.uniqueCode} size={96} />
                     )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center gap-3 mb-1 md:justify-start">
                        {/* 👇 UPDATED: Small Thumbnail in Inventory using Next/Image */}
                        {item.reward.image && (
                          <Image 
                            src={item.reward.image} 
                            alt={item.reward.name} 
                            width={40}
                            height={40}
                            className="object-cover border border-gray-200 rounded-md dark:border-slate-700" 
                          />
                        )}

                        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{item.reward.name}</h3>
                        
                        {item.status === "COMPLETED" && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">CLAIMED</span>}
                        {item.status === "PENDING" && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">READY</span>}
                    </div>
                    
                    <p className="inline-block px-2 py-1 mb-2 font-mono text-sm text-gray-500 border border-gray-200 rounded bg-gray-50 dark:bg-slate-800 dark:border-slate-700 dark:text-gray-400">
                      Code: {item.uniqueCode}
                    </p>
                    
                    <p className="text-xs text-gray-400">
                      {item.status === "COMPLETED" 
                        ? `Claimed on ${new Date(item.createdAt).toLocaleDateString()}` 
                        : "Show this QR code to the admin to claim your reward."}
                    </p>
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