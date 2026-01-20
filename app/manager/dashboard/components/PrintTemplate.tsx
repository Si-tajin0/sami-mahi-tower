"use client";
import { useState, useEffect } from "react";
import { DictionaryContent, type Language } from "@/lib/dictionary";

// ১. টাইপ ইন্টারফেসসমূহ (any এর বদলে নির্দিষ্ট টাইপ)
interface Tenant { 
  _id: string; 
  name: string; 
  flatNo: string; 
  rentAmount: number; 
  securityDeposit?: number; 
  joinedDate: string; 
}

interface Payment { 
  // tenantId এখানে হয় পুরো Tenant অবজেক্ট অথবা শুধু আইডি স্ট্রিং হতে পারে
  tenantId: string | Tenant | null; 
  status: string; 
  rentAmount: number; 
  serviceCharge: number; 
}

interface Expense { 
  _id: string; 
  description: string; 
  amount: number; 
  type: string; 
  date: string; 
}

interface PrintProps {
  lang: Language;
  t: DictionaryContent;
  month: keyof DictionaryContent; 
  year: number;
  tenants: Tenant[];
  payments: Payment[];
  expenses: Expense[];
  income: number; 
  expense: number;
}

export default function PrintTemplate({ lang, t, month, year, tenants, payments, expenses, income, expense }: PrintProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const formatNum = (n: number) => `৳ ${(Number(n) || 0).toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  if (!mounted) return null;

  // ২. শুধুমাত্র 'Paid' হওয়া ভাড়ার তালিকা ফিল্টার
  const paidPayments = payments.filter(p => p.status?.toLowerCase().trim() === "paid");
  
  // ভাড়ার সাব-টোটাল ক্যালকুলেশন
  const subTotalRent = paidPayments.reduce((acc, curr) => acc + (Number(curr.rentAmount) || 0), 0);
  const subTotalSC = paidPayments.reduce((acc, curr) => acc + (Number(curr.serviceCharge) || 0), 0);

  // ৩. নির্দিষ্ট মাসের নতুন জামানত হিসাব
  const mList = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const monthlyDepositTotal = tenants
    .filter(tenant => {
      const d = new Date(tenant.joinedDate);
      return mList[d.getMonth()] === month && d.getFullYear() === year;
    })
    .reduce((acc, curr) => acc + (Number(curr.securityDeposit) || 0), 0);

  // ৪. চূড়ান্ত গাণিতিক হিসাব
  const totalGrossIncome = Number(income) + monthlyDepositTotal; 
  const finalNetRevenue = totalGrossIncome - Number(expense); 

  return (
    <div className="hidden print:block p-10 bg-white text-black min-h-screen font-sans border-[12px] border-double border-slate-200">
      
      {/* লেটারহেড */}
      <div className="text-center border-b-4 border-double border-slate-900 pb-8 mb-10">
    {/* টাওয়ারের নাম */}
    <h1 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Sami & Mahi Tower</h1>
    
    {/* ঠিকানা এবং মোবাইল নম্বর - প্রফেশনাল লুকের জন্য ছোট এবং বোল্ড */}
    <div className="mt-3 flex flex-col items-center gap-1">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-800">
            {lang === 'bn' ? 'খান সাহেব রোড, ৮ নং ওয়ার্ড, বসুরহাট' : 'Khan Saheb Road, Word No. 8, Basurhat'}
        </p>
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-800 border-b border-slate-200 pb-1">
            {lang === 'bn' ? 'মোবাইল: ০১৮১৩-৪৯৫৯৪০' : 'Mobile: 01813-495940'}
        </p>
    </div>

    {/* বিবরণীর ধরণ */}
    <p className="text-[9px] font-bold uppercase tracking-[0.4em] text-slate-500 mt-4 italic">
        Monthly Financial Statement / মাসিক আর্থিক বিবরণী
    </p>

    {/* মাস ও বছর */}
    <div className="mt-5 inline-block px-8 py-2 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-lg">
        {t[month]} {year}
    </div>
</div>

      {/* ৫. আয়ের তালিকা ও সাব-টোটাল */}
      <div className="mb-10">
        <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800 mb-4">{t.incomeBreakdown}</h3>
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 font-bold">
              <th className="py-2">Flat</th>
              <th>{t.tenant}</th>
              <th className="text-right">Rent</th>
              <th className="text-right">S.Charge</th>
              <th className="text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paidPayments.map((p, idx) => {
              // টাইপ গার্ড (Type Guard) ব্যবহার করে আইডি বা অবজেক্ট থেকে ডাটা বের করা
              let flatNo = "---";
              let tenantName = "Unknown";

              if (p.tenantId && typeof p.tenantId === 'object') {
                // যদি অবজেক্ট হয় (মালিকের ভিউ)
                flatNo = p.tenantId.flatNo;
                tenantName = p.tenantId.name;
              } else {
                // যদি স্ট্রিং আইডি হয় (ম্যানেজারের ভিউ)
                const found = tenants.find(tnt => tnt._id === p.tenantId);
                if (found) {
                  flatNo = found.flatNo;
                  tenantName = found.name;
                }
              }

              return (
                <tr key={idx}>
                  <td className="py-3 font-black text-slate-900">{flatNo}</td>
                  <td className="py-3 font-bold text-slate-700">{tenantName}</td>
                  <td className="py-3 text-right">{formatNum(p.rentAmount)}</td>
                  <td className="py-3 text-right">{formatNum(p.serviceCharge)}</td>
                  <td className="py-3 text-right font-black text-emerald-700">{formatNum(Number(p.rentAmount) + Number(p.serviceCharge))}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-black">
            <tr>
              <td colSpan={2} className="py-3 pl-2 uppercase text-[10px]">Income Sub-Total</td>
              <td className="py-3 text-right">{formatNum(subTotalRent)}</td>
              <td className="py-3 text-right">{formatNum(subTotalSC)}</td>
              <td className="py-3 text-right text-emerald-700">{formatNum(subTotalRent + subTotalSC)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ৬. খরচের তালিকা ও সাব-টোটাল */}
      <div className="mb-10">
        <h3 className="text-lg font-black uppercase tracking-tighter text-slate-800 mb-4">{t.expenseDetails}</h3>
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-900 font-bold">
              <th className="py-2">Category</th>
              <th>Description</th>
              <th className="text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {expenses.map(exp => (
              <tr key={exp._id}>
                <td className="py-3 font-bold text-slate-500 uppercase text-[9px]">{exp.type}</td>
                <td className="py-3 font-medium text-slate-700">{exp.description}</td>
                <td className="py-3 text-right font-black text-rose-700">{formatNum(exp.amount)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-900 bg-slate-50 font-black">
            <tr>
              <td colSpan={2} className="py-3 pl-2 uppercase text-[10px]">Expense Sub-Total</td>
              <td className="py-3 text-right text-rose-700">{formatNum(expense)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* ৭. চূড়ান্ত গাণিতিক সারসংক্ষেপ */}
      <div className="mt-16 space-y-4 border-t-4 border-double border-slate-200 pt-10">
        <div className="flex justify-between items-center text-sm">
           <p className="font-bold text-slate-500 uppercase tracking-widest">১. মোট ভাড়া আদায় (Rent Collection)</p>
           <p className="font-black text-slate-900">{formatNum(income)}</p>
        </div>
        <div className="flex justify-between items-center text-sm">
           <p className="font-bold text-slate-500 uppercase tracking-widest">২. নতুন জামানত প্রাপ্তি (New Deposits) (+)</p>
           <p className="font-black text-amber-600">{formatNum(monthlyDepositTotal)}</p>
        </div>
        <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-2 font-black">
           <p className="uppercase tracking-widest">মোট মাসিক আয় (Gross Income)</p>
           <p className="text-emerald-700">{formatNum(totalGrossIncome)}</p>
        </div>
        <div className="flex justify-between items-center text-sm">
           <p className="font-bold text-slate-500 uppercase tracking-widest">৩. মোট মাসিক খরচ (Total Expense) (-)</p>
           <p className="font-black text-rose-600">{formatNum(expense)}</p>
        </div>
        
        <div className="flex justify-between items-center bg-slate-900 p-6 rounded-[30px] text-white shadow-2xl mt-6">
           <div>
              <p className="text-sm font-black uppercase tracking-[0.3em] opacity-60">Total Monthly Revenue</p>
              <p className="text-[10px] font-bold opacity-40 uppercase tracking-tighter">Sami & Mahi Tower • Official Report</p>
           </div>
           <p className="text-4xl font-black italic tracking-tighter">{formatNum(finalNetRevenue)}</p>
        </div>
      </div>

      {/* ফুটার */}
      <div className="mt-24 flex justify-between items-end border-t border-dashed border-slate-300 pt-8">
        <div className="text-[9px] text-slate-400 font-bold italic">
          Report Generated: {new Date().toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}
        </div>
        <div className="text-center w-64 border-t border-slate-900 pt-2">
           <p className="text-[10px] font-black uppercase tracking-[0.4em]">{t.authorizedSign}</p>
        </div>
      </div>
    </div>
  );
}