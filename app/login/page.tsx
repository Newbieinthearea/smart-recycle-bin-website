'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { TelegramUser } from '../components/TelegramLogin';

export default function LoginPage() {
  const router = useRouter();
  const hasProcessedAuth = useRef(false);

  useEffect(() => {
    // Check if already logged in
    const existingSession = localStorage.getItem('user_session');
    if (existingSession) {
      router.push('/');
      return;
    }

    // Check URL parameters for OAuth callback
    if (!hasProcessedAuth.current && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const telegramData: Record<string, string> = {};
      
      // Extract all Telegram parameters
      urlParams.forEach((value, key) => {
        telegramData[key] = value;
      });

      // If we have Telegram auth data
      if (telegramData.id && telegramData.hash) {
        console.log('✅ Telegram OAuth callback received!', telegramData);
        
        const user: TelegramUser = {
          id: parseInt(telegramData.id),
          first_name: telegramData.first_name || '',
          username: telegramData.username,
          photo_url: telegramData.photo_url,
          auth_date: parseInt(telegramData.auth_date),
          hash: telegramData.hash,
        };

        // Save to localStorage
        localStorage.setItem('user_session', JSON.stringify(user));
        
        // Mark as processed
        hasProcessedAuth.current = true;
        
        // Redirect to dashboard
        router.push('/');
      }
    }
  }, [router]);

  const handleTelegramLogin = () => {
    if (typeof window === 'undefined') return;
    
    // Use direct OAuth link that opens Telegram app
    const botId = '8299146600';
    const origin = encodeURIComponent(window.location.origin);
    const returnTo = encodeURIComponent(window.location.href);
    
    const oauthUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${origin}&return_to=${returnTo}&request_access=write`;
    
    console.log('🔗 Opening Telegram OAuth:', oauthUrl);
    
    // Open in same window
    window.location.href = oauthUrl;
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Login with Telegram</h1>
        
        <div className="space-y-4">
          {/* Primary Login Button */}
          <button
            onClick={handleTelegramLogin}
            className="w-full bg-[#0088cc] text-white px-6 py-3 rounded-lg hover:bg-[#006699] transition flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.717-.962 4.042-1.362 5.362-.168.558-.5 1.035-.818 1.035-.5 0-.818-.442-.818-.942 0-.317.168-.717.5-1.317l1.362-2.542c.168-.317.5-.442.818-.442.5 0 .818.442.818.942 0 .317-.168.717-.5 1.317z"/>
            </svg>
            Login with Telegram
          </button>

          {/* Info */}
          <div className="text-sm text-gray-600 space-y-2">
            <p>Click the button to open Telegram</p>
            <p className="text-xs">You&apos;ll need to confirm in your Telegram app</p>
          </div>
        </div>

        {/* Debug info */}
        <div className="mt-6 text-xs text-gray-500 border-t pt-4">
          <p className="font-semibold mb-1">Configuration:</p>
          <p>Bot ID: 8299146600</p>
          <p>Bot: @thungthungbot</p>
          <p>Domain: thungthung.vercel.app</p>
        </div>
      </div>
    </div>
  );
}