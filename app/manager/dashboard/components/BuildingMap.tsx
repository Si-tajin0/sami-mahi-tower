"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language } from "@/lib/dictionary";

interface Tenant { _id: string; flatNo: string; name: string; }
interface MapProps { lang: Language; }

export default function BuildingMap({ lang }: MapProps) {
  const t = dictionary[lang];
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const floors = [6, 5, 4, 3, 2, 1, 0];

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const res = await fetch("/api/tenants");
        const data = await res.json();
        if (data.success) setTenants(data.data as Tenant[]);
      } catch (err) { console.error(err); }
    };
    fetchTenants();
  }, []);

  const getUnitStatus = (f: number, u: string) => {
    const flatId = f === 0 ? `G${u}` : `${f}${u}`;
    const tenant = tenants.find(t => t.flatNo.toUpperCase() === flatId.toUpperCase());
    return tenant ? { isOccupied: true, name: tenant.name } : { isOccupied: false, name: "" };
  };

  return (
    <div className="bg-white p-8 rounded-[50px] shadow-xl border border-slate-100">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">{t.buildingMap}</h2>
        <div className="flex gap-4 text-[10px] font-black uppercase">
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-500 rounded-full"></span> {t.occupied}</div>
           <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500 rounded-full"></span> {t.vacant}</div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {floors.map(f => (
          <div key={f} className="flex flex-col md:flex-row items-center gap-4 p-4 bg-slate-50 rounded-[30px] border border-slate-100 group hover:border-blue-200 transition-all">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center font-black text-xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
               {f === 0 ? "G" : f}
            </div>
            
            <div className="flex flex-wrap gap-3 justify-center">
              {(f === 0 || f === 6 ? ["1", "2", "3"] : ["A", "B", "C", "D", "E"]).map(u => {
                const status = getUnitStatus(f, u);
                return (
                  <div key={u} className={`relative px-6 py-4 rounded-2xl border-2 transition-all cursor-default group/unit ${status.isOccupied ? 'bg-red-50 border-red-200' : 'bg-emerald-50 border-emerald-200 hover:scale-105'}`}>
                    <p className={`font-black text-center ${status.isOccupied ? 'text-red-700' : 'text-emerald-700'}`}>
                      {f === 0 ? "G" : f}{u}
                    </p>
                    {status.isOccupied && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-unit-hover:block bg-slate-900 text-white text-[8px] font-bold px-2 py-1 rounded-lg whitespace-nowrap z-10 shadow-xl">
                        {status.name}
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