'use client';

import { useEffect, useRef } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

interface TelegramLoginProps {
  botName: string;
  onAuth: (user: TelegramUser) => void;
  buttonSize?: 'large' | 'medium' | 'small';
  cornerRadius?: number;
  requestAccess?: 'write' | 'read';
}

export default function TelegramLogin({
  botName,
  onAuth,
  buttonSize = 'large',
  cornerRadius = 10,
  requestAccess = 'write',
}: TelegramLoginProps) {
  const telegramWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Assign the callback to the global window object
    // @ts-expect-error: Telegram widget requires this specific global function
    window.onTelegramAuth = (user: TelegramUser) => {
      onAuth(user);
    };

    // 2. Create the script element
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;

    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius.toString());
    script.setAttribute('data-request-access', requestAccess);
    script.setAttribute('data-userpic', 'true');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');

    // 3. Append the script specifically to our div ref
    if (telegramWrapperRef.current) {
      telegramWrapperRef.current.innerHTML = ''; // Clear previous instances
      telegramWrapperRef.current.appendChild(script);
    }
  }, [botName, onAuth, buttonSize, cornerRadius, requestAccess]);

  return <div ref={telegramWrapperRef} className="flex justify-center my-4" />;
}