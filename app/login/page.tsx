"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dictionary, type Language } from "@/lib/dictionary";

export default function LoginPage() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  const router = useRouter();
  
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (userId === "owner" && password === "123") {
      router.push("/dashboard/owner");
    } else if (userId === "manager" && password === "123") {
      router.push("/dashboard/manager");
    } else if (userId.startsWith("T") && password === "123") {
      router.push("/dashboard/tenant");
    } else {
      alert(t.errorMsg);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfe] p-6 relative">
      
      {/* ১. ক্লোজ বাটন */}
      <Link 
        href="/" 
        className="absolute top-8 left-8 flex items-center gap-2 group transition-all"
      >
        <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm group-hover:bg-red-50 group-hover:border-red-200 group-hover:text-red-600 transition-all">
          <span className="text-xl font-light">✕</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">
          {t.close}
        </span>
      </Link>

      {/* ২. ল্যাঙ্গুয়েজ সুইচ */}
      <div className="absolute top-8 right-8">
        <button 
          onClick={() => setLang(lang === "en" ? "bn" : "en")}
          className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-900 hover:text-white transition-all"
        >
          {lang === "en" ? "বাংলা" : "English"}
        </button>
      </div>

      {/* ৩. লগইন কার্ড */}
      <div className="bg-white p-12 rounded-[60px] shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-700 to-indigo-900 rounded-3xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-2xl shadow-blue-200 italic tracking-tighter">SM</div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{t.loginTitle}</h2>
          <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mt-4">{t.title}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* ইউজার আইডি */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-2 block tracking-[0.2em]">{t.userId}</label>
            <input 
              type="text" 
              className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[30px] focus:border-blue-600 focus:bg-white outline-none font-bold transition-all"
              placeholder={t.idPlaceholder}
              onChange={(e) => setUserId(e.target.value)}
              required
            />
          </div>

          {/* পাসওয়ার্ড */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-2 block tracking-[0.2em]">{t.password}</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[30px] focus:border-blue-600 focus:bg-white outline-none font-bold transition-all pr-16"
                placeholder={t.passPlaceholder}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {/* পাসওয়ার্ড দেখুন বাটন */}
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
              >
                {showPassword ? t.hide : t.show}
              </button>
            </div>
            
            {/* পাসওয়ার্ড ভুলে গেছেন লিঙ্ক */}
            <div className="mt-4 ml-6">
              <Link href="/forget-password" className="text-[10px] font-bold text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
                {t.forgetPass}
              </Link>
            </div>
          </div>

          <button className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
            {t.loginBtn}
          </button>
        </form>
      </div>
    </div>
  );
}