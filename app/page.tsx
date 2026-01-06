"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { dictionary, type Language } from "@/lib/dictionary"; // এখানে DictionaryContent সরিয়ে দেওয়া হয়েছে

const SLIDES: string[] = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"
];

interface Tenant {
  flatNo: string;
  name: string;
}

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
  const [occupiedTenants, setOccupiedTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    const fetchTenants = async () => {
      try {
        const res = await fetch("/api/tenants");
        const data = await res.json();
        if (data.success) {
          setOccupiedTenants(data.data as Tenant[]);
        }
      } catch (err) {
        console.error("Error fetching tenants:", err);
      }
    };

    fetchTenants();
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
      {/* ১. আধুনিক লোগো ও হেডার */}
      <header className="fixed top-4 inset-x-4 md:inset-x-12 z-[100] bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[30px] p-4 flex justify-between items-center">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-cyan-500 rounded-xl rotate-6 group-hover:rotate-12 transition-transform shadow-lg"></div>
            <span className="relative text-white font-black text-xl italic tracking-tighter">SM</span>
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 leading-none tracking-tighter uppercase">{t.title}</h1>
            <p className="text-[9px] font-bold text-blue-600 tracking-widest uppercase mt-1">{t.contact}</p>
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="hidden sm:block text-[10px] font-black px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-widest">
            {lang === "en" ? "বাংলা" : "English"}
          </button>
          <Link href="/login" className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-7 py-2.5 rounded-full text-xs font-black shadow-xl shadow-blue-200 hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
            {t.login}
          </Link>
        </div>
      </header>

      {/* ২. হিরো স্লাইডার */}
      <section className="relative h-[85vh] w-full overflow-hidden">
        {SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
            style={{ backgroundImage: `url(${s})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#fcfdfe] flex items-center justify-center text-center px-4">
              <div className="mt-20">
                <span className="inline-block px-4 py-1.5 bg-blue-600/20 backdrop-blur-md text-white text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-6 border border-white/20">Luxury Living</span>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter drop-shadow-2xl leading-none">{t.title}</h2>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-8 shadow-lg shadow-blue-500/50"></div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* ৩. অ্যামেনিটি বার */}
      <section className="max-w-5xl mx-auto -mt-16 relative z-50 px-6">
        <div className="bg-white/90 backdrop-blur-2xl grid grid-cols-2 md:grid-cols-4 gap-4 p-8 rounded-[40px] shadow-2xl border border-white/50">
          {[
            {label: "Security", icon: "🛡️", val: "24/7", c: "text-blue-600"},
            {label: "Lift", icon: "🛗", val: "Modern", c: "text-indigo-600"},
            {label: "Generator", icon: "⚡", val: "Full", c: "text-amber-600"},
            {label: "Parking", icon: "🚗", val: "Safe", c: "text-emerald-600"}
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <div className="text-2xl mb-2">{item.icon}</div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className={`text-xs font-black ${item.c}`}>{item.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ৪. ফ্লোর লজিক ও ম্যাপ */}
       <section className="max-w-7xl mx-auto py-32 px-6">
        <div className="text-center mb-24">
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t.explore}</h3>
          <p className="text-blue-600 font-bold tracking-[0.3em] uppercase text-[10px]">Premium Lifestyle Awaits</p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {[6, 5, 4, 3, 2, 1, 0].map((f) => (
            <div key={f} className="group relative flex flex-col md:flex-row gap-12 items-center bg-white p-10 rounded-[60px] shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 overflow-hidden">
              
              {/* ফ্লোর নম্বর বক্স - এখানে হোভার ফিক্স করা হয়েছে */}
              <div className="relative flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 w-32 h-32 rounded-[40px] shadow-inner group-hover:from-blue-600 group-hover:to-indigo-800 transition-all duration-500">
                <span className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1 group-hover:text-white group-hover:opacity-100 transition-all">
                  {t.floor}
                </span>
                <span className="text-5xl font-black text-slate-800 group-hover:text-white transition-all">
                  {f === 0 ? (lang === "bn" ? "নিচ" : "G") : toBengaliNumber(f)}
                </span>
              </div>

              <div className="relative flex-1 w-full">
                <h4 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter flex items-center justify-center md:justify-start gap-4">
                  {f === 0 ? t.ground : `${t.floor} ${toBengaliNumber(f)}`}
                  <span className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-12 group-hover:w-32 transition-all duration-700"></span>
                </h4>
                
                <div className="flex flex-wrap gap-5 justify-center md:justify-start">
                  {(f === 0 || f === 6 ? ["1", "2", "3"] : ["A", "B", "C", "D", "E"]).map((u) => {
                    const flatId = f === 0 ? `G${u}` : `${f}${u}`;
                    const isOccupied = occupiedTenants.some(tenant => tenant.flatNo.toUpperCase() === flatId.toUpperCase());

                    return (
                      <button 
                        key={u}
                        onClick={() => setSelectedUnit({ floor: f, unit: u, rooms: 3, baths: 2, balcony: 2, size: lang === "bn" ? "১৩৫০ বর্গফুট" : "1350 sqft" })}
                        className={`group/unit relative p-6 w-32 h-32 rounded-[35px] border-2 flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-2 shadow-xl ${
                          isOccupied 
                          ? 'bg-red-50 border-red-100 shadow-red-900/5' 
                          : 'bg-emerald-50 border-emerald-100 shadow-emerald-900/5 hover:bg-emerald-100'
                        }`}
                      >
                        <span className={`font-black text-2xl ${isOccupied ? 'text-red-700' : 'text-emerald-700'}`}>{flatId}</span>
                        {/* এখানে t.available ফিক্স করা হয়েছে */}
                        <span className={`text-[9px] mt-2 font-black uppercase tracking-widest ${isOccupied ? 'text-red-400' : 'text-emerald-600'}`}>
                          {isOccupied ? t.occupied : t.available}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ৫. ডিটেইলস মোডাল */}
      {selectedUnit && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white relative text-center">
              <button onClick={() => setSelectedUnit(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all text-xl">✕</button>
              <h3 className="text-5xl font-black uppercase tracking-tighter">ইউনিট {selectedUnit.floor === 0 ? "" : toBengaliNumber(selectedUnit.floor)}{selectedUnit.unit}</h3>
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
                 <span className="text-2xl">📐</span>
                 <p className="text-xl font-black text-blue-700">{selectedUnit.size}</p>
              </div>
              <Link href="/login" className="block w-full bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-center py-6 rounded-[30px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] transition-all">
                {t.apply}
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}