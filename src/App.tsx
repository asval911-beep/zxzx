import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Settings as SettingsIcon, 
  FileText, 
  BarChart3, 
  BookOpen, 
  Search, 
  Menu, 
  X,
  LogOut,
  LayoutDashboard,
  StickyNote,
  Users,
  Gamepad2,
  Truck,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import ComplaintForm from './components/ComplaintForm';
import ComplaintList from './components/ComplaintList';
import StatisticsReport from './components/StatisticsReport';
import CorrespondenceList from './components/CorrespondenceList';
import SettingsTab from './components/SettingsTab';
import NotesTab from './components/NotesTab';
import DashboardTab from './components/DashboardTab';
import MemoryGame from './components/MemoryGame';
import { Complaint, Correspondence, DailyStats, Note, Settings, FieldInspectionReport } from './types';
import { cn } from './lib/utils';
import { LOGO_BASE64 } from './assets/logo_base64';

type Tab = 'dashboard' | 'add' | 'manage' | 'stats' | 'books' | 'notes' | 'settings' | 'game';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>('');

  const [customAlert, setCustomAlert] = useState<{ isOpen: boolean; message: string }>({
    isOpen: false,
    message: ''
  });

  useEffect(() => {
    // Override window.alert with a custom, beautifully integrated React state-driven top-level alert modal.
    // This blocks native alert focus freeze issues inside preview iframes.
    window.alert = (msg: string) => {
      setCustomAlert({
        isOpen: true,
        message: msg
      });
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('ar-KW-u-nu-latn', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('municipal_dark_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('municipal_dark_mode', darkMode.toString());
    } catch {}
  }, [darkMode]);
  
  // Data State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_complaints');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load complaints", e);
      return [];
    }
  });
  const [books, setBooks] = useState<Correspondence[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_books');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [stats, setStats] = useState<DailyStats[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_stats');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [fieldReports, setFieldReports] = useState<FieldInspectionReport[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_field_reports');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_notes');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem('municipal_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Simple migration check
        if (parsed.inspectors && parsed.inspectors.length > 0 && typeof parsed.inspectors[0] === 'string') {
          return {
            inspectors: parsed.inspectors.map((name: string) => ({ id: Math.random().toString(36).substr(2, 9), name, type: 'center' })),
            centers: parsed.centers.map((name: string) => ({ id: Math.random().toString(36).substr(2, 9), name, type: 'center' }))
          };
        }
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse settings", e);
    }
    return { 
      inspectors: [
        { id: '1', name: 'مفتش 1', type: 'center' },
        { id: '2', name: 'مفتش 2', type: 'center' }
      ], 
      centers: [
        { id: '3', name: 'مركز الروضة', type: 'center' },
        { id: '4', name: 'مركز الفروانية', type: 'center' },
        { id: '5', name: 'مركز العاصمة', type: 'center' }
      ] 
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('municipal_complaints', JSON.stringify(complaints));
    } catch (e) {
      // Silently fail or log to console - prevents disruptive alerts
      console.error('Storage quota exceeded');
    }
  }, [complaints]);

  useEffect(() => {
    try {
      localStorage.setItem('municipal_books', JSON.stringify(books));
    } catch (e) {}
  }, [books]);

  useEffect(() => {
    try {
      localStorage.setItem('municipal_stats', JSON.stringify(stats));
    } catch (e) {}
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem('municipal_field_reports', JSON.stringify(fieldReports));
    } catch (e) {}
  }, [fieldReports]);

  useEffect(() => {
    try {
      localStorage.setItem('municipal_notes', JSON.stringify(notes));
    } catch (e) {}
  }, [notes]);

  useEffect(() => {
    try {
      localStorage.setItem('municipal_settings', JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // DashLog State & Sync
  const [dashLogs, setDashLogs] = useState<{ id: string; time: string; action: string; details: string; }[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_dashboard_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('municipal_dashboard_logs', JSON.stringify(dashLogs));
    } catch {}
  }, [dashLogs]);

  const addDashLog = (action: string, details: string) => {
    const newLog = {
      id: Math.random().toString(36).substr(2, 9),
      time: new Date().toLocaleTimeString('ar-KW', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      action,
      details
    };
    setDashLogs(prev => [newLog, ...prev].slice(0, 50));
  };

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'municipal_complaints') setComplaints(e.newValue ? JSON.parse(e.newValue) : []);
        if (e.key === 'municipal_stats') setStats(e.newValue ? JSON.parse(e.newValue) : []);
        if (e.key === 'municipal_field_reports') setFieldReports(e.newValue ? JSON.parse(e.newValue) : []);
        if (e.key === 'municipal_settings') setSettings(e.newValue ? JSON.parse(e.newValue) : { 
          inspectors: [
            { id: '1', name: 'مفتش 1', type: 'center' },
            { id: '2', name: 'مفتش 2', type: 'center' }
          ], 
          centers: [
            { id: '3', name: 'مركز الروضة', type: 'center' },
            { id: '4', name: 'مركز الفروانية', type: 'center' },
            { id: '5', name: 'مركز العاصمة', type: 'center' }
          ] 
        });
        if (e.key === 'municipal_books') setBooks(e.newValue ? JSON.parse(e.newValue) : []);
        if (e.key === 'municipal_notes') setNotes(e.newValue ? JSON.parse(e.newValue) : []);
      } catch (err) {}
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const clearData = (type: 'complaints' | 'stats' | 'all') => {
    if (type === 'complaints' || type === 'all') {
      setComplaints([]);
      localStorage.setItem('municipal_complaints', JSON.stringify([]));
    }
    if (type === 'stats' || type === 'all') {
      setStats([]);
      setFieldReports([]);
      localStorage.setItem('municipal_stats', JSON.stringify([]));
      localStorage.setItem('municipal_field_reports', JSON.stringify([]));
    }
    if (type === 'all') {
      setBooks([]);
      setNotes([]);
      localStorage.removeItem('municipal_books');
      localStorage.removeItem('municipal_notes');
      localStorage.removeItem('municipal_settings');
      alert('تم تصفير النظام بنجاح. سيتم إعادة تحميل الصفحة لتطبيق التغييرات.');
      window.location.reload();
    }
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'add', label: 'إضافة شكوى', icon: PlusCircle },
    { id: 'manage', label: 'إدارة الشكاوي', icon: FileText },
    { id: 'stats', label: 'الإحصائيات والتقارير', icon: BarChart3 },
    { id: 'books', label: 'الصادر والوارد', icon: BookOpen },
    { id: 'notes', label: 'المفكرة والملاحظات', icon: StickyNote },
    { id: 'game', label: 'استراحة الموظف', icon: Gamepad2 },
    { id: 'settings', label: 'قوائم المفتشين', icon: Users },
  ];

  return (
    <div className={cn("min-h-screen bg-municipality-light flex h-screen overflow-hidden", darkMode && "dark-theme dark")}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-gradient-to-b from-[#0e2c4d] via-[#163f69] to-[#1f4c7d] text-white flex flex-col transition-all duration-300 z-50 shrink-0 border-l border-white/5"
      >
        <div className="py-5 px-4 flex items-center justify-between border-b border-white/10">
          <AnimatePresence mode="wait">
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="font-extrabold text-lg whitespace-nowrap overflow-hidden flex items-center gap-1.5"
              >
                <img src={LOGO_BASE64} className="w-14 h-10 object-contain shrink-0" referrerPolicy="no-referrer" alt="شعار بلدية الكويت (شعار 2)" />
                <span>بلدية الكويت</span>
              </motion.div>
            )}
          </AnimatePresence>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={cn(
                  "w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-right",
                  isActive 
                    ? "bg-white text-[#0e2c4d] shadow-lg" 
                    : "hover:bg-white/10 text-white/70 hover:text-white"
                )}
              >
                <Icon size={24} className={cn("shrink-0", isActive ? "text-[#0e2c4d]" : "text-white/70 group-hover:text-white")} />
                {isSidebarOpen && (
                  <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-municipality-gold flex items-center justify-center font-bold text-municipality-blue">
              SD
            </div>
            {isSidebarOpen && (
              <div className="overflow-hidden">
                <p className="font-bold text-sm truncate">سلطان دهراب</p>
                <p className="text-xs text-white/50 truncate">المطور</p>
              </div>
            )}
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-municipality-blue">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h1>
            <p className="text-sm text-gray-500">مراكز بلدية دولة الكويت 139</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-3 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-700 text-municipality-blue hover:text-municipality-gold hover:border-municipality-gold rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer relative"
              title={darkMode ? "التحول إلى الوضع النهاري" : "التحول إلى الوضع الليلي"}
              style={{ minWidth: '46px', minHeight: '46px' }}
            >
              {darkMode ? (
                <Sun size={20} className="text-amber-500 animate-pulse" />
              ) : (
                <Moon size={20} className="text-slate-600" />
              )}
            </button>

            <div className="flex items-center gap-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-700/60 px-4 py-2.5 rounded-2xl shadow-xs">
              <img src={LOGO_BASE64} className="h-12 w-auto object-contain max-w-[120px] shrink-0" referrerPolicy="no-referrer" alt="شعار بلدية الكويت (شعار 2)" />
              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
              <div className="text-right flex flex-col justify-center min-w-[170px]">
                <p className="text-[9px] text-gray-400 dark:text-gray-400 font-bold tracking-wider uppercase leading-none mb-1">التوقيت المحلي لدولة الكويت</p>
                
                {/* Time using Western Digits (font-mono, text-lg, bolder) */}
                <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400 tracking-wide leading-none select-none">
                  {currentTime || '...'}
                </span>
                
                {/* Date using Western Digits (font-black, text-xs, clearer) */}
                <p className="text-[11px] font-extrabold text-slate-700 dark:text-slate-350 mt-1.5 leading-none">
                  {new Date().toLocaleDateString('ar-KW-u-nu-latn', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  complaints={complaints} 
                  stats={stats} 
                  dashLogs={dashLogs}
                  onClearDashLogs={() => setDashLogs([])}
                  onClearStats={() => clearData('stats')}
                  onClearComplaints={() => {
                    clearData('complaints');
                    setDashLogs([]);
                  }}
                  onClearAll={() => {
                    clearData('all');
                    setDashLogs([]);
                  }}
                />
              )}
              {activeTab === 'add' && (
                <ComplaintForm 
                  onSave={(comp) => {
                    setComplaints([comp, ...complaints]);
                    addDashLog('create', `📝 تم تسجيل شكوى جديدة باسم ${comp.complainantName} - تصنيف: ${comp.category}`);
                  }} 
                  settings={settings}
                />
              )}
              {activeTab === 'manage' && (
                <ComplaintList 
                  complaints={complaints} 
                  onDelete={(id) => {
                    const found = complaints.find(c => c.id === id);
                    setComplaints(complaints.filter(c => c.id !== id));
                    if (found) {
                      addDashLog('delete', `⚠️ تم مسح وحذف الشكوى المسجلة باسم ${found.complainantName} (تصنيف: ${found.category})`);
                    }
                  }}
                  onUpdate={(updated) => {
                    const prev = complaints.find(c => c.id === updated.id);
                    setComplaints(complaints.map(c => c.id === updated.id ? updated : c));
                    if (prev && prev.status !== 'done' && updated.status === 'done') {
                      addDashLog('done', `✅ تم إنجاز وحل الشكوى بنجاح (رقم الشكوى: ${updated.id.substring(0, 6).toUpperCase()}) - المفتش: ${updated.inspectorName}`);
                    } else if (prev && prev.status !== updated.status) {
                      addDashLog('update', `🔧 تعديل حالة الشكوى رقم ${updated.id.substring(0, 6).toUpperCase()} إلى: ${updated.status === 'pending' ? 'قيد الانتظار' : 'جاري المتابعة والمعاينة'}`);
                    }
                  }}
                />
              )}
               {activeTab === 'stats' && (
                <StatisticsReport 
                  stats={stats} 
                  settings={settings}
                  onSave={(newStat) => {
                    setStats(prev => {
                      const exists = prev.some(s => s.id === newStat.id);
                      if (exists) {
                        return prev.map(s => s.id === newStat.id ? newStat : s);
                      } else {
                        return [newStat, ...prev];
                      }
                    });
                  }} 
                  onDelete={(id) => setStats(stats.filter(s => s.id !== id))}
                  fieldReports={fieldReports}
                  onSaveFieldReport={(newReport) => {
                    setFieldReports(prev => {
                      const exists = prev.some(r => r.id === newReport.id);
                      if (exists) {
                        return prev.map(r => r.id === newReport.id ? newReport : r);
                      } else {
                        return [newReport, ...prev];
                      }
                    });
                  }}
                  onDeleteFieldReport={(id) => setFieldReports(fieldReports.filter(f => f.id !== id))}
                />
              )}
              {activeTab === 'books' && (
                <CorrespondenceList 
                  books={books} 
                  onSave={(book) => setBooks([book, ...books])}
                  onDelete={(id) => setBooks(books.filter(b => b.id !== id))}
                />
              )}
              {activeTab === 'notes' && (
                <NotesTab 
                  notes={notes} 
                  onSave={(newNote) => {
                    setNotes(prev => {
                      const exists = prev.some(n => n.id === newNote.id);
                      if (exists) {
                        return prev.map(n => n.id === newNote.id ? newNote : n);
                      } else {
                        return [newNote, ...prev];
                      }
                    });
                  }}
                  onDelete={(id) => setNotes(notes.filter(n => n.id !== id))}
                />
              )}
              {activeTab === 'settings' && (
                <SettingsTab 
                  settings={settings} 
                  onUpdate={setSettings} 
                />
              )}
              {activeTab === 'game' && (
                <MemoryGame />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 p-4 text-center">
          <p className="text-[10px] text-gray-400 tracking-wide uppercase">
            تصميم وتطوير: سلطان دهراب &copy; {new Date().getFullYear()} - بلدية الكويت
          </p>
        </footer>
      </main>

      {/* Beautiful Arabized Custom Non-blocking Alert Modal Overlay */}
      <AnimatePresence>
        {customAlert.isOpen && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop with blur styling */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCustomAlert({ isOpen: false, message: '' })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs"
            />
            {/* Alert container */}
            <motion.div
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-150 dark:border-slate-700 p-6 flex flex-col items-center text-center space-y-4 text-right"
              dir="rtl"
            >
              <div className="w-14 h-14 rounded-full bg-municipality-blue/10 dark:bg-amber-400/10 flex items-center justify-center text-municipality-blue dark:text-amber-400 animate-bounce">
                <Info size={28} className="stroke-[2.5]" />
              </div>
              <p className="text-slate-850 dark:text-gray-100 font-extrabold text-sm sm:text-base leading-relaxed whitespace-pre-line text-center w-full">
                {customAlert.message}
              </p>
              <button
                onClick={() => setCustomAlert({ isOpen: false, message: '' })}
                className="w-full py-3 px-6 bg-municipality-blue hover:bg-[#163f69] text-white rounded-xl font-black text-xs sm:text-sm transition-all hover:scale-[1.01] active:scale-[0.99] shadow-md cursor-pointer text-center"
              >
                موافق
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
