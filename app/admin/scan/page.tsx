"use client";

import { useState, useEffect, useRef } from "react";
import { Scan, CheckCircle, XCircle, Search, Camera, X, ImageIcon } from "lucide-react";
import { Html5Qrcode } from "html5-qrcode"; // 👈 Import the Core Class, not the Scanner
import Link from "next/link";

interface RedemptionResult {
  success?: boolean;
  rewardName?: string;
  userName?: string;
  error?: string;
}

export default function AdminRedeem() {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "scanning" | "loading" | "success" | "error">("idle");
  const [result, setResult] = useState<RedemptionResult | null>(null);
  
  // Ref to track the running scanner instance so we can stop it cleanly
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processRedemption = async (uniqueCode: string) => {
    // Stop scanner if running
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
            await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (err) {
        console.warn("Failed to stop scanner", err);
      }
    }

    setStatus("loading");
    setResult(null);

    try {
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
      setCode(""); 
    } catch (error: unknown) {
      let message = "An error occurred";
      if (error instanceof Error) message = error.message;
      setResult({ error: message });
      setStatus("error");
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code) processRedemption(code);
  };

  // 👇 NEW: Handle File Upload for QR Scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setStatus("loading");

    try {
      // We use the same "reader" div, even if hidden
      const html5QrCode = new Html5Qrcode("reader");
      const decodedText = await html5QrCode.scanFile(file, true);
      processRedemption(decodedText);
    } catch (err) {
      setStatus("error");
      setResult({ error: "Could not find a QR code in this image." });
    } finally {
        // Reset the input so you can upload the same file again if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // CAMERA LOGIC
  useEffect(() => {
    if (status === "scanning") {
      const html5QrCode = new Html5Qrcode("reader");
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          processRedemption(decodedText);
        },
        (errorMessage) => {
          // ignore frame errors
        }
      ).catch((err) => {
        console.error("Camera start failed", err);
        setStatus("error");
        setResult({ error: "Camera failed or permission denied." });
      });

      return () => {
        if (scannerRef.current) {
             // We catch errors here because sometimes it's already stopped
             try { scannerRef.current.stop(); scannerRef.current.clear(); } catch(e) {}
        }
      };
    }
  }, [status]);

  return (
    <div className="flex flex-col items-center min-h-screen p-6 transition-colors bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md p-8 bg-white border border-gray-200 shadow-xl dark:bg-slate-800 rounded-2xl dark:border-slate-700">
        
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-4 mb-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
            <Scan className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Reward Scanner</h1>
          <Link href="/admin/dashboard" className="mt-2 text-sm text-gray-500 hover:underline">
            Back to Dashboard
          </Link>
        </div>

        {/* ⚠️ IMPORTANT: The 'reader' div must ALWAYS exist in the DOM 
            for the library to work (both for Camera and File Scan).
            We just hide it with CSS when not scanning.
        */}
        <div 
            id="reader" 
            className={`overflow-hidden border-2 rounded-xl border-slate-300 dark:border-slate-600 mb-6 ${status === "scanning" ? "block" : "hidden"}`}
        ></div>

        {/* CAMERA VIEWPORT CONTROLS */}
        {status === "scanning" && (
            <button 
              onClick={() => setStatus("idle")}
              className="flex items-center justify-center w-full gap-2 py-3 mb-6 font-bold text-red-600 transition bg-red-100 rounded-xl hover:bg-red-200"
            >
              <X className="w-5 h-5" /> Stop Scanning
            </button>
        )}

        {/* ACTION BUTTONS (Visible when IDLE) */}
        {status !== "scanning" && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
                onClick={() => {
                    setStatus("scanning");
                    setResult(null);
                }}
                className="flex flex-col items-center justify-center gap-2 py-4 font-bold text-white transition shadow-lg bg-slate-900 dark:bg-slate-700 rounded-xl hover:bg-slate-800 dark:hover:bg-slate-600"
            >
                <Camera className="w-6 h-6" /> Open Camera
            </button>

            <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 py-4 font-bold text-gray-700 transition bg-gray-100 border border-gray-200 shadow-sm dark:bg-slate-800 dark:text-white dark:border-slate-600 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700"
            >
                <ImageIcon className="w-6 h-6" /> Upload Image
            </button>
            
            {/* Hidden File Input */}
            <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
            />
          </div>
        )}

        {/* OR DIVIDER */}
        {status !== "scanning" && (
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-slate-700"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 text-gray-500 bg-white dark:bg-slate-800">Or type code manually</span></div>
            </div>
        )}

        {/* MANUAL FORM */}
        {status !== "scanning" && (
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="relative">
              <Search className="absolute w-5 h-5 text-gray-400 left-4 top-3.5" />
              <input
                type="text"
                placeholder="ECO-XXXXXX"
                className="w-full py-3 pr-4 transition bg-white border border-gray-300 outline-none pl-12 dark:bg-slate-900 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase tracking-widest font-mono text-gray-800 dark:text-white"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
              />
            </div>
            <button
              disabled={status === "loading" || !code}
              className="w-full py-3 font-bold text-white transition bg-blue-600 shadow-lg rounded-xl hover:bg-blue-700 disabled:opacity-50"
            >
              {status === "loading" ? "Verifying..." : "Verify & Redeem"}
            </button>
          </form>
        )}

        {/* SUCCESS STATE */}
        {status === "success" && result && (
          <div className="flex flex-col items-center p-4 mt-8 text-center border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 rounded-xl animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle className="w-12 h-12 mb-2 text-green-500" />
            <h3 className="text-lg font-bold text-green-800 dark:text-green-300">Redemption Successful!</h3>
            <div className="mt-2 text-sm text-green-700 dark:text-green-400 space-y-1">
              <p>Item: <strong>{result.rewardName}</strong></p>
              <p>Student: <strong>{result.userName}</strong></p>
            </div>
            <button onClick={() => setStatus("idle")} className="mt-4 font-bold text-green-700 underline hover:text-green-800">Scan Another</button>
          </div>
        )}

        {/* ERROR STATE */}
        {status === "error" && result && (
          <div className="flex items-center gap-3 p-4 mt-8 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-xl animate-in fade-in slide-in-from-bottom-2">
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