
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ShieldCheck, ShieldAlert, Check, X, LayoutGrid } from 'lucide-react';
import { ref, onValue, set } from 'firebase/database';
import { settingsDb } from '../Firebase-appsettings';
import { CATEGORIES } from '../constants';

interface AdminMenuAccessProps {
  onBack: () => void;
}

const Header: React.FC<{ title: string; onBack: () => void }> = ({ title, onBack }) => (
  <div className="flex flex-col items-center gap-3 mb-6 text-center relative">
    <button onClick={onBack} className="absolute left-0 top-0 p-2 bg-white rounded-lg shadow-sm border border-slate-100 active:scale-90 transition-all">
      <ChevronLeft size={18} className="text-slate-800" />
    </button>
    <h2 className="text-xl font-black text-slate-800 tracking-tight mt-1">{title}</h2>
  </div>
);

const AdminMenuAccess: React.FC<AdminMenuAccessProps> = ({ onBack }) => {
  const [accessStates, setAccessStates] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessRef = ref(settingsDb, 'menu_access');
    const unsubscribe = onValue(accessRef, (snapshot) => {
      const data = snapshot.val() || {};
      setAccessStates(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleAccess = async (menuId: string) => {
    const currentState = accessStates[menuId] !== false; // Default to true if undefined
    const newState = !currentState;
    
    try {
      await set(ref(settingsDb, `menu_access/${menuId}`), newState);
    } catch (error) {
      alert('একসেস আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
      <Header title="মেনু একসেস" onBack={onBack} />
      
      <div className="bg-white p-6 rounded-[35px] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
            <LayoutGrid size={28} />
          </div>
          <p className="text-sm font-bold text-slate-400 text-center px-4 leading-relaxed">
            এখান থেকে আপনি পাবলিক ইউজারদের জন্য নির্দিষ্ট মেনু বা ফিচার অন/অফ করতে পারবেন।
          </p>
        </div>

        <div className="space-y-2">
          {CATEGORIES.map((menu) => {
            const isActive = accessStates[menu.id] !== false;
            return (
              <div 
                key={menu.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-[24px] border border-slate-100 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-500'}`}>
                    {isActive ? <ShieldCheck size={18} /> : <ShieldAlert size={18} />}
                  </div>
                  <span className="font-bold text-slate-700 text-sm">{menu.name}</span>
                </div>
                
                <button 
                  onClick={() => toggleAccess(menu.id)}
                  className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none ${isActive ? 'bg-blue-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminMenuAccess;
