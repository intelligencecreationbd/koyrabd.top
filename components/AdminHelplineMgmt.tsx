import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Send, User, ShieldCheck, Clock, MessageSquare, Trash2 } from 'lucide-react';
import { subscribeToAllHelplineChats, sendHelplineMessage, markChatAsRead, HelplineMessage, cleanupOldMessages } from '../src/services/helplineService';
import { motion, AnimatePresence } from 'motion/react';

interface AdminHelplineMgmtProps {
  onBack: () => void;
}

const AdminHelplineMgmt: React.FC<AdminHelplineMgmtProps> = ({ onBack }) => {
  const [chats, setChats] = useState<Record<string, HelplineMessage[]>>({});
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllHelplineChats((updatedChats) => {
      setChats(updatedChats);
    });

    // Run cleanup on mount
    cleanupOldMessages();

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedChatId, chats]);

  useEffect(() => {
    if (selectedChatId) {
      markChatAsRead(selectedChatId);
    }
  }, [selectedChatId]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId) return;

    const text = replyText;
    setReplyText('');

    // Admin replies use the chatId of the user they are replying to
    await sendHelplineMessage(
      text,
      'admin',
      'Admin',
      selectedChatId,
      true
    );
  };

  const activeChatMessages = selectedChatId ? chats[selectedChatId] || [] : [];
  const chatList = Object.entries(chats).sort((a, b) => {
    const lastA = a[1][0]?.createdAt?.toMillis() || 0;
    const lastB = b[1][0]?.createdAt?.toMillis() || 0;
    return lastB - lastA;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
      {/* Header */}
      <div className="bg-white p-4 border-b border-slate-100 flex items-center gap-3">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-lg transition-colors">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-lg font-black text-slate-800">হেল্প লাইন মেসেজ</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">স্মার্ট চ্যাটিং ম্যানেজমেন্ট</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Chat List Sidebar */}
        <div className={`w-full md:w-80 bg-white border-r border-slate-100 overflow-y-auto no-scrollbar ${selectedChatId ? 'hidden md:block' : 'block'}`}>
          {chatList.length === 0 ? (
            <div className="p-10 text-center opacity-30 flex flex-col items-center gap-2">
              <MessageSquare size={40} />
              <p className="font-bold text-sm">কোনো মেসেজ নেই</p>
            </div>
          ) : (
            (chatList as [string, HelplineMessage[]][]).map(([chatId, messages]) => {
              const lastMsg = messages[0]; // Messages are sorted desc in service for list
              const userMsgs = messages.filter(m => !m.isAdminReply);
              const userName = userMsgs[0]?.senderName || 'Unknown User';
              const hasUnread = messages.some(m => !m.isAdminReply && !m.readByAdmin);
              
              return (
                <button
                  key={chatId}
                  onClick={() => setSelectedChatId(chatId)}
                  className={`w-full p-4 text-left border-b border-slate-50 transition-colors hover:bg-slate-50 ${selectedChatId === chatId ? 'bg-blue-50/50' : ''} relative`}
                >
                  {hasUnread && (
                    <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-full" />
                  )}
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className={`font-black text-slate-800 text-sm truncate ${hasUnread ? 'text-blue-600' : ''}`}>{userName}</span>
                      {hasUnread && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0 animate-pulse" />}
                    </div>
                    <span className="text-[9px] font-bold text-slate-400">
                      {lastMsg?.createdAt?.toDate ? new Date(lastMsg.createdAt.toDate()).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate font-medium">
                    {lastMsg?.isAdminReply ? 'You: ' : ''}{lastMsg?.text}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-slate-50 ${!selectedChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
          {!selectedChatId ? (
            <div className="text-center opacity-20">
              <MessageSquare size={64} className="mx-auto mb-4" />
              <p className="text-xl font-black">মেসেজ সিলেক্ট করুন</p>
            </div>
          ) : (
            <>
              {/* Chat Header (Mobile Back) */}
              <div className="md:hidden bg-white p-3 border-b border-slate-100 flex items-center gap-2">
                <button onClick={() => setSelectedChatId(null)} className="p-1">
                  <ChevronLeft size={20} />
                </button>
                <span className="font-bold text-slate-800">
                  {chats[selectedChatId]?.[chats[selectedChatId].length - 1]?.senderName || 'User'}
                </span>
              </div>

              {/* Messages Area */}
              <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar"
              >
                {activeChatMessages.slice().reverse().map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.isAdminReply ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] flex flex-col ${msg.isAdminReply ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl font-bold text-xs shadow-sm ${
                        msg.isAdminReply 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-[8px] font-black text-slate-400 mt-1 px-1 uppercase">
                        {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form onSubmit={handleSendReply} className="relative">
                  <input 
                    type="text"
                    placeholder="রিপ্লাই লিখুন..."
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm text-slate-800 outline-none focus:border-blue-400 transition-all"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!replyText.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg active:scale-90 transition-all disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHelplineMgmt;
