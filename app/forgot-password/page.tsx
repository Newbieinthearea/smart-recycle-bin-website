"use client";
import { useState } from "react";
import { Leaf, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
    });
    
    // Always show success to prevent hackers from checking which emails exist
    setStatus("success");
  };

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-green-100">
        <Link href="/login" className="flex items-center text-sm text-gray-500 hover:text-green-600 mb-6 transition">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </Link>

        <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
                <Leaf className="w-8 h-8 text-green-600" />
            </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Forgot Password?</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Enter your email and we&apos;ll send you a link to reset your password.</p>
        
        {status === "success" ? (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-center">
                <p className="font-medium">Check your email!</p>
                <p className="text-sm mt-1">If an account exists for <strong>{email}</strong>, you will receive a reset link shortly.</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                        type="email" 
                        required 
                        placeholder="john@example.com" 
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                </div>
                <button 
                    disabled={status === "loading"} 
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-green-200 disabled:opacity-70"
                >
                    {status === "loading" ? "Sending..." : "Send Reset Link"}
                </button>
            </form>
        )}
      </div>
    </div>
  );
}