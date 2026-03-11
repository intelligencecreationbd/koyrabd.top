
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Info, 
  Target, 
  Code2, 
  Users2, 
  MessageSquareQuote, 
  FileText, 
  ShieldCheck, 
  AlertCircle, 
  Lightbulb,
  ArrowRight,
  Github,
  Globe,
  Mail,
  ExternalLink,
  Smartphone,
  ShieldAlert,
  Loader2,
  X
} from 'lucide-react';
import { settingsDb } from '../Firebase-appsettings';
import { doc, getDoc } from 'firebase/firestore';

interface AboutContent {
  intro: string;
  vision: string[];
  developer: {
    name: string;
    website: string;
    email: string;
  };
  contributors: string[];
  feedbackLink: string;
  terms: string[];
  privacy: string;
  disclaimer: string;
  safety: { title: string; desc: string }[];
}

const INITIAL_CONTENT: AboutContent = {
  intro: 'কয়রা ও পাইকগাছা উপজেলার সাধারণ মানুষের জীবনযাত্রাকে সহজতর করতে এবং ডিজিটাল সেবা হাতের নাগালে পৌঁছে দিতে এই অ্যাপটি তৈরি করা হয়েছে। এটি একটি অলাভজনক ও সেবামূলক প্ল্যাটফর্ম।',
  vision: [
    'উপজেলার সকল জরুরি সেবা এক ক্লিকে পৌঁছে দেওয়া।',
    'নির্ভুল ও হালনাগাদ তথ্যের একটি নির্ভরযোগ্য উৎস হওয়া।',
    'এলাকার মানুষের মধ্যে পারস্পরিক সহযোগিতা বৃদ্ধি করা।',
    'কয়রা ও পাইকগাছাকে স্মার্ট উপজেলায় রূপান্তর করা।'
  ],
  developer: {
    name: 'Intelligence Creation BD',
    website: '',
    email: ''
  },
  contributors: ['উপজেলা প্রশাসন', 'স্থানীয় স্বেচ্ছাসেবকবৃন্দ', 'তথ্য প্রদানকারী ইউজারগণ'],
  feedbackLink: '',
  terms: [
    'অ্যাপটি শুধুমাত্র জনকল্যাণমূলক কাজে ব্যবহার করতে হবে।',
    'ভুল বা বিভ্রান্তিকর তথ্য প্রদান করা থেকে বিরত থাকতে হবে।',
    'অন্যের ব্যক্তিগত তথ্যের গোপনীয়তা রক্ষা করতে হবে।',
    'অ্যাপের কোনো কন্টেন্ট বাণিজ্যিক উদ্দেশ্যে ব্যবহার করা যাবে না।'
  ],
  privacy: 'আমরা আপনার ব্যক্তিগত তথ্যের নিরাপত্তাকে সর্বোচ্চ গুরুত্ব দেই। আপনার নাম, মোবাইল নাম্বার বা অন্যান্য তথ্য শুধুমাত্র অ্যাপের সেবার প্রয়োজনে ব্যবহৃত হয় এবং তা তৃতীয় কোনো পক্ষের কাছে শেয়ার করা হয় না।',
  disclaimer: 'অ্যাপে প্রদর্শিত তথ্যগুলো বিভিন্ন উৎস থেকে সংগ্রহ করা হয়েছে। তথ্যের নির্ভুলতা নিশ্চিত করতে আমরা সচেষ্ট থাকলেও, কোনো তথ্যের ভুল বা এর ফলে সৃষ্ট কোনো সমস্যার জন্য অ্যাপ কর্তৃপক্ষ দায়ী থাকবে না। জরুরি প্রয়োজনে সরাসরি সংশ্লিষ্ট দপ্তরে যোগাযোগ করার পরামর্শ দেওয়া হলো।',
  safety: [
    { title: 'পাসওয়ার্ড সুরক্ষা', desc: 'আপনার একাউন্টের পাসওয়ার্ড কারো সাথে শেয়ার করবেন না।' },
    { title: 'তথ্য যাচাই', desc: 'যেকোনো আর্থিক লেনদেনের আগে তথ্যটি পুনরায় যাচাই করে নিন।' },
    { title: 'রিপোর্ট করুন', desc: 'অ্যাপে কোনো সন্দেহজনক কার্যক্রম দেখলে আমাদের জানান।' }
  ]
};

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  content: React.ReactNode;
}

