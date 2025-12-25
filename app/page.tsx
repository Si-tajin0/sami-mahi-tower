"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { dictionary, type Language } from "../lib/dictionary";

const SLIDES: string[] = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"
];

interface UnitDetails {
  floor: number;
  unit: string;
  rooms: number;
  baths: number;
  balcony: number;
  size: string;
}

export default function Home() {
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  const [selectedUnit, setSelectedUnit] = useState<UnitDetails | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const toBengaliNumber = (num: number | string): string => {
    if (lang === "en") return num.toString();
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#fcfdfe] text-slate-900 font-sans">
      {/* 1. Floating Fancy Header */}
      <header className="fixed top-4 inset-x-4 md:inset-x-12 z-[100] bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[30px] p-4 flex justify-between items-center transition-all duration-500">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-cyan-500 rounded-xl rotate-6 group-hover:rotate-12 transition-transform duration-300 shadow-lg"></div>
            <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-xl -rotate-3 group-hover:rotate-0 transition-transform duration-300 border border-white/30"></div>
            <span className="relative text-white font-black text-xl italic tracking-tighter">SM</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 leading-none tracking-tighter uppercase">{t.title}</h1>
            <p className="text-[9px] font-bold text-blue-600 tracking-widest uppercase mt-1">{t.contact}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button 
            onClick={() => setLang(lang === "en" ? "bn" : "en")} 
            className="hidden sm:block text-[10px] font-black px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest"
          >
            {lang === "en" ? "বাংলা" : "English"}
          </button>
          <Link href="/login" className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-7 py-2.5 rounded-full text-xs font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
            {t.login}
          </Link>
        </div>
      </header>

      {/* 2. Hero Slider */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
            style={{ backgroundImage: `url(${s})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#fcfdfe] flex items-center justify-center text-center px-4">
              <div className="mt-20">
                <span className="inline-block px-4 py-1.5 bg-blue-600/20 backdrop-blur-md text-white text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-6 border border-white/20">Experience Excellence</span>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter drop-shadow-2xl leading-none">{t.title}</h2>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-8 shadow-lg shadow-blue-500/50"></div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* 3. Stat Bar (Amenities) */}
      <section className="max-w-5xl mx-auto -mt-16 relative z-50 px-6">
        <div className="bg-white/90 backdrop-blur-2xl grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-[40px] shadow-2xl border border-white/50">
          {[
            {label: "Security", icon: "🛡️", val: "24/7", color: "bg-blue-50 text-blue-600"},
            {label: "Lift", icon: "🛗", val: "Modern", color: "bg-indigo-50 text-indigo-600"},
            {label: "Generator", icon: "⚡", val: "Full Backup", color: "bg-amber-50 text-amber-600"},
            {label: "Parking", icon: "🚗", val: "Reserved", color: "bg-emerald-50 text-emerald-600"}
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center p-4 rounded-3xl hover:bg-slate-50 transition-colors duration-300">
              <div className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-2xl mb-3 shadow-inner`}>
                {item.icon}
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
              <p className="text-xs font-black text-slate-800">{item.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Building Floor Exploration */}
      <section className="max-w-7xl mx-auto py-32 px-6">
        <div className="text-center mb-24">
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t.explore}</h3>
          <p className="text-blue-600 font-bold tracking-[0.3em] uppercase text-[10px]">Premium Lifestyle Awaits</p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {[6, 5, 4, 3, 2, 1, 0].map((f) => (
            <div key={f} className="group relative flex flex-col md:flex-row gap-12 items-center bg-white p-10 rounded-[60px] shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 overflow-hidden">
              <div className="absolute -right-10 -bottom-10 text-[180px] font-black text-slate-50 leading-none pointer-events-none group-hover:text-blue-50 transition-colors duration-700">{f}</div>
              
              <div className="relative flex flex-col items-center justify-center bg-slate-50 w-32 h-32 rounded-[40px] shadow-inner group-hover:from-blue-600 group-hover:to-indigo-800 group-hover:text-white transition-all duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">{t.floor}</span>
                <span className="text-5xl font-black">{f === 0 ? (lang === "bn" ? "নিচ" : "G") : toBengaliNumber(f)}</span>
              </div>

              <div className="relative flex-1 w-full text-center md:text-left">
                <h4 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter flex items-center justify-center md:justify-start gap-4">
                  {f === 0 ? t.ground : `${t.floor} ${toBengaliNumber(f)}`}
                  <span className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-12 group-hover:w-32 transition-all duration-700"></span>
                </h4>
                
                <div className="flex flex-wrap gap-5 justify-center md:justify-start">
                  {(f === 0 || f === 6 ? ["A", "B", "C"] : ["A", "B", "C", "D", "E"]).map((u) => (
                    <button 
                      key={u}
                      onClick={() => setSelectedUnit({ floor: f, unit: u, rooms: 3, baths: 2, balcony: 2, size: lang === "bn" ? "১৩৫০ বর্গফুট" : "1350 sqft" })}
                      className="group/unit relative p-6 w-32 h-32 rounded-[35px] border-2 border-slate-50 bg-white shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center hover:bg-blue-600 hover:border-blue-600 transition-all duration-300 hover:-translate-y-2"
                    >
                      <span className="font-black text-2xl text-slate-800 group-hover/unit:text-white transition-colors">{f === 0 ? "" : toBengaliNumber(f)}{u}</span>
                      <span className="text-[9px] mt-2 font-black uppercase tracking-widest text-blue-600 group-hover/unit:text-blue-100 transition-colors">{t.viewDetails}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Detailed Unit Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md transition-all">
          <div className="bg-white w-full max-w-xl rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white relative text-center">
              <button onClick={() => setSelectedUnit(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-xl">✕</button>
              <h3 className="text-4xl font-black uppercase tracking-tighter">ইউনিট {selectedUnit.floor === 0 ? "" : toBengaliNumber(selectedUnit.floor)}{selectedUnit.unit}</h3>
              <p className="opacity-70 font-bold text-[10px] uppercase tracking-widest mt-2">{t.details}</p>
            </div>
            
            <div className="p-10 space-y-8">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-5 bg-slate-50 rounded-[30px] border border-slate-100">
                  <span className="block text-2xl mb-1">🛏️</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.rooms}</p>
                  <p className="text-lg font-black text-slate-800">{toBengaliNumber(selectedUnit.rooms)}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-[30px] border border-slate-100">
                  <span className="block text-2xl mb-1">🚿</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.baths}</p>
                  <p className="text-lg font-black text-slate-800">{toBengaliNumber(selectedUnit.baths)}</p>
                </div>
                <div className="p-5 bg-slate-50 rounded-[30px] border border-slate-100">
                  <span className="block text-2xl mb-1">🌅</span>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{t.balcony}</p>
                  <p className="text-lg font-black text-slate-800">{toBengaliNumber(selectedUnit.balcony)}</p>
                </div>
              </div>
              
              <div className="p-6 bg-blue-50 rounded-[30px] flex justify-between items-center border border-blue-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📐</span>
                  <p className="text-sm font-black text-blue-900 uppercase tracking-widest">{t.size}</p>
                </div>
                <p className="text-xl font-black text-blue-700">{selectedUnit.size}</p>
              </div>
              
              <button className="w-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-6 rounded-[30px] font-black uppercase tracking-widest shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all">
                {t.apply}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Advanced Fancy Footer */}
      <footer className="bg-slate-950 pt-24 pb-12 px-6 overflow-hidden relative">
  {/* Abstract background glow */}
  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -mr-64 -mt-64"></div>
  <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 blur-[100px] rounded-full -ml-32 -mb-32"></div>

  <div className="max-w-7xl mx-auto relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
      {/* Brand Column */}
      <div className="md:col-span-1">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl italic shadow-2xl shadow-blue-500/30">
            SM
          </div>
          <h2 className="text-slate-100 font-black text-2xl uppercase tracking-tighter leading-none">
            {t.title}
          </h2>
        </div>
        <p className="text-slate-500 text-xs leading-relaxed font-medium mb-8">
          Sami & Mahi Tower offers a new standard of luxury living with modern
          architecture, high-class security, and ultimate comfort in every unit.
        </p>
        <div className="flex gap-4">
          {['FB', 'IG', 'TW', 'LN'].map((s) => (
            <div
              key={s}
              className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400 hover:bg-blue-600 hover:text-white hover:border-blue-600 cursor-pointer transition-all"
            >
              {s}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Links Column */}
      <div>
        <h4 className="text-slate-100 font-black text-[10px] uppercase tracking-[0.3em] mb-8">
          Quick Links
        </h4>
        <ul className="space-y-4">
          {['Home', 'Available Units', 'Amenities', 'Floor Plan'].map((link) => (
            <li key={link}>
              <a href="#" className="text-slate-500 text-xs font-bold hover:text-blue-500 transition-colors uppercase tracking-widest">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Information Column (Login links removed) */}
      <div>
        <h4 className="text-slate-100 font-black text-[10px] uppercase tracking-[0.3em] mb-8">
          Information
        </h4>
        <ul className="space-y-4">
          {['About Us', 'Careers', 'Help Center', 'Terms of Service'].map((link) => (
            <li key={link}>
              <a href="#" className="text-slate-500 text-xs font-bold hover:text-blue-500 transition-colors uppercase tracking-widest">
                {link}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact Column */}
      <div className="bg-slate-900/50 p-8 rounded-[40px] border border-slate-800 backdrop-blur-sm">
        <h4 className="text-slate-100 font-black text-[10px] uppercase tracking-[0.3em] mb-6">
          Contact Us
        </h4>
        <p className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">
          Phone
        </p>
        <p className="text-slate-100 text-sm font-black mb-6 tracking-tighter italic">
          01813495940
        </p>
        <p className="text-slate-400 text-xs font-bold mb-2 uppercase tracking-widest">
          Email
        </p>
        <p className="text-slate-100 text-sm font-black tracking-tighter">
          info@samimahitower.com
        </p>
      </div>
    </div>

    <div className="h-px bg-slate-900 w-full mb-12"></div>

    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
        © 2025 ALL RIGHTS RESERVED • SAMI & MAHI TOWER
      </p>
      <div className="flex gap-8 text-[10px] font-black text-slate-600 uppercase tracking-widest">
        <span className="cursor-pointer hover:text-slate-300">Privacy Policy</span>
        <span className="cursor-pointer hover:text-slate-300">Cookie Settings</span>
      </div>
    </div>
  </div>
</footer>
    </main>
  );
}