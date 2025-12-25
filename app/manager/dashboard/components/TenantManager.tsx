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
      if (res.ok) {
        alert(lang === "bn" ? "সফলভাবে সেভ হয়েছে!" : "Saved Successfully!");
        setFormData({ name: "", phone: "", nid: "", occupation: "", flatNo: "", rentAmount: "", securityDeposit: "", tenantId: "", emergencyContact: "" });
      } else {
        alert("ভুল হয়েছে, আবার চেষ্টা করুন।");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-[40px] shadow-xl border border-slate-100">
      <h2 className="text-2xl font-black text-slate-800 text-center mb-8 uppercase">{t.addTenant}</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder={t.tenantName} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.name} onChange={(e)=>setFormData({...formData, name:e.target.value})} required />
          <input type="text" placeholder={t.phone} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.phone} onChange={(e)=>setFormData({...formData, phone:e.target.value})} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder={t.nid} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.nid} onChange={(e)=>setFormData({...formData, nid:e.target.value})} required />
          <input type="text" placeholder={t.occupation} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.occupation} onChange={(e)=>setFormData({...formData, occupation:e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" placeholder={t.flat} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.flatNo} onChange={(e)=>setFormData({...formData, flatNo:e.target.value})} required />
          <input type="number" placeholder={t.rent} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.rentAmount} onChange={(e)=>setFormData({...formData, rentAmount:e.target.value})} required />
          <input type="number" placeholder={t.securityDeposit} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.securityDeposit} onChange={(e)=>setFormData({...formData, securityDeposit:e.target.value})} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder={t.id} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.tenantId} onChange={(e)=>setFormData({...formData, tenantId:e.target.value})} required />
          <input type="text" placeholder={t.emergencyContact} className="p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={formData.emergencyContact} onChange={(e)=>setFormData({...formData, emergencyContact:e.target.value})} />
        </div>
        <button type="submit" className="w-full bg-blue-700 text-white py-5 rounded-[25px] font-black uppercase shadow-xl hover:bg-blue-800 transition-all">{t.save}</button>
      </form>
    </div>
  );
}