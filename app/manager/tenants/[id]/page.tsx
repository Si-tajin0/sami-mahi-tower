"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { dictionary } from "@/lib/dictionary";

interface TenantData {
  _id: string; name: string; phone: string; nid: string; occupation: string;
  flatNo: string; rentAmount: number; securityDeposit: number;
  tenantId: string; emergencyContact: string; joinedDate: string;
}

interface PaymentRecord {
  month: string; year: number; amount: number; status: string;
}

export default function TenantDetails() {
  const params = useParams();
  const id = params?.id; 
  const router = useRouter();
  const t = dictionary["bn"]; 
  
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fetchAllData = async () => {
      if (!id) return;
      try {
        // ১. ভাড়াটিয়া তথ্য আনা
        const tenantRes = await fetch(`/api/tenants/${id}`);
        const tenantJson = tenantRes.ok ? await tenantRes.json() : { success: false };
        if (tenantJson.success) setTenant(tenantJson.data);

        // ২. ভাড়ার ইতিহাস আনা (Safe Fetch - এখানে ভুল থাকলেও এরর আসবে না)
        const paymentRes = await fetch(`/api/payments/tenant/${id}`);
        if (paymentRes.ok) {
          const paymentJson = await paymentRes.json();
          if (paymentJson.success) setHistory(paymentJson.data);
        } else {
          console.log("পেমেন্ট এপিআই পাওয়া যায়নি।");
        }

      } catch (err) {
        console.error("ডাটা লোড এরর:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-blue-600 font-bold">লোড হচ্ছে...</div>
  );

  if (!tenant) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-black text-red-500 uppercase">তথ্য পাওয়া যায়নি</p>
      <button onClick={() => router.back()} className="bg-blue-600 text-white px-8 py-2 rounded-full text-xs">ফিরে যান</button>
    </div>
  );

  // মোট ভাড়া হিসাব করার লজিক (০ আসার সমাধান)
  const totalPaid = history
    .filter(p => p.status && p.status.toLowerCase() === "paid")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-12 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        <div className="no-print">
          <button onClick={() => router.back()} className="group mb-8 flex items-center gap-3 text-[10px] font-black uppercase text-slate-400 hover:text-blue-600 transition-all">
            <span className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm group-hover:bg-blue-600 group-hover:text-white">←</span>
            ফিরে যান
          </button>
          
          <div className="bg-white rounded-[60px] shadow-2xl overflow-hidden border border-white mb-10">
            <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-12 text-white relative">
              <div className="relative z-10">
                <span className="inline-block px-4 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4">Official Profile</span>
                <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-2">{tenant.name}</h2>
                <p className="font-black tracking-widest text-xs opacity-70 italic">ID: #{tenant.tenantId} • Flat: {tenant.flatNo}</p>
              </div>
            </div>
            
            <div className="p-8 md:p-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <InfoCard label={t.phone} value={tenant.phone} icon="📞" />
              <InfoCard label={t.nid} value={tenant.nid || "N/A"} icon="🪪" />
              <InfoCard label={t.occupation} value={tenant.occupation || "N/A"} icon="💼" />
              <InfoCard label={t.rent} value={`৳ ${(tenant.rentAmount || 0).toLocaleString('bn-BD')}`} icon="💰" color="text-green-600" />
              <InfoCard label={t.securityDeposit} value={`৳ ${(tenant.securityDeposit || 0).toLocaleString('bn-BD')}`} icon="🔐" color="text-blue-600" />
              <InfoCard label="মোট আদায়কৃত ভাড়া" value={`৳ ${totalPaid.toLocaleString('bn-BD')}`} icon="✅" color="text-indigo-600" />
              <InfoCard label={t.emergencyContact} value={tenant.emergencyContact || "N/A"} icon="🚨" color="text-red-500" />
            </div>

            <div className="mx-8 md:mx-16 mb-16 p-2 text-center">
              <button onClick={() => window.print()} className="w-full md:w-auto px-12 py-5 bg-slate-900 text-white rounded-[30px] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-blue-700 transition-all shadow-2xl shadow-slate-300">
                📄 প্রোফাইল ও রশিদ প্রিন্ট করুন
              </button>
            </div>
          </div>
        </div>

        {/* প্রিন্ট টেম্পলেট (এটি স্ক্রিনে দেখাবে না) */}
        <div className="hidden print:block p-10 bg-white text-black min-h-screen border-[12px] border-double border-slate-200">
           <h1 className="text-4xl font-black uppercase text-center mb-10">Sami & Mahi Tower</h1>
           <div className="grid grid-cols-2 gap-10 mb-10 text-sm">
              <div>
                 <p><b>Name:</b> {tenant.name}</p>
                 <p><b>Flat No:</b> {tenant.flatNo}</p>
              </div>
              <div className="text-right">
                 <p><b>Tenant ID:</b> #{tenant.tenantId}</p>
                 <p><b>Total Paid:</b> ৳ {totalPaid.toLocaleString()}</p>
                 <p><b>Date:</b> {mounted ? new Date().toLocaleDateString() : ""}</p>
              </div>
           </div>
           <h3 className="bg-slate-100 p-2 font-black uppercase text-xs mb-4">Payment History</h3>
           <table className="w-full text-left text-xs mb-10">
              <thead><tr className="border-b-2 border-black"><th>Month/Year</th><th className="text-right">Amount</th><th className="text-right">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100">
                 {history.map((h, i) => (
                    <tr key={i}>
                       <td className="py-4 font-bold uppercase">{t[h.month as keyof typeof t] || h.month} {h.year}</td>
                       <td className="text-right font-black">৳ {Number(h.amount).toLocaleString()}</td>
                       <td className={`text-right font-black uppercase ${h.status.toLowerCase() === 'paid' ? 'text-green-600' : 'text-red-500'}`}>{h.status.toLowerCase() === 'paid' ? t.paid : t.unpaid}</td>
                    </tr>
                 ))}
              </tbody>
           </table>
           <div className="mt-32 border-t border-black pt-2 text-center w-64 ml-auto">
              <p className="text-[10px] font-black uppercase">{t.authorizedSign}</p>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, icon, color = "text-slate-800" }: { label: string, value: string | number, icon: string, color?: string }) {
  return (
    <div className="bg-white p-8 rounded-[40px] border border-slate-100 group hover:shadow-2xl transition-all duration-500">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="flex items-center gap-4">
        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{icon}</span>
        <p className={`text-xl font-black tracking-tight ${color}`}>{value}</p>
      </div>
    </div>
  );
}