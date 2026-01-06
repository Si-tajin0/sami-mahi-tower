"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";

interface Tenant { 
  _id: string; name: string; tenantId: string; flatNo: string; 
  rentAmount: number; phone: string; nid: string; 
  occupation: string; securityDeposit: number; emergencyContact: string; 
}

interface Payment { tenantId: string; status: string; }
interface RentTrackerProps { lang: Language; month: keyof DictionaryContent; year: number; onUpdate: () => void; }

export default function RentTracker({ lang, month, year, onUpdate }: RentTrackerProps) {
  const t = dictionary[lang];
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  // ১. ডাটা লোড করার ফাংশন
  const fetchData = async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        fetch("/api/tenants"),
        fetch(`/api/payments?month=${month}&year=${year}`)
      ]);
      const tData = await tRes.json();
      const pData = await pRes.json();
      if (tData.success) setTenants(tData.data as Tenant[]);
      if (pData.success) setPayments(pData.data as Payment[]);
    } catch (err) { console.error("Error fetching:", err); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  // ২. মালিকের জন্য লগ (Activity Log) পাঠানোর ফাংশন
  const sendLog = async (action: string, details: string) => {
    try {
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, details })
      });
    } catch (err) { console.error("Log error:", err); }
  };

  // ৩. ডিলিট লজিক (লগ সহ)
  const handleDelete = async (tenant: Tenant) => {
    if (confirm(t.confirmDelete)) {
      try {
        const res = await fetch(`/api/tenants/${tenant._id}`, { method: "DELETE" });
        if (res.ok) {
          await sendLog("ভাড়াটিয়া ডিলিট", `ম্যানেজার ${tenant.name} (ফ্ল্যাট ${tenant.flatNo}) কে ডিলিট করেছেন।`);
          alert(lang === "bn" ? "সফলভাবে মুছে ফেলা হয়েছে" : "Deleted successfully");
          fetchData();
          onUpdate();
        }
      } catch (err) { console.error(err); }
    }
  };

  // ৪. পেমেন্ট আপডেট লজিক (লগ সহ)
  const togglePayment = async (tenant: Tenant, currentStatus: string) => {
    const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenantId: tenant._id, month, year, amount: Number(tenant.rentAmount), status: newStatus
        })
      });
      if (res.ok) {
        await sendLog("ভাড়া আপডেট", `ম্যানেজার ${tenant.name} এর ${month} ${year} মাসের ভাড়া ${newStatus} মার্ক করেছেন।`);
        fetchData(); 
        onUpdate();
      }
    } catch (err) { console.error(err); }
  };

  // ৫. তথ্য এডিট/আপডেট লজিক (লগ সহ)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTenant) return;
    try {
      const res = await fetch(`/api/tenants/${editingTenant._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingTenant),
      });
      if (res.ok) {
        await sendLog("তথ্য সংশোধন", `ম্যানেজার ${editingTenant.name} (ফ্ল্যাট ${editingTenant.flatNo}) এর তথ্য এডিট করেছেন।`);
        alert(lang === "bn" ? "সফলভাবে আপডেট হয়েছে!" : "Updated successfully!");
        setEditingTenant(null);
        fetchData();
        onUpdate();
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="bg-white p-8 rounded-[50px] shadow-xl border border-slate-100">
      <h2 className="text-xl font-black text-slate-800 mb-8 uppercase tracking-tighter">
        {t.rentStatus} - <span className="text-blue-600">{t[month]} {year}</span>
      </h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
             <tr className="text-[10px] font-black uppercase text-slate-400">
                <th className="px-6">ID</th>
                <th>Flat</th>
                <th>Name</th>
                <th>Amount</th>
                <th className="text-center no-print">Action</th>
             </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const payment = payments.find(p => p.tenantId.toString() === tenant._id.toString());
              const isPaid = payment?.status === "Paid";
              return (
                <tr key={tenant._id} className={`${isPaid ? 'bg-green-50/50' : 'bg-slate-50/50'} hover:bg-white transition-all shadow-sm`}>
                  <td className="py-6 px-6 rounded-l-[30px] font-black text-blue-600">
                    <Link href={`/manager/tenants/${tenant._id}`}>#{tenant.tenantId}</Link>
                  </td>
                  <td className="py-6 font-black text-slate-900">{tenant.flatNo}</td>
                  <td className="py-6 font-bold text-slate-600">{tenant.name}</td>
                  <td className="py-6 font-black text-slate-800">৳ {tenant.rentAmount.toLocaleString()}</td>
                  <td className="py-6 px-6 rounded-r-[30px] text-center no-print">
                     <div className="flex gap-2 justify-center items-center">
                        <button onClick={() => togglePayment(tenant, isPaid ? "Paid" : "Unpaid")}
                          className={`px-5 py-2 rounded-full text-[9px] font-black uppercase transition-all ${isPaid ? 'bg-green-500 text-white' : 'bg-white border border-slate-200 text-red-500'}`}>
                          {isPaid ? t.paid : t.unpaid}
                        </button>
                        <button onClick={() => setEditingTenant(tenant)} className="w-8 h-8 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">✏️</button>
                        <button onClick={() => handleDelete(tenant)} className="w-8 h-8 bg-red-50 text-red-600 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-sm">🗑️</button>
                     </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* এডিট মোডাল */}
      {editingTenant && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl rounded-[45px] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
            <div className="bg-blue-700 p-8 text-white flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase">{t.edit} - {editingTenant.name}</h3>
              <button onClick={() => setEditingTenant(null)} className="text-xl">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="p-10 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto max-h-[70vh]">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.tenantName}</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.name} onChange={(e)=>setEditingTenant({...editingTenant, name: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.phone}</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.phone} onChange={(e)=>setEditingTenant({...editingTenant, phone: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.nid}</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.nid} onChange={(e)=>setEditingTenant({...editingTenant, nid: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.occupation}</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.occupation} onChange={(e)=>setEditingTenant({...editingTenant, occupation: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.flat}</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.flatNo} onChange={(e)=>setEditingTenant({...editingTenant, flatNo: e.target.value})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.rent}</label>
                <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.rentAmount} onChange={(e)=>setEditingTenant({...editingTenant, rentAmount: Number(e.target.value)})} required />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.securityDeposit}</label>
                <input type="number" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.securityDeposit} onChange={(e)=>setEditingTenant({...editingTenant, securityDeposit: Number(e.target.value)})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-4">{t.emergencyContact}</label>
                <input type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={editingTenant.emergencyContact} onChange={(e)=>setEditingTenant({...editingTenant, emergencyContact: e.target.value})} />
              </div>
              <div className="md:col-span-2 mt-4">
                <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-[25px] font-black uppercase tracking-widest hover:bg-blue-800 shadow-xl transition-all">{t.updateBtn}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}