
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, 
  HeartPulse, 
  Stethoscope, 
  PhoneCall, 
  MapPin, 
  Search, 
  Building2, 
  Truck, 
  Droplets, 
  Pill, 
  Microscope, 
  Activity,
  ArrowRight,
  Hospital,
  Info,
  User,
  Clock,
  X
} from 'lucide-react';
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { medicalDb } from '../Firebase-medical';
import PublicBloodBank from './medical/PublicBloodBank';
import PublicAmbulance from './medical/PublicAmbulance';
import PublicHospital from './medical/PublicHospital';

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

const MEDICAL_SUBMENUS = [
  { id: 'blood', name: 'ব্লাড ব্যাংক', icon: Droplets, color: '#EF4444' },
  { id: 'amb', name: 'অ্যাম্বুলেন্স সেবা', icon: Truck, color: '#F59E0B' },
  { id: 'hosp', name: 'হাসপাতাল ও ক্লিনিক', icon: Hospital, color: '#3B82F6' },
  { id: 'diag', name: 'ডায়াগনস্টিক সেন্টার', icon: Microscope, color: '#8B5CF6' },
  { id: 'doc', name: 'ডাক্তার খুঁজুন', icon: Stethoscope, color: '#E91E63' },
  { id: 'tips', name: 'হেলথ টিপস', icon: Activity, color: '#EC4899' },
  { id: 'pharma', name: 'অনলাইন ফার্মেসি', icon: Pill, color: '#10B981' },
];

