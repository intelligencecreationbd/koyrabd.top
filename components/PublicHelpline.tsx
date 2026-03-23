import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, ShieldCheck, Clock, Headset, Phone, MoreVertical, Smile, CheckCircle2 } from 'lucide-react';
import { sendHelplineMessage, subscribeToHelplineMessages, HelplineMessage, cleanupOldMessages } from '../services/helplineService';

import { doc, onSnapshot } from 'firebase/firestore';
import { settingsDb } from '../Firebase-appsettings';

/**
 * @LOCKED_COMPONENT
 * @Section Public Help Line View (ID 20)
 * @Status Smart Chatting Feature
 */
const PublicHelpline: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<HelplineMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [appLogo, setAppLogo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('kp_logged_in_user');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
    } else {
      // Create a temporary guest ID if not logged in
      let guestId = localStorage.getItem('helpline_guest_id');
      if (!guestId) {
        guestId = `guest_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('helpline_guest_id', guestId);
      }
      setCurrentUser({ memberId: guestId, fullName: 'Guest User' });
    }
    
    // Cleanup old messages
    cleanupOldMessages();

    // Load app logo
    const appLogoRef = doc(settingsDb, 'settings', 'app_logo');
    const unsubscribeLogo = onSnapshot(appLogoRef, (snapshot) => {
      if (snapshot.exists()) {
        setAppLogo(snapshot.data().value);
      }
    });

    return () => unsubscribeLogo();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const unsubscribe = subscribeToHelplineMessages(currentUser.memberId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentUser) return;

    const text = inputText;
    setInputText('');
    
    await sendHelplineMessage(
      text,
      currentUser.memberId,
      currentUser.fullName,
      currentUser.memberId,
      false
    );
  };

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Header */}
      <div className="bg-blue-100/90 backdrop-blur-sm p-3 border-b border-blue-200 flex flex-col items-center sticky top-0 z-50">
        {/* Small Logo at top center */}
        <div className="w-8 h-8 mb-1">
          {appLogo ? (
            <img src={appLogo} alt="Logo" className="w-full h-full object-contain" />
          ) : (
            <div className="w-full h-full bg-blue-200 rounded-full flex items-center justify-center">
              <Headset size={16} className="text-blue-600" />
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-1.5">
          <h2 className="text-[15px] font-black text-blue-600 tracking-tight">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</h2>
          <CheckCircle2 size={14} className="text-blue-500 fill-blue-500 text-white" />
        </div>
        <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mt-0.5 animate-pulse">অফিসিয়াল হেল্পলাইন</p>
      </div>
      
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-white pb-48"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
              <Headset size={32} className="text-blue-500" />
            </div>
            <div>
              <p className="font-black text-slate-800">সহযোগিতার জন্য মেসেজ করুন</p>
              <p className="text-xs font-bold text-slate-400">আমরা আপনার সমস্যার সমাধানে পাশে আছি</p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.isAdminReply ? 'justify-start' : 'justify-end'} animate-in slide-in-from-bottom-2 duration-300`}
            >
              <div className={`max-w-[85%] flex flex-col ${msg.isAdminReply ? 'items-start' : 'items-end'}`}>
                <div className={`px-4 py-2.5 rounded-2xl font-medium text-[14px] shadow-sm ${
                  msg.isAdminReply 
                    ? 'bg-slate-100 text-slate-800 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  {msg.isAdminReply && <ShieldCheck size={10} className="text-blue-500" />}
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">
                    {msg.isAdminReply ? 'Admin' : 'You'} • {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleString('bn-BD', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-[85px] left-0 right-0 p-3 z-40 bg-white/80 backdrop-blur-md border-t border-slate-50">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button className="w-10 h-10 flex items-center justify-center text-slate-400 active:scale-90 transition-transform shrink-0">
            <Smile size={24} />
          </button>
          <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-2">
            <div className="flex-1 relative">
              <input 
                type="text"
                placeholder="মেসেজ লিখুন..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 text-[14px] outline-none focus:border-blue-400 transition-all"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-all disabled:opacity-50 shrink-0"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublicHelpline;
