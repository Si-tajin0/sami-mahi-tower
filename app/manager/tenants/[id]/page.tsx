"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { dictionary } from "@/lib/dictionary";

interface TenantData {
  name: string;
  phone: string;
  nid: string;
  occupation: string;
  flatNo: string;
  rentAmount: number;
  securityDeposit: number;
  tenantId: string;
  emergencyContact: string;
  joinedDate: string;
}

export default function TenantDetails() {
  const { id } = useParams();
  const router = useRouter();
  const t = dictionary["bn"]; 
  
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/tenants/${id}`);
        const data = await res.json();
        if (data.success) {
          setTenant(data.data);
        }
      } catch (err) {
        console.error("ডাটা লোড করতে সমস্যা:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetails();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!tenant) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-black uppercase text-slate-400">
      তথ্য পাওয়া যায়নি
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="group mb-8 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-all"
        >
          <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all text-base">←</span>
          ফিরে যান
        </button>
        
        <div className="bg-white rounded-[60px] shadow-2xl shadow-blue-900/5 overflow-hidden border border-white">
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-12 text-white relative">
            <div className="absolute top-0 right-0 p-12 opacity-10 font-black text-9xl italic tracking-tighter select-none uppercase">SM</div>
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 text-blue-100">Tenant Profile</span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2">{tenant.name}</h2>
              <div className="flex items-center gap-4 text-blue-200">
                <p className="font-black tracking-widest text-xs uppercase italic">ID: #{tenant.tenantId}</p>
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>
                <p className="font-black tracking-widest text-xs uppercase italic">Flat: {tenant.flatNo}</p>
              </div>
            </div>
          </div>
          
          <div className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard label={t.phone} value={tenant.phone} icon="📞" />
            <InfoCard label={t.nid} value={tenant.nid} icon="🪪" />
            <InfoCard label={t.occupation} value={tenant.occupation || "ব্যবসায়ী"} icon="💼" />
            
            {/* এখানে সমাধান দেওয়া হয়েছে: মান না থাকলে ০ ধরে নিবে */}
            <InfoCard 
              label={t.rent} 
              value={`৳ ${(tenant.rentAmount || 0).toLocaleString('bn-BD')}`} 
              icon="💰" 
              color="text-green-600" 
            />
            <InfoCard 
              label={t.securityDeposit} 
              value={`৳ ${(tenant.securityDeposit || 0).toLocaleString('bn-BD')}`} 
              icon="🔐" 
              color="text-blue-600" 
            />
            
            <InfoCard label={t.emergencyContact} value={tenant.emergencyContact || "N/A"} icon="🚨" />
          </div>

          <div className="mx-8 md:mx-16 mb-16 p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-xl">📅</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.joined}</p>
                <p className="text-sm font-black text-slate-800 italic">
                  {tenant.joinedDate ? new Date(tenant.joinedDate).toLocaleDateString("bn-BD", { day: 'numeric', month: 'long', year: 'numeric' }) : "তথ্য নেই"}
                </p>
              </div>
            </div>
            <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-slate-200">রশিদ প্রিন্ট করুন</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon, color = "text-slate-800" }: { label: string, value: string, icon: string, color?: string }) {
  return (
    <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-500">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{label}</p>
      <div className="flex items-center gap-4">
        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500 scale-100 group-hover:scale-110">{icon}</span>
        <p className={`text-xl font-black tracking-tight ${color}`}>{value}</p>
      </div>
    </div>
  );
}