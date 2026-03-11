
import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronLeft, 
  Camera, 
  Home, 
  MapPin, 
  Phone, 
  Tag, 
  Building2,
  Store,
  Warehouse,
  Users,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp 
} from 'firebase/firestore';
import { userDb } from '../Firebase-user';
import { HouseRental } from '../types';

interface AdminHouseRentMgmtProps {
  onBack: () => void;
}

const CATEGORIES = ['Family House', 'Mess', 'Shop', 'Godown'];
const AREAS = ['Koyra', 'Paikgacha'];

const CATEGORY_BN: Record<string, string> = {
  'Family House': 'ফ্যামিলি বাসা',
  'Mess': 'মেস',
  'Shop': 'দোকান',
  'Godown': 'গোডাউন'
};

const AREA_BN: Record<string, string> = {
  'Koyra': 'কয়রা',
  'Paikgacha': 'পাইকগাছা'
};

export default function AdminHouseRentMgmt({ onBack }: AdminHouseRentMgmtProps) {
  const [rentals, setRentals] = useState<HouseRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Family House',
    rent: '',
    address: '',
    area: 'Koyra',
    contact: '',
    image: '',
    status: 'Available' as 'Available' | 'Rented Out'
  });

  useEffect(() => {
    const q = query(collection(userDb, 'house_rentals'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as HouseRental));
      setRentals(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.rent || !formData.contact) {
      alert('সবগুলো ঘর পূরণ করুন!');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(userDb, 'house_rentals', editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(userDb, 'house_rentals'), {
          ...formData,
          createdAt: Date.now()
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({
        title: '',
        category: 'Family House',
        rent: '',
        address: '',
        area: 'Koyra',
        contact: '',
        image: '',
        status: 'Available'
      });
    } catch (err) {
      console.error(err);
      alert('সেভ করতে সমস্যা হয়েছে!');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: HouseRental) => {
    setFormData({
      title: item.title,
      category: item.category,
      rent: item.rent,
      address: item.address,
      area: item.area as any,
      contact: item.contact,
      image: item.image || '',
      status: item.status
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত যে এটি ডিলিট করতে চান?')) {
      try {
        await deleteDoc(doc(userDb, 'house_rentals', id));
      } catch (err) {
        alert('ডিলিট করতে সমস্যা হয়েছে!');
      }
    }
  };

  const toggleStatus = async (item: HouseRental) => {
    const newStatus = item.status === 'Available' ? 'Rented Out' : 'Available';
    try {
      await updateDoc(doc(userDb, 'house_rentals', item.id), { status: newStatus });
    } catch (err) {
      alert('স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  const toBn = (num: string | number) => 
    (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  return (
    <div className="flex flex-col h-full bg-slate-50 animate-in fade-in duration-500">
      {/* Header */}
      <div className="shrink-0 p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-slate-400 active:scale-90"><ChevronLeft size={24}/></button>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">বাসা ভাড়া ম্যানেজমেন্ট</h2>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 active:scale-90 transition-all"
          >
            <Plus size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {isAdding ? (
          <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm space-y-6 animate-in zoom-in duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-800">{editingId ? 'পোস্ট এডিট করুন' : 'নতুন পোস্ট যোগ করুন'}</h3>
              <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 text-slate-400"><XCircle size={24}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Image Upload */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-full h-48 bg-slate-50 rounded-[28px] border-2 border-dashed border-slate-200 overflow-hidden relative group">
                  {formData.image ? (
                    <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                      <Camera size={48} />
                      <p className="text-[10px] font-black uppercase tracking-widest mt-2">ছবি আপলোড করুন</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">পোস্টের শিরোনাম</label>
                  <input 
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:border-blue-400" 
                    placeholder="যেমন: ৩ রুমের ফ্যামিলি বাসা ভাড়া"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">ক্যাটাগরি</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:border-blue-400 appearance-none"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_BN[c]}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">এলাকা</label>
                    <select 
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:border-blue-400 appearance-none"
                      value={formData.area}
                      onChange={e => setFormData({ ...formData, area: e.target.value as any })}
                    >
                      {AREAS.map(a => <option key={a} value={a}>{AREA_BN[a]}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">মাসিক ভাড়া (৳)</label>
                    <input 
                      type="number"
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:border-blue-400" 
                      placeholder="৫০০০"
                      value={formData.rent}
                      onChange={e => setFormData({ ...formData, rent: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">মোবাইল নাম্বার</label>
                    <input 
                      className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:border-blue-400" 
                      placeholder="017XXXXXXXX"
                      value={formData.contact}
                      onChange={e => setFormData({ ...formData, contact: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">বিস্তারিত ঠিকানা</label>
                  <textarea 
                    className="w-full p-4 bg-slate-50 rounded-2xl border border-slate-100 font-bold outline-none focus:border-blue-400" 
                    rows={2}
                    placeholder="রোড নাম্বার, বাড়ির নাম ইত্যাদি..."
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={saving}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" /> : editingId ? 'আপডেট করুন' : 'সেভ করুন'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-20">
                <Loader2 className="animate-spin mb-2" size={32} />
                <p className="font-bold">লোড হচ্ছে...</p>
              </div>
            ) : rentals.length === 0 ? (
              <div className="py-20 text-center opacity-30">কোনো পোস্ট পাওয়া যায়নি।</div>
            ) : (
              rentals.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm flex gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} className="w-full h-full object-cover" alt={item.title} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <Home size={32} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest">{CATEGORY_BN[item.category]}</span>
                      <button 
                        onClick={() => toggleStatus(item)}
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'Available' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}
                      >
                        {item.status === 'Available' ? 'ফাঁকা' : 'ভাড়া'}
                      </button>
                    </div>
                    <h4 className="font-bold text-slate-800 text-sm mt-1 truncate">{item.title}</h4>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 truncate">{AREA_BN[item.area]} - {item.address}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs font-black text-blue-600">৳ {toBn(item.rent)}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(item)} className="p-2 bg-slate-50 text-slate-400 rounded-lg active:scale-90"><Edit2 size={14}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 bg-red-50 text-red-500 rounded-lg active:scale-90"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
