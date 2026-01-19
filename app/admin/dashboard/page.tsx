"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScanLine } from "lucide-react";
import Link from "next/link";

// 👇 1. Define proper interfaces (No more 'any')
interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
}

interface AdminReward {
  id: string;
  name: string;
  cost: number;
  stock: number;
  description: string;
}

interface AdminRedemption {
  id: string;
  uniqueCode: string;
  status: "PENDING" | "COMPLETED"; // Precise types
  createdAt: string; // Dates from JSON API are strings
  user: AdminUser;
  reward: AdminReward;
}

interface DashboardData {
  redemptions: AdminRedemption[];
  rewards: AdminReward[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"redemptions" | "rewards">("redemptions");
  
  // 👇 2. Use the interface in useState
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newReward, setNewReward] = useState({ name: "", description: "", cost: 0, stock: 0 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/"); 
    }

    if (status === "authenticated") fetchData();
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        const json: DashboardData = await res.json(); // Explicit cast
        setData(json);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/admin/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReward),
    });
    alert("Reward Created!");
    setNewReward({ name: "", description: "", cost: 0, stock: 0 });
    fetchData(); 
  };

  if (loading || !data) return <div className="p-10 text-center text-gray-500">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-500">Manage rewards and redemptions</p>
          </div>
          <Link 
            href="/admin/scan" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg transition"
          >
            <ScanLine className="w-5 h-5" /> Open Scanner
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <p className="text-slate-500 text-sm font-medium">Pending Claims</p>
             <p className="text-3xl font-bold text-orange-600">
               {data.redemptions.filter((r) => r.status === "PENDING").length}
             </p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <p className="text-slate-500 text-sm font-medium">Total Rewards Given</p>
             <p className="text-3xl font-bold text-green-600">
               {data.redemptions.filter((r) => r.status === "COMPLETED").length}
             </p>
           </div>
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
             <p className="text-slate-500 text-sm font-medium">Active Rewards</p>
             <p className="text-3xl font-bold text-blue-600">{data.rewards.length}</p>
           </div>
        </div>

        {/* TABS & CONTENT */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200">
            <button 
              onClick={() => setActiveTab("redemptions")}
              className={`flex-1 py-4 font-bold ${activeTab === "redemptions" ? "text-blue-600 bg-blue-50" : "text-slate-500"}`}
            >
              All Redemptions
            </button>
            <button 
              onClick={() => setActiveTab("rewards")}
              className={`flex-1 py-4 font-bold ${activeTab === "rewards" ? "text-blue-600 bg-blue-50" : "text-slate-500"}`}
            >
              Manage Rewards
            </button>
          </div>

          <div className="p-6">
            {/* 1. REDEMPTIONS TABLE */}
            {activeTab === "redemptions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Reward</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.redemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{r.user?.name || "Unknown"}</td>
                        <td className="p-3 text-slate-700">{r.reward?.name || "Unknown"}</td>
                        <td className="p-3 font-mono text-xs bg-slate-100 rounded w-fit px-2">{r.uniqueCode}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            r.status === "COMPLETED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        {/* Fix Date Rendering: API returns string, so we pass it to Date constructor */}
                        <td className="p-3 text-slate-500 text-sm">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 2. CREATE REWARD FORM */}
            {activeTab === "rewards" && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Form */}
                <div>
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Create New Reward</h3>
                  <form onSubmit={handleCreateReward} className="space-y-4">
                    <input 
                      placeholder="Reward Name (e.g. Eco Bag)" 
                      className="w-full p-3 border border-gray-300 rounded-xl text-slate-800"
                      value={newReward.name}
                      onChange={e => setNewReward({...newReward, name: e.target.value})}
                      required
                    />
                    <textarea 
                      placeholder="Description" 
                      className="w-full p-3 border border-gray-300 rounded-xl text-slate-800"
                      value={newReward.description}
                      onChange={e => setNewReward({...newReward, description: e.target.value})}
                      required
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number" 
                        placeholder="Cost (Points)" 
                        className="w-full p-3 border border-gray-300 rounded-xl text-slate-800"
                        value={newReward.cost || ""}
                        onChange={e => setNewReward({...newReward, cost: parseInt(e.target.value)})}
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Stock Qty" 
                        className="w-full p-3 border border-gray-300 rounded-xl text-slate-800"
                        value={newReward.stock || ""}
                        onChange={e => setNewReward({...newReward, stock: parseInt(e.target.value)})}
                        required
                      />
                    </div>
                    <button className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700">
                      Create Reward
                    </button>
                  </form>
                </div>

                {/* List Existing Rewards */}
                <div className="border-l pl-8 border-slate-200">
                  <h3 className="text-lg font-bold mb-4 text-slate-800">Existing Inventory</h3>
                  <div className="space-y-3 h-80 overflow-y-auto pr-2">
                    {data.rewards.map(reward => (
                      <div key={reward.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg bg-white">
                        <div>
                          <p className="font-bold text-slate-800">{reward.name}</p>
                          <p className="text-xs text-gray-500">{reward.stock} in stock</p>
                        </div>
                        <span className="font-bold text-green-600">{reward.cost} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}