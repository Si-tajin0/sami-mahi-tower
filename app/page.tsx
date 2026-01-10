"use client";
import { useState, useEffect } from "react";
import Link from "next/link"; 
import { dictionary, type Language } from "@/lib/dictionary";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// ১. টাইপ ইন্টারফেসসমূহ (সুনির্দিষ্ট টাইপ ব্যবহার করা হয়েছে)
const SLIDES: string[] = [
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?q=80&w=2000",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2000",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2000"
];

interface Tenant {
  _id?: string;
  tenantId?: string;
  flatNo: string;
  name: string;
  status?: string;
  profilePic?: string;
}

interface UnitDetails {
  floor: number;
  unit: string;
  rooms: number;
  baths: number;
  balcony: number;
  size: string;
}

interface ApplicationData {
  name: string;
  phone: string;
}

interface Notice {
  _id: string;
  title: string;
  message: string;
}

// StatCard এর জন্য ইন্টারফেস (any এরর ফিক্স করতে)
interface StatCardProps {
  label: string;
  val: number;
  icon: string;
  color: string;
  tBN: (num: number | string) => string;
}

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];
  
  const [selectedUnit, setSelectedUnit] = useState<UnitDetails | null>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [mounted, setMounted] = useState<boolean>(false);
  const [occupiedTenants, setOccupiedTenants] = useState<Tenant[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]); 
  
  const [userRole, setUserRole] = useState<string | undefined>(undefined);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [userPic, setUserPic] = useState<string | undefined>(undefined);
  
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [appData, setAppData] = useState<ApplicationData>({ name: "", phone: "" });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    
    const role = Cookies.get("user-role");
    const id = Cookies.get("user-id");
    const initialName = Cookies.get("user-name");

    setUserRole(role);
    setUserId(id);
    setUserName(initialName);

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    const fetchData = async () => {
      try {
        const timestamp = new Date().getTime();
        const [tRes, nRes] = await Promise.all([
          fetch(`/api/tenants?t=${timestamp}`),
          fetch(`/api/notices?t=${timestamp}`)
        ]);
        
        const tData = await tRes.json();
        const nData = await nRes.json();

        if (tData.success) {
          const allTenants: Tenant[] = tData.data;
          const activeTenants = allTenants.filter((tenant) => tenant.status === "Active" || !tenant.status);
          setOccupiedTenants(activeTenants);

          if (id) {
            const me = allTenants.find((t: Tenant) => t._id === id || t.tenantId === id);
            if (me) {
              setUserName(me.name);
              setUserPic(me.profilePic);
            }
          }
        }

        if (nData.success) {
          setNotices(nData.data);
        }
      } catch (err) { console.error("Error loading data:", err); }
    };

    fetchData();
    return () => clearInterval(timer);
  }, [userId]);

  const handleLogout = () => {
    Cookies.remove("user-role");
    Cookies.remove("user-id");
    Cookies.remove("user-name");
    Cookies.remove("user-pic");
    setUserRole(undefined);
    setUserId(undefined);
    setUserName(undefined);
    setUserPic(undefined);
    router.refresh();
  };

  const toBengaliNumber = (num: number | string): string => {
    if (lang === "en") return num.toString();
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...appData, 
          flatNo: selectedUnit ? `${selectedUnit.floor}${selectedUnit.unit}` : "" 
        })
      });
      if (res.ok) {
        alert(lang === 'bn' ? "আবেদন সফলভাবে পাঠানো হয়েছে!" : "Application sent successfully!");
        setIsApplying(false);
        setSelectedUnit(null);
        setAppData({ name: "", phone: "" });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#fcfdfe] text-slate-900 font-sans selection:bg-blue-100">
      
      {/* ১. হেডার */}
      <header className="fixed top-4 inset-x-4 md:inset-x-12 z-[100] bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl rounded-[30px] p-4 flex justify-between items-center transition-all duration-500">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-cyan-500 rounded-xl rotate-6 group-hover:rotate-12 transition-transform shadow-lg"></div>
            <span className="relative text-white font-black text-xl italic">SM</span>
          </div>
          <div className="hidden md:block">
            <h1 className="text-lg md:text-xl font-extrabold text-slate-900 leading-none tracking-tighter uppercase">{t.title}</h1>
            <a href="tel:01813495940" className="text-[9px] font-bold text-blue-600 tracking-widest uppercase mt-1 flex items-center gap-1 hover:underline">
              <span>📞</span> {lang === 'bn' ? 'কল ম্যানেজার' : 'Call Manager'} :01813495940
            </a>
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="hidden sm:block text-[10px] font-black px-4 py-2 rounded-full border border-slate-200 hover:bg-slate-50 transition-all uppercase tracking-widest">
            {lang === "en" ? "BN" : "EN"}
          </button>

          {userRole ? (
            <div className="flex items-center gap-4 bg-slate-50 p-1.5 pr-4 rounded-full border border-slate-100 shadow-inner">
              <Link 
                href={userRole === 'Owner' ? '/owner/dashboard' : userRole === 'Manager' ? '/manager/dashboard' : `/tenant/dashboard/${userId}`}
                className="relative w-9 h-9 group/avatar flex items-center justify-center"
              >
                {userPic ? (
                  <img 
                    src={userPic} 
                    alt="Profile" 
                    className="w-full h-full rounded-full object-cover border-2 border-white shadow-md transition-transform group-hover/avatar:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-800 flex items-center justify-center text-white font-black text-sm shadow-md uppercase group-hover/avatar:scale-105 transition-transform">
                    {(userName || userRole).charAt(0)}
                  </div>
                )}
              </Link>

              <div className="hidden lg:flex flex-col leading-none">
                <p className="text-[11px] font-black text-slate-800 uppercase tracking-tighter">
                  {userName || (lang === 'bn' ? 'স্বাগতম' : 'Welcome')}
                </p>
                <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                  {userRole}
                </p>
              </div>

              <div className="w-px h-6 bg-slate-200 mx-1 hidden sm:block"></div>
              
              <button 
                onClick={handleLogout} 
                className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:text-red-700 transition-colors"
              >
                {lang === 'bn' ? 'লগআউট' : 'Logout'}
              </button>
            </div>
          ) : (
            <Link href="/login" className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white px-7 py-2.5 rounded-full text-xs font-black shadow-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest">
              {t.login}
            </Link>
          )}
        </div>
      </header>

      {/* ২. Live Notice Marquee (Header এর নিচে নামিয়ে পজিশন ঠিক করা হয়েছে) */}
      <div className="fixed top-[108px] inset-x-0 z-[90] bg-blue-600 text-white py-2 overflow-hidden border-y border-white/10 shadow-xl no-print">
        <div className="flex whitespace-nowrap animate-marquee">
          {notices.length > 0 ? [...notices, ...notices].map((n, i) => (
            <span key={i} className="mx-10 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-3">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              {n.title}: {n.message}
            </span>
          )) : (
            <span className="mx-10 text-[10px] font-black uppercase tracking-widest italic opacity-60">Sami & Mahi Tower • Security & Excellence • Verified Residents Only</span>
          )}
        </div>
      </div>

      {/* স্লাইডার এবং মেইন কন্টেন্ট */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-slate-200">
        {SLIDES.map((s, i) => (
          <div key={i} className={`absolute inset-0 transition-all duration-[2000ms] ease-in-out ${i === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-110"}`}
            style={{ backgroundImage: `url(${s})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#fcfdfe] flex items-center justify-center text-center">
              <div className="mt-20">
                <span className="inline-block px-4 py-1.5 bg-blue-600/20 backdrop-blur-md text-white text-[10px] font-black tracking-[0.3em] uppercase rounded-full mb-6 border border-white/20 italic tracking-tighter">Sami & Mahi Tower</span>
                <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter drop-shadow-2xl leading-none">{t.title}</h2>
                <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mt-8 shadow-lg"></div>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* স্ট্যাট বার */}
      <section className="max-w-5xl mx-auto -mt-16 relative z-50 px-6 no-print">
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

      

      {/* ৪. বিল্ডিং পালস এবং ফ্লোর ম্যাপ */}
      <section className="max-w-7xl mx-auto py-32 px-6">
        <div className="max-w-4xl mx-auto mb-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="মোট ফ্ল্যাট" val={31} icon="🏢" color="bg-blue-50 text-blue-600 border-blue-100" tBN={toBengaliNumber} />
          <StatCard label="বসবাসরত পরিবার" val={occupiedTenants.length} icon="👨‍👩‍👧‍👦" color="bg-red-50 text-red-600 border-red-100" tBN={toBengaliNumber} />
          <StatCard label="খালি আছে" val={31 - occupiedTenants.length} icon="🔑" color="bg-emerald-50 text-emerald-600 border-emerald-100" tBN={toBengaliNumber} />
        </div>

        <div className="text-center mb-24">
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter mb-4">{t.explore}</h3>
          <p className="text-blue-600 font-bold tracking-[0.3em] uppercase text-[10px]">Visual Building Overview</p>
        </div>

        <div className="grid grid-cols-1 gap-12">
          {[6, 5, 4, 3, 2, 1, 0].map((f) => (
            <div key={f} className="group relative flex flex-col md:flex-row gap-12 items-center bg-white p-10 rounded-[60px] shadow-sm hover:shadow-2xl transition-all duration-700 border border-slate-100 overflow-hidden">
              <div className="relative flex flex-col items-center justify-center bg-slate-50 w-32 h-32 rounded-[40px] shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <span className="text-[10px] font-black uppercase opacity-50 mb-1">{t.floor}</span>
                <span className="text-5xl font-black">{f === 0 ? (lang === "bn" ? "নিচ" : "G") : toBengaliNumber(f)}</span>
              </div>

              <div className="relative flex-1 w-full">
                <h4 className="text-2xl font-black text-slate-800 mb-8 uppercase tracking-tighter flex items-center justify-center md:justify-start gap-4">
                  {f === 0 ? t.ground : `${t.floor} ${toBengaliNumber(f)}`}
                  <span className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-12 group-hover:w-32 transition-all duration-700 hidden md:block"></span>
                </h4>
                
                <div className="flex flex-wrap gap-5 justify-center md:justify-start">
                  {(f === 0 || f === 6 ? ["1", "2", "3"] : ["A", "B", "C", "D", "E"]).map((u) => {
                    const flatId = f === 0 ? `G${u}` : `${f}${u}`;
                    const currentTenant = occupiedTenants.find(t => t.flatNo.toUpperCase() === flatId.toUpperCase());
                    const isOccupied = !!currentTenant;

                    return (
                      <button key={u} onClick={() => {setSelectedUnit({ floor: f, unit: u, rooms: 3, baths: 2, balcony: 2, size: lang === "bn" ? "১৩৫০ বর্গফুট" : "1350 sqft" }); setIsApplying(false);}}
                        className={`group/unit relative p-1 w-28 h-28 rounded-[35px] border-2 flex flex-col items-center justify-center transition-all duration-500 overflow-hidden shadow-xl ${isOccupied ? 'border-red-200' : 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100'}`}
                      >
                        {isOccupied ? (
                          <>
                            {userRole ? (
                              <img src={currentTenant?.profilePic || "https://res.cloudinary.com/dj9s9m67f/image/upload/v1700000000/default-avatar.png"} alt="T" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                            ) : (
                              <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400 text-3xl">👤</div>
                            )}
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><span className="text-white font-black text-xl drop-shadow-2xl">{flatId}</span></div>
                            <div className="absolute bottom-1 bg-red-600 text-[7px] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-lg">{t.occupied}</div>
                          </>
                        ) : (
                          <><span className="font-black text-2xl text-emerald-700">{flatId}</span><span className="text-[9px] mt-1 font-black uppercase text-emerald-600">{t.available}</span></>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      

      {/* মোডাল */}
      {selectedUnit && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[60px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-12 text-white relative text-center">
              <button onClick={() => setSelectedUnit(null)} className="absolute top-8 right-8 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 text-xl hover:bg-white hover:text-blue-900 transition-all">✕</button>
              <h3 className="text-5xl font-black uppercase tracking-tighter">{lang === 'bn' ? 'ইউনিট' : 'Unit'} {selectedUnit.floor === 0 ? "" : toBengaliNumber(selectedUnit.floor)}{selectedUnit.unit}</h3>
            </div>
            <div className="p-10 space-y-8">
               {!isApplying ? (
                 <>
                   <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 font-black uppercase mb-2">{t.rooms}</p><p className="text-xl font-black text-slate-800">🛏️ {toBengaliNumber(selectedUnit.rooms)}</p></div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100"><p className="text-[10px] text-slate-400 font-black uppercase mb-2">{t.size}</p><p className="text-xl font-black text-slate-800">📐 {selectedUnit.size}</p></div>
                   </div>
                   <button onClick={() => setIsApplying(true)} className="block w-full bg-slate-950 text-white text-center py-6 rounded-[30px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-800 transition-all">{lang === 'bn' ? 'ভাড়ার জন্য আবেদন করুন' : 'Apply for Rent'}</button>
                 </>
               ) : (
                 <form onSubmit={handleApply} className="space-y-4">
                    <input type="text" placeholder={lang === 'bn' ? 'আপনার নাম' : 'Name'} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-blue-600 transition-all" onChange={(e) => setAppData({...appData, name: e.target.value})} required />
                    <input type="tel" placeholder={lang === 'bn' ? 'ফোন নম্বর' : 'Phone'} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-blue-600 transition-all" onChange={(e) => setAppData({...appData, phone: e.target.value})} required />
                    <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-6 rounded-[30px] font-black uppercase shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-50">{loading ? "..." : (lang === 'bn' ? 'আবেদন জমা দিন' : 'Submit Application')}</button>
                    <button type="button" onClick={() => setIsApplying(false)} className="w-full text-[10px] font-black text-slate-400 uppercase">Back</button>
                 </form>
               )}
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        .animate-marquee { animation: marquee 40s linear infinite; }
        .animate-marquee:hover { animation-play-state: paused; }
      `}</style>

      

      {/* ৬. ফুটার সেকশন (Premium Glass Footer) */}
      {/* ৬. ফুটার সেকশন (গুগল ম্যাপ ও অ্যাড্রেস সহ) */}
      <footer className="mt-32 px-4 md:px-12 pb-10 no-print">
        <div className="bg-white/70 backdrop-blur-2xl border border-white shadow-2xl rounded-[60px] overflow-hidden">
          <div className="max-w-7xl mx-auto px-10 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
            
            {/* কলাম ১: ব্র্যান্ডিং (Col-span 4) */}
            <div className="md:col-span-4 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-tr from-blue-700 to-indigo-800 rounded-2xl flex items-center justify-center text-white font-black text-xl italic rotate-3">SM</div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-800 italic">Sami & Mahi Tower</h3>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase leading-relaxed tracking-widest italic">
                {lang === 'bn' ? 'নিরাপদ এবং আধুনিক জীবনযাত্রার এক অনন্য ঠিকানা। বসুরহাটের প্রাণকেন্দ্রে আপনার পরিবারের সর্বোচ্চ নিরাপত্তা ও স্বাচ্ছন্দ্য নিশ্চিত করাই আমাদের লক্ষ্য।' : 'A unique address for safe and modern living. We ensure the maximum security and comfort of your family in the heart of Basurhat.'}
              </p>
              
              <div className="pt-4 flex items-center gap-4">
                  <span className="text-xl">📞</span>
                  <a href="tel:01813495940" className="text-lg font-black text-blue-600 tracking-tighter italic hover:scale-105 transition-transform inline-block">01813495940</a>
              </div>
            </div>

            {/* কলাম ২: অ্যাড্রেস ও গুগল ম্যাপ লিটল ভিউ (Col-span 5) */}
            <div className="md:col-span-5 space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-4">{lang === 'bn' ? 'অবস্থান ও যোগাযোগ' : 'Location & Contact'}</h4>
               <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-lg flex-shrink-0">📍</div>
                  <div>
                    <p className="text-[12px] font-black text-slate-800 uppercase tracking-tighter leading-none mb-1">Basurhat Office</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-relaxed">
                       {lang === 'bn' ? 'খান সাহেব রোড, ৮ নং ওয়ার্ড, বসুরহাট' : 'Khan Saheb Road, Word No. 8, Basurhat'}
                    </p>
                    {/* গুগল ম্যাপ বাটন */}
                    <a 
                      href="https://maps.app.goo.gl/1M8gvaD3eqmy3E498" 
                      target="_blank" 
                      className="mt-4 inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
                    >
                      🗺️ {lang === 'bn' ? 'ম্যাপে দেখুন' : 'View on Map'}
                    </a>
                  </div>
               </div>
               
               {/* ছোট ইন্টারঅ্যাক্টিভ ম্যাপ প্রিভিউ */}
               <div className="w-full h-32 rounded-3xl overflow-hidden border-2 border-slate-100 grayscale hover:grayscale-0 transition-all duration-700 hidden sm:block">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3686.4475454641!2d91.25368!3d22.8596!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMjLCsDUxJzM0LjYiTiA5McKwMTUnMTMuMiJF!5e0!3m2!1sen!2sbd!4v1700000000000" 
                    width="100%" height="100%" style={{ border: 0 }} loading="lazy">
                  </iframe>
               </div>
            </div>

            {/* কলাম ৩: কুইক লিঙ্কস (Col-span 3) */}
            <div className="md:col-span-3 flex flex-col gap-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-2">{lang === 'bn' ? 'দ্রুত লিঙ্ক' : 'Quick Links'}</h4>
              <Link href="/" className="text-sm font-black text-slate-800 hover:text-blue-600 transition-colors uppercase tracking-tighter italic">Home</Link>
              
              {userRole ? (
                <Link href={userRole === 'Owner' ? '/owner/dashboard' : userRole === 'Manager' ? '/manager/dashboard' : `/tenant/dashboard/${userId}`} className="text-sm font-black text-slate-800 hover:text-blue-600 transition-colors uppercase tracking-tighter italic">My Dashboard</Link>
              ) : (
                <Link href="/login" className="text-sm font-black text-slate-800 hover:text-blue-600 transition-colors uppercase tracking-tighter italic">Login Portal</Link>
              )}
              
              <a href="tel:01813495940" className="text-sm font-black text-slate-800 hover:text-emerald-600 transition-colors uppercase tracking-tighter italic">Contact Manager</a>
            </div>

          </div>

          {/* কপিরাইট বার */}
          <div className="border-t border-slate-100 px-10 py-8 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
             <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest text-center md:text-left">
               © {new Date().getFullYear()} Sami & Mahi Tower. Khan Saheb Road, Basurhat.
             </p>
             <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-slate-400">Powered by</span>
                <span className="text-[10px] font-black text-slate-900 uppercase italic tracking-tighter border-b-2 border-blue-600">Accent Solutions</span>
             </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

// ৪ নম্বর ফিক্স: StatCard এর জন্য সুনির্দিষ্ট টাইপ (any এর বদলে StatCardProps ব্যবহার করা হয়েছে)
function StatCard({ label, val, icon, color, tBN }: StatCardProps) {
  return (
    <div className={`bg-white p-8 rounded-[40px] shadow-xl border text-center group hover:scale-105 transition-all duration-500 ${color}`}>
      <div className="text-2xl mb-4">{icon}</div>
      <p className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-1">{label}</p>
      <h4 className="text-3xl font-black tracking-tighter">{tBN(val)} <span className="text-xs opacity-40">টি</span></h4>
    </div>
  );
}