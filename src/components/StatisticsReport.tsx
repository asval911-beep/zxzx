import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  Printer, 
  Trash2, 
  Plus, 
  Calendar, 
  FileDown, 
  Download, 
  RotateCcw, 
  User, 
  MapPin, 
  Clipboard, 
  FileSignature, 
  AlertCircle,
  PlusCircle,
  Check,
  ChevronDown,
  Search,
  Eye,
  X
} from 'lucide-react';
import { DailyStats, Settings, FieldInspectionReport } from '../types';
import { LOGO_BASE64 } from '../assets/logo_base64';
import html2canvas from 'html2canvas';
import { cn } from '../lib/utils';

interface CustomStyleSheet {
  cssRules: CSSRuleList;
  rules?: CSSRuleList;
}

const convertOklchToRgb = (lightness: number, chroma: number, hue: number, alpha: number): string => {
  const hRad = (hue * Math.PI) / 180;
  const L = lightness;
  const a = chroma * Math.cos(hRad);
  const bCoord = chroma * Math.sin(hRad);
  
  const l = L + 0.3963377774 * a + 0.2158037573 * bCoord;
  const m = L - 0.1055613458 * a - 0.0638541728 * bCoord;
  const s = L - 0.0894841775 * a - 1.2914855480 * bCoord;
  
  const l_ = l * l * l;
  const m_ = m * m * m;
  const s_ = s * s * s;
  
  const r_ = +4.0767245293 * l_ - 3.3072168827 * m_ + 0.2307590544 * s_;
  const g_ = -1.2681437731 * l_ + 2.6093323202 * m_ - 0.3411341355 * s_;
  const b_ = -0.0041119885 * l_ - 0.7034763098 * m_ + 1.7068625689 * s_;
  
  const toSRGB = (c: number): number => {
    if (c <= 0.0031308) return c * 12.92;
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };
  
  const finalR = Math.min(255, Math.max(0, Math.round(toSRGB(r_) * 255)));
  const finalG = Math.min(255, Math.max(0, Math.round(toSRGB(g_) * 255)));
  const finalB = Math.min(255, Math.max(0, Math.round(toSRGB(b_) * 255)));
  
  return alpha === 1 ? `rgb(${finalR}, ${finalG}, ${finalB})` : `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
};

const convertOklabToRgb = (L: number, a: number, bParam: number, alpha: number): string => {
  const l = L + 0.3963377774 * a + 0.2158037573 * bParam;
  const m = L - 0.1055613458 * a - 0.0638541728 * bParam;
  const s = L - 0.0894841775 * a - 1.2914855480 * bParam;
  
  const l_ = l * l * l;
  const m_ = m * m * m;
  const s_ = s * s * s;
  
  const r_ = +4.0767245293 * l_ - 3.3072168827 * m_ + 0.2307590544 * s_;
  const g_ = -1.2681437731 * l_ + 2.6093323202 * m_ - 0.3411341355 * s_;
  const b_ = -0.0041119885 * l_ - 0.7034763098 * m_ + 1.7068625689 * s_;
  
  const toSRGB = (c: number): number => {
    if (c <= 0.0031308) return c * 12.92;
    return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  };
  
  const finalR = Math.min(255, Math.max(0, Math.round(toSRGB(r_) * 255)));
  const finalG = Math.min(255, Math.max(0, Math.round(toSRGB(g_) * 255)));
  const finalB = Math.min(255, Math.max(0, Math.round(toSRGB(b_) * 255)));
  
  return alpha === 1 ? `rgb(${finalR}, ${finalG}, ${finalB})` : `rgba(${finalR}, ${finalG}, ${finalB}, ${alpha})`;
};

const replaceOklchAndOklabText = (cssString: string): string => {
  if (!cssString) return cssString;
  
  let result = cssString.replace(/oklch\(([^)]+)\)/g, (match, content) => {
    try {
      const cleanContent = content.trim().replace(/,/g, ' ');
      const parts = cleanContent.split(/[\s/]+/).filter(Boolean);
      if (parts.length < 3) return match;
      
      let lVal = parseFloat(parts[0]);
      if (parts[0].includes('%')) lVal /= 100;
      
      let cVal = parseFloat(parts[1]);
      if (parts[1].includes('%')) cVal /= 100;
      
      let hVal = parseFloat(parts[2]);
      
      let alpha = 1;
      if (parts.length >= 4) {
        let aVal = parseFloat(parts[3]);
        if (parts[3].includes('%')) aVal /= 100;
        alpha = isNaN(aVal) ? 1 : aVal;
      }
      
      return convertOklchToRgb(lVal, cVal, hVal, alpha);
    } catch (e) {
      return 'rgba(0, 0, 0, 1)';
    }
  });

  result = result.replace(/oklab\(([^)]+)\)/g, (match, content) => {
    try {
      const cleanContent = content.trim().replace(/,/g, ' ');
      const parts = cleanContent.split(/[\s/]+/).filter(Boolean);
      if (parts.length < 3) return match;
      
      let lVal = parseFloat(parts[0]);
      if (parts[0].includes('%')) lVal /= 100;
      
      let aVal = parseFloat(parts[1]);
      if (parts[1].includes('%')) aVal /= 100;
      
      let bVal = parseFloat(parts[2]);
      if (parts[2].includes('%')) bVal /= 100;
      
      let alpha = 1;
      if (parts.length >= 4) {
        let alphaVal = parseFloat(parts[3]);
        if (parts[3].includes('%')) alphaVal /= 100;
        alpha = isNaN(alphaVal) ? 1 : alphaVal;
      }
      
      return convertOklabToRgb(lVal, aVal, bVal, alpha);
    } catch (e) {
      return 'rgba(0, 0, 0, 1)';
    }
  });

  return result;
};

interface AestheticSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  iconType?: 'user' | 'map' | 'flag' | 'calendar';
  className?: string;
  colorTheme?: 'amber' | 'blue' | 'emerald' | 'rose' | 'slate';
  isCompact?: boolean;
}

function AestheticSelect({
  value,
  onChange,
  options,
  placeholder,
  iconType = 'user',
  className = '',
  colorTheme = 'blue',
  isCompact = false
}: AestheticSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filtered = options.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  const themeClasses = {
    blue: {
      btn: "border-municipality-blue/30 focus:border-municipality-blue bg-municipality-blue/5 dark:border-municipality-blue/50 dark:bg-municipality-blue/20",
      pill: "bg-municipality-blue/15 text-municipality-blue border-municipality-blue/25 dark:bg-municipality-blue/40 dark:text-gray-100 dark:border-municipality-blue/40",
      itemActive: "bg-municipality-blue text-white dark:bg-municipality-blue dark:text-white",
    },
    amber: {
      btn: "border-amber-200 focus:border-amber-500 bg-amber-50/10 dark:border-amber-800 dark:bg-amber-950/20",
      pill: "bg-amber-100/80 text-amber-900 border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-800",
      itemActive: "bg-amber-500 text-white dark:bg-amber-600 dark:text-white",
    },
    emerald: {
      btn: "border-teal-200 focus:border-teal-650 bg-teal-50/10 dark:border-teal-800 dark:bg-teal-950/20",
      pill: "bg-teal-100/80 text-[#0f766e] border-teal-200 dark:bg-teal-950/40 dark:text-teal-200 dark:border-teal-800",
      itemActive: "bg-teal-600 text-white dark:bg-teal-600 dark:text-white",
    },
    rose: {
      btn: "border-rose-200 focus:border-rose-500 bg-rose-50/10 dark:border-rose-800 dark:bg-rose-950/20",
      pill: "bg-rose-100/80 text-rose-950 border-rose-200 dark:bg-rose-950/40 dark:text-rose-200 dark:border-rose-800",
      itemActive: "bg-rose-500 text-white dark:bg-rose-600 dark:text-white",
    },
    slate: {
      btn: "border-slate-300 focus:border-slate-800 bg-slate-50/10 dark:border-slate-700 dark:bg-slate-800/20",
      pill: "bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-705",
      itemActive: "bg-slate-600 text-white dark:bg-slate-700 dark:text-white",
    }
  };

  const activeTheme = themeClasses[colorTheme] || themeClasses.blue;

  const getIcon = () => {
    switch(iconType) {
      case 'user': return <User size={isCompact ? 12 : 14} className="text-slate-500 dark:text-slate-300 shrink-0" />;
      case 'map': return <MapPin size={isCompact ? 12 : 14} className="text-slate-500 dark:text-slate-300 shrink-0" />;
      case 'flag': return <Clipboard size={isCompact ? 12 : 14} className="text-slate-500 dark:text-slate-300 shrink-0" />;
      case 'calendar': return <Calendar size={isCompact ? 12 : 14} className="text-slate-500 dark:text-slate-300 shrink-0" />;
      default: return null;
    }
  };

  if (isCompact) {
    return (
      <div ref={containerRef} className={`relative w-full h-full flex items-center justify-center ${className}`}>
        {/* Compact Button for Sheet Cells without ugly chevrons or wide padding */}
        <button
          type="button"
          onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
          className="aesthetic-select-trigger w-full h-full px-1 py-1 bg-transparent hover:bg-amber-50/60 text-center outline-none ring-0 transition-all text-slate-900 dark:text-slate-100 font-black text-[11px] truncate"
          data-value={value}
          data-compact="true"
        >
          {value ? value : <span className="text-slate-300 font-bold">-</span>}
        </button>

        {/* Dropdown Menu Overlay */}
        {isOpen && (
          <div className="absolute z-50 text-right left-1/2 -translate-x-1/2 mt-1 w-56 bg-white border border-slate-300 rounded-xl shadow-2xl overflow-hidden max-h-56 flex flex-col scale-100 animate-in fade-in duration-100">
            <div className="p-1.5 px-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5">
              <Search size={12} className="text-slate-450 shrink-0" />
              <input
                type="text"
                className="w-full bg-transparent border-0 ring-0 outline-none p-0.5 text-xs font-bold text-slate-800"
                placeholder="ابحث..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 font-bold text-[11px] divide-y divide-slate-100">
              {filtered.length > 0 ? (
                filtered.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-right px-4 py-2.5 flex items-center justify-between transition-colors hover:bg-amber-50/50 text-slate-800 ${value === opt ? 'bg-amber-50 text-amber-950 font-black text-[11.5px]' : ''}`}
                  >
                    <span className="truncate">{opt}</span>
                    {value === opt && <Check size={12} className="text-municipality-gold shrink-0" />}
                  </button>
                ))
              ) : (
                <p className="p-2 text-center text-[10.5px] text-slate-400 italic">لا توجد خيارات</p>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => { setIsOpen(!isOpen); setSearch(''); }}
        className={`aesthetic-select-trigger flex items-center justify-between w-full px-4 py-3 text-slate-900 rounded-xl border text-sm font-black outline-none transition-all shadow-sm focus:ring-1 focus:ring-opacity-40 text-right ${activeTheme.btn}`}
        data-value={value}
        data-compact="false"
      >
        <div className="flex items-center gap-2 text-right">
          {getIcon()}
          {value ? (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${activeTheme.pill}`}>
              {value}
            </span>
          ) : (
            <span className="text-slate-400 font-bold">{placeholder}</span>
          )}
        </div>
        <ChevronDown size={15} className={`text-slate-400 transition-transform select-chevron-icon ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu Overlay */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col animate-in fade-in slide-in-from-top-1 duration-150 text-right">
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 bg-slate-50 dark:bg-slate-950">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              className="w-full bg-transparent border-0 ring-0 outline-none p-1 text-xs font-bold text-slate-850 dark:text-slate-100"
              placeholder="ابحث هنا..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 font-bold text-sm divide-y divide-slate-50 dark:divide-slate-800">
            {filtered.length > 0 ? (
              filtered.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-right px-4 py-3 flex items-center justify-between transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
                    value === opt ? activeTheme.itemActive : ""
                  )}
                >
                  <span className={cn(
                    "font-black text-slate-900 dark:text-slate-100",
                    value === opt && "text-white dark:text-white"
                  )}>{opt}</span>
                  {value === opt && <Check size={14} className="text-municipality-gold shrink-0" />}
                </button>
              ))
            ) : (
              <p className="p-4 text-center text-xs text-slate-400 italic">لا توجد نتائج مطابقة</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatisticsReportProps {
  stats: DailyStats[];
  settings: Settings;
  onSave: (stat: DailyStats) => void;
  onDelete: (id: string) => void;
  fieldReports?: FieldInspectionReport[];
  onSaveFieldReport?: (report: FieldInspectionReport) => void;
  onDeleteFieldReport?: (id: string) => void;
}

export default function StatisticsReport({ 
  stats, 
  settings, 
  onSave, 
  onDelete,
  fieldReports = [],
  onSaveFieldReport,
  onDeleteFieldReport
}: StatisticsReportProps) {
  const [subTab, setSubTab] = useState<'daily_stats' | 'field_report'>('daily_stats');

  const [activeStatsPreviewModal, setActiveStatsPreviewModal] = useState<boolean>(false);
  const [activeFieldPreviewModal, setActiveFieldPreviewModal] = useState<boolean>(false);
  const [printIframeModal, setPrintIframeModal] = useState<{
    show: boolean;
    type: 'stats' | 'field';
    id: string;
  }>({
    show: false,
    type: 'stats',
    id: ''
  });
  const [activeInspectorRowTab, setActiveInspectorRowTab] = useState<number>(1);
  const [deletingStatId, setDeletingStatId] = useState<string | null>(null);
  const [deletingFieldReportId, setDeletingFieldReportId] = useState<string | null>(null);
  const [chartTab, setChartTab] = useState<'weekly' | 'monthly'>('weekly');

  const renderFormStatInput = (
    fieldKey: string,
    rowPrefix?: 'row2' | 'row3' | 'row4' | 'row5' | 'row6' | 'row7' | 'row8' | 'row9' | 'row10'
  ) => {
    const fullKey = rowPrefix ? `${rowPrefix}_${fieldKey}` as keyof typeof formData : fieldKey as keyof typeof formData;
    const value = formData[fullKey];
    
    return (
      <input
        type="number"
        min="0"
        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-850 border border-gray-250 dark:border-slate-800 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:border-municipality-gold focus:ring-1 focus:ring-municipality-gold outline-none transition-all text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        value={value === undefined || value === 0 ? '' : value}
        placeholder="0"
        onChange={e => {
          const val = e.target.value.trim();
          const parsed = val === '' ? 0 : parseInt(val, 10);
          setFormData({
            ...formData,
            [fullKey]: isNaN(parsed) ? 0 : parsed
          });
        }}
      />
    );
  };

  // Daily/Weekly/Monthly Stats Form State
  const initialStatsState = {
    date: new Date().toISOString().split('T')[0],
    dateTo: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reportType: 'weekly' as 'weekly' | 'monthly',
    inspectorName: settings.inspectors.find(i => i.id === settings.defaultInspectorId)?.name || settings.inspectors[0]?.name || '',
    centerName: settings.centers.find(c => c.id === settings.defaultCenterId)?.name || settings.centers[0]?.name || '',
    fileNumber: '',
    jobTitle: 'مفتش نظافة',
    shift: 'أ',
    completedComplaints: 0,
    undertakings: 0,
    cleaningViolations: 0,
    roadObstructions: 0,
    violations9_87: 0,
    stickers: 0,
    vehicleRemovals: 0,
    streetVendors: 0,
    warnings: 0,
    
    // Detailed Columns for Weekly/Monthly
    hygieneLawCarRemoval: 0,
    hygieneLawPublic: 0,
    law30_2021: 0,
    droppedCarsNeglected: 0,
    droppedCarsScrap: 0,
    droppedCarsForSale: 0,
    
    // Machinery (Monthly)
    tripsWaste: 0,
    tripsBigDumper: 0,
    tripsSmallDumper: 0,
    tripsLorry: 0
  };

  const [formData, setFormData] = useState<Omit<DailyStats, 'id'> & { id?: string }>(initialStatsState);

  const getDayOfWeekArabic = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[date.getDay()] || '';
  };

  // Field Report Form State
  const initialFieldState = {
    date: new Date().toISOString().split('T')[0],
    dayOfWeek: getDayOfWeekArabic(new Date().toISOString().split('T')[0]),
    inspectorName: settings.inspectors.find(i => i.id === settings.defaultInspectorId)?.name || settings.inspectors[0]?.name || '',
    seizureNumber: '',
    centerName: settings.centers.find(c => c.id === settings.defaultCenterId)?.name || settings.centers[0]?.name || '',
    phoneNumber: '',
    exitTime: '08:00',
    returnTime: '14:30',
    area: '',
    block: '',
    street: '',
    notes: '',
    employeeName: settings.inspectors.find(i => i.id === settings.defaultInspectorId)?.name || settings.inspectors[0]?.name || '',
    supervisorName: 'سلطان دهراب',
    supervisorDate: new Date().toISOString().split('T')[0],
    supervisorTime: '13:00',
    sectionHeadName: '',
    sectionHeadDate: new Date().toISOString().split('T')[0],
    sectionHeadSignature: 'معتمد وموقع الكترونياً',
    controllerName: '',
    controllerDate: new Date().toISOString().split('T')[0],
    controllerSignature: 'موافق ومعتمد للجنة الميدانية',
    directorName: '',
    directorDate: new Date().toISOString().split('T')[0],
    directorSignature: 'معتمد للمصادقة الميدانية',
    shift: 'أ',
    jobTitle: 'مفتش نظافة',
    administration: 'إدارة النظافة العامة وإشغالات الطرق'
  };

  const [fieldForm, setFieldForm] = useState<Omit<FieldInspectionReport, 'id'> & { id?: string }>(initialFieldState);

  // Auto-scale states for previewing perfectly within the screen container
  const [statsPreviewScale, setStatsPreviewScale] = useState(1);
  const [statsPreviewHeight, setStatsPreviewHeight] = useState<number | null>(null);
  const statsContainerRef = useRef<HTMLDivElement>(null);
  const statsPreviewRef = useRef<HTMLDivElement>(null);

  const [fieldPreviewScale, setFieldPreviewScale] = useState(1);
  const [fieldPreviewHeight, setFieldPreviewHeight] = useState<number | null>(null);
  const fieldContainerRef = useRef<HTMLDivElement>(null);
  const fieldPreviewRef = useRef<HTMLDivElement>(null);

  // Auto-scale observer for Daily Stats sheet
  React.useEffect(() => {
    if (subTab !== 'daily_stats') return;
    const container = statsContainerRef.current;
    const preview = statsPreviewRef.current;
    if (!container || !preview) return;

    const updateScale = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const targetWidth = 840; // width of preview + margin allowance
      const scale = containerWidth < targetWidth ? (containerWidth / targetWidth) : 1;
      setStatsPreviewScale(scale);
      setStatsPreviewHeight(preview.offsetHeight * scale);
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    observer.observe(preview);
    updateScale();

    // Trigger calculation multiple times to catch delayed dynamic height adjustments
    const timer = setTimeout(updateScale, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [subTab, formData, activeStatsPreviewModal]);

  // Auto-scale observer for Field Inspection sheet
  React.useEffect(() => {
    const container = fieldContainerRef.current;
    const preview = fieldPreviewRef.current;
    if (!container || !preview) return;

    const updateScale = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const targetWidth = 840; // width of preview + margin allowance
      const scale = containerWidth < targetWidth ? (containerWidth / targetWidth) : 1;
      setFieldPreviewScale(scale);
      setFieldPreviewHeight(preview.offsetHeight * scale);
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    observer.observe(preview);
    updateScale();

    const timer = setTimeout(updateScale, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [subTab, fieldForm, activeFieldPreviewModal]);

  // Sync default options from settings when settings are updated
  React.useEffect(() => {
    const defaultInspector = settings.inspectors.find(i => i.id === settings.defaultInspectorId)?.name || settings.inspectors[0]?.name || '';
    const defaultCenter = settings.centers.find(c => c.id === settings.defaultCenterId)?.name || settings.centers[0]?.name || '';

    setFormData(prev => ({
      ...prev,
      inspectorName: prev.id ? prev.inspectorName : (prev.inspectorName || defaultInspector),
      centerName: prev.id ? prev.centerName : (prev.centerName || defaultCenter)
    }));

    setFieldForm(prev => ({
      ...prev,
      inspectorName: prev.id ? prev.inspectorName : (prev.inspectorName || defaultInspector),
      employeeName: prev.id ? prev.employeeName : (prev.employeeName || defaultInspector),
      centerName: prev.id ? prev.centerName : (prev.centerName || defaultCenter)
    }));
  }, [settings]);

  // Statistics Submit Handler
  const handleStatsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.inspectorName || !formData.centerName) {
      alert('يرجى اختيار المفتش والمركز الرئيسي أولاً');
      return;
    }
    const reportId = formData.id || crypto.randomUUID();
    onSave({ ...formData, id: reportId } as DailyStats);

    alert(`✅ تم حفظ الإحصائية ال${formData.reportType === 'weekly' ? 'أسبوعية' : 'شهرية'} بنجاح وأرشفتها في النظام!`);
    resetStatsForm();
  };

  const resetStatsForm = () => {
    setFormData(initialStatsState);
    setActiveInspectorRowTab(1);
  };

  const exportTableAsImage = async (id: string, type?: 'weekly' | 'monthly') => {
    const el = document.getElementById(`stats-report-canvas-${id}`);
    if (el) {
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('unsupported color function') || args[0].includes('oklch') || args[0].includes('oklab'))) {
          return;
        }
        originalConsoleWarn(...args);
      };
      console.error = (...args) => {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('unsupported color function') || args[0].includes('oklch') || args[0].includes('oklab'))) {
          return;
        }
        originalConsoleError(...args);
      };

      // Create offscreen container on body to prevent viewport clipping under small frames / mobile
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = '850px';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.direction = 'rtl';
      wrapper.style.overflow = 'visible';

      const clone = el.cloneNode(true) as HTMLElement;
      
      // Explicitly copy current live values from original to clone (cloneNode does not copy dynamic form values)
      const originalInputs = el.querySelectorAll('input, select, textarea');
      const clonedInputs = clone.querySelectorAll('input, select, textarea');
      clonedInputs.forEach((clonedEl, idx) => {
        const origEl = originalInputs[idx] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (origEl) {
          (clonedEl as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value = origEl.value;
        }
      });

      clone.id = `cloned-stats-report-canvas-${id}`;
      clone.style.transform = 'none';
      clone.style.width = '820px';
      clone.style.minWidth = '820px';
      clone.style.maxWidth = '820px';
      clone.style.padding = '24px'; // Match live preview p-6 exactly
      clone.style.margin = '0 auto';
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';

      const innerDoubleBorder = clone.querySelector('.border-double') as HTMLElement;
      if (innerDoubleBorder) {
        innerDoubleBorder.style.padding = '24px'; // Match live preview p-6 exactly
      }

      // Convert all form fields inside the sheet to flat clean text elements so they print and download beautifully with zero empty rectangles
      clone.querySelectorAll('input, select, textarea').forEach((field, fIdx) => {
        const inputEl = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        let value = inputEl.value || '';
        
        if (inputEl.tagName === 'SELECT') {
          const sel = inputEl as HTMLSelectElement;
          value = sel.options[sel.selectedIndex]?.text || value;
        }
        
        const span = document.createElement('span');
        const rawVal = value.trim();
        // If it is 0 or empty, replace with a clean dash
        span.textContent = rawVal === '' || rawVal === '0' ? '-' : rawVal;
        
        // Copy essential text layout classes
        span.className = inputEl.className;
        span.style.border = 'none';
        span.style.background = 'transparent';
        span.style.boxShadow = 'none';
        span.style.outline = 'none';
        span.style.display = 'inline-block';
        span.style.width = '100%';
        span.style.textAlign = 'center';
        span.style.color = '#000000';
        span.style.fontWeight = '900';
        
        let fontSize = '11px';
        if (inputEl.classList.contains('text-[11px]') || inputEl.className.includes('text-[11px]')) {
          fontSize = '11px';
        } else if (inputEl.classList.contains('text-[10px]') || inputEl.className.includes('text-[10px]')) {
          fontSize = '10px';
        } else if (inputEl.classList.contains('text-xs') || inputEl.className.includes('text-xs')) {
          fontSize = '11.5px';
        } else if (inputEl.classList.contains('text-sm') || inputEl.className.includes('text-sm')) {
          fontSize = '13.5px';
        } else {
          const isCompact = inputEl.className.includes('py-1') || inputEl.className.includes('py-1.5') || inputEl.className.includes('text-[11px]') || inputEl.className.includes('text-[10px]');
          fontSize = isCompact ? '11px' : '13px';
        }
        span.style.fontSize = fontSize;
        
        if (inputEl.parentElement) {
          inputEl.parentElement.replaceChild(span, inputEl);
        }
      });

      const originalSelectTriggers = el.querySelectorAll('.aesthetic-select-trigger');

      // Convert all custom select elements inside the sheet to flat clean text tags
      clone.querySelectorAll('.aesthetic-select-trigger').forEach((trigger, tIdx) => {
        const isComp = (trigger as HTMLElement).getAttribute('data-compact') !== 'false';
        if (isComp) {
          const value = (trigger as HTMLElement).getAttribute('data-value') || '';
          const span = document.createElement('span');
          const rawVal = value.trim();
          span.textContent = rawVal === '' || rawVal === '0' ? '-' : rawVal;
          
          span.className = trigger.className;
          span.style.border = 'none';
          span.style.background = 'transparent';
          span.style.boxShadow = 'none';
          span.style.outline = 'none';
          span.style.display = 'inline-block';
          span.style.width = '100%';
          span.style.textAlign = 'center';
          span.style.color = '#000000';
          span.style.fontWeight = '900';
          
          let fontSize = '11px';
          if (trigger.classList.contains('text-[11px]') || trigger.className.includes('text-[11px]')) {
            fontSize = '11px';
          } else if (trigger.classList.contains('text-[10px]') || trigger.className.includes('text-[10px]')) {
            fontSize = '10px';
          } else if (trigger.classList.contains('text-xs') || trigger.className.includes('text-xs')) {
            fontSize = '11.5px';
          } else if (trigger.classList.contains('text-sm') || trigger.className.includes('text-sm')) {
            fontSize = '13.5px';
          } else {
            fontSize = isComp ? '11px' : '13px';
          }
          span.style.fontSize = fontSize;
          
          trigger.replaceWith(span);
        } else {
          const btn = trigger as HTMLElement;
          btn.style.pointerEvents = 'none';
          btn.style.cursor = 'default';
          btn.querySelectorAll('.select-chevron-icon').forEach((c) => {
            (c as HTMLElement).style.display = 'none';
          });
        }
      });

      // Ensure exact table styling overrides are injected directly inside the cloned context
      const cssText = `
        * { 
          font-family: 'Noto Sans Arabic', 'Inter', sans-serif !important;
          color-scheme: light !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, div, label, input, textarea {
          letter-spacing: normal !important;
          word-spacing: normal !important;
        }
        .flex {
          display: flex !important;
        }
        .flex-col {
          flex-direction: column !important;
        }
        .items-stretch {
          align-items: stretch !important;
        }
        .text-center {
          text-align: center !important;
        }
        .bg-slate-100 {
          background-color: #f1f5f9 !important;
        }
        .bg-slate-50 {
          background-color: #f8fafc !important;
        }
        .bg-amber-100 {
          background-color: #fef3c7 !important;
        }
        .bg-rose-100 {
          background-color: #ffe4e6 !important;
        }
        .bg-emerald-100 {
          background-color: #d1fae5 !important;
        }
        .bg-indigo-100 {
          background-color: #e0e7ff !important;
        }
        .bg-amber-500\\/10 {
          background-color: rgba(245, 158, 11, 0.1) !important;
        }
        .bg-amber-500\\/20 {
          background-color: rgba(245, 158, 11, 0.2) !important;
        }
        .bg-amber-50\\/20 {
          background-color: rgba(254, 243, 199, 0.2) !important;
        }
        .bg-rose-50\\/20 {
          background-color: rgba(254, 226, 226, 0.2) !important;
        }
        .bg-emerald-50\\/20 {
          background-color: rgba(209, 250, 229, 0.2) !important;
        }
        .bg-indigo-50\\/20 {
          background-color: rgba(224, 231, 255, 0.2) !important;
        }
        /* Grids must stay inline and never wrap to cause sliding down */
        .grid {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          justify-content: space-between !important;
        }
        .grid-cols-3 > * {
          width: 33.33% !important;
          flex: 1 1 33.33% !important;
          box-sizing: border-box !important;
        }
        .grid-cols-4 > * {
          width: 25% !important;
          flex: 1 1 25% !important;
          box-sizing: border-box !important;
        }
      `;

      const safeStyle = document.createElement('style');
      safeStyle.textContent = cssText;
      clone.appendChild(safeStyle);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = (target as any)[prop];
            if (typeof val === 'string') {
              if (val.includes('oklch') || val.includes('oklab')) {
                return replaceOklchAndOklabText(val);
              }
              return val;
            }
            if (typeof val === 'function') {
              return function(...args: any[]) {
                const res = (val as Function).apply(target, args);
                if (typeof res === 'string' && (res.includes('oklch') || res.includes('oklab'))) {
                  return replaceOklchAndOklabText(res);
                }
                return res;
              };
            }
            return val;
          }
        }) as any;
      };

      // Clean OKLCH colors inside the clone
      clone.querySelectorAll('*').forEach((clonedEl) => {
        const htmlEl = clonedEl as HTMLElement;
        const computed = originalGetComputedStyle(htmlEl);
        const properties = ['color', 'backgroundColor', 'borderColor', 'boxShadow', 'fill', 'stroke'];
        
        properties.forEach(prop => {
          const val = computed.getPropertyValue(prop.replace(/([A-Z])/g, "-$1").toLowerCase());
          if (val && (val.includes('oklch') || val.includes('oklab'))) {
             const cleanedValue = replaceOklchAndOklabText(val);
             htmlEl.style.setProperty(prop.replace(/([A-Z])/g, "-$1").toLowerCase(), cleanedValue, 'important');
          }
        });
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Temporarily bypass oklch-related CSS rules in stylesheet parsing of html2canvas
      const originalStyleSheets = document.styleSheets;
      try {
        const sheetsArray = Array.from(originalStyleSheets).map(sheet => {
          try {
            if (!sheet.cssRules) return sheet;
            const rules = Array.from(sheet.cssRules);
            const filteredRules = rules.filter(rule => {
              const txt = rule.cssText;
              return !txt.includes('oklch') && !txt.includes('oklab');
            });
            return new Proxy(sheet, {
              get(target, prop) {
                if (prop === 'cssRules' || prop === 'rules') {
                  return filteredRules;
                }
                const val = (target as any)[prop];
                if (typeof val === 'function') {
                  return val.bind(target);
                }
                return val;
              }
            });
          } catch (e) {
            return sheet;
          }
        });
        
        Object.defineProperty(document, 'styleSheets', {
          get: () => sheetsArray,
          configurable: true
        });
      } catch (e) {
        console.error("Could not patch styleSheets:", e);
      }

      try {
        const canvas = await html2canvas(clone, { 
          scale: 3, // Ultra-high 3x resolution for beautiful printing
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 850,
          windowHeight: clone.offsetHeight + 100,
        });

        const link = document.createElement('a');
        const kind = type === 'weekly' ? 'أسبوعية' : 'شهرية';
        link.download = `إحصائية_${kind}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("خطأ أثناء تصدير الصورة:", err);
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        try {
          delete (document as any).styleSheets;
        } catch (e) {
          console.error("Failed to restore styleSheets:", e);
        }
        document.body.removeChild(wrapper);
      }
    }
  };

  const exportDashboardAsImage = async () => {
    const el = document.getElementById('stats-dashboard-visualizer');
    if (el) {
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('unsupported color function') || args[0].includes('oklch') || args[0].includes('oklab') || args[0].includes('CSS font-family'))) {
          return;
        }
        originalConsoleWarn(...args);
      };
      console.error = (...args) => {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('unsupported color function') || args[0].includes('oklch') || args[0].includes('oklab'))) {
          return;
        }
        originalConsoleError(...args);
      };

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = (target as any)[prop];
            if (typeof val === 'string') {
              if (val.includes('oklch') || val.includes('oklab')) {
                return replaceOklchAndOklabText(val);
              }
              return val;
            }
            if (typeof val === 'function') {
              return function(...args: any[]) {
                const res = (val as Function).apply(target, args);
                if (typeof res === 'string' && (res.includes('oklch') || res.includes('oklab'))) {
                  return replaceOklchAndOklabText(res);
                }
                return res;
              };
            }
            return val;
          }
        }) as any;
      };

      // Temporarily bypass oklch-related CSS rules in stylesheet parsing of html2canvas
      const originalStyleSheets = document.styleSheets;
      let patchApplied = false;
      try {
        const sheetsArray = Array.from(originalStyleSheets).map(sheet => {
          try {
            if (!sheet.cssRules) return sheet;
            const rules = Array.from(sheet.cssRules);
            const filteredRules = rules.filter(rule => {
              const txt = rule.cssText;
              return !txt.includes('oklch') && !txt.includes('oklab');
            });
            return new Proxy(sheet, {
              get(target, prop) {
                if (prop === 'cssRules' || prop === 'rules') {
                  return filteredRules;
                }
                const val = (target as any)[prop];
                if (typeof val === 'function') {
                  return val.bind(target);
                }
                return val;
              }
            });
          } catch (e) {
            return sheet;
          }
        });
        
        Object.defineProperty(document, 'styleSheets', {
          get: () => sheetsArray,
          configurable: true
        });
        patchApplied = true;
      } catch (e) {
        console.error("Could not patch styleSheets:", e);
      }

      try {
        // Capture EXACT visible element in place with supreme scaling, exact grids, and perfect colors
        const canvas = await html2canvas(el, { 
          scale: 3, // Premium high-definition
          backgroundColor: null, // Inherits the actual active theme background style
          useCORS: true,
          logging: false,
          allowTaint: true,
          scrollX: 0,
          scrollY: -window.scrollY,
        });

        const link = document.createElement('a');
        const kind = chartTab === 'weekly' ? 'الكلي_الأسبوعي' : 'التراكمي_الشهري';
        link.download = `التحليل_الإحصائي_${kind}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("Error exporting stats dashboard:", err);
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        if (patchApplied) {
          try {
            delete (document as any).styleSheets;
          } catch (e) {
            console.error("Failed to restore styleSheets:", e);
          }
        }
      }
    }
  };

  const printStatsReport = (id: string) => {
    const originalTitle = document.title;
    document.title = `إحصائية_بلدية_الكويت_${formData.reportType === 'weekly' ? 'أسبوعية' : 'شهرية'}`;
    
    // Add class active stats to body for @media print selection
    document.body.classList.add('printing-active-stats');
    
    // Setup cleanup handler
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      document.body.classList.remove('printing-active-stats');
      document.title = originalTitle;
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    
    // Execute browser print dialogue directly
    window.print();
    
    // Safe fallback timeout cleanup if afterprint event doesn't fire
    setTimeout(cleanup, 2000);
  };

  const handleExportArchivedStats = (report: DailyStats) => {
    setSubTab('daily_stats');
    setFormData(report);
    setTimeout(() => {
      exportTableAsImage('preview', report.reportType || 'weekly');
    }, 450);
  };

  const handlePrintArchivedStats = (report: DailyStats) => {
    setSubTab('daily_stats');
    setFormData(report);
    setTimeout(() => {
      handlePrintClick('stats', report.id);
    }, 400);
  };

  const getRowTotal = (s: Omit<DailyStats, 'id'> & { id?: string }) => {
    return (
      (s.hygieneLawCarRemoval || 0) +
      (s.hygieneLawPublic || s.cleaningViolations || 0) +
      (s.law30_2021 || 0) +
      (s.violations9_87 || 0) +
      (s.streetVendors || 0) +
      (s.warnings || 0) +
      (s.undertakings || 0) +
      (s.stickers || 0) +
      (s.droppedCarsNeglected || 0) +
      (s.droppedCarsScrap || 0) +
      (s.droppedCarsForSale || 0)
    );
  };

  const getColTotal = (colKey: string) => {
    // Map cleaningViolations backward compatibility
    const lookupKey = colKey === 'hygieneLawPublic' ? 'hygieneLawPublic' : colKey;
    
    let total = Number(formData[lookupKey as keyof typeof formData]) || 0;
    if (colKey === 'hygieneLawPublic' && formData.cleaningViolations) {
      total = Math.max(total, formData.cleaningViolations);
    }
    
    return total;
  };

  const getGrandTotal = () => {
    const keys = [
      'hygieneLawCarRemoval',
      'hygieneLawPublic',
      'law30_2021',
      'violations9_87',
      'streetVendors',
      'warnings',
      'undertakings',
      'stickers',
      'droppedCarsNeglected',
      'droppedCarsScrap',
      'droppedCarsForSale'
    ];
    return keys.reduce((sum, key) => sum + getColTotal(key), 0);
  };

  const renderCellInput = (
    fieldKey: string,
    rowPrefix?: 'row2' | 'row3' | 'row4' | 'row5' | 'row6' | 'row7' | 'row8' | 'row9' | 'row10'
  ) => {
    const fullKey = rowPrefix ? `${rowPrefix}_${fieldKey}` as keyof typeof formData : fieldKey as keyof typeof formData;
    const value = formData[fullKey];
    
    return (
      <input
        type="text"
        className="w-full text-center bg-transparent border-0 ring-0 outline-none p-1 text-slate-900 dark:text-slate-100 text-[11px] font-black focus:bg-amber-100/65 focus:ring-1 focus:ring-municipality-gold bg-amber-50/5"
        value={value === undefined || value === 0 ? '' : value}
        placeholder="-"
        onChange={e => {
          const val = e.target.value.trim();
          const parsed = val === '' ? 0 : parseInt(val, 10);
          setFormData({
            ...formData,
            [fullKey]: isNaN(parsed) ? 0 : parsed
          });
        }}
      />
    );
  };

  // Field Report Handlers
  const handleFieldSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldForm.inspectorName || !fieldForm.centerName) {
      alert('يرجى اختيار المفتش والمركز الرئيسي أولاً');
      return;
    }
    if (onSaveFieldReport) {
      const reportId = fieldForm.id || crypto.randomUUID();
      onSaveFieldReport({ ...fieldForm, id: reportId } as FieldInspectionReport);
      
      setTimeout(() => {
        exportFieldAsImage('preview', fieldForm.inspectorName);
      }, 350);

      alert('✅ تم حفظ الكشف الميداني المعتمد بنجاح وأرشفته! تم تنزيل ورقة المعاينة المصورة تلقائياً.');
      resetFieldForm();
    }
  };

  const resetFieldForm = () => {
    setFieldForm(initialFieldState);
  };

  const exportFieldAsImage = async (id: string, name?: string) => {
    const el = document.getElementById(`field-report-canvas-${id}`);
    if (el) {
      const originalConsoleWarn = console.warn;
      const originalConsoleError = console.error;
      console.warn = (...args) => {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('unsupported color function') || args[0].includes('oklch') || args[0].includes('oklab'))) {
          return;
        }
        originalConsoleWarn(...args);
      };
      console.error = (...args) => {
        if (args[0] && typeof args[0] === 'string' && (args[0].includes('unsupported color function') || args[0].includes('oklch') || args[0].includes('oklab'))) {
          return;
        }
        originalConsoleError(...args);
      };

      // Create offscreen container on body to prevent iframe/viewport boundaries from cutting text
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = '850px';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.direction = 'rtl';
      wrapper.style.overflow = 'visible';

      const clone = el.cloneNode(true) as HTMLElement;
      
      // Explicitly copy current live values from original to clone (cloneNode does not copy dynamic form values)
      const originalInputs = el.querySelectorAll('input, select, textarea');
      const clonedInputs = clone.querySelectorAll('input, select, textarea');
      clonedInputs.forEach((clonedEl, idx) => {
        const origEl = originalInputs[idx] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (origEl) {
          (clonedEl as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value = origEl.value;
        }
      });

      clone.id = `cloned-field-report-canvas-${id}`;
      clone.style.transform = 'none';
      clone.style.width = '820px';
      clone.style.minWidth = '820px';
      clone.style.maxWidth = '820px';
      clone.style.padding = '24px'; // Match live preview p-6 exactly
      clone.style.margin = '0 auto';
      clone.style.backgroundColor = '#ffffff';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';

      const innerDoubleBorder = clone.querySelector('.border-double') as HTMLElement;
      if (innerDoubleBorder) {
        innerDoubleBorder.style.padding = '24px'; // Match live preview p-6 exactly
      }

      // Convert all form fields inside the sheet to flat clean text elements so they print and download beautifully with zero empty rectangles
      clone.querySelectorAll('input, select, textarea').forEach((field, fIdx) => {
        const inputEl = field as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        let value = inputEl.value || '';
        
        if (inputEl.tagName === 'SELECT') {
          const sel = inputEl as HTMLSelectElement;
          value = sel.options[sel.selectedIndex]?.text || value;
        }
        
        const span = document.createElement('span');
        const rawVal = value.trim();
        span.textContent = rawVal === '' || rawVal === '0' ? '-' : rawVal;
        
        span.className = inputEl.className;
        span.style.border = 'none';
        span.style.background = 'transparent';
        span.style.boxShadow = 'none';
        span.style.outline = 'none';
        span.style.display = 'inline-block';
        span.style.width = '100%';
        span.style.textAlign = 'center';
        span.style.color = '#000000';
        span.style.fontWeight = '900';
        
        let fontSize = '11px';
        if (inputEl.classList.contains('text-[11px]') || inputEl.className.includes('text-[11px]')) {
          fontSize = '11px';
        } else if (inputEl.classList.contains('text-[10px]') || inputEl.className.includes('text-[10px]')) {
          fontSize = '10px';
        } else if (inputEl.classList.contains('text-xs') || inputEl.className.includes('text-xs')) {
          fontSize = '11.5px';
        } else if (inputEl.classList.contains('text-sm') || inputEl.className.includes('text-sm')) {
          fontSize = '13.5px';
        } else {
          const isCompact = inputEl.className.includes('py-1') || inputEl.className.includes('py-1.5') || inputEl.className.includes('text-[11px]') || inputEl.className.includes('text-[10px]');
          fontSize = isCompact ? '11px' : '13px';
        }
        span.style.fontSize = fontSize;
        
        if (inputEl.parentElement) {
          inputEl.parentElement.replaceChild(span, inputEl);
        }
      });

      const originalSelectTriggers = el.querySelectorAll('.aesthetic-select-trigger');

      // Convert all custom select elements inside the sheet to flat clean text tags
      clone.querySelectorAll('.aesthetic-select-trigger').forEach((trigger, tIdx) => {
        const isComp = (trigger as HTMLElement).getAttribute('data-compact') !== 'false';
        if (isComp) {
          const value = (trigger as HTMLElement).getAttribute('data-value') || '';
          const span = document.createElement('span');
          const rawVal = value.trim();
          span.textContent = rawVal === '' || rawVal === '0' ? '-' : rawVal;
          
          span.className = trigger.className;
          span.style.border = 'none';
          span.style.background = 'transparent';
          span.style.boxShadow = 'none';
          span.style.outline = 'none';
          span.style.display = 'inline-block';
          span.style.width = '100%';
          span.style.textAlign = 'center';
          span.style.color = '#000000';
          span.style.fontWeight = '900';
          
          let fontSize = '11px';
          if (trigger.classList.contains('text-[11px]') || trigger.className.includes('text-[11px]')) {
            fontSize = '11px';
          } else if (trigger.classList.contains('text-[10px]') || trigger.className.includes('text-[10px]')) {
            fontSize = '10px';
          } else if (trigger.classList.contains('text-xs') || trigger.className.includes('text-xs')) {
            fontSize = '11.5px';
          } else if (trigger.classList.contains('text-sm') || trigger.className.includes('text-sm')) {
            fontSize = '13.5px';
          } else {
            fontSize = isComp ? '11px' : '13px';
          }
          span.style.fontSize = fontSize;
          
          trigger.replaceWith(span);
        } else {
          const btn = trigger as HTMLElement;
          btn.style.pointerEvents = 'none';
          btn.style.cursor = 'default';
          btn.querySelectorAll('.select-chevron-icon').forEach((c) => {
            (c as HTMLElement).style.display = 'none';
          });
        }
      });

      const cssText = `
        * {
          font-family: 'Noto Sans Arabic', 'Inter', sans-serif !important;
          color-scheme: light !important;
          letter-spacing: normal !important;
          word-spacing: normal !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
        }
        p, span, h1, h2, h3, h4, h5, h6, div, label, input, textarea {
          letter-spacing: normal !important;
          word-spacing: normal !important;
        }
        /* Grids must stay inline and never wrap to cause sliding down */
        .grid {
          display: flex !important;
          flex-direction: row !important;
          flex-wrap: nowrap !important;
          justify-content: space-between !important;
          align-items: stretch !important;
          gap: 12px !important;
          width: 100% !important;
          box-sizing: border-box !important;
        }
        .grid-cols-2 > * {
          width: 50% !important;
          flex: 1 1 50% !important;
          box-sizing: border-box !important;
        }
        .grid-cols-3 > * {
          width: 33.33% !important;
          flex: 1 1 33.33% !important;
          box-sizing: border-box !important;
        }
        .grid-cols-4 > * {
          width: 25% !important;
          flex: 1 1 25% !important;
          box-sizing: border-box !important;
        }
        .ruled-lines-canvas {
          background-image: linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 96%, #e2e8f0 96%, #e2e8f0 100%) !important;
          background-size: 100% 32px !important;
          line-height: 32px !important;
          padding-top: 1px !important;
        }
        .ruled-lines-canvas *, .whitespace-pre-wrap, .break-words {
          white-space: pre-wrap !important;
          word-break: break-word !important;
        }
      `;

      const safeStyle = document.createElement('style');
      safeStyle.textContent = cssText;
      clone.appendChild(safeStyle);

      const originalGetComputedStyle = window.getComputedStyle;
      window.getComputedStyle = function(elt, pseudoElt) {
        const style = originalGetComputedStyle(elt, pseudoElt);
        return new Proxy(style, {
          get(target, prop) {
            const val = (target as any)[prop];
            if (typeof val === 'string') {
              if (val.includes('oklch') || val.includes('oklab')) {
                return replaceOklchAndOklabText(val);
              }
              return val;
            }
            if (typeof val === 'function') {
              return function(...args: any[]) {
                const res = (val as Function).apply(target, args);
                if (typeof res === 'string' && (res.includes('oklch') || res.includes('oklab'))) {
                  return replaceOklchAndOklabText(res);
                }
                return res;
              };
            }
            return val;
          }
        }) as any;
      };

      // Clean OKLCH colors inside the clone
      clone.querySelectorAll('*').forEach((clonedEl) => {
        const htmlEl = clonedEl as HTMLElement;
        const computed = originalGetComputedStyle(htmlEl);
        const properties = ['color', 'backgroundColor', 'borderColor', 'boxShadow', 'fill', 'stroke'];
        
        properties.forEach(prop => {
          const val = computed.getPropertyValue(prop.replace(/([A-Z])/g, "-$1").toLowerCase());
          if (val && (val.includes('oklch') || val.includes('oklab'))) {
             const cleanedValue = replaceOklchAndOklabText(val);
             htmlEl.style.setProperty(prop.replace(/([A-Z])/g, "-$1").toLowerCase(), cleanedValue, 'important');
          }
        });
      });

      wrapper.appendChild(clone);
      document.body.appendChild(wrapper);

      // Temporarily bypass oklch-related CSS rules in stylesheet parsing of html2canvas
      const originalStyleSheets = document.styleSheets;
      try {
        const sheetsArray = Array.from(originalStyleSheets).map(sheet => {
          try {
            if (!sheet.cssRules) return sheet;
            const rules = Array.from(sheet.cssRules);
            const filteredRules = rules.filter(rule => {
              const txt = rule.cssText;
              return !txt.includes('oklch') && !txt.includes('oklab');
            });
            return new Proxy(sheet, {
              get(target, prop) {
                if (prop === 'cssRules' || prop === 'rules') {
                  return filteredRules;
                }
                const val = (target as any)[prop];
                if (typeof val === 'function') {
                  return val.bind(target);
                }
                return val;
              }
            });
          } catch (e) {
            return sheet;
          }
        });
        
        Object.defineProperty(document, 'styleSheets', {
          get: () => sheetsArray,
          configurable: true
        });
      } catch (e) {
        console.error("Could not patch styleSheets:", e);
      }

      try {
        const canvas = await html2canvas(clone, {
          scale: 3, // Ultra-high 3x resolution
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false,
          allowTaint: true,
          scrollX: 0,
          scrollY: 0,
          windowWidth: 850,
          windowHeight: clone.offsetHeight + 100,
        });

        const link = document.createElement('a');
        link.download = `كشف_ميداني_${name || 'الموظف'}_${new Date().toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("خطأ أثناء تصدير الصورة الكشف الميداني:", err);
      } finally {
        window.getComputedStyle = originalGetComputedStyle;
        console.warn = originalConsoleWarn;
        console.error = originalConsoleError;
        try {
          delete (document as any).styleSheets;
        } catch (e) {
          console.error("Failed to restore styleSheets:", e);
        }
        document.body.removeChild(wrapper);
      }
    }
  };

  const printFieldReport = (id: string) => {
    const originalTitle = document.title;
    document.title = `تقرير_كشف_ميداني_${fieldForm.inspectorName || 'المفتش'}`;
    
    // Add class active field to body for @media print selection
    document.body.classList.add('printing-active-field');
    
    // Setup cleanup handler
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      document.body.classList.remove('printing-active-field');
      document.title = originalTitle;
      window.removeEventListener('afterprint', cleanup);
    };

    window.addEventListener('afterprint', cleanup);
    
    // Execute browser print dialogue directly
    window.print();
    
    // Safe fallback timeout cleanup if afterprint event doesn't fire
    setTimeout(cleanup, 2000);
  };

  const handleExportArchivedField = (report: FieldInspectionReport) => {
    setSubTab('field_report');
    setFieldForm(report);
    setTimeout(() => {
      exportFieldAsImage('preview', report.inspectorName);
    }, 450);
  };

  const handlePrintArchivedField = (report: FieldInspectionReport) => {
    setSubTab('field_report');
    setFieldForm(report);
    setTimeout(() => {
      handlePrintClick('field', report.id);
    }, 400);
  };

  const handlePrintClick = (type: 'stats' | 'field', id: string) => {
    const isIframe = window.self !== window.top;
    
    if (isIframe) {
      // Clear ID defaults to 'preview' if missing
      const reportId = id || 'preview';
      setPrintIframeModal({
        show: true,
        type,
        id: reportId
      });
      
      try {
        if (type === 'stats') {
          printStatsReport('preview');
        } else {
          printFieldReport('preview');
        }
      } catch (e) {
        console.warn("Iframe secure print restricted by browser engine.", e);
      }
    } else {
      if (type === 'stats') {
        printStatsReport('preview');
      } else {
        printFieldReport('preview');
      }
    }
  };

  // Automatically start direct premium print if launched with query options
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const autoPrintType = params.get('autoPrintType');
    const autoPrintId = params.get('autoPrintId');
    if (autoPrintType && autoPrintId) {
      if (autoPrintType === 'stats') {
        const found = stats.find(s => s.id === autoPrintId);
        if (found) {
          setSubTab('daily_stats');
          setFormData(found);
          setActiveStatsPreviewModal(true);
          setTimeout(() => {
            printStatsReport('preview');
          }, 1200);
        } else if (autoPrintId === 'preview') {
          setSubTab('daily_stats');
          setActiveStatsPreviewModal(true);
          setTimeout(() => {
            printStatsReport('preview');
          }, 1200);
        }
      } else if (autoPrintType === 'field') {
        const found = fieldReports.find(f => f.id === autoPrintId);
        if (found) {
          setSubTab('field_report');
          setFieldForm(found);
          setTimeout(() => {
            printFieldReport('preview');
          }, 1200);
        }
      }
      
      // Clean search parameters visually
      try {
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: cleanUrl}, '', cleanUrl);
      } catch (e) {
        console.error("Failed to replace browser path:", e);
      }
    }
  }, [stats, fieldReports]);

  return (
    <div className="space-y-8">
      {/* Tab Switcher */}
      <div className="flex bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm border border-gray-100 dark:border-slate-800 max-w-lg mx-auto print:hidden">
        <button 
          onClick={() => setSubTab('daily_stats')} 
          className={`flex-1 py-3 text-center rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            subTab === 'daily_stats' 
              ? 'bg-[#cca354] dark:bg-municipality-gold text-white dark:text-slate-950 shadow-md font-black border border-[#cca354] dark:border-municipality-gold' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Clipboard size={18} />
          نموذج الإحصائيات (أسبوعي/شهري)
        </button>
        <button 
          onClick={() => setSubTab('field_report')} 
          className={`flex-1 py-3 text-center rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
            subTab === 'field_report' 
              ? 'bg-[#cca354] dark:bg-municipality-gold text-white dark:text-slate-950 shadow-md font-black border border-[#cca354] dark:border-municipality-gold' 
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800/50'
          }`}
        >
          <FileSignature size={18} />
          نموذج الكشف الميداني (A4)
        </button>
      </div>

      {subTab === 'daily_stats' && (
        <>
          <div className="w-full max-w-4xl mx-auto space-y-8">
          {/* Main Layout containing form centered */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 p-6 shadow-md space-y-6 print:hidden">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-municipality-blue dark:text-white flex items-center gap-2">
                  <Clipboard size={22} className="text-municipality-gold" />
                  تعبئة الإحصائية الجديدة
                </h3>
                <button 
                  onClick={resetStatsForm}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} /> تصفير الأرقام
                </button>
            </div>

              <form onSubmit={handleStatsSubmit} className="space-y-5">
                {/* Toggle Report Type */}
                <div className="bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800">
                  <label className="text-xs font-black text-slate-700 dark:text-gray-300 mb-2 block">اختر نوع نموذج الإحصائية:</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, reportType: 'weekly' })}
                      className={`flex-1 py-2.5 text-center rounded-lg font-black text-sm transition-all border ${
                        formData.reportType === 'weekly'
                          ? 'bg-[#cca354] dark:bg-municipality-gold text-white dark:text-slate-950 border-[#cca354] dark:border-municipality-gold shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-250 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      📋 إحصائية أسبوعية
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, reportType: 'monthly' })}
                      className={`flex-1 py-2.5 text-center rounded-lg font-black text-sm transition-all border ${
                        formData.reportType === 'monthly'
                          ? 'bg-[#cca354] dark:bg-municipality-gold text-white dark:text-slate-950 border-[#cca354] dark:border-municipality-gold shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 border-gray-250 dark:border-slate-700 hover:bg-gray-55 dark:hover:bg-slate-750'
                      }`}
                    >
                      📅 إحصائية شهرية
                    </button>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border border-gray-200 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-black text-slate-800 dark:text-gray-300 border-r-2 border-municipality-gold pr-2 font-black leading-tight">الفترة الزمنية للتقرير</p>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-300">الفترة من تاريخ</label>
                      <input 
                        type="date" 
                        className="municipal-input focus:ring-municipality-gold font-extrabold" 
                        value={formData.date}
                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-300">الفترة إلى تاريخ</label>
                      <input 
                        type="date" 
                        className="municipal-input focus:ring-municipality-gold font-extrabold" 
                        value={formData.dateTo || ''}
                        onChange={e => setFormData({ ...formData, dateTo: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Center and shift */}
                <div className="bg-slate-50/50 dark:bg-slate-850/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-black text-slate-800 dark:text-gray-300 border-r-2 border-municipality-gold pr-2 font-black leading-tight flex items-center gap-1.5">
                    <MapPin size={14} className="text-municipality-gold" />
                    معلومات المركز ونوبة العمل المعتمدة للتقرير
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 dark:text-gray-400 block">مركز النظافة:</label>
                      <AestheticSelect
                        value={formData.centerName}
                        onChange={val => setFormData({ ...formData, centerName: val })}
                        options={settings.centers.map(c => c.name)}
                        placeholder="اختر المركز..."
                        colorTheme="blue"
                        iconType="map"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-black text-slate-500 dark:text-gray-400 block">نوبة العمل:</label>
                      <input 
                        type="text"
                        className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:border-municipality-gold focus:ring-1 focus:ring-municipality-gold outline-none transition-all"
                        placeholder="مثال: أ / ب / ج / صباحي..."
                        value={formData.shift || ''}
                        onChange={e => setFormData({ ...formData, shift: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 🎖️ Center achievements metrics */}
                <div className="bg-slate-50/50 dark:bg-slate-900/45 p-6 rounded-2xl border border-gray-150 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-250 dark:border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <User className="text-municipality-blue dark:text-municipality-gold" size={20} />
                      <span className="text-sm font-black text-municipality-blue dark:text-white">بيانات وإحصائيات المركز المعتمدة للتقرير الإحصائي</span>
                    </div>
                  </div>

                  <div className="space-y-4 animate-fade-in">
                    {/* Center details / Optional signoff employee */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-gray-150 dark:border-slate-800">
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 dark:text-gray-400 block">اسم المسؤول / المفتش المسؤول عن التقرير (اختياري):</label>
                        <div className="relative">
                          <input 
                            type="text"
                            className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:border-municipality-gold focus:ring-1 focus:ring-municipality-gold outline-none transition-all pr-3 text-right"
                            value={formData.inspectorName || ''}
                            placeholder="اكتب الاسم أو حدده..."
                            onChange={e => {
                              const val = e.target.value;
                              const ins = settings.inspectors.find(i => i.name === val);
                              setFormData({
                                ...formData,
                                inspectorName: val,
                                jobTitle: ins ? 'مفتش نظافة' : (formData.jobTitle || 'مفتش نظافة'),
                                fileNumber: ins ? ins.id : (formData.fileNumber || '')
                              });
                            }}
                            list="inspectors-datalist"
                          />
                          <datalist id="inspectors-datalist">
                            {settings.inspectors.map(i => (
                              <option key={i.id} value={i.name} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-500 dark:text-gray-400 block">المسمى الوظيفي للمسؤول (اختياري):</label>
                        <input 
                          type="text"
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:border-municipality-gold focus:ring-1 focus:ring-municipality-gold outline-none transition-all"
                          value={formData.jobTitle || ''}
                          placeholder="مثال: رئيس مركز نظافة..."
                          onChange={e => setFormData({ ...formData, jobTitle: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-black text-slate-550 dark:text-gray-400 block">رقم الضبطية القضائية / الملف (اختياري):</label>
                        <input 
                          type="text"
                          className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:border-municipality-gold focus:ring-1 focus:ring-municipality-gold outline-none transition-all"
                          value={formData.fileNumber || ''}
                          placeholder="رقم المفتش أو ملف المركز..."
                          onChange={e => setFormData({ ...formData, fileNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Dynamic Achievements */}
                    <div className="bg-white dark:bg-slate-900/35 p-4 border border-gray-150 dark:border-slate-800 rounded-xl space-y-4">
                      <span className="text-xs font-black text-municipality-blue dark:text-gray-300 block border-b border-gray-100 dark:border-slate-800 pb-2">
                        📊 تفاصيل وأرقام إنجازات المركز (التي تظهر بالجدول):
                      </span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        
                        {/* Group 1: Hygiene Law 354 */}
                        <div className="p-3.5 rounded-xl space-y-2 stat-card-gold shadow-sm">
                          <span className="text-xs font-black block border-r-4 border-amber-500 pr-2 stat-title">قانون 354 (نظافة)</span>
                          <div className="space-y-2 text-[11px] font-bold">
                            <div>
                              <label className="block mb-1 font-black">رفع سيارات:</label>
                              {renderFormStatInput('hygieneLawCarRemoval')}
                            </div>
                            <div>
                              <label className="block mb-1 font-black">نظافة عامة:</label>
                              {renderFormStatInput('hygieneLawPublic')}
                            </div>
                          </div>
                        </div>

                        {/* Group 2: Special Laws */}
                        <div className="p-3.5 rounded-xl space-y-2 stat-card-red shadow-sm">
                          <span className="text-xs font-black block border-r-4 border-red-500 pr-2 stat-title">مخالفات وقوانين</span>
                          <div className="space-y-2 text-[11px] font-bold">
                            <div>
                              <label className="block mb-1 font-black">قانون 30/2021:</label>
                              {renderFormStatInput('law30_2021')}
                            </div>
                            <div>
                              <label className="block mb-1 font-black">مخالفات 9/87:</label>
                              {renderFormStatInput('violations9_87')}
                            </div>
                          </div>
                        </div>

                        {/* Group 3: Warnings & Undertakings */}
                        <div className="p-3.5 rounded-xl space-y-2 stat-card-green shadow-sm">
                          <span className="text-xs font-black block border-r-4 border-emerald-500 pr-2 stat-title">إنذارات وتعهدات</span>
                          <div className="space-y-2 text-[11px] font-bold">
                            <div>
                              <label className="block mb-1 font-black">الإنذارات الموجهة:</label>
                              {renderFormStatInput('warnings')}
                            </div>
                            <div>
                              <label className="block mb-1 font-black">التعهدات الموقعة:</label>
                              {renderFormStatInput('undertakings')}
                            </div>
                          </div>
                        </div>

                        {/* Group 4: Stickers & Vendor */}
                        <div className="p-3.5 rounded-xl space-y-2 stat-card-purple shadow-sm">
                          <span className="text-xs font-black block border-r-4 border-indigo-500 pr-2 stat-title">ملصقات وباعة</span>
                          <div className="space-y-2 text-[11px] font-bold">
                            <div>
                              <label className="block mb-1 font-black">باعة متجولين:</label>
                              {renderFormStatInput('streetVendors')}
                            </div>
                            <div>
                              <label className="block mb-1 font-black">ملصقات إنذار مهملة:</label>
                              {renderFormStatInput('stickers')}
                            </div>
                          </div>
                        </div>

                        {/* Group 5: Dropped Cars Categories */}
                        <div className="p-4 rounded-xl col-span-1 sm:col-span-2 lg:col-span-4 grid grid-cols-3 gap-3 stat-card-blue shadow-sm">
                          <span className="text-xs font-black block col-span-3 border-b border-sky-100 dark:border-sky-900 pb-2 pr-1 border-r-2 border-sky-500 stat-title">
                            🚗 تفاصيل وتصنيفات المركبات المهملة المرفوعة:
                          </span>
                          <div>
                            <label className="block mb-1 text-xs font-black">مركبات مهملة:</label>
                            {renderFormStatInput('droppedCarsNeglected')}
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-black">سيارات سكراب:</label>
                            {renderFormStatInput('droppedCarsScrap')}
                          </div>
                          <div>
                            <label className="block mb-1 text-xs font-black">معروضة للبيع:</label>
                            {renderFormStatInput('droppedCarsForSale')}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>

                 {/* Machinery & Trips */}
                 <div className="p-4 rounded-xl space-y-3 animate-fade-in animate-duration-205 stat-card-emerald shadow-sm">
                   <p className="text-xs font-black border-r-4 border-emerald-500 pr-2 stat-title">الآليات ودروب النقل</p>

                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                     <div className="space-y-1 bg-white p-2 rounded-lg border border-emerald-100">
                       <label className="text-[9px] font-bold text-emerald-800 block">النفايات</label>
                       <input 
                         type="number" min="0" className="w-full text-center text-xs font-black border-none outline-none p-0 mt-1 focus:ring-0"
                         value={formData.tripsWaste || 0}
                         onChange={e => setFormData({ ...formData, tripsWaste: parseInt(e.target.value) || 0 })}
                       />
                     </div>
                     <div className="space-y-1 bg-white p-2 rounded-lg border border-emerald-100">
                       <label className="text-[9px] font-bold text-emerald-800 block">نساف كبير</label>
                       <input 
                         type="number" min="0" className="w-full text-center text-xs font-black border-none outline-none p-0 mt-1 focus:ring-0"
                         value={formData.tripsBigDumper || 0}
                         onChange={e => setFormData({ ...formData, tripsBigDumper: parseInt(e.target.value) || 0 })}
                       />
                     </div>
                     <div className="space-y-1 bg-white p-2 rounded-lg border border-emerald-100">
                       <label className="text-[9px] font-bold text-emerald-800 block">نساف صغير</label>
                       <input 
                         type="number" min="0" className="w-full text-center text-xs font-black border-none outline-none p-0 mt-1 focus:ring-0"
                         value={formData.tripsSmallDumper || 0}
                         onChange={e => setFormData({ ...formData, tripsSmallDumper: parseInt(e.target.value) || 0 })}
                       />
                     </div>
                     <div className="space-y-1 bg-white p-2 rounded-lg border border-emerald-100">
                       <label className="text-[9px] font-bold text-emerald-800 block">لوري</label>
                       <input 
                         type="number" min="0" className="w-full text-center text-xs font-black border-none outline-none p-0 mt-1 focus:ring-0"
                         value={formData.tripsLorry || 0}
                         onChange={e => setFormData({ ...formData, tripsLorry: parseInt(e.target.value) || 0 })}
                       />
                     </div>
                   </div>
                 </div>

                                 <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button 
                     type="button"
                     onClick={() => setActiveStatsPreviewModal(true)}
                     className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-black py-3 px-6 rounded-xl transition-all shadow-md active:scale-95"
                   >
                     <Eye size={18} />
                     معاينة التقرير وتصديره (A4) 🔍
                   </button>
                   
                   <button 
                     type="submit" 
                     className="w-full flex items-center justify-center gap-2 bg-municipality-blue hover:bg-slate-800 text-white font-black py-3 px-6 rounded-xl transition-all shadow-md active:scale-95"
                   >
                     <Save size={18} />
                     اعتماد وحفظ الجدول الإحصائي 💾
                   </button>
                 </div>
               </form>
             </div>

              {/* Off-screen Active Canvas Container for export & print (HTML2Canvas safe) */}
              <div className="opacity-0 pointer-events-none absolute -left-[9999px] -top-[9999px] print:static print:opacity-100 print:pointer-events-auto print:w-auto print:h-auto whitespace-normal z-0">
                {/* Physical A4 Worksheet Simulation Container with high-fidelity scaling */}
                <div 
                  ref={statsContainerRef}
                  className="w-full overflow-hidden flex justify-center items-start bg-slate-50/50 dark:bg-slate-950/20 p-2 sm:p-4 rounded-3xl border border-gray-200/50 dark:border-slate-800"
                  style={{ height: statsPreviewHeight ? `${statsPreviewHeight + 16}px` : 'auto' }}
                >
                  <div 
                    ref={statsPreviewRef}
                    id="stats-report-canvas-preview"
                    className="w-[820px] bg-white text-slate-900 border border-gray-300 p-6 shadow-2xl relative select-none origin-top transition-transform duration-200 official-a4-canvas" 
                    style={{ 
                      direction: 'rtl',
                      transform: `scale(${statsPreviewScale})`,
                    }}
                  >
                    {/* Outer double border matching the official printed templates */}
                    <div className="border-4 border-double border-slate-900 p-6 flex flex-col justify-between" style={{ minHeight: '1120px' }}>
                      
                      {/* Header Details */}
                      <div className="grid grid-cols-3 gap-2 items-start border-b-2 border-slate-900 pb-4">
                      {/* Department text on right */}
                      <div className="text-right space-y-1 text-slate-950 font-bold text-[11px] leading-5">
                        <p className="text-sm font-extrabold text-black">بلدية الكويت</p>
                        <p>إدارة النظافة العامة وإشغالات الطرق</p>
                        <p>مراقبة النظافة العامة - محافظة العاصمة</p>
                        <p>قسم مراكز النظافة - مركز ({formData.centerName || '_________'})</p>
                      </div>

                      {/* Mascot logo - beautifully filling the rectangular area */}
                      <div className="text-center flex flex-col items-center justify-center space-y-1">
                        <div className="w-28 h-16 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-slate-900 overflow-hidden p-0 shadow-sm">
                          <img src={LOGO_BASE64} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="شعار بلدية الكويت" />
                        </div>
                        <p className="font-bold text-[9px] text-slate-800">بلدية الكويت</p>
                      </div>

                      {/* Report ID and constraints on left */}
                      <div className="text-left font-mono text-[10px] space-y-1 text-slate-950 font-bold leading-5">
                        <p className="font-black text-[11px] text-slate-900 text-left">
                          {formData.reportType === 'weekly' ? 'الإحصائية الأسبوعية لإنجازات الموظفين' : 'الإحصائية الشهرية لإنجازات الموظفين'}
                        </p>
                        <p className="text-left text-teal-850">مركز: {formData.centerName || '---------'}</p>
                        <p className="text-left text-teal-850">النوبة: {formData.shift || '---'}</p>
                        <p className="text-left text-slate-600">الفترة من: {formData.date}</p>
                        <p className="text-left text-slate-600">إلى: {formData.dateTo || '---------'}</p>
                      </div>
                    </div>

                    {/* NEW UNIFIED MASTER VISUAL DASHBOARD SHEET */}
                    {(() => {
                      // Aggregates for high-level categories
                      const aggHygiene = (formData.hygieneLawPublic || formData.cleaningViolations || 0) + (formData.hygieneLawCarRemoval || 0);
                      const aggViolations = (formData.violations9_87 || 0) + (formData.law30_2021 || 0) + (formData.streetVendors || 0);
                      const aggComplaints = formData.completedComplaints || 0;
                      const aggRoad = formData.roadObstructions || 0;
                      const aggCars = (formData.droppedCarsNeglected || 0) + (formData.droppedCarsScrap || 0) + (formData.droppedCarsForSale || 0);
                      const aggWarnings = (formData.warnings || 0) + (formData.undertakings || 0) + (formData.stickers || 0);
                      const aggTrips = (formData.tripsWaste || 0) + (formData.tripsBigDumper || 0) + (formData.tripsSmallDumper || 0) + (formData.tripsLorry || 0);

                      // Calculated grand total
                      const grandTotal = aggHygiene + aggViolations + aggComplaints + aggRoad + aggCars + aggWarnings + aggTrips;

                      const maxVal = Math.max(1, aggHygiene, aggViolations, aggComplaints, aggRoad, aggCars, aggWarnings, aggTrips);

                      const categories = [
                        { name: 'لائحة النظافة العامة م354', val: aggHygiene, color: '#154fc1', icon: '✨' },
                        { name: 'مخالفات وقوانين البلدية', val: aggViolations, color: '#1d4ed8', icon: '📝' },
                        { name: 'الشكاوى والاستفسارات المنجزة', val: aggComplaints, color: '#2563eb', icon: '🛡️' },
                        { name: 'مخالفات إشغالات الطرق', val: aggRoad, color: '#3b82f6', icon: '⚠️' },
                        { name: 'رفع المركبات والمهملات', val: aggCars, color: '#0284c7', icon: '🚜' },
                        { name: 'الإنذارات والتعهدات والملصقات', val: aggWarnings, color: '#06b6d4', icon: '📌' },
                        { name: 'حركة آليات دروب النقل (الدروب)', val: aggTrips, color: '#14b8a6', icon: '🚛' },
                      ];

                      return (
                        <div className="my-3 space-y-4 w-full">
                          {/* 1. Header Metadata Cards Grid */}
                          <div className="grid grid-cols-4 gap-2.5">
                            <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                              <p className="text-[8px] font-bold text-slate-500 mb-0.5">مركز النظافة ونوبة العمل</p>
                              <p className="text-[11px] font-black text-slate-950">
                                مركز {formData.centerName || '_________'} (نوبة {formData.shift || '___'})
                              </p>
                            </div>
                            <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                              <p className="text-[8px] font-bold text-slate-500 mb-0.5">المسؤول / المفتش المسؤول</p>
                              <p className="text-[11px] font-black text-slate-950">
                                {formData.inspectorName || '__________________'} ({formData.jobTitle || 'مفتش'})
                              </p>
                            </div>
                            <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                              <p className="text-[8px] font-bold text-slate-500 mb-0.5">رقم الضبطية / الملف</p>
                              <p className="text-[11px] font-bold font-mono text-slate-950">
                                {formData.fileNumber || '---------'}
                              </p>
                            </div>
                            <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                              <p className="text-[8px] font-bold text-slate-500 mb-0.5">الفترة الزمنية للإحصائية</p>
                              <p className="text-[10px] font-black text-teal-850 font-mono">
                                {formData.date} ➔ {formData.dateTo || '------'}
                              </p>
                            </div>
                          </div>

                          {/* 2. Main Graphical & Numeric Dashboard Panel */}
                          <div className="grid grid-cols-12 gap-3.5 items-stretch">
                            {/* Right side: Modern Horizontal Bar Chart Graph (Col-span 7) */}
                            <div className="col-span-7 border border-slate-900 rounded-xl bg-white p-3.5 flex flex-col justify-between shadow-sm">
                              <div>
                                <p className="text-[11px] font-black text-slate-950 border-b border-slate-300 pb-1.5 text-center bg-slate-100/60 rounded mb-3">
                                  📊 التحليل والمنحنى البياني التراكمي لإنجازات المركز
                                </p>
                                <div className="space-y-3 px-1 mt-2">
                                  {categories.map((cat, idx) => {
                                    const barWidth = Math.max(4, (cat.val / maxVal) * 100);
                                    return (
                                      <div key={idx} className="space-y-1">
                                        <div className="flex justify-between items-center text-[10px] font-black text-slate-900">
                                          <span className="flex items-center gap-1">
                                            <span>{cat.icon}</span>
                                            <span>{cat.name}</span>
                                          </span>
                                          <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                            {cat.val}
                                          </span>
                                        </div>
                                        <div className="h-4 w-full bg-slate-100 rounded border border-slate-300 overflow-hidden flex items-center relative">
                                          <div 
                                            className="h-full rounded-l"
                                            style={{ 
                                              width: `${barWidth}%`, 
                                              backgroundColor: cat.color,
                                            }}
                                          />
                                          {cat.val > 0 && (
                                            <span className="absolute left-2 text-[9px] font-mono font-extrabold text-black/80">
                                              {Math.round((cat.val / (grandTotal || 1)) * 100)}%
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Prominent High-Visibility Grand Total Shield */}
                              <div className="mt-4 bg-amber-500/15 border border-amber-500/50 p-2.5 rounded-lg flex items-center justify-between">
                                <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                                  🏆 الإجمالي العام لجميع المعاملات والإنجازات المسجلة:
                                </span>
                                <span className="font-mono font-black text-base bg-amber-500 text-slate-950 px-3 py-0.5 rounded-md border border-slate-900 shadow-sm">
                                  {grandTotal}
                                </span>
                              </div>
                            </div>

                            {/* Left side: Pure Static Detailed Figures Grid (Col-span 5) */}
                            <div className="col-span-5 border border-slate-900 rounded-xl bg-slate-50/50 p-3.5 flex flex-col justify-between shadow-sm">
                              <div>
                                <p className="text-[11px] font-black text-slate-950 border-b border-slate-300 pb-1.5 text-center bg-slate-100/60 rounded mb-2">
                                  📋 تفاصيل الأرقام والبيانات المسجلة
                                </p>
                                
                                <div className="space-y-2 mt-2">
                                  {/* Section: لائحة النظافة */}
                                  <div className="space-y-1">
                                    <p className="text-[9.5px] font-black text-teal-850 border-r-2 border-teal-500 pr-1.5 py-0.2 select-none bg-teal-50/30">
                                      ✨ لائحة النظافة العامة م354
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5 text-[9.5px] px-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-extrabold">مخالفات عامة:</span>
                                        <span className="font-mono font-black text-slate-950">{formData.hygieneLawPublic || formData.cleaningViolations || 0}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-extrabold">رفع السيارات:</span>
                                        <span className="font-mono font-black text-slate-950">{formData.hygieneLawCarRemoval || 0}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section: مخالفات البلدية */}
                                  <div className="space-y-1">
                                    <p className="text-[9.5px] font-black text-amber-850 border-r-2 border-amber-500 pr-1.5 py-0.2 select-none bg-amber-50/30">
                                      📝 مخالفات وقوانين البلدية
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5 text-[9.5px] px-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-extrabold">قانون ٣٠/٢٠٢١:</span>
                                        <span className="font-mono font-black text-slate-950">{formData.law30_2021 || 0}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-extrabold">مخالفات ٩/٨٧:</span>
                                        <span className="font-mono font-black text-slate-950">{formData.violations9_87 || 0}</span>
                                      </div>
                                      <div className="flex justify-between items-center col-span-2 border-t border-slate-200 pt-1">
                                        <span className="text-slate-600 font-extrabold">باعة متجولين:</span>
                                        <span className="font-mono font-black text-slate-950">{formData.streetVendors || 0}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section: الرقابة والإنذارات */}
                                  <div className="space-y-1">
                                    <p className="text-[9.5px] font-black text-yellow-850 border-r-2 border-yellow-500 pr-1.5 py-0.2 select-none bg-yellow-50/20">
                                      📌 العمليات الرقابية والإنذارات
                                    </p>
                                    <div className="grid grid-cols-3 gap-1.5 text-[9px] px-1.5">
                                      <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                        <span className="text-slate-500 block text-[7.5px] font-bold">الإنذارات</span>
                                        <span className="font-mono font-black text-slate-900 mt-0.5">{formData.warnings || 0}</span>
                                      </div>
                                      <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                        <span className="text-slate-500 block text-[7.5px] font-bold">التعهدات</span>
                                        <span className="font-mono font-black text-slate-900 mt-0.5">{formData.undertakings || 0}</span>
                                      </div>
                                      <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                        <span className="text-slate-500 block text-[7.5px] font-bold">ملصقات</span>
                                        <span className="font-mono font-black text-slate-900 mt-0.5">{formData.stickers || 0}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section: حجز السيارات المهملة */}
                                  <div className="space-y-1">
                                    <p className="text-[9.5px] font-black text-sky-850 border-r-2 border-sky-500 pr-1.5 py-0.2 select-none bg-sky-50/30">
                                      🚜 المركبات المهملة والسكراب
                                    </p>
                                    <div className="grid grid-cols-3 gap-1.5 text-[9px] px-1.5">
                                      <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                        <span className="text-slate-500 block text-[7.5px] font-bold">مهملة</span>
                                        <span className="font-mono font-black text-slate-900 mt-0.5">{formData.droppedCarsNeglected || 0}</span>
                                      </div>
                                      <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                        <span className="text-slate-500 block text-[7.5px] font-bold">سكراب</span>
                                        <span className="font-mono font-black text-slate-900 mt-0.5">{formData.droppedCarsScrap || 0}</span>
                                      </div>
                                      <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                        <span className="text-slate-500 block text-[7.5px] font-bold">للبيع</span>
                                        <span className="font-mono font-black text-slate-900 mt-0.5">{formData.droppedCarsForSale || 0}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section: الشكاوى وإشغالات الطرق */}
                                  <div className="space-y-1">
                                    <p className="text-[9.5px] font-black text-rose-850 border-r-2 border-rose-500 pr-1.5 py-0.2 select-none bg-rose-50/30">
                                      ⚠️ الشكاوى وإشغالات الطرق
                                    </p>
                                    <div className="grid grid-cols-2 gap-1.5 text-[10px] px-1.5">
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-extrabold">الشكاوى المنجزة:</span>
                                        <span className="font-mono font-black text-slate-950">{formData.completedComplaints || 0}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span className="text-slate-600 font-extrabold">إشغالات الطرق:</span>
                                        <span className="font-mono font-black text-slate-950">{formData.roadObstructions || 0}</span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Section: حركة آليات النقل */}
                                  <div className="space-y-1">
                                    <p className="text-[9.5px] font-black text-green-850 border-r-2 border-green-500 pr-1.5 py-0.2 select-none bg-green-50/30">
                                      🚛 حركة آليات النقل اليومية (الدروب)
                                    </p>
                                    <div className="grid grid-cols-4 gap-1 text-[8.5px] text-center font-bold">
                                      <div className="bg-white border border-slate-200 p-0.5 rounded">
                                        <p className="text-slate-500 text-[8px] font-bold">النفايات</p>
                                        <p className="font-mono font-black text-slate-950">{formData.tripsWaste || 0}</p>
                                      </div>
                                      <div className="bg-white border border-slate-200 p-0.5 rounded">
                                        <p className="text-slate-500 text-[8px] font-bold">كبير</p>
                                        <p className="font-mono font-black text-slate-950">{formData.tripsBigDumper || 0}</p>
                                      </div>
                                      <div className="bg-white border border-slate-200 p-0.5 rounded">
                                        <p className="text-slate-500 text-[8px] font-bold">صغير</p>
                                        <p className="font-mono font-black text-slate-950">{formData.tripsSmallDumper || 0}</p>
                                      </div>
                                      <div className="bg-white border border-slate-200 p-0.5 rounded">
                                        <p className="text-slate-500 text-[8px] font-bold">لوري</p>
                                        <p className="font-mono font-black text-slate-950">{formData.tripsLorry || 0}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Interactive Accept Statement and Signatures exactly per layout */}
                    <div className="text-center my-1.5 py-0.5">
                      <p className="text-[11px] font-black text-slate-900">وتقبلوا بقبول فائق الاحترام والتقدير ،،،</p>
                    </div>

                    <div className="pt-2 border-t border-slate-600">
                      {formData.reportType === 'weekly' ? (
                        <div className="grid grid-cols-3 gap-3 items-stretch text-[10px] font-bold text-slate-950">
                          {/* Right: مشرف النوبة */}
                          <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                            <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">مشرف النوبة</p>
                            <div className="space-y-1 text-[10px]">
                              <p className="flex justify-between items-center text-slate-800">
                                <span>الاسم:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التوقيع:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التاريخ:</span>
                                <span className="text-slate-500 font-mono font-bold text-[9px]">      /      /   2026</span>
                              </p>
                            </div>
                          </div>
                          
                          {/* Center: رئيس المركز */}
                          <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                            <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">رئيس المركز</p>
                            <div className="space-y-1 text-[10px]">
                              <p className="flex justify-between items-center text-slate-800">
                                <span>الاسم:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التوقيع:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التاريخ:</span>
                                <span className="text-slate-500 font-mono font-bold text-[9px]">      /      /   2026</span>
                              </p>
                            </div>
                          </div>

                          {/* Left: اعتماد رئيس قسم مراكز النظافة */}
                          <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                            <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">رئيس قسم مراكز النظافة</p>
                            <div className="space-y-1 text-[10px]">
                              <p className="flex justify-between items-center text-slate-800">
                                <span>الاسم:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التوقيع:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التاريخ:</span>
                                <span className="text-slate-500 font-mono font-bold text-[9px]">      /      /   2026</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4 items-stretch text-[10px] font-bold text-slate-950 max-w-[550px] mx-auto">
                          {/* Right: اعتماد رئيس المركز */}
                          <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                            <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">اعتماد رئيس المركز</p>
                            <div className="space-y-1 text-[10px]">
                              <p className="flex justify-between items-center text-slate-800">
                                <span>الاسم:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التوقيع:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التاريخ:</span>
                                <span className="text-slate-500 font-mono font-bold text-[9px]">      /      /   2026</span>
                              </p>
                            </div>
                          </div>

                          {/* Left: اعتماد رئيس قسم مراكز النظافة */}
                          <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                            <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">اعتماد رئيس قسم مراكز النظافة</p>
                            <div className="space-y-1 text-[10px]">
                              <p className="flex justify-between items-center text-slate-800">
                                <span>الاسم:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التوقيع:</span>
                                <span className="text-slate-400 font-mono text-[9px]">...........................................</span>
                              </p>
                              <p className="flex justify-between items-center text-slate-800">
                                <span>التاريخ:</span>
                                <span className="text-slate-500 font-mono font-bold text-[9px]">      /      /   2026</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Sheet Footer */}
                    <div className="text-center pt-2 border-t border-slate-900 text-[9px] text-slate-500 font-mono tracking-tight uppercase print:hidden">
                      بلدية الكويت &copy; 2026 - نظام الأرشفة والمتابعة الإلكتروني الموحد لمركز 139 والأرقام الميدانية والمصورة
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Statistics Archives Gallery render with neat list */}
          <div className="space-y-6 pt-6">
            <h3 className="text-xl font-black text-municipality-blue flex items-center gap-3 border-r-4 border-municipality-gold pr-4">
              <PlusCircle size={28} className="text-municipality-gold" />
              أرشيف التقارير الإحصائية الأسبوعية والشهرية (مبسط)
            </h3>

            {/* Custom Interactive SVG Graph Dashboard */}
            {(() => {
              const filteredForChart = stats.filter(s => (s.reportType || 'weekly') === chartTab);
              
              // Sum aggregate values from matching reports
              const aggHygiene = filteredForChart.reduce((sum, s) => sum + (s.hygieneLawPublic || s.cleaningViolations || 0), 0);
              const aggViolations987 = filteredForChart.reduce((sum, s) => sum + (s.violations9_87 || 0), 0);
              const aggComplaints = filteredForChart.reduce((sum, s) => sum + (s.completedComplaints || 0), 0);
              const aggRoadObstructions = filteredForChart.reduce((sum, s) => sum + (s.roadObstructions || 0), 0);
              const aggCars = filteredForChart.reduce((sum, s) => sum + (s.droppedCarsNeglected || 0) + (s.droppedCarsScrap || 0) + (s.droppedCarsForSale || 0) + (s.hygieneLawCarRemoval || 0), 0);
              const aggWarningsUndertakings = filteredForChart.reduce((sum, s) => sum + (s.warnings || 0) + (s.undertakings || 0) + (s.stickers || 0), 0);

              const isNoData = filteredForChart.length === 0;

              // Fallback realistic baseline indicators for beautiful presentation
              const hygieneVal = isNoData ? (chartTab === 'weekly' ? 145 : 580) : aggHygiene;
              const violations987Val = isNoData ? (chartTab === 'weekly' ? 92 : 368) : aggViolations987;
              const complaintsVal = isNoData ? (chartTab === 'weekly' ? 115 : 460) : aggComplaints;
              const roadVal = isNoData ? (chartTab === 'weekly' ? 74 : 296) : aggRoadObstructions;
              const carsVal = isNoData ? (chartTab === 'weekly' ? 55 : 220) : aggCars;
              const warningsVal = isNoData ? (chartTab === 'weekly' ? 180 : 720) : aggWarningsUndertakings;

              const totalInTab = hygieneVal + violations987Val + complaintsVal + roadVal + carsVal + warningsVal;
              const maxVal = Math.max(10, hygieneVal, violations987Val, complaintsVal, roadVal, carsVal, warningsVal) * 1.15;

              const chartCategories = [
                { name: 'قانون 354 (نظافة)', val: hygieneVal, gradientColors: ['#d97706', '#f59e0b'], textClass: 'text-amber-600 dark:text-amber-400', badgeBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-305' },
                { name: 'مخالفات بلدية 9-87', val: violations987Val, gradientColors: ['#0e2c4d', '#1e4b7b'], textClass: 'text-municipality-blue dark:text-slate-300', badgeBg: 'bg-blue-50 dark:bg-municipality-blue/30 text-municipality-blue dark:text-slate-200' },
                { name: 'الشكاوى منجزة كلياً', val: complaintsVal, gradientColors: ['#06b6d4', '#22d3ee'], textClass: 'text-cyan-600 dark:text-cyan-400', badgeBg: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-705 dark:text-cyan-305' },
                { name: 'مخالفات إشغالات الطرق', val: roadVal, gradientColors: ['#ef4444', '#f87171'], textClass: 'text-red-600 dark:text-red-400', badgeBg: 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-305' },
                { name: 'رفع المركبات والمهملات', val: carsVal, gradientColors: ['#8b5cf6', '#a78bfa'], textClass: 'text-purple-600 dark:text-purple-400', badgeBg: 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-305' },
                { name: 'إنذارات وتعهدات وملصقات', val: warningsVal, gradientColors: ['#10b981', '#34d399'], textClass: 'text-emerald-600 dark:text-emerald-400', badgeBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-704 dark:text-emerald-305' }
              ];

              return (
                <div id="stats-dashboard-visualizer" className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                  {/* Dashboard Header */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div>
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-municipality-gold animate-ping"></span>
                        التحليل الإحصائي والبياني التراكمي الميداني
                      </h4>
                      <p className="text-xs text-gray-400 font-bold mt-1">
                        {isNoData 
                          ? '💡 يعرض النظام أرقام المخطط النموذجي الاسترشادي (تنشط القيم الحقيقية تلقائياً بمجرد المزامنة والحفظ)' 
                          : `📈 يعرض الأرقام الحقيقية المجمعة لعدد (${filteredForChart.length}) سجلات إحصائية بنظام الأرشفة`
                        }
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Chart Tab Switcher (Weekly vs Monthly) */}
                      <div className="flex items-center gap-1.5 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setChartTab('weekly')}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                            chartTab === 'weekly'
                              ? 'bg-amber-550 bg-amber-500 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-100'
                          }`}
                        >
                          📊 إحصاء أسبوعي كلي
                        </button>
                        <button
                          type="button"
                          onClick={() => setChartTab('monthly')}
                          className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all ${
                            chartTab === 'monthly'
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-100'
                          }`}
                        >
                          📅 إحصاء شهري تراكمي
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SVG Chart Core Visualizer Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
                    {/* SVG canvas bar graph - Modern and colorful rendering */}
                    <div className="lg:col-span-3 bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-gray-150/40 dark:border-slate-800/60 relative">
                      <div className="absolute top-2 left-4 text-[9.5px] font-mono font-bold text-slate-400">
                        الحد الأقصى للمحور: {Math.round(maxVal)} معاملة
                      </div>

                      <div className="w-full h-64 flex items-end justify-between px-4 pt-8 pb-3 relative">
                        {/* Horizontal Gridlines behind columns */}
                        <div className="absolute inset-x-0 top-8 bottom-3 flex flex-col justify-between pointer-events-none select-none">
                          {[0, 1, 2, 3].map((g) => (
                            <div key={g} className="w-full border-t border-dashed border-gray-200 dark:border-slate-800" />
                          ))}
                        </div>

                        {/* Chart Bars loop */}
                        {chartCategories.map((cat, idx) => {
                          const percentageHeight = (cat.val / maxVal) * 100;
                          return (
                            <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end z-10 group relative px-1 sm:px-2">
                              {/* Hover tooltip widget */}
                              <div className="absolute bottom-full mb-1 bg-slate-900 border border-slate-700 text-white text-[10px] px-2 py-1 rounded-lg font-black opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 shadow-lg text-center z-20">
                                {cat.name}
                                <div className="font-mono text-[11px] text-municipality-gold mt-0.5">{cat.val} فئة</div>
                              </div>

                              {/* Value Label above bar */}
                              <span className="text-[10px] font-mono font-black text-slate-800 dark:text-slate-205 mb-1.5 animate-fade-in">
                                {cat.val}
                              </span>

                              {/* Physical Colored Column with gradient and hover glow */}
                              <div className="w-full max-w-[42px] relative rounded-t-lg overflow-hidden transition-all duration-500 hover:scale-x-105" style={{ height: `${Math.max(4, percentageHeight)}%` }}>
                                <div 
                                  className="w-full h-full rounded-t-md shadow-inner" 
                                  style={{
                                    background: `linear-gradient(to top, ${cat.gradientColors[0]}, ${cat.gradientColors[1]})`
                                  }}
                                />
                              </div>

                              {/* Micro Indicator Icon/Dot */}
                              <span className="w-2.5 h-2.5 rounded-full mt-2 border border-white dark:border-slate-900 shadow" style={{ backgroundColor: cat.gradientColors[0] }}></span>
                            </div>
                          );
                        })}
                      </div>

                      {/* X-Axis bottom labels column names */}
                      <div className="border-t border-gray-200 dark:border-slate-805 pt-2 flex justify-between px-2 text-[9px] sm:text-[10px] font-extrabold text-slate-500 dark:text-gray-400 text-center gap-1">
                        {chartCategories.map((cat, idx) => (
                          <div key={idx} className="flex-1 truncate leading-tight font-black" title={cat.name}>
                            {cat.name.replace(' (نظافة)', '').replace(' وتعهدات وملصقات', '')}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Numeric breakdown cards - beautifully colorful widgets */}
                    <div className="lg:col-span-1 space-y-3">
                      <div className="bg-indigo-50/20 dark:bg-indigo-950/10 p-4 rounded-xl border border-indigo-100/30 flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400">إجمالي المعاملات الإحصائية التراكمية</span>
                        <span className="text-3xl font-black text-indigo-700 dark:text-indigo-400 font-mono tracking-tight mt-1">{totalInTab}</span>
                        <span className="text-[9.5px] font-bold text-indigo-600 dark:text-indigo-300 mt-1">لإجراءات الكشف الدوري للمركز</span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-gray-200/50 dark:border-slate-800 text-xs font-bold divide-y divide-gray-150/40 dark:divide-slate-800 space-y-1.5">
                        <p className="pb-1.5 font-black text-[10.5px] text-slate-700 dark:text-gray-300">أعلى المؤشرات الميدانية بالدورة:</p>
                        
                        {chartCategories.slice(0, 4).map((cat, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5">
                            <span className="text-slate-500 text-[11px] truncate">{cat.name}</span>
                            <span className={`px-2 py-0.5 rounded font-mono font-extrabold ${cat.badgeBg}`}>{cat.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Premium compact grid gallery of saved statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
              {stats.map((s) => {
                const isMonthly = s.reportType === 'monthly';
                return (
                  <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-150 dark:border-slate-800 p-5 shadow flex flex-col justify-between space-y-4 hover:shadow-md transition-all">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="bg-slate-100 dark:bg-slate-200 text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded font-mono">#{s.id.slice(0, 8).toUpperCase()}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black ${isMonthly ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                          {isMonthly ? '📊 شهري' : '📋 أسبوعي'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm">{s.inspectorName}</h4>
                        <p className="text-[11px] text-gray-500 font-bold flex flex-wrap gap-1.5 items-center">
                          <span className="text-municipality-blue bg-blue-50 px-1.5 py-0.5 rounded">{s.centerName}</span>
                          {s.shift && <span className="text-slate-700 bg-slate-150 px-1.5 py-0.5 rounded">نوبة: {s.shift}</span>}
                          {s.fileNumber && <span className="text-slate-500 font-mono">ملف: {s.fileNumber}</span>}
                        </p>
                      </div>

                      <div className="text-[11px] text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/10 p-4 rounded-lg space-y-2.5">
                        <p className="font-bold flex justify-between">
                          <span>الفترة المعتمدة:</span> 
                          <span className="text-slate-950 dark:text-slate-100 font-extrabold">{s.date} إلى {s.dateTo || '---'}</span>
                        </p>
                        <p className="font-bold flex justify-between border-b border-gray-150/50 pb-2">
                          <span>إجمالي المعاملات بالدورة:</span>
                          <span className="text-gray-900 dark:text-gray-100 font-black text-sm">{getRowTotal(s)}</span>
                        </p>

                        <div className="space-y-2 pt-1">
                          {/* Item 1: 354 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-amber-600 dark:text-amber-400">قانون 354 (نظافة عامة)</span>
                              <span className="font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded-md font-black">{s.hygieneLawPublic || s.cleaningViolations || 0}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-l from-amber-600 to-amber-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, ((s.hygieneLawPublic || s.cleaningViolations || 0) * 10))}%` }} />
                            </div>
                          </div>

                          {/* Item 2: 9-87 */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-municipality-blue dark:text-slate-300">مخالفات بلدية 9-87</span>
                              <span className="font-mono bg-blue-50 dark:bg-municipality-blue/20 text-municipality-blue dark:text-slate-205 px-1.5 py-0.2 rounded-md font-black">{s.violations9_87 || 0}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-l from-municipality-blue to-[#1e4b7b] rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (s.violations9_87 * 10))}%` }} />
                            </div>
                          </div>

                          {/* Item 3: complaints */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-cyan-600 dark:text-cyan-400">الشكاوى الخارجية المنجزة</span>
                              <span className="font-mono bg-cyan-50 dark:bg-cyan-950/40 text-cyan-705 dark:text-cyan-300 px-1.5 py-0.2 rounded-md font-black">{s.completedComplaints || 0}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-l from-cyan-600 to-cyan-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (s.completedComplaints * 10))}%` }} />
                            </div>
                          </div>

                          {/* Item 4: roadObstructions */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] font-bold">
                              <span className="text-red-600 dark:text-red-400">مخالفات إشغالات الطرق</span>
                              <span className="font-mono bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-1.5 py-0.2 rounded-md font-black">{s.roadObstructions || 0}</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-l from-red-600 to-red-400 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, (s.roadObstructions * 10))}%` }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs">
                      {/* Active load function to preview inside single live screen */}
                      <button 
                        onClick={() => {
                          setFormData(s);
                          setActiveStatsPreviewModal(true);
                        }}
                        className="text-white bg-municipality-blue/90 hover:bg-municipality-blue flex items-center gap-1.5 px-3 py-2 rounded-xl font-black shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer text-[11px]"
                      >
                        <Eye size={16} />
                        عرض المعاينة 🔍
                      </button>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleExportArchivedStats(s)}
                          title="تنزيل كصورة عالية الدقة"
                          className="text-white bg-amber-600 hover:bg-amber-700 p-2.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-amber-500/10"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handlePrintArchivedStats(s)}
                          title="طباعة"
                          className="text-white bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 p-2.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-indigo-500/10"
                        >
                          <Printer size={18} />
                        </button>
                        {deletingStatId === s.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/25 px-2 py-1 rounded-lg border border-red-200 dark:border-red-900/40">
                            <span className="text-[10px] font-black text-red-600 dark:text-red-400">حذف؟</span>
                            <button 
                              onClick={() => {
                                onDelete(s.id);
                                setDeletingStatId(null);
                              }}
                              className="px-2 py-1 bg-red-650 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-black cursor-pointer align-middle"
                            >
                              نعم
                            </button>
                            <button 
                              onClick={() => setDeletingStatId(null)}
                              className="px-2 py-1 bg-gray-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded text-[10px] font-black cursor-pointer align-middle"
                            >
                              لا
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeletingStatId(s.id)}
                            title="حذف"
                            className="text-red-600 bg-red-55 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-900/50 p-2.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {stats.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-100 dark:border-slate-800 text-gray-300 font-bold italic">
                لا توجد تقارير إحصائية مؤرشفة حالياً.. السجلات المعتمدة ستظهر هنا
              </div>
            )}
          </div>
        </>
      )}

      {subTab === 'field_report' && (
        <>
          {/* Field Inspection Report Form & real-time A4 Preview side-by-side on large screens, or stacked */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            {/* Form Column */}
            <div className="xl:col-span-5 bg-white rounded-3xl border border-gray-100 p-6 shadow-md space-y-6 print:hidden">
              <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                <h3 className="text-lg font-black text-municipality-blue flex items-center gap-2">
                  <FileSignature size={22} className="text-municipality-gold" />
                  تعبئة الكشف الميداني الجديد
                </h3>
                <button 
                  onClick={resetFieldForm}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw size={14} /> تصفير
                </button>
              </div>

              <form onSubmit={handleFieldSubmit} className="space-y-4">
                {/* Date and Day */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <Calendar size={12} /> تاريخ الإجراء
                    </label>
                    <input 
                      type="date"
                      className="municipal-input focus:ring-municipality-gold"
                      value={fieldForm.date}
                      onChange={e => {
                        const d = e.target.value;
                        setFieldForm({ ...fieldForm, date: d, dayOfWeek: getDayOfWeekArabic(d) });
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1">اليوم</label>
                    <input 
                      type="text"
                      className="municipal-input focus:ring-municipality-gold bg-slate-50 font-bold text-slate-800 text-center"
                      value={fieldForm.dayOfWeek || ''}
                      readOnly
                    />
                  </div>
                </div>

                {/* Seizure/Verification Number */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">رقم الضبطية القضائية</label>
                    <input 
                      type="text"
                      className="municipal-input focus:ring-municipality-gold"
                      placeholder="رقم الضبطية القضائية"
                      value={fieldForm.seizureNumber}
                      onChange={e => setFieldForm({ ...fieldForm, seizureNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 flex items-center gap-1">
                      <User size={12} /> اسم المفتش
                    </label>
                    <AestheticSelect
                      value={fieldForm.inspectorName}
                      onChange={val => setFieldForm({ ...fieldForm, inspectorName: val, employeeName: val })}
                      options={settings.inspectors.map(ins => ins.name)}
                      placeholder="اختر المفتش..."
                      colorTheme="amber"
                      iconType="user"
                    />
                    {settings.inspectors.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 p-1 bg-white/5 bg-slate-50/50 rounded-xl border border-amber-300/10">
                        {settings.inspectors.map(i => {
                          const isSelected = fieldForm.inspectorName === i.name;
                          return (
                            <button
                              key={i.id}
                              type="button"
                              onClick={() => setFieldForm({ ...fieldForm, inspectorName: i.name, employeeName: i.name })}
                              className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black transition-all flex items-center gap-1 border ${
                                isSelected 
                                  ? 'bg-amber-500 text-white border-amber-500 shadow-sm' 
                                  : 'bg-white dark:bg-slate-800 text-slate-705 dark:text-slate-200 hover:bg-amber-50/55 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                              {i.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Phone and Administration Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">رقم هاتف المفتش</label>
                    <input 
                      type="tel"
                      className="municipal-input focus:ring-municipality-gold"
                      placeholder="رقم الموبايل"
                      value={fieldForm.phoneNumber}
                      onChange={e => setFieldForm({ ...fieldForm, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 font-bold">المركز التابع له</label>
                    <AestheticSelect
                      value={fieldForm.centerName}
                      onChange={val => setFieldForm({ ...fieldForm, centerName: val })}
                      options={settings.centers.map(ctr => ctr.name)}
                      placeholder="اختر المركز..."
                      colorTheme="blue"
                      iconType="map"
                    />
                    {settings.centers.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1.5 p-1 bg-white/5 bg-slate-50/50 rounded-xl border border-municipality-blue/20 font-bold">
                        {settings.centers.map(c => {
                          const isSelected = fieldForm.centerName === c.name;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => setFieldForm({ ...fieldForm, centerName: c.name })}
                              className={`px-2 py-0.5 rounded-lg text-[9.5px] font-black transition-all flex items-center gap-1.5 border ${
                                isSelected 
                                  ? 'bg-municipality-blue text-white border-municipality-blue shadow-sm' 
                                  : 'bg-white dark:bg-slate-800 text-slate-705 dark:text-slate-200 hover:bg-municipality-blue/10 border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-municipality-blue shrink-0"></span>
                              {c.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Additional Metadata fields (to align with paper) */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">المسمى الوظيفي للموظف</label>
                    <input 
                      type="text"
                      className="municipal-input focus:ring-municipality-gold"
                      value={fieldForm.jobTitle || ''}
                      onChange={e => setFieldForm({ ...fieldForm, jobTitle: e.target.value })}
                      placeholder="مفتش نظافة أو مساعد"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400">نوبة العمل (Shift)</label>
                    <input 
                      type="text"
                      className="municipal-input focus:ring-municipality-gold"
                      value={fieldForm.shift || ''}
                      onChange={e => setFieldForm({ ...fieldForm, shift: e.target.value })}
                      placeholder="نوبة أ / ب / ج / صباحية"
                    />
                  </div>
                </div>

                {/* Route Path and departure/arrival times */}
                <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-gray-200 dark:border-slate-800 space-y-3">
                  <p className="text-xs font-black text-slate-850 dark:text-gray-300 border-r-2 border-municipality-gold pr-2">خط السير المعتمد (الجولة الميدانية)</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">وقت الخروج الميداني</label>
                      <input 
                        type="time"
                        className="municipal-input focus:ring-municipality-gold bg-white text-slate-900 border-gray-200"
                        value={fieldForm.exitTime}
                        onChange={e => setFieldForm({ ...fieldForm, exitTime: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400">وقت العودة الميدانية</label>
                      <input 
                        type="time"
                        className="municipal-input focus:ring-municipality-gold bg-white text-slate-900 border-gray-200"
                        value={fieldForm.returnTime}
                        onChange={e => setFieldForm({ ...fieldForm, returnTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">المنطقة</label>
                      <input 
                        type="text"
                        className="municipal-input focus:ring-municipality-gold bg-white text-slate-900 border-gray-200"
                        placeholder="المنطقة"
                        value={fieldForm.area}
                        onChange={e => setFieldForm({ ...fieldForm, area: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-440">قطعة</label>
                      <input 
                        type="text"
                        className="municipal-input focus:ring-municipality-gold bg-white text-slate-900 border-gray-200"
                        placeholder="قطعة"
                        value={fieldForm.block}
                        onChange={e => setFieldForm({ ...fieldForm, block: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 dark:text-gray-400">الشارع</label>
                      <input 
                        type="text"
                        className="municipal-input focus:ring-municipality-gold bg-white text-slate-900 border-gray-200"
                        placeholder="شارع"
                        value={fieldForm.street}
                        onChange={e => setFieldForm({ ...fieldForm, street: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Supervisor Approvals parameters (Customized and detailed so people see credentials) */}
                <div className="bg-amber-50/30 p-4 rounded-xl border border-amber-100 space-y-2.5">
                  <p className="text-[11px] font-black text-amber-800 border-r-2 border-amber-500 pr-2">اعتمادات المسؤولين الرسمية للتقرير</p>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">مشرف النوبة / معتمد المركز</label>
                    <input 
                      type="text"
                      className="municipal-input bg-white text-xs font-bold"
                      value={fieldForm.supervisorName}
                      onChange={e => setFieldForm({ ...fieldForm, supervisorName: e.target.value })}
                      placeholder="رئيس المركز المباشر"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">رئيس القسم المعتمد</label>
                    <input 
                      type="text"
                      className="municipal-input bg-white text-xs"
                      value={fieldForm.sectionHeadName || ''}
                      onChange={e => setFieldForm({ ...fieldForm, sectionHeadName: e.target.value })}
                      placeholder="رئيس قسم مراكز النظافة"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">المراقب المسؤول</label>
                      <input 
                        type="text"
                        className="municipal-input bg-white text-xs"
                        value={fieldForm.controllerName || ''}
                        onChange={e => setFieldForm({ ...fieldForm, controllerName: e.target.value })}
                        placeholder="المراقب الميداني"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">مدير الإدارة</label>
                      <input 
                        type="text"
                        className="municipal-input bg-white text-xs"
                        value={fieldForm.directorName || ''}
                        onChange={e => setFieldForm({ ...fieldForm, directorName: e.target.value })}
                        placeholder="مدير إدارة النظافة العامة"
                      />
                    </div>
                  </div>
                </div>

                {/* Text Notes Area */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-400">الملاحظات والمشاهدات الميدانية (تقرير المفتش)</label>
                  <textarea 
                    rows={4}
                    className="municipal-input focus:ring-municipality-gold text-right"
                    placeholder="دوّن تفاصيل المشاهدات والمحاضر هنا..."
                    value={fieldForm.notes}
                    onChange={e => setFieldForm({ ...fieldForm, notes: e.target.value })}
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full municipal-button-primary bg-municipality-blue hover:bg-municipality-gold text-white font-black py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <Save size={18} />
                  اعتماد وحفظ الكشف الميداني
                </button>
              </form>
            </div>

            {/* A4 Preview Column */}
            <div className="xl:col-span-7 space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm print:hidden">
                <span className="text-sm font-black text-municipality-blue flex items-center gap-2">
                  <AlertCircle size={18} className="text-municipality-gold" />
                  المعاينة المباشرة لورقة A4 (نموذج محضر كشف رسمي)
                </span>
                <div className="flex flex-wrap gap-2">
                  <button 
                    onClick={() => exportFieldAsImage('preview', fieldForm.inspectorName)}
                    className="flex items-center gap-1.5 bg-municipality-gold hover:bg-amber-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow transition-all active:scale-95"
                  >
                    <Download size={14} /> حفظ كصورة (PNG)
                  </button>
                  <button 
                    onClick={() => handlePrintClick('field', fieldForm.id || 'preview')}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow transition-all active:scale-95 cursor-pointer"
                  >
                    <Printer size={14} /> طباعة ورقة A4
                  </button>
                </div>
              </div>

              {/* Quick External Fields Customizer for Field Report (hidden in print) */}
              <div className="bg-white border border-gray-200 dark:border-slate-850 p-5 rounded-2xl space-y-4 shadow-sm print:hidden">
                <div className="flex items-center gap-2 border-b border-gray-150 dark:border-slate-800 pb-2.5">
                  <Calendar size={18} className="text-municipality-gold shrink-0" />
                  <h4 className="text-sm font-black text-municipality-blue dark:text-gray-100">لوحة تعبئة وتغيير التاريخ والبيانات المعتمدة للمعاينة</h4>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 dark:text-gray-400 block">تاريخ الإجراء الكشفي:</label>
                    <input 
                      type="date"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:border-municipality-gold focus:ring-1 focus:ring-municipality-gold outline-none transition-all"
                      value={fieldForm.date}
                      onChange={e => {
                        const d = e.target.value;
                        setFieldForm({ ...fieldForm, date: d, dayOfWeek: getDayOfWeekArabic(d) });
                      }}
                    />
                  </div>

                  {/* Day (Readonly, auto-calculated) */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 dark:text-gray-400 block">اليوم:</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2.5 bg-slate-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-400 outline-none cursor-not-allowed"
                      value={fieldForm.dayOfWeek || ''}
                      readOnly
                    />
                  </div>

                  {/* Seizure Number */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 dark:text-gray-400 block">رقم الضبطية القضائية:</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-800 dark:text-white focus:border-municipality-gold focus:ring-1 focus:ring-municipality-gold outline-none transition-all"
                      value={fieldForm.seizureNumber || ''}
                      placeholder="امسح واكتب رقم الضبطية القضائية..."
                      onChange={e => setFieldForm({ ...fieldForm, seizureNumber: e.target.value })}
                    />
                  </div>

                  {/* Inspector Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 dark:text-gray-400 block">المفتش/الموظف:</label>
                    <AestheticSelect 
                      value={fieldForm.inspectorName || ''}
                      options={settings.inspectors.map(ins => ins.name)}
                      placeholder="اختر المفتش..."
                      onChange={val => {
                        setFieldForm({ ...fieldForm, inspectorName: val, employeeName: val });
                      }}
                    />
                  </div>

                  {/* Center Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 dark:text-gray-400 block">مركز النظافة وإشغالات الطرق:</label>
                    <AestheticSelect 
                      value={fieldForm.centerName || ''}
                      options={settings.centers.map(ctr => ctr.name)}
                      placeholder="اختر المركز..."
                      onChange={val => {
                        setFieldForm({ ...fieldForm, centerName: val });
                      }}
                    />
                  </div>

                  {/* Shift */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-black text-slate-500 dark:text-gray-400 block">نوبة العمل:</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2.5 bg-gray-50 dark:bg-slate-850 border border-gray-200 dark:border-slate-800 rounded-lg text-xs font-black text-slate-850 dark:text-white focus:border-municipality-gold outline-none transition-all"
                      value={fieldForm.shift || ''}
                      placeholder="أ / ب / ج / صباحي"
                      onChange={e => setFieldForm({ ...fieldForm, shift: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Physical A4 Sheet Simulation Container with high-fidelity scaling */}
              <div 
                ref={fieldContainerRef}
                className="w-full overflow-hidden flex justify-center items-start bg-slate-50/50 dark:bg-slate-950/20 p-2 sm:p-4 rounded-3xl border border-gray-200/50 dark:border-slate-800"
                style={{ height: fieldPreviewHeight ? `${fieldPreviewHeight + 16}px` : 'auto' }}
              >
                <div 
                  ref={fieldPreviewRef}
                  id="field-report-canvas-preview"
                  className="w-[820px] bg-white text-slate-900 border border-gray-300 p-6 shadow-2xl relative select-none origin-top transition-transform duration-200 official-a4-canvas" 
                  style={{ 
                    direction: 'rtl',
                    transform: `scale(${fieldPreviewScale})`,
                  }}
                >
                  {/* Outer double border matching the official printed templates */}
                  <div className="border-4 border-double border-slate-900 p-6 flex flex-col justify-between" style={{ minHeight: '1120px' }}>
                    
                    {/* Header Details */}
                    <div className="grid grid-cols-3 gap-4 items-start border-b-2 border-slate-900 pb-4">
                      {/* Department text on right */}
                      <div className="text-right space-y-1 text-slate-955 font-bold text-[11px] leading-5">
                        <p className="text-xs font-black text-black">إدارة النظافة العامة وإشغالات الطرق</p>
                        <p>مراقبة النظافة العامة - محافظة العاصمة</p>
                        <p>قسم مراكز النظافة - مركز ({fieldForm.centerName || '_________'})</p>
                        <p>النوبة الميدانية: ({fieldForm.shift || '_________'})</p>
                      </div>

                      {/* Mascot logo - beautifully filling the rectangular area */}
                      <div className="text-center flex flex-col items-center justify-center space-y-1">
                        <div className="w-28 h-16 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-slate-900 overflow-hidden p-0 shadow-sm">
                          <img src={LOGO_BASE64} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="شعار بلدية الكويت" />
                        </div>
                        <p className="font-extrabold text-[10px] text-slate-955 uppercase">بلدية الكويت</p>
                      </div>

                      {/* Report ID and dates on left */}
                      <div className="text-left font-mono text-[10px] space-y-1 text-slate-955 font-bold leading-5">
                        <p className="font-black text-xs text-slate-900 text-right">دولة الكويت</p>
                        <p className="text-right text-[11px]">نموذج الكشف الميداني للمناطق</p>
                        <p>التاريخ المعتمد: {fieldForm.date}</p>
                        <p>اليوم: {fieldForm.dayOfWeek}</p>
                        <p className="text-sky-900 font-extrabold flex-row">رقم الضبطية القضائية: {fieldForm.seizureNumber || '-----------------'}</p>
                      </div>
                    </div>

                    {/* Central Title */}
                    <div className="text-center my-4 font-black">
                      <p className="font-extrabold text-[15px] border-y-2 border-slate-900 py-1 inline-block px-14 text-slate-950 uppercase">
                        تـقرير كشـف وجـولة ميدانـية دوريـة
                      </p>
                    </div>

                    {/* Inspector and general info details structured in 4 columns grid */}
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold text-slate-950">
                      <div className="border border-slate-800 p-3 rounded-lg space-y-1.5 bg-slate-50/50">
                        <p className="text-slate-500 font-bold border-b border-slate-300 pb-1 flex items-center gap-1 font-black">
                          بيانات المفتش المسؤول
                        </p>
                        <p className="font-black text-slate-900 text-sm">الاسم: {fieldForm.inspectorName || ''}</p>
                        <p className="font-bold text-slate-700">المسمى الوظيفي: {fieldForm.jobTitle || 'مفتش نظافة'}</p>
                        <p className="font-bold text-slate-700">المركز: {fieldForm.centerName || ''} | النوبة: {fieldForm.shift || ''}</p>
                        <p className="font-bold text-slate-700">رقم الهاتف: {fieldForm.phoneNumber || ''}</p>
                      </div>

                      <div className="border border-slate-800 p-3 rounded-lg space-y-1.5 bg-slate-50/50">
                        <p className="text-slate-500 font-bold border-b border-slate-300 pb-1 flex items-center gap-1 font-black">
                          الجولات والقطاع الجغرافي
                        </p>
                        <p className="font-bold text-slate-900">خط سير الجولة الميدانية كالتالي:</p>
                        <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-800">
                          <p>وقت الخروج: {fieldForm.exitTime || '--:--'}</p>
                          <p>وقت العودة: {fieldForm.returnTime || '--:--'}</p>
                        </div>
                        <p className="font-black text-slate-800 text-[11px]">
                          المنطقة: {fieldForm.area || ''} | قطعة: {fieldForm.block || ''} | شارع: {fieldForm.street || ''}
                        </p>
                      </div>
                    </div>

                    {/* Lined ruled notebook area for report notes */}
                    <div className="my-4 space-y-2">
                      <p className="text-xs font-black text-slate-800 flex items-center gap-1 border-r-4 border-slate-800 pr-2 font-black">
                        المشاهدات الميدانية وتقرير الموظف
                      </p>
                      
                      {/* Notebook mockup lines — Single unified block to guarantee text stays on top of lines */}
                      <div 
                        className="ruled-lines-canvas border border-slate-800 px-4 pb-4 bg-white min-h-[220px]"
                        style={{
                          backgroundImage: 'linear-gradient(rgba(0,0,0,0) 0%, rgba(0,0,0,0) 96%, #e2e8f0 96%, #e2e8f0 100%)',
                          backgroundSize: '100% 32px',
                          lineHeight: '32px',
                          paddingTop: '1px'
                        }}
                      >
                        <div className="font-mono text-sm tracking-wide text-slate-900 whitespace-pre-wrap break-words text-right font-bold" style={{ lineHeight: '32px' }}>
                          {fieldForm.notes || (
                            <span className="text-slate-300 italic font-bold">لم تُسجل أي ملاحظات كتابية إضافية - الجولة الميدانية اعتيادية ولم ترصد مخالفات تستوجب تدوين إضافي.</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Highly descriptive signatures block */}
                    <div className="space-y-6 pt-6 border-t border-slate-300">
                      {/* Row 1: Employee and Immediate Supervisor */}
                      <div className="grid grid-cols-2 gap-8 text-right">
                        {/* Employee signature space */}
                        <div className="border border-slate-800 p-3 rounded-lg text-xs space-y-2 bg-slate-50/10 font-bold text-slate-950">
                          <p className="font-black text-center text-slate-900 border-b border-slate-300 pb-1 bg-slate-50/50">توقيع المفتش</p>
                          <p className="font-bold text-slate-800 break-words whitespace-normal font-bold">الاسم المفتش: {fieldForm.employeeName || fieldForm.inspectorName || ' '}</p>
                          <div className="h-2"></div>
                          <p className="font-bold text-slate-705 text-slate-700">التاريخ:</p>
                          <div className="h-2"></div>
                          <p className="font-bold text-slate-705 text-slate-700">التوقيع:</p>
                        </div>

                        {/* Supervisor signature space */}
                        <div className="border border-slate-800 p-3 rounded-lg text-xs space-y-2 bg-slate-50/10 font-bold text-slate-950">
                          <p className="font-black text-center text-slate-900 border-b border-slate-300 pb-1 bg-slate-50/50">اعتماد رئيس المركز</p>
                          <p className="font-bold text-slate-800 break-words whitespace-normal">الاسم: {fieldForm.supervisorName || ' '}</p>
                          <div className="h-2"></div>
                          <p className="font-bold text-slate-700">التاريخ:</p>
                          <div className="h-2"></div>
                          <p className="font-bold text-slate-700">التوقيع:</p>
                        </div>
                      </div>

                      {/* Row 2: Secondary authorizations in a neat 3 columns horizontal row */}
                      <div className="grid grid-cols-3 gap-4 text-right">
                        {/* Section Head */}
                        <div className="border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1 bg-slate-50/50 font-bold text-slate-950">
                          <p className="font-black text-slate-900 border-b border-slate-300 pb-1 text-center font-black">اعتماد رئيس القسم</p>
                          <p className="text-slate-800 font-bold break-words whitespace-normal">الاسم: {fieldForm.sectionHeadName || ' '}</p>
                          <div className="h-1"></div>
                          <p className="font-bold text-slate-700">التاريخ:</p>
                          <div className="h-1"></div>
                          <p className="font-bold text-slate-700">التوقيع:</p>
                        </div>

                        {/* Controller */}
                        <div className="border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1 bg-slate-50/50 font-bold text-slate-950">
                          <p className="font-black text-slate-900 border-b border-slate-300 pb-1 text-center font-bold font-black">اعتماد المراقب</p>
                          <p className="text-slate-800 font-bold break-words whitespace-normal font-sans">الاسم: {fieldForm.controllerName || ' '}</p>
                          <div className="h-1"></div>
                          <p className="font-bold text-slate-700">التاريخ:</p>
                          <div className="h-1"></div>
                          <p className="font-bold text-slate-700">التوقيع:</p>
                        </div>

                        {/* Director */}
                        <div className="border border-slate-800 p-2.5 rounded-lg text-[11px] space-y-1 bg-slate-50/50 font-bold text-slate-950">
                          <p className="font-black text-slate-900 border-b border-slate-300 pb-1 text-center font-bold font-black">اعتماد مدير الإدارة</p>
                          <p className="text-slate-800 font-bold break-words whitespace-normal font-sans">الاسم: {fieldForm.directorName || ' '}</p>
                          <div className="h-1"></div>
                          <p className="font-bold text-slate-700">التاريخ:</p>
                          <div className="h-1"></div>
                          <p className="font-bold text-slate-700">التوقيع:</p>
                        </div>
                      </div>
                    </div>

                    {/* Official footer terms of kashf */}
                    <div className="text-center pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-mono tracking-tight uppercase print:hidden">
                      بلدية الكويت &copy; 2026 - نظام الأرشفة والمتابعة الإلكتروني الموحد لمركز 139 والطوارئ الميدانية
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Archived Field Inspection Reports (التقارير الميدانية المؤرشفة) */}
          <div className="space-y-6 pt-10">
            <h3 className="text-xl font-black text-municipality-blue flex items-center gap-3 border-r-4 border-municipality-gold pr-4">
              <PlusCircle size={28} className="text-municipality-gold" />
              أرشيف سجل الكشوف الميدانية المعتمدة (قائمة مبسطة)
            </h3>

            {/* Compact elegant grid list - avoiding giant papers in rendering */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
              {fieldReports.map((report) => (
                <div key={report.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6 shadow hover:shadow-md transition-all flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-gray-400 font-mono">ID: #{report.id.slice(0, 8).toUpperCase()}</span>
                      <span className="bg-sky-50 text-sky-800 px-3 py-1 rounded-full text-[10px] font-black">{report.date} {report.dayOfWeek ? `(${report.dayOfWeek})` : ''}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-black text-slate-900 dark:text-slate-100 text-base">{report.inspectorName}</h4>
                      <p className="text-xs text-gray-500 font-bold flex flex-wrap gap-2 items-center">
                        <span className="text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{report.jobTitle || 'مفتش نظافة'}</span>
                        <span className="text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-sans font-bold">نوبة: {report.shift || 'صباحي'}</span>
                        <span className="text-municipality-blue bg-blue-50 px-2 py-0.5 rounded">{report.centerName}</span>
                      </p>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/40 p-2.5 rounded-lg space-y-1">
                      <p className="font-bold flex justify-between">
                        <span>المنطقة الجغرافية:</span> 
                        <span className="text-slate-950 dark:text-slate-100 font-black">{report.area || '-'} / قطاع: {report.block || '-'} / ش: {report.street || '-'}</span>
                      </p>
                      <p className="font-bold flex justify-between">
                        <span>وقت الجولة:</span>
                        <span className="text-slate-950 dark:text-slate-100 font-black">من {report.exitTime || '--'} إلى {report.returnTime || '--'}</span>
                      </p>
                      {report.notes && (
                        <p className="text-[11px] text-gray-500 dark:text-gray-300 line-clamp-1 border-t border-gray-150 pt-1.5 mt-1">
                          <span className="font-bold">ملاحظة:</span> {report.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5 text-xs">
                    {/* Active load function to preview inside single live screen */}
                    <button 
                      onClick={() => {
                        setFieldForm(report);
                        window.scrollTo({ top: 350, behavior: 'smooth' });
                      }}
                      className="text-white bg-municipality-blue/90 hover:bg-municipality-blue flex items-center gap-1.5 px-3 py-2 rounded-xl font-black shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer text-[11px]"
                    >
                      <Eye size={16} />
                      عرض في المعاينة 🔍
                    </button>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleExportArchivedField(report)}
                        title="حفظ كصورة PNG عالية الجودة"
                        className="text-white bg-amber-600 hover:bg-amber-700 p-2.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-amber-500/10"
                      >
                        <Download size={18} />
                      </button>
                      <button 
                        onClick={() => handlePrintArchivedField(report)}
                        title="طباعة ورقة A4"
                        className="text-white bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 p-2.5 rounded-xl transition-all shadow-sm hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center border border-indigo-500/10"
                      >
                        <Printer size={18} />
                      </button>
                      {onDeleteFieldReport && (
                        deletingFieldReportId === report.id ? (
                          <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/25 px-2 py-1 rounded-lg border border-red-200 dark:border-red-900/40">
                            <span className="text-[10px] font-black text-red-600 dark:text-red-400">حذف؟</span>
                            <button 
                              onClick={() => {
                                onDeleteFieldReport(report.id);
                                setDeletingFieldReportId(null);
                              }}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-black cursor-pointer align-middle"
                            >
                              نعم
                            </button>
                            <button 
                              onClick={() => setDeletingFieldReportId(null)}
                              className="px-2 py-1 bg-gray-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded text-[10px] font-black cursor-pointer align-middle"
                            >
                              لا
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setDeletingFieldReportId(report.id)}
                            title="حذف نهائي"
                            className="text-red-400 hover:bg-red-50 hover:text-red-300 border border-transparent p-2 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {fieldReports.length === 0 && (
              <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-gray-100 dark:border-slate-800 text-gray-300 font-bold italic">
                لا توجد كشوف ميدانية مؤرشفة حالياً.. السجلات المعتمدة ستظهر هنا
              </div>
            )}
          </div>
        </>
      )}

      {/* Print Help dialog for Iframe sandbox compatibility */}
      <AnimatePresence>
        {printIframeModal.show && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
              onClick={() => setPrintIframeModal(prev => ({ ...prev, show: false }))}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-150 dark:border-slate-800 p-6 space-y-4 text-right"
              style={{ direction: 'rtl' }}
            >
              <div className="flex items-center gap-3 text-municipality-blue dark:text-municipality-gold border-b border-gray-100 dark:border-slate-800 pb-3">
                <Printer size={22} className="shrink-0 text-amber-500" />
                <h3 className="font-black text-base text-slate-900 dark:text-white">إرشاد هام للمعاينة والطباعة المباشرة 🖨️</h3>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-bold">
                <p>
                  نظراً لأن التطبيق يتم تشغيله حالياً داخل <span className="text-amber-600 dark:text-amber-400 font-black">إطار معاينة آمن فرعي (iFrame)</span> في المنصة، تمنع بعض المتصفحات تشغيل أمر الطباعة المباشرة لحماية الأمان.
                </p>
                <p className="bg-amber-500/10 dark:bg-amber-500/5 text-amber-800 dark:text-amber-400 p-3 rounded-lg border border-amber-200/50">
                  للطباعة والحفظ بجودة A4 الكاملة دون أي قيود، قمنا بتوفير <span className="font-black font-sans">رابط مباشر</span> فوري، سيقوم بنقلك وتفعيل أمر الطباعة تلقائياً بضغطة واحدة!
                </p>
                <p className="text-[11px] text-gray-400">
                  * سيتم مزامنة أي بيانات قمت بتعديلها أو حفظها تلقائياً بفضل نظام التخزين المحلي المشترك.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('autoPrintType', printIframeModal.type);
                    url.searchParams.set('autoPrintId', printIframeModal.id);
                    window.open(url.toString(), '_blank');
                    setPrintIframeModal(prev => ({ ...prev, show: false }));
                  }}
                  className="flex-1 bg-municipality-blue hover:bg-slate-800 text-white font-black py-3 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Printer size={16} />
                  فتح في علامة تبويب جديدة وبدء الطباعة فوراً ↗️
                </button>
                <button
                  type="button"
                  onClick={() => setPrintIframeModal(prev => ({ ...prev, show: false }))}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-gray-300 rounded-xl transition-all font-black text-xs cursor-pointer"
                >
                  إغلاق فهمت
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Statistics Detailed Official Preview Modal */}
      <AnimatePresence>
        {activeStatsPreviewModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
              onClick={() => setActiveStatsPreviewModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh] border border-gray-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#0e2c4d] via-[#163f69] to-[#1f4c7d] text-white border-b-4 border-municipality-gold">
                <div className="flex items-center gap-4">
                  <div className="bg-[#123354] text-municipality-gold px-3 py-1 rounded-lg font-black text-xs border border-municipality-gold/20">A4 PREVIEW</div>
                  <span className="font-black text-lg">معاينة وإصدار الإحصائية الرسمية</span>
                </div>
                <button onClick={() => setActiveStatsPreviewModal(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto beautiful-scrollbar overflow-x-hidden bg-gray-50 dark:bg-slate-950 p-4 pb-12 flex flex-col items-center">
                <div 
                  className="w-full max-w-4xl flex justify-center items-start overflow-y-auto overflow-x-auto max-h-[65vh] sm:max-h-[72vh] beautiful-scrollbar p-3 bg-gray-100/40 dark:bg-slate-900/20 rounded-2xl border border-gray-200/50 dark:border-slate-800"
                >
                  <div 
                    className="w-[820px] bg-white text-slate-900 border border-gray-300 p-8 shadow-2xl relative select-none official-a4-canvas"
                    style={{ minHeight: '1120px', direction: 'rtl' }}
                  >
                    {/* Outer double border matching the official printed templates */}
                    <div className="border-4 border-double border-slate-900 p-6 flex flex-col justify-between" style={{ minHeight: '1060px' }}>
                      
                      {/* Header Details */}
                      <div className="grid grid-cols-3 gap-2 items-start border-b-2 border-slate-900 pb-4">
                        {/* Department text on right */}
                        <div className="text-right space-y-1 text-slate-950 font-bold text-[11px] leading-5">
                          <p className="text-sm font-extrabold text-black">بلدية الكويت</p>
                          <p>إدارة النظافة العامة وإشغالات الطرق</p>
                          <p>مراقبة النظافة العامة - محافظة العاصمة</p>
                          <p>قسم مراكز النظافة - مركز ({formData.centerName || '_________'})</p>
                        </div>

                        {/* Mascot logo */}
                        <div className="text-center flex flex-col items-center justify-center space-y-1">
                          <div className="w-28 h-16 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-slate-900 overflow-hidden p-0 shadow-sm">
                            <img src={LOGO_BASE64} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="شعار بلدية الكويت" />
                          </div>
                          <p className="font-bold text-[9px] text-slate-800">بلدية الكويت</p>
                        </div>

                        {/* Report ID and constraints on left */}
                        <div className="text-left font-mono text-[10px] space-y-1 text-slate-950 font-bold leading-5">
                          <p className="font-black text-[11px] text-slate-900 text-left">
                            {formData.reportType === 'weekly' ? 'الإحصائية الأسبوعية لإنجازات الموظفين' : 'الإحصائية الشهرية لإنجازات الموظفين'}
                          </p>
                          <p className="text-left text-teal-850">مركز: {formData.centerName || '---------'}</p>
                          <p className="text-left text-teal-850">النوبة: {formData.shift || '---'}</p>
                          <p className="text-left text-slate-600">الفترة من: {formData.date}</p>
                          <p className="text-left text-slate-600">إلى: {formData.dateTo || '---------'}</p>
                        </div>
                      </div>

                      {/* NEW UNIFIED MASTER VISUAL DASHBOARD SHEET */}
                      {(() => {
                        const aggHygiene = (formData.hygieneLawPublic || formData.cleaningViolations || 0) + (formData.hygieneLawCarRemoval || 0);
                        const aggViolations = (formData.violations9_87 || 0) + (formData.law30_2021 || 0) + (formData.streetVendors || 0);
                        const aggComplaints = formData.completedComplaints || 0;
                        const aggRoad = formData.roadObstructions || 0;
                        const aggCars = (formData.droppedCarsNeglected || 0) + (formData.droppedCarsScrap || 0) + (formData.droppedCarsForSale || 0);
                        const aggWarnings = (formData.warnings || 0) + (formData.undertakings || 0) + (formData.stickers || 0);
                        const aggTrips = (formData.tripsWaste || 0) + (formData.tripsBigDumper || 0) + (formData.tripsSmallDumper || 0) + (formData.tripsLorry || 0);

                        const grandTotal = aggHygiene + aggViolations + aggComplaints + aggRoad + aggCars + aggWarnings + aggTrips;
                        const maxVal = Math.max(1, aggHygiene, aggViolations, aggComplaints, aggRoad, aggCars, aggWarnings, aggTrips);

                        const categories = [
                          { name: 'لائحة النظافة العامة م354', val: aggHygiene, color: '#154fc1', icon: '✨' },
                          { name: 'مخالفات وقوانين البلدية', val: aggViolations, color: '#1d4ed8', icon: '📝' },
                          { name: 'الشكاوى والاستفسارات المنجزة', val: aggComplaints, color: '#2563eb', icon: '🛡️' },
                          { name: 'مخالفات إشغالات الطرق', val: aggRoad, color: '#3b82f6', icon: '⚠️' },
                          { name: 'رفع المركبات والمهملات', val: aggCars, color: '#0284c7', icon: '🚜' },
                          { name: 'الإنذارات والتعهدات والملصقات', val: aggWarnings, color: '#06b6d4', icon: '📌' },
                          { name: 'حركة آليات دروب النقل (الدروب)', val: aggTrips, color: '#14b8a6', icon: '🚛' },
                        ];

                        return (
                          <div className="my-3 space-y-4 w-full text-slate-900">
                            <div className="grid grid-cols-4 gap-2.5">
                              <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                                <p className="text-[8px] font-bold text-slate-500 mb-0.5">مركز النظافة ونوبة العمل</p>
                                <p className="text-[11px] font-black text-slate-950 text-center">
                                  مركز {formData.centerName || '_________'} (نوبة {formData.shift || '___'})
                                </p>
                              </div>
                              <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                                <p className="text-[8px] font-bold text-slate-500 mb-0.5">المسؤول / المفتش المسؤول</p>
                                <p className="text-[11px] font-black text-slate-950 text-center">
                                  {formData.inspectorName || '__________________'} ({formData.jobTitle || 'مفتش'})
                                </p>
                              </div>
                              <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                                <p className="text-[8px] font-bold text-slate-500 mb-0.5">رقم الضبطية / الملف</p>
                                <p className="text-[11px] font-bold font-mono text-slate-950 text-center">
                                  {formData.fileNumber || '---------'}
                                </p>
                              </div>
                              <div className="border border-slate-900 bg-slate-50 p-2 text-center rounded-lg shadow-sm">
                                <p className="text-[8px] font-bold text-slate-500 mb-0.5">الفترة الزمنية للإحصائية</p>
                                <p className="text-[10px] font-black text-center text-teal-850 font-mono">
                                  {formData.date} ➔ {formData.dateTo || '------'}
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-12 gap-3.5 items-stretch">
                              <div className="col-span-7 border border-slate-900 rounded-xl bg-white p-3.5 flex flex-col justify-between shadow-sm">
                                <div>
                                  <p className="text-[11px] font-black text-slate-950 border-b border-slate-300 pb-1.5 text-center bg-slate-100/60 rounded mb-3">
                                    📊 التحليل والمنحنى البياني التراكمي لإنجازات المركز
                                  </p>
                                  <div className="space-y-3 px-1 mt-2">
                                    {categories.map((cat, idx) => {
                                      const barWidth = Math.max(4, (cat.val / maxVal) * 100);
                                      return (
                                        <div key={idx} className="space-y-1">
                                          <div className="flex justify-between items-center text-[10px] font-black text-slate-900">
                                            <span className="flex items-center gap-1">
                                              <span>{cat.icon}</span>
                                              <span>{cat.name}</span>
                                            </span>
                                            <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                                              {cat.val}
                                            </span>
                                          </div>
                                          <div className="h-4 w-full bg-slate-100 rounded border border-slate-300 overflow-hidden flex items-center relative">
                                            <div 
                                              className="h-full rounded-l"
                                              style={{ 
                                                width: `${barWidth}%`, 
                                                backgroundColor: cat.color,
                                              }}
                                            />
                                            {cat.val > 0 && (
                                              <span className="absolute left-2 text-[9px] font-mono font-extrabold text-black/80">
                                                {Math.round((cat.val / (grandTotal || 1)) * 100)}%
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="mt-4 bg-amber-500/15 border border-amber-500/50 p-2.5 rounded-lg flex items-center justify-between">
                                  <span className="text-[11px] font-black text-amber-950 flex items-center gap-1.5">
                                    🏆 الإجمالي العام لجميع المعاملات والإنجازات المسجلة:
                                  </span>
                                  <span className="font-mono font-black text-base bg-amber-500 text-slate-950 px-3 py-0.5 rounded-md border border-slate-900 shadow-sm">
                                    {grandTotal}
                                  </span>
                                </div>
                              </div>

                              <div className="col-span-5 border border-slate-900 rounded-xl bg-slate-50/50 p-3.5 flex flex-col justify-between shadow-sm">
                                <div>
                                  <p className="text-[11px] font-black text-slate-950 border-b border-slate-300 pb-1.5 text-center bg-slate-100/60 rounded mb-2">
                                    📋 تفاصيل الأرقام والبيانات المسجلة
                                  </p>
                                  
                                  <div className="space-y-2 mt-2">
                                    <div className="space-y-1">
                                      <p className="text-[9.5px] font-black text-teal-850 border-r-2 border-teal-500 pr-1.5 py-0.2 select-none bg-teal-50/30">
                                        ✨ لائحة النظافة العامة م354
                                      </p>
                                      <div className="grid grid-cols-2 gap-1.5 text-[9.5px] px-1.5">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-600 font-extrabold text-right">مخالفات عامة:</span>
                                          <span className="font-mono font-black text-slate-950 text-left">{formData.hygieneLawPublic || formData.cleaningViolations || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-600 font-extrabold text-right">رفع السيارات:</span>
                                          <span className="font-mono font-black text-slate-950 text-left">{formData.hygieneLawCarRemoval || 0}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-[9.5px] font-black text-amber-850 border-r-2 border-amber-500 pr-1.5 py-0.2 select-none bg-amber-50/30">
                                        📝 مخالفات وقوانين البلدية
                                      </p>
                                      <div className="grid grid-cols-2 gap-1.5 text-[9.5px] px-1.5">
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-600 font-extrabold text-right">قانون ٣٠/٢٠٢١:</span>
                                          <span className="font-mono font-black text-slate-950 text-left">{formData.law30_2021 || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                          <span className="text-slate-600 font-extrabold text-right">مخالفات ٩/٨٧:</span>
                                          <span className="font-mono font-black text-slate-950 text-left">{formData.violations9_87 || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center col-span-2 border-t border-slate-200 pt-1">
                                          <span className="text-slate-600 font-extrabold text-right">باعة متجولين:</span>
                                          <span className="font-mono font-black text-slate-950 text-left">{formData.streetVendors || 0}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-[9.5px] font-black text-yellow-850 border-r-2 border-yellow-500 pr-1.5 py-0.2 select-none bg-yellow-50/20">
                                        📌 العمليات الرقابية والإنذارات
                                      </p>
                                      <div className="grid grid-cols-3 gap-1.5 text-[9px] px-1.5">
                                        <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                          <span className="text-slate-500 block text-[7.5px] font-bold">الإنذارات</span>
                                          <span className="font-mono font-black text-slate-900 mt-0.5">{formData.warnings || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                          <span className="text-slate-500 block text-[7.5px] font-bold">التعهدات</span>
                                          <span className="font-mono font-black text-slate-900 mt-0.5">{formData.undertakings || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                          <span className="text-slate-500 block text-[7.5px] font-bold">ملصقات</span>
                                          <span className="font-mono font-black text-slate-900 mt-0.5">{formData.stickers || 0}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-[9.5px] font-black text-sky-850 border-r-2 border-sky-500 pr-1.5 py-0.2 select-none bg-sky-50/30">
                                        🚜 المركبات المهملة والسكراب
                                      </p>
                                      <div className="grid grid-cols-3 gap-1.5 text-[9px] px-1.5">
                                        <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                          <span className="text-slate-500 block text-[7.5px] font-bold">مهملة</span>
                                          <span className="font-mono font-black text-slate-900 mt-0.5">{formData.droppedCarsNeglected || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                          <span className="text-slate-500 block text-[7.5px] font-bold">سكراب</span>
                                          <span className="font-mono font-black text-slate-900 mt-0.5">{formData.droppedCarsScrap || 0}</span>
                                        </div>
                                        <div className="flex flex-col items-center bg-white border border-slate-200 rounded p-1">
                                          <span className="text-slate-500 block text-[7.5px] font-bold">للبيع</span>
                                          <span className="font-mono font-black text-slate-900 mt-0.5">{formData.droppedCarsForSale || 0}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-[9.5px] font-black text-rose-850 border-r-2 border-rose-500 pr-1.5 py-0.2 select-none bg-rose-50/30">
                                        ⚠️ الشكاوى وإشغالات الطرق
                                      </p>
                                      <div className="grid grid-cols-2 gap-1.5 text-[10px] px-1.5">
                                        <div className="flex justify-between items-center text-right">
                                          <span className="text-slate-600 font-extrabold text-right">الشكاوى المنجزة:</span>
                                          <span className="font-mono font-black text-slate-950 text-left">{formData.completedComplaints || 0}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-right">
                                          <span className="text-slate-600 font-extrabold text-right">إشغالات الطرق:</span>
                                          <span className="font-mono font-black text-slate-950 text-left">{formData.roadObstructions || 0}</span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-1">
                                      <p className="text-[9.5px] font-black text-green-850 border-r-2 border-green-500 pr-1.5 py-0.2 select-none bg-green-50/30">
                                        Surveys & Trips (الدروب)
                                      </p>
                                      <div className="grid grid-cols-4 gap-1 text-[8.5px] text-center font-bold">
                                        <div className="bg-white border border-slate-200 p-0.5 rounded">
                                          <p className="text-slate-500 text-[8px] font-bold text-center">النفايات</p>
                                          <p className="font-mono font-black text-slate-950 text-center">{formData.tripsWaste || 0}</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-0.5 rounded">
                                          <p className="text-slate-500 text-[8px] font-bold text-center">كبير</p>
                                          <p className="font-mono font-black text-slate-950 text-center">{formData.tripsBigDumper || 0}</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-0.5 rounded">
                                          <p className="text-slate-500 text-[8px] font-bold text-center">صغير</p>
                                          <p className="font-mono font-black text-slate-950 text-center">{formData.tripsSmallDumper || 0}</p>
                                        </div>
                                        <div className="bg-white border border-slate-200 p-0.5 rounded">
                                          <p className="text-slate-500 text-[8px] font-bold text-center">لوري</p>
                                          <p className="font-mono font-black text-slate-950 text-center">{formData.tripsLorry || 0}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="text-center my-1.5 py-0.5">
                        <p className="text-[11px] font-black text-slate-900">وتقبلوا بقبول فائق الاحترام والتقدير ،،،</p>
                      </div>

                      <div className="pt-2 border-t border-slate-600 text-slate-900">
                        {formData.reportType === 'weekly' ? (
                          <div className="grid grid-cols-3 gap-3 items-stretch text-[10px] font-bold text-slate-950">
                            <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                              <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">مشرف النوبة</p>
                              <div className="space-y-1 text-[10px] text-right">
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>الاسم:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التوقيع:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التاريخ:</span>
                                  <span className="text-slate-500 font-mono font-bold text-[9px] text-right">      /      /   2026</span>
                                </p>
                              </div>
                            </div>
                            
                            <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                              <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">رئيس المركز</p>
                              <div className="space-y-1 text-[10px] text-right">
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>الاسم:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التوقيع:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التاريخ:</span>
                                  <span className="text-slate-500 font-mono font-bold text-[9px] text-right">      /      /   2026</span>
                                </p>
                              </div>
                            </div>

                            <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                              <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">رئيس قسم مراكز النظافة</p>
                              <div className="space-y-1 text-[10px] text-right">
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>الاسم:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التوقيع:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التاريخ:</span>
                                  <span className="text-slate-500 font-mono font-bold text-[9px] text-right">      /      /   2026</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-4 items-stretch text-[10px] font-bold text-slate-950 max-w-[550px] mx-auto">
                            <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                              <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">اعتماد رئيس المركز</p>
                              <div className="space-y-1 text-[10px] text-right">
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>الاسم:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التوقيع:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التاريخ:</span>
                                  <span className="text-slate-500 font-mono font-bold text-[9px] text-right">      /      /   2026</span>
                                </p>
                              </div>
                            </div>

                            <div className="border border-slate-900 p-2 space-y-2 bg-slate-50 text-right rounded-lg shadow-sm">
                              <p className="font-black border-b border-slate-900 text-center bg-slate-200/80 text-slate-950 py-0.5 mb-1.5 rounded text-[10.5px]">اعتماد رئيس قسم مراكز النظافة</p>
                              <div className="space-y-1 text-[10px] text-right">
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>الاسم:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التوقيع:</span>
                                  <span className="text-slate-400 font-mono text-[9px] text-right">...........................................</span>
                                </p>
                                <p className="flex justify-between items-center text-slate-800 text-right">
                                  <span>التاريخ:</span>
                                  <span className="text-slate-500 font-mono font-bold text-[9px] text-right">      /      /   2026</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Sheet Footer */}
                      <div className="text-center pt-2 border-t border-slate-900 text-[9px] text-slate-550 font-mono tracking-tight uppercase text-right">
                        بلدية الكويت &copy; 2026 - نظام الأرشفة والمتابعة الإلكتروني الموحد لمركز 139 والأرقام الميدانية والمصورة
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-100 dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-3.5">
                <button 
                  onClick={() => {
                    exportTableAsImage('preview', formData.reportType || 'weekly');
                  }}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-[0_10px_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
                >
                  <Download size={18} />
                  تصدير كصورة عالية الدقة 💾
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    handlePrintClick('stats', formData.id || 'preview');
                  }}
                  className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black shadow-md transition-all active:scale-95 text-xs sm:text-sm cursor-pointer"
                >
                  <Printer size={18} />
                  طباعة التقرير A4 🖨️
                </button>
                <button 
                  onClick={() => setActiveStatsPreviewModal(false)}
                  className="px-8 py-3.5 text-slate-700 dark:text-gray-300 font-bold hover:bg-white dark:hover:bg-slate-800 rounded-2xl transition-all text-xs sm:text-sm cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fallback Icon for tabs
function PlusCircleIconFallback({ size = 20, className = "" }) {
  return (
    <svg 
      className={className} 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
      <polyline points="14 2 14 8 20 8"></polyline>
      <line x1="16" y1="13" x2="8" y2="13"></line>
      <line x1="16" y1="17" x2="8" y2="17"></line>
      <polyline points="10 9 9 9 8 9"></polyline>
    </svg>
  );
}