export default function AboutApp({ onBack }: { onBack: () => void }) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [content, setContent] = useState<AboutContent>(INITIAL_CONTENT);
  const [isLoading, setIsLoading] = useState(true);
  const [appLogo, setAppLogo] = useState('https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png');

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(settingsDb, 'settings', 'about_app');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setContent({ ...INITIAL_CONTENT, ...snap.data() });
        }

        const logoRef = doc(settingsDb, 'settings', 'app_logo');
        const logoSnap = await getDoc(logoRef);
        if (logoSnap.exists()) {
          setAppLogo(logoSnap.data().value);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const categories: Category[] = [
    {
      id: 'intro',
      name: 'পরিচিতি ও ভার্সন',
      icon: Info,
      color: '#3B82F6',
      content: (
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center p-5 bg-blue-50/50 rounded-[40px] border border-blue-100">
            <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center mb-3 border border-blue-50 overflow-hidden">
              <img src={appLogo} alt="App Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black text-slate-800">কয়রা-পাইকগাছা</h3>
            <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">কমিউনিটি অ্যাপস</p>
            <div className="mt-3 px-4 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase tracking-tighter">
              Version 2.0.4 (Stable)
            </div>
          </div>
          <div className="p-6 bg-white rounded-[30px] border border-slate-100 shadow-sm space-y-4">
            <p className="text-slate-600 font-medium leading-relaxed">
              {content.intro}
            </p>
            <div className="pt-4 border-t border-slate-50 flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Last Update</span>
                <span className="text-xs font-black text-slate-700">১০ মার্চ, ২০২৬</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase">Platform</span>
                <span className="text-xs font-black text-slate-700">Android & Web</span>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'vision',
      name: 'লক্ষ্য ও উদ্দেশ্য',
      icon: Target,
      color: '#10B981',
      content: (
        <div className="space-y-4">
          {content.vision.map((text, i) => (
            <div key={i} className="p-5 bg-white rounded-[25px] border border-slate-100 shadow-sm flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <ShieldCheck size={20} />
              </div>
              <div>
                <p className="text-sm text-slate-700 font-bold leading-snug">{text}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'developer',
      name: 'ডেভেলপার তথ্য',
      icon: Code2,
      color: '#8B5CF6',
      content: (
        <div className="space-y-6">
          <div className="p-8 bg-violet-50/50 rounded-[40px] border border-violet-100 text-center">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border border-violet-50">
              <Code2 size={40} className="text-violet-600" />
            </div>
            <h3 className="text-xl font-black text-slate-800">{content.developer.name}</h3>
            <p className="text-xs font-bold text-violet-500 uppercase tracking-widest mt-1">Software Development Team</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {content.developer.website && (
              <button onClick={() => window.open(content.developer.website, '_blank')} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Globe size={18} /></div>
                  <span className="font-bold text-slate-700">Website</span>
                </div>
                <ExternalLink size={16} className="text-slate-300" />
              </button>
            )}
            {content.developer.email && (
              <button onClick={() => window.location.href = `mailto:${content.developer.email}`} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm active:scale-95 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-slate-50 rounded-lg text-slate-400"><Mail size={18} /></div>
                  <span className="font-bold text-slate-700">Email Contact</span>
                </div>
                <ExternalLink size={16} className="text-slate-300" />
              </button>
            )}
          </div>
        </div>
      )
    },
    {
      id: 'feedback',
      name: 'মতামত বা অভিযোগ',
      icon: MessageSquareQuote,
      color: '#EC4899',
      content: (
        <div className="space-y-6">
          <div className="p-8 bg-pink-50/50 rounded-[40px] border border-pink-100 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
              <MessageSquareQuote size={32} className="text-pink-600" />
            </div>
            <h3 className="text-lg font-black text-slate-800">আপনার মতামত আমাদের প্রেরণা</h3>
            <p className="text-xs font-bold text-pink-500 mt-2">অ্যাপের মান উন্নয়নে আপনার পরামর্শ দিন</p>
          </div>
          {content.feedbackLink && (
            <button onClick={() => window.open(content.feedbackLink, '_blank')} className="w-full py-5 bg-pink-600 text-white font-black rounded-[25px] shadow-xl shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-3">
              মতামত প্রদান করুন <ArrowRight size={20} />
            </button>
          )}
        </div>
      )
    },
    {
      id: 'privacy',
      name: 'গোপনীয়তা নীতি',
      icon: ShieldCheck,
      color: '#0EA5E9',
      content: (
        <div className="p-6 bg-white rounded-[30px] border border-slate-100 shadow-sm space-y-4 text-left">
          <h4 className="font-black text-slate-800 border-b border-slate-50 pb-2">Privacy Policy</h4>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {content.privacy}
          </p>
        </div>
      )
    },
    {
      id: 'disclaimer',
      name: 'দায়মুক্তি',
      icon: AlertCircle,
      color: '#F43F5E',
      content: (
        <div className="p-6 bg-white rounded-[30px] border border-slate-100 shadow-sm space-y-4 text-left">
          <h4 className="font-black text-slate-800 border-b border-slate-50 pb-2">Disclaimer</h4>
          <p className="text-sm font-medium text-slate-600 leading-relaxed">
            {content.disclaimer}
          </p>
        </div>
      )
    },
    {
      id: 'terms',
      name: 'ব্যবহারের নিয়মাবলী',
      icon: FileText,
      color: '#64748B',
      content: (
        <div className="p-6 bg-white rounded-[30px] border border-slate-100 shadow-sm space-y-4 text-left">
          <h4 className="font-black text-slate-800 border-b border-slate-50 pb-2">শর্তাবলী (T&C)</h4>
          <ul className="space-y-3">
            {content.terms.map((text, i) => (
              <li key={i} className="flex gap-3 text-sm font-medium text-slate-600">
                <span className="text-slate-300 font-black">•</span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      )
    },
    {
      id: 'safety',
      name: 'ব্যবহারকারীর সচেতনতা',
      icon: Lightbulb,
      color: '#FACC15',
      content: (
        <div className="space-y-4">
          {content.safety.map((item, i) => (
            <div key={i} className="p-5 bg-amber-50/30 rounded-[25px] border border-amber-100 flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <ShieldAlert size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-800 mb-1">{item.title}</h4>
                <p className="text-sm text-slate-600 font-medium leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
    }
  ];

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      onBack();
    }
  };

  const activeCategory = categories.find(c => c.id === selectedCategory);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 opacity-30">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-black text-[10px] uppercase tracking-widest">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
      {/* Header */}
      <header className="shrink-0 px-6 pt-6 pb-4 grid grid-cols-[48px_1fr_48px] items-center gap-2">
        <div /> {/* Spacer for centering */}
        <div className="text-center">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
            {selectedCategory ? activeCategory?.name : 'অ্যাপ সম্পর্কে'}
          </h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
            {selectedCategory ? 'বিস্তারিত তথ্য' : 'অ্যাপের সকল তথ্য ও নীতিমালা'}
          </p>
        </div>
        {selectedCategory ? (
          <button 
            onClick={handleBack}
            className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 active:scale-90 transition-all flex items-center justify-center"
          >
            <X size={24} className="text-slate-600 dark:text-slate-400" />
          </button>
        ) : (
          <div /> // Empty div to maintain grid layout
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32 pt-2">
        {!selectedCategory ? (
          <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-bottom-4 duration-500">
            {categories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="flex items-center justify-between p-5 bg-white dark:bg-slate-900/50 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm active:scale-[0.98] transition-all group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${cat.color}15`, color: cat.color }}
                    >
                      <Icon size={24} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-[15px] text-slate-700 dark:text-slate-200">{cat.name}</span>
                  </div>
                  <ArrowRight size={18} className="text-slate-200 dark:text-slate-700 group-hover:text-blue-500 transition-colors" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-4 duration-500">
            {activeCategory?.content}
          </div>
        )}
      </div>
    </div>
  );
}
