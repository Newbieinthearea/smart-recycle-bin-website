"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Lock, CheckCircle } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reusable styling for inputs (Matches Login Page)
  const inputClass = "w-full pl-10 pr-4 py-3 rounded-xl border outline-none transition-all " +
    "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 " + 
    "focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-200 " +
    "dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-500 " +
    "dark:focus:bg-slate-800 dark:focus:border-green-500";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return alert("Invalid Link");
    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    if (res.ok) {
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000); // Redirect after 3s
    } else {
      const data = await res.json();
      alert(data.message || "Something went wrong");
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-slate-900">
        <div className="text-red-500 font-bold bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl">
            Invalid or Missing Link
        </div>
    </div>
  );

  if (success) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 transition-colors bg-green-50 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 text-center transition-colors bg-white border border-green-100 shadow-xl rounded-2xl dark:bg-slate-800 dark:border-slate-700">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/30">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-500" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-gray-800 dark:text-white">Password Reset!</h2>
                <p className="text-gray-500 dark:text-gray-400">Redirecting you to login...</p>
            </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 transition-colors bg-green-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 transition-colors bg-white border border-green-100 shadow-xl rounded-2xl dark:bg-slate-800 dark:border-slate-700">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800 dark:text-white">Set New Password</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
            <div className="relative">
              <Lock className="absolute w-5 h-5 text-gray-400 left-3 top-3.5 dark:text-gray-500" />
              <input
                type="password"
                required
                className={inputClass}
                placeholder="Must be at least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
              />
            </div>
          </div>
          <button 
            disabled={loading} 
            className="w-full py-3 font-bold text-white transition bg-green-600 shadow-lg rounded-xl hover:bg-green-700 shadow-green-200 dark:shadow-none disabled:opacity-70"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center dark:text-white">Loading...</div>}>
      <ResetForm />
    </Suspense>
  );
}