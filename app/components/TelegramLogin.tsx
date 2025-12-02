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
    if (!containerRef.current) return;

    const script = document.createElement('script');
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-userpic', 'false');
    script.async = true;

    // 3. No casting needed! TypeScript now knows this is valid.
    window.onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };
    
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    containerRef.current.innerHTML = ''; 
    containerRef.current.appendChild(script);

    // Cleanup: Remove the function from window when component unmounts
    return () => {
      if (window.onTelegramAuth) {
        delete window.onTelegramAuth;
      }
    };
  }, [botName, onAuth]);

  return <div ref={containerRef} className="mt-6 flex justify-center" />;
}