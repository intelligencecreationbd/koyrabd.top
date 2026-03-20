
import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Sun, Moon, Lock, ChevronLeft, LogOut, Home as HomeIcon, User as UserIcon, PlusCircle, Menu, X, ArrowRight, Sparkles, NotebookTabs, MessageSquare, UserCircle, Download, ShieldCheck, Zap, Heart, Star, Smartphone, Camera, Gift, Bus, CloudSun, Newspaper, Scale, Phone, HeartPulse, Calculator, CheckCircle2, Instagram, Facebook, Youtube, Info, Eye, EyeOff, Palette, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Home from './pages/Home';
import CategoryView from './pages/CategoryView';
import InfoSubmit from './pages/InfoSubmit';
import UserAuth from './pages/UserAuth';
import AdminDashboard from './pages/AdminDashboard';
import HotlineDetail from './pages/HotlineDetail';
import PublicHelpline from './components/PublicHelpline';
import DigitalLedger from './pages/DigitalLedger';
import OnlineHaat from './pages/OnlineHaat';
import WeatherPage from './pages/WeatherPage';
import KPCommunityChat from './pages/KPCommunityChat';
import AboutApp from './components/AboutApp';
import SundarbanHeaderBackground from './components/SundarbanHeaderBackground';
import BlueHeaderBackground from './components/BlueHeaderBackground';
import PublicMedical from './components/PublicMedical';
import PublicHouseRent from './components/PublicHouseRent';
import AgeCalculator from './components/AgeCalculator';
import DateTimeBox from './components/DateTimeBox';
import PublicDownload from './components/PublicDownload';
import MenuAccessNotice from './components/MenuAccessNotice';
import UserEmergencyInfo from './components/UserEmergencyInfo';
import BannerMaker from './components/BannerMaker';
import { Submission, Notice, User } from './types';
import { trackVisit } from './services/analyticsService';
import { settingsDb } from './Firebase-appsettings';
import { subscribeToUnreadCount } from './services/helplineService';
import { 
  doc, 
  onSnapshot, 
  getDoc, 
  setDoc, 
  collection 
} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './services/firestoreErrorHandler';

// Firebase removed for paid hosting migration

const LogInIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y2="12"/></svg>
);

const ThreadsIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12s-2.5 5.5-5.5 5.5S12 15 12 12z"/>
    <path d="M12 12c0 3-2.5 5.5-5.5 5.5S1 15 1 12s2.5-5.5 5.5-5.5S12 9 12 12z"/>
    <circle cx="12" cy="12" r="10"/>
  </svg>
);

const PinterestIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="20" x2="12" y2="11" />
    <path d="M12 11c1.5 0 3 .5 3 2.5s-1.5 2.5-3 2.5c-1.5 0-2-1-2-1" />
    <circle cx="12" cy="12" r="10" />
  </svg>
);

const MenuLink: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void, badge?: number }> = ({ icon, label, onClick, badge }) => (
  <button onClick={onClick} className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-2xl text-slate-700 dark:text-slate-300 font-bold text-sm transition-all active:scale-95 group relative">
    <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-all">
      {icon}
    </div>
    <div className="flex-1 flex items-center justify-between">
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
          {badge}
        </span>
      )}
    </div>
  </button>
);