export default function PublicMedical({ onBack, checkAccess, onCategoryChange }: { 
  onBack: () => void; 
  checkAccess?: (id: string, name: string) => boolean;
  onCategoryChange?: (category: string | null) => void;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewingItem, setViewingItem] = useState<any | null>(null);

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategory);
    }
  }, [selectedCategory, onCategoryChange]);

  // Reset expanded items ONLY when category ID actually changes
  useEffect(() => {
    setExpandedItems({});
  }, [selectedCategory]);

  const CARD_COLORS = [
    { border: 'border-blue-200', bg: 'bg-blue-50/30' },
    { border: 'border-rose-200', bg: 'bg-rose-50/30' },
    { border: 'border-emerald-200', bg: 'bg-emerald-50/30' },
    { border: 'border-amber-200', bg: 'bg-amber-50/30' },
    { border: 'border-violet-200', bg: 'bg-violet-50/30' },
    { border: 'border-orange-200', bg: 'bg-orange-50/30' },
    { border: 'border-cyan-200', bg: 'bg-cyan-50/30' },
  ];

  useEffect(() => {
    if (!selectedCategory) {
      setItems([]);
      return;
    }

    setIsLoading(true);

    if (selectedCategory === 'doc') {
      // Special handling for Doctor Finder: Combine direct doctors and hospital doctors
      const docRef = collection(medicalDb, `চিকিৎসা সেবা/doc/items`);
      const hospRef = collection(medicalDb, `চিকিৎসা সেবা/hosp/items`);
      
      let directDocs: any[] = [];
      let hospitalDocs: any[] = [];

      const updateCombinedItems = () => {
        setItems([...directDocs, ...hospitalDocs]);
        setIsLoading(false);
      };

      const unsubDoc = onSnapshot(docRef, (snapshot) => {
        directDocs = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
        updateCombinedItems();
      }, (err) => {
        console.error("Error fetching direct doctors:", err);
        setIsLoading(false);
      });

      const unsubHosp = onSnapshot(hospRef, (snapshot) => {
        const hDocs: any[] = [];
        snapshot.docs.forEach(hDoc => {
          const hospital = hDoc.data();
          if (hospital.doctors && Array.isArray(hospital.doctors)) {
            hospital.doctors.forEach((doc: any, idx: number) => {
              // Get primary mobile from hospital
              let primaryMobile = hospital.mobile || '';
              if (hospital.mobiles && hospital.mobiles.length > 0) {
                const m = hospital.mobiles[0];
                primaryMobile = typeof m === 'string' ? m : m.number;
              }

              hDocs.push({
                id: `hosp_doc_${hDoc.id}_${idx}`,
                name: doc.name,
                specialist: doc.specialist,
                degree: doc.degree,
                location: `${hospital.name} (${hospital.location || ''})`, // Hospital Name (Address)
                mobile: primaryMobile, // Use hospital contact
                desc: doc.schedule, // Detailed info shows schedule as requested
                photo: doc.photo || null,
                isFromHospital: true,
                hospitalName: hospital.name
              });
            });
          }
        });
        hospitalDocs = hDocs;
        updateCombinedItems();
      }, (err) => {
        console.error("Error fetching hospital doctors:", err);
        setIsLoading(false);
      });

      return () => {
        unsubDoc();
        unsubHosp();
      };
    } else {
      // Standard handling for other categories
      const medRef = collection(medicalDb, `চিকিৎসা সেবা/${selectedCategory}/items`);
      const unsubscribe = onSnapshot(medRef, (snapshot) => {
        const list = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        }));
        setItems(list);
        setIsLoading(false);
      }, (err) => {
        console.error("Error fetching medical items:", err);
        setIsLoading(false);
      });

      return () => {
        unsubscribe();
      };
    }
  }, [selectedCategory]);

  const filteredItems = useMemo(() => {
    let list = items;
    const term = searchTerm.toLowerCase();
    list = list.filter(item => 
      (item.name || '').toLowerCase().includes(term) || 
      (item.specialist || '').toLowerCase().includes(term) ||
      (item.location || '').toLowerCase().includes(term)
    );
    return list;
  }, [items, searchTerm]);

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      setSearchTerm('');
    } else {
      onBack();
    }
  };

  useEffect(() => {
    const handleGlobalBack = (e: Event) => {
      if (e.defaultPrevented) return;
      if (selectedCategory) {
        e.preventDefault();
        handleBack();
      }
    };
    window.addEventListener('global-back-request', handleGlobalBack);
    return () => window.removeEventListener('global-back-request', handleGlobalBack);
  }, [selectedCategory]);

  const getActiveMenu = () => MEDICAL_SUBMENUS.find(m => m.id === selectedCategory);

  if (selectedCategory === 'blood') {
    return <PublicBloodBank onBack={handleBack} />;
  }

  if (selectedCategory === 'amb') {
    return <PublicAmbulance onBack={handleBack} />;
  }

  if (selectedCategory === 'hosp') {
    return <PublicHospital onBack={handleBack} />;
  }

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500 p-5 bg-white">
      <header className={`flex ${selectedCategory === 'doc' ? 'flex-col items-center justify-center' : 'items-center gap-4'} mb-6 shrink-0 relative`}>
        <button onClick={handleBack} className={`p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90 ${selectedCategory === 'doc' ? 'absolute left-0' : ''}`}>
          <ChevronLeft size={24} />
        </button>
        <div className={`${selectedCategory === 'doc' ? 'text-center' : 'text-left'} overflow-hidden`}>
          <h2 className="text-xl font-black text-slate-800 leading-tight truncate">
            {getActiveMenu()?.name || 'চিকিৎসা সেবা'}
          </h2>
          <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${selectedCategory === 'doc' ? 'text-blue-600' : 'text-slate-400'}`}>
            {selectedCategory === 'doc' ? 'কয়রা-পাইকগাছা কমিউনিটি অ্যাপ' : 'বিস্তারিত তথ্য তালিকা'}
          </p>
        </div>
      </header>

      {!selectedCategory ? (
        <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
          <div className="grid grid-cols-1 gap-3 animate-in slide-in-from-bottom-4 duration-500">
            {MEDICAL_SUBMENUS.map((menu) => {
              const Icon = menu.icon;
              return (
                <button 
                  key={menu.id}
                  onClick={() => setSelectedCategory(menu.id)}
                  className="flex items-center justify-between p-5 bg-white rounded-[28px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group overflow-hidden relative"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300"
                      style={{ backgroundColor: `${menu.color}15`, color: menu.color }}
                    >
                      <Icon size={26} strokeWidth={2.5} />
                    </div>
                    <span className="font-black text-lg text-slate-800">{menu.name}</span>
                  </div>
                  <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-500 transition-colors z-10" />
                </button>
              );
            })}
          </div>
          
          <div className="mt-8 p-6 bg-rose-50/50 rounded-[35px] border border-rose-100 flex items-start gap-4 text-left">
             <div className="p-2 bg-white rounded-xl text-rose-500 shadow-sm"><HeartPulse size={20} /></div>
             <p className="text-xs font-bold text-rose-600/80 leading-relaxed">জরুরি অবস্থায় নিকটস্থ হাসপাতাল বা অ্যাম্বুলেন্স নাম্বারে সরাসরি কল দিন। আমরা তথ্যগুলো নিয়মিত আপডেট করার চেষ্টা করি।</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 animate-in slide-in-from-right-4 duration-500">
          <div className="relative mb-6 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              className={`w-full pl-12 pr-5 ${selectedCategory === 'doc' ? 'py-3' : 'py-4'} bg-slate-50 border border-slate-100 rounded-[22px] font-bold outline-none focus:border-blue-400 shadow-inner`} 
              placeholder={`${getActiveMenu()?.name} খুঁজুন...`} 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-40 px-1">
            {isLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
                    <Clock className="animate-spin text-blue-600" size={40} />
                    <p className="font-black text-[10px] uppercase tracking-widest">তথ্য লোড হচ্ছে...</p>
                </div>
            ) : filteredItems.length > 0 ? (
                filteredItems.map((item, idx) => {
                    const CategoryIcon = getActiveMenu()?.icon || User;
                    const cardStyle = CARD_COLORS[idx % CARD_COLORS.length];
                    
                    return (
                        <div 
                          key={item.id} 
                          className={`bg-white p-4 rounded-[30px] border ${cardStyle.border} shadow-lg shadow-slate-100/50 ${selectedCategory === 'doc' ? 'space-y-1.5' : 'space-y-2.5'} text-left animate-in slide-in-from-bottom-2 duration-500`} 
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            
                            <div className={`flex items-start ${selectedCategory === 'doc' ? 'gap-2' : 'gap-3'}`}>
                                <div className={`${selectedCategory === 'doc' ? 'w-12 h-12 rounded-[15px]' : 'w-14 h-14 rounded-[18px]'} ${cardStyle.bg} border ${cardStyle.border} overflow-hidden flex items-center justify-center shrink-0 shadow-sm`}>
                                    {item.photo ? (
                                        <img src={item.photo} className="w-full h-full object-cover" alt={item.name} />
                                    ) : (
                                        <CategoryIcon size={selectedCategory === 'doc' ? 24 : 28} style={{ color: cardStyle.border.replace('border-', '').replace('-200', '') }} />
                                    )}
                                </div>
                                <div className="flex-1 overflow-hidden pt-0">
                                    <h4 className={`${selectedCategory === 'doc' ? 'text-base' : 'text-lg'} font-black text-slate-800 leading-tight truncate`}>{item.name}</h4>
                                    {item.specialist && (
                                      <p className={`${selectedCategory === 'doc' ? 'text-[13px]' : 'text-sm'} font-bold text-blue-600 mt-0 truncate`}>{item.specialist}</p>
                                    )}
                                    {item.degree && (
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0 truncate">{item.degree}</p>
                                    )}
                                </div>
                            </div>

                            {item.location && (
                                <div className={`flex items-center gap-2 px-1 border-t border-slate-50 ${selectedCategory === 'doc' ? 'pt-1.5' : 'pt-2'}`}>
                                    <MapPin size={12} className="shrink-0 text-[#E91E63]" />
                                    <span className="text-[12px] font-bold text-slate-500 truncate leading-none">{item.location}</span>
                                </div>
                            )}

                            <div className="pt-0.5">
                                <a 
                                    href={`tel:${convertBnToEn(item.mobile)}`} 
                                    className="w-full py-3.5 bg-[#E91E63] text-white font-black rounded-[18px] flex items-center justify-center gap-3 shadow-xl shadow-rose-500/30 active:scale-95 transition-all text-[15px]"
                                >
                                    <PhoneCall size={18} /> সিরিয়ালের জন্য কল দিন
                                </a>

                                {item.desc && (
                                  <button 
                                    onClick={() => setExpandedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                                    className={`w-full mt-1.5 py-1.5 border ${cardStyle.border} rounded-xl text-[11px] font-black text-slate-500 flex items-center justify-center gap-2 active:scale-95 transition-all ${cardStyle.bg}`}
                                  >
                                    <Info size={14} /> {expandedItems[item.id] ? 'বিস্তারিত বন্ধ করুন' : 'বিস্তারিত তথ্য'}
                                  </button>
                                )}
                            </div>

                            {item.desc && expandedItems[item.id] && (
                              <div className={`mt-1.5 p-3 ${cardStyle.bg} rounded-2xl border ${cardStyle.border} animate-in slide-in-from-top-2 duration-300`}>
                                <p className="text-[11px] font-bold text-slate-700 leading-relaxed whitespace-pre-line">
                                  {item.desc}
                                </p>
                              </div>
                            )}
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
        </div>
      )}

      {/* Blood Bank Detail Full Screen View */}
      {viewingItem && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col animate-in slide-in-from-bottom duration-500">
          {/* Header Section with Light Red Background Bar */}
          <div className="bg-rose-50/40 border-b border-rose-100/50 pb-2 shrink-0">
            <div className="px-6 pt-4 text-center">
              <p className="text-[10px] font-bold text-blue-600 tracking-wide">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</p>
            </div>
            <div className="px-6 pt-0.5 pb-0 flex items-center justify-between">
              <div className="w-10"></div> {/* Symmetry spacer */}
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

            {/* Address and Established (Closer to name) */}
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

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
            {/* Slim Contact List */}
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

          {/* Bottom Back Button */}
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
