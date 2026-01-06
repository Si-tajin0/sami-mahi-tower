"use client";
import { useState } from "react";
import { dictionary, type Language } from "@/lib/dictionary";

export default function TenantManager({ lang }: { lang: Language }) {
  const t = dictionary[lang];
  const [formData, setFormData] = useState({
    name: "", phone: "", nid: "", occupation: "",
    flatNo: "", rentAmount: "", securityDeposit: "",
    tenantId: "", emergencyContact: ""
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      if (result.success) {
        alert(lang === "bn" ? "ভাড়াটিয়া সফলভাবে যোগ করা হয়েছে!" : "Tenant added successfully!");
        setFormData({ name: "", phone: "", nid: "", occupation: "", flatNo: "", rentAmount: "", securityDeposit: "", tenantId: "", emergencyContact: "" });
      } else {
        alert(result.error || "ভুল হয়েছে!");
      }
    } catch (err) {
      console.error(err);
      alert("সার্ভারে সমস্যা হয়েছে!");
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-10 rounded-[50px] shadow-xl border border-slate-100 no-print">
      <h2 className="text-2xl font-black text-slate-800 text-center mb-8 uppercase tracking-tighter">{t.addTenant}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder={t.tenantName} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required />
          <input type="text" placeholder={t.phone} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder={t.nid} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.nid} onChange={(e)=>setFormData({...formData, nid:e.target.value})} required />
          <input type="text" placeholder={t.occupation} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.occupation} onChange={(e)=>setFormData({...formData, occupation:e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <input type="text" placeholder={t.flat} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.flatNo} onChange={(e)=>setFormData({...formData, flatNo:e.target.value})} required />
          <input type="number" placeholder={t.rent} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.rentAmount} onChange={(e)=>setFormData({...formData, rentAmount:e.target.value})} required />
          <input type="number" placeholder={t.securityDeposit} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.securityDeposit} onChange={(e)=>setFormData({...formData, securityDeposit:e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" placeholder={t.id} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.tenantId} onChange={(e)=>setFormData({...formData, tenantId:e.target.value})} required />
          <input type="text" placeholder={t.emergencyContact} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.emergencyContact} onChange={(e)=>setFormData({...formData, emergencyContact:e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-[25px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-800 transition-all">{t.save}</button>
      </form>
    </div>
  );
}