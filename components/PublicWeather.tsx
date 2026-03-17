
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ChevronLeft, 
  CloudSun, 
  Wind, 
  Droplets, 
  Sunrise, 
  Sunset, 
  Moon, 
  Waves, 
  AlertTriangle, 
  CloudRain, 
  Sun, 
  Cloud, 
  RefreshCw,
  Calendar,
  Navigation
} from 'lucide-react';

/**
 * @LOCKED_COMPONENT
 * @Section Public Weather Service View (আবহাওয়া)
 * @Status Scrolling Fixed & UI Optimized
 */

interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    windSpeed: number;
    weatherCode: number;
    isDay: boolean;
  };
  daily: {
    time: string[];
    weatherCode: number[];
    tempMax: number[];
    tempMin: number[];
    sunrise: string[];
    sunset: string[];
  };
}

const LOCATIONS = {
  koyra: { name: 'কয়রা', lat: 22.3417, lon: 89.3000 },
  paikgacha: { name: 'পাইকগাছা', lat: 22.5833, lon: 89.3333 }
};

const toBn = (num: string | number) => 
  (num || '0').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const getWeatherIcon = (code: number, isDay: boolean = true) => {
  if (code === 0) return <Sun className="text-orange-400" size={48} />;
  if (code >= 1 && code <= 3) return <CloudSun className="text-blue-400" size={48} />;
  if (code >= 45 && code <= 48) return <Cloud className="text-slate-300" size={48} />;
  if (code >= 51 && code <= 67) return <CloudRain className="text-cyan-500" size={48} />;
  if (code >= 80 && code <= 82) return <CloudRain className="text-blue-500" size={48} />;
  if (code >= 95) return <AlertTriangle className="text-red-500" size={48} />;
  return <Cloud className="text-slate-400" size={48} />;
};

const getWeatherStatus = (code: number) => {
  if (code === 0) return 'পরিষ্কার আকাশ';
  if (code >= 1 && code <= 3) return 'আংশিক মেঘলা';
  if (code >= 45 && code <= 48) return 'কুয়াশাচ্ছন্ন';
  if (code >= 51 && code <= 67) return 'গুড়ি গুড়ি বৃষ্টি';
  if (code >= 80 && code <= 82) return 'বৃষ্টির সম্ভাবনা';
  if (code >= 95) return 'বজ্রঝড়';
  return 'মেঘলা';
};

const getLunarPhase = (date: Date) => {
  const lp = [
    'নতুন চাঁদ (অমাবস্যা)', 'ক্রমবর্ধমান ক্রিসেন্ট', 'প্রথম চতুর্থাংশ', 'ক্রমবর্ধমান গিরাস',
    'পূর্ণিমা', 'ক্ষয়িষ্ণু গিরাস', 'শেষ চতুর্থাংশ', 'ক্ষয়িষ্ণু ক্রিসেন্ট'
  ];
  const day = date.getDate();
  const index = Math.floor((day % 30) / 3.75) % 8;
  return lp[index];
};

const rowColors = [
  'bg-blue-50/40',
  'bg-emerald-50/40',
  'bg-amber-50/40',
  'bg-rose-50/40',
  'bg-indigo-50/40',
  'bg-cyan-50/40',
  'bg-violet-50/40'
];

