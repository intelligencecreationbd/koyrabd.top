import React, { useRef } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Zap, 
  ShieldCheck, 
  Heart, 
  Star, 
  Gift, 
  Bus, 
  NotebookTabs, 
  CloudSun, 
  Newspaper, 
  Scale, 
  Phone, 
  Camera,
  Sparkles,
  ArrowDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { settingsDb } from '../Firebase-appsettings';
import { doc, getDoc } from 'firebase/firestore';

interface DownloadFeatureCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  titleColor: string;
}

const DownloadFeatureCard: React.FC<DownloadFeatureCardProps> = ({ icon, title, text, titleColor }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="p-6 bg-white/80 backdrop-blur-md rounded-[32px] border border-white/20 shadow-xl flex items-start gap-4 text-left transition-all hover:shadow-2xl hover:-translate-y-1"
  >
    <div className="p-3 bg-slate-50 text-blue-600 rounded-2xl shadow-inner shrink-0">
      {icon}
    </div>
    <div className="overflow-hidden">
      <h4 className={`font-black text-base mb-1 ${titleColor}`}>{title}</h4>
      <p className="text-xs font-bold text-slate-500 leading-relaxed">{text}</p>
    </div>
  </motion.div>
);

interface PublicDownloadProps {
  appLogo: string;
  isAdminLoggedIn: boolean;
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checkAccess?: (id: string, name: string) => boolean;
}

