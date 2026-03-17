
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Trash2, 
  Inbox, 
  Megaphone,
  Users,
  X,
  Lock,
  ArrowRight,
  Bus,
  Search,
  Plus,
  Mail,
  ShieldAlert,
  Scale,
  MessageSquare,
  Loader2,
  Camera,
  Smartphone,
  Tag,
  Building2,
  Home as HomeIcon,
  ShieldCheck,
  UserCheck,
  FolderPlus,
  User as UserIcon,
  Phone,
  Newspaper,
  ShoppingBag,
  HeartPulse,
  LayoutGrid,
  BarChart3
} from 'lucide-react';
import { Submission, Notice, User as AppUser, HotlineContact, BusCounter, LegalServiceContact } from '../types';
import AdminHotlineMgmt from '../components/AdminHotlineMgmt';
import AdminBusMgmt from '../components/AdminBusMgmt';
import AdminLegalMgmt from '../components/AdminLegalMgmt';
import AdminMobileMgmt from '../components/AdminMobileMgmt';
import AdminRepMgmt from '../components/AdminRepMgmt';
import AdminNewsMgmt from '../components/AdminNewsMgmt';
import AdminHaatMgmt from '../components/AdminHaatMgmt';
import AdminUserList from '../components/AdminUserList';
import AdminMedicalMgmt from '../components/AdminMedicalMgmt';
import AdminHouseRentMgmt from '../components/AdminHouseRentMgmt';
import AdminMenuAccess from '../components/AdminMenuAccess';
import AdminAboutMgmt from '../components/AdminAboutMgmt';
import AdminHelplineMgmt from '../components/AdminHelplineMgmt';
import VisitorStats from '../components/analytics/VisitorStats';
import { subscribeToUnreadCount } from '../services/helplineService';

import { settingsDb } from '../Firebase-appsettings';
import { doc, setDoc } from 'firebase/firestore';

interface AdminDashboardProps {
  submissions: Submission[];
  notices: Notice[];
  onUpdateNotices: (notices: Notice[]) => void;
  onUpdatePassword: (pass: string) => void;
  onUpdateSubmissions: (subs: Submission[]) => void;
  adminPassword: string;
}

type AdminView = 'menu' | 'users' | 'notices' | 'hotline_mgmt' | 'bus_mgmt' | 'legal_mgmt' | 'mobile_mgmt' | 'rep_mgmt' | 'news_mgmt' | 'haat_mgmt' | 'medical_mgmt' | 'houserent_mgmt' | 'change_pass' | 'user_submissions' | 'menu_access' | 'about_mgmt' | 'helpline_mgmt';

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex flex-col items-center gap-3 mb-6 text-center relative">
    <button onClick={onBack} className="absolute left-0 top-0 p-2 bg-white rounded-lg shadow-sm border border-slate-100 active:scale-90 transition-all">
      <ChevronLeft size={18} className="text-slate-800" />
    </button>
    <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1">{title}</h2>
  </div>
);

