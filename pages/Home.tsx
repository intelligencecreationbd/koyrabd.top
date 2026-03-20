
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ChevronRight } from 'lucide-react';
import { ref, onValue } from 'firebase/database';
import { collection, onSnapshot } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../services/firestoreErrorHandler';
import { chatDb } from '../Firebase-kpchat';
import { CATEGORIES, ICON_MAP } from '../constants';
import { Notice, User } from '../types';

// Firebase removed for paid hosting migration

const toBn = (num: string | number) => 
  (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

interface HomeProps {
  notices: Notice[];
  isAdmin: boolean;
  user: User | null;
  isDarkMode: boolean;
  checkAccess?: (id: string, name: string) => boolean;
}

export function Home({ notices, isAdmin, user, isDarkMode, checkAccess }: HomeProps) {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [chatNotifications, setChatNotifications] = useState(0);

  // Listen for chat notifications if user is logged in
  useEffect(() => {
    if (!user) {
      setChatNotifications(0);
      return;
    }
    
    const roomsRef = collection(chatDb, `user_rooms/${user.memberId}/rooms`);
    const unsubscribe = onSnapshot(roomsRef, (snapshot) => {
      const total = snapshot.docs.reduce((acc: number, d: any) => acc + (d.data().unseenCount || 0), 0);
      setChatNotifications(total);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `user_rooms/${user.memberId}/rooms`);
    });

    return () => unsubscribe();
  }, [user]);

  // Filter out User Login (ID 12) from the main grid
  // Also filter out Help Line (ID 20) for admins as they have a dedicated admin view
  const menuItems = CATEGORIES.filter(c => {
    if (c.id === '12') return false;
    if (c.id === '20' && isAdmin) return false;
    return true;
  });

  // Chunking logic: 12 items per page (4 rows of 3 grid)
  const chunkSize = 12;
  const pages = [];
  for (let i = 0; i < menuItems.length; i += chunkSize) {
    pages.push(menuItems.slice(i, i + chunkSize));
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    if (width > 0) {
      const newPage = Math.round(scrollLeft / width);
      if (newPage !== currentPage) {
        setCurrentPage(newPage);
      }
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 top-20 overflow-hidden flex flex-col pt-4 px-4 pb-0 animate-in fade-in duration-700">
      
      {/* Notice Board - Compact */}
      <div className="shrink-0 relative overflow-hidden bg-notice dark:bg-slate-900/50 rounded-full py-1.5 px-6 border border-blue-100 dark:border-slate-800 shadow-[inset_0_1px_2px_rgba(0,86,179,0.05)] mb-3">
        <div className="relative h-5 flex items-center overflow-hidden">
          <div className="scrolling-text absolute whitespace-nowrap text-[13px] font-bold text-[#001f3f] dark:text-blue-300">
            {notices.length > 0 
              ? notices.map(n => n.content).join('  •  ') 
              : 'কয়রা-পাইকগাছা কমিউনিটি অ্যাপে আপনাকে স্বাগতম!'}
          </div>
        </div>
      </div>

      {/* Admin Quick Access */}
      {isAdmin && (
        <button 
          onClick={() => navigate('/admin')}
          className="shrink-0 w-full flex items-center justify-between p-2.5 bg-white dark:bg-slate-900/50 border border-blue-100 dark:border-slate-800 rounded-[20px] shadow-md transform active:scale-[0.98] transition-all group mb-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-[#0056b3] dark:text-blue-400 group-hover:bg-[#0056b3] group-hover:text-white transition-all">
              <LayoutDashboard size={18} />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-[#1A1A1A] dark:text-slate-200">এডমিন প্যানেল</p>
            </div>
          </div>
          <ChevronRight size={16} className="text-blue-200 dark:text-slate-600 group-hover:text-[#0056b3] transition-colors" />
        </button>
      )}

      {/* Paginated Menu Container - 4 Rows of 3 */}
      <div className="flex-1 flex flex-col relative min-h-0">
        <div 
          className="flex-1 flex overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-2 px-2"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch' }}
        >
          {pages.map((chunk, pageIdx) => (
            <div 
              key={pageIdx} 
              className="w-full h-full shrink-0 snap-start grid grid-cols-3 gap-x-4 gap-y-3 px-2 content-start"
            >
              {chunk.map((category) => {
                const IconComponent = ICON_MAP[category.icon];
                const iconColor = category.color;
                if (!IconComponent) return null;

                // Special handling for Profile Picture
                const isProfileMenu = category.id === '18';
                const hasProfilePic = isProfileMenu && user && (user as any).photoURL;

                return (
                  <button
                    key={category.id}
                    onClick={() => {
                      if (checkAccess && !checkAccess(category.id, category.name)) return;
                      
                      if (category.id === '1') navigate('/hotline');
                      else if (category.id === '11') navigate('/info-submit');
                      else if (category.id === '12') navigate('/auth');
                      else if (category.id === '13') {
                        if (user) navigate('/ledger');
                        else navigate('/auth?to=ledger');
                      }
                      else if (category.id === '7') navigate('/online-haat');
                      else if (category.id === '10') navigate('/weather');
                      else if (category.id === '16') navigate('/chat');
                      else if (category.id === '17') navigate('/medical');
                      else if (category.id === '19') navigate('/age-calculator');
                      else if (category.id === '23') navigate('/id-card');
                      else if (category.id === '24') navigate('/house-rent');
                      else if (category.id === '25') navigate('/about');
                      else if (category.id === '20') {
                        if (isAdmin) navigate('/admin?view=helpline');
                        else navigate('/helpline');
                      }
                      else if (category.id === '21') navigate('/getapp');
                      else if (category.id === '18') {
                        navigate('/auth');
                      }
                      else navigate(`/category/${category.id}`);
                    }}
                    className="flex flex-col items-center justify-center gap-2 p-2 premium-card rounded-[28px] group w-full aspect-square shadow-md border border-slate-50 dark:border-slate-800 relative overflow-hidden"
                  >
                    <div className="relative">
                      {hasProfilePic ? (
                        <div className="w-14 h-14 rounded-[20px] overflow-hidden border-2 border-white dark:border-slate-700 shadow-md shrink-0">
                           <img src={(user as any).photoURL} className="w-full h-full object-cover" alt="Profile" />
                        </div>
                      ) : (
                        <div 
                          className="w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0"
                          style={{ 
                            backgroundColor: isDarkMode ? `${iconColor}25` : `${iconColor}12`,
                            color: iconColor,
                            boxShadow: isDarkMode ? `0 6px 14px -3px rgba(0,0,0,0.4)` : `0 6px 14px -3px ${iconColor}24`,
                            border: `1px solid ${isDarkMode ? `${iconColor}40` : `${iconColor}18`}`
                          }}
                        >
                          <IconComponent size={34} className="icon-floating" />
                        </div>
                      )}

                      {/* Chat Notification Badge */}
                      {category.id === '16' && chatNotifications > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm animate-bounce">
                          {toBn(chatNotifications)}
                        </div>
                      )}
                    </div>

                    <span className="text-[11px] font-black text-center leading-tight text-slate-800 dark:text-slate-200 line-clamp-1 px-0.5 uppercase tracking-tighter">
                      {category.name}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Pagination Indicators */}
        {pages.length > 1 && (
          <div className="shrink-0 flex justify-center items-center gap-2 pt-2 pb-6">
            {pages.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${currentPage === i ? 'w-6 bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]' : 'w-1.5 bg-slate-200'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
