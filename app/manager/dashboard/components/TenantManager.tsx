"use client";
import { useState, useEffect, Suspense } from "react"; 
import { useSearchParams } from "next/navigation";
import { dictionary, type Language } from "@/lib/dictionary";
import { IFamilyMember } from "@/lib/types"; // ইন্টারফেস ইমপোর্ট নিশ্চিত করুন

interface Tenant {
    _id: string;
    tenantId: string;
    flatNo: string;
    name: string;
    status?: string;
    familyMembers?: number;
}

interface TenantManagerProps {
  lang: Language;
  showNotification: (msg: string, type?: "success" | "error") => void;
}

function ManagerContent({ lang, showNotification }: TenantManagerProps) {
  const t = dictionary[lang];
  const searchParams = useSearchParams();
  const autoFlat = searchParams.get("flat");
  
  const [formData, setFormData] = useState({
    name: "", phone: "", nid: "", occupation: "",
    flatNo: "", rentAmount: "", securityDeposit: "",
    tenantId: "", emergencyContact: "",
    familyMembers: "1",
    familyList: [] as IFamilyMember[] // সদস্যদের নতুন লিস্ট
  });

  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  const [nidFile, setNidFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // --- সদস্যদের কন্ট্রোল ফাংশনসমূহ ---
  const addFamilyMember = () => {
    setFormData(prev => ({
      ...prev,
      familyList: [...prev.familyList, { name: "", relation: "", idPhoto: "" }]
    }));
  };

  const removeMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      familyList: prev.familyList.filter((_, i) => i !== index)
    }));
  };

  const updateMember = (index: number, field: keyof IFamilyMember, value: string) => {
    const newList = [...formData.familyList];
    newList[index] = { ...newList[index], [field]: value };
    setFormData(prev => ({ ...prev, familyList: newList }));
  };

  useEffect(() => {
    const initForm = async () => {
      try {
        const res = await fetch("/api/tenants/next-id");
        const data = await res.json();
        setFormData(prev => ({
          ...prev,
          flatNo: autoFlat || prev.flatNo,
          tenantId: data.success ? data.nextId.toString() : prev.tenantId
        }));
      } catch (err) { console.error("ID Fetch Error:", err); }
    };
    initForm();
  }, [autoFlat]);

  useEffect(() => {
    if (!profilePicFile) { setProfilePreview(null); return; }
    const objectUrl = URL.createObjectURL(profilePicFile);
    setProfilePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicFile]);

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
    } catch { return ""; }
  };

  // সদস্যদের ফটো আপলোড হ্যান্ডলার
  const handleMemberPhoto = async (index: number, file: File) => {
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      updateMember(index, "idPhoto", url);
      showNotification(lang === 'bn' ? "সদস্যের ডকুমেন্ট আপলোড হয়েছে" : "Member document uploaded", "success");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    try {
      const checkRes = await fetch(`/api/tenants?t=${new Date().getTime()}`);
      const checkData = await checkRes.json();
      
      if (checkData.success) {
        const existingTenants: Tenant[] = checkData.data;
        const isFlatTaken = existingTenants.some((ten) => ten.flatNo.toUpperCase() === formData.flatNo.toUpperCase() && ten.status !== "Exited");
        const isIdTaken = existingTenants.some((ten) => ten.tenantId === formData.tenantId);

        if (isFlatTaken && !autoFlat) {
          showNotification(lang === 'bn' ? "এই ফ্ল্যাটে অলরেডি ভাড়াটিয়া আছে!" : "Flat occupied!", "error");
          setUploading(false); return;
        }
        if (isIdTaken) {
          showNotification(lang === 'bn' ? "এই আইডি নম্বরটি ব্যবহৃত হয়েছে!" : "ID taken!", "error");
          setUploading(false); return;
        }
      }

      let profilePicUrl = "";
      let nidPhotoUrl = "";
      if (profilePicFile) profilePicUrl = await uploadImage(profilePicFile);
      if (nidFile) nidPhotoUrl = await uploadImage(nidFile);

      const res = await fetch("/api/tenants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData, 
          profilePic: profilePicUrl, 
          nidPhoto: nidPhotoUrl,
          familyMembers: Number(formData.familyMembers)
        })
      });

      if ((await res.json()).success) {
        showNotification(lang === "bn" ? "ভাড়াটিয়া সফলভাবে যোগ হয়েছে!" : "Tenant added!", "success");
        setFormData({ name: "", phone: "", nid: "", occupation: "", flatNo: "", rentAmount: "", securityDeposit: "", tenantId: "", emergencyContact: "", familyMembers: "1", familyList: [] });
        setProfilePicFile(null); setNidFile(null);
      }
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-[50px] shadow-2xl border border-white no-print">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter leading-none">{t.addTenant}</h2>
        <div className="h-1 w-20 bg-blue-600 mx-auto mt-4 rounded-full shadow-lg"></div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex justify-center mb-10">
          <div className="relative group">
            <div className="w-32 h-32 rounded-[40px] bg-slate-100 border-4 border-white shadow-xl overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105 duration-500">
              {profilePreview ? <img src={profilePreview} alt="P" className="w-full h-full object-cover" /> : <span className="text-4xl">👤</span>}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg border-4 border-white">
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setProfilePicFile(e.target.files?.[0] || null)} />
              📸
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <InputGroup label={t.tenantName} value={formData.name} onChange={(v) => setFormData({...formData, name: v})} required placeholder="Full Name" />
          <InputGroup label={t.phone} value={formData.phone} onChange={(v) => setFormData({...formData, phone: v})} required placeholder="017XXXXXXXX" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-[40px] border border-slate-100 shadow-inner">
          <InputGroup label={t.flat} value={formData.flatNo} onChange={(v) => setFormData({...formData, flatNo: v})} required placeholder="4C" />
          <InputGroup label={t.rent} type="number" value={formData.rentAmount} onChange={(v) => setFormData({...formData, rentAmount: v})} required placeholder="12000" />
          <InputGroup label={t.securityDeposit} type="number" value={formData.securityDeposit} onChange={(v) => setFormData({...formData, securityDeposit: v})} placeholder="20000" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <InputGroup label={t.id} value={formData.tenantId} onChange={(v) => setFormData({...formData, tenantId: v})} required placeholder="ID" />
          <InputGroup label={t.nid} value={formData.nid} onChange={(v) => setFormData({...formData, nid: v})} required placeholder="NID Number" />
          <InputGroup label={lang === 'bn' ? "সদস্য সংখ্যা" : "Family Members"} type="number" value={formData.familyMembers} onChange={(v) => setFormData({...formData, familyMembers: v})} required />
        </div>

        {/* ৩. মূল এনআইডি ফটো আপলোড (preserved) */}
        <div className="p-8 bg-gradient-to-br from-slate-50 to-blue-50 rounded-[40px] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm border border-blue-100">🪪</div>
              <p className="font-black text-slate-800 text-sm uppercase">{t.nid} Photo</p>
           </div>
           <label className="bg-white px-8 py-3 rounded-full border border-blue-200 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer shadow-sm">
             <input type="file" accept="image/*" className="hidden" onChange={(e) => setNidFile(e.target.files?.[0] || null)} />
             {nidFile ? "Change File" : "Choose File"}
           </label>
        </div>

        {/* --- ৪. ডাইনামিক ফ্যামিলি মেম্বার সেকশন --- */}
        <div className="p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 space-y-6">
           <div className="flex justify-between items-center px-4">
              <h4 className="text-sm font-black uppercase text-slate-800 tracking-tighter italic">Family Members Directory</h4>
              <button type="button" onClick={addFamilyMember} className="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-lg hover:bg-blue-700 transition-all">+ Add Member</button>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {formData.familyList.map((member, index) => (
                <div key={index} className="p-6 bg-white rounded-[35px] border border-slate-100 relative shadow-sm animate-in zoom-in-95 duration-300">
                  <button type="button" onClick={() => removeMember(index)} className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 font-bold">✕</button>
                  <div className="space-y-4">
                    <input type="text" placeholder="Full Name" className="w-full bg-slate-50 p-3 rounded-2xl border-none outline-none text-xs font-bold" value={member.name} onChange={(e) => updateMember(index, "name", e.target.value)} />
                    <select className="w-full bg-slate-50 p-3 rounded-2xl border-none outline-none text-xs font-bold" value={member.relation} onChange={(e) => updateMember(index, "relation", e.target.value)}>
                      <option value="">Relation</option>
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Sibling">Sibling</option>
                    </select>
                    <div className="flex items-center gap-3">
                       <label className="flex-1 bg-blue-50 p-3 rounded-2xl border border-blue-100 text-center cursor-pointer hover:bg-blue-100 transition-all">
                          <span className="text-[9px] font-black uppercase text-blue-600">{member.idPhoto ? "Document OK ✔" : "Upload ID Doc"}</span>
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files && handleMemberPhoto(index, e.target.files[0])} />
                       </label>
                       {member.idPhoto && <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md"><img src={member.idPhoto} className="w-full h-full object-cover" /></div>}
                    </div>
                  </div>
                </div>
              ))}
           </div>
        </div>

        <button type="submit" disabled={uploading} className={`w-full bg-gradient-to-r from-blue-700 to-indigo-900 text-white py-6 rounded-[30px] font-black uppercase tracking-[0.3em] text-xs shadow-2xl transition-all ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}>
          {uploading ? "Processing..." : t.save}
        </button>
      </form>
    </div>
  );
}

export default function TenantManager(props: TenantManagerProps) {
  return (
    <Suspense fallback={<div className="text-center py-20 font-black animate-pulse text-blue-600 uppercase">Loading Form...</div>}>
      <ManagerContent {...props} />
    </Suspense>
  );
}

function InputGroup({ label, value, onChange, type = "text", required = false, placeholder = "" }: { label: string, value: string, onChange: (v: string) => void, type?: string, required?: boolean, placeholder?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase text-slate-400 ml-5 tracking-[0.2em]">{label}</label>
      <input type={type} placeholder={placeholder} className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[28px] outline-none font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all shadow-inner" value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </div>
  );
}