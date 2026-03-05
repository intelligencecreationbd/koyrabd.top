
import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  Info, 
  History as HistoryIcon,
  Map,
  Waves,
  Landmark as LandmarkIcon,
  Users2,
  Users,
  GraduationCap,
  Trophy,
  Store,
  School,
  Trees,
  Home as HomeIcon,
  Telescope,
  Fish,
  Anchor as AnchorIcon,
  Droplets,
  Shrub,
  Church,
  Palmtree,
  ChevronUp,
  ChevronDown,
  Navigation,
  Layers,
  Milestone,
  Library,
  BookOpen
} from 'lucide-react';
import { ICON_MAP } from '../constants';

// Firebase removed for paid hosting migration

const toBn = (num: string | number) => 
  (num || '').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const SkeletonItem = () => (
  <div className="w-full flex items-center justify-between p-5 bg-white border border-slate-100 rounded-[24px] shadow-sm animate-pulse">
    <div className="space-y-3 flex-1">
      <div className="h-5 bg-slate-200 rounded-lg w-3/4"></div>
      <div className="h-3 bg-slate-100 rounded-lg w-1/2"></div>
      <div className="h-3 bg-slate-50 rounded-lg w-1/3"></div>
    </div>
    <div className="w-12 h-12 bg-slate-100 rounded-xl ml-4"></div>
  </div>
);

/**
 * @LOCKED_COMPONENT
 * @Section Traditional & Historical Information (ঐতিহ্য)
 * @Status Design & Content Finalized - Scroll Behavior Updated
 */
