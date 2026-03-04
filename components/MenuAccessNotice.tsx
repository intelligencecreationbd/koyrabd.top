
import React from 'react';
import { X, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuAccessNoticeProps {
  isOpen: boolean;
  onClose: () => void;
  menuName: string;
}

const MenuAccessNotice: React.FC<MenuAccessNoticeProps> = ({ isOpen, onClose, menuName }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            {/* Top Pattern */}
            <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-50 to-transparent dark:from-blue-900/20 pointer-events-none" />
            
            <div className="p-8 flex flex-col items-center text-center relative z-10">
              <div className="w-20 h-20 bg-blue-600 rounded-[30px] flex items-center justify-center shadow-xl shadow-blue-500/30 mb-6 animate-bounce-slow">
                <Clock className="text-white" size={36} />
              </div>
              
              <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-tight mb-3">
                কাজ চলমান আছে
              </h3>
              
              <div className="space-y-4 mb-8">
                <p className="text-slate-500 dark:text-slate-400 font-bold text-sm leading-relaxed">
                  প্রিয় ইউজার, <span className="text-blue-600 dark:text-blue-400">"{menuName}"</span> ফিচারটির আপডেট করার কাজ চলমান, খুব তাড়াতাড়ি এটা পাবলিশ করা হবে।
                </p>
                
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <ShieldAlert size={14} className="text-amber-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Under Maintenance</span>
                </div>
              </div>
              
              <div className="w-full space-y-3">
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all"
                >
                  ঠিক আছে
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full py-3 text-slate-400 dark:text-slate-500 font-bold text-[12px] uppercase tracking-widest hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
            
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-500 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MenuAccessNotice;