const PublicWeather: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [location, setLocation] = useState<keyof typeof LOCATIONS>('koyra');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    const loc = LOCATIONS[location];
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset&timezone=auto`
      );
      const data = await response.json();
      
      setWeather({
        current: {
          temp: data.current.temperature_2m,
          humidity: data.current.relative_humidity_2m,
          windSpeed: data.current.wind_speed_10m,
          weatherCode: data.current.weather_code,
          isDay: data.current.is_day === 1
        },
        daily: {
          time: data.daily.time,
          weatherCode: data.daily.weather_code,
          tempMax: data.daily.temperature_2m_max,
          tempMin: data.daily.temperature_2m_min,
          sunrise: data.daily.sunrise,
          sunset: data.daily.sunset
        }
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Weather fetch failed:", error);
    } finally {
      setLoading(false);
    }
  }, [location]);

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 900000); // 15 mins refresh
    return () => clearInterval(interval);
  }, [fetchWeather]);

  const isDisaster = weather && weather.current.windSpeed > 25;

  return (
    <div className="flex flex-col h-full animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="relative flex items-center justify-center mb-4 shrink-0 px-1 py-2 bg-blue-50 rounded-2xl mx-1 shadow-sm">
        <div className="text-center">
          <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-0.5">কয়রা-পাইকগাছা কমিউনিটি অ্যাপ</p>
          <h2 className="text-xl font-black text-slate-800 leading-tight">আবহাওয়ার পূর্বাভাস</h2>
        </div>
        <button 
          onClick={fetchWeather} 
          className={`absolute right-2 p-2 text-blue-600 active:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={20} />
        </button>
      </header>
      
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-40">
        {/* Location Switcher */}
        <div className="flex p-1.5 bg-slate-100 rounded-2xl mx-1 shadow-inner">
          {Object.keys(LOCATIONS).map((key) => (
            <button 
              key={key}
              onClick={() => setLocation(key as keyof typeof LOCATIONS)}
              className={`flex-1 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 ${location === key ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}`}
            >
              <Navigation size={14} /> {LOCATIONS[key as keyof typeof LOCATIONS].name}
            </button>
          ))}
        </div>

        {loading && !weather ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-30">
            <RefreshCw size={48} className="animate-spin text-blue-600" />
            <p className="font-bold text-slate-800">তথ্য লোড হচ্ছে...</p>
          </div>
        ) : weather && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700 px-1">
            
            {/* Disaster Alert Box */}
            {isDisaster && (
              <div className="bg-red-50 border-2 border-red-100 p-5 rounded-[28px] flex items-center gap-4 animate-pulse">
                <div className="p-3 bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/30">
                  <AlertTriangle size={24} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-red-600 text-lg">সতর্কবার্তা: প্রবল বাতাস!</h4>
                  <p className="text-xs font-bold text-red-400">উপকূলীয় অঞ্চলে নিম্নচাপ বা ঝড়ের সম্ভাবনা থাকতে পারে। সাবধানে থাকুন।</p>
                </div>
              </div>
            )}

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-[#0056b3] to-[#007BFF] p-5 rounded-[32px] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-20">
                 {getWeatherIcon(weather.current.weatherCode, weather.current.isDay)}
               </div>
               <div className="relative z-10 text-left space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest">এখনকার আবহাওয়া</span>
                  </div>
                  <div className="flex items-end gap-3">
                    <h1 className="text-6xl font-black tracking-tighter">{toBn(Math.round(weather.current.temp))}°</h1>
                    <div className="pb-1.5">
                       <p className="text-xl font-black opacity-90 leading-none">{getWeatherStatus(weather.current.weatherCode)}</p>
                       <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest mt-1">আপডেট: {toBn(lastUpdated.toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}))}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 pt-2">
                     <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl">
                        <Wind size={20} className="text-blue-200" />
                        <div className="text-left">
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-60">বাতাস</p>
                           <p className="text-xs font-black">{toBn(weather.current.windSpeed)} কিমি/ঘ</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-2xl">
                        <Droplets size={20} className="text-blue-200" />
                        <div className="text-left">
                           <p className="text-[8px] font-black uppercase tracking-widest opacity-60">আর্দ্রতা</p>
                           <p className="text-xs font-black">{toBn(weather.current.humidity)}%</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Coastal & Sunlight Info Grid */}
            <div className="grid grid-cols-3 gap-2">
               <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-blue-500">
                    <Sunrise size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">সূর্যোদয়</span>
                  </div>
                  <p className="text-base font-black text-slate-800 leading-tight">{toBn(new Date(weather.daily.sunrise[0]).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}))}</p>
               </div>
               <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-orange-500">
                    <Sunset size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">সূর্যাস্ত</span>
                  </div>
                  <p className="text-base font-black text-slate-800 leading-tight">{toBn(new Date(weather.daily.sunset[0]).toLocaleTimeString('bn-BD', {hour: '2-digit', minute:'2-digit'}))}</p>
               </div>
               <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm text-left space-y-2">
                  <div className="flex items-center gap-1.5 text-indigo-500">
                    <Moon size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">চন্দ্র তিথি</span>
                  </div>
                  <p className="text-[10px] font-black text-slate-800 leading-tight">{getLunarPhase(new Date())}</p>
               </div>
            </div>

            {/* 7 Day Forecast List */}
            <div className="bg-white rounded-[35px] border border-slate-100 shadow-sm overflow-hidden mb-10">
               <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-blue-600" />
                    <h4 className="font-black text-slate-800 text-sm">৭ দিনের পূর্বাভাস</h4>
                  </div>
               </div>
               <div className="divide-y divide-slate-50">
                  {weather.daily.time.map((time, i) => (
                    <div key={i} className={`flex items-center justify-between p-5 hover:bg-slate-50 transition-colors ${rowColors[i % rowColors.length]}`}>
                       <div className="text-left">
                          <p className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                            {i === 0 ? 'আজ' : i === 1 ? 'আগামীকাল' : new Date(time).toLocaleDateString('bn-BD', {weekday: 'long'})}
                            <span className="text-[11px] font-bold text-slate-400">
                              ({toBn(new Date(time).toLocaleDateString('bn-BD', {day: 'numeric', month: 'long'}))})
                            </span>
                          </p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{getWeatherStatus(weather.daily.weatherCode[i])}</p>
                       </div>
                       <div className="flex items-center gap-6">
                          <div className="scale-75 opacity-80">{getWeatherIcon(weather.daily.weatherCode[i])}</div>
                          <div className="text-right flex items-center gap-2">
                             <span className="text-sm font-black text-slate-800">{toBn(Math.round(weather.daily.tempMax[i]))}°</span>
                             <span className="text-sm font-bold text-slate-300">{toBn(Math.round(weather.daily.tempMin[i]))}°</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicWeather;
