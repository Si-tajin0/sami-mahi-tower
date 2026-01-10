"use client";
import { DictionaryContent, type Language } from "@/lib/dictionary";
import { Tenant, Payment } from "@/lib/types";

interface ModalProps {
  selectedTenant: Tenant | null;
  setSelectedTenant: (tenant: Tenant | null) => void;
  t: DictionaryContent;
  lang: Language;
  payments: Payment[];
}

export default function TenantDetailModal({ selectedTenant, setSelectedTenant, t, lang, payments }: ModalProps) {
  if (!selectedTenant) return null;

  const formatNum = (num: number) => `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  // ভাড়াটিয়ার পেমেন্ট লিস্ট ফিল্টার করার নিরাপদ লজিক
  const tenantPayments = payments.filter(p => {
    const pTenantId = typeof p.tenantId === 'object' ? p.tenantId?._id : p.tenantId;
    return pTenantId === selectedTenant._id;
  });

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-slate-900/80 backdrop-blur-xl transition-all duration-500">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-[70px] shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white no-scrollbar animate-in zoom-in duration-300">
        
        {/* ১. স্টিকি হেডার */}
        <div className="bg-gradient-to-br from-indigo-700 via-blue-800 to-indigo-950 p-10 md:p-12 text-white relative sticky top-0 z-50 shadow-2xl">
          <button 
            onClick={() => setSelectedTenant(null)} 
            className="absolute top-10 right-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white hover:text-blue-900 transition-all text-xl font-light"
          >✕</button>
          
          <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="relative">
              <div className="w-40 h-40 rounded-[55px] bg-white/20 backdrop-blur-md border-4 border-white/30 overflow-hidden flex items-center justify-center shadow-2xl transition-transform hover:scale-105 duration-500">
                {selectedTenant.profilePic ? (
                  <img src={selectedTenant.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-black">{selectedTenant.name[0]}</span>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-3 rounded-2xl shadow-xl border-4 border-[#1e1b4b]">✅</div>
            </div>

            <div className="text-center md:text-left space-y-2">
              <span className="inline-block px-5 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-2 border border-white/20 italic">Executive Resident View</span>
              <h3 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-none italic">{selectedTenant.name}</h3>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4">
                <div className="flex items-center gap-2 opacity-70 uppercase font-black text-xs tracking-widest">
                  <span className="text-xl">🏢</span> {t.flat}: {selectedTenant.flatNo}
                </div>
                <div className="flex items-center gap-2 opacity-70 uppercase font-black text-xs tracking-widest">
                  <span className="text-xl">🆔</span> {t.id}: #{selectedTenant.tenantId}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ২. মোডাল বডি */}
        <div className="p-12 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoBox label={t.phone} value={selectedTenant.phone} icon="📞" />
            <InfoBox label={t.nid} value={selectedTenant.nid || "N/A"} icon="🪪" />
            <InfoBox label={t.occupation} value={selectedTenant.occupation || "ব্যবসায়ী"} icon="💼" />
            <InfoBox label={t.rent} value={formatNum(selectedTenant.rentAmount)} icon="💰" />
            <InfoBox label={t.securityDeposit} value={formatNum(selectedTenant.securityDeposit || 0)} icon="🔐" />
            <div className="bg-slate-50 p-7 rounded-[40px] border border-slate-100 group transition-all duration-500">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em]">{t.joined}</p>
              <p className="text-base font-black text-slate-800 leading-none italic">
                {selectedTenant.joinedDate ? new Date(selectedTenant.joinedDate).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : "N/A"}
              </p>
            </div>
          </div>

          {/* ৩. লাইফটাইম পেমেন্ট ইতিহাস */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📊</div>
              <h4 className="text-xl font-black uppercase tracking-tighter text-indigo-900 italic">Financial Ledger Summary</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenantPayments.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-[#F8FAFC] rounded-[35px] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                    <div>
                      {/* (t as any) সরিয়ে keyof DictionaryContent ব্যবহার করা হয়েছে */}
                      <p className="text-[10px] font-black uppercase text-slate-400 mb-1">
                        {t[p.month as keyof DictionaryContent]} {p.year}
                      </p>
                      <p className="text-sm font-black text-slate-800 italic">Total: {formatNum((p.rentAmount || 0) + (p.serviceCharge || 0))}</p>
                    </div>
                    <span className={`text-[8px] font-black px-4 py-1.5 rounded-full shadow-sm ${p.status === 'Paid' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                      {p.status}
                    </span>
                  </div>
              ))}
            </div>
            {tenantPayments.length === 0 && (
              <div className="py-20 text-center bg-slate-50 rounded-[40px] border border-dashed">
                <p className="text-slate-300 font-black uppercase tracking-widest italic text-xs">No transaction records found</p>
              </div>
            )}
          </div>

          {/* ৪. এনআইডি ছবি */}
          {selectedTenant.nidPhoto && (
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 italic">Identity Document Image</h4>
              <div className="w-full bg-slate-50 rounded-[60px] p-2 border border-slate-200 overflow-hidden shadow-inner group">
                <img src={selectedTenant.nidPhoto} className="w-full h-auto rounded-[52px] opacity-90 group-hover:opacity-100 transition-all duration-700 group-hover:scale-[1.01]" alt="NID Document" />
              </div>
            </div>
          )}

          {/* ৫. ক্লোজ বাটন */}
          <button 
            onClick={() => setSelectedTenant(null)} 
            className="w-full bg-slate-950 text-white py-6 rounded-[35px] font-black uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all border-b-8 border-black active:scale-95 text-xs"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoBox({ label, value, icon }: { label: string, value: string | number, icon: string }) {
  return (
    <div className="bg-slate-50 p-7 rounded-[40px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
       <div className="absolute top-0 right-0 p-4 text-2xl opacity-10 group-hover:scale-125 transition-transform">{icon}</div>
       <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-[0.2em] leading-none">{label}</p>
       <p className="text-base font-black text-slate-800 leading-none group-hover:text-blue-700 transition-colors">{value}</p>
    </div>
  );
}