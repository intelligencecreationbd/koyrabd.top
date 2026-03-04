
import React from 'react';
import { 
  User, 
  Smartphone, 
  PhoneCall, 
  CheckCircle2,
  ChevronRight,
  UserCircle
} from 'lucide-react';

const toBn = (num: string | number | undefined | null) => {
  const val = num ?? '';
  return val.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);
};

const convertBnToEn = (str: string) => {
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return (str || '').toString().split('').map(c => bn.indexOf(c) !== -1 ? en[bn.indexOf(c)] : c).join('');
};

interface Contact {
  id: string;
  name: string;
  designation: string;
  mobile: string;
  politicalIdentity?: string;
  photo?: string;
}

interface ComboPageViewProps {
  title: string;
  contacts: Contact[];
  onOpenProfile: (contact: Contact) => void;
}

const ContactCard: React.FC<{ contact: Contact; onClick: () => void }> = ({ contact, onClick }) => (
  <div 
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-white rounded-[28px] border border-slate-100 shadow-sm active:scale-[0.98] transition-all group text-left cursor-pointer"
  >
    <div className="flex items-center gap-3 overflow-hidden">
      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
        {contact.photo ? (
          <img src={contact.photo} className="w-full h-full object-cover" alt="" />
        ) : (
          <UserCircle size={28} className="text-slate-200" />
        )}
      </div>
      <div className="overflow-hidden">
        <h4 className="font-black text-slate-800 truncate text-sm leading-tight">{contact.name}</h4>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest truncate">{contact.designation}</p>
          {contact.politicalIdentity && (
            <span className="text-[9px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">{contact.politicalIdentity}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Smartphone size={10} className="text-slate-300" />
          <span className="text-[10px] font-black text-slate-400 font-inter">{contact.mobile}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2 shrink-0">
        <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            className="px-3 py-2 bg-slate-50 text-blue-600 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-all border border-blue-100 shadow-sm"
        >
            Details
        </button>
        <ChevronRight size={18} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
    </div>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 px-2">
      <div className="h-[1px] flex-1 bg-slate-100"></div>
      <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</h3>
      <div className="h-[1px] flex-1 bg-slate-100"></div>
    </div>
    <div className="grid grid-cols-1 gap-3">
      {children}
    </div>
  </div>
);

const ComboPageView: React.FC<ComboPageViewProps> = ({ title, contacts, onOpenProfile }) => {
  const getContactsByDesignation = (designation: string) => {
    return contacts.filter(c => c.designation === designation);
  };

  const sections = [
    {
      title: 'জনপ্রতিনিধি',
      fields: [
        'চেয়ারম্যান',
        'মেম্বার ১নং ওয়ার্ড', 'মেম্বার ২নং ওয়ার্ড', 'মেম্বার ৩নং ওয়ার্ড',
        'মেম্বার ৪নং ওয়ার্ড', 'মেম্বার ৫নং ওয়ার্ড', 'মেম্বার ৬নং ওয়ার্ড',
        'মেম্বার ৭নং ওয়ার্ড', 'মেম্বার ৮নং ওয়ার্ড', 'মেম্বার ৯নং ওয়ার্ড',
        'সংরক্ষিত মহিলা আসন (১,২ এবং ৩ নং ওয়ার্ড)',
        'সংরক্ষিত মহিলা আসন (৪,৫ এবং ৬ নং ওয়ার্ড)',
        'সংরক্ষিত মহিলা আসন (৭,৮ এবং ৯ নং ওয়ার্ড)'
      ]
    },
    {
      title: 'অফিসিয়াল জরুরি তথ্য',
      fields: ['সচিব', 'হিসাব সহকারী কাম কম্পিউটার অপারেটর']
    },
    {
      title: 'গ্রাম পুলিশ',
      fields: [
        'দফাদার',
        'চৌকিদার ১নং ওয়ার্ড', 'চৌকিদার ২নং ওয়ার্ড', 'চৌকিদার ৩নং ওয়ার্ড',
        'চৌকিদার ৪নং ওয়ার্ড', 'চৌকিদার ৫নং ওয়ার্ড', 'চৌকিদার ৬নং ওয়ার্ড',
        'চৌকিদার ৭নং ওয়ার্ড', 'চৌকিদার ৮নং ওয়ার্ড', 'চৌকিদার ৯নং ওয়ার্ড'
      ]
    }
  ];

  return (
    <div className="animate-in fade-in duration-700 space-y-8 px-1 pb-20">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2">
          <CheckCircle2 size={24} />
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{title}</h2>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">সকল তথ্য এক নজরে</p>
      </div>

      {sections.map((section, idx) => {
        const sectionContacts = section.fields.flatMap(field => getContactsByDesignation(field));
        if (sectionContacts.length === 0) return null;

        return (
          <Section key={idx} title={section.title}>
            {section.fields.map(field => {
              const fieldContacts = getContactsByDesignation(field);
              return fieldContacts.map(contact => (
                <ContactCard 
                  key={contact.id} 
                  contact={contact} 
                  onClick={() => onOpenProfile(contact)} 
                />
              ));
            })}
          </Section>
        );
      })}

      {contacts.length === 0 && (
        <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
          <User size={48} className="text-slate-300" />
          <p className="font-bold text-slate-400">এই পেইজে এখনো কোনো তথ্য যোগ করা হয়নি</p>
        </div>
      )}
    </div>
  );
};

export default ComboPageView;
