"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Loader2, CheckCircle, XCircle, Gift } from "lucide-react";

export default function ClaimPage() {
  const { data: session, status } = useSession();
  const params = useParams(); 
  const searchParams = useSearchParams(); 
  const router = useRouter();
  
  // Ref to prevent double-firing
  const hasClaimed = useRef(false);

  const [claimState, setClaimState] = useState<"verifying" | "claiming" | "success" | "error">("verifying");
  const [message, setMessage] = useState("");
  const [points, setPoints] = useState(0);

  // 👇 MOVED UP: Define this function BEFORE the useEffect
  const handleClaim = async () => {
    hasClaimed.current = true; 
    setClaimState("claiming");

    try {
      const secret = searchParams.get("secret");

      const res = await fetch("/api/machine/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          transactionId: params.id, 
          secret: secret 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setClaimState("success");
        setPoints(data.points);
        setMessage(`Successfully added to your wallet!`);
      } else {
        setClaimState("error");
        setMessage(data.error || "Receipt invalid or already claimed.");
      }
    } catch (error) {
      setClaimState("error");
      setMessage("Network connection failed.");
    }
  };

  // 👇 USE EFFECT COMES AFTER
  useEffect(() => {
    if (status === "loading") return;

    // A. If not logged in, show UI
    if (status === "unauthenticated") {
      setClaimState("verifying");
      return;
    }

    // B. If logged in, Auto-Claim immediately
    if (status === "authenticated" && !hasClaimed.current) {
      handleClaim();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]); // We ignore handleClaim dependency to prevent infinite loops without useCallback

  // --- RENDERING ---

  if (status === "loading" || claimState === "claiming") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-green-50">
        <div className="w-full max-w-sm p-10 text-center bg-white shadow-xl rounded-2xl">
          <Loader2 className="w-16 h-16 mx-auto text-green-600 animate-spin" />
          <h2 className="mt-4 text-xl font-bold text-gray-800">Verifying Receipt...</h2>
          <p className="text-gray-500">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-green-50">
        <div className="w-full max-w-sm p-8 text-center bg-white shadow-xl rounded-2xl">
          <div className="flex items-center justify-center w-20 h-20 mx-auto mb-6 bg-orange-100 rounded-full">
            <Gift className="w-10 h-10 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Save Your Points!</h1>
          <p className="mt-2 text-gray-600">Log in to add this recycling session to your account.</p>
          
          <button 
            onClick={() => signIn("google", { callbackUrl: window.location.href })}
            className="w-full py-4 mt-8 text-lg font-bold text-white transition bg-blue-600 shadow-lg rounded-xl hover:bg-blue-700 shadow-blue-200"
          >
            Log in to Claim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-green-50">
      <div className="w-full max-w-sm p-8 text-center bg-white shadow-xl rounded-2xl">
        
        {/* SUCCESS STATE */}
        {claimState === "success" && (
          <div className="space-y-6 animate-in fade-in zoom-in">
            <div className="flex items-center justify-center w-24 h-24 mx-auto bg-green-100 rounded-full">
               <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-green-600">+{points}</h1>
              <span className="text-sm font-bold tracking-widest text-gray-400 uppercase">Points Added</span>
            </div>
            <p className="font-medium text-gray-600">{message}</p>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-4 font-bold text-white bg-gray-900 rounded-xl hover:bg-black"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {/* ERROR STATE */}
        {claimState === "error" && (
          <div className="space-y-6">
            <div className="flex items-center justify-center w-24 h-24 mx-auto bg-red-100 rounded-full">
               <XCircle className="w-12 h-12 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Claim Failed</h1>
            <p className="text-red-500">{message}</p>
            <button 
              onClick={() => router.push("/")}
              className="w-full py-4 font-bold text-gray-800 bg-gray-200 rounded-xl hover:bg-gray-300"
            >
              Back to Home
            </button>
          </div>
        )}

      </div>
    </div>
  );
}