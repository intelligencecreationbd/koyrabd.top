
import React, { useState, useEffect, useMemo } from 'react';
import { 
  MapPin, 
  PhoneCall, 
  Clock, 
  Info,
  Hospital,
  Building2,
  Tag,
  Eye,
  X,
  Mail,
  MessageCircle,
  ChevronLeft
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

interface PublicHospitalProps {
  onBack: () => void;
}

export default function PublicHospital({ onBack }: PublicHospitalProps) {
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const medRef = collection(medicalDb, `চিকিৎসা সেবা/hosp/items`);
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
      if (viewingItem) {
        e.preventDefault();
        setViewingItem(null);
      } else if (selectedLocation) {
        e.preventDefault();
        setSelectedLocation(null);
      }
    };
    window.addEventListener('global-back-request', handleGlobalBack);
    return () => window.removeEventListener('global-back-request', handleGlobalBack);
  }, [selectedLocation, viewingItem]);

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
        <h2 className="text-xl font-black text-slate-800 leading-tight">হাসপাতাল ও ক্লিনিক</h2>
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

      <div className="flex-1 overflow-y-auto no-scrollbar space-y-2.5 pb-32 px-0.5">
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
            <Clock className="animate-spin text-blue-600" size={32} />
            <p className="font-black text-[9px] uppercase tracking-widest">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          filteredItems.map((item, idx) => (
            <div 
              key={item.id} 
              onClick={() => setViewingItem(item)}
              className="bg-white p-3 rounded-[20px] border border-slate-100 shadow-sm flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-500 active:scale-[0.98] transition-all" 
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 shadow-sm">
                <Hospital size={24} />
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <h4 className="font-black text-slate-800 text-[14px] leading-tight truncate">{item.name}</h4>
                <div className="flex flex-col gap-0.5 mt-1">
                  {item.specialist && (
                    <div className="flex items-center gap-1 text-blue-600/80">
                      <Tag size={9} />
                      <span className="text-[10px] font-bold truncate">{item.specialist}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1 text-slate-400">
                    <MapPin size={9} className="text-rose-400" />
                    <span className="text-[10px] font-bold truncate">{item.location}</span>
                  </div>
                </div>
              </div>

              <div className="w-11 h-11 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 shadow-sm">
                <Eye size={20} />
              </div>
            </div>
          ))
        ) : (
          <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 border border-slate-100">
              <Hospital size={40} />
            </div>
            <div className="px-10">
              <p className="font-black text-slate-800">কোনো তথ্য পাওয়া যায়নি</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">খুব শীঘ্রই তথ্য যুক্ত করা হবে</p>
            </div>
          </div>
        )}
      </div>

      {/* Hospital Detail Popup */}
      {viewingItem && (
        <div className="fixed inset-0 z-[200] bg-slate-50 flex flex-col animate-in fade-in duration-200">
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {/* Main Info Card (Matching the screenshot's top card style) */}
            <div className="bg-blue-500 border border-blue-400 rounded-[28px] p-6 shadow-lg">
              <h2 className="text-lg font-black text-black mb-4 text-center leading-tight px-2">
                {viewingItem.name}
              </h2>
              
              <div className="flex flex-col items-center">
                <div className="inline-flex flex-col items-start gap-2.5 text-blue-50 font-bold text-[13px]">
                  <div className="flex items-start gap-2.5">
                    <Tag size={16} className="text-white shrink-0 mt-0.5" />
                    <span className="leading-tight">{viewingItem.specialist}</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-white shrink-0 mt-0.5" />
                    <span className="leading-tight">{viewingItem.location}</span>
                  </div>
                  {viewingItem.email && (
                    <div className="flex items-start gap-2.5">
                      <Mail size={16} className="text-white shrink-0 mt-0.5" />
                      <span className="leading-tight break-all">{viewingItem.email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section Header (Matching the Upazila buttons area style) */}
            <div className="flex justify-center">
              <div className="bg-white border border-slate-100 rounded-xl px-8 py-2 shadow-sm flex items-center gap-2">
                <PhoneCall size={16} className="text-blue-600" />
                <span className="font-black text-slate-700 text-sm">যোগাযোগ</span>
              </div>
            </div>

            {/* Contact Numbers List (Matching the hospital list items style) */}
            <div className="space-y-2">
              {(viewingItem.mobiles && viewingItem.mobiles.length > 0 ? viewingItem.mobiles : [{ number: viewingItem.mobile, title: 'যোগাযোগ' }]).map((m: any, nIdx: number) => {
                const num = typeof m === 'string' ? m : m.number;
                const title = typeof m === 'object' ? m.title : 'যোগাযোগ';
                
                return num && (
                  <div key={nIdx} className="bg-white p-3 rounded-[20px] border border-slate-100 flex items-center gap-3 shadow-sm">
                    {/* Icon Section */}
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                      <Hospital size={24} />
                    </div>

                    {/* Text Section */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-slate-800 text-sm truncate mb-0.5">{title}</h4>
                      <div className="flex items-center gap-1.5 text-slate-500 text-xs font-bold">
                        <PhoneCall size={10} className="text-blue-500" />
                        <span>{num}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 shrink-0">
                      <a 
                        href={`tel:${convertBnToEn(num)}`}
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 active:scale-90 transition-all hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200"
                      >
                        <PhoneCall size={18} />
                      </a>
                      <a 
                        href={`https://wa.me/${convertBnToEn(num).replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 active:scale-90 transition-all hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200"
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.396.015 12.032c0 2.123.543 4.195 1.574 6.039L0 24l6.105-1.602a11.834 11.834 0 005.937 1.598h.005c6.637 0 12.032-5.395 12.035-12.032a11.762 11.762 0 00-3.48-8.504" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Specialist Section Header */}
            {viewingItem.doctors && viewingItem.doctors.length > 0 && (
              <>
                <div className="flex justify-center pt-2">
                  <div className="bg-white border border-slate-100 rounded-xl px-8 py-2 shadow-sm flex items-center gap-2">
                    <Tag size={16} className="text-blue-600" />
                    <span className="font-black text-slate-700 text-sm">বিশেষজ্ঞ</span>
                  </div>
                </div>

                {/* Specialist Doctors List */}
                <div className="space-y-2">
                  {viewingItem.doctors.map((doc: any, dIdx: number) => (
                    doc.name && (
                      <div key={dIdx} className="bg-white p-3 rounded-[20px] border border-slate-100 flex items-center gap-3 shadow-sm">
                        {/* Icon Section */}
                        <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0 border border-blue-100">
                          <Hospital size={24} />
                        </div>

                        {/* Text Section */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-black text-slate-800 text-sm truncate mb-0.5">{doc.name}</h4>
                          <div className="space-y-0.5">
                            {doc.specialist && (
                              <div className="flex items-center gap-1.5 text-blue-600 text-[10px] font-bold">
                                <Tag size={10} />
                                <span>{doc.specialist}</span>
                              </div>
                            )}
                            {doc.degree && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                                <Info size={10} className="text-slate-400" />
                                <span>{doc.degree}</span>
                              </div>
                            )}
                            {doc.schedule && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                                <Clock size={10} className="text-slate-400" />
                                <span>{doc.schedule}</span>
                              </div>
                            )}
                            {doc.workingAt && (
                              <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold">
                                <Building2 size={10} className="text-slate-400" />
                                <span>{doc.workingAt}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </>
            )}

            {/* Description Section */}
            {viewingItem.desc && (
              <div className="bg-blue-50 p-4 rounded-[24px] border border-blue-100 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Info size={16} className="text-blue-600" />
                  <h4 className="font-black text-slate-800 text-sm">বিস্তারিত তথ্য</h4>
                </div>
                <p className="text-slate-600 font-bold text-xs leading-relaxed italic">
                  {viewingItem.desc}
                </p>
              </div>
            )}
          </div>

          {/* Footer with Back Button */}
          <div className="p-4 bg-white border-t border-slate-100 flex justify-center sticky bottom-0">
            <button 
              onClick={() => setViewingItem(null)}
              className="px-8 py-2 bg-blue-600 text-white font-black rounded-full shadow-lg shadow-blue-600/30 active:scale-95 transition-all text-sm uppercase tracking-widest"
            >
              BACK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
