"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dictionary, type Language } from "@/lib/dictionary";
import Cookies from "js-cookie";
import FancyToast from "@/app/components/FancyToast";

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
  const [shake, setShake] = useState(false);

  // টোস্ট স্টেট
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  useEffect(() => {
    setMounted(true);
  }, []);

  const showNotification = (msg: string, type: "success" | "error") => {
    setToast({ show: true, message: msg, type });
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, password }),
      });
      
      const result = await res.json();

      if (result.success) {
        showNotification(t.loginSuccess || (lang === 'bn' ? "লগইন সফল!" : "Login Success!"), "success");
        
        // ১. কুকি সেট করা (প্রোফাইল পিকচারসহ)
        Cookies.set("user-role", result.role, { expires: 1 });
        if (result.id) Cookies.set("user-id", result.id, { expires: 1 });
        if (result.name) Cookies.set("user-name", result.name, { expires: 1 });
        if (result.profilePic) Cookies.set("user-pic", result.profilePic, { expires: 1 }); // ছবি কুকিতে রাখা হলো

        // ড্যাশবোর্ডে পাঠানো
        setTimeout(() => {
          const role = result.role.toLowerCase();
          if (role === "owner") router.push("/owner/dashboard");
          else if (role === "manager") router.push("/manager/dashboard");
          else if (role === "tenant") router.push(`/tenant/dashboard/${result.id}`); 
          
          router.refresh(); // নেভিগেশন বার আপডেট করার জন্য
        }, 1000);

      } else {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        showNotification(result.message || t.errorMsg, "error");
      }
    } catch (error) {
      console.error("Login Error:", error);
      showNotification(lang === 'bn' ? "সার্ভারে সমস্যা হচ্ছে!" : "Server error", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#010409] p-6 relative overflow-hidden font-sans">
      
      {/* এনিমেটেড গ্লো */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-800/20 rounded-full blur-[100px] animate-pulse delay-1000"></div>

      {/* টপ নেভিগেশন */}
      <nav className="absolute top-0 inset-x-0 p-8 flex justify-between items-center z-50">
        <Link href="/" className="group flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 transition-all duration-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]">
            <span className="text-xl">🏠</span>
          </div>
          <span className="text-[10px] font-black text-blue-100/30 uppercase tracking-[0.3em] group-hover:text-blue-400 transition-colors">
             {lang === 'bn' ? 'হোমপেজ' : 'Home'}
          </span>
        </Link>
        <button 
          onClick={() => setLang(lang === "en" ? "bn" : "en")} 
          className="px-6 py-2.5 bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 rounded-xl text-[10px] font-black text-blue-100/70 uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500"
        >
          {lang === "en" ? "BN" : "EN"}
        </button>
      </nav>

      {/* মেইন কার্ড */}
      <div className={`relative w-full max-w-[480px] z-10 transition-transform duration-500 ${shake ? 'animate-shake' : ''}`}>
        <div className="absolute inset-0 bg-blue-600/10 blur-[80px] -z-10 rounded-full"></div>

        <div className="bg-blue-950/20 backdrop-blur-[80px] p-10 md:p-16 rounded-[60px] border border-blue-500/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-br from-blue-500/[0.05] via-transparent to-transparent rotate-45 pointer-events-none group-hover:top-[-50%] group-hover:left-[-50%] transition-all duration-1000"></div>

          <div className="text-center mb-12 relative z-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[30px] flex items-center justify-center text-white font-black text-3xl mx-auto mb-8 shadow-[0_0_40px_rgba(37,99,235,0.4)] italic tracking-tighter -rotate-3 group-hover:rotate-0 transition-transform duration-500">
              SM
            </div>
            <h2 className="text-4xl font-black text-white uppercase tracking-tighter leading-none italic">{t.loginTitle}</h2>
            <p className="text-[9px] font-bold text-blue-400 tracking-[0.6em] uppercase mt-4 opacity-80 italic">Premium Management Access</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-7 relative z-10">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-blue-200/30 ml-6 tracking-[0.2em]">{t.userId}</label>
              <input 
                type="text" 
                className="w-full p-5 bg-blue-900/10 border border-blue-500/20 rounded-[30px] focus:border-blue-500 focus:bg-blue-600/5 outline-none font-bold transition-all duration-300 text-blue-50 placeholder:text-blue-900 shadow-inner" 
                placeholder={t.idPlaceholder} 
                value={userId} 
                onChange={(e) => setUserId(e.target.value)} 
                required 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-6">
                <label className="text-[10px] font-black uppercase text-blue-200/30 tracking-[0.2em]">{t.password}</label>
                <button 
                  type="button"
                  onClick={() => showNotification(lang === 'bn' ? "পাসওয়ার্ড রিসেট করতে ম্যানেজারের সাথে যোগাযোগ করুন" : "Contact manager for password reset", "error")}
                  className="text-[9px] font-black uppercase text-blue-400 hover:text-blue-300 tracking-widest transition-colors italic underline underline-offset-4 decoration-blue-900"
                >
                  {lang === 'bn' ? 'ভুলে গেছেন?' : 'Forgot?'}
                </button>
              </div>
              <div className="relative group/input">
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full p-5 bg-blue-900/10 border border-blue-500/20 rounded-[30px] focus:border-blue-500 focus:bg-blue-600/5 outline-none font-bold transition-all duration-300 pr-16 text-blue-50 placeholder:text-blue-900 shadow-inner" 
                  placeholder={t.passPlaceholder} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)} 
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-400/40 uppercase tracking-widest hover:text-blue-400 transition-colors z-20"
                >
                  {showPassword ? (lang === 'bn' ? 'লুকান' : 'Hide') : (lang === 'bn' ? 'দেখুন' : 'Show')}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full relative overflow-hidden group bg-blue-600 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.4em] text-[11px] shadow-[0_15px_40px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500 disabled:opacity-50"
            >
              <div className={`flex items-center justify-center gap-3 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                {t.loginBtn} <span className="text-base group-hover:translate-x-2 transition-transform duration-300">➜</span>
              </div>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                </div>
              )}
            </button>
          </form>

          <div className="mt-12 text-center relative z-10">
             <div className="flex items-center justify-center gap-3 mb-2 opacity-20">
                <div className="h-px w-8 bg-blue-400"></div>
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-blue-400">Sami & Mahi Tower</span>
                <div className="h-px w-8 bg-blue-400"></div>
             </div>
             <p className="text-[9px] font-bold text-blue-200/20 uppercase tracking-[0.3em] italic">
               Powered by <span className="text-blue-500">Accent Solutions</span>
             </p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>

      {toast.show && (
        <FancyToast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
    </div>
  );
}