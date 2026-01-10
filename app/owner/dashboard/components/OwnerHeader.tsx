"use client";
import Link from "next/link";
import { DictionaryContent, Language } from "@/lib/dictionary";

// ১. প্রপস ইন্টারফেস আপডেট (any সরানো হয়েছে)
interface HeaderProps {
  t: DictionaryContent;
  lang: Language;
  setLang: (l: Language) => void;
  selectedMonth: keyof DictionaryContent; // টাইপ আপডেট
  setSelectedMonth: (m: keyof DictionaryContent) => void; // any থেকে keyof DictionaryContent
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  handleLogout: () => void;
  monthList: (keyof DictionaryContent)[]; // string[] থেকে নির্দিষ্ট কী অ্যারে
}

export default function OwnerHeader({ 
  t, 
  lang, 
  setLang, 
  selectedMonth, 
  setSelectedMonth, 
  selectedYear, 
  setSelectedYear, 
  handleLogout, 
  monthList 
}: HeaderProps) {
  
  return (
    <header className="bg-white/80 backdrop-blur-xl p-8 rounded-[45px] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 border border-white sticky top-4 z-[100] no-print">
      <div className="flex items-center gap-6">
        <Link href="/" className="relative group">
          <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[25px] flex items-center justify-center text-white font-black text-2xl shadow-xl italic rotate-3 group-hover:rotate-0 transition-all duration-500">
            SM
          </div>
        </Link>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-slate-800 italic leading-none">{t.ownerPanel}</h1>
          <p className="text-blue-600 font-bold text-[10px] tracking-[0.4em] uppercase mt-2 opacity-70 italic">Sami & Mahi Tower</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* ২. মাস ও বছর সিলেক্টর (টাইপ সেফ) */}
        <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200 shadow-inner">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value as keyof DictionaryContent)} 
            className="bg-transparent font-black text-xs text-blue-700 px-3 outline-none cursor-pointer"
          >
            {monthList.map(m => (
              <option key={m} value={m}>
                {t[m]} {/* এখানে আর (t as any) লাগবে না */}
              </option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))} 
            className="bg-transparent font-black text-xs text-blue-700 px-3 outline-none border-l border-slate-200 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* ৩. বাটনসমূহ */}
        <button 
          onClick={() => window.print()} 
          className="bg-blue-600 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all"
        >
          🖨️ {t.printReport}
        </button>
        
        <button 
          onClick={() => setLang(lang === "en" ? "bn" : "en")} 
          className="bg-slate-900 text-white px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
        >
          {lang === "en" ? "বাংলা" : "English"}
        </button>
        
        <button 
          onClick={handleLogout} 
          className="px-8 py-3.5 bg-red-600 text-white rounded-full text-[10px] font-black uppercase shadow-xl hover:bg-red-700 transition-all"
        >
          Logout
        </button>
      </div>
    </header>
  );
}