import React, { useState } from 'react';
import { 
  BarChart3, 
  LayoutDashboard, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  Trash2, 
  RotateCcw,
  ShieldCheck,
  Search,
  Bell,
  Clock,
  Calendar,
  User,
  Phone,
  ListFilter,
  CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Complaint, DailyStats } from '../types';
import { cn } from '../lib/utils';
import { LOGO_BASE64 } from '../assets/logo_base64';

interface DashboardTabProps {
  complaints: Complaint[];
  stats: DailyStats[];
  dashLogs?: { id: string; time: string; action: string; details: string; }[];
  onClearDashLogs?: () => void;
  onClearStats: () => void;
  onClearComplaints: () => void;
  onClearAll: () => void;
}

export default function DashboardTab({ 
  complaints, 
  stats, 
  dashLogs = [], 
  onClearDashLogs,
  onClearStats, 
  onClearComplaints, 
  onClearAll 
}: DashboardTabProps) {
  const [adminCode, setAdminCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [searchDoneQuery, setSearchDoneQuery] = useState('');
  
  // Calculate general achievements
  const totalCompletedStats = stats.reduce((acc, s) => acc + s.completedComplaints, 0);
  const totalCleaning = stats.reduce((acc, s) => acc + s.cleaningViolations, 0);
  const totalRoads = stats.reduce((acc, s) => acc + s.roadObstructions, 0);
  const totalUndertakings = stats.reduce((acc, s) => acc + s.undertakings, 0);
  const totalWarnings = stats.reduce((acc, s) => acc + s.warnings, 0);

  // Filter complaints that are unsolved and pending for 6 days or more
  const unresolvedDelayed = complaints.filter(c => {
    if (c.status === 'done') return false;
    const compDate = new Date(c.date);
    const now = new Date();
    // Calculate difference in whole days
    const diffTime = Math.abs(now.getTime() - compDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 6;
  }).map(c => {
    const compDate = new Date(c.date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - compDate.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return { ...c, elapsedDays: diffDays };
  });

  // Solved complaints breakdown
  const doneComplaints = complaints.filter(c => c.status === 'done');
  
  // Calculate completed versus total per category
  const categoriesList = Array.from(new Set(complaints.map(c => c.category)));
  const categoryStats = categoriesList.map(cat => {
    const totalInCat = complaints.filter(c => c.category === cat).length;
    const resolvedInCat = complaints.filter(c => c.category === cat && c.status === 'done').length;
    const percentage = totalInCat > 0 ? Math.round((resolvedInCat / totalInCat) * 100) : 0;
    return { name: cat, total: totalInCat, resolved: resolvedInCat, percentage };
  }).sort((a, b) => b.percentage - a.percentage);

  // Search filtered done complaints
  const filteredDoneComplaints = doneComplaints.filter(c => {
    const term = searchDoneQuery.toLowerCase();
    return (
      c.complainantName.toLowerCase().includes(term) ||
      c.category.toLowerCase().includes(term) ||
      c.id.toLowerCase().includes(term) ||
      c.inspectorName.toLowerCase().includes(term) ||
      c.details.toLowerCase().includes(term)
    );
  });

  const handleClear = (callback: () => void) => {
    if (adminCode === '139') {
      callback();
      setAdminCode('');
    } else {
      setIsVerifying(true);
      setTimeout(() => setIsVerifying(false), 2000);
    }
  };

  return (
    <div className="space-y-8 text-right" style={{ direction: 'rtl' }}>
      
      {/* Kuwait Municipality Official Banner Custom Crafted */}
      <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-gray-150 dark:border-slate-800 bg-gradient-to-l from-[#0e2c4d] via-[#163f69] to-[#1f4c7d] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Right side: Text details */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-3">
            {/* Tiny gold Accent */}
            <span className="w-1.5 h-8 bg-amber-400 rounded-full animate-pulse"></span>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-wide bg-gradient-to-r from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                بلدية الكويت
              </h2>
              <p className="text-xs sm:text-sm text-amber-300 font-extrabold mt-1 font-sans">
                البرنامج الرسمي لمراكز النظافة وإشغالات الطرق لبلدية دولة الكويت
              </p>
            </div>
          </div>
          
          <p className="text-sm sm:text-base text-gray-100 font-bold max-w-2xl leading-relaxed">
            النظام الخاص بمتابعة الشكاوى والمراسلات الصادرة والواردة، وإعداد الكشوف والتقارير الميدانية لقطاع النظافة لبلدية الكويت - مركز 139 المطور.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            <span className="px-3 py-1 bg-white/10 dark:bg-slate-900/40 text-xs text-white border border-white/10 rounded-full font-bold">برنامج البلديه 139</span>
            <span className="px-3 py-1 bg-amber-400/25 text-xs text-amber-200 border border-amber-400/20 rounded-full font-bold">دولة الكويت</span>
            <span className="px-3 py-1 bg-emerald-400/25 text-xs text-emerald-200 border border-emerald-400/20 rounded-full font-bold">تحديث تلقائي</span>
          </div>
        </div>

        {/* Left side: "Logo 1" (شعار واحد) representing Kuwait Municipality cleanly */}
        <div className="w-36 h-36 sm:w-44 sm:h-44 bg-white rounded-2xl overflow-hidden shadow-md border border-white/20 flex items-center justify-center shrink-0">
          <img 
            src={LOGO_BASE64} 
            alt="شعار بلدية الكويت الرسمية" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>

      </div>

      {/* 1. Critical Delay Alerts Area: "وفي حال تسجيل شكوى لفتره 6 ايام او اكثر يخبرني ان هناك شكوى غير منجزه" */}
      <AnimatePresence>
        {unresolvedDelayed.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-r from-red-50 to-amber-50 border-r-8 border-red-500 rounded-3xl p-6 shadow-sm ring-1 ring-red-100"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-red-100/70 mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-650 rounded-2xl animate-pulse">
                  <AlertCircle size={24} />
                </div>
                <div>
                  <h3 className="text-md sm:text-lg font-black text-red-950">🚨 إنذار فني: توجد شكاوى معلقة لأكثر من 6 أيام دون حل!</h3>
                  <p className="text-xs text-red-700/90 font-bold mt-0.5">يرجى متابعة المفتشين المعنيين لإتمام جرد ومعالجة المعاملات المتأخرة فوراً.</p>
                </div>
              </div>
              <span className="bg-red-600 text-white text-xs px-3.5 py-1.5 rounded-full font-black animate-bounce shadow">
                {unresolvedDelayed.length} شكاوى متأخرة
              </span>
            </div>

            {/* List of delayed unresolved complaints */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {unresolvedDelayed.slice(0, 6).map((c) => (
                <div key={c.id} className="bg-white/80 p-4 rounded-2xl border border-red-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] bg-slate-100 font-bold text-slate-600 px-2 py-0.5 rounded-md">
                        رمز المعاملة: {c.id.substring(0, 6).toUpperCase()}
                      </span>
                      <span className="text-xs font-black text-red-605 bg-red-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Clock size={12} /> مضى عليها {c.elapsedDays} أيام
                      </span>
                    </div>
                    <h4 className="font-extrabold text-xs text-slate-800 truncate">{c.category}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{c.details}</p>
                  </div>

                  <div className="border-t border-slate-100/80 pt-2.5 mt-3 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-bold text-indigo-700">المفتش: {c.inspectorName}</span>
                    <span className="font-mono">{c.date}</span>
                  </div>
                </div>
              ))}
              {unresolvedDelayed.length > 6 && (
                <div className="bg-red-500/5 border border-dashed border-red-200 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
                  <p className="text-red-900 font-extrabold text-sm mb-1">ويوجد {unresolvedDelayed.length - 6} شكاوى أخرى معلقة</p>
                  <p className="text-xs text-red-600">اذهب لتبويب إدارة الشكاوى لرؤية التفاصيل الكاملة.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary General Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="municipal-card p-6 bg-gradient-to-br from-[#0e2c4d] via-[#163f69] to-[#1f4c7d] border border-[#1f4c7d]/40 text-white relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-x-12 -translate-y-12 group-hover:scale-110 transition-transform duration-300" />
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/10 rounded-xl"><LayoutDashboard size={22} className="text-municipality-gold" /></div>
            <span className="text-[11px] font-black text-white/60">إجمالي المعاملات</span>
          </div>
          <div className="text-4xl font-black mb-1 tracking-tight">{complaints.length}</div>
          <p className="text-xs text-white/50 font-bold">شكوى مقيدة بالمنظومة</p>
        </div>

        <div className="municipal-card p-6 border-r-4 border-r-[#11335c] border border-[#163f69]/20 relative bg-white shadow hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-[#11335c] rounded-xl"><CheckCircle2 size={22} /></div>
            <span className="text-[11px] font-bold text-gray-400">المنجزة بالكامل</span>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{doneComplaints.length}</div>
          <p className="text-xs text-gray-400 font-bold">شكوى تم حلها وإغلاقها</p>
        </div>

        <div className="municipal-card p-6 border-r-4 border-r-[#163f69] border border-[#163f69]/20 relative bg-white shadow hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-[#163f69] rounded-xl"><AlertCircle size={22} /></div>
            <span className="text-[11px] font-bold text-gray-400">مخالفات محررة فنية</span>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{totalCleaning}</div>
          <p className="text-xs text-gray-400 font-bold">محضر ضبط مخالفات</p>
        </div>

        <div className="municipal-card p-6 border-r-4 border-r-[#1f4c7d] border border-[#163f69]/20 relative bg-white shadow hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50 text-[#1f4c7d] rounded-xl"><TrendingUp size={22} /></div>
            <span className="text-[11px] font-bold text-gray-400">الإجراءات الرقابية</span>
          </div>
          <div className="text-4xl font-black text-slate-900 mb-1 tracking-tight">{totalUndertakings + totalWarnings}</div>
          <p className="text-xs text-gray-400 font-bold">أنذار وتعهد رسمي معتمد</p>
        </div>
      </div>

      {/* Dynamic completed breakdown and search panel: "انواع الشكاوي المنجزه كمعاينه ويمكن رويتها بلوح التحكم" */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Completed types breakdown */}
        <div className="municipal-card p-6 bg-white border border-[#163f69]/25 shadow lg:col-span-1">
          <h3 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
            <BarChart3 className="text-municipality-blue" size={18} /> 
            معاينة نسب الشكاوى المنجزة كلياً
          </h3>
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {categoryStats.length > 0 ? (
              categoryStats.map((cat, idx) => (
                <div key={idx} className="space-y-1.5 p-2 bg-slate-50/50 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-800">{cat.name}</span>
                    <span className="font-bold text-municipality-blue bg-blue-50/60 px-2 py-0.5 rounded-lg text-[10px]">
                      {cat.resolved} من {cat.total} منجزة ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-l from-[#0e2c4d] to-[#1f4c7d] rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-8 italic font-bold">لم تُسجل أي شكاوى منجزة أو معلقة بعد بالتبويبات</p>
            )}
          </div>
        </div>

        {/* Completed complains inspection view list */}
        <div className="bg-white p-6 rounded-3xl border border-[#163f69]/25 shadow-md lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-3.5 mb-4">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <CheckCircle className="text-emerald-500" size={18} />
                أرشيف الشكاوى المنجزة والمحلولة بالميدان
              </h3>
              
              {/* Done Search */}
              <div className="relative w-full sm:max-w-xs">
                <Search size={14} className="absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="ابحث في الشكاوى المنجزة..."
                  value={searchDoneQuery}
                  onChange={(e) => setSearchDoneQuery(e.target.value)}
                  className="w-full pl-3 pr-9 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:bg-white text-right font-semibold"
                />
              </div>
            </div>

            {/* Solved List cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto pr-1">
              {filteredDoneComplaints.length > 0 ? (
                filteredDoneComplaints.map((c) => (
                  <div key={c.id} className="p-4 bg-emerald-50/10 border border-emerald-150 rounded-2xl flex flex-col justify-between hover:bg-emerald-50/20 transition-all duration-205">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold">
                          منجزة بنجاح
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {c.date}
                        </span>
                      </div>
                      <h4 className="font-black text-xs text-slate-800 mb-1">{c.complainantName}</h4>
                      <p className="text-[11px] font-bold text-slate-500 mb-1 bg-slate-100 px-2 py-0.5 rounded inline-block">{c.category}</p>
                      <p className="text-xs text-slate-650 mt-1 line-clamp-2">{c.details}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-2.5 mt-3 flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-slate-700">المفتش المنجز: {c.inspectorName}</span>
                      <span className="text-indigo-650 font-bold bg-indigo-50 px-2 py-0.5 rounded-md">رمز: {c.id.substring(0, 5).toUpperCase()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-slate-400 italic">
                  {searchDoneQuery ? 'لا توجد نتائج بحث مطابقة في منجزات المركز' : 'لم يتم تفويض أو إنجاز شكاوى بالمركز حالياً.'}
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-400 flex items-center justify-between font-medium">
            <span>إجمالي المنجز من تصنيف الشكاوى: {doneComplaints.length} شكوى</span>
            <span>بوابة بلدية الكويت الميدانية</span>
          </div>
        </div>

      </div>

      {/* 4. Live Command Center action logs: "وفي حال تم مسح بعض الشكاوي او انجازها يخبرني" */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl border border-[#163f69]/40 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-800/20 rounded-full translate-x-20 -translate-y-20 blur-2xl poiner-events-none" />
        
        <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl animate-pulse">
              <Bell size={18} />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-slate-105">سجل الإجراءات والتلقي الفوري للكشف</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-0.5">يعرض الإشعارات والتحركات التي تمت على الشكاوى (مسح، حل، رصد جديد) في الوقت الفعلي</p>
            </div>
          </div>
          
          {onClearDashLogs && dashLogs.length > 0 && (
            <button
              onClick={onClearDashLogs}
              className="text-[10px] sm:text-xs font-bold text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 hover:border-red-500/30"
            >
              <Trash2 size={12} /> مسح السجل الفوري
            </button>
          )}
        </div>

        {/* Live log entries */}
        <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 font-mono text-xs relative z-10 custom-scrollbar">
          {dashLogs.length > 0 ? (
            dashLogs.map((log) => (
              <div 
                key={log.id} 
                className={cn(
                  "p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-slate-300 transition-all",
                  log.action === 'delete' ? "bg-red-950/20 border-red-900/40 text-red-200" :
                  log.action === 'done' ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-200" :
                  log.action === 'create' ? "bg-blue-950/20 border-blue-900/40 text-blue-200" : "bg-slate-800/40 border-slate-755 text-slate-205"
                )}
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  <span 
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-black uppercase text-center w-24 shrink-0",
                      log.action === 'delete' ? "bg-red-500/20 text-red-400 border border-red-500/20" :
                      log.action === 'done' ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" :
                      log.action === 'create' ? "bg-blue-500/20 text-blue-400 border border-blue-500/20" : "bg-slate-700 text-slate-300"
                    )}
                  >
                    {log.action === 'delete' ? 'مسح وحذف' :
                     log.action === 'done' ? 'إنجاز وحل' :
                     log.action === 'create' ? 'رصد جديد' : 'تحديث إجرائي'}
                  </span>
                  <span className="font-extrabold leading-relaxed text-slate-200">{log.details}</span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-slate-400 self-end sm:self-auto font-bold">
                  <Clock size={11} />
                  <span>{log.time}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-slate-500 italic flex flex-col items-center justify-center gap-2">
              <Bell size={24} className="text-slate-700 opacity-50" />
              <p className="text-xs font-bold text-slate-400">سجل الإجراءات المباشر خالٍ حالياً.</p>
              <p className="text-[10px] text-slate-500">سيتم تسجيل التبليغات مباشرة عند البدء في تعديل أو حذف أو تصفية الشكاوى.</p>
            </div>
          )}
        </div>
      </div>

      {/* Discrete Administration Terminal Area */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="max-w-md mx-auto flex flex-col items-center gap-6 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-center gap-2">
            <div className="p-2 bg-slate-100 rounded-full text-slate-400">
              <ShieldCheck size={20} />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">صلاحيات الإدارة الفنية</p>
          </div>

          <div className="w-full flex flex-col gap-4">
             <div className="relative group">
                <input 
                  type="password" 
                  placeholder="أدخل رمز التفويض" 
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  className={cn(
                    "w-full px-4 py-3 bg-gray-50 border rounded-xl text-center font-black transition-all outline-none",
                    adminCode === '139' 
                      ? "border-green-500 text-green-600 bg-green-50" 
                      : isVerifying ? "border-red-500 text-red-500 bg-red-50 animate-shake" : "border-gray-200 focus:border-municipality-blue"
                  )}
                />
                {adminCode === '139' && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 animate-bounce">
                    <CheckCircle2 size={16} />
                  </div>
                )}
             </div>

             <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => handleClear(onClearComplaints)}
                  disabled={adminCode !== '139'}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border shadow-sm",
                    adminCode === '139' 
                      ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" 
                      : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
                  )}
                >
                  <Trash2 size={14} /> مسح الشكاوي
                </button>
                <button 
                  onClick={() => handleClear(onClearStats)}
                  disabled={adminCode !== '139'}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border shadow-sm",
                    adminCode === '139' 
                      ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" 
                      : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
                  )}
                >
                  <RotateCcw size={14} /> تصفير الإحصائيات
                </button>
             </div>

             <button 
              onClick={() => handleClear(onClearAll)}
              disabled={adminCode !== '139'}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border shadow-sm",
                adminCode === '139' 
                  ? "bg-slate-800 text-white border-slate-900 hover:bg-slate-900" 
                  : "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-50"
              )}
            >
              <RotateCcw size={14} /> تصفير نظام بلدية الكويت (كامل)
            </button>
          </div>
          
          <p className="text-[10px] text-gray-400 italic font-medium text-center leading-relaxed">
            ملاحظة: لضمان أمن البيانات، يرجى إدخال الرمز الخاص لتفعيل خيارات التحكم الإداري.<br/>
            عمليات المسح نهائية ولا يمكن التراجع عنها.
          </p>
        </div>
      </div>
    </div>
  );
}
