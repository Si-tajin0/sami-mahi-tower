"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";
import FancyToast from "@/app/components/FancyToast";

// ১. ইন্টারফেসসমূহ
interface Tenant { 
  _id: string; name: string; tenantId: string; flatNo: string; 
  rentAmount: number; phone: string; nid: string; 
  occupation: string; securityDeposit: number; emergencyContact: string; 
  status?: string; exitDate?: string;
}

interface PaymentRecord { _id: string; tenantId: string; status: string; }

interface RentTrackerProps { 
  lang: Language; month: keyof DictionaryContent; year: number; onUpdate: () => void; 
}

interface LogChange { field: string; old: string | number; new: string | number; }

export default function RentTracker({ lang, month, year, onUpdate }: RentTrackerProps) {
  const t = dictionary[lang];
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

  const fetchData = async (): Promise<void> => {
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
    } catch (err: unknown) { console.error("Data fetch error:", err); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

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
    } catch (err: unknown) { console.error(err); }
  };

  // হোয়াটসঅ্যাপ রিমাইন্ডার ফাংশন
  const sendWhatsAppReminder = (tenant: Tenant) => {
    const monthName = t[month as keyof DictionaryContent];
    const totalAmount = Number(tenant.rentAmount) + Number(serviceCharge);
    const message = lang === 'bn' 
      ? `Sami %26 Mahi Tower: আসসালামু আলাইকুম, ${tenant.name}। আপনার ${monthName} ${year} মাসের ভাড়া এখনো বকেয়া আছে। মোট পরিমাণ: ৳${totalAmount.toLocaleString()}। অনুগ্রহ করে দ্রুত পরিশোধ করুন। ধন্যবাদ।`
      : `Sami %26 Mahi Tower: Assalamu Alaikum, ${tenant.name}. Your rent for ${monthName} ${year} is pending. Total: ৳${totalAmount.toLocaleString()}. Please pay soon. Thank you.`;

    const formattedPhone = tenant.phone.startsWith('0') ? `88${tenant.phone}` : tenant.phone;
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModal || !newPassword) return;
    if (newPassword.length < 4) {
      showToast(lang === 'bn' ? "পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে!" : "Password too short!", "error");
      return;
    }

    setResetLoading(true);
    try {
      const res = await fetch("/api/tenants/reset-password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: resetModal._id, newPassword }),
      });
      const result = await res.json();
      if (result.success) {
        await sendActivityLog("পাসওয়ার্ড রিসেট", `${resetModal.name} এর পাসওয়ার্ড আপডেট করা হয়েছে।`);
        showToast(lang === 'bn' ? "পাসওয়ার্ড রিসেট সফল!" : "Password Reset Success!");
        setResetModal(null);
        setNewPassword("");
      } else {
        showToast(result.message, "error");
      }
    } catch  {
      showToast("Error!", "error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmPayment = async (): Promise<void> => {
    if (!payModal) return;
    const { tenant, status } = payModal;
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant._id, month, year, rentAmount: tenant.rentAmount,
          serviceCharge: Number(serviceCharge), status: status, method: paymentMethod 
        })
      });
      if (res.ok) {
        await sendActivityLog("ভাড়া আপডেট", `${tenant.name} এর ${t[month]} পেমেন্ট ${status} করা হয়েছে।`);
        showToast(lang === "bn" ? "ভাড়া আপডেট সফল!" : "Payment Updated!");
        setPayModal(null);
        fetchData();
        onUpdate();
      }
    } catch (err: unknown) { console.error(err); showToast("Error!", "error"); }
  };

  const handleUpdate = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!editingTenant || !originalTenant) return;
    const changedFields: LogChange[] = [];
    if (originalTenant.name !== editingTenant.name) changedFields.push({ field: "Name", old: originalTenant.name, new: editingTenant.name });
    if (Number(originalTenant.rentAmount) !== Number(editingTenant.rentAmount)) changedFields.push({ field: "Rent", old: originalTenant.rentAmount, new: editingTenant.rentAmount });

    try {
      const res = await fetch(`/api/tenants/${editingTenant._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTenant),
      });
      if (res.ok) {
        if (changedFields.length > 0) await sendActivityLog("তথ্য সংশোধন", `${editingTenant.name} এর তথ্য আপডেট করা হয়েছে।`, changedFields);
        setEditingTenant(null); 
        showToast(lang === "bn" ? "তথ্য আপডেট হয়েছে!" : "Update Successful!");
        fetchData();
        onUpdate();
      }
    } catch (err: unknown) { console.error(err); }
  };

  const handleMoveOut = async (tenant: Tenant) => {
    if (confirm(lang === 'bn' ? `${tenant.name} কি বাসা ছেড়ে দিচ্ছেন?` : `Move out ${tenant.name}?`)) {
      try {
        const res = await fetch(`/api/tenants/${tenant._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "Exited", exitDate: new Date() }),
        });
        if (res.ok) {
          await sendActivityLog("বাসা ছেড়ে দেওয়া", `${tenant.name} বাসা ছেড়ে দিয়েছেন।`);
          showToast(lang === "bn" ? "ভাড়াটিয়া এক্সিট করা হয়েছে" : "Tenant Exited!");
          fetchData();
          onUpdate();
        }
      } catch (err: unknown) { console.error(err); }
    }
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
    <div className="bg-white p-4 md:p-10 rounded-[40px] md:rounded-[50px] shadow-2xl border border-slate-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-slate-800 uppercase tracking-tighter italic leading-none">
            {t.rentStatus} - <span className="text-blue-600">{t[month]} {year}</span>
          </h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-2">Sami & Mahi Tower • Management Console</p>
        </div>
        <div className="w-12 h-1 bg-blue-100 rounded-full hidden md:block"></div>
      </div>
      
      {/* ১. ডেস্কটপ ভিউ (Table) */}
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
                <tr key={tenant._id} className={`transition-all duration-300 ${isExited ? 'opacity-40 grayscale bg-slate-50' : 'bg-slate-50/50 hover:bg-white hover:shadow-2xl group'}`}>
                  <td className="py-7 px-6 rounded-l-[35px] font-black text-blue-600 italic tracking-tighter">
                    <Link href={`/manager/tenants/${tenant._id}`} className="hover:underline">#{tenant.tenantId}</Link>
                  </td>
                  <td className="py-7 font-black text-slate-900 text-lg">{tenant.flatNo}</td>
                  <td className="py-7 font-bold text-slate-700 text-sm">{tenant.name}</td>
                  <td className="py-7 font-black text-slate-800 tracking-tight">৳ {tenant.rentAmount.toLocaleString()}</td>
                  <td className="py-7 px-6 rounded-r-[35px] text-center no-print">
                     <div className="flex gap-3 justify-center items-center">
                        {!isExited && (
                          <button 
                            onClick={() => setPayModal({ tenant, status: isPaid ? "Unpaid" : "Paid" })}
                            className={`px-7 py-2.5 rounded-full text-[10px] font-black uppercase transition-all shadow-lg active:scale-90 ${isPaid ? 'bg-emerald-500 text-white shadow-emerald-200' : 'bg-white border-2 border-slate-200 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                          >
                            {isPaid ? t.paid : t.unpaid}
                          </button>
                        )}
                        {!isPaid && !isExited && (
                          <button onClick={() => sendWhatsAppReminder(tenant)} className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100" title="WhatsApp Reminder">💬</button>
                        )}
                        {!isExited && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setResetModal(tenant)} className="w-10 h-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center hover:bg-amber-600 hover:text-white shadow-sm transition-all">🔑</button>
                            <button onClick={() => { setEditingTenant({...tenant}); setOriginalTenant({...tenant}); }} className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white shadow-sm transition-all">✏️</button>
                            <button onClick={() => handleMoveOut(tenant)} className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center hover:bg-orange-600 hover:text-white shadow-sm transition-all">🚪</button>
                          </div>
                        )}
                        <button onClick={() => { if(confirm(t.confirmDelete)) fetch(`/api/tenants/${tenant._id}`, {method:'DELETE'}).then(()=>fetchData()) }} className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white shadow-sm transition-all">🗑️</button>
                     </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ২. মোবাইল ভিউ (Card Layout) */}
      <div className="grid grid-cols-1 gap-5 md:hidden">
        {filteredTenants.map((tenant) => {
          const pRecord = payments.find(p => p.tenantId.toString() === tenant._id.toString());
          const isPaid = pRecord?.status === "Paid";
          const isExited = tenant.status === "Exited";

          return (
            <div key={tenant._id} className={`p-6 rounded-[35px] border-2 transition-all duration-300 ${isExited ? 'opacity-50 grayscale bg-slate-100' : isPaid ? 'bg-white border-emerald-100 shadow-xl shadow-emerald-900/5' : 'bg-white border-slate-100 shadow-lg'}`}>
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-xl italic shadow-lg">
                    {tenant.flatNo}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-sm uppercase leading-none mb-1">{tenant.name}</h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">ID: #{tenant.tenantId}</p>
                  </div>
                </div>
                {!isExited && (
                  <button 
                    onClick={() => setPayModal({ tenant, status: isPaid ? "Unpaid" : "Paid" })}
                    className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase shadow-md transition-all active:scale-90 ${isPaid ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                  >
                    {isPaid ? t.paid : t.unpaid}
                  </button>
                )}
              </div>

              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-[25px] border border-slate-100 shadow-inner">
                <div>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Amount</p>
                  <p className="text-sm font-black text-slate-900">৳ {tenant.rentAmount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  {!isPaid && !isExited && (
                    <button onClick={() => sendWhatsAppReminder(tenant)} className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl shadow-sm flex items-center justify-center border border-emerald-200">💬</button>
                  )}
                  {!isExited && (
                    <>
                      <button onClick={() => setResetModal(tenant)} className="w-9 h-9 bg-white text-amber-600 rounded-xl shadow-sm flex items-center justify-center border border-slate-200">🔑</button>
                      <button onClick={() => { setEditingTenant({...tenant}); setOriginalTenant({...tenant}); }} className="w-9 h-9 bg-white text-blue-600 rounded-xl shadow-sm flex items-center justify-center border border-slate-200">✏️</button>
                    </>
                  )}
                  <button onClick={() => { if(confirm(t.confirmDelete)) fetch(`/api/tenants/${tenant._id}`, {method:'DELETE'}).then(()=>fetchData()) }} className="w-9 h-9 bg-rose-50 text-rose-600 rounded-xl shadow-sm flex items-center justify-center border border-rose-100">🗑️</button>
                </div>
              </div>
              {isExited && <p className="text-center text-[9px] font-black text-red-500 uppercase mt-3 italic tracking-widest">Resident Moved Out</p>}
            </div>
          );
        })}
      </div>

      {/* --- ৩. পাসওয়ার্ড রিসেট মোডাল --- */}
      {resetModal && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-amber-500 to-orange-700 p-8 text-white text-center relative">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-50">Security Override</span>
               <h3 className="text-2xl font-black uppercase tracking-tighter mt-2 italic leading-none">Reset Password</h3>
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

      {/* --- পেমেন্ট কনফার্মেশন মোডাল --- */}
      {payModal && (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[50px] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95 duration-300">
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-8 text-white text-center relative">
               <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40">Payment Confirmation</span>
               <h3 className="text-2xl font-black uppercase tracking-tighter mt-2 italic leading-none">Confirm Receipt</h3>
               <button onClick={() => setPayModal(null)} className="absolute top-6 right-8 text-white/50 hover:text-white transition-colors">✕</button>
            </div>
            <div className="p-10 space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resident</p>
                 <p className="text-sm font-black text-slate-800 uppercase italic leading-none">{payModal.tenant.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-5 bg-slate-50 rounded-3xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Monthly Rent</p>
                    <p className="text-lg font-black text-slate-800 leading-none">৳ {payModal.tenant.rentAmount}</p>
                 </div>
                 <div className="p-5 bg-blue-50 rounded-3xl border border-blue-100">
                    <p className="text-[9px] font-black text-blue-400 uppercase mb-1">Service Charge</p>
                    <input type="number" className="bg-transparent w-full outline-none font-black text-lg text-blue-700" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
                 </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payment Method</p>
                <div className="flex gap-2 p-1.5 bg-slate-50 rounded-[22px] border border-slate-100">
                   <button onClick={() => setPaymentMethod("Cash")} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase transition-all ${paymentMethod === 'Cash' ? 'bg-white text-orange-600 shadow-xl' : 'text-slate-400'}`}>💵 Cash</button>
                   <button onClick={() => setPaymentMethod("Online")} className={`flex-1 py-3 rounded-[18px] text-[10px] font-black uppercase transition-all ${paymentMethod === 'Online' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-400'}`}>📱 Online</button>
                </div>
              </div>
              <div className="bg-slate-900 p-6 rounded-[35px] text-white flex justify-between items-center shadow-2xl">
                 <span className="text-[10px] font-black uppercase opacity-40">Total Amount</span>
                 <span className="text-2xl font-black italic tracking-tighter">৳ {(Number(payModal.tenant.rentAmount) + Number(serviceCharge)).toLocaleString()}</span>
              </div>
              <button onClick={handleConfirmPayment} className="w-full bg-blue-600 text-white py-5 rounded-[25px] font-black uppercase text-xs tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95">Confirm & Post Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* --- এডিট মোডাল --- */}
      {editingTenant && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[60px] overflow-hidden shadow-2xl border border-white animate-in zoom-in-95 duration-300">
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

function EditInput({ label, value, onChange, type = "text" }: { label: string, value: string | number, onChange: (v: string) => void, type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-widest">{label}</label>
      <input type={type} className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-[25px] outline-none font-bold text-slate-700 focus:border-blue-500 focus:bg-white transition-all shadow-inner" value={value} onChange={(e)=>onChange(e.target.value)} required />
    </div>
  );
}