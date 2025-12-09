// components/TelegramLogin.tsx (Simplified version)
'use client';

import { useEffect } from 'react';

export interface TelegramUser {
  id: number;
  first_name: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

declare global {
  interface Window {
    handleTelegramAuth?: (user: TelegramUser) => void;
  }
}

interface TelegramLoginProps {
  botName: string;  // Only accept botName
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
  requestAccess = 'write'
}: TelegramLoginProps) {
  useEffect(() => {
    // Clean up any existing scripts
    const existingScript = document.getElementById('telegram-login-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Create and load the Telegram widget script
    const script = document.createElement('script');
    script.id = 'telegram-login-script';
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', buttonSize);
    script.setAttribute('data-radius', cornerRadius.toString());
    script.setAttribute('data-request-access', requestAccess);
    script.setAttribute('data-userpic', 'true');
    
    // Set the auth callback
    script.setAttribute('data-onauth', 'window.handleTelegramAuth(user)');
    
    // Define the global callback function
    window.handleTelegramAuth = onAuth;

    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window.handleTelegramAuth;
    };
  }, [botName, onAuth, buttonSize, cornerRadius, requestAccess]);

  return (
    <div className="flex justify-center my-4">
      <div 
        id="telegram-login-button"
        className="telegram-login-button"
      />
    </div>
  );
}