const BottomNav: React.FC<{ checkAccess?: (id: string, name: string) => boolean }> = ({ checkAccess }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAtLanding = location.pathname === '/';
  const isSubmit = location.pathname === '/info-submit';
  const isProfile = location.pathname === '/auth';

  const handleGlobalBack = () => {
    const backEvent = new CustomEvent('global-back-request', { cancelable: true });
    window.dispatchEvent(backEvent);
    
    if (backEvent.defaultPrevented) return;

    const { pathname, search } = location;
    if (search.includes('item=')) {
      navigate(pathname, { replace: true });
      return;
    }
    if (pathname.startsWith('/category/')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 2) {
        const parentPath = '/' + parts.slice(0, -1).join('/');
        navigate(parentPath);
      } else {
        navigate('/services');
      }
      return;
    }
    if (pathname.startsWith('/hotline/')) {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 1) {
        const parentPath = '/' + parts.slice(0, -1).join('/');
        navigate(parentPath);
      } else {
        navigate('/services');
      }
      return;
    }
    if (pathname === '/services') {
      navigate('/');
    } else if (['/hotline', '/online-haat', '/weather', '/info-submit', '/auth', '/getapp', '/chat', '/medical', '/age-calculator', '/banner-maker'].includes(pathname)) {
      navigate('/services');
    } else if (pathname === '/ledger') {
      navigate('/auth');
    } else {
      navigate('/services');
    }
  };

  if (isAtLanding) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[80] flex justify-center items-end gap-5 pointer-events-none px-6 pb-6">
      <button 
        onClick={() => {
          if (checkAccess && !checkAccess('11', 'তথ্য প্রদান')) return;
          navigate('/info-submit');
        }}
        className={`w-12 h-12 rounded-full metallic-blue pointer-events-auto transition-all duration-300 ${isSubmit ? 'glow-active scale-110' : 'opacity-90 active:scale-95'}`}
      >
        <PlusCircle size={22} strokeWidth={isSubmit ? 3 : 2} className="text-white" />
      </button>

      <button 
        onClick={handleGlobalBack}
        className={`w-14 h-14 rounded-full metallic-blue pointer-events-auto -translate-y-1 transition-all duration-300 shadow-xl flex items-center justify-center active:scale-90`}
      >
        <span className="text-white font-black text-[12px] uppercase tracking-tighter">BACK</span>
      </button>

      <button 
        onClick={() => {
          if (checkAccess && !checkAccess('18', 'আমার প্রোফাইল')) return;
          navigate('/auth');
        }}
        className={`w-12 h-12 rounded-full metallic-blue pointer-events-auto transition-all duration-300 ${isProfile ? 'glow-active scale-110' : 'opacity-90 active:scale-95'}`}
      >
        <UserIcon size={22} strokeWidth={isProfile ? 3 : 2} className="text-white" />
      </button>
    </div>
  );
};

const convertToEn = (str: string) => {
  if (!str) return '';
  return str.replace(/[০-৯]/g, d => "0123456789"["০১২৩৪৫৬৭৮৯".indexOf(d)]);
};

const LandingScreen: React.FC<{ 
  isDarkMode: boolean, 
  setIsDarkMode: (v: boolean) => void, 
  appLogo: string,
  isAdmin: boolean,
  onLogoChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ isDarkMode, setIsDarkMode, appLogo, isAdmin, onLogoChange }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Reference dimensions for the design
      const refWidth = 380;
      const refHeight = 800;
      
      const scaleW = width / refWidth;
      const scaleH = height / refHeight;
      
      // Use the smaller scale to ensure it fits both ways
      let newScale = Math.min(scaleW, scaleH);
      
      // On larger screens, don't scale up too much
      if (width > 450) {
        newScale = Math.min(newScale, 1);
      }
      
      // On very small screens, don't scale down too much to keep it readable
      if (newScale < 0.75) newScale = 0.75;
      
      setScale(newScale);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-start pt-12 transition-colors duration-500 overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-white'}`}>
      <div 
        className="flex flex-col items-center justify-start w-full max-w-sm px-6 py-0 h-full max-h-[850px]"
        style={{ 
          transform: `scale(${scale})`, 
          transformOrigin: 'top center'
        }}
      >
        <button 
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="absolute top-4 right-6 p-3.5 rounded-[18px] bg-slate-900 dark:bg-slate-800 shadow-2xl text-white transition-all active:scale-90 z-20"
        >
          {isDarkMode ? <Sun size={22} /> : <Moon size={22} />}
        </button>

        <div className="flex flex-col items-center justify-start w-full pt-0">
         <div className="relative mb-2 animate-in zoom-in duration-1000">
            <div className="rainbow-border-circle w-64 h-64">
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white">
                <img 
                  src={appLogo} 
                  className="w-full h-full object-cover rounded-full" 
                  alt="App Logo"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as any).src = 'https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png';
                  }}
                />
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-full"
              >
                <Camera className="text-white" size={32} />
              </button>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={onLogoChange} 
            />
         </div>

         <div className="space-y-4 text-center animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-black tracking-tight text-[#0056b3] dark:text-blue-500 drop-shadow-sm leading-tight">
                কয়রা-পাইকগাছা
              </h1>
              <p className="text-[14px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mt-1">কমিউনিটি অ্যাপস</p>
            </div>

            <div className="w-full mb-4 animate-in slide-in-from-top-4 duration-1000">
               <DateTimeBox />
            </div>

            <div className="flex flex-col items-center">
              <p className="text-slate-500 dark:text-slate-400 font-bold text-lg px-4 leading-snug max-w-[320px] mx-auto mt-4">
                আপনার এলাকার সকল ডিজিটাল সেবা এখন এক ঠিকানায়
              </p>
              <p className="text-[12px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] mt-0.5">
                www.koyrabd.top
              </p>
            </div>
            
            <div className="rainbow-border-container mx-auto max-w-[260px] mt-12">
              <button 
                onClick={() => navigate('/services')}
                className="group relative w-full py-5 bg-[#0056b3] dark:bg-blue-600 text-white font-black text-xl rounded-[35px] shadow-[0_20px_40px_-10px_rgba(0,86,179,0.4)] overflow-hidden active:scale-95 transition-all flex items-center justify-center gap-4"
              >
                  সকল সেবা <ArrowRight size={26} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
         </div>

         <div className="w-full flex-1 flex flex-col items-center justify-center gap-1 opacity-90 animate-in slide-in-from-bottom-4 duration-1000 delay-500 mt-6">
            <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Development by</p>
            <p className="text-[12px] font-black tracking-[0.05em] text-[#0056b3] dark:text-blue-400 uppercase">Intelligence Creation BD</p>
         </div>
      </div>
    </div>
  </div>
);
};

