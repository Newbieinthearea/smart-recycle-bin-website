"use client";

import { useState, useEffect } from "react";
import { Scan, CheckCircle, XCircle, Search, Camera, X } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";
import Link from "next/link";

interface RedemptionResult {
  success?: boolean;
  rewardName?: string; // Updated to match API response
  userName?: string;   // Updated to match API response
  error?: string;
}

export default function AdminRedeem() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<RedemptionResult | null>(null);

  // 1. Reusable Function to Process Code (Used by both Camera & Manual Input)
  const processRedemption = async (uniqueCode: string) => {
    setStatus("loading");
    setResult(null);

    try {
      // ⚠️ Make sure this URL matches your API file name (e.g. redeem-scan or complete-order)
      const res = await fetch("/api/admin/redeem-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uniqueCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem");
      }

      setResult(data);
      setStatus("success");
      setCode(""); // Clear input
    } catch (error: unknown) {
      let message = "An error occurred";
      if (error instanceof Error) message = error.message;
      setResult({ error: message });
      setStatus("error");
    }
  };

  // 2. Handle Manual Form Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) processRedemption(code);
  };

  // 3. Handle Camera Scan Logic (Fixed)
  useEffect(() => {
    if (status === "scanning") {
      const scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
          // 👇 FIX 1: Force Back Camera
          videoConstraints: {
            facingMode: "environment" 
          },
          // 👇 FIX 2: Hide the "Scan Image File" link (optional config)
          showTorchButtonIfSupported: true,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          processRedemption(decodedText);
        },
        (error) => {
          // console.warn(error);
        }
      );

      return () => {
        scanner.clear().catch(err => console.error("Failed to clear", err));
      };
    }
  }, [status]);
  return (
    <div className="min-h-screen p-6 flex flex-col items-center bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
            <Scan className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reward Scanner</h1>
          <Link href="/admin/dashboard" className="text-sm text-gray-500 hover:underline mt-2">
            Back to Dashboard
          </Link>
        </div>

        {/* 4. CAMERA VIEWPORT */}
        {status === "scanning" ? (
          <div className="mb-6">
            <div id="reader" className="rounded-xl overflow-hidden border-2 border-slate-300 dark:border-slate-600"></div>
            <button 
              onClick={() => setStatus("idle")}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-red-100 text-red-600 font-bold py-3 rounded-xl hover:bg-red-200 transition"
            >
              <X className="w-5 h-5" /> Stop Scanning
            </button>
          </div>
        ) : (
          /* 5. START SCAN BUTTON */
          <button
            onClick={() => {
                setStatus("scanning");
                setResult(null);
            }}
            className="w-full mb-6 flex items-center justify-center gap-2 bg-slate-900 dark:bg-slate-700 text-white font-bold py-4 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600 transition shadow-lg"
          >
            <Camera className="w-5 h-5" /> Open Camera
          </button>
        )}

        {/* OR DIVIDER */}
        {status !== "scanning" && (
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-slate-800 text-gray-500">Or type code manually</span></div>
            </div>
        )}

        {/* MANUAL FORM */}
        {status !== "scanning" && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="ECO-XXXXXX"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase tracking-widest font-mono transition bg-white dark:bg-slate-900 text-gray-800 dark:text-white"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <button
              disabled={status === "loading" || !code}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg transition disabled:opacity-50"
            >
              {status === "loading" ? "Verifying..." : "Verify & Redeem"}
            </button>
          </form>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && result && (
          <div className="mt-8 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Redemption Successful!</h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-400 space-y-1">
              <p>Item: <strong>{result.rewardName}</strong></p>
              <p>Student: <strong>{result.userName}</strong></p>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && result && (
          <div className="mt-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-red-800 dark:text-red-300">Error</h3>
              <p className="text-sm text-red-600 dark:text-red-400">{result.error}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}