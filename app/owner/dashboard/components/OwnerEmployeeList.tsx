
"use client";
import { useState } from "react";
import { Language } from "@/lib/dictionary";

interface Employee {
  _id: string;
  name: string;
  role: string;
  phone: string;
  salary: number;
  nidNumber: string;
  profilePic?: string;
  nidPhoto?: string;
  details?: string;
  status: string;
}

export default function OwnerEmployeeList({ employees, lang }: { employees: Employee[], lang: Language }) {
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  const formatCurrency = (num: number) => 
    `৳ ${num.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-US')}`;

  return (
    <div className="bg-white p-8 md:p-10 rounded-[60px] shadow-2xl border border-white">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-800">
            {lang === 'bn' ? 'ম্যানেজমেন্ট টিম' : 'Management Team'}
          </h3>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Sami & Mahi Tower Staff</p>
        </div>
        <div className="bg-blue-50 px-5 py-2 rounded-2xl border border-blue-100 flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></span>
            <span className="text-[10px] font-black text-blue-600 uppercase">{employees.length} Active Staff</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map((emp) => (
          <div 
            key={emp._id} 
            onClick={() => setSelectedEmp(emp)}
            className="group bg-slate-50/50 p-6 rounded-[45px] border-2 border-transparent hover:border-blue-100 hover:bg-white hover:shadow-2xl transition-all duration-500 cursor-pointer"
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-[28px] overflow-hidden border-4 border-white shadow-xl bg-blue-100">
                  {emp.profilePic ? (
                    <img src={emp.profilePic} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={emp.name} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-black text-blue-600 italic">{emp.name[0]}</div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-4 border-white rounded-full"></div>
              </div>

              <div className="flex-1">
                <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter leading-none mb-2">{emp.name}</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="text-[8px] font-black uppercase bg-blue-600 text-white px-3 py-1 rounded-full shadow-sm">{emp.role}</span>
                  <span className="text-[8px] font-bold text-slate-400 uppercase bg-white border border-slate-100 px-3 py-1 rounded-full italic">ID: {emp.nidNumber.slice(0, 4)}***</span>
                </div>
              </div>

              <a 
                href={`tel:${emp.phone}`}
                onClick={(e) => e.stopPropagation()}
                className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-md border border-slate-50 hover:bg-emerald-500 hover:text-white transition-all duration-300"
              >
                📞
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* এমপ্লয়ি ডিটেইলস মোডাল (যখন ক্লিক করা হবে) */}
      {selectedEmp && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[60px] overflow-hidden shadow-2xl border border-white max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-10 text-white relative">
              <button onClick={() => setSelectedEmp(null)} className="absolute top-8 right-8 text-2xl opacity-40 hover:opacity-100 transition-opacity">✕</button>
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="w-40 h-40 rounded-[50px] border-4 border-white/20 overflow-hidden shadow-2xl bg-white/10">
                   {selectedEmp.profilePic && <img src={selectedEmp.profilePic} className="w-full h-full object-cover" alt="Profile" />}
                </div>
                <div className="text-center md:text-left">
                   <h3 className="text-5xl font-black uppercase tracking-tighter italic">{selectedEmp.name}</h3>
                   <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                      <span className="bg-blue-600 px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">{selectedEmp.role}</span>
                      <span className="bg-white/10 border border-white/20 px-6 py-2 rounded-full text-xs font-bold uppercase">Joining: {new Date().toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 italic">Identity Information</p>
                    <div className="grid grid-cols-2 gap-6">
                      <div><p className="text-[8px] font-bold text-slate-400 uppercase">Phone Number</p><p className="font-black text-slate-800">{selectedEmp.phone}</p></div>
                      <div><p className="text-[8px] font-bold text-slate-400 uppercase">NID Number</p><p className="font-black text-slate-800">{selectedEmp.nidNumber}</p></div>
                      <div className="col-span-2"><p className="text-[8px] font-bold text-slate-400 uppercase">Monthly Salary</p><p className="text-3xl font-black text-blue-600 italic leading-none mt-1">{formatCurrency(selectedEmp.salary)}</p></div>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Additional Notes</p>
                    <p className="text-sm font-bold text-slate-600 leading-relaxed italic">&quot;{selectedEmp.details || 'No additional details provided for this employee.'}&quot;</p>
                  </div>
               </div>

               <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">NID Card Document</p>
                  <div className="w-full h-64 bg-slate-100 rounded-[50px] overflow-hidden border-4 border-white shadow-xl relative group/nid">
                    {selectedEmp.nidPhoto ? (
                      <img src={selectedEmp.nidPhoto} className="w-full h-full object-cover transition-all duration-700 group-hover/nid:scale-110" alt="NID" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300 font-black">NID PHOTO NOT AVAILABLE</div>
                    )}
                  </div>
                  <button className="w-full py-6 bg-slate-900 text-white rounded-[30px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl">Print Employee File</button>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}