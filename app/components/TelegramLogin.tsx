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
  botId: string;  // Now using bot ID instead of bot name
  onAuth: (user: TelegramUser) => void;
}

export default function TelegramLogin({ botId, onAuth }: Props) {
  // Create the direct OAuth URL using bot ID
  const telegramAuthUrl = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}&return_to=${typeof window !== 'undefined' ? encodeURIComponent(window.location.href) : ''}&request_access=write`;

  return (
    <div className="text-center">
      <a
        href={telegramAuthUrl}
        className="inline-flex items-center gap-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold py-3 px-6 rounded-xl transition duration-200 text-lg"
      >
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.694 0M10.154 15.652L9.62 21.056c.386 0 .558-.17.755-.372l1.812-1.783 3.754 2.82c.69.39 1.176.19 1.346-.64l2.435-11.66c.25-1.127-.417-1.574-1.15-1.28L3.13 13.918c-1.11.453-1.103 1.08-.202 1.36l4.28 1.36 9.924-6.39c.47-.318.9.145.545.47l-8.523 7.924"/>
        </svg>
        Login with Telegram
      </a>
      <p className="text-xs text-gray-500 mt-3">
        Secure authentication via Telegram OAuth
      </p>
    </div>
  );
}