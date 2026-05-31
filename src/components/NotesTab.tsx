import React, { useState, useEffect, useRef } from 'react';
import { 
  StickyNote, 
  Plus, 
  Trash2, 
  Calendar, 
  FileEdit, 
  Save, 
  X, 
  Maximize2, 
  Minimize2, 
  Image as ImageIcon, 
  Camera, 
  Clock, 
  Download, 
  Bell,
  Palette,
  Eraser,
  RefreshCcw,
  Eye,
  Undo
} from 'lucide-react';
import { Note } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import html2canvas from 'html2canvas';

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

interface NotesTabProps {
  notes: Note[];
  onSave: (note: Note) => void;
  onDelete: (id: string) => void;
}

export default function NotesTab({ notes, onSave, onDelete }: NotesTabProps) {
  const [isAdding, setIsAdding] = useState(() => {
    try {
      const saved = localStorage.getItem('municipal_notes_draft_isAdding');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('municipal_notes_draft_activeNoteId') || null;
    } catch {
      return null;
    }
  });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Note Form State
  const [newNote, setNewNote] = useState(() => {
    const defaultState = { 
      title: '', 
      content: '', 
      color: 'bg-white', 
      image: '', 
      drawing: '',
      fontSize: 16, 
      appointmentDate: '' 
    };
    try {
      const saved = localStorage.getItem('municipal_notes_draft_newNote');
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  // Editor Sub-tabs: text editor, smart sketch board, live preview
  const [editorTab, setEditorTab] = useState<'text' | 'sketch' | 'preview'>('text');

  // Drawing Pad States
  const [isDrawing, setIsDrawing] = useState(false);
  const [brushColor, setBrushColor] = useState('#1A2533');
  const [brushSize, setBrushSize] = useState(4);
  const [brushStyle, setBrushStyle] = useState<'normal' | 'marker' | 'calligraphy'>('normal');
  const [paperGrid, setPaperGrid] = useState<'white' | 'lined' | 'grid'>('white');
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Synchronize drafts with localStorage
  useEffect(() => {
    localStorage.setItem('municipal_notes_draft_isAdding', JSON.stringify(isAdding));
  }, [isAdding]);

  useEffect(() => {
    if (activeNoteId) {
      localStorage.setItem('municipal_notes_draft_activeNoteId', activeNoteId);
    } else {
      localStorage.removeItem('municipal_notes_draft_activeNoteId');
    }
  }, [activeNoteId]);

  useEffect(() => {
    localStorage.setItem('municipal_notes_draft_newNote', JSON.stringify(newNote));
  }, [newNote]);

  const colors = [
    { name: 'أبيض', class: 'bg-white' },
    { name: 'أصفر كويتي', class: 'bg-amber-100/90' },
    { name: 'أزرق سماوي', class: 'bg-blue-100/90' },
    { name: 'أخضر بلدي', class: 'bg-green-100/90' },
    { name: 'وردي لطيف', class: 'bg-rose-100/90' },
    { name: 'بنفسجي مهدئ', class: 'bg-purple-100/90' },
    { name: 'محيطي هادئ', class: 'bg-teal-100/90' },
  ];

  const paintColors = [
    { name: 'أزرق البلدية', hex: '#1A2533' },
    { name: 'ذهبي البلدية', hex: '#C5A028' },
    { name: 'أحمر مخالفة', hex: '#EF4444' },
    { name: 'أخضر ممتاز', hex: '#10B981' },
    { name: 'أسود فحمي', hex: '#0F172A' },
    { name: 'برتقالي تنبيه', hex: '#F97316' },
  ];

  // Auto-save note on unmount (e.g. switching tabs) if there is any draft content
  const newNoteRef = useRef(newNote);
  const activeNoteIdRef = useRef(activeNoteId);
  const isAddingRef = useRef(isAdding);

  useEffect(() => {
    newNoteRef.current = newNote;
  }, [newNote]);

  useEffect(() => {
    activeNoteIdRef.current = activeNoteId;
  }, [activeNoteId]);

  useEffect(() => {
    isAddingRef.current = isAdding;
  }, [isAdding]);

  useEffect(() => {
    return () => {
      if (isAddingRef.current) {
        const note = newNoteRef.current;
        if (note.title.trim() || note.content.trim() || note.drawing.trim() || note.image.trim()) {
          onSave({
            ...note,
            id: activeNoteIdRef.current || crypto.randomUUID(),
            date: new Date().toLocaleDateString('ar-KW')
          });
        }
      }
    };
  }, [onSave]);

  // Load existing drawing onto canvas when editor tabs or active note id changes
  useEffect(() => {
    if (isAdding && canvasRef.current && newNote.drawing && editorTab === 'sketch') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          if (canvasHistory.length === 0) {
            setCanvasHistory([canvas.toDataURL()]);
          }
        };
        img.src = newNote.drawing;
      }
    }
  }, [isAdding, activeNoteId, editorTab]);

  // Coordinate mapper with automatic touch & layout scaling
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    let clientX = 0, clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);
    return { x, y };
  };

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);
    if (!coords) return;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (brushStyle === 'calligraphy') {
      ctx.lineCap = 'square';
    }

    setIsDrawing(true);
    if (e.cancelable) e.preventDefault();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e, canvas);
    if (!coords) return;

    if (brushStyle === 'calligraphy') {
      ctx.lineTo(coords.x + 2, coords.y - 1);
    } else {
      ctx.lineTo(coords.x, coords.y);
    }
    ctx.stroke();

    if (e.cancelable) e.preventDefault();
  };

  const stopDraw = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL();
      setCanvasHistory(prev => [...prev, dataUrl]);
      setNewNote(p => ({ ...p, drawing: dataUrl }));
    }
  };

  // Undo stroke
  const handleUndo = () => {
    if (canvasHistory.length <= 1) {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setCanvasHistory([]);
          setNewNote(prev => ({ ...prev, drawing: '' }));
        }
      }
      return;
    }
    const newHistory = canvasHistory.slice(0, -1);
    setCanvasHistory(newHistory);
    const prevImgUrl = newHistory[newHistory.length - 1];

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          setNewNote(p => ({ ...p, drawing: prevImgUrl }));
        };
        img.src = prevImgUrl;
      }
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setCanvasHistory([]);
        setNewNote(prev => ({ ...prev, drawing: '' }));
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNote(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = () => {
    if (!newNote.content.trim() && !newNote.drawing.trim() && !newNote.title.trim()) return;
    
    onSave({
      ...newNote,
      id: activeNoteId || crypto.randomUUID(),
      date: new Date().toLocaleDateString('ar-KW')
    });

    // Reset notes builder form
    setNewNote({ 
      title: '', 
      content: '', 
      color: 'bg-white', 
      image: '', 
      drawing: '',
      fontSize: 16, 
      appointmentDate: '' 
    });
    setActiveNoteId(null);
    setIsAdding(false);
    setCanvasHistory([]);

    // Clear drafts from localStorage
    localStorage.removeItem('municipal_notes_draft_isAdding');
    localStorage.removeItem('municipal_notes_draft_activeNoteId');
    localStorage.removeItem('municipal_notes_draft_newNote');
  };

  const handleCloseWithAutoSave = () => {
    if (newNote.title.trim() || newNote.content.trim() || newNote.drawing.trim() || newNote.image.trim()) {
      handleSave();
    } else {
      setIsAdding(false);
      setActiveNoteId(null);
      // Clear empty draft
      localStorage.removeItem('municipal_notes_draft_isAdding');
      localStorage.removeItem('municipal_notes_draft_activeNoteId');
      localStorage.removeItem('municipal_notes_draft_newNote');
    }
  };

  const handleEditNote = (note: Note) => {
    setNewNote({
      title: note.title,
      content: note.content,
      color: note.color,
      image: note.image || '',
      drawing: note.drawing || '',
      fontSize: note.fontSize || 16,
      appointmentDate: note.appointmentDate || ''
    });
    setActiveNoteId(note.id);
    setIsAdding(true);
    setEditorTab('text');
  };

  const handleNewNoteTrigger = () => {
    setNewNote({ 
      title: '', 
      content: '', 
      color: 'bg-white', 
      image: '', 
      drawing: '',
      fontSize: 16, 
      appointmentDate: '' 
    });
    setActiveNoteId(null);
    setIsAdding(true);
    setEditorTab('text');
    setCanvasHistory([]);
  };

  const exportNoteAsImage = async (id: string, fileNamePrefix: string = 'note') => {
    const el = document.getElementById(`note-${id}`);
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

      // Create offscreen wrapper on body to prevent viewport clipping
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

      clone.id = `cloned-note-${id}`;
      clone.style.width = '820px';
      clone.style.minWidth = '820px';
      clone.style.maxWidth = '820px';
      clone.style.padding = '24px';
      clone.style.margin = '0 auto';
      clone.style.transform = 'none';
      clone.style.boxShadow = 'none';
      clone.style.border = 'none';
      clone.style.backgroundColor = '#ffffff';

      const cssText = `
        * { 
          font-family: 'Noto Sans Arabic', 'Inter', sans-serif !important;
          color-scheme: light !important; 
          letter-spacing: normal !important;
          word-spacing: normal !important;
          text-rendering: optimizeLegibility !important;
          -webkit-font-smoothing: antialiased !important;
        }
        .print-hidden { display: none !important; }
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
        link.download = `${fileNamePrefix}-${id.slice(0, 8)}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (err) {
        console.error("خطأ أثناء تصدير الملاحظة المصورة:", err);
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
    <div className="space-y-8 text-right" dir="rtl">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-150/80 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-2.5 text-slate-800">
            <StickyNote className="text-municipality-gold stroke-[2.5]" size={28} />
            لوحة الملاحظات والمخططات الميدانية 📝📐
          </h2>
          <p className="text-xs text-gray-500 font-bold">مفكرة تفاعلية ذكية لحفظ التقارير والصور ورسم الكروكيات الهندسية المباشرة لبلدية الكويت م/139</p>
        </div>
        <button 
          onClick={isAdding ? handleCloseWithAutoSave : handleNewNoteTrigger}
          className="municipal-button-primary bg-municipality-blue flex items-center gap-1.5 focus:ring-2 font-bold px-5 py-2.5 text-sm rounded-xl"
        >
          {isAdding ? (
            <><X size={18} /> إغلاق المنصة الحالية</>
          ) : (
            <><Plus size={20} /> تدوين ملحوظة ورسم كروكي جديد</>
          )}
        </button>
      </div>

      {/* 1. UPCOMING APPOINTMENTS REMINDER CARD */}
      <AnimatePresence>
        {notes.filter(n => n.appointmentDate).length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -25 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -25 }}
            className="bg-gradient-to-r from-amber-50/70 via-white to-amber-50/40 rounded-3xl p-6 border-r-8 border-municipality-gold border border-amber-100 shadow-sm space-y-4"
          >
            <h3 className="text-xs font-black text-slate-700 flex items-center gap-2 uppercase tracking-wider">
              <Bell size={18} className="text-municipality-gold animate-bounce" /> المواعيد والاجتماعات والمهام التنظيمية
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {notes.filter(n => n.appointmentDate).sort((a,b) => new Date(a.appointmentDate!).getTime() - new Date(b.appointmentDate!).getTime()).map(appt => (
                <div 
                  key={appt.id} 
                  onClick={() => handleEditNote(appt)}
                  className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 cursor-pointer hover:border-municipality-gold hover:shadow-md transition-all duration-200"
                  title="انقر لتعديل الموعد ومراجعته"
                >
                  <div className="p-2.5 bg-amber-50 rounded-xl text-municipality-gold shrink-0">
                    <Clock size={16} />
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-extrabold text-xs text-slate-800 truncate">{appt.title || 'ملحوظة بدون عنوان'}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-0.5">{new Date(appt.appointmentDate!).toLocaleString('ar-KW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. RICH DRAWING SLATE AND DETAILS FOR BUILDER */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            className="bg-white rounded-[2rem] p-6 md:p-8 shadow-2xl border-2 border-municipality-gold/25 space-y-6"
          >
            {/* Form Toggle Tabs (Text / Draw / Preview) */}
            <div className="flex bg-slate-100 rounded-2xl p-1.5 gap-2 max-w-xl">
              <button
                type="button"
                onClick={() => setEditorTab('text')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2",
                  editorTab === 'text' 
                    ? "bg-white text-municipality-blue shadow-md" 
                    : "text-gray-500 hover:text-slate-800 hover:bg-white/40"
                )}
              >
                <FileEdit size={16} />
                كتابة وتنسيق التدوينة 📝
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('sketch')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2",
                  editorTab === 'sketch' 
                    ? "bg-white text-municipality-blue shadow-md" 
                    : "text-gray-500 hover:text-slate-800 hover:bg-white/40"
                )}
              >
                <Palette size={16} />
                لوحة كروكي ورسم هندسي 🎨📐
              </button>
              <button
                type="button"
                onClick={() => setEditorTab('preview')}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2",
                  editorTab === 'preview' 
                    ? "bg-white text-municipality-blue shadow-md" 
                    : "text-gray-500 hover:text-slate-800 hover:bg-white/40"
                )}
              >
                <Eye size={16} />
                معاينة مباشرة للملف المكتمل 👁️
              </button>
            </div>

            {/* TAB CONTENT 1: TEXT AND ATTRIBUTES COMPOSITION */}
            {editorTab === 'text' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Title */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-500 uppercase">عنوان الملحوظة / الموضوع</label>
                    <input 
                      type="text" 
                      placeholder="مثال: مخالفة إشغال طريق - شارع 10" 
                      className="municipal-input focus:ring-municipality-gold"
                      value={newNote.title}
                      onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    />
                  </div>

                  {/* Appointment Timing */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-500 uppercase">ميعاد المتابعة / ميتينج تذكيري (اختياري)</label>
                    <div className="relative">
                      <Clock className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input 
                        type="datetime-local" 
                        className="municipal-input pr-11 text-right focus:ring-municipality-gold"
                        value={newNote.appointmentDate}
                        onChange={e => setNewNote({ ...newNote, appointmentDate: e.target.value })}
                      />
                    </div>
                  </div>

                  {/* Note Color Selector */}
                  <div className="space-y-1.5 text-right">
                    <label className="text-xs font-black text-slate-500 uppercase">تخصيص لون الخلفية</label>
                    <div className="flex flex-wrap gap-2 pt-1.5">
                      {colors.map(c => (
                        <button 
                          key={c.class}
                          onClick={() => setNewNote({ ...newNote, color: c.class })}
                          className={cn(
                            "w-8 h-8 rounded-full border-2 transition-all shadow-sm",
                            c.class,
                            newNote.color === c.class ? "scale-110 border-slate-700 ring-4 ring-slate-200" : "border-gray-200/50"
                          )}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content & Photo upload rows */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  {/* Form input field - click to edit */}
                  <div className="lg:col-span-3 space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-black text-slate-500 uppercase">تدوين نص الملاحظة الميدانية ✍️</label>
                      <div className="flex gap-2 items-center text-gray-400">
                        <button onClick={() => setNewNote(p => ({...p, fontSize: Math.max(12, p.fontSize - 2)}))} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="تصغير الخط"><Minimize2 size={13}/></button>
                        <span className="text-[11px] font-black">{newNote.fontSize}px</span>
                        <button onClick={() => setNewNote(p => ({...p, fontSize: Math.min(30, p.fontSize + 2)}))} className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-colors" title="تكبير الخط"><Maximize2 size={13}/></button>
                      </div>
                    </div>
                    {/* Focus editable body */}
                    <textarea 
                      rows={6} 
                      placeholder="انقر هنا واكتب مذكرتك الميدانية أو التقرير، أو أسماء الحضور، وسيتم حفظ أي تدوينات تلقائياً..." 
                      className="municipal-input resize-none focus:ring-municipality-gold leading-relaxed p-4"
                      style={{ fontSize: `${newNote.fontSize}px` }}
                      value={newNote.content}
                      onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                    ></textarea>
                    <p className="text-[10px] text-gray-400 italic">ملاحظة: يمكنك النقر والكتابة بحرية كاملة بالداخل، التغييرات مخزنة محلياً بمرونة تامة.</p>
                  </div>

                  {/* Attachment Photo Upload */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-500 uppercase">إرفاق صورة فوتوغرافية 📸</label>
                    {newNote.image ? (
                      <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-100 aspect-video lg:aspect-square">
                        <img src={newNote.image} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => setNewNote(p => ({...p, image: ''}))}
                            className="bg-red-500 text-white p-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-all shadow-md"
                          >
                            حذف المرفق
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 transition-all cursor-pointer aspect-video lg:aspect-square text-gray-400">
                        <Camera size={38} className="text-gray-400 hover:scale-105 transition-transform" />
                        <span className="text-xs font-black text-slate-600 mt-2">انقر لرفع ملف صورة</span>
                        <span className="text-[9px] text-gray-400 mt-1">PNG, JPG من الاستوديو أو الكاميرا</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: ADVANCED DRAWING & INSPECTORS SIGNATURE CANVASES */}
            {editorTab === 'sketch' && (
              <div className="space-y-5 animate-fade-in">
                {/* Control options bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-gray-150 shadow-sm text-xs">
                  {/* Select brush mode */}
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-500">مظهر القلم:</span>
                    <div className="flex bg-white border rounded-xl p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => { setBrushStyle('normal'); setBrushSize(3); }}
                        className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all", brushStyle === 'normal' && brushColor !== '#FFFFFF' ? "bg-municipality-blue text-white" : "text-gray-500 hover:bg-slate-100")}
                      >
                        قلم دقيق 🖋️
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBrushStyle('marker'); setBrushSize(6); }}
                        className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all", brushStyle === 'marker' && brushColor !== '#FFFFFF' ? "bg-municipality-blue text-white" : "text-gray-500 hover:bg-slate-100")}
                      >
                        مخطط بارز 🖍️
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBrushStyle('calligraphy'); setBrushSize(5); }}
                        className={cn("px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all", brushStyle === 'calligraphy' && brushColor !== '#FFFFFF' ? "bg-municipality-blue text-white" : "text-gray-500 hover:bg-slate-100")}
                      >
                        خـط عريض 📐
                      </button>
                      <button
                        type="button"
                        onClick={() => { setBrushColor('#FFFFFF'); setBrushSize(15); }}
                        className={cn("px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition-all flex items-center gap-1", brushColor === '#FFFFFF' ? "bg-red-500 text-white" : "text-red-500 hover:bg-slate-100")}
                      >
                        <Eraser size={12} />
                        ممحاة 🧼
                      </button>
                    </div>
                  </div>

                  {/* Color Palettes */}
                  {brushColor !== '#FFFFFF' && (
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-500">لون الحبر:</span>
                      <div className="flex gap-1.5 items-center">
                        {paintColors.map(col => (
                          <button
                            type="button"
                            key={col.hex}
                            onClick={() => setBrushColor(col.hex)}
                            className={cn(
                              "w-6 h-6 rounded-md hover:scale-110 transition-transform shadow-sm relative",
                              brushColor === col.hex ? "ring-2 ring-offset-1 ring-slate-800" : ""
                            )}
                            style={{ backgroundColor: col.hex }}
                            title={col.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Guides template background */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">خلفية اللوحة:</span>
                    <select
                      value={paperGrid}
                      onChange={e => setPaperGrid(e.target.value as any)}
                      className="bg-white border text-[11px] font-bold rounded-lg p-1 text-slate-700"
                    >
                      <option value="white">لوحة بيضاء خالية ◽</option>
                      <option value="lined">ورق مسطر ناصع 📝</option>
                      <option value="grid">شبكة هندسية للمخططات 📐</option>
                    </select>
                  </div>

                  {/* Canvas Operations */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleUndo}
                      className="p-1.5 bg-white border rounded-lg hover:bg-slate-100 shadow-sm text-slate-600 flex items-center gap-1 font-bold"
                      title="تراجع عن الخطوة السابقة"
                    >
                      <Undo size={14} /> <span className="text-[10px]">تراجع</span>
                    </button>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      className="p-1.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-lg hover:bg-rose-100 shadow-sm flex items-center gap-1 font-bold"
                      title="تنظيف اللوحة ومسح الرسم"
                    >
                      <RefreshCcw size={13} /> <span className="text-[10px]">مسح الكل</span>
                    </button>
                  </div>
                </div>

                {/* Draw Canvas pad wrapper */}
                <div className="relative border border-slate-200 rounded-[1.5rem] overflow-hidden shadow-inner bg-slate-50 p-4">
                  <div className="absolute top-2.5 right-4 bg-slate-900/10 text-[9px] font-black text-slate-700/60 uppercase select-none pointer-events-none">
                    لوح كروكي التوقيع والرسم الميداني الذكي 🖊️
                  </div>

                  {/* Real Canvas element */}
                  <canvas
                    ref={canvasRef}
                    width={800}
                    height={400}
                    onMouseDown={startDraw}
                    onMouseMove={draw}
                    onMouseUp={stopDraw}
                    onMouseLeave={stopDraw}
                    onTouchStart={startDraw}
                    onTouchMove={draw}
                    onTouchEnd={stopDraw}
                    className="w-full h-[300px] md:h-[380px] cursor-crosshair border border-slate-200 rounded-xl shadow-sm transition-all bg-white"
                    style={{
                      backgroundImage: 
                        paperGrid === 'lined' 
                          ? 'linear-gradient(#eceef2 1px, transparent 1px)' 
                          : paperGrid === 'grid' 
                          ? 'linear-gradient(#e6edf2 1px, transparent 1px), linear-gradient(90deg, #e6edf2 1px, transparent 1px)' 
                          : 'none',
                      backgroundSize: paperGrid === 'lined' ? '100% 28px' : paperGrid === 'grid' ? '20px 20px' : 'auto'
                    }}
                  />

                  <div className="text-center pt-2 text-[10px] text-gray-400 font-bold">
                    💡 يمكنك الرسم والتوقيع بإصبعك على شاشات الموبايل أو الماوس. سيتم التقاط كروكي المخطط لربطه بالملف تلقائياً.
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: LIVE NOTE PREVIEW */}
            {editorTab === 'preview' && (
              <div className="space-y-4 animate-fade-in">
                <h4 className="text-xs font-black text-slate-500 uppercase">مستند الملاحظة كما يظهر بالخلاصة الرسمية:</h4>
                <div className="max-w-2xl mx-auto">
                  {/* Single Card preview */}
                  <div 
                    id="note-current-preview"
                    className={cn(
                      "rounded-[2rem] p-8 space-y-5 border-t-8 border-r border-l border-b border-gray-150/80 shadow-lg text-right relative",
                      newNote.color,
                      newNote.color === 'bg-white' ? "border-t-municipality-blue" :
                      newNote.color === 'bg-amber-100/90' ? "border-t-amber-400" :
                      newNote.color === 'bg-blue-100/90' ? "border-t-blue-400" :
                      newNote.color === 'bg-green-100/90' ? "border-t-green-400" : 
                      newNote.color === 'bg-rose-100/90' ? "border-t-rose-400" :
                      newNote.color === 'bg-purple-100/90' ? "border-t-purple-400" : "border-t-teal-400"
                    )}
                  >
                    <div className="flex justify-between items-start border-b border-slate-200/40 pb-3">
                      <div className="space-y-1">
                        <span className="text-[10px] bg-slate-900/10 px-2 py-0.5 rounded font-black text-slate-800">معاينة المستند 🩺</span>
                        <h4 className="font-black text-municipality-blue text-xl pt-1 leading-snug">{newNote.title || 'ملحوظة ميدانية جديدة'}</h4>
                      </div>
                      <span className="text-[11px] font-bold text-gray-500">{new Date().toLocaleDateString('ar-KW')}</span>
                    </div>

                    {/* Date limit */}
                    {newNote.appointmentDate && (
                      <div className="bg-slate-900/5 p-3 rounded-xl inline-flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Clock size={14} className="text-municipality-gold" /> ميعاد المتابعة: {new Date(newNote.appointmentDate).toLocaleString('ar-KW')}
                      </div>
                    )}

                    {/* Attached Photo */}
                    {newNote.image && (
                      <div className="rounded-xl overflow-hidden max-h-60 border border-slate-200">
                        <img src={newNote.image} className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Styled Drawing Sketch */}
                    {newNote.drawing && (
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-gray-400 uppercase">مخطط الكروكي الهندسي / التوقيع:</span>
                        <div 
                          className="rounded-2xl overflow-hidden border border-slate-200 max-h-64 flex items-center justify-center bg-white shadow-inner"
                          style={{
                            backgroundImage: 
                              paperGrid === 'lined' 
                                ? 'linear-gradient(#f1f5f9 1px, transparent 1px)' 
                                : paperGrid === 'grid' 
                                ? 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)' 
                                : 'none',
                            backgroundSize: paperGrid === 'lined' ? '100% 28px' : paperGrid === 'grid' ? '20px 20px' : 'auto'
                          }}
                        >
                          <img src={newNote.drawing} className="w-full h-auto max-h-64 object-contain" />
                        </div>
                      </div>
                    )}

                    {/* Message content text */}
                    <p 
                      className="text-slate-800 font-medium whitespace-pre-wrap leading-relaxed py-2"
                      style={{ fontSize: `${newNote.fontSize}px` }}
                    >
                      {newNote.content || 'لا توجد تدوينات نصية مكتوبة حالياً.'}
                    </p>

                    <div className="border-t border-slate-200/40 pt-4 flex justify-between text-[10px] text-gray-400 font-bold">
                      <span className="flex items-center gap-1"><Calendar size={12} className="text-municipality-gold" /> {new Date().toLocaleDateString('ar-KW')}</span>
                      <span>معاينة حية للملف</span>
                    </div>
                  </div>
                </div>

                {/* Separate export for current custom sketch */}
                <div className="flex justify-center pt-2">
                  <button 
                    type="button"
                    onClick={() => exportNoteAsImage('current-preview', 'live-draft')}
                    className="municipal-button-secondary py-2.5 px-6 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 focus:ring-2"
                  >
                    <Download size={15} />
                    تحميل هذه المعاينة كصورة كاملة PNG 📸
                  </button>
                </div>
              </div>
            )}

            {/* Footer Form Operations */}
            <div className="flex justify-between items-center pt-5 border-t border-slate-100">
              <button 
                type="button"
                onClick={handleCloseWithAutoSave} 
                className="municipal-button-secondary bg-transparent hover:bg-slate-150 border-none px-4 text-slate-500 font-semibold"
              >
                إلغاء التعديل
              </button>
              
              <button 
                type="button"
                onClick={handleSave} 
                className="municipal-button-primary py-3 px-10 rounded-xl leading-none font-black text-sm shadow-md hover:scale-101 focus:ring-2"
              >
                {activeNoteId ? "تحديث وتثبيت التغييرات بالحافظة ✓" : "حفظ الملحوظة والكروكي بالمفكرة 💾"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. NOTES AND SKETCHES DIRECTORY LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6.5">
        {notes.map(note => (
          <motion.div 
            layout
            key={note.id}
            id={`note-${note.id}`}
            onClick={() => handleEditNote(note)}
            className={cn(
              "rounded-[2rem] group flex flex-col min-h-[300px] shadow-sm hover:shadow-xl transition-all duration-300 relative cursor-pointer border-t-[10px] border",
              note.color,
              "hover:-translate-y-1 border-gray-150/80",
              note.color === 'bg-white' ? "border-t-municipality-blue" :
              note.color === 'bg-amber-100/90' ? "border-t-amber-400" :
              note.color === 'bg-blue-100/90' ? "border-t-blue-400" :
              note.color === 'bg-green-100/90' ? "border-t-green-400" : 
              note.color === 'bg-rose-100/90' ? "border-t-rose-400" :
              note.color === 'bg-purple-100/90' ? "border-t-purple-400" : "border-t-teal-400"
            )}
            title="انقر لتعديل نص التدوينة أو الرسم بالكامل!"
          >
            {/* Absolute hovering edit indicator overlay to make clickability hyper obvious */}
            <div className="absolute top-3.5 right-3.5 opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 backdrop-blur-[2px] text-[10px] text-slate-800 px-2.5 py-1 rounded-full font-black">
              انقر للكتابة والتعديل بالداخل 🖱️
            </div>

            <div className="p-6.5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 max-w-[70%]">
                    <h4 className="font-black text-municipality-blue text-base leading-tight truncate uppercase">{note.title || 'ملحوظة ميدانية'}</h4>
                    {note.appointmentDate && (
                      <div className="inline-flex items-center gap-1.5 bg-black/5 px-2 py-0.5 rounded text-[9px] font-black text-slate-700 uppercase">
                        <Clock size={11} className="text-municipality-gold" /> {new Date(note.appointmentDate).toLocaleString('ar-KW', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
                      </div>
                    )}
                  </div>

                  {/* Actions buttons */}
                  <div className="flex gap-1.5 print-hidden items-center animate-fade-in" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => exportNoteAsImage(note.id, 'municipal-note')}
                      className="p-1.5 bg-white/60 hover:bg-white rounded-lg text-municipality-blue shadow-sm transition-all hover:scale-105"
                      title="تحميل الملاحظة كصورة"
                    >
                      <Download size={14} />
                    </button>
                    {deletingId === note.id ? (
                      <div className="flex items-center gap-1 bg-white/90 px-1.5 py-1 rounded-lg border border-red-200">
                        <span className="text-[9px] font-black text-red-600">حذف؟</span>
                        <button 
                          onClick={() => {
                            onDelete(note.id);
                            setDeletingId(null);
                          }}
                          className="px-1.5 py-0.5 bg-red-600 hover:bg-red-700 text-white rounded text-[8px] font-black cursor-pointer"
                        >
                          نعم
                        </button>
                        <button 
                          onClick={() => setDeletingId(null)}
                          className="px-1.5 py-0.5 bg-gray-200 text-slate-700 rounded text-[8px] font-black cursor-pointer"
                        >
                          لا
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setDeletingId(note.id)}
                        className="p-1.5 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-lg text-rose-500 shadow-sm transition-all hover:scale-105"
                        title="حذف الملاحظة"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Drawing visualization thumbnail inside the note card */}
                {note.drawing && (
                  <div className="rounded-xl overflow-hidden border border-black/5 aspect-video bg-white relative flex items-center justify-center shadow-inner">
                    <img src={note.drawing} className="w-full h-full object-contain" />
                    <div className="absolute bottom-1 right-2 bg-slate-900/40 text-[8px] text-white px-1.5 rounded font-bold">كروكي 🎨</div>
                  </div>
                )}

                {/* Image upload preview */}
                {note.image && !note.drawing && (
                  <div className="rounded-xl overflow-hidden border border-black/5 shadow-sm max-h-36">
                    <img src={note.image} className="w-full h-auto object-cover max-h-36" />
                  </div>
                )}

                {/* Content text */}
                {note.content && (
                  <p 
                    className="text-gray-700 leading-relaxed font-semibold whitespace-pre-wrap break-words"
                    style={{ fontSize: note.fontSize ? `${note.fontSize}px` : '15px' }}
                  >
                    {note.content.length > 150 ? `${note.content.substring(0, 150)}...` : note.content}
                  </p>
                )}
              </div>

              {/* Bottom Card timestamp signature */}
              <div className="pt-3 border-t border-black/5 flex items-center justify-between text-[9px] font-black text-gray-400 bg-black/2">
                <span className="flex items-center gap-1 uppercase tracking-widest"><Calendar size={10} className="text-municipality-gold" /> {note.date}</span>
                <span className="uppercase tracking-widest">REF: {note.id.substring(0, 7)}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State warning */}
      {notes.length === 0 && !isAdding && (
         <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200 italic text-slate-400 font-bold">
           حافضة الملاحظات فارغة حالياً.. تفرغ لتدوين تقاريرك الميدانية ورسم المخططات من زر إضافة ملحوظة أعلاه.
         </div>
      )}
    </div>
  );
}
