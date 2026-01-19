"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Settings, LogOut, Moon, Sun, LayoutDashboard } from "lucide-react"; // 👈 Added LayoutDashboard
import { useTheme } from "next-themes";

interface UserMenuProps {
  user: {
    name?: string | null;
    image?: string | null;
    email?: string | null;
    role?: string; // 👈 Added role to interface
  };
}

export default function UserMenu({ user: initialUser }: UserMenuProps) {

  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // PREFER live session data (which has the role), fallback to initial server data
  const user = session?.user || initialUser;

  const avatarUrl = user.image || `https://ui-avatars.com/api/?name=${user.name || "User"}&background=random`;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-xl transition"
      >
        <div className="hidden md:block text-right">
          <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{user.name || "Eco Hero"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Level 1 Recycler</p>
        </div>
        <Image
          src={avatarUrl}
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full border-2 border-green-100 dark:border-green-800 object-cover"
          unoptimized
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-green-100 dark:border-slate-700 z-20 py-2 overflow-hidden">
            
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 mb-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">Signed in as</p>
              <p className="text-sm font-bold truncate dark:text-gray-200">{user.email}</p>
              {/* Badge for Admin */}
              {user.role === "ADMIN" && (
                <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full font-bold">
                  ADMINISTRATOR
                </span>
              )}
            </div>

            {/* 👇 ADMIN DASHBOARD LINK (Only for Admins) */}
            {user.role === "ADMIN" && (
              <Link 
                href="/admin/dashboard" 
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition border-b border-gray-100 dark:border-slate-700"
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
              </Link>
            )}

            {/* Dark Mode Toggle */}
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

            {/* Edit Profile */}
            <Link 
              href="/profile" 
              className="flex items-center gap-2 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-slate-700 transition"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" /> Edit Profile
            </Link>

            {/* Sign Out */}
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