
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Phone, 
  Home, 
  Filter, 
  ChevronLeft,
  Building2,
  Store,
  Warehouse,
  Users,
  Plus,
  Camera,
  XCircle,
  Loader2,
  Trash2,
  Edit2,
  Save
} from 'lucide-react';
import { collection, onSnapshot, query, orderBy, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { userDb } from '../Firebase-user';
import { HouseRental, User } from '../types';

interface PublicHouseRentProps {
  onBack: () => void;
  checkAccess?: (id: string, name: string) => boolean;
  user: User | null;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Family House': Home,
  'Mess': Users,
  'Shop': Store,
  'Godown': Warehouse
};

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

const CATEGORIES = ['Family House', 'Mess', 'Shop', 'Godown'];
const AREAS = ['Koyra', 'Paikgacha'];

export default function PublicHouseRent({ onBack, checkAccess, user }: PublicHouseRentProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const viewMode = queryParams.get('view');
  const isMyAdsView = viewMode === 'mine';

  const [rentals, setRentals] = useState<HouseRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedArea, setSelectedArea] = useState<string>('All');
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null);
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
      if (isEditing) {
        await updateDoc(doc(userDb, 'house_rentals', isEditing), {
          ...formData,
          updatedAt: Date.now()
        });
        setIsEditing(null);
        alert('আপনার বিজ্ঞাপনটি সফলভাবে আপডেট হয়েছে!');
      } else {
        await addDoc(collection(userDb, 'house_rentals'), {
          ...formData,
          createdAt: Date.now(),
          postedBy: user?.uid || 'anonymous'
        });
        alert('আপনার বিজ্ঞাপনটি সফলভাবে পোস্ট হয়েছে!');
      }
      setIsAdding(false);
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
      alert('পোস্ট করতে সমস্যা হয়েছে!');
    } finally {
      setSaving(false);
    }
  };

  const handlePostAdClick = () => {
    if (!user) {
      navigate('/auth?to=house-rent');
      return;
    }
    setFormData(prev => ({ ...prev, contact: user.mobile }));
    setIsAdding(true);
  };

  const handleEdit = (item: HouseRental) => {
    setFormData({
      title: item.title,
      category: item.category,
      rent: item.rent,
      address: item.address,
      area: item.area,
      contact: item.contact,
      image: item.image || '',
      status: item.status
    });
    setIsEditing(item.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই বিজ্ঞাপনটি মুছে ফেলতে চান?')) return;
    try {
      await deleteDoc(doc(userDb, 'house_rentals', id));
      alert('বিজ্ঞাপনটি মুছে ফেলা হয়েছে।');
    } catch (err) {
      alert('মুছে ফেলতে সমস্যা হয়েছে!');
    }
  };

  const filteredRentals = rentals.filter(item => {
    if (isMyAdsView) {
      return (item as any).postedBy === user?.uid;
    }
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesArea = selectedArea === 'All' || item.area === selectedArea;
    return matchesCategory && matchesArea;
  });

  const toBn = (num: string | number) => 
    (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
      {/* Header */}
      <div className="shrink-0 p-2.5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-center relative">
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-black text-blue-600 uppercase tracking-wider mb-0.5">Koyra-Paikgacha Community App</span>
          <h2 className="text-base font-black text-slate-800 dark:text-slate-100 leading-none">
            {isMyAdsView ? 'আমার বিজ্ঞাপন' : 'To-Let'}
          </h2>
        </div>
        {!isAdding && !isMyAdsView && (
          <div className="absolute right-2.5">
            <button 
              onClick={handlePostAdClick}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg font-black text-[10px] shadow-[0_4px_12px_rgba(37,99,235,0.3)] active:scale-95 transition-all border border-blue-400/20"
            >
              <Plus size={12} /> বিজ্ঞাপন দিন
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar">
        {isAdding ? (
          <div className="p-2.5 animate-in zoom-in duration-300">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100">
                  {isEditing ? 'বিজ্ঞাপন সংশোধন করুন' : 'নতুন বিজ্ঞাপন দিন'}
                </h3>
                <button onClick={() => { setIsAdding(false); setIsEditing(null); }} className="p-1 text-slate-400"><XCircle size={20}/></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Image Upload */}
                <div className="flex flex-col items-center gap-2">
                  <div className="w-full h-32 bg-slate-50 dark:bg-slate-800 rounded-[20px] border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative group">
                    {formData.image ? (
                      <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                        <Camera size={32} />
                        <p className="text-[8px] font-black uppercase tracking-widest mt-1">ছবি আপলোড করুন</p>
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

                <div className="space-y-2.5">
                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">পোস্টের শিরোনাম</label>
                    <input 
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-bold outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200 text-xs" 
                      placeholder="যেমন: ৩ রুমের ফ্যামিলি বাসা ভাড়া"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">ক্যাটাগরি</label>
                      <select 
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-bold outline-none focus:border-blue-400 appearance-none text-slate-700 dark:text-slate-200 text-xs"
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_BN[c]}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">এলাকা</label>
                      <select 
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-bold outline-none focus:border-blue-400 appearance-none text-slate-700 dark:text-slate-200 text-xs"
                        value={formData.area}
                        onChange={e => setFormData({ ...formData, area: e.target.value as any })}
                      >
                        {AREAS.map(a => <option key={a} value={a}>{AREA_BN[a]}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">মাসিক ভাড়া (৳)</label>
                      <input 
                        type="number"
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-bold outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200 text-xs" 
                        placeholder="৫০০০"
                        value={formData.rent}
                        onChange={e => setFormData({ ...formData, rent: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">স্ট্যাটাস</label>
                      <select 
                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-bold outline-none focus:border-blue-400 appearance-none text-slate-700 dark:text-slate-200 text-xs"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                      >
                        <option value="Available">ফাঁকা আছে</option>
                        <option value="Rented Out">ভাড়া হয়ে গেছে</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">মোবাইল নাম্বার</label>
                    <input 
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-bold outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200 text-xs opacity-70" 
                      placeholder="017XXXXXXXX"
                      value={formData.contact}
                      readOnly
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] font-bold text-slate-400 uppercase tracking-widest pl-1">বিস্তারিত ঠিকানা</label>
                    <textarea 
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 font-bold outline-none focus:border-blue-400 text-slate-700 dark:text-slate-200 text-xs" 
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
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-black shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-xs"
                >
                  {saving ? <Loader2 className="animate-spin" /> : isEditing ? <><Save size={16}/> আপডেট করুন</> : 'পোস্ট করুন'}
                </button>
              </form>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            {!isMyAdsView && (
              <div className="p-2.5 space-y-1.5">
                <div className="flex gap-1 overflow-x-auto no-scrollbar pb-0.5">
                  {['All', 'Family House', 'Mess', 'Shop', 'Godown'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`shrink-0 px-2.5 py-1 rounded-md font-bold text-[9px] transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                    >
                      {cat === 'All' ? 'সব ধরণের' : CATEGORY_BN[cat]}
                    </button>
                  ))}
                </div>

                <div className="flex gap-1">
                  {['All', 'Koyra', 'Paikgacha'].map(area => (
                    <button
                      key={area}
                      onClick={() => setSelectedArea(area)}
                      className={`flex-1 py-1 rounded-md font-bold text-[9px] transition-all ${selectedArea === area ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-800'}`}
                    >
                      {area === 'All' ? 'সব এলাকা' : AREA_BN[area]}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* List */}
            <div className={`p-2.5 ${isMyAdsView ? 'pt-2.5' : 'pt-0'} space-y-2.5`}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-20">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
                  <p className="font-bold text-xs">লোড হচ্ছে...</p>
                </div>
              ) : filteredRentals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 opacity-30 text-center">
                  <Home size={40} className="mb-2" />
                  <p className="font-bold text-xs">কোনো বাসা পাওয়া যায়নি</p>
                </div>
              ) : (
                filteredRentals.map(item => {
                  const Icon = CATEGORY_ICONS[item.category] || Home;
                  return (
                    <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[20px] overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="relative h-32 bg-slate-100 dark:bg-slate-800">
                        {item.image ? (
                          <img src={item.image} className="w-full h-full object-cover" alt={item.title} referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <Icon size={40} />
                          </div>
                        )}
                        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-black/40 backdrop-blur-md text-white text-[8px] font-black rounded-full uppercase tracking-widest">
                          {CATEGORY_BN[item.category]}
                        </div>
                        <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg ${item.status === 'Available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                          {item.status === 'Available' ? 'ফাঁকা আছে' : 'ভাড়া হয়ে গেছে'}
                        </div>
                      </div>

                      <div className="p-3 space-y-2.5">
                        <div>
                          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 leading-tight">{item.title}</h3>
                          <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 mt-0.5">
                            <MapPin size={10} />
                            <span className="text-[9px] font-bold">{AREA_BN[item.area]} - {item.address}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 dark:border-slate-800">
                          <div>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">মাসিক ভাড়া</p>
                            <p className="text-base font-black text-blue-600">৳ {toBn(item.rent)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isMyAdsView ? (
                              <>
                                <button 
                                  onClick={() => handleEdit(item)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-black text-[11px] active:scale-95 transition-all"
                                >
                                  <Edit2 size={14} /> এডিট
                                </button>
                                <button 
                                  onClick={() => handleDelete(item.id)}
                                  className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-xl font-black text-[11px] active:scale-95 transition-all"
                                >
                                  <Trash2 size={14} /> মুছুন
                                </button>
                              </>
                            ) : (
                              <button 
                                onClick={() => window.open(`tel:${item.contact}`)}
                                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-black text-[11px] shadow-[0_4px_12px_rgba(37,99,235,0.2)] active:scale-95 transition-all border border-blue-400/20"
                              >
                                <Phone size={14} /> কল করুন
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>

      {/* Custom Bottom Nav */}
      <div className="shrink-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 flex items-center justify-around px-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <button 
          onClick={() => navigate('/')}
          className="flex flex-col items-center justify-center gap-1 w-20 h-full text-slate-400 hover:text-blue-600 active:scale-90 transition-all group"
        >
          <div className="p-1.5 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
            <Home size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">হোম</span>
        </button>

        <button 
          onClick={onBack}
          className="flex flex-col items-center justify-center gap-1 w-20 h-full text-slate-400 hover:text-blue-600 active:scale-90 transition-all group"
        >
          <div className="p-1.5 rounded-xl group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
            <ChevronLeft size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">ব্যাক</span>
        </button>

        <button 
          onClick={handlePostAdClick}
          className={`flex flex-col items-center justify-center gap-1 w-20 h-full active:scale-90 transition-all group ${isAdding ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
        >
          <div className={`p-1.5 rounded-xl transition-colors ${isAdding ? 'bg-blue-100 dark:bg-blue-900/40' : 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20'}`}>
            <Plus size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-tighter">বিজ্ঞাপন</span>
        </button>
      </div>
    </div>
  );
}
