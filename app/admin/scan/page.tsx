"use client";
import { useState } from "react";
import { Scan, CheckCircle, XCircle, Search } from "lucide-react";

// 1. Define the shape of your API response
interface RedemptionResult {
  success?: boolean;
  item?: string;
  user?: string;
  error?: string;
}

export default function AdminRedeem() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState("idle"); 
  
  // 2. Use the interface instead of <any>
  const [result, setResult] = useState<RedemptionResult | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setResult(null);

    try {
      const res = await fetch("/api/admin/complete-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to redeem");
      }

      setResult(data); 
      setStatus("success");
      setCode(""); 
    } catch (error: unknown) { // 3. Use 'unknown' instead of 'any' for the error
      let message = "An error occurred";
      if (error instanceof Error) message = error.message;
      
      setResult({ error: message });
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-blue-100 p-4 rounded-full mb-4">
            <Scan className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Reward Scanner</h1>
          <p className="text-gray-500 text-sm">Enter the student&apos;s reward code</p>
        </div>

        {/* Form */}
        <form onSubmit={handleRedeem} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ECO-XXXXXX"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none uppercase tracking-widest font-mono transition"
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

        {/* Success State */}
        {status === "success" && result && (
          <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-12 h-12 text-green-500 mb-2" />
            <h3 className="text-lg font-bold text-green-800">Redemption Successful!</h3>
            <div className="mt-2 text-sm text-green-700 space-y-1">
              <p>Item: <strong>{result.item}</strong></p>
              <p>Student: <strong>{result.user}</strong></p>
            </div>
          </div>
        )}

        {/* Error State */}
        {status === "error" && result && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
            <div>
              <h3 className="font-bold text-red-800">Error</h3>
              <p className="text-sm text-red-600">{result.error}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}