const TabButton: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-2.5 rounded-xl font-bold text-[13px] transition-all duration-300 ${active ? 'bg-[#0056b3] text-white shadow-md' : 'bg-slate-50 text-slate-500'}`}
  >
    {label}
  </button>
);

const MenuListItem: React.FC<{ onClick: () => void; icon: React.ReactNode; label: string; color: string; badge?: number }> = ({ onClick, icon, label, color, badge }) => (
  <button
    onClick={onClick}
    className="flex flex-row items-center gap-3 p-2.5 rounded-[20px] bg-white border border-slate-100 active:scale-[0.98] transition-all shadow-sm group w-full"
  >
    <div 
      className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
      style={{ backgroundColor: `${color}12`, color: color }}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
    </div>
    <div className="flex-1 flex items-center justify-between overflow-hidden">
      <span className="text-[14px] font-bold tracking-tight text-slate-700 text-left truncate">{label}</span>
      <div className="flex items-center gap-2 shrink-0">
        {badge !== undefined && badge > 0 && (
          <div className="bg-red-500 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center">
            {badge}
          </div>
        )}
        <ArrowRight size={14} className="text-slate-300" />
      </div>
    </div>
  </button>
);

const EditField: React.FC<{ label: string; value: string; placeholder?: string; onChange: (v: string) => void; icon?: React.ReactNode; type?: string }> = ({ label, value, placeholder, onChange, icon, type = 'text' }) => (
  <div className="text-left">
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

export default function AdminDashboard({ submissions, notices, onUpdateNotices, onUpdatePassword, onUpdateSubmissions, adminPassword }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<AdminView>(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'helpline') return 'helpline_mgmt';
    return 'menu';
  });
  const [activeTab, setActiveTab] = useState<'mgmt' | 'user' | 'settings' | null>(null);
  const [newNoticeText, setNewNoticeText] = useState('');
  const [newPassInput, setNewPassInput] = useState('');
  const [showVisitorStats, setShowVisitorStats] = useState(false);
  const [unreadHelplineCount, setUnreadHelplineCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToUnreadCount(setUnreadHelplineCount);
    return () => unsubscribe();
  }, []);

  const handleAddNotice = async () => {
    if (!newNoticeText.trim()) return;
    const id = `notice_${Date.now()}`;
    const updated = [...notices, { id, content: newNoticeText, date: new Date().toLocaleDateString('bn-BD') }];
    try {
      const noticesRef = doc(settingsDb, 'settings', 'notices');
      await setDoc(noticesRef, { list: updated });
      onUpdateNotices(updated);
      localStorage.setItem('kp_notices', JSON.stringify(updated));
      setNewNoticeText('');
    } catch (e) {
      alert('নোটিশ যোগ করতে সমস্যা হয়েছে!');
    }
  };

  const deleteNotice = async (id: string) => {
    const updated = notices.filter(n => n.id !== id);
    try {
      const noticesRef = doc(settingsDb, 'settings', 'notices');
      await setDoc(noticesRef, { list: updated });
      onUpdateNotices(updated);
      localStorage.setItem('kp_notices', JSON.stringify(updated));
    } catch (e) {
      alert('নোটিশ ডিলিট করতে সমস্যা হয়েছে!');
    }
  };

  const handlePassUpdate = () => {
    if (newPassInput.trim()) {
      onUpdatePassword(newPassInput);
      setNewPassInput('');
    } else {
      alert('দয়া করে নতুন পাসওয়ার্ড লিখুন।');
    }
  };

  return (
    <div className="p-4 pb-28 min-h-screen bg-white">
      {currentView === 'menu' && (
        <div className="animate-in fade-in duration-500">
          <Header title="এডমিন ড্যাশবোর্ড" onBack={() => navigate('/')} />
          
          <div className="flex gap-2 mb-6 bg-slate-50 p-1.5 rounded-2xl">
            <TabButton active={activeTab === 'mgmt'} label="ম্যানেজমেন্ট" onClick={() => setActiveTab(activeTab === 'mgmt' ? null : 'mgmt')} />
            <TabButton active={activeTab === 'user'} label="ইউজার" onClick={() => setActiveTab(activeTab === 'user' ? null : 'user')} />
            <TabButton active={activeTab === 'settings'} label="সেটিংস" onClick={() => setActiveTab(activeTab === 'settings' ? null : 'settings')} />
          </div>

          <div className="flex flex-col gap-2">
            {activeTab === 'mgmt' && (
              <>
                <MenuListItem onClick={() => setCurrentView('hotline_mgmt')} icon={<ShieldAlert />} label="জরুরি হটলাইন ম্যানেজমেন্ট" color="#FF4D4D" />
                <MenuListItem onClick={() => setCurrentView('mobile_mgmt')} icon={<Phone />} label="মোবাইল নাম্বার ম্যানেজার" color="#673AB7" />
                <MenuListItem onClick={() => setCurrentView('rep_mgmt')} icon={<UserCheck />} label="জনপ্রতিনিধি ম্যানেজার" color="#3498DB" />
                <MenuListItem onClick={() => setCurrentView('news_mgmt')} icon={<Newspaper />} label="সংবাদ ম্যানেজার" color="#4CAF50" />
                <MenuListItem onClick={() => setCurrentView('haat_mgmt')} icon={<ShoppingBag />} label="অনলাইন হাট ম্যানেজার" color="#F1C40F" />
                <MenuListItem onClick={() => setCurrentView('medical_mgmt')} icon={<HeartPulse />} label="চিকিৎসা সেবা ম্যানেজমেন্ট" color="#E91E63" />
                <MenuListItem onClick={() => setCurrentView('houserent_mgmt')} icon={<HomeIcon />} label="বাসা ভাড়া ম্যানেজমেন্ট" color="#8B4513" />
                <MenuListItem onClick={() => setCurrentView('bus_mgmt')} icon={<Bus />} label="বাস কাউন্টার ম্যানেজার" color="#E67E22" />
                <MenuListItem onClick={() => setCurrentView('legal_mgmt')} icon={<Scale />} label="আইনি সেবা ম্যানেজার" color="#2980B9" />
                <MenuListItem onClick={() => setCurrentView('helpline_mgmt')} icon={<MessageSquare />} label="হেল্প লাইন মেসেজ" color="#0056b3" badge={unreadHelplineCount} />
              </>
            )}

            {activeTab === 'user' && (
              <>
                <MenuListItem onClick={() => setCurrentView('users')} icon={<Users />} label="ইউজার লিস্ট" color="#2ECC71" />
              </>
            )}

            {activeTab === 'settings' && (
              <>
                <MenuListItem onClick={() => setCurrentView('user_submissions')} icon={<Inbox />} label="তথ্য পাঠিয়েছেন" color="#E91E63" badge={submissions.length} />
                <MenuListItem onClick={() => setCurrentView('about_mgmt')} icon={<Smartphone />} label="অ্যাপ ম্যানেজমেন্ট" color="#3B82F6" />
                <MenuListItem onClick={() => setCurrentView('menu_access')} icon={<LayoutGrid />} label="মেনু একসেস" color="#0056b3" />
                <MenuListItem onClick={() => setCurrentView('change_pass')} icon={<Lock />} label="পাসওয়ার্ড পরিবর্তন" color="#9B59B6" />
                <MenuListItem onClick={() => setCurrentView('notices')} icon={<Megaphone />} label="নোটিশ" color="#FF9F43" />
                <MenuListItem onClick={() => setShowVisitorStats(true)} icon={<BarChart3 />} label="ভিজিটর পরিসংখ্যান" color="#10B981" />
              </>
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showVisitorStats && (
          <VisitorStats onClose={() => setShowVisitorStats(false)} />
        )}
      </AnimatePresence>

      {currentView === 'hotline_mgmt' && <AdminHotlineMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'mobile_mgmt' && <AdminMobileMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'rep_mgmt' && <AdminRepMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'news_mgmt' && <AdminNewsMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'haat_mgmt' && <AdminHaatMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'medical_mgmt' && <AdminMedicalMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'houserent_mgmt' && <AdminHouseRentMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'bus_mgmt' && <AdminBusMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'legal_mgmt' && <AdminLegalMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'helpline_mgmt' && <AdminHelplineMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'about_mgmt' && <AdminAboutMgmt onBack={() => setCurrentView('menu')} />}
      {currentView === 'users' && <AdminUserList onBack={() => setCurrentView('menu')} />}
      {currentView === 'menu_access' && <AdminMenuAccess onBack={() => setCurrentView('menu')} />}
      
      {currentView === 'notices' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Header title="নোটিশ" onBack={() => setCurrentView('menu')} />
          <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 block pl-1 tracking-widest">নতুন নোটিশ যোগ করুন</label>
                <textarea className="w-full p-5 bg-slate-50 rounded-[24px] border border-slate-100 font-bold text-slate-800 outline-none focus:border-blue-400" rows={3} placeholder="নোটিশের বিস্তারিত লিখুন..." value={newNoticeText} onChange={e=>setNewNoticeText(e.target.value)} />
            </div>
            <button onClick={handleAddNotice} className="w-full py-4 bg-[#0056b3] text-white rounded-2xl font-black shadow-lg shadow-blue-500/10 active:scale-95 transition-all flex items-center justify-center gap-2">
                <Plus size={20} /> পাবলিশ করুন
            </button>
          </div>
          <div className="space-y-3">
            {notices.map(n => (
              <div key={n.id} className="bg-white p-5 rounded-[28px] border border-slate-100 flex justify-between items-start shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                <div className="flex-1 pr-4">
                    <p className="font-bold text-slate-800 text-sm leading-relaxed">{n.content}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-tighter">{n.date}</p>
                </div>
                <button onClick={()=>deleteNotice(n.id)} className="p-3 bg-red-50 text-red-500 rounded-xl active:scale-90 transition-all"><Trash2 size={18}/></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentView === 'change_pass' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Header title="পাসওয়ার্ড পরিবর্তন" onBack={() => setCurrentView('menu')} />
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-6">
             <div className="flex flex-col items-center gap-4 mb-2">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center"><Lock size={32}/></div>
                 <p className="text-sm font-bold text-slate-400 text-center px-4 leading-relaxed">অ্যাডমিন প্যানেলের নিরাপত্তা বজায় রাখতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন।</p>
             </div>
             <EditField label="বর্তমান পাসওয়ার্ড" value={adminPassword} onChange={()=>{}} placeholder="Current Password" icon={<ShieldCheck size={18}/>} type="password" />
             <EditField label="নতুন পাসওয়ার্ড" value={newPassInput} onChange={setNewPassInput} placeholder="New Password" icon={<Lock size={18}/>} type="password" />
             <button onClick={handlePassUpdate} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all">পাসওয়ার্ড আপডেট করুন</button>
          </div>
        </div>
      )}

      {currentView === 'user_submissions' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
          <Header title="তথ্য পাঠিয়েছেন" onBack={() => setCurrentView('menu')} />
          <div className="space-y-3">
            {submissions.length === 0 ? (
                <div className="py-20 text-center opacity-30">কোনো আবেদন পাওয়া যায়নি।</div>
            ) : (
                submissions.map(s => (
                  <div key={s.id} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="text-left">
                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">{s.type}</span>
                            <h4 className="font-black text-slate-800 mt-2">{s.mainMenu} - {s.subMenu}</h4>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400">{new Date(s.timestamp).toLocaleDateString('bn-BD')}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl text-left">
                        {s.details.map((d, i) => <p key={i} className="text-xs font-bold text-slate-600">• {d}</p>)}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">প্রেরক: {s.identity.isAnonymous ? 'গোপন' : s.identity.name}</p>
                        <button className="p-2 text-red-500 active:scale-90 transition-all"><Trash2 size={16}/></button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
