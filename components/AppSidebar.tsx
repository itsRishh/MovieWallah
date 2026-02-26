"use client";

import { Home, Compass, BookmarkCheck, Sparkles, User, LogOut, Eye } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useEffect, useState } from "react";

const navItems = [
  { id: "home", title: "Home", icon: Home },
  { id: "explore", title: "Explore", icon: Compass },
  { id: "watchlist", title: "Watchlist", icon: BookmarkCheck },
  { id: "watched", title: "Watched", icon: Eye },
  { id: "recommends", title: "Recommends", icon: Sparkles },
  { id: "profile", title: "Profile", icon: User },
];



export function AppSidebar({
  activeItem, 
  onItemClick 
}: { 
  activeItem: string; 
  onItemClick: (id: string) => void; 
}) {
  const [userName, setUserName] = useState<string>("Guest User");
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const getUser = async () => {
      try {
        const session = await authClient.getSession();
        if (session?.data?.user) {
          setUserName(session.data.user.name || "Guest User");
          setUserEmail(session.data.user.email || "");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getUser();
  }, []);

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-gray-200 bg-white shadow-xl">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-gray-200">
        <h1 className="text-xl font-black tracking-tighter text-black">Filmboard</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-black text-white shadow-lg"
                  : "text-gray-600 hover:bg-gray-50 hover:shadow-md"
              }`}
            >
              <item.icon className="h-[18px] w-[18px]" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="border-t border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 shadow-md">
            <User className="h-4 w-4 text-black" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black">{userName}</p>
            <p className="text-xs text-gray-500">{userEmail || "Premium"}</p>
          </div>

        </div>
        <button
          onClick={async () => {
            await authClient.signOut();
            window.location.href = "/";
          }}
          className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-black"
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
