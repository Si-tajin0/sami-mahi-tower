"use client";
import { useState, useEffect, use } from "react"; 
import { useRouter } from "next/navigation";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";
import Link from "next/link";
import Cookies from "js-cookie";
import FancyToast from "@/app/components/FancyToast";

// ইন্টারফেসসমূহ
interface TenantData { 
  _id: string; name: string; phone: string; flatNo: string; 
  rentAmount: number; tenantId: string; 
  profilePic?: string; // ম্যানেজার কর্তৃক আপলোড করা ছবি এখানে আসবে
}

interface PaymentRecord { 
  _id: string; month: keyof DictionaryContent; year: number; 
  rentAmount: number; serviceCharge: number; status: "Paid" | "Unpaid"; 
  method?: "Cash" | "Online"; amount?: number; 
}

interface NoticeRecord { _id: string; title: string; message: string; createdAt: string; }

export default function TenantDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [lang, setLang] = useState<Language>("bn");
  const t = dictionary[lang];

  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);
  
  // হিস্ট্রি কন্ট্রোল স্টেট
  const [showAllHistory, setShowAllHistory] = useState(false);

  // স্টেটসমূহ
  const [complaintForm, setComplaintForm] = useState({ subject: "", message: "" });
  const [passForm, setPassForm] = useState({ current: "", new: "" });
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });

  const formatNum = (n: number) => `৳ ${n.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  const loadData = async () => {
    if (!id) return;
    try {
      const [tenantRes, paymentRes, noticeRes] = await Promise.all([
        fetch(`/api/tenants/${id}`),
        fetch(`/api/payments/tenant/${id}`),
        fetch(`/api/notices`)
      ]);

      if (tenantRes.ok) { 
        const d = await tenantRes.json(); 
        setTenant(d.data); 
      }
      if (paymentRes.ok) { 
        const d = await paymentRes.json(); 
        setHistory(d.data); 
      }
      if (noticeRes.ok) { 
        const d = await noticeRes.json(); 
        setNotices(d.data); 
      }
    } catch (err) { 
      console.error("ডেটা লোড এরর:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, [id]);

  const showNotification = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message: msg, type });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tenants/change-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, currentPassword: passForm.current, newPassword: passForm.new })
      });
      const result = await res.json();
      if (result.success) {
        showNotification(t.passChanged, "success");
        setPassForm({ current: "", new: "" });
      } else {
        showNotification(t.passError, "error");
      }
    } catch (err) { 
      const error = err as Error;
    console.error("", error.message);
      showNotification("Server Error", "error"); 
    }
  };

  const handleComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          tenantId: id, 
          tenantName: tenant?.name, 
          flatNo: tenant?.flatNo, 
          subject: complaintForm.subject, 
          message: complaintForm.message 
        })
      });
      if (res.ok) {
        showNotification(lang === "bn" ? "অভিযোগ সফলভাবে পাঠানো হয়েছে" : "Complaint Sent", "success");
        setComplaintForm({ subject: "", message: "" });
      }
    } catch (err) { 
      const error = err as Error;
    console.error("", error.message);
      showNotification("Error", "error"); 
    }
  };

  const handleLogout = () => {
    Cookies.remove("user-role"); 
    Cookies.remove("user-id");
    router.push("/login");
  };

  // মোট পেইড হিস্ট্রি
  const totalPaid = history
    .filter(p => p.status === "Paid")
    .reduce((acc, curr) => acc + (curr.rentAmount || curr.amount || 0) + (curr.serviceCharge || 0), 0);

  // পেমেন্ট হিস্ট্রি স্লাইসিং (১০টি অথবা সব)
  const displayedHistory = showAllHistory ? history : history.slice(0, 10);

  if (loading || !mounted) return <div className="min-h-screen flex items-center justify-center bg-white font-black animate-pulse text-blue-600 uppercase tracking-[0.3em]">Sami & Mahi Tower...</div>;

  if (!tenant) return <div className="min-h-screen flex flex-col items-center justify-center">Tenant Not Found</div>;

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 md:p-10 font-sans text-slate-900 selection:bg-blue-100">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* হেডার */}
        <header className="bg-white/70 backdrop-blur-xl p-6 rounded-[35px] shadow-2xl border border-white flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
          <div className="flex items-center gap-4">
            <Link href="/" className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg italic transition-transform hover:rotate-6">SM</Link>
            <div>
              <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-800 leading-none">Resident Portal</h1>
              <p className="text-[9px] font-bold text-blue-600 tracking-widest uppercase mt-1 tracking-tighter">Flat No: {tenant.flatNo}</p>
            </div>
          </div>
          <Link 
    href="/" 
    className="px-5 py-2.5 bg-white text-slate-700 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2"
  >
    🏠 {lang === 'bn' ? 'হোম' : 'Home'}
  </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => window.print()} className="px-5 py-2.5 bg-blue-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg shadow-blue-200 hover:bg-blue-700">🖨️ {t.printStatement}</button>
            <button onClick={() => setLang(lang === "en" ? "bn" : "en")} className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-sm">{lang === "en" ? "বাংলা" : "English"}</button>
            <button onClick={handleLogout} className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-sm">Logout</button>
          </div>
        </header>

        {/* স্বাগতম ব্যানার */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-950 p-12 rounded-[50px] text-white shadow-2xl relative overflow-hidden group no-print">
           <div className="absolute top-0 right-0 p-12 opacity-10 font-black text-9xl italic uppercase select-none group-hover:scale-110 transition-transform duration-700">SM</div>
           <div className="relative z-10 text-center md:text-left">
              <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-4 border border-white/20 italic">Verified Resident Profile</span>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none">{t.welcomeTenant}, {tenant.name}!</h2>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-8">
                <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                   <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Flat Number</p>
                   <p className="text-xl font-black italic tracking-tighter">{tenant.flatNo}</p>
                </div>
                <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10">
                   <p className="text-[8px] font-black uppercase opacity-60 tracking-widest">Total Paid History</p>
                   <p className="text-xl font-black italic tracking-tighter">{formatNum(totalPaid)}</p>
                </div>
              </div>
           </div>
        </div>

        {/* ডিজিটাল রেসিডেন্ট আইডি কার্ড (প্রোফাইল পিকচার সহ) */}
        <div className="bg-white p-8 md:p-12 rounded-[50px] shadow-2xl border border-white relative overflow-hidden group no-print">
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-50 rounded-full opacity-40 group-hover:scale-110 transition-transform duration-1000"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    
                    {/* প্রোফাইল পিকচার ফ্রেম */}
                    <div className="w-36 h-36 md:w-44 md:h-44 rounded-[40px] overflow-hidden border-4 border-white shadow-2xl relative bg-slate-100 flex items-center justify-center">
                        {tenant.profilePic ? (
                            <img src={tenant.profilePic} alt={tenant.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-6xl font-black text-blue-200 italic">{tenant.name.charAt(0)}</span>
                        )}
                        <div className="absolute inset-0 border-[10px] border-white/20 pointer-events-none"></div>
                    </div>

                    <div className="text-center md:text-left space-y-2">
                        <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-[0.3em] mb-2 leading-none">Official Resident Identity</div>
                        <h3 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter italic">{tenant.name}</h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                            <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Login ID</p>
                                <p className="text-sm font-black text-blue-600">#{tenant.tenantId}</p>
                            </div>
                            <div className="px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Unit No</p>
                                <p className="text-sm font-black text-slate-800">{tenant.flatNo}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center gap-3">
                    <div className="p-4 bg-slate-50 rounded-[35px] border border-slate-100 shadow-inner">
                        {/* Digital Verification Icon */}
                        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-sm italic font-black text-blue-600/20 group-hover:text-blue-600 group-hover:scale-110 transition-all duration-700">
                            SM
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            navigator.clipboard.writeText(tenant.tenantId);
                            showNotification(lang === 'bn' ? "আইডি কপি করা হয়েছে" : "ID Copied", "success");
                        }}
                        className="text-[10px] font-black uppercase text-blue-600 hover:text-indigo-700 tracking-[0.2em]"
                    >
                        [ Copy My ID ]
                    </button>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
           <div className="lg:col-span-4 space-y-8">
              {/* নোটিশ বোর্ড */}
              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-white">
                <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-3">
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></span> {t.noticeBoard}
                </h3>
                <div className="space-y-4">
                   {notices.map((n) => (
                     <div key={n._id} className="p-5 bg-slate-50 rounded-[30px] border-l-4 border-blue-500 hover:bg-white transition-all duration-300 shadow-sm">
                        <h4 className="font-black text-slate-800 text-sm leading-tight mb-2 uppercase">{n.title}</h4>
                        <p className="text-slate-500 text-[11px] leading-relaxed font-medium">{n.message}</p>
                     </div>
                   ))}
                </div>
              </div>

              {/* পাসওয়ার্ড পরিবর্তন */}
              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-blue-100">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-6 flex items-center gap-2">🔐 {t.changePassword}</h3>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <input type="password" placeholder={t.currentPassword} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-xs focus:border-blue-500 transition-all" value={passForm.current} onChange={(e)=>setPassForm({...passForm, current: e.target.value})} required />
                  <input type="password" placeholder={t.newPassword} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-xs focus:border-blue-500 transition-all" value={passForm.new} onChange={(e)=>setPassForm({...passForm, new: e.target.value})} required />
                  <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-blue-700 transition-all">{t.updatePassword}</button>
                </form>
              </div>

              {/* অভিযোগ ফরম */}
              <div className="bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-6 flex items-center gap-2">📢 {t.sendComplaint}</h3>
                <form onSubmit={handleComplaint} className="space-y-4">
                  <input type="text" placeholder={t.subject} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-xs focus:border-red-500 transition-all" value={complaintForm.subject} onChange={(e) => setComplaintForm({...complaintForm, subject: e.target.value})} required />
                  <textarea placeholder={t.message} rows={3} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none font-bold text-xs focus:border-red-500 transition-all" value={complaintForm.message} onChange={(e) => setComplaintForm({...complaintForm, message: e.target.value})} required></textarea>
                  <button type="submit" className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-red-600 transition-all">{t.submit}</button>
                </form>
              </div>
           </div>

           {/* ভাড়ার ইতিহাস (১০টি লিমিটেড + View All) */}
           <div className="lg:col-span-8 bg-white p-10 rounded-[50px] shadow-xl border border-white">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-800">{t.myRentHistory}</h3>
                 {!showAllHistory && history.length > 10 && (
                    <button 
                       onClick={() => setShowAllHistory(true)}
                       className="text-[9px] font-black uppercase text-blue-600 hover:underline tracking-widest"
                    >
                       {lang === 'bn' ? '[ সব দেখুন ]' : '[ View All ]'}
                    </button>
                 )}
              </div>
              <div className="space-y-5">
                 {displayedHistory.map((p) => (
                   <div key={p._id} className="flex flex-col md:flex-row justify-between items-center p-6 bg-slate-50/50 rounded-[35px] border border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl transition-all duration-500 group shadow-sm">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center font-black text-blue-600 text-sm shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all italic tracking-tighter">SM</div>
                        <div>
                          <p className="font-black text-slate-800 uppercase text-xs tracking-tighter">{t[p.month] || p.month} {p.year}</p>
                          <div className="flex items-center gap-3 mt-1">
                             <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rent: {formatNum(p.rentAmount || p.amount || 0)}</span>
                             <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                             <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest">SC: {formatNum(p.serviceCharge || 0)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-center md:text-right mt-4 md:mt-0">
                        <div className="flex items-center gap-2 justify-center md:justify-end mb-2">
                           <span className="text-xs font-black text-slate-900">{formatNum((p.rentAmount || p.amount || 0) + (p.serviceCharge || 0))}</span>
                           <span className="text-lg">{p.method === 'Online' ? '📱' : '💵'}</span>
                        </div>
                        <span className={`text-[8px] font-black uppercase px-5 py-2 rounded-full shadow-sm transition-all ${p.status === 'Paid' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>{p.status}</span>
                      </div>
                   </div>
                 ))}
                 
                 {showAllHistory && (
                    <button 
                       onClick={() => setShowAllHistory(false)}
                       className="w-full py-4 text-[9px] font-black uppercase text-slate-400 hover:text-blue-600"
                    >
                       {lang === 'bn' ? 'সংক্ষিপ্ত করুন' : 'Show Less'}
                    </button>
                 )}
              </div>
           </div>
        </div>

        {/* প্রিন্ট টেম্পলেট */}
        <div className="hidden print:block p-10 bg-white min-h-screen border-[12px] border-double border-slate-300">
            {/* ... প্রিন্ট টেম্পলেট আগের মতোই থাকবে ... */}
            <div className="text-center border-b-4 border-slate-900 pb-6 mb-10">
              <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Sami & Mahi Tower</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-2">Resident Financial Statement</p>
           </div>
           <div className="grid grid-cols-2 gap-10 mb-10 text-sm">
              <div className="space-y-2">
                 <p><span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Name</span> <b>{tenant.name}</b></p>
                 <p><span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Flat Number</span> <b>{tenant.flatNo}</b></p>
              </div>
              <div className="text-right space-y-2">
                 <p><span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Resident ID</span> <b>#{tenant.tenantId}</b></p>
                 <p><span className="text-[9px] font-black uppercase text-slate-400 block tracking-widest">Print Date</span> <b>{new Date().toLocaleDateString()}</b></p>
              </div>
           </div>
           <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-900 font-black uppercase">
                  <th className="py-3">Month/Year</th>
                  <th className="text-right">Rent</th>
                  <th className="text-right">S.Charge</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((p, i) => (
                  <tr key={i}>
                    <td className="py-4 font-bold uppercase">{t[p.month] || p.month} {p.year}</td>
                    <td className="text-right">{formatNum(p.rentAmount || p.amount || 0)}</td>
                    <td className="text-right">{formatNum(p.serviceCharge || 0)}</td>
                    <td className="text-right font-black">{formatNum((p.rentAmount || p.amount || 0) + (p.serviceCharge || 0))}</td>
                  </tr>
                ))}
              </tbody>
           </table>
           <div className="mt-20 text-right"><p className="text-lg font-black uppercase border-t-2 border-slate-900 pt-4 tracking-tighter">Total Lifetime Paid: {formatNum(totalPaid)}</p></div>
        </div>

        {toast.show && <FancyToast message={toast.message} type={toast.type} onClose={() => setToast({...toast, show: false})} />}
      </div>
    </div>
  );
}