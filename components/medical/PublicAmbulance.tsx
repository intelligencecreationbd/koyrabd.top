
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  PhoneCall, 
  Clock, 
  Info,
  ChevronLeft,
  Truck,
  Building2
} from 'lucide-react';
import { 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { medicalDb } from '../../Firebase-medical';

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

interface PublicAmbulanceProps {
  onBack: () => void;
}

export default function PublicAmbulance({ onBack }: PublicAmbulanceProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    const medRef = collection(medicalDb, `চিকিৎসা সেবা/amb/items`);
    const unsubscribe = onSnapshot(medRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setItems(list);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleGlobalBack = (e: Event) => {
      if (selectedLocation) {
        e.preventDefault();
        setSelectedLocation(null);
      }
    };
    window.addEventListener('global-back-request', handleGlobalBack);
    return () => window.removeEventListener('global-back-request', handleGlobalBack);
  }, [selectedLocation]);

  const filteredItems = useMemo(() => {
    let list = items;
    if (selectedLocation) {
      list = list.filter(item => (item.upazila || '').includes(selectedLocation));
    }
    return list;
  }, [items, selectedLocation]);

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500 p-4 pt-6 bg-blue-50/30">
      <header className="mb-4 shrink-0 text-center relative py-4 rounded-[22px] overflow-hidden border border-blue-100 shadow-sm bg-blue-50">
        <h2 className="text-xl font-black text-slate-800 leading-tight">এ্যাম্বুলেন্স সেবা</h2>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</p>
      </header>

      <div className="space-y-3 mb-5 shrink-0">
        <div className="grid grid-cols-2 gap-2.5">
          <button 
            onClick={() => { setSelectedLocation(selectedLocation === 'কয়রা' ? null : 'কয়রা'); }}
            className={`py-2.5 rounded-[18px] font-black text-[12px] transition-all shadow-md border flex flex-col items-center justify-center gap-1 ${selectedLocation === 'কয়রা' ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-blue-100' : 'bg-white text-slate-600 border-slate-100'}`}
          >
            <MapPin size={14} />
            <span>কয়রা উপজেলা</span>
          </button>
          <button 
            onClick={() => { setSelectedLocation(selectedLocation === 'পাইকগাছা' ? null : 'পাইকগাছা'); }}
            className={`py-2.5 rounded-[18px] font-black text-[12px] transition-all shadow-md border flex flex-col items-center justify-center gap-1 ${selectedLocation === 'পাইকগাছা' ? 'bg-[#0056b3] text-white border-[#0056b3] shadow-blue-100' : 'bg-white text-slate-600 border-slate-100'}`}
          >
            <MapPin size={14} />
            <span>পাইকগাছা উপজেলা</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pb-32 px-0.5">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
            <Clock className="animate-spin text-blue-600" size={32} />
            <p className="font-black text-[9px] uppercase tracking-widest">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => (
            <div 
              key={item.id} 
              className="bg-white p-4 rounded-[22px] border border-slate-100 shadow-lg shadow-slate-100/30 space-y-3 text-center animate-in slide-in-from-bottom-2 duration-500" 
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col items-center space-y-1.5">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center shrink-0 shadow-sm mb-1">
                  <Truck size={20} />
                </div>
                <h4 className="font-black text-slate-800 text-[15px] leading-tight px-2">{item.name}</h4>
                <div className="flex items-center justify-center gap-1 text-slate-500">
                  <MapPin size={10} className="text-rose-500" />
                  <span className="text-[11px] font-bold">{item.location}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {(item.mobiles && item.mobiles.length > 0 ? item.mobiles : [item.mobile]).map((num: string, nIdx: number) => (
                  num && (
                    <a 
                      key={nIdx}
                      href={`tel:${convertBnToEn(num)}`}
                      className="w-full py-2.5 bg-amber-500 text-white font-black rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all text-[13px]"
                    >
                      <PhoneCall size={14} /> {item.mobiles && item.mobiles.length > 1 ? `কল করুন (${nIdx + 1})` : 'কল করুন'}
                    </a>
                  )
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
              <Info size={40} />
            </div>
            <div className="px-10">
              <p className="font-black text-slate-800">কোনো তথ্য পাওয়া যায়নি</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">খুব শীঘ্রই তথ্য যুক্ত করা হবে</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
