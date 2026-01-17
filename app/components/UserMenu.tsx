"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react"; // 👈 Import useSession
import Image from "next/image";
import Link from "next/link";
import { Settings, LogOut, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes"; // We will add this later for Dark Mode
// Keep the props for initial load (avoids flickering)
interface UserMenuProps {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
  };
}

export default function UserMenu({ user: initialUser }: UserMenuProps) {
  const { data: session } = useSession(); // 👈 Get live session data
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // PREFER live session data, fallback to initial server data
  const user = session?.user || initialUser;

  const avatarUrl = user.image || `https://ui-avatars.com/api/?name=${user.name || "User"}&background=random`;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-xl transition"
      >
        <div className="hidden md:block text-right">
          {/* 👇 This will now update instantly */}
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name || "Eco Hero"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Level 1 Recycler</p>
        </div>
        <Image
          src={avatarUrl}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full border-2 border-green-100 dark:border-green-800"
          unoptimized
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-green-100 dark:border-slate-700 z-20 py-2">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
              <p className="text-sm font-bold truncate dark:text-gray-200">{user.email}</p>
            </div>
            {/* DARK MODE TOGGLE */}
            <button
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-slate-700 transition"
            >
              {theme === "dark" ? (
                <><Sun className="w-4 h-4" /> Light Mode</>
              ) : (
                <><Moon className="w-4 h-4" /> Dark Mode</>
              )}
            </button>
            <Link 
              href="/settings" 
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-slate-700 transition"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition text-left"
            >
              <LogOut className="w-4 h-4" /> Log out
            </button>
          </div>
        </>
      )}
    </div>
  );
}