const PublicDownload: React.FC<PublicDownloadProps> = ({ appLogo, isAdminLoggedIn, onLogoChange }) => {
  const navigate = useNavigate();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [downloadLink, setDownloadLink] = React.useState('https://www.koyrabd.top/KP-Community.apk');

  React.useEffect(() => {
    const fetchDownloadLink = async () => {
      try {
        const docRef = doc(settingsDb, 'settings', 'about_app');
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data().downloadLink) {
          setDownloadLink(snap.data().downloadLink);
        }
      } catch (e) {
        console.error('Error fetching download link:', e);
      }
    };
    fetchDownloadLink();
  }, []);

  const handleDownload = () => {
    window.open(downloadLink, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 overflow-x-hidden selection:bg-blue-500 selection:text-white">
      {/* Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <button 
          onClick={() => navigate(-1)} 
          className="p-2.5 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 active:scale-90 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={22} strokeWidth={2.5} className="text-slate-900 dark:text-white" />
        </button>
        <div className="flex flex-col items-center text-center">
          <h2 className="text-base font-black text-slate-800 dark:text-white tracking-tight leading-none">ডাউনলোড অ্যাপ</h2>
          <p className="text-[7px] font-black text-blue-600 uppercase tracking-widest mt-1">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</p>
        </div>
        <div className="w-10"></div> {/* Spacer */}
      </header>

      <div className="relative z-10 pt-24 pb-32 px-6">
        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center pt-4 pb-16 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-center gap-4"
          >
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-15px] border-2 border-dashed border-blue-500/20 rounded-full"
              ></motion.div>
              
              <div className="relative w-44 h-44 bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] p-2 border-4 border-white dark:border-slate-800 overflow-hidden group">
                <img 
                  src={appLogo} 
                  className="w-full h-full object-cover rounded-[42px] transition-transform duration-700 group-hover:scale-110" 
                  alt="App Logo"
                  onError={(e) => {
                    (e.target as any).src = 'https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png';
                  }}
                />
                {isAdminLoggedIn && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        logoInputRef.current?.click();
                      }}
                      className="p-4 bg-white text-slate-900 rounded-2xl shadow-xl active:scale-90 transition-all"
                    >
                      <Camera size={24} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 max-w-[320px] mx-auto">
              <div className="space-y-1">
                <motion.h1 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl font-black tracking-tight text-blue-700 dark:text-blue-500 drop-shadow-sm"
                >
                  KP Community
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"
                >
                  প্রযুক্তির সেতুবন্ধন, আগামীর জনপদ
                </motion.p>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed"
              >
                কয়রা ও পাইকগাছাবাসীর প্রাত্যহিক জীবনকে সহজ করতে আমাদের এই ডিজিটাল প্ল্যাটফর্ম। স্থানীয় জরুরি সেবা ও সকল নাগরিক সুবিধা এখন এক স্মার্ট অ্যাপে।
              </motion.p>
            </div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="w-full max-w-[280px] mt-4 flex flex-col items-center gap-3"
            >
              <button 
                onClick={handleDownload}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold text-lg rounded-2xl shadow-lg shadow-blue-500/20 active:scale-98 transition-all duration-300 flex items-center justify-center gap-4 group"
              >
                <Download size={20} className="group-hover:translate-y-0.5 transition-transform duration-300" /> 
                ডাউনলোড করুন
              </button>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Official Release • 31.65 MB
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 1 }}
              className="mt-12 flex flex-col items-center gap-2 text-red-500"
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]">নিচে স্ক্রল করুন</span>
              <ArrowDown size={16} className="animate-bounce" />
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-32 space-y-12"
        >
          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">
              কেন অ্যাপটি <span className="text-blue-600">ডাউনলোড</span> করবেন?
            </h3>
            <p className="text-slate-400 dark:text-slate-500 font-medium max-w-xs mx-auto text-sm">
              আপনার এলাকার সকল ডিজিটাল সেবা এখন এক ঠিকানায়, আপনার হাতের মুঠোয়।
            </p>
          </div>

          <div className="grid gap-4">
            <DownloadFeatureCard 
              icon={<Gift size={22} />} 
              title="সম্পূর্ণ ফ্রি" 
              titleColor="text-pink-600"
              text="এপসটি কোনো প্রকার চার্জ বা শর্ত ছাড়াই ব্যাবহার করুন আজীবন।" 
            />
            <DownloadFeatureCard 
              icon={<Bus size={22} />} 
              title="বাস কাউন্টার ডিরেক্টরি" 
              titleColor="text-orange-600"
              text="কয়রা বা পাইকগাছা থেকে সকল রুটের বাসের কাউন্টার নাম্বার এক ক্লিকে।" 
            />
            <DownloadFeatureCard 
              icon={<NotebookTabs size={22} />} 
              title="ডিজিটাল খাতা" 
              titleColor="text-indigo-600"
              text="আপনার ব্যাক্তিগত অর্থের হিসাব রাখুন সহজে এবং নিরাপদে।" 
            />
            <DownloadFeatureCard 
              icon={<CloudSun size={22} />} 
              title="লাইভ আবহাওয়া" 
              titleColor="text-cyan-600"
              text="উপকূলীয় এলাকার জন্য বিশেষ আবহাওয়া পূর্বাভাস ও সতর্কবার্তা।" 
            />
            <DownloadFeatureCard 
              icon={<Newspaper size={22} />} 
              title="স্থানীয় নিউজ ফিড" 
              titleColor="text-green-600"
              text="হারানো-প্রাপ্তি এবং গুরুত্বপূর্ণ অথেন্টিক সংবাদ প্রকাশ ও পড়ার সুবিধা।" 
            />
            <DownloadFeatureCard 
              icon={<Scale size={22} />} 
              title="আইনি ও ভূমি সেবা" 
              titleColor="text-blue-700"
              text="আইনজীবী এবং সার্ভেয়ারদের প্রয়োজনীয় সকল তথ্য ও যোগাযোগ।" 
            />
            <DownloadFeatureCard 
              icon={<Phone size={22} />} 
              title="জরুরি কন্টাক্ট লিস্ট" 
              titleColor="text-purple-600"
              text="পৌরসভা, সরকারি অফিস ও জনপ্রতিনিধিদের মোবাইল নাম্বার ডিরেক্টরি।" 
            />
            <DownloadFeatureCard 
              icon={<ShieldCheck size={22} />} 
              title="নিরাপদ ও আধুনিক" 
              titleColor="text-emerald-600"
              text="গুগল স্ট্যান্ডার্ড সিকিউরিটি মেনে তৈরি, যা আপনার তথ্যের সুরক্ষা দেয়।" 
            />
          </div>

          <div className="pt-10 pb-20 flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl shadow-lg flex items-center justify-center border border-slate-100 dark:border-slate-800">
              <Star className="text-yellow-500 fill-yellow-500" size={24} />
            </div>
            <div className="text-center">
              <p className="text-lg font-black text-slate-800 dark:text-white">৫০০+ ব্যবহারকারী</p>
              <p className="text-xs font-medium text-slate-400">ইতিমধ্যেই আমাদের সাথে যুক্ত হয়েছেন</p>
            </div>
            <button 
              onClick={handleDownload}
              className="px-12 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-base rounded-2xl shadow-xl active:scale-95 transition-all"
            >
              এখনই শুরু করুন
            </button>
          </div>
        </motion.div>
      </div>

      <input 
        type="file" 
        ref={logoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={onLogoChange} 
      />
    </div>
  );
};

export default PublicDownload;
