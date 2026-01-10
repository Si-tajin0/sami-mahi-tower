"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // নেভিগেশনের জন্য
import { dictionary, type Language } from "@/lib/dictionary";

// ১. টাইপ ইন্টারফেস (সব তথ্য সহ)
interface Tenant { 
  _id: string; 
  flatNo: string; 
  name: string; 
  profilePic?: string; // ছবি যোগ করা হয়েছে
  status?: string; 
}

interface MapProps { lang: Language; }

export default function BuildingMap({ lang }: MapProps) {
  const t = dictionary[lang];
  const router = useRouter(); // রাউটার ডিক্লেয়ার করা হলো
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const floors = [6, 5, 4, 3, 2, 1, 0];

  const fetchTenants = async (): Promise<void> => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/tenants?t=${timestamp}`);
      const data = await res.json();
      if (data.success) {
        setTenants(data.data as Tenant[]);
      }
    } catch (err: unknown) {
      console.error("Error fetching tenants for map:", err);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const getUnitData = (f: number, u: string) => {
    const flatId = f === 0 ? `G${u}` : `${f}${u}`;
    const tenant = tenants.find(t => 
      t.flatNo.trim().toUpperCase() === flatId.toUpperCase() && 
      (t.status === "Active" || !t.status)
    );
    return tenant || null;
  };

  return (
    <div className="bg-white p-8 rounded-[50px] shadow-xl border border-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">{t.buildingMap}</h2>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">Sami & Mahi Tower • Interactive View</p>
        </div>
        <div className="flex gap-4 text-[10px] font-black uppercase bg-slate-50 p-4 rounded-3xl border border-slate-100">
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.5)]"></span> {t.occupied}</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> {t.vacant}</div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {floors.map(f => (
          <div key={f} className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50/50 rounded-[45px] border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
            {/* ফ্লোর ব্যাজ */}
            <div className="w-16 h-16 bg-white rounded-[20px] flex flex-col items-center justify-center font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
               <span className="text-[8px] uppercase opacity-40">Floor</span>
               <span className="text-2xl leading-none">{f === 0 ? "G" : f}</span>
            </div>
            
            {/* ইউনিটের গ্রিড */}
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {(f === 0 || f === 6 ? ["1", "2", "3"] : ["A", "B", "C", "D", "E"]).map(u => {
                const tenant = getUnitData(f, u);
                const flatId = f === 0 ? `G${u}` : `${f}${u}`;

                return (
                  <div 
                    key={u} 
                    onClick={() => tenant && router.push(`/manager/tenants/${tenant._id}`)} // ক্লিকে প্রোফাইলে যাবে
                    className={`relative group/unit w-28 h-28 rounded-[35px] border-2 transition-all duration-500 cursor-pointer overflow-hidden shadow-sm ${
                      tenant 
                      ? 'border-red-100 bg-white' 
                      : 'border-emerald-100 bg-emerald-50 hover:bg-emerald-500 hover:border-emerald-500'
                    }`}
                  >
                    {tenant ? (
                      <>
                        {/* ১. ভাড়াটিয়ার ছবি (যদি থাকে) */}
                        <img 
                          src={tenant.profilePic || "https://res.cloudinary.com/dj9s9m67f/image/upload/v1700000000/default-avatar.png"} 
                          alt={tenant.name}
                          className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover/unit:scale-110 group-hover/unit:opacity-100 transition-all duration-700"
                        />
                        {/* ২. ছবির ওপরে ফ্ল্যাট নম্বর এবং ওভারলে */}
                        <div className="absolute inset-0 bg-black/20 group-hover/unit:bg-black/40 flex flex-col items-center justify-center transition-all">
                           <span className="font-black text-white text-xl drop-shadow-lg">{flatId}</span>
                           <span className="text-[7px] font-black text-white/80 uppercase tracking-widest mt-1 opacity-0 group-hover/unit:opacity-100 transition-opacity">View Profile</span>
                        </div>
                        {/* ৩. লাইভ লাল ডট */}
                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white animate-pulse"></div>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="font-black text-2xl text-emerald-700 group-hover/unit:text-white transition-colors">{flatId}</span>
                        <span className="text-[9px] font-black uppercase text-emerald-600 group-hover/unit:text-white transition-colors">{t.available}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}