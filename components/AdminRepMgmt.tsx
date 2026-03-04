
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  ChevronLeft, 
  Trash2, 
  Plus, 
  X, 
  Search, 
  Smartphone, 
  MapPin, 
  User as UserIcon, 
  Tag, 
  Loader2,
  Camera,
  ChevronRight,
  Info,
  Settings2,
  FolderPlus,
  Home,
  ChevronDown,
  Edit2,
  Mail,
  Type,
  CheckCircle2
} from 'lucide-react';
import { ref, onValue, set, push, remove } from 'firebase/database';
import { directoryDb } from '../Firebase-directory';
import { uploadImageToServer } from '../src/services/uploadService';

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex items-center gap-4 mb-6 text-left">
    <button onClick={onBack} className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90 transition-all">
      <ChevronLeft size={20} className="text-slate-800" />
    </button>
    <h2 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h2>
  </div>
);

const EditField: React.FC<{ label: string; value: string; placeholder?: string; onChange: (v: string) => void; icon?: React.ReactNode; type?: string }> = ({ label, value, placeholder, onChange, icon, type = 'text' }) => (
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

interface Category {
  id: string;
  name: string;
  parentId: string;
}

interface CustomField {
  label: string;
  value: string;
}

const AdminRepMgmt: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const rootNode = 'জনপ্রতিনিধি';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [currentPath, setCurrentPath] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [currentContacts, setCurrentContacts] = useState<any[]>([]);
  
  const [showCatForm, setShowCatForm] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showComboMenu, setShowComboMenu] = useState(false);
  const [showUnionForm, setShowUnionForm] = useState(false);
  const [activeInlineField, setActiveInlineField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [catName, setCatName] = useState('');
  const [contactForm, setContactForm] = useState({
    name: '', 
    designation: '', 
    mobile: '', 
    extraMobiles: [] as string[],
    email: '',
    address: '', 
    politicalIdentity: '',
    customInfo: [] as CustomField[],
    description: '', 
    photo: ''
  });

  const parentId = useMemo(() => currentPath.length > 0 ? currentPath[currentPath.length - 1].id : 'root', [currentPath]);

  useEffect(() => {
    const catsRef = ref(directoryDb, `${rootNode}/categories`);
    const unsubscribe = onValue(catsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAllCategories(Object.values(data));
      } else {
        setAllCategories([]);
      }
    });
    return () => unsubscribe();
  }, [rootNode]);

  useEffect(() => {
    const dataRef = ref(directoryDb, `${rootNode}/data/${parentId}`);
    const unsubscribe = onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]: [string, any]) => ({
          ...value,
          id
        }));
        setCurrentContacts(list);
      } else {
        setCurrentContacts([]);
      }
    });
    return () => unsubscribe();
  }, [rootNode, parentId]);

  const subCategories = useMemo(() => 
    allCategories.filter(c => c.parentId === parentId), 
  [allCategories, parentId]);

  const handleAddCategory = async () => {
    if (!catName.trim()) return;
    setIsSubmitting(true);
    try {
        const id = editingCategoryId || `cat_${Date.now()}`;
        const currentParentId = editingCategoryId 
            ? (allCategories.find(c => c.id === editingCategoryId)?.parentId || parentId)
            : parentId;

        const newCat = { id, name: catName, parentId: currentParentId };
        const catRef = ref(directoryDb, `${rootNode}/categories/${id}`);
        await set(catRef, newCat);
        
        setCatName('');
        setEditingCategoryId(null);
        setShowCatForm(false);
    } catch (error) {
        alert('ক্যাটাগরি সেভ করতে সমস্যা হয়েছে!');
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.mobile) return;
    setIsSubmitting(true);
    try {
        let photoUrl = contactForm.photo;
        
        if (selectedFile) {
          try {
            photoUrl = await uploadImageToServer(selectedFile);
          } catch (uploadError: any) {
            alert(uploadError.message || 'ইমেজ আপলোড ব্যর্থ হয়েছে!');
            setIsSubmitting(false);
            return;
          }
        }

        const finalData = { ...contactForm, photo: photoUrl };

        if (editingContactId) {
          const contactRef = ref(directoryDb, `${rootNode}/data/${parentId}/${editingContactId}`);
          await set(contactRef, { ...finalData, id: editingContactId });
        } else {
          const dataRef = ref(directoryDb, `${rootNode}/data/${parentId}`);
          const newRef = push(dataRef);
          await set(newRef, { ...finalData, id: newRef.key });
        }
        
        alert('সফলভাবে সংরক্ষিত হয়েছে!');
        setShowContactForm(false);
        setEditingContactId(null);
        setSelectedFile(null);
        setContactForm({ name: '', designation: '', mobile: '', extraMobiles: [], email: '', address: '', politicalIdentity: '', customInfo: [], description: '', photo: '' });
    } catch (e) { alert('তথ্য সেভ করতে সমস্যা হয়েছে!'); }
    finally { setIsSubmitting(false); }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('এই ক্যাটাগরি এবং এর ভেতরের সকল তথ্য স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?')) {
        try {
            setIsSubmitting(true);
            const catRef = ref(directoryDb, `${rootNode}/categories/${id}`);
            await remove(catRef);
            const dataRef = ref(directoryDb, `${rootNode}/data/${id}`);
            await remove(dataRef);
        } catch (error) {
            alert('মুছে ফেলা সম্ভব হয়নি। আবার চেষ্টা করুন।');
        } finally {
            setIsSubmitting(false);
        }
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('এই কন্টাক্ট নম্বরটি মুছে ফেলতে চান?')) {
        try {
            const contactRef = ref(directoryDb, `${rootNode}/data/${parentId}/${contactId}`);
            await remove(contactRef);
        } catch (error) {
            alert('মুছে ফেলা সম্ভব হয়নি!');
        }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setContactForm(prev => ({ ...prev, photo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const handleAddExtraMobile = () => {
    setContactForm(prev => ({ ...prev, extraMobiles: [...prev.extraMobiles, ''] }));
  };

  const handleExtraMobileChange = (index: number, value: string) => {
    const newMobiles = [...contactForm.extraMobiles];
    newMobiles[index] = value;
    setContactForm(prev => ({ ...prev, extraMobiles: newMobiles }));
  };

  const handleRemoveExtraMobile = (index: number) => {
    setContactForm(prev => ({ ...prev, extraMobiles: prev.extraMobiles.filter((_, i) => i !== index) }));
  };

  const handleAddCustomInfo = () => {
    setContactForm(prev => ({ ...prev, customInfo: [...prev.customInfo, { label: '', value: '' }] }));
  };

  const handleCustomInfoChange = (index: number, field: 'label' | 'value', value: string) => {
    const newInfo = [...contactForm.customInfo];
    newInfo[index][field] = value;
    setContactForm(prev => ({ ...prev, customInfo: newInfo }));
  };

  const handleRemoveCustomInfo = (index: number) => {
    setContactForm(prev => ({ ...prev, customInfo: prev.customInfo.filter((_, i) => i !== index) }));
  };

  const resetToRoot = () => {
    setCurrentPath([]);
    setShowContactForm(false);
    setShowUnionForm(false);
    setActiveInlineField(null);
  };

  if (showUnionForm) {
    const currentCategoryName = currentPath.length > 0 ? currentPath[currentPath.length - 1].name : '';
    const autoTitle = currentCategoryName ? `${currentCategoryName} পরিষদ` : '';

    const sections = [
      {
        title: 'জনপ্রতিনিধি',
        fields: [
          'চেয়ারম্যান',
          'মেম্বার ১নং ওয়ার্ড', 'মেম্বার ২নং ওয়ার্ড', 'মেম্বার ৩নং ওয়ার্ড',
          'মেম্বার ৪নং ওয়ার্ড', 'মেম্বার ৫নং ওয়ার্ড', 'মেম্বার ৬নং ওয়ার্ড',
          'মেম্বার ৭নং ওয়ার্ড', 'মেম্বার ৮নং ওয়ার্ড', 'মেম্বার ৯নং ওয়ার্ড',
          'সংরক্ষিত মহিলা আসন (১,২ এবং ৩ নং ওয়ার্ড)',
          'সংরক্ষিত মহিলা আসন (৪,৫ এবং ৬ নং ওয়ার্ড)',
          'সংরক্ষিত মহিলা আসন (৭,৮ এবং ৯ নং ওয়ার্ড)'
        ]
      },
      {
        title: 'অফিসিয়াল',
        fields: ['সচিব', 'হিসাব সহকারী কাম কম্পিউটার অপারেটর']
      },
      {
        title: 'গ্রাম পুলিশ',
        fields: [
          'দফাদার',
          'গ্রাম পুলিশ ১নং ওয়ার্ড', 'গ্রাম পুলিশ ২নং ওয়ার্ড', 'গ্রাম পুলিশ ৩নং ওয়ার্ড',
          'গ্রাম পুলিশ ৪নং ওয়ার্ড', 'গ্রাম পুলিশ ৫নং ওয়ার্ড', 'গ্রাম পুলিশ ৬নং ওয়ার্ড',
          'গ্রাম পুলিশ ৭নং ওয়ার্ড', 'গ্রাম পুলিশ ৮নং ওয়ার্ড', 'গ্রাম পুলিশ ৯নং ওয়ার্ড'
        ]
      }
    ];

    return (
      <div className="animate-in slide-in-from-right-4 duration-500 pb-20 space-y-6">
        <div className="flex items-center gap-4 mb-2 text-left">
          <button onClick={() => setShowUnionForm(false)} className="p-3 bg-white rounded-xl shadow-sm active:scale-90 transition-all">
            <ChevronLeft size={20} className="text-slate-800" />
          </button>
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">ইউনিয়ন পরিষদ ফর্ম</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">কম্বো পেইজ সেটআপ</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl space-y-8">
          <div className="text-left">
            <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">পেইজ টাইটেল (অটো ইনপুট)</label>
            <input 
              type="text" 
              readOnly 
              className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-blue-600 outline-none shadow-inner"
              value={autoTitle}
            />
          </div>

          {sections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 bg-slate-100"></div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{section.title}</h3>
                <div className="h-[1px] flex-1 bg-slate-100"></div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                {section.fields.map((field, fIdx) => {
                  const isActive = activeInlineField === field;
                  const existingContact = currentContacts.find(c => c.designation === field);

                  return (
                    <div key={fIdx} className="space-y-3">
                      <button 
                        onClick={() => {
                          if (isActive) {
                            setActiveInlineField(null);
                          } else {
                            setActiveInlineField(field);
                            if (existingContact) {
                              setEditingContactId(existingContact.id);
                              setContactForm({
                                name: existingContact.name || '',
                                designation: existingContact.designation || field,
                                mobile: existingContact.mobile || '',
                                extraMobiles: existingContact.extraMobiles || [],
                                email: existingContact.email || '',
                                address: existingContact.address || currentCategoryName,
                                politicalIdentity: existingContact.politicalIdentity || '',
                                customInfo: existingContact.customInfo || [],
                                description: existingContact.description || '',
                                photo: existingContact.photo || ''
                              });
                            } else {
                              setEditingContactId(null);
                              setContactForm({
                                name: '',
                                designation: field,
                                mobile: '',
                                extraMobiles: [],
                                email: '',
                                address: currentCategoryName,
                                politicalIdentity: '',
                                customInfo: [],
                                description: '',
                                photo: ''
                              });
                            }
                          }
                        }}
                        className={`w-full flex items-center justify-between p-4 border rounded-2xl transition-all group active:scale-[0.98] ${isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50/50 hover:bg-blue-50 border-slate-100 text-slate-700'}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm border transition-all ${isActive ? 'bg-white text-blue-600 border-white' : 'bg-white text-blue-500 border-slate-100 group-hover:bg-blue-600 group-hover:text-white'}`}>
                            {existingContact ? <CheckCircle2 size={18} /> : <Plus size={18} />}
                          </div>
                          <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-slate-700'}`}>{field}</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${isActive ? 'rotate-180 text-white' : 'text-slate-300'}`} />
                      </button>

                      {isActive && (
                        <div className="animate-in slide-in-from-top-4 duration-300 bg-white p-5 rounded-3xl border border-blue-100 shadow-xl space-y-5 mx-1">
                          {(() => {
                            const handleSaveContact = async () => {
                              if (!contactForm.name || !contactForm.mobile) {
                                alert('নাম এবং মোবাইল নম্বর আবশ্যক!');
                                return;
                              }
                              setIsSubmitting(true);
                              try {
                                let photoUrl = contactForm.photo;
                                if (selectedFile) {
                                  photoUrl = await uploadImageToServer(selectedFile);
                                }
                                
                                const finalData = { ...contactForm, photo: photoUrl };
                                const contactId = editingContactId || push(ref(directoryDb, `${rootNode}/data/${parentId}`)).key;
                                const contactRef = ref(directoryDb, `${rootNode}/data/${parentId}/${contactId}`);
                                
                                await set(contactRef, { ...finalData, id: contactId });
                                alert('সফলভাবে সংরক্ষিত হয়েছে!');
                                setActiveInlineField(null);
                                setEditingContactId(null);
                                setSelectedFile(null);
                              } catch (e) {
                                alert('তথ্য সেভ করতে সমস্যা হয়েছে!');
                              } finally {
                                setIsSubmitting(false);
                              }
                            };

                            return (
                              <>
                                <div className="flex flex-col items-center pt-2">
                                  <div className="relative group">
                                    <div className="w-24 h-24 rounded-[30px] bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-200">
                                      {contactForm.photo ? (
                                        <img src={contactForm.photo} className="w-full h-full object-cover" alt="" />
                                      ) : (
                                        <UserIcon size={40} strokeWidth={1.5} />
                                      )}
                                    </div>
                                    <button 
                                      type="button"
                                      onClick={() => fileInputRef.current?.click()}
                                      className="absolute bottom-0 right-0 p-2.5 bg-blue-500 text-white rounded-xl shadow-xl border-4 border-white active:scale-90 transition-all"
                                    >
                                      <Camera size={16} strokeWidth={3} />
                                    </button>
                                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                                  </div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-3">ছবি নির্বাচন করুন</p>
                                </div>

                                <div className="space-y-4">
                                  <EditField label="নাম *" value={contactForm.name} onChange={v=>setContactForm({...contactForm, name:v})} placeholder="নাম লিখুন" icon={<UserIcon size={16}/>} />
                                  <EditField label="পদবি (অটো ইনপুট)" value={contactForm.designation} onChange={()=>{}} readOnly placeholder="পদবি" icon={<Tag size={16}/>} />
                                  <EditField label="মোবাইল নং *" value={contactForm.mobile} onChange={v=>setContactForm({...contactForm, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={16}/>} />
                                  <EditField label="ইমেইল" value={contactForm.email} onChange={v=>setContactForm({...contactForm, email:v})} placeholder="example@mail.com" icon={<Mail size={16}/>} />
                                  <EditField label="ঠিকানা (অটো ইনপুট)" value={contactForm.address} onChange={()=>{}} readOnly placeholder="ঠিকানা" icon={<MapPin size={16}/>} />

                                  <div className="space-y-3">
                                    {contactForm.customInfo.map((info, idx) => (
                                      <div key={idx} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-3 relative">
                                        <button type="button" onClick={() => handleRemoveCustomInfo(idx)} className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500"><X size={16}/></button>
                                        <div className="grid grid-cols-2 gap-2">
                                          <EditField label="টাইটেল" value={info.label} onChange={v => handleCustomInfoChange(idx, 'label', v)} placeholder="যেমন: ব্লাড গ্রুপ" icon={<Type size={14}/>} />
                                          <EditField label="তথ্য" value={info.value} onChange={v => handleCustomInfoChange(idx, 'value', v)} placeholder="যেমন: O+" icon={<Info size={14}/>} />
                                        </div>
                                      </div>
                                    ))}
                                    <button type="button" onClick={handleAddCustomInfo} className="flex items-center gap-2 text-[10px] font-black text-blue-600 pl-1 hover:opacity-70 transition-all">
                                      <Plus size={14} /> + কাস্টমস ঘর যোগ করুন
                                    </button>
                                  </div>

                                  <button 
                                    onClick={handleSaveContact}
                                    disabled={isSubmitting}
                                    className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                                  >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                                    {existingContact ? 'তথ্য আপডেট করুন' : 'তথ্য সেভ করুন'}
                                  </button>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <button 
            onClick={() => {
              // Mark this category as a combo page in Firebase
              if (parentId !== 'root') {
                const catRef = ref(directoryDb, `${rootNode}/categories/${parentId}`);
                set(catRef, {
                  ...allCategories.find(c => c.id === parentId),
                  isComboPage: true,
                  comboType: 'union'
                });
                alert('কম্বো পেইজ সফলভাবে কনফিগার করা হয়েছে!');
                setShowUnionForm(false);
              }
            }}
            className="w-full py-5 bg-emerald-600 text-white font-black rounded-3xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <CheckCircle2 size={20} /> কনফিগারেশন সম্পন্ন করুন
          </button>
        </div>
      </div>
    );
  }

  if (showContactForm) {
    return (
      <div className="animate-in slide-in-from-right-4 duration-500 pb-20 space-y-6">
        <div className="flex items-center gap-4 mb-2 text-left">
          <button onClick={() => setShowContactForm(false)} className="p-3 bg-white rounded-xl shadow-sm active:scale-90 transition-all">
            <ChevronLeft size={20} className="text-slate-800" />
          </button>
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{editingContactId ? 'কন্টাক্ট সংশোধন' : 'নতুন কন্টাক্ট'}</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">তথ্য প্রদান করুন</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[40px] border border-slate-100 shadow-xl space-y-6">
            <div className="flex flex-col items-center pt-2">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-[35px] bg-slate-50 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-slate-200">
                        {contactForm.photo ? (
                            <img src={contactForm.photo} className="w-full h-full object-cover" />
                        ) : (
                            <UserIcon size={45} strokeWidth={1.5} />
                        )}
                    </div>
                    <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 p-3 bg-[#3498DB] text-white rounded-2xl shadow-xl border-4 border-white active:scale-90 transition-all"
                    >
                        <Camera size={18} strokeWidth={3} />
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4">প্রোফাইল ফটো নির্বাচন করুন</p>
            </div>

            <div className="space-y-5">
                <EditField label="নাম *" value={contactForm.name} onChange={v=>setContactForm({...contactForm, name:v})} placeholder="সম্পূর্ণ নাম লিখুন" icon={<UserIcon size={18}/>} />
                
                {!showUnionForm && (
                    <EditField label="উপাধি/পদবী" value={contactForm.designation} onChange={v=>setContactForm({...contactForm, designation:v})} placeholder="যেমন: ইউপি মেম্বার" icon={<Tag size={18}/>} />
                )}
                
                <div className="space-y-3">
                    <EditField label="মোবাইল নং *" value={contactForm.mobile} onChange={v=>setContactForm({...contactForm, mobile:v})} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                    
                    {!showUnionForm && contactForm.extraMobiles.map((mob, idx) => (
                      <div key={idx} className="flex gap-2 animate-in slide-in-from-top-1 duration-200">
                        <EditField label={`অতিরিক্ত নম্বর (${idx + 1})`} value={mob} onChange={v => handleExtraMobileChange(idx, v)} placeholder="০১xxxxxxxxx" icon={<Smartphone size={18}/>} />
                        <button type="button" onClick={() => handleRemoveExtraMobile(idx)} className="mt-6 p-3 text-red-500 bg-red-50 rounded-xl active:scale-90 transition-all flex items-center justify-center h-[52px] w-[52px]">
                          <Trash2 size={20} />
                        </button>
                      </div>
                    ))}
                    
                    {!showUnionForm && (
                      <button type="button" onClick={handleAddExtraMobile} className="flex items-center gap-2 text-xs font-black text-[#3498DB] pl-1 hover:opacity-70 transition-all">
                        <Plus size={16} /> + আরও মোবাইল নম্বর
                      </button>
                    )}
                </div>

                <EditField label="ইমেইল ঠিকানা (ঐচ্ছিক)" value={contactForm.email} onChange={v=>setContactForm({...contactForm, email:v})} placeholder="example@mail.com" icon={<Mail size={18}/>} />
                
                <EditField label="ঠিকানা" value={contactForm.address} onChange={v=>setContactForm({...contactForm, address:v})} placeholder="ঠিকানা লিখুন" icon={<MapPin size={18}/>} />

                {showUnionForm && (
                    <EditField label="রাজনৈতিক পরিচয়" value={contactForm.politicalIdentity} onChange={v=>setContactForm({...contactForm, politicalIdentity:v})} placeholder="যেমন: বাংলাদেশ আওয়ামী লীগ" icon={<Tag size={18}/>} />
                )}

                <div className="space-y-3">
                    {contactForm.customInfo.map((info, idx) => (
                      <div key={idx} className="p-5 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-4 animate-in slide-in-from-bottom-2 duration-300 relative">
                        <button type="button" onClick={() => handleRemoveCustomInfo(idx)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500"><X size={18}/></button>
                        <div className="grid grid-cols-2 gap-3">
                          <EditField label="ঘরের নাম (টাইটেল)" value={info.label} onChange={v => handleCustomInfoChange(idx, 'label', v)} placeholder="যেমন: ব্লাড গ্রুপ" icon={<Type size={16}/>} />
                          <EditField label="তথ্য" value={info.value} onChange={v => handleCustomInfoChange(idx, 'value', v)} placeholder="যেমন: O+" icon={<Info size={16}/>} />
                        </div>
                      </div>
                    ))}
                    
                    <button type="button" onClick={handleAddCustomInfo} className="flex items-center gap-2 text-xs font-black text-blue-600 pl-1 hover:opacity-70 transition-all">
                      <Plus size={16} /> {showUnionForm ? '+ আরও তথ্য যোগ' : '+ আরও তথ্য (কাস্টম ফিল্ড)'}
                    </button>
                </div>

                {!showUnionForm && (
                    <div className="text-left">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1.5 uppercase tracking-wider pl-1">অতিরিক্ত বিবরণ</label>
                        <textarea 
                            className="w-full p-4 bg-slate-50 border border-slate-100 rounded-3xl font-bold outline-none text-slate-800 h-28 text-sm leading-relaxed"
                            value={contactForm.description}
                            onChange={e => setContactForm({...contactForm, description: e.target.value})}
                            placeholder="কন্টাক্ট সম্পর্কে অতিরিক্ত কোনো তথ্য থাকলে লিখুন..."
                        />
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="flex-1 py-5 bg-slate-100 text-slate-500 font-black rounded-3xl active:scale-95 transition-all"
                  >
                      বাতিল করুন
                  </button>
                  <button 
                      onClick={handleContactSubmit} 
                      disabled={isSubmitting || !contactForm.name || !contactForm.mobile} 
                      className="flex-[2] py-5 bg-[#3498DB] text-white font-black rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50"
                  >
                      {isSubmitting ? <Loader2 className="animate-spin" /> : (editingContactId ? 'আপডেট করুন' : 'সংরক্ষণ করুন')}
                  </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
        <Header title="জনপ্রতিনিধি ম্যানেজার" onBack={onBack} />
        
        <div className="bg-slate-50 p-4 rounded-[26px] flex items-center gap-2 overflow-x-auto no-scrollbar border border-slate-100 shadow-inner">
            <button onClick={resetToRoot} className={`p-2 rounded-lg transition-colors shrink-0 ${currentPath.length === 0 ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-200'}`}>
                <Home size={16}/>
            </button>
            {currentPath.map((node, idx) => (
                <React.Fragment key={node.id}>
                    <ChevronRight size={14} className="text-slate-300 shrink-0" />
                    <button 
                        onClick={() => { setCurrentPath(currentPath.slice(0, idx + 1)); setActiveInlineField(null); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-colors ${idx === currentPath.length - 1 ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}
                    >
                        {node.name}
                    </button>
                </React.Fragment>
            ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
            <button 
                onClick={() => { setEditingCategoryId(null); setCatName(''); setShowCatForm(true); }}
                className="py-4 bg-white border border-blue-100 text-blue-600 font-black rounded-[24px] shadow-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all text-[10px]"
            >
                <FolderPlus size={16}/> ক্যাটাগরি
            </button>
            <button 
                onClick={() => { 
                  setEditingContactId(null); 
                  setContactForm({name:'', designation:'', mobile:'', extraMobiles: [], email: '', address:'', politicalIdentity: '', customInfo: [], description:'', photo:''}); 
                  setShowContactForm(true); 
                }}
                className="py-4 bg-[#3498DB] text-white font-black rounded-[24px] shadow-lg flex items-center justify-center gap-1 active:scale-95 transition-all text-[10px]"
            >
                <Plus size={16}/> কনট্যাক্ট
            </button>
            <button 
                onClick={() => setShowComboMenu(!showComboMenu)}
                className={`py-4 ${showComboMenu ? 'bg-emerald-600' : 'bg-emerald-500'} text-white font-black rounded-[24px] shadow-lg flex items-center justify-center gap-1 active:scale-95 transition-all text-[10px]`}
            >
                <Plus size={16}/> কম্বো পেইজ
            </button>
        </div>

        {showComboMenu && (
            <div className="grid grid-cols-1 gap-2 animate-in slide-in-from-top-2 duration-300">
                <button 
                    onClick={() => { setShowUnionForm(true); setShowComboMenu(false); }}
                    className="w-full py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl border border-emerald-100 text-xs active:scale-[0.98] transition-all"
                >
                    ইউনিয়ন পরিষদ ফর্ম
                </button>
                <button 
                    onClick={() => { alert('পৌরসভা ফর্ম শীঘ্রই আসছে'); setShowComboMenu(false); }}
                    className="w-full py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl border border-emerald-100 text-xs active:scale-[0.98] transition-all"
                >
                    পৌরসভা ফর্ম
                </button>
                <button 
                    onClick={() => { alert('উপজেলা পরিষদ ফর্ম শীঘ্রই আসছে'); setShowComboMenu(false); }}
                    className="w-full py-3.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl border border-emerald-100 text-xs active:scale-[0.98] transition-all"
                >
                    উপজেলা পরিষদ ফর্ম
                </button>
            </div>
        )}

        <div className="space-y-4">
            {subCategories.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-left">সাব-ক্যাটাগরি সমূহ</p>
                    {subCategories.map(cat => (
                        <div key={cat.id} className="flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                            <button 
                                onClick={() => { setCurrentPath([...currentPath, cat]); setActiveInlineField(null); }}
                                className="flex-1 flex items-center justify-between p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group"
                            >
                                <div className="flex items-center gap-4 overflow-hidden">
                                    <div className="w-11 h-11 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                                        <Settings2 size={18} />
                                    </div>
                                    <span className="font-black text-slate-800 text-sm truncate">{cat.name}</span>
                                </div>
                                <ChevronRight size={18} className="text-slate-300 group-hover:text-blue-500 transition-colors shrink-0" />
                            </button>
                            
                            <div className="flex gap-2 shrink-0">
                                <button 
                                    onClick={() => { setEditingCategoryId(cat.id); setCatName(cat.name); setShowCatForm(true); }} 
                                    className="p-4 bg-blue-50 text-blue-600 rounded-[22px] active:scale-90 transition-all opacity-40 hover:opacity-100"
                                >
                                    <Edit2 size={18}/>
                                </button>
                                <button 
                                    onClick={() => handleDeleteCategory(cat.id)} 
                                    className="p-4 bg-red-50 text-red-500 rounded-[22px] active:scale-90 transition-all opacity-40 hover:opacity-100"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="space-y-3 pt-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 text-left">কন্টাক্ট লিস্ট ({currentContacts.length})</p>
                {currentContacts.length === 0 && subCategories.length === 0 ? (
                    <div className="py-20 text-center opacity-30 flex flex-col items-center gap-3">
                        <Info size={40} className="text-slate-400" />
                        <p className="font-bold">এই ফোল্ডারে কোনো তথ্য নেই</p>
                    </div>
                ) : (
                    currentContacts.map(item => (
                        <div key={item.id} className="bg-white p-5 rounded-[32px] border border-slate-100 flex items-center justify-between shadow-sm group animate-in fade-in">
                            <div className="flex items-center gap-4 text-left overflow-hidden">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center text-slate-300 shrink-0">
                                    {item.photo ? <img src={item.photo} className="w-full h-full object-cover" /> : <UserIcon size={20} />}
                                </div>
                                <div className="overflow-hidden">
                                    <h4 className="font-black text-slate-800 truncate text-sm">{item.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{item.designation || 'নির্ধারিত নয়'}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => { 
                                  setEditingContactId(item.id); 
                                  setContactForm({
                                    ...item,
                                    extraMobiles: item.extraMobiles || [],
                                    customInfo: item.customInfo || [],
                                    email: item.email || ''
                                  }); 
                                  setShowContactForm(true); 
                                }} className="p-3 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all">
                                    <Edit2 size={16}/>
                                </button>
                                <button onClick={() => handleDeleteContact(item.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all opacity-40 group-hover:opacity-100">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {showCatForm && (
            <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-5 flex items-center justify-center">
                <div className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300 text-left">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black text-xl text-slate-800">{editingCategoryId ? 'ক্যাটাগরি সংশোধন' : 'নতুন সাব-ক্যাটাগরি'}</h3>
                        <button onClick={()=>setShowCatForm(false)} className="p-2 text-slate-400 hover:text-red-500"><X/></button>
                    </div>
                    {!editingCategoryId && (
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-2 text-left">
                            <p className="text-[10px] font-black text-blue-500 uppercase">প্যারেন্ট ক্যাটাগরি:</p>
                            <p className="text-sm font-black text-slate-700">{currentPath.length > 0 ? currentPath[currentPath.length-1].name : 'মূল ক্যাটাগরি'}</p>
                        </div>
                    )}
                    <EditField label="ক্যাটাগরি নাম" value={catName} onChange={setCatName} placeholder="যেমন: রাজনৈতিক ব্যক্তি বা ইউনিয়ন" icon={<FolderPlus size={18}/>} />
                    <button 
                        onClick={handleAddCategory} 
                        disabled={isSubmitting || !catName.trim()} 
                        className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : (editingCategoryId ? 'আপডেট করুন' : 'ক্যাটাগরি তৈরি করুন')}
                    </button>
                </div>
            </div>
        )}
    </div>
  );
};

export default AdminRepMgmt;
