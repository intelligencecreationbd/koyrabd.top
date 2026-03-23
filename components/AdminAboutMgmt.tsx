
import React, { useState, useEffect } from 'react';
import { ChevronLeft, Save, Info, Target, Code2, Users2, MessageSquareQuote, FileText, ShieldCheck, AlertCircle, Lightbulb, Loader2, Smartphone } from 'lucide-react';
import { settingsDb } from '../Firebase-appsettings';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AboutContent {
  intro: string;
  version: string;
  lastUpdate: string;
  vision: string[];
  developer: {
    name: string;
    website: string;
    email: string;
  };
  contributors: string[];
  feedbackLink: string;
  downloadLink: string;
  terms: string[];
  privacy: string;
  disclaimer: string;
  safety: { title: string; desc: string }[];
}

const INITIAL_CONTENT: AboutContent = {
  intro: 'কয়রা ও পাইকগাছা উপজেলার সাধারণ মানুষের জীবনযাত্রাকে সহজতর করতে এবং ডিজিটাল সেবা হাতের নাগালে পৌঁছে দিতে এই অ্যাপটি তৈরি করা হয়েছে। এটি একটি অলাভজনক ও সেবামূলক প্ল্যাটফর্ম।',
  version: '2.0.4 (Stable)',
  lastUpdate: '১০ মার্চ, ২০২৬',
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
  downloadLink: 'https://www.koyrabd.top/KP-Community.apk',
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

export default function AdminAboutMgmt({ onBack }: { onBack: () => void }) {
  const [content, setContent] = useState<AboutContent>(INITIAL_CONTENT);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const docRef = doc(settingsDb, 'settings', 'about_app');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setContent({ ...INITIAL_CONTENT, ...snap.data() });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const docRef = doc(settingsDb, 'settings', 'about_app');
      await setDoc(docRef, content);
      alert('সফলভাবে সেভ করা হয়েছে!');
    } catch (e) {
      alert('সেভ করতে সমস্যা হয়েছে!');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="font-black text-[10px] uppercase tracking-widest">লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="flex flex-col items-center gap-3 mb-6 text-center relative">
        <button onClick={onBack} className="absolute left-0 top-0 p-2 bg-white rounded-lg shadow-sm border border-slate-100 active:scale-90 transition-all">
          <ChevronLeft size={18} className="text-slate-800" />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1">অ্যাপ ম্যানেজমেন্ট</h2>
      </div>

      <div className="space-y-8">
        {/* Intro */}
        <Section title="পরিচিতি ও ভার্সন" icon={<Info size={18} />}>
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">অ্যাপ পরিচিতি</label>
              <textarea 
                className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-blue-400"
                rows={4}
                value={content.intro}
                onChange={e => setContent({ ...content, intro: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="অ্যাপ ভার্সন" value={content.version} onChange={v => setContent({ ...content, version: v })} />
              <Input label="সর্বশেষ আপডেট" value={content.lastUpdate} onChange={v => setContent({ ...content, lastUpdate: v })} />
            </div>
          </div>
        </Section>

        {/* Vision */}
        <Section title="লক্ষ্য ও উদ্দেশ্য (তালিকা)" icon={<Target size={18} />}>
          <ListInput 
            items={content.vision} 
            onChange={items => setContent({ ...content, vision: items })} 
            placeholder="নতুন লক্ষ্য যোগ করুন..."
          />
        </Section>

        {/* Developer */}
        <Section title="ডেভেলপার তথ্য" icon={<Code2 size={18} />}>
          <div className="space-y-3">
            <Input label="নাম" value={content.developer.name} onChange={v => setContent({ ...content, developer: { ...content.developer, name: v } })} />
            <Input label="ওয়েবসাইট" value={content.developer.website} onChange={v => setContent({ ...content, developer: { ...content.developer, website: v } })} />
            <Input label="ইমেইল" value={content.developer.email} onChange={v => setContent({ ...content, developer: { ...content.developer, email: v } })} />
          </div>
        </Section>

        {/* Contributors */}
        <Section title="সহায়তাকারীদের তথ্য" icon={<Users2 size={18} />}>
          <ListInput 
            items={content.contributors} 
            onChange={items => setContent({ ...content, contributors: items })} 
            placeholder="সহায়তাকারীর নাম..."
          />
        </Section>

        {/* Feedback */}
        <Section title="মতামত লিংক" icon={<MessageSquareQuote size={18} />}>
          <Input label="লিংক" value={content.feedbackLink} onChange={v => setContent({ ...content, feedbackLink: v })} />
        </Section>

        {/* Download Link */}
        <Section title="অ্যাপ ডাউনলোড লিংক" icon={<Smartphone size={18} />}>
          <Input label="ডাউনলোড লিংক" value={content.downloadLink} onChange={v => setContent({ ...content, downloadLink: v })} />
        </Section>

        {/* Terms */}
        <Section title="ব্যবহারের নিয়মাবলী" icon={<FileText size={18} />}>
          <ListInput 
            items={content.terms} 
            onChange={items => setContent({ ...content, terms: items })} 
            placeholder="নতুন নিয়ম যোগ করুন..."
          />
        </Section>

        {/* Privacy */}
        <Section title="গোপনীয়তা নীতি" icon={<ShieldCheck size={18} />}>
          <textarea 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-blue-400"
            rows={4}
            value={content.privacy}
            onChange={e => setContent({ ...content, privacy: e.target.value })}
          />
        </Section>

        {/* Disclaimer */}
        <Section title="দায়মুক্তি" icon={<AlertCircle size={18} />}>
          <textarea 
            className="w-full p-4 bg-slate-50 rounded-xl border border-slate-100 font-bold text-sm outline-none focus:border-blue-400"
            rows={4}
            value={content.disclaimer}
            onChange={e => setContent({ ...content, disclaimer: e.target.value })}
          />
        </Section>

        {/* Safety Tips */}
        <Section title="সচেতনতা টিপস" icon={<Lightbulb size={18} />}>
          <div className="space-y-4">
            {content.safety.map((tip, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 relative">
                <button 
                  onClick={() => setContent({ ...content, safety: content.safety.filter((_, idx) => idx !== i) })}
                  className="absolute top-2 right-2 text-red-400 p-1"
                >
                  <AlertCircle size={14} />
                </button>
                <Input label="টাইটেল" value={tip.title} onChange={v => {
                  const newSafety = [...content.safety];
                  newSafety[i].title = v;
                  setContent({ ...content, safety: newSafety });
                }} />
                <textarea 
                  className="w-full p-3 bg-white rounded-xl border border-slate-100 font-bold text-xs outline-none focus:border-blue-400"
                  rows={2}
                  placeholder="বিস্তারিত..."
                  value={tip.desc}
                  onChange={e => {
                    const newSafety = [...content.safety];
                    newSafety[i].desc = e.target.value;
                    setContent({ ...content, safety: newSafety });
                  }}
                />
              </div>
            ))}
            <button 
              onClick={() => setContent({ ...content, safety: [...content.safety, { title: '', desc: '' }] })}
              className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs flex items-center justify-center gap-2"
            >
              নতুন টিপস যোগ করুন
            </button>
          </div>
        </Section>
      </div>

      <button 
        onClick={handleSave}
        disabled={isSaving}
        className="fixed bottom-6 left-6 right-6 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
      >
        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
        সবগুলো সেভ করুন
      </button>
    </div>
  );
}

const Section = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm space-y-4 text-left">
    <div className="flex items-center gap-3 border-b border-slate-50 pb-3">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">{icon}</div>
      <h3 className="font-black text-slate-800">{title}</h3>
    </div>
    {children}
  </div>
);

const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">{label}</label>
    <input 
      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-400"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
);

const ListInput = ({ items, onChange, placeholder }: { items: string[]; onChange: (items: string[]) => void; placeholder: string }) => {
  const [newVal, setNewVal] = useState('');
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input 
          className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-blue-400"
          placeholder={placeholder}
          value={newVal}
          onChange={e => setNewVal(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && newVal.trim()) {
              onChange([...items, newVal.trim()]);
              setNewVal('');
            }
          }}
        />
        <button 
          onClick={() => {
            if (newVal.trim()) {
              onChange([...items, newVal.trim()]);
              setNewVal('');
            }
          }}
          className="p-3 bg-blue-600 text-white rounded-xl active:scale-90 transition-all"
        >
          <Save size={18} />
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
            <span className="text-xs font-bold text-slate-600">{item}</span>
            <button 
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <AlertCircle size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
