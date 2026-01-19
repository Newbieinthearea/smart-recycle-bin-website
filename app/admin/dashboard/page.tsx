"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ScanLine, Plus, Package, Users, Ticket, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";

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

interface DashboardData {
  redemptions: AdminRedemption[];
  rewards: AdminReward[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"redemptions" | "rewards">("redemptions");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

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

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/data");
      if (res.ok) {
        const json: DashboardData = await res.json();
        setData(json);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- Handlers ---

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
    if (res.ok) {
      fetchData();
    } else {
      const json = await res.json();
      alert(json.error || "Failed to delete");
    }
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

  const inputClass = "w-full p-3 border rounded-xl outline-none transition-colors " +
    "bg-white border-gray-300 text-slate-800 " + 
    "dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:focus:border-blue-500";

  if (loading || !data) return <div className="p-10 text-center text-gray-500 dark:text-gray-400">Loading Admin Panel...</div>;

  return (
    <div className="min-h-screen p-6 transition-colors bg-slate-50 dark:bg-slate-900">
      <div className="mx-auto max-w-6xl">
        
        {/* HEADER */}
        <div className="flex flex-col gap-4 mb-8 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400">Manage rewards and redemptions</p>
          </div>
          <Link 
            href="/admin/scan" 
            className="flex items-center gap-2 px-6 py-3 font-bold text-white transition bg-blue-600 shadow-lg hover:bg-blue-700 rounded-xl"
          >
            <ScanLine className="w-5 h-5" /> Open Scanner
          </Link>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-3">
           <div className="p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 text-orange-600 bg-orange-100 rounded-lg dark:bg-orange-900/30"><Ticket className="w-5 h-5"/></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pending Claims</p>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">
               {data.redemptions.filter((r) => r.status === "PENDING").length}
             </p>
           </div>
           <div className="p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 text-green-600 bg-green-100 rounded-lg dark:bg-green-900/30"><Users className="w-5 h-5"/></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Given</p>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">
               {data.redemptions.filter((r) => r.status === "COMPLETED").length}
             </p>
           </div>
           <div className="p-6 bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-3 mb-2">
                <div className="p-2 text-blue-600 bg-blue-100 rounded-lg dark:bg-blue-900/30"><Package className="w-5 h-5"/></div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Rewards</p>
             </div>
             <p className="text-3xl font-bold text-slate-900 dark:text-white">{data.rewards.length}</p>
           </div>
        </div>

        {/* TABS & CONTENT */}
        <div className="overflow-hidden bg-white border shadow-sm dark:bg-slate-800 rounded-2xl border-slate-200 dark:border-slate-700">
          <div className="flex border-b border-slate-200 dark:border-slate-700">
             <button onClick={() => setActiveTab("redemptions")} className={`flex-1 py-4 font-bold transition-colors ${activeTab === "redemptions" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>All Redemptions</button>
             <button onClick={() => setActiveTab("rewards")} className={`flex-1 py-4 font-bold transition-colors ${activeTab === "rewards" ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400" : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}>Manage Rewards</button>
          </div>

          <div className="p-6">
            
            {/* 1. REDEMPTIONS TABLE (RESTORED) */}
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

            {/* 2. MANAGE REWARDS (NEW) */}
            {activeTab === "rewards" && (
              <div className="grid gap-8 md:grid-cols-2">
                {/* Form */}
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
                           <div className="w-10 h-10 overflow-hidden rounded bg-slate-100 dark:bg-slate-700 shrink-0">
                              {reward.image ? (
                                <img src={reward.image} className="object-cover w-full h-full" />
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