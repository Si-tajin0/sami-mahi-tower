"use client";
import { useState, useEffect, use } from "react"; 
import { useRouter } from "next/navigation";
import { dictionary, type Language } from "@/lib/dictionary";


// ১. ইন্টারফেস আপডেট (পেমেন্ট রেকর্ডে নতুন ফিল্ডসহ)
interface TenantData {
  _id: string; name: string; phone: string; nid: string; occupation: string;
  flatNo: string; rentAmount: number; securityDeposit: number;
  tenantId: string; emergencyContact: string; profilePic?: string; 
  nidPhoto?: string; joinedDate: string; status: string;
}

interface PaymentRecord {
  month: string; 
  year: number; 
  amount?: number;        // পুরনো ডাটা ফিল্ড
  rentAmount?: number;    // নতুন ডাটা ফিল্ড
  serviceCharge?: number; // নতুন ডাটা ফিল্ড
  status: string;
}

export default function TenantDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params); 
  const router = useRouter();
  
  const [lang, setLang] = useState<Language>("bn"); 
  const t = dictionary[lang]; 
  
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [tenantRes, paymentRes] = await Promise.all([
          fetch(`/api/tenants/${id}`),
          fetch(`/api/payments/tenant/${id}`)
        ]);

        const tenantData = await tenantRes.json();
        const paymentData = await paymentRes.json();

        if (tenantData.success) setTenant(tenantData.data);
        if (paymentData.success) setHistory(paymentData.data);

      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAllData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!tenant) return <div className="min-h-screen flex items-center justify-center font-black">তথ্য পাওয়া যায়নি</div>;

  // ২. মোট ভাড়া হিসাব করার চূড়ান্ত লজিক (০ আসার সমাধান)
  const totalPaid = history
    .filter(p => p.status?.toLowerCase().trim() === "paid")
    .reduce((acc, curr) => {
      // ভাড়া এবং সার্ভিস চার্জ যোগ করা হচ্ছে। যদি এগুলো না থাকে তবে পুরনো 'amount' চেক করবে।
      const rent = Number(curr.rentAmount) || Number(curr.amount) || 0;
      const sc = Number(curr.serviceCharge) || 0;
      return acc + rent + sc;
    }, 0);

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto">
        
        {/* নেভিগেশন */}
        <div className="flex justify-between items-center mb-8 no-print">
          <button onClick={() => router.back()} className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-blue-600 transition-all">
            <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm group-hover:bg-blue-600 group-hover:text-white text-base">←</span>
            {t.close}
          </button>
          
          <button 
            onClick={() => setLang(lang === "en" ? "bn" : "en")}
            className="px-6 py-2 bg-white border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-900 hover:text-white transition-all"
          >
            {lang === "en" ? "বাংলা" : "English"}
          </button>
        </div>
        
        <div className="bg-white rounded-[60px] shadow-2xl shadow-blue-900/5 overflow-hidden border border-white">
          
          <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-12 text-white relative flex flex-col md:flex-row items-center gap-10">
            <div className="absolute top-0 right-0 p-12 opacity-10 font-black text-9xl italic uppercase select-none">SM</div>
            
            <div className="relative group">
              <div className="w-40 h-40 rounded-[50px] bg-white/20 backdrop-blur-md border-4 border-white/30 shadow-2xl overflow-hidden flex items-center justify-center text-white">
                {tenant.profilePic ? (
                  <img src={tenant.profilePic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl uppercase font-black">{tenant.name[0]}</span>
                )}
              </div>
              <div className={`absolute -bottom-2 -right-2 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${tenant.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                {tenant.status || "Active"}
              </div>
            </div>

            <div className="relative z-10 text-center md:text-left">
              <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 italic">Verified Resident Profile</span>
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-2">{tenant.name}</h2>
              <p className="font-black tracking-widest text-xs opacity-70 italic uppercase">ID: #{tenant.tenantId} • Flat: {tenant.flatNo}</p>
            </div>
          </div>
          
          <div className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoCard label={t.phone} value={tenant.phone} icon="📞" />
            <InfoCard label={t.nid} value={tenant.nid || "N/A"} icon="🪪" />
            <InfoCard label={t.occupation} value={tenant.occupation || "ব্যবসায়ী"} icon="💼" />
            <InfoCard label={t.rent} value={`৳ ${tenant.rentAmount.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`} icon="💰" color="text-green-600" />
            <InfoCard label={t.securityDeposit} value={`৳ ${tenant.securityDeposit.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`} icon="🔐" color="text-blue-600" />
            <InfoCard label={t.totalIncome} value={`৳ ${totalPaid.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`} icon="✅" color="text-indigo-600" />
          </div>

          {tenant.nidPhoto && (
            <div className="px-8 md:px-16 mb-10">
              <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest ml-4">NID Document Copy</p>
              <div className="w-full max-w-lg bg-slate-50 rounded-[40px] border border-slate-100 overflow-hidden shadow-inner">
                <img src={tenant.nidPhoto} alt="NID Card" className="w-full h-auto opacity-90 hover:opacity-100 transition-all duration-500" />
              </div>
            </div>
          )}

          <div className="mx-8 md:mx-16 mb-16 p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">📅</div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.joined}</p>
                <p className="text-sm font-black text-slate-800 italic">
                  {new Date(tenant.joinedDate).toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
            <button onClick={() => window.print()} className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">
              {t.printReport}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon, color = "text-slate-800" }: { label: string, value: string | number, icon: string, color?: string }) {
  return (
    <div className="bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-500">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{label}</p>
      <div className="flex items-center gap-4">
        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{icon}</span>
        <p className={`text-xl font-black tracking-tight ${color}`}>{value}</p>
      </div>
    </div>
  );
}