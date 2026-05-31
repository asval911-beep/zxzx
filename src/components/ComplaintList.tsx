import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Search, Eye, Trash2, Edit3, Image as ImageIcon, MapPin, User, Calendar, Printer, X, FileText, CheckCircle2, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Complaint } from '../types';
import { LOGO_BASE64 } from '../assets/logo_base64';
import html2canvas from 'html2canvas';
import { cn } from '../lib/utils';

const replaceOklchAndOklabText = (cssString: string): string => {
  return cssString.replace(/(oklch|oklab)\(([^)]+)\)/g, (match, type, content) => {
    const parts = content.trim().split(/[\s/]+/);
    const lightnessStr = parts[0];
    const lightness = parseFloat(lightnessStr);
    
    let alpha = 1;
    if (content.includes('/')) {
      const alphaPart = content.split('/').pop()?.trim() || '';
      alpha = parseFloat(alphaPart);
      if (isNaN(alpha)) alpha = 1;
    }

    if (!isNaN(lightness)) {
      const l = lightnessStr.includes('%') ? lightness / 100 : lightness;
      if (l > 0.85) {
        return `rgba(255, 255, 255, ${alpha})`;
      } else if (l > 0.72) {
        return `rgba(241, 245, 249, ${alpha})`; // very light slate (bg-gray-50/100)
      } else if (l > 0.6) {
        return `rgba(226, 232, 240, ${alpha})`; // border colors (slate-200)
      } else if (l > 0.45) {
        return `rgba(148, 163, 184, ${alpha})`; // text gray (slate-400)
      } else if (l > 0.28) {
        return `rgba(71, 85, 105, ${alpha})`; // medium text (slate-600)
      } else {
        return `rgba(15, 23, 42, ${alpha})`; // dark gray text/solid (slate-900)
      }
    }
    return `rgba(15, 23, 42, ${alpha})`;
  });
};

interface ComplaintListProps {
  complaints: Complaint[];
  onDelete: (id: string) => void;
  onUpdate: (complaint: Complaint) => void;
}

