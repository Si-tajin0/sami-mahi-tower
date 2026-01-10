"use client";
interface Log { 
  _id: string; 
  action: string; 
  details: string; 
  createdAt: string; 
  changes?: { field: string; old: string | number; new: string | number; }[]; 
}

export default function OwnerAuditLog({ logs }: { logs: Log[] }) {
  return (
    <div className="bg-white p-8 rounded-[50px] shadow-xl border border-white max-h-[700px] overflow-y-auto custom-scrollbar">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 flex items-center gap-3">
        <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span> Live Audit Trail
      </h3>
      <div className="space-y-10 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-px before:bg-slate-100">
        {logs.map((log) => (
          <div key={log._id} className="relative pl-10 group">
            <div className="absolute left-[13px] top-2 w-2 h-2 bg-blue-600 rounded-full ring-4 ring-white shadow-lg"></div>
            <p className="text-[9px] font-black text-slate-400 uppercase">{new Date(log.createdAt).toLocaleString('bn-BD')}</p>
            <p className="text-slate-800 text-xs font-black mt-1 uppercase">{log.action}</p>
            <p className="text-slate-500 text-[11px] mt-1 italic">{log.details}</p>
            
            {log.changes && log.changes.length > 0 && (
               <div className="mt-3 grid grid-cols-1 gap-2">
                  {log.changes.map((c, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-[9px] font-bold">
                       <span className="text-slate-400 uppercase">{c.field}:</span>
                       <span className="text-red-400 line-through">{c.old}</span>
                       <span className="text-slate-300">➔</span>
                       <span className="text-emerald-600 font-black">{c.new}</span>
                    </div>
                  ))}
               </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}