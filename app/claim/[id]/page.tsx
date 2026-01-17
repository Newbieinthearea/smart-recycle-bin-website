"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Recycle } from "lucide-react";

export default function ClaimPage() {
  const { data: session, status } = useSession();
  const params = useParams(); // Get the ID from the URL
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"initial" | "success" | "error">("initial");
  const [message, setMessage] = useState("");

  // 1. Force Login if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn(undefined, { callbackUrl: `/claim/${params.id}` });
    }
  }, [status, params.id]);

  const handleClaim = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: params.id }),
      });

      const data = await res.json();

      if (res.ok) {
        setResult("success");
        setMessage(`You earned +${data.pointsAdded} Points!`);
      } else {
        setResult("error");
        setMessage(data.message || "Something went wrong");
      }
    } catch (error) {
      setResult("error");
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") return <div className="p-10 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-sm w-full rounded-2xl shadow-xl p-8 text-center">
        
        {/* SUCCESS STATE */}
        {result === "success" && (
          <div className="space-y-4">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">Success!</h1>
            <p className="text-lg text-green-600 font-medium">{message}</p>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-bold mt-4"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {result === "error" && (
          <div className="space-y-4">
            <XCircle className="w-20 h-20 text-red-500 mx-auto" />
            <h1 className="text-2xl font-bold text-gray-800">Oops!</h1>
            <p className="text-gray-600">{message}</p>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-3 bg-gray-200 text-gray-800 rounded-xl font-bold mt-4"
            >
              Go Home
            </button>
          </div>
        )}

        {/* INITIAL STATE (Click to Claim) */}
        {result === "initial" && (
          <div className="space-y-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Recycle className="w-10 h-10 text-green-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Recycling Detected!</h1>
              <p className="text-gray-500 mt-2">Click below to add these items to your account.</p>
            </div>

            <button
              onClick={handleClaim}
              disabled={loading}
              className="w-full py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Collect Points"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}