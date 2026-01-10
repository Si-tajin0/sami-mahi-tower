"use client";
import { useState, useEffect } from "react";
import { dictionary, type Language } from "@/lib/dictionary";

// ১. প্রপস ইন্টারফেস ব্যবহার করা হলো
interface TenantManagerProps {
  lang: Language;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

export default function TenantManager({ lang, showNotification }: TenantManagerProps) {
  const t = dictionary[lang];
  
  // ২. ফর্ম স্টেট
  const [formData, setFormData] = useState({
    name: "", phone: "", nid: "", occupation: "",
    flatNo: "", rentAmount: "", securityDeposit: "",
    tenantId: "", emergencyContact: ""
  });

  // ৩. ফাইল এবং প্রিভিউ স্টেট
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // ৪. ছবি সিলেক্ট করলে প্রিভিউ তৈরি করা
  useEffect(() => {
    if (!profilePicFile) {
      setProfilePreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(profilePicFile);
    setProfilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicFile]);

  // ৫. ক্লাউডিনারি ইমেজ আপলোড ফাংশন (Type Safe)
  const uploadImage = async (file: File): Promise<string> => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "si_tajin"); 
    
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dj9s9m67f/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      return fileData.secure_url || "";
    } catch (err: unknown) {
      console.error("Cloudinary Error:", err);
      return "";
    }
  };

  // ৬. মূল সাবমিট ফাংশন
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      let profilePicUrl = "";
      let nidPhotoUrl = "";

      // ছবি আপলোড লজিক
      if (profilePicFile) profilePicUrl = await uploadImage(profilePicFile);
      if (nidFile) nidPhotoUrl = await uploadImage(nidFile);

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profilePic: profilePicUrl,
          nidPhoto: nidPhotoUrl
        })
      });

      const result = await res.json();

      if (result.success) {
        // অ্যালার্ট সরিয়ে ফ্যান্সি টোস্ট ব্যবহার করা হলো
        showNotification(
          lang === "bn" ? "ভাড়াটিয়া ও ছবি সফলভাবে যোগ হয়েছে!" : "Tenant & Images added successfully!", 
          "success"
        );
        
        // ফর্ম রিসেট
        setFormData({ 
          name: "", phone: "", nid: "", occupation: "", flatNo: "", 
          rentAmount: "", securityDeposit: "", tenantId: "", emergencyContact: "" 
        });
        setProfilePicFile(null);
        setNidFile(null);
      } else {
        showNotification(result.error || (lang === "bn" ? "ভুল হয়েছে!" : "Error!"), "error");
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Submit Error:", error.message);
      showNotification(lang === "bn" ? "সার্ভারে সমস্যা হয়েছে!" : "Server Error!", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[50px] shadow-2xl border border-white no-print transition-all">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">{t.addTenant}</h2>
        <div className="h-1 w-20 bg-blue-600 mx-auto mt-4 rounded-full shadow-lg shadow-blue-200"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* প্রোফাইল পিকচার প্রিভিউ */}
        <div className="flex justify-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[40px] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
              {profilePreview ? (
                <img src={profilePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl">👤</span>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg hover:bg-blue-700 transition-all border-4 border-white">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)} />
              📸
            </label>
          </div>
        </div>

        {/* ইনপুট গ্রিড */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputGroup label={t.tenantName} value={formData.name} onChange={(v) => setFormData({...formData, name: v})} required placeholder="e.g. Samiul Islam" />
          <InputGroup label={t.phone} value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} required placeholder="017XXXXXXXX" />
          <InputGroup label={t.nid} value={formData.nid} onChange={(v) => setFormData({...formData, nid: v})} required placeholder="123 456 7890" />
          <InputGroup label={t.occupation} value={formData.occupation} onChange={(v) => setFormData({...formData, occupation: v})} placeholder="e.g. Service Holder" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 shadow-inner">
          <InputGroup label={t.flat} value={formData.flatNo} onChange={(v) => setFormData({...formData, flatNo: v})} required placeholder="4C" />
          <InputGroup label={t.rent} type="number" value={formData.rentAmount} onChange={(v) => setFormData({...formData, rentAmount: v})} required placeholder="12000" />
          <InputGroup label={t.securityDeposit} type="number" value={formData.securityDeposit} onChange={(v) => setFormData({...formData, securityDeposit: v})} placeholder="20000" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputGroup label={t.id} value={formData.tenantId} onChange={(v) => setFormData({...formData, tenantId: v})} required placeholder="TEN-101" />
          <InputGroup label={t.emergencyContact} value={formData.emergencyContact} onChange={(v) => setFormData({...formData, emergencyContact: v})} placeholder="018XXXXXXXX" />
        </div>

        {/* এনআইডি আপলোড কার্ড */}
        <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-[40px] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">🪪</div>
              <div>
                 <p className="font-black text-slate-800 text-sm uppercase tracking-tighter">{t.nid} Photo</p>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{nidFile ? "File Selected ✔" : "Upload NID Document"}</p>
              </div>
           </div>
           <label className="bg-white px-8 py-3 rounded-full border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm">
             <input type="file" accept="image/*" className="hidden" onChange={(e) => setNidFile(e.target.files?.[0] || null)} />
             {nidFile ? "Change File" : "Choose File"}
           </label>
        </div>

        {/* সাবমিট বাটন */}
        <button 
          type="submit" 
          disabled={uploading}
          className={`w-full bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-blue-500/30 transition-all ${uploading ? 'opacity-50 cursor-not-allowed scale-95' : 'hover:scale-[1.02] hover:shadow-blue-500/50 active:scale-95'}`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>{lang === 'bn' ? "প্রসেসিং হচ্ছে..." : "Processing..."}</span>
            </div>
          ) : t.save}
        </button>
      </form>
    </div>
  );
}

// ইনপুট গ্রুপ হেল্পার (Strict Typing)
function InputGroup({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string }) {
  return (
    <div className="space-y-1 group">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.2em] group-focus-within:text-blue-600 transition-colors">{label}</label>
      <input 
        type={type} 
        placeholder={placeholder}
        className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[28px] outline-none font-bold text-slate-800 placeholder:text-slate-300 focus:border-blue-500 focus:bg-white transition-all shadow-inner" 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        required={required} 
      />
    </div>
  );
}