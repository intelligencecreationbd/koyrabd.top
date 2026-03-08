
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  ChevronLeft, 
  Plus, 
  Trash2, 
  X, 
  Loader2, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  History, 
  MapPin,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Wallet,
  ArrowRightLeft,
  UserPlus,
  Users,
  Banknote,
  ChevronDown,
  Edit2,
  Save,
  User as UserIcon,
  Smartphone,
  Download,
  FileText
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { User } from '../types';
import { ledgerDb } from '../Firebase-digitalledger';
import { collection, onSnapshot, doc, addDoc, updateDoc, deleteDoc, query, orderBy } from 'firebase/firestore';

const toBn = (num: string | number) => 
  (num || '০').toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[parseInt(d)]);

const convertToEn = (str: string) => {
  if (!str) return '';
  const bn = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'], en = ['0','1','2','3','4','5','6','7','8','9'];
  return str.toString().replace(/[০-৯]/g, (s) => en[bn.indexOf(s)]).replace(/[^0-9.]/g, '').trim();
};

interface PublicLedgerProps {
  user: User;
  onBack: () => void;
}

const PublicLedger: React.FC<PublicLedgerProps> = ({ user, onBack }) => {
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([]);
  // Form visibility states
  const [showLedgerForm, setShowLedgerForm] = useState(false);
  const [showDetailView, setShowDetailView] = useState(false);
  const [showPersonProfile, setShowPersonProfile] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [isEditingPerson, setIsEditingPerson] = useState(false);
  const [isAddingQuickTransaction, setIsAddingQuickTransaction] = useState(false);
  
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'pabo' | 'debo' | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<any | null>(null);
  const statementRef = useRef<HTMLDivElement>(null);
  const hiddenStatementRef = useRef<HTMLDivElement>(null);

  const [ledgerFormData, setLedgerFormData] = useState({
    personName: '', mobile: '', address: '', type: 'pabo' as 'pabo' | 'debo', amount: ''
  });

  const [personEditForm, setPersonEditForm] = useState({
    personName: '', mobile: '', address: ''
  });

  useEffect(() => {
    if (!user) return;
    const ledgerCollection = collection(ledgerDb, 'users', user.memberId, 'ledgers');
    const q = query(ledgerCollection);
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setLedgerEntries(list.sort((a: any, b: any) => (b.lastUpdate || b.createdAt).localeCompare(a.lastUpdate || a.createdAt)));
      
      if (selectedEntry) {
        const updated = list.find(e => e.id === selectedEntry.id);
        if (updated) setSelectedEntry(updated);
      }
    }, (error) => {
      console.error("Firestore error:", error);
      setLedgerEntries([]);
    });

    return () => unsubscribe();
  }, [user, selectedEntry?.id]);

  const ledgerSummary = useMemo(() => ledgerEntries.reduce((acc, entry) => {
    if (entry.dueAmount > 0) acc.totalPabo += entry.dueAmount;
    else if (entry.dueAmount < 0) acc.totalDebo += Math.abs(entry.dueAmount);
    return acc;
  }, { totalPabo: 0, totalDebo: 0 }), [ledgerEntries]);

  const filteredEntries = useMemo(() => {
    if (!activeFilter) return ledgerEntries;
    if (activeFilter === 'pabo') return ledgerEntries.filter(e => e.dueAmount > 0);
    return ledgerEntries.filter(e => e.dueAmount < 0);
  }, [ledgerEntries, activeFilter]);

  const handleLedgerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = convertToEn(ledgerFormData.amount);
    const amount = parseFloat(cleanAmount) || 0;
    
    if (amount <= 0) {
      alert('সঠিক টাকার পরিমাণ দিন');
      return;
    }
    
    setIsSubmitting(true);
    
    // Distinguish between adding a new person and updating selected person
    const isNewMemberAction = showLedgerForm;
    let targetEntry = isNewMemberAction ? null : selectedEntry;
    
    const currentBalance = targetEntry ? targetEntry.dueAmount : 0;
    let history = targetEntry?.history ? [...targetEntry.history] : [];
    let newBalance = currentBalance;
    
    const timestamp = new Date().toISOString();
    
    if (ledgerFormData.type === 'pabo') { 
      // Giving Money (I will get it back or it's a repayment of what I owe)
      if (currentBalance < 0) {
          // Case: I owed money (Balance < 0)
          const absoluteDebt = Math.abs(currentBalance);
          if (amount <= absoluteDebt) {
              // Entire amount is a repayment of my debt
              history.push({ date: timestamp, amount, type: 'pabo', note: 'পরিশোধ' });
          } else {
              // Amount is more than my debt
              const repaymentAmount = absoluteDebt;
              const loanGivenAmount = amount - absoluteDebt;
              // Add two entries
              history.push({ date: timestamp, amount: repaymentAmount, type: 'pabo', note: 'পরিশোধ' });
              history.push({ date: timestamp, amount: loanGivenAmount, type: 'pabo', note: 'হাওলাত দিয়েছি' });
          }
      } else {
          // Case: Balance was 0 or I was already owed money
          history.push({ date: timestamp, amount, type: 'pabo', note: 'হাওলাত দিয়েছি' });
      }
      newBalance += amount; 
    }
    else if (ledgerFormData.type === 'debo') { 
      // Taking Money (I will give it back or it's a repayment)
      if (currentBalance > 0) {
          // Case: I was owed money (Balance > 0)
          if (amount <= currentBalance) {
              // Entire amount is a repayment
              history.push({ date: timestamp, amount, type: 'debo', note: 'পরিশোধ' });
          } else {
              // Amount is more than my পাওনা
              const repaymentAmount = currentBalance;
              const loanTakenAmount = amount - currentBalance;
              // Add two entries
              history.push({ date: timestamp, amount: repaymentAmount, type: 'debo', note: 'পরিশোধ' });
              history.push({ date: timestamp, amount: loanTakenAmount, type: 'debo', note: 'হাওলাত নিয়েছি' });
          }
      } else {
          // Case: Balance was 0 or I already owed money
          history.push({ date: timestamp, amount, type: 'debo', note: 'হাওলাত নিয়েছি' });
      }
      newBalance -= amount; 
    }

    const entryId = targetEntry ? targetEntry.id : null;
    
    try {
      const newEntry = { 
        personName: targetEntry?.personName || ledgerFormData.personName, 
        mobile: targetEntry?.mobile || ledgerFormData.mobile, 
        address: targetEntry?.address || ledgerFormData.address, 
        dueAmount: newBalance, 
        history, 
        lastUpdate: timestamp, 
        createdAt: targetEntry?.createdAt || timestamp 
      };

      if (entryId) {
        const entryRef = doc(ledgerDb, 'users', user.memberId, 'ledgers', entryId);
        await updateDoc(entryRef, newEntry);
      } else {
        const ledgerCollection = collection(ledgerDb, 'users', user.memberId, 'ledgers');
        await addDoc(ledgerCollection, newEntry);
      }
      
      setShowLedgerForm(false);
      setIsAddingQuickTransaction(false);
      setLedgerFormData({ personName: '', mobile: '', address: '', type: 'pabo', amount: '' });
    } catch (err: any) { 
      console.error('Ledger Submit Error:', err);
      alert(`ত্রুটি! তথ্য সংরক্ষণ করা যায়নি। সম্ভব হলে আপনার ইন্টারনেট কানেকশন এবং ফায়ারবেস ডাটাবেস রুলস (Rules) চেক করুন। এরর: ${err.message || 'Unknown'}`); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleUpdatePersonInfo = async () => {
    if (!selectedEntry || !user || !personEditForm.personName) return;
    setIsSubmitting(true);
    try {
      const entryRef = doc(ledgerDb, 'users', user.memberId, 'ledgers', selectedEntry.id);
      await updateDoc(entryRef, {
        personName: personEditForm.personName,
        mobile: personEditForm.mobile,
        address: personEditForm.address
      });

      setIsEditingPerson(false);
      alert('তথ্য সফলভাবে আপডেট হয়েছে।');
    } catch (e) {
      alert('আপডেট করা সম্ভব হয়নি!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async () => {
    if (!entryToDelete || !user) return;
    try {
      const entryRef = doc(ledgerDb, 'users', user.memberId, 'ledgers', entryToDelete.id);
      await deleteDoc(entryRef);
      
      setEntryToDelete(null);
      setShowPersonProfile(false);
      setShowDetailView(false);
      setSelectedEntry(null);
    } catch (e) {
      alert('মুছে ফেলা সম্ভব হয়নি!');
    }
  };

  const handleDownloadPDF = async () => {
    const targetRef = showStatement ? statementRef.current : hiddenStatementRef.current;
    if (!targetRef) return;
    
    setIsSubmitting(true);
    try {
      const canvas = await html2canvas(targetRef, {
        scale: 3,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width / 3, canvas.height / 3]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 3, canvas.height / 3);
      pdf.save(`Ledger_Statement_${user.memberId}.pdf`);
    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('পিডিএফ ডাউনলোড করতে সমস্যা হচ্ছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-4 shrink-0 px-2 py-2 bg-slate-50/50 border border-slate-100 rounded-2xl shadow-sm mx-1">
        <button onClick={onBack} className="p-2 bg-white border border-slate-100 rounded-xl shadow-sm active:scale-90 transition-all"><ChevronLeft size={18} /></button>
        <div className="text-center">
          <h2 className="text-lg font-black text-slate-800 leading-tight">আমার লেনদেন</h2>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ব্যক্তিগত ডিজিটাল খাতা</p>
        </div>
        <button 
          onClick={() => {
            setSelectedEntry(null); // Ensure no old member is selected when adding new
            setLedgerFormData({ personName: '', mobile: '', address: '', type: 'pabo', amount: '' });
            setShowLedgerForm(true);
          }} 
          className="w-10 h-10 bg-[#0056b3] text-white rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar pb-40 space-y-4">
        <div className="grid grid-cols-3 gap-2 px-1">
          <button onClick={() => setActiveFilter(activeFilter === 'pabo' ? null : 'pabo')} className={`p-3 rounded-2xl flex flex-col gap-0.5 text-center border transition-all duration-300 ${activeFilter === 'pabo' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md scale-[1.02]' : 'bg-emerald-50/60 border-emerald-100 text-emerald-800'}`}>
            <span className="text-[8px] font-black uppercase tracking-tighter">দেনাদার (পাবো)</span>
            <span className="text-sm font-black">৳ {toBn(ledgerSummary.totalPabo)}</span>
          </button>
          <button onClick={() => setActiveFilter(activeFilter === 'debo' ? null : 'debo')} className={`p-3 rounded-2xl flex flex-col gap-0.5 text-center border transition-all duration-300 ${activeFilter === 'debo' ? 'bg-rose-500 text-white border-rose-500 shadow-md scale-[1.02]' : 'bg-rose-50/60 border-rose-100 text-rose-800'}`}>
            <span className="text-[8px] font-black uppercase tracking-tighter">পাওনাদার (দেবো)</span>
            <span className="text-sm font-black">৳ {toBn(ledgerSummary.totalDebo)}</span>
          </button>
          {(() => {
            const balance = ledgerSummary.totalPabo - ledgerSummary.totalDebo;
            const isAsset = balance >= 0;
            return (
              <div className={`p-3 rounded-2xl flex flex-col gap-0.5 text-center border transition-all duration-300 ${isAsset ? 'bg-blue-500 text-white border-blue-500 shadow-md' : 'bg-red-500 text-white border-red-500 shadow-md'}`}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-[8px] font-black uppercase tracking-tighter">ব্যালেন্স</span>
                  <span className="text-[7px] font-bold bg-white/20 px-1 rounded uppercase">{isAsset ? 'সম্পদ' : 'ঋণ'}</span>
                </div>
                <span className="text-sm font-black">৳ {toBn(Math.abs(balance))}</span>
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-3 gap-2 px-1">
          <button 
            onClick={() => setShowStatement(true)}
            className="col-span-2 flex items-center justify-center gap-2 py-3.5 bg-slate-800 text-white rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all"
          >
            <FileText size={16} /> হিসাব সামারী
          </button>
          <button 
            onClick={handleDownloadPDF}
            disabled={isSubmitting}
            className="col-span-1 flex items-center justify-center gap-2 py-3.5 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} /> ডাউনলোড</>}
          </button>
        </div>

        <div className="space-y-4 px-1">
          {filteredEntries.length === 0 ? (
            <div className="py-24 text-center opacity-30 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200">
                <Wallet size={40} />
              </div>
              <p className="font-black text-slate-400 text-sm uppercase tracking-widest">কোনো লেনদেন পাওয়া যায়নি</p>
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div 
                key={entry.id} 
                onClick={() => { 
                  setSelectedEntry(entry); 
                  setShowDetailView(true); 
                  setIsAddingQuickTransaction(false); 
                }} 
                className="w-full bg-white py-3 px-5 rounded-[25px] border border-slate-100 shadow-sm flex items-center justify-between active:scale-[0.98] transition-all group cursor-pointer"
              >
                <div className="flex gap-3 items-center overflow-hidden">
                  <div className={`w-11 h-11 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm border ${entry.dueAmount > 0 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {entry.dueAmount > 0 ? <ArrowDownToLine size={20} /> : <ArrowUpFromLine size={20} />}
                  </div>
                  <div className="flex-1 overflow-hidden text-left">
                    <p className="font-black text-slate-800 text-base truncate">{entry.personName}</p>
                    <div className="flex items-center gap-2">
                       <p className={`text-[9px] font-black uppercase ${entry.dueAmount > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                         {entry.dueAmount > 0 ? 'পাবো' : 'দেবো'} • ৳ {toBn(Math.abs(entry.dueAmount))}
                       </p>
                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-tighter">• {toBn(entry.history?.length || 0)} এন্ট্রি</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEntry(entry);
                    setLedgerFormData({
                      personName: entry.personName,
                      mobile: entry.mobile,
                      address: entry.address,
                      type: 'pabo',
                      amount: ''
                    });
                    setShowDetailView(true);
                    setIsAddingQuickTransaction(true);
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all active:scale-90"
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* New Member Modal */}
      {showLedgerForm && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 shadow-2xl max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 text-left no-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-xl text-slate-800">নতুন সদস্য যোগ করুন</h3>
                    <button onClick={() => { setShowLedgerForm(false); setSelectedEntry(null); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-red-500 transition-all active:scale-90"><X size={24}/></button>
                </div>

                <form onSubmit={handleLedgerSubmit} className="space-y-6">
                    <div className="space-y-4 animate-in fade-in duration-500">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">নাম *</label>
                            <input 
                                required
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400 shadow-sm"
                                placeholder="সদস্যের নাম"
                                value={ledgerFormData.personName}
                                onChange={e => setLedgerFormData({...ledgerFormData, personName: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">মোবাইল</label>
                                <input 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400 shadow-sm"
                                    placeholder="০১xxxxxxxxx"
                                    value={ledgerFormData.mobile}
                                    onChange={e => setLedgerFormData({...ledgerFormData, mobile: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ঠিকানা</label>
                                <input 
                                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400 shadow-sm"
                                    placeholder="গ্রাম/ইউনিয়ন"
                                    value={ledgerFormData.address}
                                    onChange={e => setLedgerFormData({...ledgerFormData, address: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">লেনদেনের ধরণ</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setLedgerFormData({...ledgerFormData, type: 'pabo'})}
                                    className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'pabo' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md' : 'bg-white text-emerald-600 border-emerald-100'}`}
                                >
                                    দিয়েছি (পাবো)
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setLedgerFormData({...ledgerFormData, type: 'debo'})}
                                    className={`py-3 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'debo' ? 'bg-rose-500 text-white border-rose-500 shadow-md' : 'bg-white text-rose-600 border-rose-100'}`}
                                >
                                    নিয়েছি (দেবো)
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">টাকার পরিমাণ (৳) *</label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Banknote size={20}/></div>
                                <input 
                                    required
                                    type="number"
                                    className="w-full pl-14 pr-5 py-5 bg-slate-50 border border-slate-100 rounded-3xl font-black text-xl text-slate-800 outline-none focus:border-blue-400 shadow-inner"
                                    placeholder="০.০০"
                                    value={ledgerFormData.amount}
                                    onChange={e => setLedgerFormData({...ledgerFormData, amount: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className="w-full py-5 bg-[#0056b3] text-white font-black rounded-3xl shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Plus size={20}/> সদস্য যোগ করুন</>}
                    </button>
                </form>
            </div>
        </div>
      )}
      
      {/* Entry Detail Modal */}
      {showDetailView && selectedEntry && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 shadow-2xl max-h-[95vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 text-left no-scrollbar">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4 group">
                       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border bg-emerald-50 text-emerald-600 border-emerald-100`}>
                          <Download size={24} />
                       </div>
                       <div className="overflow-hidden">
                          <h3 className="font-black text-2xl text-slate-800 leading-tight truncate">{selectedEntry.personName}</h3>
                          <button 
                            onClick={() => {
                              setPersonEditForm({
                                personName: selectedEntry.personName,
                                mobile: selectedEntry.mobile || '',
                                address: selectedEntry.address || ''
                              });
                              setIsEditingPerson(false);
                              setShowPersonProfile(true);
                            }}
                            className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5 hover:underline"
                          >
                            বিস্তারিত তথ্য দেখতে ক্লিক করুন
                          </button>
                       </div>
                    </div>
                    <button onClick={() => { setShowDetailView(false); setIsAddingQuickTransaction(false); setSelectedEntry(null); }} className="p-3 bg-slate-50 rounded-2xl text-slate-400 shrink-0 active:scale-90"><X size={24}/></button>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="p-5 bg-slate-50/50 rounded-[30px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">ব্যালেন্স</p>
                        <p className={`text-2xl font-black ${selectedEntry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {toBn(Math.abs(selectedEntry.dueAmount))}</p>
                    </div>
                    <div className="p-5 bg-slate-50/50 rounded-[30px] border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">অবস্থা</p>
                        <p className={`text-2xl font-black ${selectedEntry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{selectedEntry.dueAmount >= 0 ? 'পাবো' : 'দেবো'}</p>
                    </div>
                </div>

                {/* NEW TRANSACTION SECTION */}
                <div className="mt-2 mb-8">
                    {isAddingQuickTransaction ? (
                        <form onSubmit={handleLedgerSubmit} className="space-y-5 animate-in slide-in-from-bottom-2 duration-300 bg-slate-50/50 p-6 rounded-[35px] border border-slate-100">
                             <div className="flex justify-between items-center mb-1">
                                <h4 className="font-black text-sm text-slate-800 uppercase tracking-widest">নতুন এন্ট্রি</h4>
                                <button type="button" onClick={() => setIsAddingQuickTransaction(false)} className="text-slate-400"><X size={18}/></button>
                             </div>
                             
                             <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button" 
                                        onClick={() => setLedgerFormData({...ledgerFormData, type: 'pabo'})}
                                        className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'pabo' ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-emerald-600 border-emerald-100'}`}
                                    >
                                        দিচ্ছি
                                    </button>
                                    <button 
                                        type="button" 
                                        onClick={() => setLedgerFormData({...ledgerFormData, type: 'debo'})}
                                        className={`py-4 rounded-2xl text-[11px] font-black uppercase tracking-tighter transition-all border ${ledgerFormData.type === 'debo' ? 'bg-rose-600 text-white border-rose-600 shadow-md' : 'bg-white text-rose-600 border-rose-100'}`}
                                    >
                                        নিচ্ছি
                                    </button>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">টাকার পরিমাণ (৳)</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"><Banknote size={20}/></div>
                                        <input 
                                            required
                                            autoFocus
                                            type="number"
                                            className="w-full pl-14 pr-5 py-5 bg-white border border-slate-200 rounded-[24px] font-black text-xl text-slate-800 outline-none focus:border-blue-400 shadow-inner"
                                            placeholder="০.০০"
                                            value={ledgerFormData.amount}
                                            onChange={e => setLedgerFormData({...ledgerFormData, amount: e.target.value})}
                                        />
                                    </div>
                                </div>
                                
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full py-5 bg-blue-600 text-white font-black rounded-3xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'লেনদেন সেভ করুন'}
                                </button>
                             </div>
                        </form>
                    ) : (
                        <button 
                            onClick={() => {
                                setLedgerFormData({
                                    personName: selectedEntry.personName,
                                    mobile: selectedEntry.mobile,
                                    address: selectedEntry.address,
                                    type: 'pabo',
                                    amount: ''
                                });
                                setIsAddingQuickTransaction(true);
                            }}
                            className="w-full py-5 bg-blue-600 text-white rounded-[28px] font-black text-base active:scale-95 transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-3"
                        >
                            <Plus size={22} strokeWidth={3} /> নতুন লেনদেন যোগ করুন
                        </button>
                    )}
                </div>

                {/* TRANSACTION HISTORY SECTION */}
                {!isAddingQuickTransaction && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center gap-2 mb-2">
                           <History size={16} className="text-blue-500" />
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">লেনদেনের ইতিহাস</p>
                        </div>
                        <div className="space-y-3">
                            {(selectedEntry.history || []).slice().reverse().map((h: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-[28px] shadow-sm animate-in fade-in">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${h.type === 'pabo' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                          {h.type === 'pabo' ? <Download size={18}/> : <Plus size={18} className="rotate-45" />}
                                       </div>
                                       <div>
                                          <p className="text-sm font-black text-slate-800">{h.note}</p>
                                          <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{toBn(new Date(h.date).toLocaleDateString('bn-BD'))} • {toBn(new Date(h.date).toLocaleTimeString('bn-BD', {hour:'2-digit', minute:'2-digit'}))}</p>
                                       </div>
                                    </div>
                                    <p className={`font-black text-base ${h.type === 'pabo' ? 'text-emerald-600' : 'text-rose-600'}`}>৳ {toBn(h.amount)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Person Profile Modal */}
      {showPersonProfile && selectedEntry && (
        <div className="fixed inset-0 z-[160] bg-slate-900/60 backdrop-blur-md flex items-end justify-center">
            <div className="bg-white w-full max-w-md rounded-t-[45px] p-8 shadow-2xl max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-500 text-left no-scrollbar">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="font-black text-xl text-slate-800">{isEditingPerson ? 'তথ্য সংশোধন' : 'ব্যক্তিগত তথ্য'}</h3>
                    <button onClick={() => setShowPersonProfile(false)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 active:scale-90"><X size={24}/></button>
                </div>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-[35px] bg-slate-50 border-4 border-white shadow-xl flex items-center justify-center text-slate-200 overflow-hidden">
                            {selectedEntry.photoURL ? <img src={selectedEntry.photoURL} className="w-full h-full object-cover" /> : <UserIcon size={48} />}
                        </div>
                    </div>
                </div>

                {isEditingPerson ? (
                    <div className="space-y-5 animate-in fade-in duration-300">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">নাম *</label>
                            <input 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400"
                                value={personEditForm.personName}
                                onChange={e => setPersonEditForm({...personEditForm, personName: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">মোবাইল নম্বর</label>
                            <input 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400"
                                value={personEditForm.mobile}
                                onChange={e => setPersonEditForm({...personEditForm, mobile: e.target.value})}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">ঠিকানা</label>
                            <input 
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-800 outline-none focus:border-blue-400"
                                value={personEditForm.address}
                                onChange={e => setPersonEditForm({...personEditForm, address: e.target.value})}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="p-5 bg-slate-50/50 rounded-[30px] border border-slate-100 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><UserIcon size={18}/></div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">নাম</p>
                                   <p className="text-base font-black text-slate-800">{selectedEntry.personName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><Smartphone size={18}/></div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">মোবাইল</p>
                                   <p className="text-base font-black text-slate-800 font-inter tracking-tight">{selectedEntry.mobile || 'নম্বর নেই'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm"><MapPin size={18}/></div>
                                <div>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">ঠিকানা</p>
                                   <p className="text-base font-black text-slate-800">{selectedEntry.address || 'ঠিকানা নেই'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-10 flex gap-3 pb-6">
                    {isEditingPerson ? (
                        <>
                            <button onClick={() => setIsEditingPerson(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-sm active:scale-95 transition-all">বাতিল</button>
                            <button onClick={handleUpdatePersonInfo} disabled={isSubmitting} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
                                {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> সেভ করুন</>}
                            </button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => setIsEditingPerson(true)} className="flex-1 py-4 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2"><Edit2 size={18}/> এডিট</button>
                            <button onClick={() => setEntryToDelete(selectedEntry)} className="flex-1 py-4 bg-red-50 text-red-500 border border-red-100 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2"><Trash2 size={18}/> মুছুন</button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

      {entryToDelete && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-xs rounded-[40px] p-8 shadow-2xl text-center space-y-6 animate-in zoom-in duration-300 border border-white/20">
                <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center text-red-500 mx-auto">
                    <AlertTriangle size={40} />
                </div>
                <div>
                    <h4 className="font-black text-xl text-slate-800">আপনি কি নিশ্চিত?</h4>
                    <p className="text-sm font-bold text-slate-400 mt-2 leading-relaxed">এই ব্যক্তির সকল লেনদেনের তথ্য চিরতরে মুছে যাবে।</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setEntryToDelete(null)} className="py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs active:scale-95 transition-all">বাতিল</button>
                    <button onClick={handleDeleteEntry} className="py-4 bg-red-600 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">হ্যাঁ, মুছুন</button>
                </div>
            </div>
        </div>
      )}

      {/* Hidden Statement for PDF Generation */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none overflow-hidden h-0">
        <div ref={hiddenStatementRef} className="p-10 w-[800px] bg-white space-y-8">
          {/* Statement Header */}
          <div className="text-center pb-6 border-b-4 border-black">
            <p className="text-2xl font-black text-red-600 uppercase tracking-widest mb-1">ডিজিটাল খাতা</p>
            <h1 className="text-4xl font-black text-blue-600 leading-none mb-3">কয়রা-পাইকগাছা কমিউনিটি এপস</h1>
            <div className="space-y-1">
              <p className="text-xl font-bold text-black tracking-widest">www.koyrabd.top</p>
              <p className="text-lg font-bold text-black tracking-widest">info@koyrabd.top</p>
            </div>
          </div>

          {/* User Info Section */}
          <div className="flex items-center gap-6 pb-4 border-b-2 border-red-500 w-fit pr-16">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-slate-200 shrink-0 shadow-md">
              {user.photoURL ? (
                <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                  <UserIcon size={48} />
                </div>
              )}
            </div>
            <div className="text-left space-y-1">
              <h3 className="text-2xl font-black text-slate-800">{user.fullName}</h3>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">ID: {user.memberId}</p>
              <p className="text-lg font-black text-slate-600">{user.mobile}</p>
            </div>
          </div>

          {/* Transaction Table */}
          <div className="overflow-hidden border-2 border-slate-200 rounded-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-200">
                  <th className="py-4 px-6 text-sm font-black text-slate-500 uppercase tracking-widest">ব্যক্তির তথ্য</th>
                  <th className="py-4 px-6 text-sm font-black text-slate-500 uppercase tracking-widest text-right">দেনাদার / পাওনাদার</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {ledgerEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="py-4 px-6">
                      <p className="font-black text-slate-800 text-lg">{entry.personName}</p>
                      <p className="text-sm font-bold text-slate-400">{entry.address || 'ঠিকানা নেই'}</p>
                      <p className="text-sm font-bold text-slate-400">{entry.mobile || 'মোবাইল নেই'}</p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <p className={`font-black text-lg ${entry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {entry.dueAmount >= 0 ? 'পাবো' : 'দেবো'}
                      </p>
                      <p className={`font-black text-2xl ${entry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        ৳ {toBn(Math.abs(entry.dueAmount))}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
              {ledgerEntries.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 font-black border-t-2 border-slate-200">
                    <td className="py-4 px-6 text-lg text-slate-800">মোট হিসাব</td>
                    <td className="py-4 px-6 text-right">
                      <div className="space-y-1">
                        <p className="text-base text-emerald-600">পাবো: ৳ {toBn(ledgerSummary.totalPabo)}</p>
                        <p className="text-base text-rose-600">দেবো: ৳ {toBn(ledgerSummary.totalDebo)}</p>
                      </div>
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-between items-end opacity-60">
            <div className="text-xs font-bold uppercase tracking-widest">
              তৈরি করা হয়েছেঃ {new Date().toLocaleString('bn-BD')}
            </div>
            <div className="text-xs font-bold uppercase tracking-widest">
              ধন্যবাদ, এপসটি বন্ধুদের সাথে শেয়ার করুন
            </div>
          </div>
        </div>
      </div>

      {/* Account Statement View */}
      {showStatement && (
        <div className="fixed inset-0 z-[250] bg-white overflow-y-auto no-scrollbar animate-in slide-in-from-bottom duration-500">
          <div ref={statementRef} className="p-4 pt-2 max-w-2xl mx-auto space-y-4 bg-white">
            {/* Close Button */}
            <div className="flex justify-end print:hidden" data-html2canvas-ignore>
              <button 
                onClick={() => setShowStatement(false)} 
                className="p-2 bg-slate-100 rounded-xl text-slate-500 active:scale-90 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Statement Header */}
            <div className="text-center pb-2 border-b-2 border-black">
              <p className="text-sm font-black text-red-600 uppercase tracking-widest mb-0.5">ডিজিটাল খাতা</p>
              <h1 className="text-xl font-black text-blue-600 leading-none mb-1">কয়রা-পাইকগাছা কমিউনিটি এপস</h1>
              <div className="space-y-0">
                <p className="text-xs font-bold text-black tracking-widest leading-tight">www.koyrabd.top</p>
                <p className="text-[10px] font-bold text-black tracking-widest leading-tight">info@koyrabd.top</p>
              </div>
            </div>

            {/* User Info Section */}
            <div className="flex items-center gap-4 pb-2 border-b border-red-500 w-fit pr-10">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-200 shrink-0 shadow-sm">
                {user.photoURL ? (
                  <img src={user.photoURL} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                    <UserIcon size={32} />
                  </div>
                )}
              </div>
              <div className="text-left space-y-0">
                <h3 className="text-lg font-black text-slate-800 leading-tight">{user.fullName}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-tight">ID: {user.memberId}</p>
                <p className="text-xs font-black text-slate-600 leading-tight">{user.mobile}</p>
              </div>
            </div>

            {/* Transaction Table */}
            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ব্যক্তির তথ্য</th>
                    <th className="py-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">দেনাদার / পাওনাদার</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2 px-4">
                        <p className="font-black text-slate-800 text-sm">{entry.personName}</p>
                        <p className="text-[10px] font-bold text-slate-400 leading-tight">{entry.address || 'ঠিকানা নেই'}</p>
                        <p className="text-[10px] font-bold text-slate-400 leading-tight">{entry.mobile || 'মোবাইল নেই'}</p>
                      </td>
                      <td className="py-2 px-4 text-right">
                        <p className={`font-black text-sm leading-tight ${entry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {entry.dueAmount >= 0 ? 'পাবো' : 'দেবো'}
                        </p>
                        <p className={`font-black text-base leading-tight ${entry.dueAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          ৳ {toBn(Math.abs(entry.dueAmount))}
                        </p>
                      </td>
                    </tr>
                  ))}
                  {ledgerEntries.length === 0 && (
                    <tr>
                      <td colSpan={2} className="p-10 text-center text-slate-300 font-bold italic">কোনো লেনদেন পাওয়া যায়নি</td>
                    </tr>
                  )}
                </tbody>
                {ledgerEntries.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 font-black">
                      <td className="py-2 px-4 text-sm text-slate-800">মোট হিসাব</td>
                      <td className="py-2 px-4 text-right">
                        <div className="space-y-0">
                          <p className="text-xs text-emerald-600 leading-tight">পাবো: ৳ {toBn(ledgerSummary.totalPabo)}</p>
                          <p className="text-xs text-rose-600 leading-tight">দেবো: ৳ {toBn(ledgerSummary.totalDebo)}</p>
                        </div>
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Footer / Print Info */}
            <div className="pt-1 flex justify-between items-end opacity-50">
              <div className="text-[8px] font-bold uppercase tracking-widest">
                তৈরি করা হয়েছেঃ {new Date().toLocaleString('bn-BD')}
              </div>
              <div className="text-[8px] font-bold uppercase tracking-widest">
                ধন্যবাদ, এপসটি বন্ধুদের সাথে শেয়ার করুন
              </div>
            </div>

            {/* Print Button */}
            <div className="flex justify-center pt-6 print:hidden" data-html2canvas-ignore>
              <button 
                onClick={handleDownloadPDF}
                disabled={isSubmitting}
                className="px-8 py-4 bg-blue-600 text-white rounded-[24px] font-black text-sm shadow-xl shadow-blue-500/20 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <><Download size={20} /> ডাউনলোড পিডিএফ</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicLedger;
