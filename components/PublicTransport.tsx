
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  ArrowRight, 
  Bus, 
  PhoneCall, 
  MapPin, 
  Navigation,
  Search,
  X
} from 'lucide-react';
import { BusCounter } from '../types';
import { collection, onSnapshot } from 'firebase/firestore';
import { busDb } from '../Firebase-bus';

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

const toBn = (num: string | number | undefined | null) => {
  if (num === undefined || num === null) return '';
  return num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
};

const formatWhatsAppNumber = (num: string) => {
  const enNum = convertBnToEn(num || '');
  const cleaned = enNum.replace(/\D/g, '');
  if (cleaned.startsWith('0')) return `88${cleaned}`;
  return cleaned;
};

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 0 5.414 0 12.05c0 2.123.552 4.197 1.6 6.02L0 24l6.142-1.61A11.815 11.815 0 0012.05 24.1c6.632 0 12.05-5.417 12.05-12.05 0-3.212-1.25-6.232-3.518-8.513z"/>
  </svg>
);

const THEME_COLORS = [
  '#4F46E5', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1',
];

const PublicTransport: React.FC<{ 
  subId?: string; 
  busId?: string; 
  onNavigate: (path: string) => void;
  onBack: () => void;
}> = ({ subId, busId, onNavigate, onBack }) => {
  const [busData, setBusData] = useState<BusCounter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showRoutePicker, setShowRoutePicker] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const busCollection = collection(busDb, 'বাস');
    const unsubscribe = onSnapshot(busCollection, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as BusCounter[];
      setBusData(list);
      setIsLoading(false);
    }, (error) => {
      console.error("Firestore error:", error);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const uniqueRoutes = useMemo(() => {
    const allRoutes = new Set<string>();
    busData.forEach(b => {
      if (b.route) allRoutes.add(b.route.trim());
      if (b.routes) b.routes.forEach(r => { if (r) allRoutes.add(r.trim()); });
    });
    // Sort alphabetically to ensure consistent color mapping regardless of data order
    return Array.from(allRoutes).sort().map(r => ({ id: r, name: r }));
  }, [busData]);

  const routeColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    uniqueRoutes.forEach((route, idx) => {
      map[route.name] = THEME_COLORS[idx % THEME_COLORS.length];
    });
    return map;
  }, [uniqueRoutes]);

  const currentBus = useMemo(() => busData.find(b => b.id === (busId || subId)), [busData, subId, busId]);
  const isViewingDetails = !!currentBus && (!!busId || (subId && busData.some(b => b.id === subId)));

  const filteredBuses = useMemo(() => {
    if (!selectedRoute) return busData;
    return busData.filter(b => b.route === selectedRoute || (b.routes && b.routes.includes(selectedRoute)));
  }, [busData, selectedRoute]);

  const allRoutes = useMemo(() => {
    if (!currentBus) return [];
    return [currentBus.route, ...(currentBus.routes || [])].filter(Boolean);
  }, [currentBus]);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] animate-in fade-in duration-500 relative">
      <header className="flex items-center justify-between mb-6 shrink-0 px-5">
        <div className="w-10" /> {/* Spacer for balance */}
        <div className="flex-1 text-center overflow-hidden">
          <h2 className="text-2xl font-black text-slate-800 leading-tight truncate">
            {!isViewingDetails ? 'বাস' : currentBus?.busName}
          </h2>
          {!isViewingDetails ? (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              {selectedRoute ? selectedRoute : 'বাস সার্ভিসের তালিকা'}
            </p>
          ) : (
            <div className="mt-1 flex flex-col items-center">
              <div className="flex flex-col items-center gap-0.5">
                {allRoutes.map((r, i) => (
                  <p 
                    key={i} 
                    className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: routeColorMap[r.trim()] || '#2563eb' }}
                  >
                    {r}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {!isViewingDetails ? (
          <button 
            onClick={() => setShowRoutePicker(true)}
            className="flex flex-col items-center justify-center p-2 bg-blue-50 text-blue-600 rounded-xl active:scale-90 transition-all border border-blue-100"
          >
            <Search size={16} strokeWidth={3} />
            <span className="text-[8px] font-black uppercase mt-0.5">রুট</span>
          </button>
        ) : <div className="w-10" />}
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 space-y-4 px-5">
        {!isViewingDetails ? (
          <div className="grid gap-4">
            {filteredBuses.length > 0 ? filteredBuses.map((bus, index) => {
              const iconColor = THEME_COLORS[index % THEME_COLORS.length];
              const busRoutes = [bus.route, ...(bus.routes || [])].filter(Boolean);
              return (
                <button 
                   key={bus.id} 
                   onClick={() => onNavigate(`/category/3/${bus.id}`)} 
                   className="flex items-center justify-between p-5 bg-white rounded-[24px] premium-card active:scale-[0.98] transition-all group text-left border border-slate-50 overflow-hidden relative"
                >
                  <div className="flex items-center gap-4 flex-1 overflow-hidden relative z-10">
                    <div className="p-3 rounded-2xl transition-all shadow-inner group-hover:scale-110 duration-300" style={{ backgroundColor: `${iconColor}15`, color: iconColor, border: `1px solid ${iconColor}20` }}>
                      <Bus size={22} strokeWidth={2.5} />
                    </div>
                    <div className="overflow-hidden">
                        <h4 className="font-black text-lg text-[#1A1A1A] truncate leading-tight">{bus.busName}</h4>
                        <div className="flex flex-col gap-0.5 mt-1">
                          {busRoutes.map((r, i) => (
                            <p 
                              key={i} 
                              className="text-[10px] font-bold uppercase tracking-tighter leading-tight"
                              style={{ color: routeColorMap[r.trim()] || '#94a3b8' }}
                            >
                              {r}
                            </p>
                          ))}
                        </div>
                    </div>
                  </div>
                  <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600 transition-colors shrink-0 z-10" />
                </button>
              );
            }) : (
              <div className="py-20 text-center opacity-30">এই রুটে কোনো বাস পাওয়া যায়নি।</div>
            )}
          </div>
        ) : isViewingDetails && currentBus && (
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] pl-2 text-left">কাউন্টার লিস্ট</p>
              {currentBus.counters?.map((c, idx) => {
                const color = THEME_COLORS[idx % THEME_COLORS.length];
                return (
                  <div key={idx} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-sm flex items-center justify-between">
                    <div className="text-left flex items-center gap-4 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner" style={{ backgroundColor: `${color}10`, color: color, border: `1px solid ${color}15` }}><MapPin size={18} /></div>
                      <div className="overflow-hidden">
                        <p className="text-base font-black text-slate-800 leading-tight truncate">{c.name}</p>
                        <p className="text-xs font-bold text-slate-400 font-inter mt-1 tracking-tight">{convertBnToEn(c.mobile)}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <a href={`tel:${convertBnToEn(c.mobile)}`} className="p-3 bg-[#0056b3] text-white rounded-xl shadow-lg active:scale-90 transition-all"><PhoneCall size={18} /></a>
                      <a href={`https://wa.me/${formatWhatsAppNumber(c.mobile)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-[#25D366] text-white rounded-xl shadow-lg active:scale-90 transition-all"><WhatsAppIcon size={18} /></a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Route Picker Modal */}
      {showRoutePicker && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md p-6 flex items-center justify-center animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-xl text-slate-800">রুট নির্বাচন করুন</h3>
              <button onClick={() => setShowRoutePicker(false)} className="p-2 text-slate-400 hover:text-red-500 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="grid gap-3 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
              <button 
                onClick={() => { setSelectedRoute(null); setShowRoutePicker(false); }}
                className={`flex items-center justify-between p-4 rounded-2xl font-bold text-left transition-all ${!selectedRoute ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
              >
                <span>সকল রুট</span>
                {!selectedRoute && <ArrowRight size={18} />}
              </button>
              
              {uniqueRoutes.map((route, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setSelectedRoute(route.name); setShowRoutePicker(false); }}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold text-left transition-all ${selectedRoute === route.name ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                >
                  <span className="truncate pr-4">{route.name}</span>
                  {selectedRoute === route.name && <ArrowRight size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicTransport;