const TraditionalHistory: React.FC<{ busId: string; onBack: () => void }> = ({ busId, onBack }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<any>(null);
  const [isSectionExpanded, setIsSectionExpanded] = useState<Record<string, boolean>>({});

  const getIconStyle = (iconName: string) => {
    switch (iconName) {
      case 'Navigation': return { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' };
      case 'Map': return { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case 'Layers': return { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' };
      case 'Milestone': return { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' };
      case 'Library': return { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' };
      case 'Waves':
      case 'WavesIcon': return { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' };
      case 'Landmark':
      case 'LandmarkIcon': return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };
      case 'Users2':
      case 'Users': return { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-100' };
      case 'GraduationCap':
      case 'School': return { bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' };
      case 'History': return { bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', border: 'border-fuchsia-100' };
      case 'BookOpen': return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' };
      case 'Trophy': return { bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-100' };
      case 'Store': return { bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' };
      case 'Trees': return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' };
      case 'HomeIcon': return { bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-100' };
      case 'Telescope': return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' };
      case 'Fish': return { bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' };
      case 'AnchorIcon': return { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
      case 'Droplets': return { bg: 'bg-blue-50', text: 'text-blue-400', border: 'border-blue-100' };
      case 'Shrub': return { bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' };
      case 'Church': return { bg: 'bg-indigo-50', text: 'text-indigo-400', border: 'border-indigo-100' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-500', border: 'border-slate-100' };
    }
  };

  useEffect(() => {
    const handleTraditionalDataSync = async () => {
      setIsLoading(true);
      try {
        const saved = localStorage.getItem('kp_traditional_and_historical');
        const data = saved ? JSON.parse(saved) : {};
        const fullMigrationSource: any = {
          "9-1-1": {
            id: "9-1-1",
            title: 'কয়রা উপজেলা: সুন্দরবন সংলগ্ন ঐতিহাসিক জনপদ',
            cards: [
              { title: 'ভৌগোলিক অবস্থান', icon: 'Navigation', text: 'কয়রার ভৌগোলিক অবস্থান ', highlight: '২২.৩৪১৭° উত্তর ৮৯.৩০০০° পূর্ব।', subText: 'এখানে ২৮০৬১ পরিবারের ইউনিট রয়েছে এবং মোট এলাকা ১৭৭৫.৪১ কিমি²।' },
              { title: 'ভৌগোলিক সীমানা', icon: 'Map', text: 'উত্তরে পাইকগাছা উপজেলা, দক্ষিণ বঙ্গোপসাগর ও সুন্দরবন, পূর্বে দাকোপ উপজেলা, পশ্চিমে ', highlight: 'সাতক্ষীরা জেলার শ্যামনগর ও আশাশুনি উপজেলা।', subText: 'এটি খুলনার সর্বদক্ষিণের শেষ সীমান্ত।' },
              { title: 'প্রশাসনিক ইউনিটসমূহ', icon: 'Layers', text: 'কয়রায় রয়েছে ', highlight: '৭টি ইউনিয়ন, ৭২টি মৌজা/মহল্লা এবং ১৩১টি গ্রাম।', subText: 'ইউনিয়নগুলি: আমাদী, বাগালী, মহেশ্বরীপুর, মহারাজপুর, কয়রা, উত্তর বেদকাশী ও দক্ষিণ বেদকাশী।' },
              { title: 'সূচনা ও প্রশাসনিক গঠন', icon: 'Milestone', text: 'কয়রা ১৯৭৯ সালে থানা হিসেবে যাত্রা শুরু করে এবং পরবর্তীতে ', highlight: '১৯৮৩ সালের ৭ নভেম্বর', subText: 'এটি পূর্ণাঙ্গ উপজেলায় রূপান্তরিত হয়।' },
              { title: 'ঐতিহাসিক প্রেক্ষাপট ও নামকরণ', icon: 'Library', text: '১৫শ শতাব্দীতে খান জাহান আলী (র.)-এর অনুসারীরা এখানে বসতি স্থাপন করেন। নামকরণ নিয়ে মতভেদ থাকলেও ', highlight: 'কাওরা গোষ্ঠী', subText: 'অথবা কয়লা পরিবহনের ঘাট থেকে "কয়রা" নামটি এসেছে বলে ধারণা করা হয়।' },
              { title: 'নদ-নদী ও সুন্দরবন', icon: 'Waves', text: 'এটি কপোতাক্ষ, শাকবাড়িয়া ও শিবসা নদীবেষ্টিত জনপদ। কয়রাকে বলা হয় ', highlight: 'সুন্দরবনের প্রবেশদ্বার।', subText: 'উপজেলার দক্ষিণে সুন্দরবনের কাশিয়াবাদ রেঞ্জ অবস্থিত যা পর্যটনের অন্যতম আকর্ষণ।' },
              { title: 'পুরাকীর্তি ও দর্শনীয় স্থান', icon: 'Landmark', text: 'খান জাহান আলী শৈলীর ', highlight: 'মসজিদকুঁড় ৯ গুম্বুজ মসজিদ', subText: 'এবং সুন্দরবনের তীরে অবস্থিত মোগল আমলের শেষার্ধের মন্দির এর প্রধান আকর্ষণ।' },
              { title: 'সংস্কৃতি ও নৃগোষ্ঠী', icon: 'Users2', text: 'এখানে ', highlight: 'মাহাতো ও মুণ্ডা', subText: 'ক্ষুদ্র নৃগোষ্ঠীর বসবাস রয়েছে। বনবিবির পালা ও গাজীর গান এখানকার লোকসংস্কৃতির অবিচ্ছেদ্য অংশ।' },
              { title: 'জনসংখ্যা ও জনমিতি (২০০১)', icon: 'Users', text: '২০০১ সালের পরিসংখ্যান অনুযায়ী উপজেলার মোট জনসংখ্যা ছিল ', highlight: '১,৯২,৫৩৪ জন।', subText: 'পুরুষ ৯৬,৯৯৩ ও মহিলা ৯৫,৫৪১ জন। মুসলিম ১,৪৯,৩২৬, হিন্দু ৪২,৪৬২ জন।' },
              { title: 'সাক্ষরতা ও প্রশাসনিক তথ্য', icon: 'GraduationCap', text: 'কয়রা উপজেলার শিক্ষার গড় হার ', highlight: '৫০.৪%', subText: 'বিএসটি (ইউটিসি+৬) সময় অঞ্চল। পোস্ট কোড: ৯২৪০। প্রশাসনিক কোড: ৪০ ৪৭ ৫৩।' }
            ],
            expandables: [
              { id: 'koy_war', title: 'মুক্তিযুদ্ধের স্মৃতি ও গৌরব', icon: 'History', text: 'মুক্তিযুদ্ধের সময় কয়রা উপজেলা ৯নং সেক্টরের অধীন ছিল। এখানে ৯ নং সাব-সেক্টর হেডকোয়ার্টার স্থাপিত হয়েছিল যেটা আমাদী ইউনিয়নে বাছাড়বাড়ি-মনোরঞ্জন ক্যাম্প নামে সুপরিচিত এবং এখান থেকেই মুক্তিবাহিনী ও মুজিববাহিনীর মোট ২৩টি ক্যাম্প ও অধিকাংশ অভিযান পরিচালিত হতো।' },
              { id: 'koy_notable', title: 'উল্লেখযোগ্য ব্যক্তি', icon: 'Trophy', text: 'খান সাহেব কোমর উদ্দিন ঢালী - ব্রিটিশ সরকার কর্তৃক খানসাহেব উপাধিপ্রাপ্ত ও পাকিস্তান সরকার কর্তৃক সমাজসেবক পতাকার খেদমত উপাধিপ্রাপ্ত।\nShah Mohammad Ruhul Kuddus - রাজনীতিবিদ।\nরোমান সানা - স্বর্ণপদক বিজয়ী তীরন্দাজ।\nমাওলানা আবুল কালাম আজাদ - রাজনীতিবিদ (খুলনা ৬)।' },
              { id: 'koy_market', title: 'হাট ও শিল্প', icon: 'Store', text: 'হাট (বাজার): ঝিলিয়াঘাটা হাট, হুগলা হাট, আমাদি হাট, নাকশা হাট, ঘড়িলাল হাট, সুতার হাট, গুড়োকাঠি হাট, ঘোড়লকাঠি হাট, জোরসিং বাজার, কালনা বাজার, চাঁদ আলী মাছের কাঁটা, হরিহরপুর বাজার, ৬ নম্বর কয়রা গড়িয়া বাড়ি লঞ্চঘাট বাজার।\n\nএছাড়া এখানে বিভিন্ন মেলা অনুষ্ঠিত হয়। এর মধ্যে দক্ষিণ বেদকাশী বনবিবির মেলা, পদ্মপুকুর রথ মেলা, হরিহরপুর রথ মেলা উল্লেখযোগ্য। এছাড়াও বিলুপ্ত বা বিলুপ্তপ্রায় সনাতন বাহন পালকি, ঘোড়া ও গরুর গাড়ি এই অঞ্চলে বহুল প্রচলিত।\n\nশিল্প ও কল-কারখানা: এখানে বিভিন্ন শিল্প ও কল-কারখানা গড়ে উঠেছে। এর মধ্যে চাল কল, তেল কল, ময়দা কল, কাঠ চেরাই কল, বরফ কল ইত্যাদি উল্লেখযোগ্য।' },
              { id: 'koy_edu', title: 'শিক্ষা প্রতিষ্ঠান', icon: 'School', text: 'ডি. কে. এস. এ. গিলাবাড়ী পি. জি ইউনাইটেড একাডেমী।\nগ্রাজুয়েটস মাধ্যমিক বিদ্যালয়, মহারাজপুর, কয়রা।\nকপোতাক্ষ মহাবিদ্যালয় (১৯৮৪)\nআমাদী জায়গীরমহল তাকিউদ্দীন মাধ্যমিক বিদ্যালয় (১৯৪৪)\n১নং নাকশা সরকারি প্রাথমিক বিদ্যালয়\nজোবেদা খানম কলেজ (১৯৯৬)\nকোমরউদ্দিন উচ্চ বিদ্যালয়\nকয়রা মদিনাবাদ হাই স্কুল\nসুন্দরবন মাধ্যমিক বিদ্যালয়\nউত্তর বেদকাশি মাধ্যমিক বিদ্যালয়\nদক্ষিণ বেদকাশি মাধ্যমিক বিদ্যালয়\nকয়রা সরকারি মহিলা কলেজ\nকয়রা ছিদ্দিকীয়া ফাজিল (ডিগ্রী) মাদ্রাসা।\nকয়রা উত্তর চক কামিল মাদ্রাসা।\nকালনা আমিনিয়া কামিল (এম.এ) মাদ্রাসা।\nকয়রা মদিনাবাদ দাখিল মাদ্রাসা\nউত্তর বেদকাশী হাবিবিয়া দাখিল মাদ্রাসা।\nকালনা মহিলা দাখিল মাদ্রাসা।\nকয়রা উত্তর চক মহিলা মাদ্রাসা।\nগোবরা দাখিল মাদ্রাসা\nজয়পুর সিমরাআইট দারুসুন্না দাখিল মাদ্রাসা।\nদেওয়ারা অন্তাবুনিয়া দাখিল মাদ্রাসা।\nদাকেন মহেশ্বরীপুর দাখিল মাদ্রাসা।\nচৌকুনি ইসলামিয়া দাখিল মাদ্রাসা।\nচারির চক বি কে দাখিল মাদ্রাসা।\nবেসপারা হায়াতুন্নেছা দাখিল মাদ্রাসা।\nঅর্জুনপুর আহসানিয়া দাখিল মাদ্রাসা।\nকয়রা অচ্ছিন মহিলা দাখিল মাদ্রাসা।\nখোরল মহিলা দাখিল মাদ্রাসা।\nকয়রা মদিনাবাদ দারুসুন্না মহিলা দাখিল মাদ্রাসা।\nএম এ দারুল ইসলান দাখিল মাদ্রাসা।\nএম এম দারুস সুন্না দাখিল মাদ্রাসা।\nনারায়নপুর মহিলা দাখিল মাদ্রাসা।\nপি কে এস এ আদর্শ দাখিল মাদ্রাসা।\nসাতহালিয়া গাউসুল আজম দাখিল মাদ্রাসা।\nসুন্দরবন ছিদ্দিকীয়া দাখিল মাদ্রাসা।\nঘুঘরাঘাটি ফাজিল মাদ্রাসা।\nবে সিন মিম বায়লা হারানিয়া আলিম মাদ্রাসা।\nডি এফ নাকশা আলিম মাদ্রাসা।\nকুশডাঙ্গা আলহাজ্ব কোমর উদ্দীন আলিম মাদ্রাসা।\nচারির চক এল সি কলেজিয়েট স্কুল\nকয়রা শাকবাড়িয়া স্কুল এন্ড কলেজ\nগড়িয়াবাড়ি সরকারি প্রাথমিক বিদ্যালয়\nপাথর খালি সরকারি প্রাথমিক বিদ্যালয়\nমনোরমা সরকারি প্রাথমিক বিদ্যালয়\n৫ নম্বর কয়রা স্যাটেলাইট সরকারি প্রাথমিক বিদ্যালয়\nবড়বাড়ি সরকারি প্রাথমিক বিদ্যালয়\nদিঘীরপাড় স্কুল এন্ড কলেজ\nবড়বাড়ি মাধ্যমিক বিদ্যালয়' }
            ]
          },
          "9-1-2": {
            id: "9-1-2",
            title: 'পাইকগাছা উপজেলা: দক্ষিণ খুলনার প্রাণকেন্দ্র',
            cards: [
              { title: 'ভৌগোলিক অবস্থান ও পরিচয়', icon: 'Navigation', text: 'পাইকগাছা বাংলাদেশের খুলনা জেলার দক্ষিণে অবস্থিত একটি উপজেলা। এটি ', highlight: '২২°৩৫\'৩১" উত্তর ৮৯°২০\'১৩" পূর্ব', subText: 'অস্থান করছে। এটি দক্ষিণ খুলনার অন্যতম সমৃদ্ধ বাণিজ্যিক ও উর্বর জনপদ।' },
              { title: 'সীমানা ও আয়তন', icon: 'Map', text: 'উপজেলার মোট আয়তন ', highlight: '৩৮৩.৮৭ বর্গকিলোমিটার।', subText: 'উত্তরে তালা ও ডুমুরিয়া, দক্ষিণে সুন্দরবন ও কয়রা, পূর্বে বটিয়াঘাটা ও দাকোপ।' },
              { title: 'নদ-নদী ও প্রকৃতি', icon: 'Waves', text: 'উপজেলার মধ্য দিয়ে শিবসা, কপোতাক্ষ, ভদ্রা, ডেলুটি ও কড়ুলিয়া নদী প্রবাহিত। এটি ', highlight: 'সুন্দরবনের কোল ঘেঁষে', subText: 'গড়ে ওঠা এক নয়নাভিরাম প্রাকৃতিক সৌন্দর্যমণ্ডিত জনপদ।' }
            ],
            expandables: [
              { id: 'pai_hist', title: 'ঐতিহাসিক প্রেক্ষাপট', icon: 'History', text: 'মুক্তিযুদ্ধের ইতিহাসে পাইকগাছা একটি গুরুত্বপূর্ণ নাম. ১৯৭১ সালের ৬ ডিসেম্বর কপিলমুনি রাজাকার ক্যাম্পটি দখলের জন্য বীর মুক্তিযোদ্ধাদের নেতৃত্বে এক সাঁড়াশি অভিযান শুরু হয়। তিন দিন একটানা যুদ্ধের পর ৯ ডিসেম্বর কপিলমুনি যুদ্ধের অবসান হয়।' },
              { id: 'pai_name', title: 'নামকরণের ইতিহাস', icon: 'BookOpen', text: 'পাইকগাছার নামকরণের পেছনে রয়েছে নানা কিংবদন্তি. কথিত আছে, অতীতে এই অঞ্চলে প্রচুর "পাইক" বা বরকন্দাজরা গাছে চড়ে পাহারা দিত বলে এর নাম হয়েছে "পাইকগাছা"।' }
            ]
          },
          "9-2-1": {
            id: "9-2-1",
            title: 'কয়রা উপজেলার দর্শনীয় স্থান',
            spots: [
              { title: 'বিশ্ব ঐতিহ্যবাহী সুন্দরবন', highlight: 'ইউনেস্কো ঘোষিত বিশ্ব ঐতিহ্য', desc: 'কয়রা উপজেলার দক্ষিণাঞ্চল জুড়ে বিশ্বের বৃহত্তম ম্যানগ্রোভ বন সুন্দরবন বিস্তৃত। সুন্দরবনের প্রাকৃতিক সৌন্দর্য ও রয়্যাল বেঙ্গল টাইগারের অন্যতম আবাসভূমি.', icon: 'Trees' },
              { title: 'ঐতিহাসিক মসজিদকুঁড় ৯ গুম্বুজ মসজিদ', highlight: '১৫শ শতাব্দীর প্রত্নতাত্ত্বিক নিদর্শন', desc: 'খান জাহান আলী (র.)-এর আমল বা তাঁর স্থাপত্যশৈলী অনুসরণ করে নির্মিত এই মসজিদটি কয়রা আমাদী ইউনিয়নে অবস্থিত।', icon: 'LandmarkIcon' },
              { title: 'কাছারী বাড়ি বটবৃক্ষ', highlight: 'শতবর্ষী প্রাকৃতিক ঐশ্বর্য', desc: 'উপজেলা সদরের নিকটবর্তী ঐতিহাসিক কাছারী বাড়ির বিশাল বটবৃক্ষটি যেন কালের সাক্ষী।', icon: 'Shrub' },
              { title: 'দুবলার চর', highlight: 'জেলে পল্লী ও পর্যটন দ্বীপ', desc: 'সুন্দরবনের অভ্যন্তরে কপোতাক্ষ ও শিবসা নদীর মোহনায় অবস্থিত এই দ্বীপটি। শুঁটকি মাছ উৎপাদন এবং রাস মেলার জন্য পরিচিত।', icon: 'AnchorIcon' }
            ]
          },
          "9-2-2": {
            id: "9-2-2",
            title: 'পাইকগাছা উপজেলার দর্শনীয় স্থান',
            spots: [
              { title: 'স্যার পি. সি. রায়ের বাড়ি', highlight: 'বিশ্বখ্যাত বিজ্ঞানীর পৈতৃক নিবাস', desc: 'পাইকগাছার রাড়ুলী গ্রামে অবস্থিত প্রখ্যাত বিজ্ঞানী আচার্য স্যার প্রফুল্ল চন্দ্র রায়ের বাড়ি। এটি একটি সংরক্ষিত প্রত্নতাত্ত্বিক এলাকা।', icon: 'Telescope' },
              { title: 'মৎস্য গবেষণা ও লোনা পানি কেন্দ্র', highlight: 'দক্ষিণ এশিয়ার অন্যতম মৎস্য কেন্দ্র', desc: 'পাইকগাছা সদরে অবস্থিত এই কেন্দ্রটি লোনা পানির মৎস্য প্রজনন ও গবেষণার জন্য অত্যন্ত পরিচিত।', icon: 'Fish' },
              { title: 'কপিলমুনি বেদ মন্দির', highlight: 'প্রাচীন আধ্যাত্মিক নিদর্শন', desc: 'কপিলমুনি বাজারে অবস্থিত ঐতিহাসিকভাবে অত্যন্ত সমৃদ্ধ এই মন্দিরটি স্থাপত্যশৈলী এবং আধ্যাত্মিক পরিবেশের জন্য পর্যটকদের কাছে আকর্ষণীয়।', icon: 'LandmarkIcon' }
            ]
          }
        };

        const existingData = data[busId];
        if (!existingData && fullMigrationSource[busId]) {
          data[busId] = fullMigrationSource[busId];
          localStorage.setItem('kp_traditional_and_historical', JSON.stringify(data));
          setContent(fullMigrationSource[busId]);
        } else {
          setContent(existingData);
        }
      } catch (e) {
        console.error("Storage Error:", e);
      } finally {
        setIsLoading(false);
      }
    };
    handleTraditionalDataSync();
  }, [busId]);

  if (busId === '9-1-1') {
    const introData = [
      { id: 1, title: 'ভৌগোলিক পরিচিতি', icon: 'Navigation', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', text: 'উত্তরে-পাইকগাছা, দক্ষিণ ও পূর্বে সুন্দরবন ও দাকোপ উপজেলা, পশ্চিমে-সাতক্ষীরা জেলার শ্যামনগর ও আশাশুনি উপজেলা।' },
      { id: 2, title: 'কয়রা উপজেলার পটভূমি', icon: 'History', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', text: '১৯-১১-১৯৭৯ খ্রিঃ তারিখে প্রথমে এ উপজেলাটি থানা হিসাবে প্রতিষ্ঠিত হয় অতঃপর ০৭-১১-১৯৮৩ খ্রিঃ তারিখে থানা থেকে উপজেলায় উন্নীতকরণ করা হয়।' },
      { id: 3, title: 'মানচিত্রে কয়রা', icon: 'Map', color: 'bg-blue-50 text-blue-600 border-blue-100', text: 'বাংলাদেশের ৬৪টি জেলার মধ্যে খুলনা বিভাগের অন্তর্গত খুলনা জেলার সর্বদক্ষিণে সুন্দরবন ঘেঁষা ২৬৩.১২ বর্গ কি:মি: এলাকা জুড়ে ৭টি ইউনিয়ন নিয়ে কয়রা উপজেলা অবস্থিত।' },
      { id: 4, title: 'ইউনিয়নসমূহ', icon: 'Layers', color: 'bg-violet-50 text-violet-600 border-violet-100', text: 'কয়রা উপজেলার মোট ৭টি ইউনিয়ন। ইউনিয়নের নাম: ১) আমাদী ২) বাগালী ৩) মহেশ্বরীপুর ৪) মহারাজপুর ৫) কয়রা ৬) উত্তর বেদকাশি ৭) দক্ষিণ বেদকাশি।' },
      { id: 5, title: 'ভাষা, সংস্কৃতি ও সম্প্রদায়', icon: 'Users2', color: 'bg-pink-50 text-pink-600 border-pink-100', text: 'মুসলিম-(বাংলা, ইংরেজি, আরবি), হিন্দু-(বাংলা, ইংরেজি), খ্রিস্টান- বাংলা, ইংরেজি, আদিবাসী- মুন্ডা ও মাহাতো (অত্র উপজেলায় কয়রা, উঃ বেদকাশী ও দঃ বেদকাশী ইউনিয়নে আদিবাসি সম্প্রদায়ের (মুন্ডা ও মাহাতো) মোট ৩২২ টি পরিবার বসবাস করে।' },
      { id: 6, title: 'ঐতিহাসিক/দর্শনীয় স্থান', icon: 'Landmark', color: 'bg-amber-50 text-amber-600 border-amber-100', text: 'ক) উত্তর বেদকাশী বড়বাড়ী রাজা প্রতাপাদিত্য এর বাড়ী, খ) মসজিদকুঁড়ের মসজিদ, গ) উত্তর বেদকাশীর খালে খাঁ এর ৩৮ বিঘা দিঘী, ঘ) আমাদী বুড়ো খাঁ-ফতে খাঁর দিঘী।' },
      { id: 7, title: 'খেলাধুলা ও বিনোদন', icon: 'Trophy', color: 'bg-yellow-50 text-yellow-600 border-yellow-100', text: 'জাতীয় ও আন্তর্জাতিক পর্যায়ের খেলাধুলার পাশাপাশি গ্রামীণ খেলাধুলা অনুষ্ঠিত এবং বিনোদন হিসাবে বিভিন্ন ধরনের নাটক, নৃত্যানুষ্ঠান ও সাংস্কৃতিক অনুষ্ঠান এ উপজেলায় অনুষ্ঠিত হয়ে থাকে।' },
      { id: 8, title: 'মুক্তিযুদ্ধ ও মুক্তিযোদ্ধাদের তালিকা', icon: 'ShieldCheck', color: 'bg-rose-50 text-rose-600 border-rose-100', text: 'সংরক্ষিত আছে।' },
      { id: 9, title: 'প্রাকৃতিক সম্পদ', icon: 'Trees', color: 'bg-green-50 text-green-600 border-green-100', text: 'উল্লেখযোগ্য কিছু নাই।' },
      { id: 10, title: 'নদ-নদী', icon: 'Waves', color: 'bg-cyan-50 text-cyan-600 border-cyan-100', text: 'কপোতাক্ষ, শাকবাড়িয়া, কয়রা নদী দ্বারা এ উপজেলা বেষ্টিত।' },
      { id: 11, title: 'ব্যবসা-বাণিজ্য', icon: 'Store', color: 'bg-sky-50 text-sky-600 border-sky-100', text: 'বিভিন্ন পেশাজীবীর ব্যক্তিবর্গ চিংড়ী উৎপাদন ও রপ্তানীর কাজে নিয়োজিত রয়েছে।' },
      { id: 12, title: 'হাট-বাজার', icon: 'ShoppingBag', color: 'bg-orange-50 text-orange-600 border-orange-100', text: '১৯ টি।' },
      { id: 13, title: 'হোটেল ও আবাসন', icon: 'HomeIcon', color: 'bg-lime-50 text-lime-600 border-lime-100', text: '০৩ (তিন)টি।' },
      { id: 14, title: 'জনপ্রতিনিধি', icon: 'UserCheck', color: 'bg-teal-50 text-teal-600 border-teal-100', text: 'মাননীয় সংসদ সদস্য মহোদয়, উপজেলা চেয়ারম্যান, উপজেলা ভাইস চেয়ারম্যান, উপজেলা মহিলা ভাইস চেয়ারম্যান, ইউনিয়ন পরিষদের চেয়ারম্যান, ইউনিয়ন পরিষদের ওয়ার্ড সদস্য/সদস্যবৃন্দ, সংরক্ষিত মহিলা সদস্যবৃন্দ, সুশীল সমাজের প্রতিনিধি, শিক্ষক, সাংবাদিকবৃন্দ।' },
      { id: 16, title: 'প্রখ্যাত ব্যক্তিত্ব', icon: 'GraduationCap', color: 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100', text: 'ক) মরহুম খান সাহেব কোমর উদ্দিন ঢালী (ব্রিটিশ সরকার কর্তৃক খানসাহেব উপাধিপ্রাপ্ত ও পাকিস্তান সরকার কর্তৃক সমাজসেবক তমগাহে খেদমত উপাধিপ্রাপ্ত, গ্রাম-জায়গীরমহল, ইউনিয়ন আমাদী) খ) মরহুম-কবি এবাদুল্লাহ শেখ (তার রচিত কাব্যগ্রন্থ: মালঞ্চ, খরাফুল ইত্যাদি)।' }
    ];

    return (
      <div className="fixed inset-0 bg-[#F8FAFC] z-[70] flex flex-col animate-in fade-in duration-500 overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-5 pb-3 border-b border-slate-100 bg-white/80 backdrop-blur-md z-20">
          <div className="flex items-center gap-4 max-w-md mx-auto">
            <button 
              onClick={onBack} 
              className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="text-left overflow-hidden">
              <h2 className="text-lg font-black text-slate-800 leading-tight truncate">সাধারন পরিচিতি</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">কয়রা উপজেলার বিস্তারিত তথ্য</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-32 space-y-5 max-w-md mx-auto w-full">
          {introData.map((item, idx) => {
            const Icon = ICON_MAP[item.icon] || Info;
            // Extract colors for glass effect
            const bgLight = item.color.split(' ')[0]; // e.g. bg-indigo-50
            const textColor = item.color.split(' ')[1]; // e.g. text-indigo-600
            const borderColor = item.color.split(' ')[2]; // e.g. border-indigo-100
            
            return (
              <div 
                key={item.id} 
                className={`relative overflow-hidden bg-white/70 backdrop-blur-xl p-6 rounded-[35px] border-2 ${borderColor} shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-left space-y-4 animate-in slide-in-from-bottom-4 duration-700`}
                style={{ animationDelay: `${idx * 80}ms` }}
              >
                {/* Decorative Background Glow */}
                <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full opacity-10 blur-3xl ${bgLight}`} />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className={`p-4 ${bgLight} border ${borderColor} rounded-2xl ${textColor} shadow-inner flex items-center justify-center`}>
                    <Icon size={24} strokeWidth={2.5} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-slate-800 text-lg leading-tight tracking-tight">{item.title}</h4>
                      <div className={`text-[10px] font-black ${textColor} ${bgLight} px-3 py-1 rounded-full border ${borderColor} uppercase tracking-tighter`}>
                        পয়েন্ট {toBn(item.id)}
                      </div>
                    </div>
                    <div className={`h-1.5 w-14 rounded-full mt-2 bg-gradient-to-r from-slate-200 to-transparent opacity-50`} />
                  </div>
                </div>
                
                <div className="relative z-10">
                  <p className="text-[15px] font-bold text-slate-600 leading-[1.6] text-justify whitespace-pre-line">
                    {item.text}
                  </p>
                </div>

                {/* Glass Magic Accent */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-slate-100 to-transparent opacity-30" />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (busId === '9-1' || busId === '9-2') {
    return (
      <div className="fixed inset-0 bg-white z-[70] flex flex-col animate-in fade-in duration-500">
        <div className="p-5 flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-transform">
            <ChevronLeft size={24} />
          </button>
        </div>
        <div className="flex-1 bg-white" />
      </div>
    );
  }
  if (isLoading) return <div className="space-y-4 p-5">{[1, 2, 3].map(i => <SkeletonItem key={i} />)}</div>;
  if (!content) return <div className="py-20 text-center opacity-30">তথ্য পাওয়া যায়নি।</div>;

  return (
    <div className="flex flex-col fixed inset-0 top-20 bg-white dark:bg-slate-950 animate-in fade-in duration-700">
      {/* Fixed Local Header */}
      <div className="shrink-0 p-5 pb-3 border-b border-slate-50 bg-white/80 backdrop-blur-md z-20">
        <div className="flex items-center gap-4 max-w-md mx-auto">
          <button 
            onClick={onBack} 
            className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-left overflow-hidden">
            <h2 className="text-lg font-black text-slate-800 leading-tight truncate">{content.title}</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">ঐতিহ্য ও সংস্কৃতির সংগৃহীত তথ্যমালা</p>
          </div>
        </div>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-5 pb-40 space-y-5 max-w-md mx-auto w-full">
        {content.cards?.map((card: any, idx: number) => {
          const CardIcon = ICON_MAP[card.icon] || Info;
          const style = getIconStyle(card.icon);
          return (
            <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3 animate-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${style.bg} border ${style.border} rounded-2xl ${style.text} shadow-sm`}><CardIcon size={20} /></div>
                <h4 className="font-black text-slate-800 text-lg">{card.title}</h4>
              </div>
              <p className="text-sm font-bold text-slate-600 leading-relaxed text-justify">
                {card.text} <span className="text-blue-700 font-black px-1.5 py-0.5 bg-blue-50 rounded-lg">{card.highlight}</span>
              </p>
              {card.subText && <p className="text-[11px] font-bold text-slate-400 pl-4 border-l-2 border-slate-100">{card.subText}</p>}
            </div>
          );
        })}

        {content.expandables?.map((section: any) => {
          const SectionIcon = ICON_MAP[section.icon] || Info;
          const isExpanded = isSectionExpanded[section.id];
          const style = getIconStyle(section.icon);
          return (
            <div key={section.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 ${style.bg} border ${style.border} rounded-2xl ${style.text} shadow-sm`}><SectionIcon size={20} /></div>
                <h4 className="font-black text-slate-800 text-lg">{section.title}</h4>
              </div>
              <div className="relative">
                <p className={`text-sm font-bold text-slate-600 leading-relaxed text-justify whitespace-pre-line ${isExpanded ? '' : 'line-clamp-4'}`}>
                  {section.text}
                </p>
                <button onClick={() => setIsSectionExpanded(prev => ({...prev, [section.id]: !isExpanded}))} className="mt-2 flex items-center gap-1.5 text-xs font-black text-blue-600">
                  {isExpanded ? 'সংক্ষিপ্ত করুন' : 'আরও পড়ুন'} {isExpanded ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
                </button>
              </div>
            </div>
          );
        })}

        {content.spots?.map((spot: any, idx: number) => {
          const style = getIconStyle(spot.icon);
          return (
            <div key={idx} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm text-left space-y-4">
              <div className="flex items-center gap-4">
                <div className={`p-3.5 ${style.bg} border ${style.border} rounded-2xl ${style.text} shadow-sm`}><Info size={24} /></div>
                <div>
                  <h4 className="font-black text-slate-800 text-lg leading-tight">{spot.title}</h4>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1">{spot.highlight}</p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-500 leading-relaxed text-justify">{spot.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TraditionalHistory;
