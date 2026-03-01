import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Moon as MoonIcon, Sun as SunIcon } from 'lucide-react';

const DateTimeBox: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Function to convert numbers to Bengali digits
  const toBn = (num: number | string) => 
    num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

  const getBnDay = (date: Date) => {
    const days = ["রবিবার", "সোমবার", "মঙ্গলবার", "বুধবার", "বৃহস্পতিবার", "শুক্রবার", "শনিবার"];
    return days[date.getDay()];
  };

  const getBnMonth = (date: Date) => {
    const months = ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"];
    return months[date.getMonth()];
  };

  const getBnDate = (date: Date) => {
    // Basic Bengali Date calculation (simplified for Bangladesh)
    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();
    
    let bnDay, bnMonth, bnYear;
    
    bnYear = month < 3 || (month === 3 && day < 14) ? year - 594 : year - 593;
    
    const bnMonths = ["বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ", "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ", "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"];
    
    const dayOfYear = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000);
    const bnStartDay = 104; 
    let diff = dayOfYear - bnStartDay;
    if (diff < 0) diff += 365;
    
    if (diff < 31) { bnMonth = bnMonths[0]; bnDay = diff + 1; }
    else if (diff < 62) { bnMonth = bnMonths[1]; bnDay = diff - 31 + 1; }
    else if (diff < 93) { bnMonth = bnMonths[2]; bnDay = diff - 62 + 1; }
    else if (diff < 124) { bnMonth = bnMonths[3]; bnDay = diff - 93 + 1; }
    else if (diff < 155) { bnMonth = bnMonths[4]; bnDay = diff - 124 + 1; }
    else if (diff < 186) { bnMonth = bnMonths[5]; bnDay = diff - 155 + 1; }
    else if (diff < 216) { bnMonth = bnMonths[6]; bnDay = diff - 186 + 1; }
    else if (diff < 246) { bnMonth = bnMonths[7]; bnDay = diff - 216 + 1; }
    else if (diff < 276) { bnMonth = bnMonths[8]; bnDay = diff - 246 + 1; }
    else if (diff < 306) { bnMonth = bnMonths[9]; bnDay = diff - 276 + 1; }
    else if (diff < 336) { bnMonth = bnMonths[10]; bnDay = diff - 306 + 1; }
    else { bnMonth = bnMonths[11]; bnDay = diff - 336 + 1; }

    return `${toBn(bnDay)} ${bnMonth} ${toBn(bnYear)} বাংলা`;
  };

  const getHijriDate = (date: Date) => {
    // Manual Hijri calculation (Kuwaiti algorithm)
    // This is more reliable than Intl.DateTimeFormat in some environments
    const jd = Math.floor(date.getTime() / 86400000) + 2440588;
    const l = jd - 1948440 + 10632;
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) + (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
    const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) - (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
    
    const monthNum = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * monthNum) / 24);
    const year = 30 * n + j - 30;

    const bnMonths = [
      'মহরম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি', 
      'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান', 
      'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ'
    ];

    const monthBn = bnMonths[monthNum - 1] || 'রমজান';
    // Adding +1 day offset for Bangladesh if needed, but standard is fine
    // For March 1, 2026, this formula gives 11 Ramadan 1447
    return `${toBn(day)} ${monthBn} ${toBn(year)} হিজরি`;
  };

  const englishDateBn = `${toBn(time.getDate())} ${getBnMonth(time)} ${toBn(time.getFullYear())} ইং`;
  
  const currentTime = time.toLocaleTimeString('bn-BD', { 
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true 
  });

  return (
    <div className="w-full max-w-[360px] mx-auto p-5 rounded-[32px] flex justify-between items-center relative overflow-hidden transition-all duration-500 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] group border border-white/60 dark:border-slate-700/50 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl"
         style={{ WebkitBackdropFilter: 'blur(20px)' }}>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-400/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col gap-2 text-left relative z-10 shrink-0">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-blue-500" />
          <span className="text-[13px] font-bold text-[#003366] dark:text-blue-100 tracking-tight whitespace-nowrap">{englishDateBn}</span>
        </div>
        <div className="flex items-center gap-2">
          <SunIcon size={14} className="text-orange-400" />
          <span className="text-[13px] font-bold text-[#003366] dark:text-blue-200 opacity-80 whitespace-nowrap">{getBnDate(time)}</span>
        </div>
        <div className="flex items-center gap-2">
          <MoonIcon size={14} className="text-indigo-400" />
          <span className="text-[13px] font-bold text-[#003366] dark:text-blue-300 opacity-70 whitespace-nowrap">{getHijriDate(time)}</span>
        </div>
      </div>

      <div className="h-14 w-[1px] bg-gradient-to-b from-transparent via-[#0056b3]/20 to-transparent mx-3 relative z-10"></div>

      <div className="text-right flex flex-col justify-center relative z-10 flex-1">
        <div className="text-[14px] font-black text-[#003366] dark:text-blue-100 uppercase tracking-widest mb-1">
          {getBnDay(time)}
        </div>
        <div className="flex items-center justify-end gap-1.5">
          <Clock size={16} className="text-blue-600 dark:text-blue-400" />
          <div className="text-[22px] font-mono text-[#1e40af] dark:text-blue-300 font-black tracking-tighter leading-none">
            {toBn(currentTime.split(' ')[0])} 
            <span className="text-[11px] font-black text-[#0056b3] dark:text-blue-400 ml-1 uppercase">
              {currentTime.split(' ')[1]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeBox;
