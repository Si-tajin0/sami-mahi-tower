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

  const tenantPayments = payments.filter(p => {
    const pTenantId = typeof p.tenantId === 'object' ? p.tenantId?._id : p.tenantId;
    return pTenantId === selectedTenant._id;
  });

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 md:p-10 bg-slate-900/80 backdrop-blur-xl transition-all duration-500">
      <div className="bg-white w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-[70px] shadow-[0_40px_100px_rgba(0,0,0,0.25)] border border-white no-scrollbar animate-in zoom-in duration-300">
        
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
              <span className="inline-block px-5 py-1.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-[0.4em] mb-2 border border-white/20 italic">Verified Resident Profile</span>
              <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">{selectedTenant.name}</h3>
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
            <InfoBox label={lang === 'bn' ? "পরিবার সদস্য" : "Family Members"} value={`${selectedTenant.familyMembers || 1} Person`} icon="👨‍👩‍👧‍👦" />
          </div>

          {/* --- ৩. পরিবারের সদস্যদের বিস্তারিত (New Update) --- */}
          <div className="space-y-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-blue-100">👪</div>
              <div>
                <h4 className="text-2xl font-black uppercase tracking-tighter text-slate-800 italic">Family Members Directory</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Registered documents for security verification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {selectedTenant.familyList && selectedTenant.familyList.length > 0 ? (
                selectedTenant.familyList.map((member, index) => (
                  <div key={index} className="bg-slate-50/50 p-8 rounded-[50px] border border-slate-100 flex flex-col sm:flex-row gap-8 items-center group hover:bg-white hover:shadow-2xl transition-all duration-500">
                    <div className="w-32 h-32 rounded-[35px] overflow-hidden border-4 border-white shadow-lg bg-white relative flex-shrink-0">
                      {member.idPhoto ? (
                        <img src={member.idPhoto} alt="ID" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200 font-black text-xs">NO ID</div>
                      )}
                    </div>
                    <div className="text-center sm:text-left flex-1">
                      <span className="text-[9px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">{member.relation}</span>
                      <h5 className="text-xl font-black text-slate-800 mt-2 uppercase tracking-tighter">{member.name}</h5>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest italic">Document Verified ✔</p>
                      
                      {member.idPhoto && (
                        <a href={member.idPhoto} target="_blank" className="mt-4 inline-block text-[10px] font-black text-blue-500 underline uppercase tracking-widest hover:text-indigo-700">View Document</a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-10 text-center bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
                   <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">No additional family members registered</p>
                </div>
              )}
            </div>
          </div>

          {/* ৪. লাইফটাইম পেমেন্ট ইতিহাস */}
          <div className="space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl shadow-inner">📊</div>
              <h4 className="text-xl font-black uppercase tracking-tighter text-indigo-900 italic">Financial Ledger Summary</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tenantPayments.map((p, i) => (
                  <div key={i} className="flex justify-between items-center p-6 bg-[#F8FAFC] rounded-[35px] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500">
                    <div>
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
          </div>

          {/* ৫. মূল এনআইডি ছবি */}
          {selectedTenant.nidPhoto && (
            <div className="space-y-6">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4 italic">Primary NID Document</h4>
              <div className="w-full bg-slate-50 rounded-[60px] p-2 border border-slate-200 overflow-hidden shadow-inner group">
                <img src={selectedTenant.nidPhoto} className="w-full h-auto rounded-[52px] opacity-90 group-hover:opacity-100 transition-all duration-700" alt="NID Document" />
              </div>
            </div>
          )}

          {/* ক্লোজ বাটন */}
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