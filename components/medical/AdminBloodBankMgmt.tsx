
import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Smartphone, 
  MapPin, 
  User as UserIcon, 
  Tag, 
  Hospital,
  Loader2,
  Edit2
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc 
} from 'firebase/firestore';
import { medicalDb } from '../../Firebase-medical';

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <div className="flex items-center gap-4 mb-6 text-left">
    <button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
      <ChevronLeft size={20} className="text-slate-800" />
    </button>
    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
  </div>
);

const EditField = ({ label, value, placeholder, onChange, icon, type = 'text' }: any) => (
  <div className="text-left w-full">
    <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">{label}</label>
    <div className="relative">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
        <input 
          type={type}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 transition-all focus:border-blue-400 shadow-sm`} 
          value={value} 
          onChange={e => onChange(e.target.value)} 
        />
    </div>
  </div>
);

interface AdminBloodBankMgmtProps {
  onBack: () => void;
}

export default function AdminBloodBankMgmt({ onBack }: AdminBloodBankMgmtProps) {
  const [items, setItems] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showDonorForm, setShowDonorForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingDonorId, setEditingDonorId] = useState<string | null>(null);
  const [editingContactIdx, setEditingContactIdx] = useState<number | null>(null);
  
  const [form, setForm] = useState<any>({
    name: '', location: '', established: '', upazila: '', 
    contacts: [{ name: '', designation: '', bloodGroup: '', address: '', mobile: '' }]
  });

  const [donorForm, setDonorForm] = useState<any>({
    name: '', address: '', bloodGroup: '', mobile: ''
  });

  useEffect(() => {
    const medRef = collection(medicalDb, `চিকিৎসা সেবা/blood/items`);
    const unsubscribe = onSnapshot(medRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setItems(list);
    });

    const donorRef = collection(medicalDb, `চিকিৎসা সেবা/blood/donors`);
    const donorUnsubscribe = onSnapshot(donorRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setDonors(list);
    });

    return () => {
      unsubscribe();
      donorUnsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return;
    setIsSubmitting(true);
    try {
        const id = editingId || `med_${Date.now()}`;
        const finalData = { ...form, id };

        await setDoc(doc(medicalDb, `চিকিৎসা সেবা/blood/items`, id), finalData);
        
        alert('সফলভাবে সংরক্ষিত হয়েছে!');
        setShowForm(false);
        setEditingId(null);
        setEditingContactIdx(null);
        setForm({ 
          name: '', location: '', established: '', upazila: '', 
          contacts: [{ name: '', designation: '', bloodGroup: '', address: '', mobile: '' }]
        });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (confirm('আপনি কি এই তথ্যটি ডিলিট করতে চান?')) {
      try {
        await deleteDoc(doc(medicalDb, `চিকিৎসা সেবা/blood/items`, id));
      } catch (e) {
        alert('মুছে ফেলা সম্ভব হয়নি!');
      }
    }
  };

  const handleDonorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!donorForm.name || !donorForm.mobile || !donorForm.bloodGroup) {
      alert('সবগুলো ঘর পূরণ করুন!');
      return;
    }
    setIsSubmitting(true);
    try {
        const id = editingDonorId || `donor_${Date.now()}`;
        const finalData = { ...donorForm, id, createdAt: new Date().toISOString() };

        await setDoc(doc(medicalDb, `চিকিৎসা সেবা/blood/donors`, id), finalData);
        
        alert('রক্তদ্বাতার তথ্য সফলভাবে সংরক্ষিত হয়েছে!');
        setShowDonorForm(false);
        setEditingDonorId(null);
        setDonorForm({ name: '', address: '', bloodGroup: '', mobile: '' });
    } catch (e) { alert('সংরক্ষণ ব্যর্থ হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteDonor = async (id: string) => {
    if (confirm('আপনি কি এই রক্তদ্বাতার তথ্যটি ডিলিট করতে চান?')) {
      try {
        await deleteDoc(doc(medicalDb, `চিকিৎসা সেবা/blood/donors`, id));
      } catch (e) {
        alert('মুছে ফেলা সম্ভব হয়নি!');
      }
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
        <Header title="ব্লাড ব্যাংক ম্যানেজমেন্ট" onBack={onBack} />

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => { 
              setEditingId(null); 
              setEditingContactIdx(null);
              setForm({
                name: '', location: '', established: '', upazila: '', 
                contacts: [{ name: '', designation: '', bloodGroup: '', address: '', mobile: '' }]
              }); 
              setShowForm(true); 
            }}
            className="py-5 bg-[#0056b3] text-white font-black rounded-[28px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
          >
              <Plus size={20} /> নতুন ব্লাড ব্যাংক
          </button>

          <button 
            onClick={() => { 
              setEditingDonorId(null);
              setDonorForm({ name: '', address: '', bloodGroup: '', mobile: '' });
              setShowDonorForm(true); 
            }}
            className="py-5 bg-rose-600 text-white font-black rounded-[28px] shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm"
          >
              <Plus size={20} /> নতুন রক্তদ্বাতা
          </button>
        </div>

        <div className="space-y-3">
            {donors.length > 0 && (
              <div className="pt-4">
                <h4 className="text-xs font-black text-slate-800 uppercase mb-3 px-2">রক্তদ্বাতা তালিকা</h4>
                <div className="space-y-2">
                  {donors.map(donor => (
                    <div key={donor.id} className="bg-white p-4 rounded-2xl border border-rose-100 flex items-center justify-between shadow-sm">
                      <div className="text-left overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black border border-rose-100">{donor.bloodGroup}</span>
                          <h4 className="font-black text-slate-800 truncate text-sm">{donor.name}</h4>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">{donor.mobile} • {donor.address}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { 
                          setEditingDonorId(donor.id);
                          setDonorForm(donor);
                          setShowDonorForm(true); 
                        }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 size={14}/>
                        </button>
                        <button onClick={() => handleDeleteDonor(donor.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <h4 className="text-xs font-black text-slate-800 uppercase mb-3 px-2">ব্লাড ব্যাংক তালিকা</h4>
              {items.length === 0 ? (
                  <div className="py-20 text-center opacity-30">কোনো তথ্য সংরক্ষিত নেই।</div>
              ) : (
                  items.map(item => (
                    <div key={item.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex items-center justify-between shadow-sm group">
                        <div className="flex items-center gap-4 text-left overflow-hidden">
                            <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                                <UserIcon size={24} />
                            </div>
                            <div className="overflow-hidden">
                                <h4 className="font-black text-slate-800 truncate text-sm">{item.name}</h4>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => { 
                              setEditingId(item.id); 
                              setEditingContactIdx(null);
                              setForm({
                                ...item,
                                contacts: item.contacts || [{ name: '', designation: '', bloodGroup: '', address: '', mobile: '' }]
                              }); 
                              setShowForm(true); 
                            }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                                <Edit2 size={16}/>
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all">
                                <Trash2 size={16}/>
                            </button>
                        </div>
                    </div>
                ))
            )}
            </div>
        </div>

        {showForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="font-black text-xl text-slate-800">{editingId ? 'তথ্য সংশোধন' : 'নতুন তথ্য প্রদান'}</h3>
                        <button onClick={()=>{setShowForm(false); setEditingContactIdx(null);}} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                        <div className="text-left w-full">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">উপজেলা সিলেক্ট করুন *</label>
                          <select 
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 transition-all focus:border-blue-400 shadow-sm"
                            value={form.upazila}
                            onChange={e => setForm({...form, upazila: e.target.value})}
                          >
                            <option value="">উপজেলা নির্বাচন করুন</option>
                            <option value="কয়রা">কয়রা উপজেলা</option>
                            <option value="পাইকগাছা">পাইকগাছা উপজেলা</option>
                          </select>
                        </div>
                        <EditField label="ব্লাড ব্যাংকের নাম *" value={form.name} onChange={(v:any)=>setForm({...form, name:v})} placeholder="যেমন: কয়রা ব্লাড ব্যাংক" icon={<Hospital size={18}/>} />
                        <EditField label="স্থাপিত" value={form.established} onChange={(v:any)=>setForm({...form, established:v})} placeholder="যেমন: ২০২০" icon={<Tag size={18}/>} />
                        <EditField label="ঠিকানা" value={form.location} onChange={(v:any)=>setForm({...form, location:v})} placeholder="যেমন: কয়রা সদর" icon={<MapPin size={18}/>} />
                        
                        <div className="pt-4 border-t border-slate-100">
                          <h4 className="text-xs font-black text-slate-800 uppercase mb-4">কন্টাক্ট লিস্ট</h4>
                          <div className="space-y-6">
                            {form.contacts?.map((contact: any, idx: number) => (
                              <div key={idx} className="relative">
                                {editingContactIdx === idx ? (
                                  <div className="p-4 bg-slate-50 rounded-2xl border border-blue-200 space-y-3 animate-in zoom-in-95 duration-200">
                                    <EditField label="নাম" value={contact.name} onChange={(v:any) => {
                                      const newContacts = [...form.contacts];
                                      newContacts[idx].name = v;
                                      setForm({...form, contacts: newContacts});
                                    }} placeholder="নাম" />
                                    <EditField label="পদবী" value={contact.designation} onChange={(v:any) => {
                                      const newContacts = [...form.contacts];
                                      newContacts[idx].designation = v;
                                      setForm({...form, contacts: newContacts});
                                    }} placeholder="পদবী" />
                                    <EditField label="ব্লাড গ্রুপ" value={contact.bloodGroup} onChange={(v:any) => {
                                      const newContacts = [...form.contacts];
                                      newContacts[idx].bloodGroup = v;
                                      setForm({...form, contacts: newContacts});
                                    }} placeholder="যেমন: A+" />
                                    <EditField label="ঠিকানা" value={contact.address} onChange={(v:any) => {
                                      const newContacts = [...form.contacts];
                                      newContacts[idx].address = v;
                                      setForm({...form, contacts: newContacts});
                                    }} placeholder="ঠিকানা" />
                                    <EditField label="মোবাইল নং" value={contact.mobile} onChange={(v:any) => {
                                      const newContacts = [...form.contacts];
                                      newContacts[idx].mobile = v;
                                      setForm({...form, contacts: newContacts});
                                    }} placeholder="০১xxxxxxxxx" />
                                    
                                    <button 
                                      onClick={() => setEditingContactIdx(null)}
                                      className="w-full py-3 bg-blue-600 text-white font-black rounded-xl shadow-md active:scale-95 transition-all text-sm mt-2"
                                    >
                                      সেভ করুন
                                    </button>
                                  </div>
                                ) : (
                                  <div className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm group">
                                    <div className="text-left overflow-hidden">
                                      <p className="font-black text-slate-800 text-sm truncate">{contact.name || 'নামহীন কন্টাক্ট'}</p>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{contact.designation || 'পদবী নেই'}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={() => setEditingContactIdx(idx)}
                                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                      >
                                        <Edit2 size={14} />
                                      </button>
                                      <button 
                                        onClick={() => {
                                          const newContacts = [...form.contacts];
                                          newContacts.splice(idx, 1);
                                          setForm({...form, contacts: newContacts});
                                        }}
                                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                      >
                                        <Trash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            <button 
                              onClick={() => {
                                const newIdx = form.contacts?.length || 0;
                                setForm({...form, contacts: [...(form.contacts || []), { name: '', designation: '', bloodGroup: '', address: '', mobile: '' }]});
                                setEditingContactIdx(newIdx);
                              }}
                              className="w-full py-3 bg-blue-50 text-blue-600 font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-xs"
                            >
                              <Plus size={14} /> কনট্যাক্ট এড করুন
                            </button>
                          </div>
                        </div>

                        <button 
                            onClick={handleSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-[#0056b3] text-white font-black rounded-[28px] shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-blue-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}

        {showDonorForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in duration-300">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="font-black text-xl text-slate-800">{editingDonorId ? 'রক্তদ্বাতা সংশোধন' : 'নতুন রক্তদ্বাতা'}</h3>
                        <button onClick={()=>{setShowDonorForm(false); setEditingDonorId(null);}} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    
                    <div className="space-y-4 pt-2">
                        <EditField label="রক্তদ্বাতার নাম *" value={donorForm.name} onChange={(v:any)=>setDonorForm({...donorForm, name:v})} placeholder="নাম লিখুন" icon={<UserIcon size={18}/>} />
                        <EditField label="ঠিকানা *" value={donorForm.address} onChange={(v:any)=>setDonorForm({...donorForm, address:v})} placeholder="যেমন: কয়রা সদর" icon={<MapPin size={18}/>} />
                        <div className="text-left w-full">
                          <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">রক্তের গ্রুপ *</label>
                          <select 
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none text-slate-800 transition-all focus:border-blue-400 shadow-sm"
                            value={donorForm.bloodGroup}
                            onChange={e => setDonorForm({...donorForm, bloodGroup: e.target.value})}
                          >
                            <option value="">গ্রুপ নির্বাচন করুন</option>
                            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <EditField label="মোবাইল নং *" value={donorForm.mobile} onChange={(v:any)=>setDonorForm({...donorForm, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />

                        <button 
                            onClick={handleDonorSubmit} 
                            disabled={isSubmitting} 
                            className="w-full py-5 bg-rose-600 text-white font-black rounded-[28px] shadow-lg mt-4 flex items-center justify-center gap-2 active:scale-95 transition-all shadow-rose-500/20 disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (editingDonorId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
