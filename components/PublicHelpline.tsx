import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, User, ShieldCheck, Clock, Headset, Phone, MoreVertical, Smile, CheckCircle2 } from 'lucide-react';
import { sendHelplineMessage, subscribeToHelplineMessages, HelplineMessage, cleanupOldMessages } from '../services/helplineService';

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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3 sticky top-0 z-10">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white relative">
            <Headset size={20} />
            <div className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1">
              <h2 className="text-[15px] font-bold text-slate-800 leading-tight">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</h2>
              <CheckCircle2 size={14} className="text-blue-500 fill-blue-500 text-white" />
            </div>
            <p className="text-[11px] font-medium text-slate-400">অফিসিয়াল হেল্পলাইন</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-blue-600 active:scale-90 transition-transform">
            <Phone size={20} />
          </button>
          <button className="text-slate-400 active:scale-90 transition-transform">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar bg-white"
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
                    {msg.isAdminReply ? 'Admin' : 'You'} • {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 pb-24">
        <div className="flex items-center gap-3">
          <button className="text-blue-500 active:scale-90 transition-transform">
            <Smile size={24} />
          </button>
          <form onSubmit={handleSendMessage} className="flex-1 flex items-center gap-3">
            <input 
              type="text"
              placeholder="মেসেজ লিখুন..."
              className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-full font-medium text-slate-800 outline-none focus:border-blue-400 transition-all"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            <button 
              type="submit"
              disabled={!inputText.trim()}
              className="w-12 h-12 bg-slate-50 text-blue-500 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all disabled:opacity-50"
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