export default function ComplaintList({ complaints, onDelete, onUpdate }: ComplaintListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Completion form states
  const [completingComplaint, setCompletingComplaint] = useState<Complaint | null>(null);
  const [completionText, setCompletionText] = useState("");
  const [completionImage, setCompletionImage] = useState<string>("");

  const handleCompletionImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 500;
          const MAX_HEIGHT = 500;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.4);
          setCompletionImage(dataUrl);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-scale states for previewing perfectly within the screen container
  const [previewScale, setPreviewScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedComplaint) return;
    const container = containerRef.current;
    const preview = previewRef.current;
    if (!container || !preview) return;

    const updateScale = () => {
      const containerWidth = container.getBoundingClientRect().width;
      const targetWidth = 840; // width of preview card + margin allowance
      const scale = containerWidth < targetWidth ? (containerWidth / targetWidth) : 1;
      setPreviewScale(scale);
      setPreviewHeight(preview.offsetHeight * scale);
    };

    const observer = new ResizeObserver(updateScale);
    observer.observe(container);
    observer.observe(preview);
    updateScale();

    // Trigger check multiple times to catch dynamic height variations
    const timer = setTimeout(updateScale, 150);

    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [selectedComplaint]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter(c => 
      c.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.inspectorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.centerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complainantName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [complaints, searchTerm]);

  const exportAsImage = async () => {
    const element = document.getElementById('complaint-preview-modal');
    if (element) {
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

      // Create offscreen wrapper on body to prevent screen edge viewport clipping on small screens
      const wrapper = document.createElement('div');
      wrapper.style.position = 'absolute';
      wrapper.style.left = '-9999px';
      wrapper.style.top = '0';
      wrapper.style.width = '850px';
      wrapper.style.backgroundColor = '#ffffff';
      wrapper.style.direction = 'rtl';
      wrapper.style.overflow = 'visible';

      const clone = element.cloneNode(true) as HTMLElement;
      
      // Explicitly copy current live values from original to clone (cloneNode does not copy dynamic form values)
      const originalInputs = element.querySelectorAll('input, select, textarea');
      const clonedInputs = clone.querySelectorAll('input, select, textarea');
      clonedInputs.forEach((clonedEl, idx) => {
        const origEl = originalInputs[idx] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
        if (origEl) {
          (clonedEl as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value = origEl.value;
        }
      });

      clone.id = 'cloned-complaint-preview-modal';
      clone.style.width = '820px';
      clone.style.minWidth = '820px';
      clone.style.maxWidth = '820px';
      clone.style.padding = '36px'; // Tighter padding
      clone.style.margin = '0 auto';
      clone.style.transform = 'none';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';
      clone.style.backgroundColor = '#ffffff';

      // Convert all form fields inside the sheet to flat clean text elements
      clone.querySelectorAll('input, select, textarea').forEach((field) => {
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
        span.style.fontSize = '14px';
        
        if (inputEl.parentElement) {
          inputEl.parentElement.replaceChild(span, inputEl);
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
        p, span, h1, h2, h3, h4, h5, h6, div, p, label, input, textarea {
          letter-spacing: normal !important;
          word-spacing: normal !important;
        }
        /* Grids must stay inline and never wrap to cause sliding down */
        .grid {
          display: flex !important;
          flex-direction: row-reverse !important;
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
        .whitespace-pre-wrap, .break-words {
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
          useCORS: true,
          scale: 3, // Ultra high resolution
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          windowWidth: 850,
          windowHeight: clone.offsetHeight + 100,
        });

        const link = document.createElement('a');
        link.download = `محضر_معاينة_شكوى_رقم_${selectedComplaint?.id.slice(0, 8).toUpperCase()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("خطأ أثناء تصدير المعاينة:", err);
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

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="municipal-card p-6 flex flex-col md:flex-row gap-6 items-center shadow-xl border-t-4 border-municipality-gold">
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-municipality-gold" size={24} />
          <input 
            type="text" 
            placeholder="البحث الذكي في الأرشيف (الاسم، الموقع، المفتش، نوع المعاملة)..." 
            className="municipal-input pr-12 py-4 bg-white shadow-inner focus:ring-municipality-gold"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 bg-municipality-blue/5 p-3 rounded-xl border border-municipality-blue/10">
          <span className="text-xs font-black text-municipality-blue uppercase">السجلات المكتشفة:</span>
          <span className="bg-municipality-blue text-municipality-gold w-10 h-10 flex items-center justify-center font-black rounded-lg shadow-lg">{filteredComplaints.length}</span>
        </div>
      </div>

      {/* Grid of Complaints */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredComplaints.map((comp) => (
          <motion.div
            layout
            key={comp.id}
            className="municipal-card group hover:border-municipality-gold transition-all duration-300 flex flex-col shadow-lg hover:shadow-2xl bg-white border-2 border-gray-100"
          >
            <div className="p-4 bg-municipality-blue text-white flex justify-between items-center group-hover:bg-municipality-gold transition-colors duration-300">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest">
                  REF: {comp.id.slice(0, 8)}
                </span>
                <span className={cn(
                  "text-[9px] px-2 py-0.5 rounded-full font-black uppercase",
                  comp.status === 'done' ? "bg-green-500 text-white" : "bg-amber-500 text-white"
                )}>
                  {comp.status === 'done' ? 'تم الإنجاز' : 'قيد العمل'}
                </span>
              </div>
              <span className="text-[10px] font-bold flex items-center gap-1 opacity-80">
                <Calendar size={12} /> {comp.date}
              </span>
            </div>
            
            <div className="p-6 flex-1 space-y-4">
              <div className="flex justify-between items-start">
                 <h3 className="font-black text-xl text-municipality-blue leading-tight">{comp.category}</h3>
                 <div className="flex gap-2">
                    {comp.images.length > 0 && <ImageIcon className="text-municipality-gold/50" size={16} />}
                    <button 
                      onClick={() => {
                        if (comp.status === 'done') {
                          onUpdate({
                            ...comp,
                            status: 'pending',
                            completionDetails: undefined,
                            completionImages: undefined,
                            completionDate: undefined
                          });
                        } else {
                          setCompletingComplaint(comp);
                          setCompletionText("");
                          setCompletionImage("");
                        }
                      }}
                      className={cn(
                        "p-1.5 rounded-lg transition-all",
                        comp.status === 'done' ? "text-green-500 bg-green-50" : "text-amber-500 bg-amber-50"
                      )}
                      title={comp.status === 'done' ? 'إعادة الشكوى لقيد العمل' : 'إنجاز الشكوى وإرفاق إثبات'}
                    >
                      {comp.status === 'done' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    </button>
                 </div>
              </div>
              <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed border-r-2 border-gray-100 pr-3">
                {comp.details}
              </p>
              
              <div className="pt-4 grid grid-cols-2 gap-3 text-[11px] font-bold">
                <div className="flex items-center gap-2 truncate bg-slate-100 dark:bg-[#123354] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#163f69] p-2 rounded-lg">
                  <User size={14} className="text-amber-600 dark:text-municipality-gold shrink-0" />
                  <span className="truncate">{comp.inspectorName}</span>
                </div>
                <div className="flex items-center gap-2 truncate bg-slate-100 dark:bg-[#123354] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-[#163f69] p-2 rounded-lg">
                  <MapPin size={14} className="text-amber-600 dark:text-municipality-gold shrink-0" />
                  <span className="truncate">{comp.centerName}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/70 dark:bg-[#123354]/40 border-t border-slate-100 dark:border-slate-850 flex flex-col gap-3">
              {deletingId === comp.id ? (
                <div className="flex items-center justify-center gap-2 w-full bg-red-50 dark:bg-red-950/20 p-2 rounded-xl border border-red-100 dark:border-red-900/40">
                  <span className="text-xs font-black text-red-600 dark:text-red-400">تأكيد الحذف؟</span>
                  <button 
                    onClick={() => {
                      onDelete(comp.id);
                      setDeletingId(null);
                    }}
                    className="flex-1 text-center py-2 px-3 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-black transition-all cursor-pointer"
                  >
                    نعم، احذف
                  </button>
                  <button 
                    onClick={() => setDeletingId(null)}
                    className="flex-1 text-center py-2 px-3 bg-gray-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded-lg text-xs font-black hover:bg-gray-300 transition-all cursor-pointer"
                  >
                    تراجع
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 w-full">
                  <button 
                    onClick={() => setSelectedComplaint(comp)}
                    className="flex items-center justify-center gap-2 text-xs font-black py-2.5 px-4 bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 transition-all shadow-sm cursor-pointer"
                  >
                    <Eye size={16} /> معاينة فنية
                  </button>
                  <button 
                    onClick={() => setDeletingId(comp.id)}
                    className="flex items-center justify-center gap-2 text-xs font-black py-2.5 px-4 bg-white dark:bg-slate-900 border-2 border-red-200 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                  >
                    <Trash2 size={16} /> حذف
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredComplaints.length === 0 && (
        <div className="text-center py-24 bg-white rounded-2xl border-4 border-dashed border-gray-100 shadow-inner">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gray-50 text-gray-200 mb-6 border-2 border-gray-100">
            <Search size={48} />
          </div>
          <h3 className="text-2xl font-black text-gray-400">لا توجد نتائج تطابق معايير البحث</h3>
          <p className="text-gray-300 mt-2">حاول استخدام كلمات مفتاحية أخرى أو مراجعة التاريخ</p>
        </div>
      )}

      {/* Detailed Official Preview Modal */}
      <AnimatePresence>
        {selectedComplaint && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-municipality-blue/90 backdrop-blur-md"
              onClick={() => setSelectedComplaint(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh]"
            >
              <div className="flex items-center justify-between p-6 bg-municipality-blue text-white border-b-4 border-municipality-gold">
                <div className="flex items-center gap-4">
                   <div className="bg-municipality-gold text-municipality-blue p-2 rounded-lg font-black text-xs">OFFICIAL PREVIEW</div>
                   <span className="font-black text-lg">معاينة المعاملة الرسمية</span>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto beautiful-scrollbar overflow-x-hidden bg-gray-50 p-4 pb-12 flex flex-col items-center">
                <div 
                  ref={containerRef}
                  className="w-full max-w-4xl flex justify-center items-start overflow-y-auto overflow-x-auto max-h-[65vh] sm:max-h-[72vh] beautiful-scrollbar p-3 bg-gray-100/40 rounded-2xl border border-gray-200/50"
                  style={{ height: previewHeight ? `${previewHeight + 16}px` : 'auto' }}
                >
                  <div 
                    ref={previewRef}
                    id="complaint-preview-modal" 
                    className="w-[820px] bg-white p-8 space-y-6 shadow-md border border-gray-200 origin-top transition-transform duration-200 official-a4-canvas"
                    style={{ 
                      minHeight: 'auto', 
                      direction: 'rtl',
                      transform: `scale(${previewScale})`
                    }}
                  >
                  {/* Official Header */}
                  <div className="flex justify-between items-start border-b-4 border-municipality-blue pb-4">
                    <div className="text-right space-y-0.5">
                      <h4 className="font-black text-2xl text-municipality-blue">دولة الكويت</h4>
                      <p className="font-black text-lg text-gray-800">بلدية الكويت</p>
                      <p className="font-bold text-xs text-gray-500">إدارة النظافة العامة وإشغالات الطرق</p>
                      <p className="font-black text-[10px] text-municipality-gold mt-1">مركز العمل: {selectedComplaint.centerName || 'مركز الروضة'}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-28 h-16 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-municipality-gold mb-2 shadow-md overflow-hidden p-0">
                        <img src={LOGO_BASE64} className="w-full h-full object-cover" referrerPolicy="no-referrer" alt="شعار بلدية الكويت الرسمية" />
                      </div>
                      <p className="text-[9px] font-black text-municipality-blue uppercase tracking-[0.1em]">{selectedComplaint.centerName}</p>
                    </div>
                    <div className="text-right font-mono space-y-0.5" style={{ direction: 'rtl' }}>
                      <p className="font-black text-lg text-municipality-blue mb-1 text-right">محضر معاينة شكوى</p>
                       <div className="space-y-0.5 text-[11px] text-right">
                         <p className="font-bold text-slate-700">تاريخ تسجيل الشكوى: <span className="underline font-black">{selectedComplaint.date}</span></p>
                         <p className="font-bold text-slate-700">تاريخ المعاينة والطباعة: <span className="underline font-black">{new Date().toISOString().split('T')[0]}</span></p>
                         <p className="font-bold text-slate-700">رقم البلاغ (Ref): <span className="font-black text-municipality-blue">{selectedComplaint.id.slice(0, 8).toUpperCase()}</span></p>
                         <p className="font-bold text-slate-700">حالة المعاملة: 
                           <span className={cn(
                             "mr-2 px-1.5 py-0.5 rounded text-[9px] inline-block font-black",
                             selectedComplaint.status === 'done' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                           )}>
                             {selectedComplaint.status === 'done' ? 'تم الإنجاز (Done)' : 'قيد العمل (In Progress)'}
                           </span>
                         </p>
                       </div>
                    </div>
                  </div>

                  {/* Identification Box */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="border-r-4 border-municipality-gold pr-4">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">نوع المعاملة / المخالفة</p>
                        <p className="font-black text-lg text-municipality-blue uppercase">{selectedComplaint.category}</p>
                      </div>
                      <div className="border-r-4 border-municipality-gold pr-4">
                        <p className="text-[9px] font-black text-gray-400 uppercase mb-0.5">المركبة المعنية</p>
                        <p className="font-black text-base text-gray-700">{selectedComplaint.vehicle}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-150 flex flex-col justify-center space-y-2 shadow-sm">
                      <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg shadow-xs border border-gray-100">
                        <span className="text-[9px] font-black text-gray-400">المفتش المسؤول</span>
                        <span className="font-black text-xs text-municipality-blue">{selectedComplaint.inspectorName}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg shadow-xs border border-gray-100">
                        <span className="text-[9px] font-black text-gray-400">اسم المشتكي</span>
                        <span className="font-black text-xs text-municipality-blue">{selectedComplaint.complainantName || "لم يذكر"}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg shadow-xs border border-gray-100">
                        <span className="text-[9px] font-black text-gray-400">هاتف الشاكي</span>
                        <span className="font-black text-xs text-municipality-blue">{selectedComplaint.complainantPhone || "لم يذكر"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-3">
                     <h4 className="font-black text-base text-municipality-blue bg-municipality-blue/5 py-1.5 px-4 rounded-lg border-r-4 border-municipality-gold shadow-xs flex items-center gap-2">
                       <FileText className="text-municipality-gold" size={16} /> تفاصيل الشكوى
                     </h4>
                     <div className="bg-white p-5 border border-gray-150 rounded-2xl min-h-[100px] shadow-sm font-medium text-sm text-gray-800 leading-relaxed whitespace-pre-wrap relative overflow-hidden">
                       <div className="absolute top-0 left-0 px-2 py-1 bg-gray-50 text-[9px] font-black text-gray-400 rounded-br-xl">FIELD NOTES</div>
                       {selectedComplaint.details}
                     </div>
                  </div>

                  {/* Identification Images */}
                  {selectedComplaint.images.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-black text-base text-municipality-blue flex items-center gap-2 uppercase">
                        <ImageIcon className="text-municipality-gold" size={16} /> صور الملاحظات والشكوى
                      </h4>
                      <div className={cn(
                        "grid gap-4 justify-center items-center w-full",
                        selectedComplaint.images.length === 1 ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                      )}>
                        {selectedComplaint.images.map((img, i) => (
                          <div key={i} className="group relative rounded-2xl overflow-hidden border border-gray-200 shadow-sm aspect-[4/3] w-full max-w-[280px] mx-auto">
                            <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 inset-x-0 p-1.5 bg-black/60 text-white text-[9px] font-black text-center backdrop-blur-xs">
                              EVIDENCE ITEM #0{i+1}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Proof of Completion Section - Render only if completed */}
                  {selectedComplaint.status === 'done' && (
                    <div className="space-y-4 pt-4 border-t-2 border-dashed border-gray-200 mt-4">
                      <h4 className="font-black text-base text-green-700 bg-green-50 py-1.5 px-4 rounded-lg border-r-4 border-green-500 shadow-xs flex items-center gap-2">
                        <CheckCircle2 className="text-green-500" size={16} /> تفاصيل إنجاز الشكوى وتوصية المفتش (Completion Report)
                      </h4>
                      <div className="bg-emerald-50/50 p-5 border-2 border-emerald-500/30 rounded-2xl min-h-[80px] shadow-sm font-black text-sm text-emerald-800 leading-relaxed whitespace-pre-wrap relative overflow-hidden text-right">
                        <div className="absolute top-0 left-0 px-2 py-0.5 bg-emerald-100 text-[9px] font-black text-emerald-800 rounded-bl-xl shadow-xs">
                          تم الإنجاز بتاريخ: {selectedComplaint.completionDate || selectedComplaint.date}
                        </div>
                        <div className="pt-2 text-emerald-700 font-black text-base leading-relaxed">
                          {selectedComplaint.completionDetails || "تمت معاينة الموقع ومعالجة موضوع الشكوى بالكامل وإنجاز المعاملة."}
                        </div>
                      </div>

                      {/* Completion Images */}
                      {selectedComplaint.completionImages && selectedComplaint.completionImages.length > 0 && (
                        <div className="space-y-3 pt-1">
                          <h4 className="font-black text-base text-green-700 flex items-center gap-2 uppercase">
                            <ImageIcon className="text-green-500" size={16} /> صور إثبات المعالجة وإنجاز الشكوى
                          </h4>
                          <div className={cn(
                            "grid gap-4 justify-center items-center w-full",
                            selectedComplaint.completionImages.length === 1 ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"
                          )}>
                            {selectedComplaint.completionImages.map((img, i) => (
                              <div key={i} className="group relative rounded-2xl overflow-hidden border border-green-200 shadow-sm aspect-[4/3] w-full max-w-[280px] mx-auto">
                                <img src={img} alt="Completion Proof" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 inset-x-0 p-1.5 bg-green-950/70 text-white text-[9px] font-black text-center backdrop-blur-xs font-sans">
                                  COMPLETION PROOF #0{i+1}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Complainant Signature */}
                  <div className="flex justify-start pt-4">
                    <div className="w-[260px] border-2 border-dashed border-gray-300 rounded-2xl p-4 bg-gray-50/50 space-y-2 text-center">
                      <p className="font-black text-xs text-municipality-blue uppercase">✍️ توقيع الشاكي (Complainant Signature)</p>
                      <div className="h-16 flex items-center justify-center border border-gray-200 rounded-xl bg-white p-2 shadow-inner relative">
                        <div className="w-11/12 border-b border-dashed border-gray-300 absolute bottom-4"></div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Signatures */}
                  <div className="pt-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-end border-t-2 border-gray-100 text-center">
                     <div className="space-y-6 group">
                        <p className="font-black text-xs text-municipality-blue uppercase group-hover:text-municipality-gold transition-colors">توقيع المفتش</p>
                        <div className="h-[2px] bg-gray-200 group-hover:bg-municipality-gold transition-all w-full"></div>
                        <p className="text-[9px] font-bold text-gray-400">Authenticated Field Officer</p>
                     </div>
                     <div className="mx-auto w-20 h-20 border-2 border-dashed border-gray-200 rounded-full flex flex-col items-center justify-center space-y-0.5 opacity-50">
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em]">Official</span>
                        <div className="w-8 h-[1px] bg-gray-200"></div>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-[0.1em]">Stamp</span>
                     </div>
                     <div className="space-y-6 group">
                        <p className="font-black text-xs text-municipality-blue uppercase group-hover:text-municipality-gold transition-colors">اعتماد رئيس المركز</p>
                        <div className="h-[2px] bg-gray-200 group-hover:bg-municipality-gold transition-all w-full"></div>
                        <p className="text-[9px] font-bold text-gray-400">Center Supervisor Control</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-gray-100 border-t-2 border-gray-200 flex justify-end gap-5">
                 <button 
                  onClick={exportAsImage}
                  className="flex items-center gap-3 bg-municipality-gold text-white px-10 py-4 rounded-2xl font-black shadow-[0_10px_20px_rgba(212,175,55,0.4)] hover:bg-amber-600 transition-all uppercase text-sm group"
                 >
                   <Printer size={20} className="group-hover:scale-125 transition-transform" /> حفظ للطباعة الفورية
                 </button>
                 <button 
                  onClick={() => setSelectedComplaint(null)}
                  className="px-10 py-4 text-municipality-blue font-black hover:bg-white rounded-2xl transition-all uppercase text-sm"
                 >
                   إغلاق
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Complete Complaint (إنجاز الشكوى) Modal */}
      <AnimatePresence>
        {completingComplaint && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-municipality-blue/80 backdrop-blur-md"
              onClick={() => setCompletingComplaint(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-[0_24px_48px_-8px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col text-right font-sans"
              style={{ direction: 'rtl' }}
            >
              <div className="flex items-center justify-between p-6 bg-municipality-blue text-white border-b-4 border-municipality-gold">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="text-municipality-gold" size={24} />
                  <span className="font-black text-lg">إثبات وإنجاز الشكوى</span>
                </div>
                <button 
                  onClick={() => setCompletingComplaint(null)} 
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
                <div className="bg-amber-50/40 p-4 rounded-2xl border border-amber-100 space-y-1">
                  <p className="font-bold text-xs text-amber-800">الشكوى المحددة:</p>
                  <p className="font-black text-base text-municipality-blue">{completingComplaint.category}</p>
                  <p className="text-xs text-slate-500 font-bold">تاريخ البلاغ: {completingComplaint.date}</p>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-black text-municipality-blue">تفاصيل وملاحظات إنجاز الشكوى <span className="text-red-500">*</span></label>
                  <textarea
                    required
                    value={completionText}
                    onChange={(e) => setCompletionText(e.target.value)}
                    placeholder="اكتب هنا تفاصيل المعالجة الميدانية (مثال: تم التوجه للموقع وإزالة المعوقات، والوضع الآن سليم بالكامل)..."
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-slate-100 rounded-xl focus:border-municipality-gold outline-none text-sm font-bold transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-black text-municipality-blue">صورة إثبات الإنجاز ومغادرة الموقع</label>
                  <div className="relative border-4 border-dashed border-gray-100 hover:border-municipality-gold/50 rounded-2xl p-6 bg-gray-50 text-center cursor-pointer transition-colors group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCompletionImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    {completionImage ? (
                      <div className="space-y-3">
                        <img 
                          src={completionImage} 
                          alt="إثبات الإنجاز" 
                          className="max-h-40 rounded-xl mx-auto border shadow-md object-contain" 
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCompletionImage("");
                          }}
                          className="text-xs font-black text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          حذف الصورة واستبدالها
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4">
                        <ImageIcon className="mx-auto text-gray-400 group-hover:text-municipality-gold/80 transition-all" size={32} />
                        <p className="text-xs font-black text-gray-500">اضغط هنا أو قم بسحب وإسقاط الصورة لمرفق الإنجاز</p>
                        <p className="text-[10px] text-gray-400">صيغ مدعومة: JPG, PNG (حد أقصى 5 ميجا)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-150 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setCompletingComplaint(null)}
                  className="px-6 py-3 text-slate-500 hover:bg-gray-100 rounded-xl font-bold transition-all text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="button"
                  disabled={!completionText.trim()}
                  onClick={() => {
                    if (!completionText.trim()) return;
                    onUpdate({
                      ...completingComplaint,
                      status: 'done',
                      completionDetails: completionText,
                      completionImages: completionImage ? [completionImage] : [],
                      completionDate: new Date().toISOString().split('T')[0]
                    });
                    setCompletingComplaint(null);
                  }}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl font-black transition-all shadow-md text-sm border-b-4 border-black/20"
                >
                  تأكيد الإنجاز وحفظ المعاملة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
