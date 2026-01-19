"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; 
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userPic, setUserPic] = useState<string | undefined>(undefined);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const role = Cookies.get("user-role")?.toLowerCase();
    const id = Cookies.get("user-id");
    const name = Cookies.get("user-name");
    const pic = Cookies.get("user-pic");
    
    setUserRole(role);
    setUserId(id);
    setUserName(name);
    setUserPic(pic);
  }, [pathname, isMenuOpen]); // মেনু ওপেন হলেও একবার রিফ্রেশ করবে ডাটা

  if (!userRole) return null;

  const managerMenu = [
    { label: "ভাড়া", icon: "📅", id: "rent" },
    { label: "ভাড়াটিয়া", icon: "👤", id: "tenant" },
    { label: "কর্মচারী", icon: "👥", id: "staff" },
    { label: "খরচ", icon: "💸", id: "expense" },
    { label: "ম্যাপ", icon: "🗺️", id: "map" },
    { label: "নোটিশ", icon: "📣", id: "notice" },
    { label: "অভিযোগ", icon: "🚨", id: "complaint" },
    { label: "টাকা", icon: "💰", id: "handover" },
  ];

  const ownerMenu = [
    { label: "লেনদেন", icon: "📒", id: "ledger" },
    { label: "টিম", icon: "👥", id: "staff" },
    { label: "গ্রাফ", icon: "📈", id: "charts" },
    { label: "অভিযোগ", icon: "🚨", id: "complaints" },
    { label: "মানি", icon: "💰", id: "handover" },
    { label: "অডিট", icon: "📜", id: "audit" },
  ];

  const tenantMenu = [
    { label: "প্রোফাইল", icon: "👤", id: "profile" },
    { label: "ইতিহাস", icon: "💸", id: "history" },
    { label: "নোটিশ", icon: "📣", id: "notices" },
    { label: "অভিযোগ", icon: "📢", id: "complaint-form" },
  ];

  const currentMenu = userRole === 'owner' ? ownerMenu : userRole === 'tenant' ? tenantMenu : managerMenu;

  const handleMenuClick = (tabId: string) => {
    const isDashboard = pathname === "/manager/dashboard" || pathname === "/owner/dashboard" || pathname.includes("/tenant/dashboard");
    
    if (isDashboard) {
      window.dispatchEvent(new CustomEvent("changeTab", { detail: tabId }));
    } else {
      let target = "/login";
      if (userRole === 'manager') target = "/manager/dashboard";
      else if (userRole === 'owner') target = "/owner/dashboard";
      else if (userRole === 'tenant') target = `/tenant/dashboard/${userId}`;
      router.push(target);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("changeTab", { detail: tabId }));
      }, 500);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* মেইন বটম বার */}
      <div className="md:hidden fixed bottom-6 inset-x-6 z-[1000] no-print">
        <div className="bg-white/80 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-[35px] p-2 flex justify-between items-center px-6">
          <Link href="/" className={`p-3 text-2xl transition-all ${pathname === "/" ? "opacity-100 scale-110" : "opacity-30 grayscale"}`}>🏠</Link>
          <Link href={userRole === 'manager' ? "/manager/dashboard" : userRole === 'owner' ? "/owner/dashboard" : `/tenant/dashboard/${userId}`} className={`p-3 text-2xl transition-all ${pathname.includes("dashboard") ? "opacity-100 scale-110" : "opacity-30 grayscale"}`}>📊</Link>
          <button onClick={() => setIsMenuOpen(true)} className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[22px] flex items-center justify-center text-white shadow-lg shadow-blue-200 active:scale-90 transition-transform">
            <span className="text-2xl">☰</span>
          </button>
        </div>
      </div>

      {/* সোয়াইপ-アップ ড্রয়ার (Fancy Bottom Sheet) */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[1100] md:hidden" />
            
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 30, stiffness: 300 }} 
              className="fixed bottom-0 inset-x-0 bg-white rounded-t-[60px] z-[1200] pb-10 shadow-2xl md:hidden border-t border-white"
            >
              {/* ড্র্যাগ ইন্ডিকেটর */}
              <div className="w-12 h-1.5 bg-slate-200 mx-auto rounded-full mt-4 mb-6"></div>
              
              {/* --- ফ্যান্সি হেডার সেকশন (New Update) --- */}
              <div className="px-10 mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-[22px] bg-gradient-to-tr from-blue-600 to-indigo-800 p-1 shadow-xl">
                      <div className="w-full h-full rounded-[18px] overflow-hidden bg-white flex items-center justify-center">
                        {userPic ? (
                          <img src={userPic} alt="User" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-2xl font-black text-blue-600 italic">{(userName || userRole).charAt(0)}</span>
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                      {userRole === 'owner' ? 'মালিক' : userRole === 'manager' ? 'ম্যানেজার' : 'ভাড়াটিয়া'}
                    </p>
                    <h3 className="text-xl font-black text-slate-800 tracking-tighter italic leading-none">{userName || 'Welcome'}</h3>
                    <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                       <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                       <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest italic">Verified Account</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 text-lg">✕</button>
              </div>

              {/* মেনু আইটেম গ্রিড */}
              <div className="px-8 grid grid-cols-4 gap-y-8 gap-x-4">
                {currentMenu.map((item) => (
                  <button key={item.id} onClick={() => handleMenuClick(item.id)} className="flex flex-col items-center gap-2 group active:scale-90 transition-all">
                    <div className="w-14 h-14 bg-slate-50/80 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-slate-100 group-active:bg-blue-600 group-active:text-white transition-all">
                      {item.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500 text-center leading-tight">{item.label}</span>
                  </button>
                ))}
              </div>

              {/* লগআউট বাটন (Fancy Style) */}
              <div className="px-10 mt-10">
                <button 
                  onClick={() => {
                    Cookies.remove("user-role"); Cookies.remove("user-id"); Cookies.remove("user-name");
                    router.push("/login"); setIsMenuOpen(false);
                  }}
                  className="w-full py-4 bg-rose-50 text-rose-600 border border-rose-100 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-sm flex items-center justify-center gap-2 active:bg-rose-600 active:text-white transition-all"
                >
                  🚪 Logout Session
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}