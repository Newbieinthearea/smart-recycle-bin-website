'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { TelegramUser } from '../components/TelegramLogin';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Check if already logged in
    const existingSession = localStorage.getItem('user_session');
    if (existingSession) {
      router.push('/');
      return;
    }

    // Define the callback function BEFORE loading the script
    window.onTelegramAuth = (user: TelegramUser) => {
      console.log('✅ Telegram callback triggered!', user);
      
      // Save to localStorage
      localStorage.setItem('user_session', JSON.stringify(user));
      
      // Redirect to dashboard
      router.push('/');
    };

    // Only load the script once
    if (!scriptLoadedRef.current && !document.getElementById('telegram-widget-script')) {
      const script = document.createElement('script');
      script.id = 'telegram-widget-script';
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', 'thungthungbot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');

      const container = document.getElementById('telegram-login-container');
      if (container) {
        container.appendChild(script);
        scriptLoadedRef.current = true;
      }
    }

    return () => {
      // Cleanup
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Login with Telegram</h1>
        
        {/* Widget container */}
        <div id="telegram-login-container" className="flex justify-center mb-4"></div>
        
        {/* Manual fallback */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Widget not loading?</p>
          <a
            href={`https://oauth.telegram.org/auth?bot_id=8299146600&origin=${encodeURIComponent('https://thungthung.vercel.app')}&return_to=${encodeURIComponent('https://thungthung.vercel.app/login')}&request_access=write`}
            className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
          >
            Open Telegram Login
          </a>
        </div>

        {/* Debug info */}
        <div className="mt-6 text-xs text-gray-500">
          <p>Bot: thungthungbot</p>
          <p>Domain: thungthung.vercel.app</p>
        </div>
      </div>
    </div>
  );
}