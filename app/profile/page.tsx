"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Lock, Save, ArrowLeft, Loader2, Camera } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  // State
  const [name, setName] = useState(session?.user?.name || "");
  const [image, setImage] = useState(session?.user?.image || ""); // 👈 New Image State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Send data to backend (Ensure your API handles 'image' now!)
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image, currentPassword, newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Profile updated successfully!", type: "success" });
        // Update Client Session immediately
        await update({ name, image }); 
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

  // Reusable Input Class
  const inputClass = "w-full px-4 py-3 rounded-xl border outline-none transition-all " + 
    "bg-white border-gray-200 text-gray-800 focus:ring-2 focus:ring-green-200 focus:border-green-500 " +
    "dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:focus:ring-green-900";

  return (
    <div className="min-h-screen p-4 transition-colors md:p-8 bg-green-50 dark:bg-slate-900">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button */}
        <Link 
          href="/" 
          className="inline-flex items-center mb-6 text-gray-500 transition dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        {/* Card Container */}
        <div className="overflow-hidden transition-colors bg-white border border-green-100 shadow-sm rounded-2xl dark:bg-slate-800 dark:border-slate-700">
          
          {/* Header */}
          <div className="p-6 bg-white border-b border-gray-100 dark:bg-slate-800 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Account Settings</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your profile and security preferences.</p>
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
              <h2 className="flex items-center gap-2 mb-6 text-lg font-semibold text-gray-800 dark:text-gray-200">
                <User className="w-5 h-5 text-green-600 dark:text-green-500" /> Profile Information
              </h2>
              
              <div className="flex flex-col gap-6 md:flex-row">
                
                {/* 1. Avatar Preview & Input */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative w-24 h-24">
                        <Image
                            src={image || "https://ui-avatars.com/api/?background=random"}
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="object-cover w-full h-full border-4 border-green-100 rounded-full dark:border-slate-700 shadow-sm"
                        />
                        <div className="absolute bottom-0 right-0 p-1.5 bg-green-600 rounded-full text-white border-2 border-white dark:border-slate-800">
                            <Camera className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                {/* Name & Image URL Inputs */}
                <div className="flex-1 space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture URL</label>
                        <input
                            type="url"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className={inputClass}
                            placeholder="https://imgur.com/..."
                        />
                        <p className="mt-1 text-xs text-gray-400">Paste a link to an image (Imgur, Unsplash, etc).</p>
                    </div>

                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            placeholder="Your Name"
                        />
                    </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                <input
                  type="email"
                  value={session?.user?.email || ""}
                  disabled
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed dark:bg-slate-950 dark:border-slate-700 dark:text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">Email cannot be changed directly.</p>
              </div>
            </section>

            <hr className="border-gray-100 dark:border-slate-700" />

            {/* Security Section */}
            <section>
              <h2 className="flex items-center gap-2 mb-4 text-lg font-semibold text-gray-800 dark:text-gray-200">
                <Lock className="w-5 h-5 text-green-600 dark:text-green-500" /> Security
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={inputClass}
                    placeholder="Enter new password"
                    minLength={6}
                  />
                </div>
                <p className="p-3 text-xs text-gray-500 border border-transparent rounded-lg bg-gray-50 dark:bg-slate-900/50 dark:text-gray-400 dark:border-slate-700">
                  <strong>Note:</strong> If you log in with Google, you do not need to change your password here.
                </p>
              </div>
            </section>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center w-full gap-2 px-8 py-3 font-bold text-white transition bg-green-600 shadow-lg md:w-auto hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 rounded-xl shadow-green-200 dark:shadow-none disabled:opacity-70"
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