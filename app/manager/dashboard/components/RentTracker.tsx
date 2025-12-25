"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { dictionary, type Language, type DictionaryContent } from "@/lib/dictionary";

interface Tenant { _id: string; name: string; tenantId: string; flatNo: string; rentAmount: number; }
interface Payment { tenantId: string; status: string; amount: number; }
interface RentTrackerProps { lang: Language; month: keyof DictionaryContent; year: number; onUpdate: () => void; }

export default function RentTracker({ lang, month, year, onUpdate }: RentTrackerProps) {
  const t = dictionary[lang];
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

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
    } catch (err) { console.error("Fetch Error:", err); }
  };

  useEffect(() => { fetchData(); }, [month, year]);

  const togglePayment = async (tenant: Tenant, currentStatus: string) => {
    const newStatus = currentStatus === "Paid" ? "Unpaid" : "Paid";
    try {
      const res = await fetch("/api/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantId: tenant._id, month, year, amount: tenant.rentAmount, status: newStatus })
      });
      if (res.ok) { fetchData(); onUpdate(); }
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
            <tr className="text-[10px] font-black text-slate-400 uppercase">
              <th className="px-6">ID</th>
              <th>ফ্ল্যাট</th>
              <th>নাম</th>
              <th>পরিমাণ</th>
              <th className="text-center no-print">অবস্থা</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((tenant) => {
              const pRecord = payments.find(p => p.tenantId.toString() === tenant._id.toString());
              const isPaid = pRecord?.status === "Paid";
              return (
                <tr key={tenant._id} className={`${isPaid ? 'bg-green-50/50' : 'bg-slate-50/50'} hover:bg-white transition-all`}>
                  <td className="py-6 px-6 rounded-l-[30px] font-black text-blue-600">
                    <Link href={`/manager/tenants/${tenant._id}`}>#{tenant.tenantId}</Link>
                  </td>
                  <td className="py-6 font-black text-slate-900">{tenant.flatNo}</td>
                  <td className="py-6 font-bold text-slate-600">{tenant.name}</td>
                  <td className="py-6 font-black text-slate-800">৳ {tenant.rentAmount.toLocaleString()}</td>
                  <td className="py-6 px-6 rounded-r-[30px] text-center no-print">
                     <button 
                       onClick={() => togglePayment(tenant, isPaid ? "Paid" : "Unpaid")}
                       className={`px-8 py-3 rounded-full text-[10px] font-black uppercase transition-all shadow-md ${isPaid ? 'bg-green-500 text-white' : 'bg-white border text-red-500'}`}
                     >
                       {isPaid ? t.paid : t.unpaid}
                     </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}