'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Define the global callback function that Telegram looks for
    // This matches the <script type="text/javascript"> part of your snippet
    // @ts-expect-error: We are adding a custom function to the window object
    window.onTelegramAuth = (user) => {
      alert('Logged in as ' + user.first_name); // Your alert test
      console.log(user);
      
      // Save data and redirect
      localStorage.setItem('user_session', JSON.stringify(user));
      router.push('/');
    };

    // 2. Create the script tag
    // This matches the <script async src="..."> part
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;

    // 3. Set the attributes exactly as you have them
    script.setAttribute('data-telegram-login', 'thungthungbot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    // 4. Add it to the page
    // We add it to a specific div with id="telegram-login-container"
    const container = document.getElementById('telegram-login-container');
    if (container) {
      container.innerHTML = ''; // Clean up any old buttons
      container.appendChild(script);
    }

    // Cleanup when leaving the page
    return () => {
      // @ts-expect-error: Cleanup
      delete window.onTelegramAuth;
    };
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-gray-800">Smart Recycle Bin</h1>
        <p className="text-gray-500 mt-4 mb-6">Login to track your recycling score</p>
        
        {/* The script will inject the button INSIDE this div */}
        <div id="telegram-login-container" className="flex justify-center" />
      </div>
    </div>
  );
}