const NewsRedirect = () => {
  const { newsId } = useParams();
  return <Navigate to={`/category/14?newsId=${newsId}`} replace />;
};

const App = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('kp_admin_logged_in') === 'true';
  });
  const [adminPassword, setAdminPassword] = useState<string>('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [userNotices, setUserNotices] = useState<Notice[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [menuAccess, setMenuAccess] = useState<Record<string, boolean>>({});
  const [accessNotice, setAccessNotice] = useState<{ isOpen: boolean; menuName: string }>({ isOpen: false, menuName: '' });
  const [isMedicalSubPageActive, setIsMedicalSubPageActive] = useState(false);
  const [unreadHelplineCount, setUnreadHelplineCount] = useState(0);
  const [showNotices, setShowNotices] = useState(false);
  const [expandedNoticeId, setExpandedNoticeId] = useState<string | null>(null);
  const [readNoticeIds, setReadNoticeIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('kp_read_notice_ids');
    return saved ? JSON.parse(saved) : [];
  });

  const unreadUserNoticeCount = userNotices.filter(n => !readNoticeIds.includes(n.id)).length;

  const markNoticeAsRead = (id: string) => {
    if (!readNoticeIds.includes(id)) {
      const updated = [...readNoticeIds, id];
      setReadNoticeIds(updated);
      localStorage.setItem('kp_read_notice_ids', JSON.stringify(updated));
    }
  };

  useEffect(() => {
    trackVisit();
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToUnreadCount(setUnreadHelplineCount);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const accessRef = doc(settingsDb, 'settings', 'menu_access');
    const unsubscribe = onSnapshot(accessRef, (snapshot) => {
      if (snapshot.exists()) {
        setMenuAccess(snapshot.data() || {});
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/menu_access');
    });
    return () => unsubscribe();
  }, []);

  const checkMenuAccess = (menuId: string, menuName: string) => {
    if (menuAccess[menuId] === false) {
      setAccessNotice({ isOpen: true, menuName });
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const [appLogo, setAppLogo] = useState('https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const subtitles = ["এক ক্লিকে সকল তথ্য", "বিপদে আপনার বন্ধু"];
  
  const [mainSubtitleIndex, setMainSubtitleIndex] = useState(0);
  const mainSubtitles = ["কমিউনিটি অ্যাপস", "www.koyrabd.top"];

  const longPressTimer = useRef<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isDownloadPage = location.pathname === '/getapp';
  const isServicesPage = location.pathname === '/services';
  const isChatPage = location.pathname === '/chat';
  const isHouseRentPage = location.pathname === '/house-rent';
  const isNewsPage = location.pathname.startsWith('/category/14');
  const isLedgerPage = location.pathname === '/ledger';
  const isHelplinePage = location.pathname === '/helpline';
  const isWeatherPage = location.pathname === '/weather';
  const isProfile = location.pathname === '/auth';

  useEffect(() => {
    const hostname = window.location.hostname;
    if (hostname.includes('getapp.koyrabd.top')) {
      if (location.pathname === '/') {
        navigate('/getapp', { replace: true });
      }
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (location.pathname !== '/medical') {
      setIsMedicalSubPageActive(false);
    }
  }, [location.pathname]);

  // Google Analytics Page View Tracking
  useEffect(() => {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('config', 'G-V4ZF9WWNN5', {
        page_path: location.pathname,
      });
    }
  }, [location]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [subtitles.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMainSubtitleIndex((prev) => (prev + 1) % mainSubtitles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [mainSubtitles.length]);

  useEffect(() => {
    // Load admin password from AppSettings Firebase
    const adminPassRef = doc(settingsDb, 'settings', 'admin_password');
    const unsubscribePass = onSnapshot(adminPassRef, (snapshot) => {
      if (snapshot.exists() && snapshot.data()?.value) {
        setAdminPassword(snapshot.data().value.toString());
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/admin_password');
    });

    // Load app logo from AppSettings Firebase
    const appLogoRef = doc(settingsDb, 'settings', 'app_logo');
    const unsubscribeLogo = onSnapshot(appLogoRef, (snapshot) => {
      if (snapshot.exists()) {
        setAppLogo(snapshot.data().value);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/app_logo');
    });

    // Load notices from AppSettings Firebase
    const noticesRef = doc(settingsDb, 'settings', 'notices');
    const unsubscribeNotices = onSnapshot(noticesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().list || [];
        setNotices(data);
        localStorage.setItem('kp_notices', JSON.stringify(data));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/notices');
    });

    // Load user notices from AppSettings Firebase
    const userNoticesRef = doc(settingsDb, 'settings', 'user_notices');
    const unsubscribeUserNotices = onSnapshot(userNoticesRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data().list || [];
        setUserNotices(data);
        localStorage.setItem('kp_user_notices', JSON.stringify(data));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/user_notices');
    });

    const savedNotices = localStorage.getItem('kp_notices');
    if (savedNotices) setNotices(JSON.parse(savedNotices));

    const savedUserNotices = localStorage.getItem('kp_user_notices');
    if (savedUserNotices) setUserNotices(JSON.parse(savedUserNotices));

    return () => {
      unsubscribePass();
      unsubscribeLogo();
      unsubscribeNotices();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert Bengali digits to English and trim spaces
    const cleanInput = convertToEn(loginInput).trim();
    const cleanMaster = (adminPassword || '').toString().trim();

    if (!cleanMaster) {
      alert('পাসওয়ার্ড লোড হচ্ছে, অনুগ্রহ করে অপেক্ষা করুন...');
      return;
    }

    // Case-insensitive comparison for non-numeric passwords
    const isMatch = isNaN(Number(cleanMaster)) 
      ? cleanInput.toLowerCase() === cleanMaster.toLowerCase()
      : cleanInput === cleanMaster;

    if (isMatch) {
      setIsAdminLoggedIn(true);
      localStorage.setItem('kp_admin_logged_in', 'true');
      setShowAdminLogin(false);
      setShowAdminPassword(false);
      setLoginInput('');
    } else {
      alert('ভুল পাসওয়ার্ড! আবার চেষ্টা করুন।');
    }
  };

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setShowAdminLogin(true);
      setIsDrawerOpen(false);
    }, 3000);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  const handleUpdatePassword = async (newPass: string) => {
    if (!newPass.trim()) return;
    try {
      const adminPassRef = doc(settingsDb, 'settings', 'admin_password');
      await setDoc(adminPassRef, { value: newPass });
      setAdminPassword(newPass);
      alert('পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।');
    } catch (e) {
      alert('পাসওয়ার্ড আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isAdminLoggedIn) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        try {
          const appLogoRef = doc(settingsDb, 'settings', 'app_logo');
          await setDoc(appLogoRef, { value: base64 });
          setAppLogo(base64);
          alert('এপসের প্রোফাইল পিকচার আপডেট হয়েছে!');
        } catch (err) {
          alert('আপলোড ব্যর্থ হয়েছে!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('kp_admin_logged_in');
    setCurrentUser(null);
    setIsDrawerOpen(false);
    localStorage.removeItem('kp_logged_in_user');
  };

  const handleCategoryChange = React.useCallback((cat: string | null) => {
    setIsMedicalSubPageActive(cat !== null);
  }, []);

  return (
    <div className={`min-h-screen w-full flex flex-col transition-colors duration-300 relative ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white text-[#1A1A1A]'}`}>
      {!isLanding && !isDownloadPage && !isLedgerPage && !isHouseRentPage && !isMedicalSubPageActive && !isHelplinePage && (
        <>
          <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
            <div className={`absolute top-0 left-0 bottom-0 w-[85vw] max-w-xs bg-white dark:bg-slate-950 shadow-2xl transition-transform duration-300 ease-out border-r border-slate-100 dark:border-slate-800 flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="text-left flex flex-col overflow-hidden">
                  <div className="flex items-baseline gap-1.5 overflow-hidden">
                    <h2 className="font-black text-lg text-[#0056b3] dark:text-blue-400 shimmer-text leading-none truncate">কয়রা-পাইকগাছা</h2>
                  </div>
                  <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">কমিউনিটি অ্যাপস</p>
                </div>
                <button 
                  onPointerDown={handleLongPressStart}
                  onPointerUp={handleLongPressEnd}
                  onPointerLeave={handleLongPressEnd}
                  onClick={() => setIsDrawerOpen(false)} 
                  className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-slate-400 dark:text-slate-500 transition-colors active:scale-90 shrink-0"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-4 space-y-4 no-scrollbar">
                 <nav className="px-4 space-y-1">
                    {currentUser ? (
                      <button 
                        onClick={() => { 
                          if (checkMenuAccess('18', 'আমার প্রোফাইল')) {
                            setIsDrawerOpen(false); 
                            navigate('/auth'); 
                          }
                        }}
                        className="w-full flex items-center gap-4 p-4 mb-2 bg-blue-50/50 dark:bg-blue-900/20 rounded-2xl text-left active:scale-[0.98] transition-all group"
                      >
                        <div className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-700 shadow-sm overflow-hidden bg-slate-100 shrink-0">
                          {(currentUser as any).photoURL ? (
                            <img src={(currentUser as any).photoURL} className="w-full h-full object-cover" alt="Profile" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                              <UserCircle size={28} />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="font-black text-slate-800 dark:text-slate-200 text-base leading-tight truncate flex items-center gap-1">
                             {currentUser.fullName}
                             {currentUser.isVerified && (
                                <CheckCircle2 size={14} fill="#1877F2" className="text-white shrink-0" />
                             )}
                          </p>
                          <p className="text-[10px] font-black text-blue-500/80 uppercase tracking-tighter mt-0.5">আমার প্রোফাইল</p>
                        </div>
                        <ArrowRight size={16} className="text-blue-400/50 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ) : (
                      <MenuLink icon={<UserIcon size={20} />} label="আমার প্রোফাইল" onClick={() => { 
                        if (checkMenuAccess('18', 'আমার প্রোফাইল')) {
                          setIsDrawerOpen(false); 
                          navigate('/auth'); 
                        }
                      }} />
                    )}
                    <MenuLink icon={<PlusCircle size={20} />} label="তথ্য প্রদান" onClick={() => { 
                      if (checkMenuAccess('11', 'তথ্য প্রদান')) {
                        setIsDrawerOpen(false); 
                        navigate('/info-submit'); 
                      }
                    }} />
                    <MenuLink icon={<Info size={20} />} label="অ্যাপ সম্পর্কে" onClick={() => { 
                      setIsDrawerOpen(false); 
                      navigate('/about'); 
                    }} />
                    {isAdminLoggedIn && (
                       <>
                         <MenuLink icon={<Lock size={20} />} label="এডমিন প্যানেল" onClick={() => { setIsDrawerOpen(false); navigate('/admin'); }} />
                         <MenuLink icon={<MessageSquare size={20} />} label="এডমিন হেল্প লাইন" onClick={() => { setIsDrawerOpen(false); navigate('/admin?view=helpline'); }} badge={unreadHelplineCount} />
                       </>
                    )}
                    <MenuLink icon={<Download size={20} />} label="ডাউনলোড অ্যাপ" onClick={() => { 
                      setIsDrawerOpen(false); 
                      navigate('/getapp'); 
                    }} />
                 </nav>
              </div>
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/30 dark:bg-slate-900/20 shrink-0">
                {(isAdminLoggedIn || currentUser) ? (
                  <button onClick={handleLogout} className="w-full py-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <LogOut size={20} /> লগআউট করুন
                  </button>
                ) : (
                  <button onClick={() => { setIsDrawerOpen(false); navigate('/auth'); }} className="w-full py-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-red-400 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all">
                    <LogInIcon size={20} /> লগইন করুন
                  </button>
                )}

                <div className="grid grid-cols-5 gap-2 pt-2">
                  <button 
                    onClick={() => { window.open("https://www.instagram.com/koyrapaikgachacommunityapp", "_blank"); setIsDrawerOpen(false); }}
                    className="flex flex-col items-center gap-1 group outline-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white shadow-sm active:scale-90 transition-all">
                      <Instagram size={20} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">ইনস্টাগ্রাম</span>
                  </button>
                  <button 
                    onClick={() => { window.open("https://www.threads.net/@koyrapaikgachacommunityapp", "_blank"); setIsDrawerOpen(false); }}
                    className="flex flex-col items-center gap-1 group outline-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-sm active:scale-90 transition-all">
                      <ThreadsIcon size={20} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">থ্রেডস</span>
                  </button>
                  <button 
                    onClick={() => { window.open("https://www.pinterest.com/koyrapaikgachacommunityapp", "_blank"); setIsDrawerOpen(false); }}
                    className="flex flex-col items-center gap-1 group outline-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#E60023] flex items-center justify-center text-white shadow-sm active:scale-90 transition-all">
                      <PinterestIcon size={20} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">পিন্টারেস্ট</span>
                  </button>
                  <button 
                    onClick={() => { window.open("https://www.youtube.com/@koyrapaikgachacommunityapp", "_blank"); setIsDrawerOpen(false); }}
                    className="flex flex-col items-center gap-1 group outline-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#FF0000] flex items-center justify-center text-white shadow-sm active:scale-90 transition-all">
                      <Youtube size={20} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">ইউটিউব</span>
                  </button>
                  <button 
                    onClick={() => { window.open("https://www.facebook.com/share/18Hf7ptZRt/", "_blank"); setIsDrawerOpen(false); }}
                    className="flex flex-col items-center gap-1 group outline-none"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#1877F2] flex items-center justify-center text-white shadow-sm active:scale-90 transition-all">
                      <Facebook size={20} />
                    </div>
                    <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400">ফেসবুক</span>
                  </button>
                </div>

                <div className="flex flex-col items-center justify-center gap-0.5 mt-3 opacity-60">
                  <p className="text-[8px] font-black uppercase tracking-[0.2em]">Developed by</p>
                  <p className="text-[10px] font-black tracking-widest uppercase">Intelligence Creation BD</p>
                </div>
              </div>
            </div>
          </div>

          {(!isWeatherPage && !(isProfile && currentUser)) && (
            <header className={`sticky top-0 z-50 transition-all duration-500 glass-header border-b ${isScrolled ? 'opacity-100 shadow-lg' : 'opacity-95'}`}>
              {isServicesPage ? <BlueHeaderBackground /> : <SundarbanHeaderBackground />}
              <div className="w-full px-5 h-20 flex items-center justify-between relative z-10">
                <div className="flex items-center gap-0 shrink-0">
                  <button onClick={() => setIsDrawerOpen(true)} className="p-2.5 rounded-xl text-white/80 hover:text-white transition-all duration-300 active:scale-90 relative">
                    <Menu size={22} strokeWidth={2.5} />
                    {isAdminLoggedIn && unreadHelplineCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse border border-white/20">
                        {unreadHelplineCount}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex flex-col items-center overflow-hidden">
                  {!isLedgerPage && (
                    <>
                      <div className="flex items-baseline gap-1.5 overflow-hidden">
                        <h1 className="font-black text-xl tracking-tight text-white leading-none drop-shadow-sm truncate">
                          {isChatPage ? 'কেপি চ্যাট' : isNewsPage ? 'কেপি পোস্ট' : 'কয়রা-পাইকগাছা'}
                        </h1>
                      </div>
                      <div className="relative h-4 flex items-center justify-center mt-0.5 overflow-hidden w-full px-2">
                        {(!isChatPage && !isNewsPage) ? (
                          <span key={mainSubtitleIndex} className="text-[9px] font-black tracking-wider uppercase text-white/80 whitespace-nowrap animate-in fade-in duration-500">
                            {mainSubtitles[mainSubtitleIndex]}
                          </span>
                        ) : (
                          <span className="text-[9px] font-black tracking-wider uppercase whitespace-nowrap animate-rainbow-text">
                            {subtitles[subtitleIndex]}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl text-white/80 transition-all duration-300 hover:text-white active:scale-90">
                    {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotices(!showNotices)} 
                      className="p-2.5 rounded-xl text-white/80 transition-all duration-300 hover:text-white active:scale-90 relative"
                    >
                      <Bell size={20} />
                      {unreadUserNoticeCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 bg-red-500 text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-pulse border border-white/20">
                          {unreadUserNoticeCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </header>
          )}
        </>
      )}

      <AnimatePresence>
        {showNotices && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotices(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[340px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="p-5 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="w-10 h-10" /> {/* Spacer for centering */}
                <div className="flex items-center gap-2">
                  <motion.div 
                    animate={{ 
                      rotate: [0, -10, 10, -10, 10, 0],
                      scale: [1, 1.1, 1, 1.1, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-[#0056b3] dark:text-blue-400"
                  >
                    <Bell size={16} />
                  </motion.div>
                  <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">নোটিফিকেশন</h3>
                </div>
                <button onClick={() => setShowNotices(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X size={16} className="text-slate-400" />
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {userNotices.length === 0 ? (
                  <div className="py-10 text-center">
                    <p className="text-xs font-bold text-slate-400">কোনো নোটিশ নেই</p>
                  </div>
                ) : (
                  [...userNotices]
                    .sort((a, b) => {
                      const aRead = readNoticeIds.includes(a.id);
                      const bRead = readNoticeIds.includes(b.id);
                      if (aRead === bRead) return 0;
                      return aRead ? 1 : -1;
                    })
                    .map((notice, idx) => {
                      const isRead = readNoticeIds.includes(notice.id);
                      const isExpanded = expandedNoticeId === notice.id;
                      return (
                        <motion.div 
                          key={notice.id || idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          onClick={() => {
                            markNoticeAsRead(notice.id);
                            setExpandedNoticeId(isExpanded ? null : notice.id);
                          }}
                          className={`p-4 rounded-2xl border transition-all group cursor-pointer ${
                            isRead 
                              ? 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-100 dark:border-slate-800' 
                              : 'bg-white dark:bg-slate-800 border-blue-100 dark:border-blue-900/30 shadow-sm ring-1 ring-blue-500/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {!isRead && (
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0 animate-pulse" />
                            )}
                            {isRead && (
                              <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 mt-1.5 shrink-0" />
                            )}
                            <div className="space-y-1 flex-1 overflow-hidden">
                              <p className={`text-[13px] leading-relaxed transition-all duration-300 ${
                                isRead ? 'text-slate-500 dark:text-slate-400 font-medium' : 'text-slate-800 dark:text-slate-100 font-bold'
                              } ${isExpanded ? '' : 'line-clamp-1'}`}>
                                {notice.content}
                              </p>
                              <div className="flex items-center justify-between mt-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500">
                                    {notice.date}
                                  </span>
                                  {!isRead && (
                                    <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-md">
                                      New
                                    </span>
                                  )}
                                </div>
                                <span className="text-[9px] font-bold text-blue-500/60 dark:text-blue-400/60">
                                  {isExpanded ? 'সংক্ষিপ্ত করুন' : 'বিস্তারিত দেখুন'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                )}
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-center gap-1.5">
                <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.1em]">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</p>
                <CheckCircle2 size={10} className="text-blue-500 fill-blue-500/10" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showAdminLogin && !isAdminLoggedIn && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 w-full max-xs rounded-[28px] p-8 shadow-2xl animate-in zoom-in duration-500 border border-slate-100">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lock className="text-[#0056b3]" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-6 text-center text-[#1A1A1A] dark:text-white">এডমিন লগইন</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="relative">
                <input 
                  type={showAdminPassword ? "text" : "password"}
                  placeholder="পাসওয়ার্ড দিন"
                  className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0056b3] transition-all font-semibold text-center"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  autoFocus
                />
                <button 
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 p-2"
                >
                  {showAdminPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button type="button" onClick={() => {setShowAdminLogin(false); setShowAdminPassword(false); setLoginInput('');}} className="py-4 rounded-xl bg-slate-100 dark:bg-slate-700 font-bold text-slate-600 text-sm">বন্ধ</button>
                <button type="submit" className="py-4 rounded-xl bg-[#0056b3] text-white font-bold text-sm shadow-lg">প্রবেশ</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className={`flex-1 relative w-full ${isLanding ? 'overflow-hidden' : 'overflow-hidden'} ${isLanding || isLedgerPage ? '' : 'bg-white dark:bg-slate-950'}`}>
        <div className={`h-full w-full ${isLanding || isLedgerPage ? 'overflow-hidden' : 'overflow-y-auto'} no-scrollbar`}>
            <Routes>
              <Route path="/" element={
                <LandingScreen 
                  isDarkMode={isDarkMode} 
                  setIsDarkMode={setIsDarkMode} 
                  appLogo={appLogo} 
                  isAdmin={isAdminLoggedIn}
                  onLogoChange={handleLogoChange}
                />
              } />
              <Route path="/services" element={<Home notices={notices} isAdmin={isAdminLoggedIn} user={currentUser} isDarkMode={isDarkMode} checkAccess={checkMenuAccess} />} />
              <Route path="/category/:id/*" element={<CategoryView checkAccess={checkMenuAccess} />} />
              <Route path="/hotline" element={<HotlineDetail checkAccess={checkMenuAccess} />} />
              <Route path="/hotline/:serviceType" element={<HotlineDetail checkAccess={checkMenuAccess} />} />
              <Route path="/hotline/:serviceType/:upazila" element={<HotlineDetail checkAccess={checkMenuAccess} />} />
              <Route path="/helpline" element={isAdminLoggedIn ? <Navigate to="/admin?view=helpline" /> : <PublicHelpline />} />
              <Route path="/info-submit" element={<InfoSubmit onSubmission={(s) => setSubmissions([...submissions, s])} checkAccess={checkMenuAccess} />} />
              <Route path="/auth" element={<UserAuth onLogin={setCurrentUser} checkAccess={checkMenuAccess} />} />
              <Route path="/ledger" element={currentUser ? <DigitalLedger checkAccess={checkMenuAccess} /> : <Navigate to="/auth?to=ledger" />} />
              <Route path="/online-haat" element={<OnlineHaat checkAccess={checkMenuAccess} />} />
              <Route path="/weather" element={<WeatherPage checkAccess={checkMenuAccess} />} />
              <Route path="/chat" element={<KPCommunityChat checkAccess={checkMenuAccess} />} />
              <Route path="/medical" element={
                <PublicMedical 
                  onBack={() => navigate('/services')} 
                  checkAccess={checkMenuAccess} 
                  onCategoryChange={handleCategoryChange}
                />
              } />
              <Route path="/about" element={<AboutApp onBack={() => navigate('/services')} />} />
              <Route path="/age-calculator" element={<AgeCalculator onBack={() => navigate('/services')} checkAccess={checkMenuAccess} />} />
              <Route path="/house-rent" element={<PublicHouseRent onBack={() => navigate('/services')} checkAccess={checkMenuAccess} user={currentUser} />} />
              <Route path="/id-card" element={<UserEmergencyInfo uid="" onBack={() => navigate('/services')} />} />
              <Route path="/getapp" element={
                <PublicDownload 
                  appLogo={appLogo} 
                  isAdminLoggedIn={isAdminLoggedIn} 
                  onLogoChange={handleLogoChange} 
                  checkAccess={checkMenuAccess}
                />
              } />
              <Route 
                path="/admin" 
                element={
                  isAdminLoggedIn ? (
                    <AdminDashboard 
                      submissions={submissions} 
                      notices={notices} 
                      userNotices={userNotices}
                      onUpdateNotices={setNotices} 
                      onUpdateUserNotices={setUserNotices}
                      onUpdatePassword={handleUpdatePassword} 
                      adminPassword={adminPassword} 
                      onUpdateSubmissions={setSubmissions} 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-10 text-center min-h-[60vh]">
                      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-6">
                        <Lock size={40} className="text-[#0056b3]" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">এডমিন এক্সেস প্রয়োজন</h2>
                      <p className="text-slate-500 font-bold mb-8 max-w-[280px] leading-relaxed">এই পেজটি শুধুমাত্র অনুমোদিত এডমিনদের জন্য সংরক্ষিত। অনুগ্রহ করে লগইন করুন।</p>
                      <button 
                        onClick={() => setShowAdminLogin(true)}
                        className="w-full max-w-[240px] py-4 bg-[#0056b3] text-white font-black rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                      >
                        লগইন করুন
                      </button>
                    </div>
                  )
                } 
              />
              <Route path="/news/:newsId" element={<NewsRedirect />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </div>
      </main>
      {!isLanding && !isDownloadPage && !isHouseRentPage && <BottomNav checkAccess={checkMenuAccess} />}
      <MenuAccessNotice 
        isOpen={accessNotice.isOpen} 
        onClose={() => setAccessNotice({ ...accessNotice, isOpen: false })} 
        menuName={accessNotice.menuName} 
      />
    </div>
  );
}

export default App;
