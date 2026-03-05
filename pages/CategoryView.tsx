
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ArrowRight,
  Loader2,
  FolderOpen,
  ChevronRight
} from 'lucide-react';
import { CATEGORIES, ICON_MAP } from '../constants';
import TraditionalHistory from '../components/TraditionalHistory';
import PublicTransport from '../components/PublicTransport';
import PublicLegal from '../components/PublicLegal';
import PublicDirectory from '../components/PublicDirectory';
import PublicNews from '../components/PublicNews';

// Firebase removed for paid hosting migration

interface CategoryViewProps {
  checkAccess?: (id: string, name: string) => boolean;
}

const CategoryView: React.FC<CategoryViewProps> = ({ checkAccess }) => {
  const { id, '*': splat } = useParams<{ id: string; '*': string }>();
  const navigate = useNavigate();
  const category = CATEGORIES.find(c => c.id === id);

  // Split splat into parts (e.g. "subId/busId" -> ["subId", "busId"])
  const pathParts = useMemo(() => splat ? splat.split('/').filter(Boolean) : [], [splat]);
  const subId = pathParts[0];
  const busId = pathParts[1];

  // SPECIAL ROUTING FOR LOCKED MODULES
  
  // Traditional History (ID 9) Logic
  if (id === '9' && busId) {
    return <TraditionalHistory busId={busId} onBack={() => navigate(-1)} />;
  }

  // Public Transport (ID 3) Logic
  if (id === '3') {
    return <PublicTransport subId={subId} busId={busId} onNavigate={(path) => navigate(path)} onBack={() => navigate(-1)} />;
  }

  // Public Legal Services (ID 4) Logic
  if (id === '4') {
    return <PublicLegal subId={subId} onNavigate={(path) => navigate(path)} onBack={() => navigate(-1)} />;
  }

  // Public News (ID 14) Logic - UPDATED TO BYPASS SELECTION
  if (id === '14') {
    return (
      <div className="bg-white min-h-screen">
        <PublicNews 
          onBack={() => navigate('/services')} 
        />
      </div>
    );
  }

  // Public Directory (ID 15) & Public Representatives (ID 22) Logic
  if (id === '15' || id === '22') {
    return (
      <div className="px-1.5 pt-0 pb-24 min-h-screen">
        <PublicDirectory 
          id={id} 
          pathParts={pathParts}
          categoryName={category?.name || (id === '15' ? 'মোবাইল নাম্বার' : 'জনপ্রতিনিধি')}
          onNavigate={(path) => navigate(path)} 
          onBack={() => navigate(-1)} 
        />
      </div>
    );
  }

  // Default Standard Sub-menu navigation (for other modules)
  const subMenuList = subId ? (category?.subMenus.find(s=>s.id===subId)?.nestedSubMenus || []) : (category?.subMenus || []);
  
  const SUB_MENU_COLORS = [
    { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
    { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
    { bg: 'bg-violet-50', text: 'text-violet-600', border: 'border-violet-100' },
    { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100' },
    { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100' },
    { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-100' },
  ];

  return (
    <div className="p-5 pb-20 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={() => navigate(-1)} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm transition-transform active:scale-90 shrink-0"><ChevronLeft size={24} /></button>
        <div className="text-left overflow-hidden">
          <h2 className="text-xl font-black text-slate-800 leading-tight truncate">{category?.name}</h2>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">তালিকা নির্বাচন করুন</p>
        </div>
      </div>

      <div className="grid gap-4">
        {subMenuList.length > 0 ? (
            subMenuList.map((sub: any, idx: number) => {
              const color = SUB_MENU_COLORS[idx % SUB_MENU_COLORS.length];
              const Icon = ICON_MAP[sub.icon] || FolderOpen;
              
              return (
                <button 
                  key={sub.id} 
                  onClick={() => subId ? navigate(`/category/${id}/${subId}/${sub.id}`) : navigate(`/category/${id}/${sub.id}`)} 
                  className="flex items-center justify-between p-5 bg-white rounded-[28px] shadow-sm active:scale-[0.98] transition-all group text-left border border-slate-50"
                >
                  <div className="flex items-center gap-4">
                     <div className={`p-3.5 ${color.bg} border ${color.border} rounded-2xl ${color.text} transition-all shadow-sm`}>
                        <Icon size={22} strokeWidth={2.5} />
                     </div>
                     <span className="font-black text-lg text-slate-800">{sub.name}</span>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl text-slate-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                    <ChevronRight size={18} strokeWidth={3} />
                  </div>
                </button>
              );
            })
          ) : <div className="py-20 text-center opacity-30">তথ্য সংরক্ষিত নেই।</div>
        }
      </div>
    </div>
  );
};

export default CategoryView;
