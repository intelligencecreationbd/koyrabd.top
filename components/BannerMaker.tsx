
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Palette, Sparkles, ChevronDown } from 'lucide-react';
import { settingsDb } from '../Firebase-appsettings';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

interface BannerCategory {
  id: string;
  name: string;
}

const BannerMaker: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<BannerCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(settingsDb, 'banner_categories'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, name: d.data().name } as BannerCategory));
      setCategories(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 active:scale-90 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={22} strokeWidth={2.5} className="text-slate-900 dark:text-white" />
        </button>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight leading-none">ব্যানার বানান</h2>
          <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest mt-1">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</p>
        </div>
        <div className="w-10"></div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center p-6 pt-20">
        {/* Category Dropdown */}
        <div className="w-full max-w-sm space-y-3 mb-8">
          <label className="text-[10px] font-bold text-slate-400 block pl-1 tracking-widest uppercase">ক্যাটাগরি নির্বাচন করুন</label>
          <div className="relative">
            <select 
              className="w-full appearance-none px-5 py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-orange-500 transition-all shadow-sm"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? 'লোড হচ্ছে...' : 'ক্যাটাগরি বেছে নিন'}</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronDown size={20} />
            </div>
          </div>
        </div>

        {/* White Page / Canvas Area */}
        <div className="w-full max-w-md aspect-[16/9] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default BannerMaker;
