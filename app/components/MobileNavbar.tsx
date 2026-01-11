// components/MobileNavbar.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function MobileNavbar() {
  const pathname = usePathname();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setUserRole(Cookies.get("user-role")?.toLowerCase());
    setUserId(Cookies.get("user-id"));
  }, []);

  if (!userRole) return null; // গেস্ট হলে দেখাবে না

  // রোল অনুযায়ী মেনু আইটেম সেট করা
  const menuItems = {
    manager: [
      { label: "Home", icon: "🏠", path: "/" },
      { label: "Rent", icon: "📅", path: "/manager/dashboard" },
      { label: "Staff", icon: "👥", path: "/manager/dashboard" }, // ট্যাব হিসেবে ড্যাশবোর্ডেই থাকে
      { label: "Money", icon: "💰", path: "/manager/dashboard" },
    ],
    owner: [
      { label: "Home", icon: "🏠", path: "/" },
      { label: "Summary", icon: "📊", path: "/owner/dashboard" },
      { label: "Ledger", icon: "📒", path: "/owner/dashboard" },
      { label: "Complaints", icon: "🚨", path: "/owner/dashboard" },
    ],
    tenant: [
      { label: "Home", icon: "🏠", path: "/" },
      { label: "Dashboard", icon: "👤", path: `/tenant/dashboard/${userId}` },
      { label: "Payments", icon: "💸", path: `/tenant/dashboard/${userId}` },
      { label: "Notices", icon: "📣", path: `/tenant/dashboard/${userId}` },
    ],
  };

  const currentMenu = menuItems[userRole as keyof typeof menuItems] || [];

  return (
    <div className="md:hidden fixed bottom-6 inset-x-6 z-[1000] no-print">
      <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-[35px] p-2 flex justify-around items-center">
        {currentMenu.map((item, idx) => {
          const isActive = pathname === item.path;
          return (
            <Link key={idx} href={item.path} className="relative group flex flex-col items-center p-2 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-all duration-500 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-4' : 'text-slate-400'}`}>
                {item.icon}
              </div>
              <span className={`text-[8px] font-black uppercase tracking-widest mt-1 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0 h-0'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="absolute -bottom-1 w-1 h-1 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}