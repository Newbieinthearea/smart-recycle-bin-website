'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { TelegramUser } from '../components/TelegramLogin';

declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

export default function LoginPage() {
  const router = useRouter();
  useEffect(() => {
    // Check if already logged in
    const existingSession = localStorage.getItem('user_session');
    if (existingSession) {
      router.push('/');
      return;
    }

    // Set up the Telegram callback function
    window.onTelegramAuth = (user: TelegramUser) => {
      console.log('✅ Telegram login successful!', user);
      
      // Save to localStorage
      localStorage.setItem('user_session', JSON.stringify(user));
      
      // Redirect to dashboard
      router.push('/');
    };

    // Load Telegram widget script
    if (!document.getElementById('telegram-widget-script')) {
      const script = document.createElement('script');
      script.id = 'telegram-widget-script';
      script.src = 'https://telegram.org/js/telegram-widget.js?22';
      script.async = true;
      script.setAttribute('data-telegram-login', 'thungthungbot');
      script.setAttribute('data-size', 'large');
      script.setAttribute('data-onauth', 'onTelegramAuth(user)');
      script.setAttribute('data-request-access', 'write');

      const container = document.getElementById('telegram-login-widget');
      if (container) {
        container.appendChild(script);
      }
    }

    return () => {
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6">Login with Telegram</h1>
        
        <p className="text-gray-600 mb-6">
          Click the button below and authorize with your Telegram account
        </p>

        {/* Telegram Widget Container */}
        <div id="telegram-login-widget" className="flex justify-center mb-6"></div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
          <p className="text-sm text-gray-700 font-semibold mb-2">How to login:</p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Click the Telegram button above</li>
            <li>A popup will open asking you to login to Telegram</li>
            <li>Login with your Telegram account (username/phone)</li>
            <li>Click &quot;Accept&quot; to authorize</li>
            <li>You&apos;ll be logged in automatically</li>
          </ol>
        </div>

        {/* Debug info */}
        <div className="mt-6 text-xs text-gray-500 border-t pt-4">
          <p className="font-semibold mb-1">Configuration:</p>
          <p>Bot: @thungthungbot</p>
          <p>Domain: thungthung.vercel.app</p>
        </div>
      </div>
    </div>
  );
}