"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { User, Lock, Save, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [name, setName] = useState(session?.user?.name || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Settings saved successfully!", type: "success" });
        await update({ name });
        setCurrentPassword("");
        setNewPassword("");
        router.refresh();
      } else {
        setMessage({ text: data.message || "Something went wrong", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Failed to connect to server", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    // 1. Main Background
    <div className="min-h-screen bg-green-50 dark:bg-slate-900 p-4 md:p-8 transition-colors">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        {/* 2. Card Container */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-green-100 dark:border-slate-700 overflow-hidden transition-colors">
          
          {/* Header */}
          <div className="bg-white dark:bg-slate-800 p-6 border-b border-gray-100 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Account Settings</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your profile and security preferences.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            
            {/* Status Message */}
            {message && (
              <div className={`p-4 rounded-xl text-sm ${
                message.type === "success" 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                  : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {message.text}
              </div>
            )}

            {/* Profile Section */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                <User className="w-5 h-5 text-green-600 dark:text-green-500" /> Profile Information
              </h2>
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    // 3. Inputs (Dark bg, light text, dark border)
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 outline-none transition"
                    placeholder="Your Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-950 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Email cannot be changed directly.</p>
                </div>
              </div>
            </section>

            <hr className="border-gray-100 dark:border-slate-700" />

            {/* Security Section */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                <Lock className="w-5 h-5 text-green-600 dark:text-green-500" /> Security
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 outline-none transition"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-white focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900 focus:border-green-500 outline-none transition"
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg border border-transparent dark:border-slate-700">
                  <strong>Note:</strong> If you log in with Google, you don&apos;t need to change your password here.
                </p>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-bold rounded-xl transition shadow-lg shadow-green-200 dark:shadow-none disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}