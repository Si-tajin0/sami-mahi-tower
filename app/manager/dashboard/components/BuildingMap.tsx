"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { dictionary, type Language } from "@/lib/dictionary";

interface Tenant { 
  _id: string; flatNo: string; name: string; profilePic?: string; status?: string; 
}

// setActiveTab এর জন্য সুনির্দিষ্ট টাইপ ডিফাইন করা হয়েছে
interface MapProps { 
  lang: Language; 
  setActiveTab: (tab: "overview" | "rent" | "tenant" | "expense" | "map" | "notice" | "complaint" | "handover" | "staff") => void; 
}

export default function BuildingMap({ lang, setActiveTab }: MapProps) {
  const t = dictionary[lang];
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);

  const floorConfig = [
    { label: lang === 'bn' ? "৪র্থ তলা" : "4th Floor", id: "E", units: ["1", "2", "3", "4", "5"] },
    { label: lang === 'bn' ? "৩য় তলা" : "3rd Floor", id: "D", units: ["1", "2", "3", "4", "5"] },
    { label: lang === 'bn' ? "২য় তলা" : "2nd Floor", id: "C", units: ["1", "2", "3", "4", "5"] },
    { label: lang === 'bn' ? "১ম তলা" : "1st Floor", id: "B", units: ["1", "2", "3", "4", "5"] },
    { label: lang === 'bn' ? "নিচ তলা" : "Ground Floor", id: "A", units: ["1", "2", "3"] }, 
  ];

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await fetch(`/api/tenants?t=${new Date().getTime()}`);
        const data = await res.json();
        if (data.success) setTenants(data.data);
      } catch (err) {
        console.error("Fetch tenants error:", err);
      }
    };
    fetchTenants();
  }, []);

  const handleUnitClick = (flatId: string, tenant: Tenant | null) => {
    if (tenant) {
      router.push(`/manager/tenants/${tenant._id}`);
    } else {
      // এড টেন্যান্ট ট্যাবে পাঠানো
      setActiveTab("tenant");
      const url = new URL(window.location.href);
      url.searchParams.set("flat", flatId);
      window.history.pushState({}, "", url.toString());
    }
  };

  return (
    <div className="bg-white p-8 rounded-[50px] shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-slate-800 uppercase italic">{t.buildingMap}</h2>
        <div className="flex gap-4 text-[10px] font-black uppercase">
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span> {t.occupied}</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> {t.available}</div>
        </div>
      </div>

      <div className="space-y-6">
        {floorConfig.map(f => (
          <div key={f.id} className="flex flex-col md:flex-row items-center gap-8 p-6 bg-slate-50/50 rounded-[45px] border border-transparent hover:bg-white hover:shadow-xl transition-all duration-500 group">
            <div className="w-20 h-20 bg-white rounded-3xl flex flex-col items-center justify-center font-black group-hover:bg-blue-600 group-hover:text-white transition-all">
               <span className="text-[8px] uppercase opacity-40">{t.floor}</span>
               <span className="text-3xl">{f.id}</span>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              {f.units.map(u => {
                const flatId = `${f.id}${u}`;
                const tenant = tenants.find(ten => ten.flatNo.toUpperCase() === flatId.toUpperCase() && (ten.status === "Active" || !ten.status));

                return (
                  <button 
                    key={u} 
                    onClick={() => handleUnitClick(flatId, tenant || null)}
                    className={`relative w-28 h-28 rounded-[35px] border-2 transition-all duration-500 overflow-hidden shadow-sm ${
                      tenant ? 'border-red-100 bg-white' : 'border-emerald-100 bg-emerald-50 hover:bg-emerald-500'
                    }`}
                  >
                    {tenant ? (
                      <>
                        <img src={tenant.profilePic || "https://res.cloudinary.com/dj9s9m67f/image/upload/v1700000000/default-avatar.png"} alt="T" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><span className="text-white font-black text-xl">{flatId}</span></div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center">
                        <span className="font-black text-2xl text-emerald-700 group-hover:text-white">{flatId}</span>
                        <span className="text-[8px] font-black uppercase text-emerald-500 group-hover:text-white">{t.available}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}