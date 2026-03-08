
import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Download, User, Phone, Globe, MapPin, Building2, Briefcase, Mail, Edit2, Camera } from 'lucide-react';
import * as htmlToImage from 'html-to-image';
import { QRCodeSVG } from 'qrcode.react';

interface UserEmergencyInfoProps {
  uid?: string;
  onBack: () => void;
}

const UserEmergencyInfo: React.FC<UserEmergencyInfoProps> = ({ uid = '', onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    designation: '',
    institution: '',
    mobile: '',
    email: '',
    address: ''
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const cardWidth = 800; 
        if (containerWidth < cardWidth) {
          setScale((containerWidth - 32) / cardWidth);
        } else {
          setScale(1);
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current || isDownloading) return;
    
    setIsDownloading(true);
    
    // Safety timeout
    const safetyTimeout = setTimeout(() => {
      if (isDownloading) {
        setIsDownloading(false);
        alert('ডাউনলোড প্রসেসটি অনেক সময় নিচ্ছে। দয়া করে আবার চেষ্টা করুন।');
      }
    }, 15000);

    try {
      const element = cardRef.current;
      
      // html-to-image is much more reliable for complex CSS
      const dataUrl = await htmlToImage.toJpeg(element, {
        quality: 0.95,
        width: 800,
        height: 450,
        backgroundColor: '#ffffff',
        pixelRatio: 2, // High resolution
        style: {
          transform: 'none',
          boxShadow: 'none', // Remove shadow for capture
          margin: '0',
          padding: '0'
        },
        // Filter out problematic stylesheets to avoid "Cannot access rules" error
        filter: (node) => {
          if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
            try {
              // Check if we can access the rules
              const sheet = (node as HTMLLinkElement).sheet;
              if (sheet) {
                const rules = sheet.cssRules;
                return true;
              }
            } catch (e) {
              console.warn('Skipping stylesheet due to CORS:', (node as HTMLLinkElement).href);
              return false;
            }
          }
          return true;
        }
      });

      // Generate filename
      const safeName = (formData.name || 'User').trim().replace(/\s+/g, '_') || 'ID_Card';
      const fileName = `ID_Card_${safeName}.jpg`;
      
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      clearTimeout(safetyTimeout);
      setIsDownloading(false);

    } catch (error) {
      console.error('Download failed:', error);
      alert('ডাউনলোড করতে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।');
      clearTimeout(safetyTimeout);
      setIsDownloading(false);
    }
  };

  const qrData = `Name: ${formData.name}\nDesignation: ${formData.designation}\nInstitution: ${formData.institution}\nMobile: ${formData.mobile}\nEmail: ${formData.email}\nAddress: ${formData.address}`;

  return (
    <div className="fixed inset-0 z-[600] bg-slate-50 overflow-y-auto no-scrollbar animate-in fade-in duration-500 flex flex-col font-sans">
      {/* Header - Centered Title */}
      <header className="p-3 flex items-center border-b border-slate-200 sticky top-0 bg-white z-10 shadow-sm relative">
        <button onClick={onBack} className="p-2 bg-slate-100 rounded-xl active:scale-90 transition-all relative z-10">
          <ChevronLeft size={20} className="text-slate-800" />
        </button>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-sm font-black text-slate-800 leading-none">আইডি কার্ড</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">জেনারেটর</p>
        </div>
      </header>

      <div className="flex-1 p-4 space-y-3 max-w-2xl mx-auto w-full pb-24">
        {/* Extra Compact Input Form Section */}
        <div className="bg-white p-3.5 rounded-[24px] border border-slate-200 space-y-2.5 shadow-sm">
          <div className="flex items-center gap-2 border-b border-slate-50 pb-1">
            <Edit2 size={12} className="text-indigo-500" />
            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-tight">আপনার তথ্য দিন</h3>
          </div>
          
          <div className="space-y-1.5">
            {/* Profile Image Upload */}
            <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm relative group">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={20} className="text-slate-400" />
                )}
                <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                  <Camera size={14} className="text-white" />
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-700">প্রোফাইল ছবি আপলোড করুন</p>
                <p className="text-[8px] text-slate-400">আপনার ছবি আইডি কার্ডে যুক্ত হবে</p>
              </div>
              <label className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-[9px] font-black text-indigo-600 cursor-pointer hover:bg-indigo-50 transition-colors">
                ছবি বাছুন
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            </div>

            <div className="space-y-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">পূর্ণ নাম</label>
              <div className="relative">
                <User size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 text-[12px] focus:bg-white focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-0.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">পদবী</label>
                <input 
                  type="text" 
                  value={formData.designation}
                  onChange={e => setFormData({...formData, designation: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 text-[12px] focus:bg-white focus:border-indigo-400 transition-all"
                />
              </div>
              <div className="space-y-0.5">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">মোবাইল</label>
                <input 
                  type="text" 
                  value={formData.mobile}
                  onChange={e => setFormData({...formData, mobile: e.target.value})}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 text-[12px] focus:bg-white focus:border-indigo-400 transition-all"
                />
              </div>
            </div>

            <div className="space-y-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">প্রতিষ্ঠান</label>
              <input 
                type="text" 
                value={formData.institution}
                onChange={e => setFormData({...formData, institution: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 text-[12px] focus:bg-white focus:border-indigo-400 transition-all"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">ইমেইল</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 text-[12px] focus:bg-white focus:border-indigo-400 transition-all"
              />
            </div>

            <div className="space-y-0.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">ঠিকানা</label>
              <input 
                type="text" 
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 outline-none font-bold text-slate-700 text-[12px] focus:bg-white focus:border-indigo-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* ID Card Preview Section */}
        <div className="space-y-2.5" ref={containerRef}>
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">কার্ড প্রিভিউ</h3>
            <div className="flex items-center gap-2">
              {navigator.share && (
                <button 
                  onClick={async () => {
                    if (!cardRef.current || isDownloading) return;
                    setIsDownloading(true);
                    try {
                      const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
                        quality: 0.95,
                        width: 800,
                        height: 450,
                        backgroundColor: '#ffffff',
                        pixelRatio: 2,
                        style: {
                          transform: 'none',
                          boxShadow: 'none'
                        },
                        filter: (node) => {
                          if (node.tagName === 'LINK' && (node as HTMLLinkElement).rel === 'stylesheet') {
                            try {
                              const sheet = (node as HTMLLinkElement).sheet;
                              if (sheet) {
                                const rules = sheet.cssRules;
                                return true;
                              }
                            } catch (e) {
                              return false;
                            }
                          }
                          return true;
                        }
                      });
                      
                      const response = await fetch(dataUrl);
                      const blob = await response.blob();
                      
                      if (blob) {
                        const file = new File([blob], 'ID_Card.jpg', { type: 'image/jpeg' });
                        await navigator.share({
                          files: [file],
                          title: 'My ID Card',
                        });
                      }
                      setIsDownloading(false);
                    } catch (e) {
                      console.error(e);
                      setIsDownloading(false);
                    }
                  }}
                  disabled={isDownloading}
                  className="p-2 bg-slate-100 text-slate-600 rounded-lg active:scale-95 transition-all"
                  title="শেয়ার করুন"
                >
                  <Globe size={16} />
                </button>
              )}
              <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[10px] font-black shadow-md transition-all ${
                  isDownloading 
                  ? 'bg-slate-400 text-white cursor-not-allowed' 
                  : 'bg-indigo-600 text-white shadow-indigo-500/20 active:scale-95'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    প্রসেসিং...
                  </>
                ) : (
                  <>
                    <Download size={12} /> ডাউনলোড
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div 
            className="flex justify-center items-center bg-slate-100 rounded-[28px] border-2 border-dashed border-slate-200 overflow-hidden relative"
            style={{ height: `${450 * scale + 40}px` }}
          >
            <div 
              className="w-[800px] h-[450px] relative shrink-0 origin-center absolute shadow-2xl"
              style={{ 
                transform: `scale(${scale})`,
                transition: 'transform 0.2s ease-out'
              }}
            >
              {/* This is the actual element to be captured - NO TRANSFORMS HERE */}
              <div 
                ref={cardRef}
                className="w-[800px] h-[450px] bg-white flex overflow-hidden"
                style={{ 
                  fontFamily: "'Hind Siliguri', 'Inter', sans-serif",
                }}
              >
                {/* Left Sidebar - Dark Navy */}
                <div className="w-[110px] bg-[#2D3139] h-full flex flex-col items-center py-10 relative">
                  {/* User Icon Circle - Overlapping - Enlarged to match text height */}
                  <div className="absolute left-[60px] top-[50px] w-[135px] h-[135px] rounded-full bg-[#38BDF8] border-[5px] border-white flex items-center justify-center shadow-lg z-20 overflow-hidden">
                    {profileImage ? (
                      <img src={profileImage} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <User size={80} className="text-white" fill="white" />
                    )}
                  </div>

                  {/* Vertical Website Text - Centered Vertically and moved further left */}
                  <div className="absolute top-1/2 left-8 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                    <div 
                      className="text-[14px] font-black text-white/20 uppercase tracking-[0.2em]"
                      style={{ 
                        transform: 'rotate(-90deg)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      www.koyrabd.top
                    </div>
                  </div>

                  {/* Pill Container for other icons - Overlapping and slightly moved up */}
                  <div className="absolute left-[65px] top-[258px] w-[85px] bg-[#38BDF8] rounded-[50px] border-[4px] border-white flex flex-col items-center py-2 gap-0 shadow-lg z-20">
                    <div className="h-[30px] w-full flex items-center justify-center">
                      <Phone size={22} className="text-white" fill="white" />
                    </div>
                    <div className="h-[20px] w-full" /> {/* Gap to match space-y */}
                    <div className="h-[30px] w-full flex items-center justify-center">
                      <Globe size={22} className="text-white" fill="white" />
                    </div>
                    <div className="h-[20px] w-full" /> {/* Gap to match space-y */}
                    <div className="h-[30px] w-full flex items-center justify-center">
                      <MapPin size={22} className="text-white" fill="white" />
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col p-12 pl-28 relative">
                  {/* Top Info */}
                  <div className="space-y-0 mt-2">
                    <h1 className="text-[52px] font-black text-[#4F46E5] leading-[1] tracking-tight">{formData.name || 'আপনার নাম'}</h1>
                    <p className="text-[28px] font-bold text-[#2D3139] opacity-90 leading-tight">{formData.designation || 'আপনার পদবী'}</p>
                    <p className="text-[22px] font-bold text-[#2D3139] opacity-70 leading-tight">{formData.institution || 'প্রতিষ্ঠানের নাম'}</p>
                  </div>

                  {/* Contact Details - Aligned with icons and moved further down */}
                  <div className="absolute top-[265px] left-28 space-y-[20px]">
                    <div className="text-[30px] font-bold text-[#2D3139] opacity-70 tracking-tight leading-none h-[30px] flex items-center">{formData.mobile || 'মোবাইল নম্বর'}</div>
                    <div className="text-[30px] font-bold text-[#2D3139] opacity-70 tracking-tight leading-none h-[30px] flex items-center">{formData.email || 'ইমেইল ঠিকানা'}</div>
                    <div className="text-[30px] font-bold text-[#2D3139] opacity-70 tracking-tight leading-none h-[30px] flex items-center">{formData.address || 'আপনার ঠিকানা'}</div>
                  </div>

                  {/* QR Code in bottom right - Enlarged and Repositioned */}
                  <div className="absolute bottom-4 right-4 bg-white p-1.5 rounded-sm shadow-sm border border-slate-100">
                    <QRCodeSVG 
                      value={qrData}
                      size={125}
                      level="H"
                      includeMargin={false}
                    />
                  </div>

                  {/* Footer Text - Bottom Center */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <p className="text-[13px] font-black text-slate-500/60 whitespace-nowrap tracking-[0.15em] uppercase">কয়রা-পাইকগাছা কমিউনিটি এপস</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-widest">
            কার্ডটি ডাউনলোড করতে উপরে 'ডাউনলোড' বাটনে ক্লিক করুন। <br/>
            ডাউনলোড না হলে শেয়ার বাটনে ক্লিক করুন অথবা স্ক্রিনশট নিন।
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserEmergencyInfo;
