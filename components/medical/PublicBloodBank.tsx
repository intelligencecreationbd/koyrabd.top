
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  PhoneCall, 
  User, 
  Clock, 
  X, 
  Info,
  ChevronLeft,
  Droplets
} from 'lucide-react';
import { 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import { medicalDb } from '../../Firebase-medical';

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

interface PublicBloodBankProps {
  onBack: () => void;
}

export default function PublicBloodBank({ onBack }: PublicBloodBankProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [donors, setDonors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const medRef = collection(medicalDb, `চিকিৎসা সেবা/blood/items`);
    const unsubscribe = onSnapshot(medRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setItems(list);
      setIsLoading(false);
    });

    const donorRef = collection(medicalDb, `চিকিৎসা সেবা/blood/donors`);
    const donorUnsubscribe = onSnapshot(donorRef, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      }));
      setDonors(list);
    });

    return () => {
      unsubscribe();
      donorUnsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleGlobalBack = (e: Event) => {
      if (viewingItem) {
        e.preventDefault();
        setViewingItem(null);
      } else if (selectedLocation || selectedBloodGroup) {
        e.preventDefault();
        setSelectedLocation(null);
        setSelectedBloodGroup(null);
      }
    };
    window.addEventListener('global-back-request', handleGlobalBack);
    return () => window.removeEventListener('global-back-request', handleGlobalBack);
  }, [viewingItem, selectedLocation, selectedBloodGroup]);

  const filteredItems = useMemo(() => {
    if (selectedLocation === 'donors') {
      let list = donors;
      if (selectedBloodGroup) {
        list = list.filter(d => d.bloodGroup === selectedBloodGroup);
      }
      return list;
    }

    let list = items;
    if (selectedLocation) {
      list = list.filter(item => (item.upazila || item.location || '').includes(selectedLocation));
    }
    return list;
  }, [items, donors, selectedLocation, selectedBloodGroup]);

  return (
    <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500 p-5 bg-white">
      <header className="mb-8 shrink-0 text-center">
        <h2 className="text-2xl font-black text-slate-800 leading-tight">ব্লাড ব্যাংক</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">কয়রা-পাইকগাছা কমিউনিটি এপস</p>
      </header>

      <div className="space-y-5 mb-8 shrink-0">
        <div className="grid grid-cols-3 gap-2">
          <button 
            onClick={() => { setSelectedLocation(selectedLocation === 'কয়রা' ? null : 'কয়রা'); setSelectedBloodGroup(null); }}
            className={`py-4 rounded-2xl font-black text-[10px] transition-all shadow-md border flex flex-col items-center justify-center gap-1 ${selectedLocation === 'কয়রা' ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' : 'bg-white text-slate-600 border-slate-100'}`}
          >
            <MapPin size={14} />
            <span>কয়রা উপজেলা</span>
          </button>
          <button 
            onClick={() => { setSelectedLocation(selectedLocation === 'পাইকগাছা' ? null : 'পাইকগাছা'); setSelectedBloodGroup(null); }}
            className={`py-4 rounded-2xl font-black text-[10px] transition-all shadow-md border flex flex-col items-center justify-center gap-1 ${selectedLocation === 'পাইকগাছা' ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200' : 'bg-white text-slate-600 border-slate-100'}`}
          >
            <MapPin size={14} />
            <span>পাইকগাছা উপজেলা</span>
          </button>
          <button 
            onClick={() => { setSelectedLocation(selectedLocation === 'donors' ? null : 'donors'); setSelectedBloodGroup(null); }}
            className={`py-4 rounded-2xl font-black text-[10px] transition-all shadow-md border flex flex-col items-center justify-center gap-1 ${selectedLocation === 'donors' ? 'bg-rose-600 text-white border-rose-600 shadow-rose-200' : 'bg-white text-slate-600 border-slate-100'}`}
          >
            <Droplets size={14} />
            <span>আরও ব্লাড ডোনার</span>
          </button>
        </div>

        {selectedLocation === 'donors' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">গ্রুপ নির্বাচন করুন</h4>
              {selectedBloodGroup && (
                <button onClick={() => setSelectedBloodGroup(null)} className="text-[9px] font-bold text-blue-600">সবগুলো দেখুন</button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
              {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedBloodGroup(selectedBloodGroup === group ? null : group)}
                  className={`px-4 py-2.5 rounded-xl text-[11px] font-black border transition-all shrink-0 ${selectedBloodGroup === group ? 'bg-rose-600 text-white border-rose-600 shadow-lg shadow-rose-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-40 px-1">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
            <Clock className="animate-spin text-blue-600" size={40} />
            <p className="font-black text-[10px] uppercase tracking-widest">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => {
            if (selectedLocation === 'donors') {
              return (
                <div key={item.id} className="bg-white p-4 rounded-[28px] border border-slate-100 shadow-md flex items-center justify-between animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-black text-xs border border-rose-100">
                      {item.bloodGroup}
                    </div>
                    <div className="overflow-hidden text-left">
                      <h4 className="font-black text-slate-800 text-sm truncate">{item.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">{item.address}</p>
                    </div>
                  </div>
                  <a 
                    href={`tel:${convertBnToEn(item.mobile)}`}
                    className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 active:scale-90 transition-all shrink-0"
                  >
                    <PhoneCall size={18} />
                  </a>
                </div>
              );
            }

            return (
              <div key={item.id} className="bg-white p-5 rounded-[35px] border border-slate-100 shadow-lg shadow-slate-100/50 space-y-4 text-left animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 50}ms` }}>
                <button 
                  onClick={() => setViewingItem(item)}
                  className="w-full text-left focus:outline-none group space-y-2"
                >
                  <h4 className="font-black text-slate-800 text-lg leading-tight group-hover:text-blue-600 transition-colors">{item.name}</h4>
                  {item.location && (
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin size={12} />
                      <span className="text-[11px] font-bold">{item.location}</span>
                    </div>
                  )}
                </button>
              </div>
            );
          })
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

      {/* Blood Bank Detail Full Screen View */}
      {viewingItem && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
          <div className="bg-rose-50/40 border-b border-rose-100/50 pb-2 shrink-0">
            <div className="px-6 pt-4 text-center">
              <p className="text-[10px] font-bold text-blue-600 tracking-wide">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</p>
            </div>
            <div className="px-6 pt-0.5 pb-0 flex items-center justify-between">
              <div className="w-10"></div>
              <h3 className="text-xl font-black text-rose-600 leading-tight text-center flex-1 truncate px-2">
                {viewingItem.name}
              </h3>
              <button 
                onClick={() => setViewingItem(null)}
                className="p-2 bg-white/80 text-slate-400 rounded-xl hover:bg-rose-50 hover:text-rose-500 transition-colors active:scale-90 shadow-sm border border-rose-100/50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-6 text-center -mt-1 space-y-0">
              <div className="flex items-center justify-center gap-1.5 text-blue-600 font-bold">
                <MapPin size={12} />
                <span className="text-[11px]">{viewingItem.location || 'ঠিকানা পাওয়া যায়নি'}</span>
              </div>

              {viewingItem.established && (
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-white/60 rounded-lg text-[9px] font-black text-slate-400 uppercase tracking-widest border border-rose-100/30">
                  স্থাপিত: {toBn(viewingItem.established)}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            <div className="px-5 pt-4 space-y-2.5">
              <div className="flex flex-col items-center mb-3">
                <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.25em] mb-2">ব্লাড ব্যাংকের সদস্য</h4>
                <div className="w-10 h-0.5 bg-blue-600/20 rounded-full"></div>
              </div>

              {viewingItem.contacts && Array.isArray(viewingItem.contacts) ? (
                viewingItem.contacts.map((contact: any, cIdx: number) => (
                  <div key={cIdx} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm hover:border-blue-100 transition-all">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 text-slate-300 border border-slate-50">
                        <User size={18} />
                      </div>
                      <div className="overflow-hidden py-0.5">
                        <p className="font-black text-slate-800 text-[13px] truncate leading-relaxed">{contact.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate mt-0.5">
                          {contact.designation} {contact.address && `• ${contact.address}`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2.5 shrink-0">
                      {contact.bloodGroup && (
                        <div className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black border border-rose-100">
                          {contact.bloodGroup}
                        </div>
                      )}
                      <a 
                        href={`tel:${convertBnToEn(contact.mobile)}`}
                        className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100 active:scale-90 transition-all"
                      >
                        <PhoneCall size={16} />
                      </a>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center opacity-20">
                  <Info size={40} className="mx-auto mb-2" />
                  <p className="text-xs font-bold uppercase tracking-widest">কোনো সদস্য নেই</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-50 shrink-0">
             <button 
              onClick={() => setViewingItem(null)}
              className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl active:scale-95 transition-all text-sm shadow-xl shadow-slate-200"
             >
              ফিরে যান
             </button>
          </div>
        </div>
      )}
    </div>
  );
}
