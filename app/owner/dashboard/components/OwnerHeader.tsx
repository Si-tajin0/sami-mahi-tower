"use client";
import Link from "next/link";
import { DictionaryContent, Language } from "@/lib/dictionary";

interface HeaderProps {
  t: DictionaryContent;
  lang: Language;
  setLang: (l: Language) => void;
  selectedMonth: keyof DictionaryContent;
  setSelectedMonth: (m: keyof DictionaryContent) => void;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  handleLogout: () => void;
  monthList: (keyof DictionaryContent)[];
}

export default function OwnerHeader({ 
  t, lang, setLang, selectedMonth, setSelectedMonth, selectedYear, setSelectedYear, handleLogout, monthList 
}: HeaderProps) {
  
  return (
    <header className="bg-white/80 backdrop-blur-xl p-5 lg:p-8 rounded-[30px] lg:rounded-[45px] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-6 border border-white sticky top-4 z-[100] no-print w-full">
      
      {/* বাম পাশ: লোগো এবং নাম */}
      <div className="flex items-center gap-5 w-full lg:w-auto justify-start">
        <Link href="/" className="relative group shrink-0">
          <div className="w-14 h-14 lg:w-16 lg:h-16 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-[20px] lg:rounded-[25px] flex items-center justify-center text-white font-black text-xl lg:text-2xl shadow-xl italic rotate-3 group-hover:rotate-0 transition-all duration-500">
            SM
          </div>
        </Link>
        <div className="flex flex-col">
          <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tighter text-slate-800 italic leading-none">
            {t.ownerPanel}
          </h1>
          <p className="text-blue-600 font-bold text-[9px] lg:text-[10px] tracking-[0.4em] uppercase mt-1.5 opacity-70 italic">
            Sami & Mahi Tower
          </p>
        </div>
      </div>

      {/* ডান পাশ: সব কন্ট্রোল বাটন */}
      <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 lg:gap-4 w-full lg:w-auto">
        
        {/* মাস ও বছর সিলেক্টর */}
        <div className="flex bg-slate-100 p-1.5 lg:p-2 rounded-2xl border border-slate-200 shadow-inner shrink-0">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value as keyof DictionaryContent)} 
            className="bg-transparent font-black text-[10px] lg:text-xs text-blue-700 px-2 lg:px-3 outline-none cursor-pointer"
          >
            {monthList.map(m => (
              <option key={m} value={m}>{t[m]}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))} 
            className="bg-transparent font-black text-[10px] lg:text-xs text-blue-700 px-2 lg:px-3 outline-none border-l border-slate-200 cursor-pointer"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* বাটন গ্রুপ */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <button 
            onClick={() => window.print()} 
            className="bg-blue-600 text-white px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all whitespace-nowrap"
          >
            🖨️ {t.printReport}
          </button>
          
          <button 
            onClick={() => setLang(lang === "en" ? "bn" : "en")} 
            className="bg-slate-900 text-white px-4 lg:px-8 py-2.5 lg:py-3.5 rounded-full text-[9px] lg:text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl whitespace-nowrap"
          >
            {lang === "en" ? "বাংলা" : "English"}
          </button>
          
          <button 
            onClick={handleLogout} 
            className="px-4 lg:px-8 py-2.5 lg:py-3.5 bg-red-600 text-white rounded-full text-[9px] lg:text-[10px] font-black uppercase shadow-xl hover:bg-red-700 transition-all whitespace-nowrap"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}