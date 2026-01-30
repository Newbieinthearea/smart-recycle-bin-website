"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScanLine, Plus, Package, Users, Ticket, Pencil, Trash2, X, Activity, Battery, Signal, AlertTriangle, RefreshCw } from "lucide-react";
import Image from "next/image";

// --- Interfaces ---
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
  image?: string | null;
}

interface AdminRedemption {
  id: string;
  uniqueCode: string;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  user: AdminUser;
  reward: AdminReward;
}

// [NEW] Bin Interface
interface AdminBin {
  id: string;
  name: string;
  location: string;
  isOnline: boolean;
  fillLevel: number;
  status: string;
  lastActive: string;
}

interface DashboardData {
  redemptions: AdminRedemption[];
  rewards: AdminReward[];
  bins: AdminBin[]; // [NEW] Added bins
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // [NEW] Added 'bins' to activeTab state
  const [activeTab, setActiveTab] = useState<"redemptions" | "rewards" | "bins">("bins");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Editing State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    cost: 0, 
    stock: 0, 
    image: "" 
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/"); 
    }
    if (status === "authenticated") fetchData();
  }, [status, session, router]);

  // Auto-refresh bin data every 10 seconds
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "ADMIN") return;
    
    const interval = setInterval(() => {
      fetchBinData(); // Only refresh bin status
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [status, session]);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setIsRefreshing(true);
    
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        const json: DashboardData = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Fetch only bin status (for auto-refresh)
  const fetchBinData = async () => {
    try {
      const res = await fetch("/api/admin/bins");
      if (res.ok) {
        const json = await res.json();
        // Update only the bins in the state, keep redemptions and rewards unchanged
        setData(prevData => prevData ? { ...prevData, bins: json.bins } : null);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error fetching bin data:", error);
    }
  };

  // --- Handlers (Keep existing handleSubmit, handleDelete, startEditing, resetForm) ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingId ? "PUT" : "POST";
    const body = editingId ? { ...formData, id: editingId } : formData;

    const res = await fetch("/api/admin/data", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      alert(editingId ? "Reward Updated!" : "Reward Created!");
      resetForm();
      fetchData(); 
    } else {
      alert("Failed to save.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reward?")) return;
    const res = await fetch(`/api/admin/data?id=${id}`, { method: "DELETE" });
    if (res.ok) fetchData();
    else alert("Failed to delete");
  };

  const startEditing = (reward: AdminReward) => {
    setEditingId(reward.id);
    setFormData({
      name: reward.name,
      description: reward.description,
      cost: reward.cost,
      stock: reward.stock,
      image: reward.image || ""
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", cost: 0, stock: 0, image: "" });
  };

  // Helper to format time ago
  const getTimeAgo = (date: Date | null) => {
    if (!date) return "Never";
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return "Just now";
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  // Helper to check if bin is "dead" (offline for > 2 mins)
  const isBinOffline = (lastActive: string) => {
    const diff = new Date().getTime() - new Date(lastActive).getTime();
    return diff > 1000 * 60 * 2; // 2 minutes
  };

  const inputClass = "w-full p-3 border rounded-xl outline-none transition-colors bg-white border-gray-300 text-slate-800 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:border-blue-500";

  if (loading || !data) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen p-6 transition-colors bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <div className="flex items-center gap-3">
              <p className="text-slate-500 dark:text-slate-400">Manage machines, rewards and redemptions</p>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></span>
                <span>Updated {getTimeAgo(lastUpdated)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchData()}
              className="flex items-center gap-2 px-4 py-3 font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button 
              onClick={() => router.push("/admin/scan")}
              className="flex items-center gap-2 px-6 py-3 font-bold text-white transition bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl"
            >
              <ScanLine className="w-5 h-5" /> Open Scanner
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-4">
           {/* [NEW] Online Bins Stat */}
           <div className="p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 text-purple-600 bg-purple-100 rounded-lg dark:bg-purple-900/30"><Activity className="w-5 h-5"/></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Online Bins</p>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">
               {data.bins?.filter(b => !isBinOffline(b.lastActive)).length || 0}
               <span className="ml-1 text-base text-gray-400">/ {data.bins?.length || 0}</span>
             </p>
           </div>

           <div className="p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 text-orange-600 bg-orange-100 rounded-lg dark:bg-orange-900/30"><Ticket className="w-5 h-5"/></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Claims</p>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">
               {data.redemptions.filter((r) => r.status === "PENDING").length}
             </p>
           </div>
           {/* Keep existing stats for Rewards/Given... */}
        </div>

        {/* TABS & CONTENT */}
        <div className="overflow-hidden bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
             <button onClick={() => setActiveTab("bins")} className={`flex-1 py-4 font-bold transition-colors ${activeTab === "bins" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>Bin Status</button>
             <button onClick={() => setActiveTab("redemptions")} className={`flex-1 py-4 font-bold transition-colors ${activeTab === "redemptions" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>All Redemptions</button>
             <button onClick={() => setActiveTab("rewards")} className={`flex-1 py-4 font-bold transition-colors ${activeTab === "rewards" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>Manage Rewards</button>
          </div>

          <div className="p-6">
            
            {/* [NEW] 1. BIN STATUS TAB */}
            {activeTab === "bins" && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {data.bins?.map((bin) => {
                    const offline = isBinOffline(bin.lastActive);
                    const isFull = bin.fillLevel >= 90;

                    return (
                        <div key={bin.id} className={`relative p-5 border rounded-xl overflow-hidden ${offline ? "opacity-75 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-slate-700" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"}`}>
                            {/* Status Dot */}
                            <div className={`absolute top-4 right-4 flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold ${offline ? "bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-green-100 text-green-600 dark:bg-green-900/30"}`}>
                                <span className={`w-2 h-2 rounded-full ${offline ? "bg-red-500" : "bg-green-500 animate-pulse"}`}></span>
                                {offline ? "OFFLINE" : "ONLINE"}
                            </div>

                            <div className="mb-4">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{bin.name}</h3>
                                <p className="text-xs text-slate-500">{bin.id} • {bin.location || "No Location"}</p>
                            </div>

                            {/* Status Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                                        <Activity className="w-4 h-4" /> State
                                    </div>
                                    <p className="text-sm font-bold text-slate-800 dark:text-white">{bin.status}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <div className="flex items-center gap-2 mb-1 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase">
                                        <Signal className="w-4 h-4" /> Last Seen
                                    </div>
                                    <p className="text-xs font-mono text-slate-800 dark:text-white">
                                        {offline ? "Lost Signal" : "Just now"}
                                    </p>
                                </div>
                            </div>

                            {/* Fill Level Bar */}
                            <div>
                                <div className="flex justify-between mb-1 text-xs font-bold">
                                    <span className="text-slate-500">Fill Level</span>
                                    <span className={isFull ? "text-red-500" : "text-blue-500"}>{bin.fillLevel}%</span>
                                </div>
                                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-500 ${isFull ? "bg-red-500" : "bg-blue-500"}`} 
                                        style={{ width: `${bin.fillLevel}%` }}
                                    ></div>
                                </div>
                                {isFull && (
                                    <div className="flex items-center gap-2 mt-2 text-xs font-bold text-red-600 dark:text-red-400 animate-pulse">
                                        <AlertTriangle className="w-4 h-4" /> Bin is Full! Empty immediately.
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                
                {(!data.bins || data.bins.length === 0) && (
                    <div className="col-span-full py-10 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                        <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No bins registered yet.</p>
                        <p className="text-xs">Connect a Raspberry Pi to see status here.</p>
                    </div>
                )}
              </div>
            )}

            {/* 2. REDEMPTIONS TABLE (Keep Existing) */}
            {activeTab === "redemptions" && (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="p-3">User</th>
                      <th className="p-3">Reward</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {data.redemptions.map((r) => (
                      <tr key={r.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50">
                        <td className="p-3 font-medium text-slate-900 dark:text-white">{r.user?.name || "Unknown"}</td>
                        <td className="p-3 text-slate-700 dark:text-slate-300">{r.reward?.name || "Unknown"}</td>
                        <td className="p-3">
                           <span className="px-2 py-1 text-xs font-mono rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                             {r.uniqueCode}
                           </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            r.status === "COMPLETED" 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          }`}>
                            {r.status}
                          </span>
                        </td>
                        <td className="p-3 text-sm text-slate-500 dark:text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 3. MANAGE REWARDS (Keep Existing logic) */}
            {activeTab === "rewards" && (
              <div className="grid gap-8 md:grid-cols-2">
                 {/* ... (Keep existing Reward Form & List code exactly as is) ... */}
                 <div>
                  <h3 className="flex items-center gap-2 mb-4 text-lg font-bold text-slate-800 dark:text-white">
                    {editingId ? <Pencil className="w-5 h-5"/> : <Plus className="w-5 h-5"/>} 
                    {editingId ? "Edit Reward" : "Create New Reward"}
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <input 
                      placeholder="Reward Name" 
                      className={inputClass}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      required
                    />
                    <textarea 
                      placeholder="Description" 
                      className={inputClass}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      required
                    />
                     <input 
                      placeholder="Image URL" 
                      className={inputClass}
                      value={formData.image}
                      onChange={e => setFormData({...formData, image: e.target.value})}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        type="number" 
                        placeholder="Cost" 
                        className={inputClass}
                        value={formData.cost || ""}
                        onChange={e => setFormData({...formData, cost: parseInt(e.target.value)})}
                        required
                      />
                      <input 
                        type="number" 
                        placeholder="Stock" 
                        className={inputClass}
                        value={formData.stock || ""}
                        onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})}
                        required
                      />
                    </div>

                    <div className="flex gap-2">
                        <button className={`flex-1 py-3 font-bold text-white transition rounded-xl ${editingId ? "bg-orange-500 hover:bg-orange-600" : "bg-green-600 hover:bg-green-700"}`}>
                        {editingId ? "Update Reward" : "Create Reward"}
                        </button>
                        
                        {editingId && (
                            <button type="button" onClick={resetForm} className="px-4 py-3 font-bold text-gray-600 transition bg-gray-200 rounded-xl hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600">
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                  </form>
                </div>

                {/* List Existing Rewards */}
                <div className="pt-8 pl-0 border-l border-slate-200 dark:border-slate-700 md:pl-8 md:pt-0">
                  <h3 className="mb-4 text-lg font-bold text-slate-800 dark:text-white">Existing Inventory</h3>
                  <div className="pr-2 space-y-3 overflow-y-auto h-80 custom-scrollbar">
                    {data.rewards.map(reward => (
                      <div key={reward.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                          editingId === reward.id 
                          ? "bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800" 
                          : "bg-white border-gray-200 dark:bg-slate-900/50 dark:border-slate-700"
                        }`}>
                        
                        <div className="flex items-center gap-3">
                           <div className="relative w-10 h-10 overflow-hidden rounded bg-slate-100 dark:bg-slate-700 shrink-0">
                              {reward.image ? (
                                <Image src={reward.image} alt={reward.name} fill className="object-cover" />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full text-xs text-slate-400">IMG</div>
                              )}
                           </div>
                           <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-gray-200">{reward.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{reward.stock} left • {reward.cost} pts</p>
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => startEditing(reward)}
                                className="p-2 text-blue-600 transition rounded-lg hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30"
                                title="Edit"
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => handleDelete(reward.id)}
                                className="p-2 text-red-600 transition rounded-lg hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                                title="Delete"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

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