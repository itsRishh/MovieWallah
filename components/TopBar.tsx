"use client";

import { Search, Bell, User } from "lucide-react";
import { useState } from "react";

const titles = {
  home: "Home",
  explore: "Explore",
  watchlist: "Watchlist",
  recommends: "Recommends",
  profile: "Profile",
};

export function TopBar({ activeItem }: { activeItem: string }) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Handle search functionality here
      console.log("Search:", query);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-md">
      <h2 className="text-lg font-bold text-black">{titles[activeItem as keyof typeof titles] || "Dashboard"}</h2>

      <div className="flex items-center gap-4">
        

        {/* Notification */}
        <button className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 hover:shadow-md transition-all">
          <Bell className="h-[18px] w-[18px]" />
        </button>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 shadow-md border border-gray-200">
          <User className="h-4 w-4 text-black" />
        </div>
      </div>
    </header>
  );
}
