"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";
import FancyToast from "@/app/components/FancyToast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- ১. ইন্টারফেসসমূহ ---
interface Tenant { 
  _id: string; name: string; tenantId: string; flatNo: string; 
  rentAmount: number; phone: string; nid: string; 
  occupation: string; securityDeposit: number; emergencyContact: string; 
  status?: string; exitDate?: string; familyMembers?: number; // আপডেট করা হয়েছে
}
interface PaymentRecord { 
  _id: string; tenantId: string; status: string; 
  serviceCharge?: number; rentAmount?: number;
}
interface RentTrackerProps { 
  lang: Language; month: keyof DictionaryContent; year: number; onUpdate: () => void; 
}
interface LogChange { field: string; old: string | number; new: string | number; }

// ২. রিসিট ডাটা ইন্টারফেস (ESLint এরর ফিক্সের জন্য নিচে ব্যবহৃত হয়েছে)
interface ReceiptData {
  tenantName: string; flatNo: string; month: string; year: number;
  amount: number; serviceCharge: number; paymentId: string;
}

export default function RentTracker({ lang, month, year, onUpdate }: RentTrackerProps) {
  const t = dictionary[lang];
  
  // --- স্টেটস ---
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Online">("Cash");
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [originalTenant, setOriginalTenant] = useState<Tenant | null>(null);
  const [payModal, setPayModal] = useState<{tenant: Tenant, status: string} | null>(null);
  const [serviceCharge, setServiceCharge] = useState<string>("500");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" as "success" | "error" });
  const [resetModal, setResetModal] = useState<Tenant | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  // --- ডাটা ফেচিং ---
  const fetchData = useCallback(async (): Promise<void> => {
    try {
      const timestamp = new Date().getTime();
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/tenants?t=${timestamp}`),
        fetch(`/api/payments?month=${month}&year=${year}&t=${timestamp}`)
      ]);
      const tData = await tRes.json();
      const pData = await pRes.json();
      if (tData.success) setTenants(tData.data as Tenant[]);
      if (pData.success) setPayments(pData.data as PaymentRecord[]);
    } catch (err) { console.error("Data fetch error:", err); }
  }, [month, year]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- হেল্পার ফাংশনসমূহ ---
  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message: msg, type });
  };

  const sendActivityLog = async (action: string, details: string, changes: LogChange[] = []) => {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, details, changes })
      });
    } catch (err) { console.error(err); }
  };

  const downloadReceipt = async (id: string, fileName: string) => {
    const element = document.getElementById(id);
    if (!element) return;
    showToast(lang === 'bn' ? "রশিদ তৈরি হচ্ছে..." : "Generating Receipt...");
    try {
      const canvas = await html2canvas(element, { 
        scale: 2, useCORS: true, backgroundColor: "#ffffff",
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById(id);
          if (el) { el.style.display = "block"; el.style.visibility = "visible"; }
        }
      });
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pdfWidth - 20; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight, undefined, 'FAST');
      pdf.save(`${fileName}.pdf`);
    } catch { showToast("Download Failed", "error"); }
  };

  const sendWhatsAppReminder = (tenant: Tenant) => {
    const monthName = t[month as keyof DictionaryContent];
    const totalAmount = Number(tenant.rentAmount) + Number(serviceCharge);
    const message = lang === 'bn' 
      ? `Sami %26 Mahi Tower: আসসালামু আলাইকুম, ${tenant.name}। আপনার ${monthName} ${year} মাসের ভাড়া বকেয়া আছে। মোট: ৳${totalAmount.toLocaleString()}।`
      : `Sami %26 Mahi Tower: Assalamu Alaikum, ${tenant.name}. Rent for ${monthName} ${year} is pending. Total: ৳${totalAmount.toLocaleString()}.`;
    const formattedPhone = tenant.phone.startsWith('0') ? `88${tenant.phone}` : tenant.phone;
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  // --- হ্যান্ডলারসমূহ ---
  const handleDeleteTenant = async (tenant: Tenant) => {
    if (!confirm(t.confirmDelete)) return;
    try {
      const res = await fetch(`/api/tenants/${tenant._id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast(lang === 'bn' ? "সফলভাবে মুছে ফেলা হয়েছে" : "Deleted successfully", "success");
        fetchData();
        onUpdate();
      }
    } catch { showToast("Error", "error"); }
  };

  const handleMoveOut = async (tenant: Tenant) => {
    if (!confirm(lang === 'bn' ? `${tenant.name} কি বাসা ছেড়ে দিচ্ছেন?` : `Move out?`)) return;
    try {
      const res = await fetch(`/api/tenants/${tenant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Exited", exitDate: new Date() }),
      });
      if (res.ok) {
        await sendActivityLog("বাসা ছেড়ে দেওয়া", `${tenant.name} বাসা ছেড়ে দিয়েছেন।`);
        showToast(lang === "bn" ? "ভাড়াটিয়া এক্সিট করা হয়েছে" : "Exited!", "success");
        fetchData(); onUpdate();
      }
    } catch { console.error("Error"); }
  };

  const handleUpdate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingTenant || !originalTenant) return;
    
    // LogChange এবং originalTenant ব্যবহার করা হয়েছে এরর ফিক্স করতে
    const changes: LogChange[] = [];
    if (originalTenant.name !== editingTenant.name) changes.push({ field: "Name", old: originalTenant.name, new: editingTenant.name });
    if (originalTenant.rentAmount !== editingTenant.rentAmount) changes.push({ field: "Rent", old: originalTenant.rentAmount, new: editingTenant.rentAmount });
    if (originalTenant.familyMembers !== editingTenant.familyMembers) changes.push({ field: "Members", old: originalTenant.familyMembers || 0, new: editingTenant.familyMembers || 0 });

    try {
      const res = await fetch(`/api/tenants/${editingTenant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTenant),
      });
      if (res.ok) {
        if (changes.length > 0) await sendActivityLog("তথ্য সংশোধন", `${editingTenant.name} এর তথ্য আপডেট করা হয়েছে।`, changes);
        setEditingTenant(null); fetchData(); onUpdate();
        showToast(lang === 'bn' ? "আপডেট সফল!" : "Update Success!", "success");
      }
    } catch { showToast("Error", "error"); }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModal || !newPassword) return;
    setResetLoading(true);
    try {
      const res = await fetch("/api/tenants/reset-password", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: resetModal._id, newPassword }),
      });
      if ((await res.json()).success) {
        showToast(lang === 'bn' ? "পাসওয়ার্ড রিসেট সফল!" : "Success!");
        setResetModal(null); setNewPassword("");
      }
    } catch { showToast("Error", "error"); } finally { setResetLoading(false); }
  };

  const handleConfirmPayment = async (): Promise<void> => {
    if (!payModal) return;
    const { tenant, status } = payModal;
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant._id, month, year, rentAmount: tenant.rentAmount,
          serviceCharge: Number(serviceCharge), status: status, method: paymentMethod 
        })
      });
      if (res.ok) {
        await sendActivityLog("ভাড়া আপডেট", `${tenant.name} এর পেমেন্ট ${status} করা হয়েছে।`);
        setPayModal(null); fetchData(); onUpdate();
        showToast(lang === "bn" ? "ভাড়া আপডেট সফল!" : "Updated!");
      }
    } catch { showToast("Error!", "error"); }
  };

  const filteredTenants = tenants.filter((tenant) => {
    if (tenant.status !== "Exited") return true;
    if (tenant.status === "Exited" && tenant.exitDate) {
      const exitD = new Date(tenant.exitDate);
      const mList = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
      const selectedMIndex = mList.indexOf(month);
      if (year < exitD.getFullYear()) return true;
      if (year === exitD.getFullYear() && selectedMIndex <= exitD.getMonth()) return true;
    }
    return false;
  });

  return (
    <div className="bg-white p-4 md:p-10 rounded-[40px] md:rounded-[50px] shadow-2xl border border-slate-100 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
            {t.rentStatus} - <span className="text-blue-600">{t[month]} {year}</span>
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Sami & Mahi Tower • Console</p>
        </div>
        <div className="w-12 h-1 bg-blue-100 rounded-full hidden md:block"></div>
      </div>
      
      {/* ১. ডেস্কটপ টেবিল ভিউ */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
             <tr className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em]">
                <th className="px-6 pb-2">ID</th>
                <th className="pb-2">Flat</th>
                <th className="pb-2">Name</th>
                <th className="pb-2">Rent</th>
                <th className="text-center pb-2 no-print">Actions</th>
             </tr>
          </thead>
          <tbody>
            {filteredTenants.map((tenant) => {
              const pRecord = payments.find(p => p.tenantId.toString() === tenant._id.toString());
              const isPaid = pRecord?.status === "Paid";
              const isExited = tenant.status === "Exited";
              return (
                <tr key={tenant._id} className={`transition-all duration-300 ${isExited ? 'opacity-40 grayscale bg-slate-50' : 'bg-slate-50/50 hover:bg-white group'}`}>
                  <td className="py-7 px-6 rounded-l-[35px] font-black text-blue-600 italic leading-none">
                    <Link href={`/manager/tenants/${tenant._id}`}>#{tenant.tenantId}</Link>
                  </td>
                  <td className="py-7 font-black text-slate-900 text-lg leading-none">{tenant.flatNo}</td>
                  <td className="py-7 font-bold text-slate-700 text-sm leading-none">{tenant.name}</td>
                  <td className="py-7 font-black text-slate-800 tracking-tight leading-none">৳ {tenant.rentAmount.toLocaleString()}</td>
                  <td className="py-7 px-6 rounded-r-[35px] text-center no-print leading-none">
                     <div className="flex gap-3 justify-center items-center">
                        {!isExited && (
                          <button onClick={() => setPayModal({ tenant, status: isPaid ? "Unpaid" : "Paid" })} className={`px-7 py-2.5 rounded-full text-[10px] font-black uppercase shadow-lg active:scale-90 ${isPaid ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white border-2 border-slate-200 text-rose-500 hover:bg-rose-500 hover:text-white'}`}>{isPaid ? t.paid : t.unpaid}</button>
                        )}
                        {isPaid && <button onClick={() => downloadReceipt(`receipt-${pRecord?._id}`, `Receipt_${tenant.flatNo}`)} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm">📄</button>}
                        {!isPaid && !isExited && <button onClick={() => sendWhatsAppReminder(tenant)} className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100 shadow-sm">💬</button>}
                        {!isExited && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setResetModal(tenant)} className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-sm">🔑</button>
                            <button onClick={() => { setEditingTenant({...tenant}); setOriginalTenant({...tenant}); }} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">✏️</button>
                            <button onClick={() => handleMoveOut(tenant)} className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shadow-sm">🚪</button>
                          </div>
                        )}
                        {isPaid && pRecord && (
                           <ReceiptTemplate id={`receipt-${pRecord._id}`} data={{ tenantName: tenant.name, flatNo: tenant.flatNo, month: String(t[month] || month), year, amount: tenant.rentAmount, serviceCharge: Number(pRecord.serviceCharge || 500), paymentId: pRecord._id }} />
                        )}
                     </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ২. মোবাইল কার্ড ভিউ */}
      <div className="grid grid-cols-1 gap-5 md:hidden">
        {filteredTenants.map((tenant) => {
          const pRecord = payments.find(p => p.tenantId.toString() === tenant._id.toString());
          const isPaid = pRecord?.status === "Paid";
          const isExited = tenant.status === "Exited";
          return (
            <div key={tenant._id} className={`p-6 rounded-[35px] border-2 transition-all ${isExited ? 'opacity-50 grayscale bg-slate-100' : isPaid ? 'bg-white border-emerald-100 shadow-xl' : 'bg-white border-slate-100 shadow-lg'}`}>
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl italic shadow-lg">{tenant.flatNo}</div>
                  <div><h4 className="font-black text-slate-800 text-sm uppercase leading-none">{tenant.name}</h4><p className="text-[9px] font-bold text-slate-400 mt-1 uppercase leading-none">ID: #{tenant.tenantId}</p></div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!isExited && <button onClick={() => setPayModal({ tenant, status: isPaid ? "Unpaid" : "Paid" })} className={`px-5 py-2 rounded-full text-[9px] font-black uppercase shadow-md ${isPaid ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-rose-600'}`}>{isPaid ? t.paid : t.unpaid}</button>}
                  {isPaid && <button onClick={() => downloadReceipt(`receipt-${pRecord?._id}`, `Receipt_${tenant.flatNo}`)} className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase border border-blue-100">📄 Download</button>}
                </div>
              </div>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[25px] border border-slate-100 shadow-inner">
                <div><p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rent</p><p className="text-sm font-black text-slate-900 leading-none">৳ {tenant.rentAmount.toLocaleString()}</p></div>
                <div className="flex gap-2">
                  {!isPaid && !isExited && <button onClick={() => sendWhatsAppReminder(tenant)} className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-200">💬</button>}
                  {!isExited && ( <> <button onClick={() => setResetModal(tenant)} className="w-9 h-9 bg-white text-amber-600 rounded-xl border border-slate-200 shadow-sm">🔑</button> <button onClick={() => { setEditingTenant({...tenant}); setOriginalTenant({...tenant}); }} className="w-9 h-9 bg-white text-blue-600 rounded-xl border border-slate-200 shadow-sm">✏️</button> </> )}
                  <button onClick={() => handleDeleteTenant(tenant)} className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 shadow-sm">🗑️</button>
                </div>
              </div>
              {isPaid && pRecord && (
                <ReceiptTemplate id={`receipt-${pRecord._id}`} data={{ tenantName: tenant.name, flatNo: tenant.flatNo, month: String(t[month] || month), year, amount: tenant.rentAmount, serviceCharge: Number(pRecord.serviceCharge || 500), paymentId: pRecord._id }} />
              )}
            </div>
          );
        })}
      </div>

      {/* --- ৩. পাসওয়ার্ড রিসেট মোডাল --- */}
      {resetModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl overflow-hidden border border-white">
            <div className="bg-gradient-to-br from-amber-500 to-orange-700 p-8 text-white text-center relative">
               <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Reset Password</h3>
               <button onClick={() => setResetModal(null)} className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleResetPassword} className="p-10 space-y-6 text-center">
               <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resident Name</p>
                  <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{resetModal.name}</p>
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 ml-6 uppercase tracking-widest">Enter New Password</label>
                  <input type="text" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[30px] focus:border-amber-500 focus:bg-white outline-none font-bold text-slate-800 text-center text-xl transition-all shadow-inner" placeholder="••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
               </div>
               <button type="submit" disabled={resetLoading} className="w-full bg-slate-900 text-white py-5 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-amber-600 transition-all disabled:opacity-50">
                 {resetLoading ? "Processing..." : "Update Password Now"}
               </button>
            </form>
          </div>
        </div>
      )}

      {/* --- পেমেন্ট কনফার্ম মোডাল --- */}
      {payModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl overflow-hidden border border-white">
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 text-white text-center relative">
               <h3 className="text-2xl font-black uppercase tracking-tighter italic leading-none">Confirm Receipt</h3>
               <button onClick={() => setPayModal(null)} className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100 text-center"><p className="text-[9px] font-black text-slate-400 uppercase mb-1">Rent</p><p className="text-lg font-black text-slate-800 leading-none">৳ {payModal.tenant.rentAmount}</p></div>
                 <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100 text-center"><p className="text-[9px] font-black text-blue-400 uppercase mb-1">Service</p><input type="number" className="bg-transparent w-full outline-none font-black text-lg text-blue-700 text-center" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} /></div>
              </div>
              <div className="flex gap-2 p-1.5 bg-slate-50 rounded-[22px] border border-slate-100">
                   <button onClick={() => setPaymentMethod("Cash")} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase transition-all ${paymentMethod === 'Cash' ? 'bg-white text-orange-600 shadow-xl' : 'text-slate-400'}`}>💵 Cash</button>
                   <button onClick={() => setPaymentMethod("Online")} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase transition-all ${paymentMethod === 'Online' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>📱 Online</button>
                </div>
              <button onClick={handleConfirmPayment} className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95">Confirm & Post</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ৪. এডিট মোডাল (সদস্য সংখ্যা সহ) --- */}
      {editingTenant && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[60px] overflow-hidden shadow-2xl border border-white">
            <div className="bg-gradient-to-r from-blue-700 to-indigo-950 p-10 text-white flex justify-between items-center">
              <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Edit Resident File</h3>
              <button onClick={() => setEditingTenant(null)} className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-xl hover:bg-white/20 transition-all">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="p-12 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[70vh]">
               <EditInput label={t.tenantName} value={editingTenant.name} onChange={(v)=>setEditingTenant({...editingTenant, name: v})} />
               <EditInput label={t.phone} value={editingTenant.phone} onChange={(v)=>setEditingTenant({...editingTenant, phone: v})} />
               <EditInput label={t.nid} value={editingTenant.nid} onChange={(v)=>setEditingTenant({...editingTenant, nid: v})} />
               <EditInput label={t.flat} value={editingTenant.flatNo} onChange={(v)=>setEditingTenant({...editingTenant, flatNo: v})} />
               <EditInput label={t.rent} type="number" value={editingTenant.rentAmount} onChange={(v)=>setEditingTenant({...editingTenant, rentAmount: Number(v)})} />
               <EditInput label={t.securityDeposit} type="number" value={editingTenant.securityDeposit} onChange={(v)=>setEditingTenant({...editingTenant, securityDeposit: Number(v)})} />
               {/* পরিবার সদস্য সংখ্যা এডিট */}
               <EditInput label={lang === 'bn' ? "পরিবার সদস্য" : "Family Members"} type="number" value={editingTenant.familyMembers || 1} onChange={(v)=>setEditingTenant({...editingTenant, familyMembers: Number(v)})} />
               <div className="md:col-span-2 mt-4">
                  <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[30px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all">Save Changes</button>
               </div>
            </form>
          </div>
        </div>
      )}

      {toast.show && <FancyToast message={toast.message} type={toast.type} onClose={() => setToast({...toast, show: false})} />}
    </div>
  );
}

// ৪. রিসিট টেমপ্লেট
function ReceiptTemplate({ id, data }: { id: string, data: ReceiptData }) {
  const total = Number(data.amount) + Number(data.serviceCharge);
  return (
    <div style={{ position: 'fixed', bottom: '-4000px', left: 0, width: '100%', pointerEvents: 'none', zIndex: -1000 }}>
      <div id={id} style={{ width: "180mm", padding: "45px", backgroundColor: "#ffffff", color: "#0f172a", fontFamily: "sans-serif" }}>
        <div style={{ borderBottom: "4px solid #1d4ed8", paddingBottom: "25px", marginBottom: "35px", display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: "30px", fontWeight: "900", color: "#1d4ed8", margin: 0, fontStyle: "italic" }}>Sami & Mahi Tower</h1>
            <p style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", textTransform: "uppercase" }}>Housing Management</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ backgroundColor: "#10b981", color: "#ffffff", padding: "10px 25px", borderRadius: "30px", fontSize: "12px", fontWeight: "900" }}>PAID RECEIPT</div>
            <p style={{ fontSize: "10px", marginTop: "12px", color: "#64748b" }}>REF: {data.paymentId.slice(-10).toUpperCase()}</p>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", marginBottom: "45px" }}>
          <div>
            <p style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Resident</p>
            <h3 style={{ fontSize: "20px", fontWeight: "900", margin: "5px 0" }}>{data.tenantName}</h3>
            <p style={{ color: "#1d4ed8", fontWeight: "800" }}>Flat: {data.flatNo}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "10px", fontWeight: "900", color: "#64748b", textTransform: "uppercase" }}>Billing</p>
            <h3 style={{ fontSize: "22px", fontWeight: "900", margin: "5px 0" }}>{data.month} {data.year}</h3>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "45px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f8fafc" }}>
              <th style={{ padding: "18px", textAlign: "left", fontSize: "12px", borderBottom: "2px solid #e2e8f0" }}>Description</th>
              <th style={{ padding: "18px", textAlign: "right", fontSize: "12px", borderBottom: "2px solid #e2e8f0" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: "18px", borderBottom: "1px solid #f1f5f9" }}>Monthly Rent</td><td style={{ padding: "18px", textAlign: "right", fontWeight: "900", borderBottom: "1px solid #f1f5f9" }}>৳ {data.amount.toLocaleString()}</td></tr>
            <tr><td style={{ padding: "18px", borderBottom: "1px solid #f1f5f9" }}>Service Charge</td><td style={{ padding: "18px", textAlign: "right", fontWeight: "900", borderBottom: "1px solid #f1f5f9" }}>৳ {data.serviceCharge.toLocaleString()}</td></tr>
            <tr style={{ backgroundColor: "#eff6ff" }}><td style={{ padding: "22px", fontSize: "20px", fontWeight: "900", color: "#1d4ed8" }}>Total Paid</td><td style={{ padding: "22px", textAlign: "right", fontSize: "24px", fontWeight: "900", color: "#1d4ed8" }}>৳ {total.toLocaleString()}</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditInput({ label, value, onChange, type = "text" }: { label: string, value: string | number, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">{label}</label>
      <input type={type} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[25px] outline-none font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all shadow-inner" value={value} onChange={(e)=>onChange(e.target.value)} required />
    </div>
  );
}