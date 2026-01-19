"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import QRCode from "react-qr-code";
import { ShoppingBag, Ticket, Loader2, CheckCircle, AlertCircle } from "lucide-react";

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
  const [msg, setMsg] = useState("");

  const handleRedeem = async (rewardId: string) => {
    setLoadingId(rewardId);
    setMsg("");

    try {
      const res = await fetch("/api/rewards/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMsg("Redemption Successful!");
        router.refresh(); // Refresh page to update points & inventory
        setActiveTab("inventory"); // Switch to inventory to show the item
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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-green-100 dark:border-slate-700 overflow-hidden mt-8 transition-colors">
      
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {rewards.length === 0 ? (
              <p className="col-span-full text-center text-gray-500 py-10">No rewards available right now. Check back later!</p>
            ) : (
              rewards.map((reward) => (
                <div key={reward.id} className="border border-gray-100 dark:border-slate-600 rounded-xl p-4 flex flex-col h-full hover:shadow-md transition bg-white dark:bg-slate-900">
                  <div className="h-32 bg-gray-100 dark:bg-slate-800 rounded-lg mb-4 relative overflow-hidden flex items-center justify-center">
                     {/* Placeholder Image Logic */}
                     <span className="text-4xl">🎁</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{reward.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3 line-clamp-2">{reward.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-bold text-green-600 dark:text-green-400">{reward.cost} Pts</span>
                    <button
                      onClick={() => handleRedeem(reward.id)}
                      disabled={userPoints < reward.cost || reward.stock <= 0 || loadingId === reward.id}
                      className="px-4 py-2 bg-gray-900 dark:bg-slate-700 text-white text-xs font-bold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition"
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
              <div className="text-center py-10">
                <div className="bg-gray-100 dark:bg-slate-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400">You haven&apos;t redeemed any rewards yet.</p>
              </div>
            ) : (
              redemptions.map((item) => (
                <div key={item.id} className="flex flex-col md:flex-row items-center gap-6 border border-gray-200 dark:border-slate-600 rounded-xl p-6 bg-white dark:bg-slate-900">
                  {/* QR Code Section */}
                  <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-100">
                     {/* QR Code hidden if completed */}
                     {item.status === "COMPLETED" ? (
                        <div className="w-24 h-24 bg-gray-100 flex items-center justify-center rounded text-gray-400">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                     ) : (
                        <QRCode value={item.uniqueCode} size={96} />
                     )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-gray-100">{item.reward.name}</h3>
                        {item.status === "COMPLETED" && <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">CLAIMED</span>}
                        {item.status === "PENDING" && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">READY</span>}
                    </div>
                    
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-mono bg-gray-50 dark:bg-slate-800 inline-block px-2 py-1 rounded border border-gray-200 dark:border-slate-700 mb-2">
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