
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ArrowRight,
  Loader2,
  FolderOpen
} from 'lucide-react';
import { CATEGORIES } from '../constants';
import TraditionalHistory from '../components/TraditionalHistory';
import PublicTransport from '../components/PublicTransport';
import PublicLegal from '../components/PublicLegal';
import PublicDirectory from '../components/PublicDirectory';
import PublicNews from '../components/PublicNews';

// Firebase removed for paid hosting migration

const CategoryView: React.FC = () => {
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
        {category?.subMenus && category.subMenus.length > 0 ? (
            (subId ? (category?.subMenus.find(s=>s.id===subId)?.nestedSubMenus || []) : (category?.subMenus || [])).map((sub: any) => (
              <button key={sub.id} onClick={() => subId ? navigate(`/category/${id}/${subId}/${sub.id}`) : navigate(`/category/${id}/${sub.id}`)} className="flex items-center justify-between p-5 bg-white rounded-[24px] premium-card active:scale-[0.98] transition-all group text-left border border-slate-50">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-slate-50 rounded-2xl text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shadow-inner">
                      <ArrowRight size={20} />
                   </div>
                   <span className="font-black text-lg text-[#1A1A1A]">{sub.name}</span>
                </div>
                <ArrowRight size={20} className="text-slate-200 group-hover:text-blue-600 transition-colors" />
              </button>
            ))
          ) : <div className="py-20 text-center opacity-30">তথ্য সংরক্ষিত নেই।</div>
        }
      </div>
    </div>
  );
};

export default CategoryView;
