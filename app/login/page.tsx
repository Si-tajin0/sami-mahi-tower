"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { dictionary, type Language } from "@/lib/dictionary";
import Cookies from "js-cookie";
import FancyToast from "@/app/components/FancyToast"; // টোস্ট ইমপোর্ট

export default function LoginPage() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  const router = useRouter();
  
  const [userId, setUserId] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  // টোস্ট স্টেট
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const showNotification = (msg: string, type: "success" | "error") => {
    setToast({ show: true, message: msg, type });
  };

  const handleLogin = async (e: React.FormEvent) => {
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
        showNotification(t.loginSuccess || "Success!", "success");
        
        // কুকি সেট করা
        Cookies.set("user-role", result.role, { expires: 1 });
        if (result.id) Cookies.set("user-id", result.id, { expires: 1 });

        // ১ সেকেন্ড পর ড্যাশবোর্ডে পাঠানো (টোস্ট দেখার জন্য সময় দেওয়া)
        setTimeout(() => {
          if (result.role === "owner") router.push("/owner/dashboard");
          else if (result.role === "manager") router.push("/manager/dashboard");
          else if (result.role === "tenant") router.push(`/tenant/dashboard/${result.id}`); 
        }, 1000);

      } else {
        showNotification(result.message || t.errorMsg, "error");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(error.message);
      showNotification("সার্ভারে সমস্যা হচ্ছে!", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfe] p-6 relative selection:bg-blue-100 font-sans">
      
      {/* ক্লোজ বাটন */}
      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 group transition-all">
        <div className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm group-hover:bg-red-50 group-hover:border-red-200 group-hover:text-red-600 transition-all">
          <span className="text-xl font-light">✕</span>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-slate-900 transition-colors">{t.close}</span>
      </Link>

      {/* ল্যাঙ্গুয়েজ সুইচ */}
      <div className="absolute top-8 right-8">
        <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-900 hover:text-white transition-all">
          {lang === "en" ? "বাংলা" : "English"}
        </button>
      </div>

      <div className="bg-white p-12 rounded-[60px] shadow-2xl w-full max-w-md border border-slate-100 relative overflow-hidden">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-700 to-indigo-900 rounded-3xl flex items-center justify-center text-white font-black text-2xl mx-auto mb-6 shadow-2xl shadow-blue-200 italic tracking-tighter">SM</div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter leading-none">{t.loginTitle}</h2>
          <p className="text-[10px] font-bold text-blue-600 tracking-widest uppercase mt-4">{t.title}</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-2 block tracking-[0.2em]">{t.userId}</label>
            <input type="text" className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[30px] focus:border-blue-600 focus:bg-white outline-none font-bold transition-all text-sm" placeholder={t.idPlaceholder} value={userId} onChange={(e) => setUserId(e.target.value)} required />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-slate-400 ml-6 mb-2 block tracking-[0.2em]">{t.password}</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[30px] focus:border-blue-600 focus:bg-white outline-none font-bold transition-all pr-16 text-sm" placeholder={t.passPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
                {showPassword ? t.hide : t.show}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50">
            {loading ? "..." : t.loginBtn}
          </button>
        </form>
      </div>

      {/* ৩. ফ্যান্সি টোস্ট কম্পোনেন্ট কল */}
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