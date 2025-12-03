'use client';

import { useEffect, useRef } from 'react';

// 1. Define the User Type
export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

// 2. Extend the global Window interface
// This tells TypeScript that 'onTelegramAuth' is a valid property of window
declare global {
  interface Window {
    onTelegramAuth?: (user: TelegramUser) => void;
  }
}

interface Props {
  botName: string;
  onAuth: (user: TelegramUser) => void;
}

export default function TelegramLogin({ botName, onAuth }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !botName) return;

    // Create global callback function first
    window.onTelegramAuth = (user: TelegramUser) => {
      console.log('🎯 Telegram widget callback triggered:', user);
      onAuth(user);
    };

    // Clear container and create script element
    containerRef.current.innerHTML = '';
    
    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'true');
    script.async = true;
    
    // Add error handling
    script.onerror = () => {
      console.error('❌ Failed to load Telegram widget script');
    };
    
    script.onload = () => {
      console.log('✅ Telegram widget script loaded successfully');
    };

    containerRef.current.appendChild(script);

    // Cleanup function
    return () => {
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [botName, onAuth]);

  return (
    <div className="space-y-4">
      <div ref={containerRef} className="flex justify-center" />
      
      {/* Fallback manual login button */}
      <div className="text-center">
        <a
          href={`https://oauth.telegram.org/auth?bot_id=${botName}&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}&return_to=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}`}
          className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-medium py-2 px-4 rounded-lg transition duration-200"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.694 0M10.154 15.652L9.62 21.056c.386 0 .558-.17.755-.372l1.812-1.783 3.754 2.82c.69.39 1.176.19 1.346-.64l2.435-11.66c.25-1.127-.417-1.574-1.15-1.28L3.13 13.918c-1.11.453-1.103 1.08-.202 1.36l4.28 1.36 9.924-6.39c.47-.318.9.145.545.47l-8.523 7.924"/>
          </svg>
          Login with Telegram
        </a>
        <p className="text-xs text-gray-400 mt-2">Click if widget doesn't load</p>
      </div>
    </div>
  );
}