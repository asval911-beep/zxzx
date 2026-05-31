import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, FileText, Download, Calendar, ArrowUpRight, ArrowDownLeft, X, Eye, FileSearch, ExternalLink } from 'lucide-react';
import { Correspondence } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CorrespondenceListProps {
  books: Correspondence[];
  onSave: (book: Correspondence) => void;
  onDelete: (id: string) => void;
}

// 1. Helper function to parse base64 string and extract original filename + mime-type
function parseFileString(fileStr: string) {
  if (!fileStr || !fileStr.startsWith('data:')) {
    return {
      dataUrl: fileStr || '',
      mimeType: 'application/octet-stream',
      name: 'مستند_مرفق',
      isPdf: false,
      isImage: false,
    };
  }

  // Extract Mime-Type
  const mimeMatch = fileStr.match(/^data:([^;]+)/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';

  // Extract custom name injected in uploader
  const nameMatch = fileStr.match(/;name=([^;]+)/);
  const name = nameMatch ? decodeURIComponent(nameMatch[1]) : 'مستند_مرفق';

  const isPdf = mimeType === 'application/pdf' || fileStr.includes('application/pdf');
  const isImage = mimeType.startsWith('image/');

  return {
    dataUrl: fileStr,
    mimeType,
    name,
    isPdf,
    isImage,
  };
}

// 2. Helper to safely generate same-origin Blob URLs for seamless iframe rendering & downloads
function getSafeObjectUrl(fileStr: string): { url: string; revoke: () => void } {
  try {
    if (!fileStr || !fileStr.startsWith('data:')) {
      return { url: fileStr, revoke: () => {} };
    }
    const parts = fileStr.split(';base64,');
    if (parts.length < 2) {
      return { url: fileStr, revoke: () => {} };
    }
    const header = parts[0];
    const base64Data = parts[1];
    
    // Extract mime type
    const mimeMatch = header.match(/^data:([^;]+)/);
    const contentType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    
    // Decode base64
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: contentType });
    const url = URL.createObjectURL(blob);
    return {
      url,
      revoke: () => URL.revokeObjectURL(url)
    };
  } catch (e) {
    console.error("Failed to generate Blob Object URL:", e);
    return { url: fileStr, revoke: () => {} };
  }
}

export default function CorrespondenceList({ books, onSave, onDelete }: CorrespondenceListProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'incoming' as 'incoming' | 'outgoing',
    date: new Date().toISOString().split('T')[0],
    files: [] as string[]
  });

  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Active preview object containing detailed information
  const [activePreview, setActivePreview] = useState<{
    dataUrl: string;
    objectUrl: string;
    name: string;
    mimeType: string;
    isPdf: boolean;
    isImage: boolean;
    revoke: () => void;
    bookTitle?: string;
    bookType?: 'incoming' | 'outgoing';
  } | null>(null);

  // Clean up object URLs on unmount to prevent leaks
  useEffect(() => {
    return () => {
      if (activePreview) {
        activePreview.revoke();
      }
    };
  }, [activePreview]);

  const handleOpenPreview = (fileStr: string, bookTitle?: string, bookType?: 'incoming' | 'outgoing') => {
    if (activePreview) {
      activePreview.revoke();
    }
    const parsed = parseFileString(fileStr);
    const safeObj = getSafeObjectUrl(parsed.dataUrl);
    
    setActivePreview({
      dataUrl: parsed.dataUrl,
      objectUrl: safeObj.url,
      name: parsed.name,
      mimeType: parsed.mimeType,
      isPdf: parsed.isPdf,
      isImage: parsed.isImage,
      revoke: safeObj.revoke,
      bookTitle,
      bookType
    });
  };

  const handleClosePreview = () => {
    if (activePreview) {
      activePreview.revoke();
    }
    setActivePreview(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
     if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const resultStr = reader.result as string;
          // Inject actual filename into the base64 URL dynamically so that it resists refreshes
          const nameParam = `;name=${encodeURIComponent(file.name)}`;
          const modifiedStr = resultStr.replace(';base64,', `${nameParam};base64,`);
          setFormData(prev => ({ ...prev, files: [...prev.files, modifiedStr] }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, id: crypto.randomUUID() });
    setFormData({
      title: '',
      description: '',
      type: 'incoming',
      date: new Date().toISOString().split('T')[0],
      files: []
    });
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
         <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-municipality-gold" />
            أرشيف الصادر والوارد
         </h2>
         <button 
          onClick={() => setIsAdding(!isAdding)}
          className="municipal-button-primary bg-municipality-blue"
         >
           {isAdding ? 'إغلاق النموذج' : <><Plus size={20} /> إضافة معاملة / كتاب</>}
         </button>
      </div>

      {isAdding && (
         <div className="municipal-card">
            <div className="bg-municipality-blue p-4 text-white font-bold">تسجيل كتاب رسمي جديد</div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">عنوان الكتاب / المعاملة</label>
                  <input 
                    type="text" 
                    className="municipal-input" 
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">تاريخ المعاملة</label>
                  <input 
                    type="date" 
                    className="municipal-input" 
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                  <label className="text-sm font-bold">جهة الكتاب</label>
                  <div className="flex gap-4">
                     <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'incoming'})}
                      className={cn(
                        "flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 font-bold",
                        formData.type === 'incoming' ? "bg-green-50 border-green-600 text-green-700" : "bg-white border-gray-200 text-gray-400"
                      )}
                     >
                       <ArrowDownLeft size={20} /> وارد
                     </button>
                     <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'outgoing'})}
                      className={cn(
                        "flex-1 p-3 rounded-lg border-2 flex items-center justify-center gap-2 font-bold",
                        formData.type === 'outgoing' ? "bg-blue-50/50 border-municipality-blue text-municipality-blue" : "bg-white border-gray-200 text-gray-400"
                      )}
                     >
                        صادر <ArrowUpRight size={20} />
                     </button>
                  </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">ملاحظات / وصف</label>
                <textarea 
                  className="municipal-input" 
                  rows={2} 
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold">إرفاق المستندات الرسمية (كافة أنواع الملفات: صور، PDF، ملفات وورد Word، إكسل Excel، وغيرها)</label>
                <input 
                  type="file" 
                  multiple 
                  className="municipal-input" 
                  onChange={handleFileUpload}
                  accept="*"
                />
                <p className="text-[11px] text-gray-400 font-bold">يمكنك اختيار ملفات متعددة بأي صيغة كانت، وسيحتفظ النظام بأسمائها الأصلية.</p>

                {formData.files.length > 0 && (
                  <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <p className="text-xs font-black text-slate-700 dark:text-gray-300">المستندات المختارة للتنزيل/الحفظ ({formData.files.length}):</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.files.map((fileStr, idx) => {
                        const parsed = parseFileString(fileStr);
                        return (
                          <div key={idx} className="flex items-center gap-2 bg-amber-50 dark:bg-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                            {parsed.isPdf ? (
                              <FileText size={14} className="text-red-500 shrink-0" />
                            ) : parsed.isImage ? (
                              <Eye size={14} className="text-emerald-500 shrink-0" />
                            ) : (
                              <FileSearch size={14} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
                            )}
                            <span className="font-extrabold text-slate-900 dark:text-gray-100 truncate max-w-[150px]" title={parsed.name}>
                              {parsed.name}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  files: prev.files.filter((_, fIdx) => fIdx !== idx)
                                }));
                              }}
                              className="text-red-500 hover:text-red-700 mr-1 cursor-pointer font-black text-sm"
                              title="إزالة الملف"
                            >
                              ×
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end pt-4">
                 <button type="submit" className="municipal-button-primary">حفظ المعاملة</button>
              </div>
            </form>
         </div>
      )}

      {/* Beautiful Arabized Custom Non-blocking Preview Modal */}
      <AnimatePresence>
        {activePreview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs"
              onClick={handleClosePreview}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative max-w-4xl w-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-150 dark:border-slate-800"
              dir="rtl"
            >
              <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-gray-50 dark:bg-slate-950">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <FileSearch size={18} className="text-municipality-gold shrink-0 animate-pulse" /> 
                  
                  {activePreview.bookTitle && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-xs text-slate-500 dark:text-slate-400">الكتاب/المعاملة:</span>
                      <span className="text-blue-900 bg-blue-100 border border-blue-300 dark:text-blue-200 dark:bg-blue-950/40 dark:border-blue-900 px-2.5 py-1 rounded-lg text-xs font-black inline-block truncate max-w-[200px] sm:max-w-[320px]" title={activePreview.bookTitle}>
                        {activePreview.bookTitle}
                      </span>
                      <span className="text-gray-300 dark:text-slate-700 font-bold">|</span>
                    </div>
                  )}

                  <span className="font-extrabold text-xs text-slate-500 dark:text-slate-400 font-bold">الملف المعاين:</span>
                  <span className="text-slate-900 bg-amber-100 border border-amber-300 dark:text-amber-250 dark:bg-amber-950/40 dark:border-amber-900/50 px-2.5 py-1 rounded-lg text-xs font-black inline-block truncate max-w-[180px] sm:max-w-[320px]" title={activePreview.name}>
                    {activePreview.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                  {/* Escape hatch button: Open in new window */}
                  {(activePreview.isPdf || activePreview.isImage) && (
                    <button
                      type="button"
                      onClick={() => {
                        window.open(activePreview.objectUrl, '_blank');
                      }}
                      className="flex items-center gap-1.5 bg-municipality-gold hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-black shadow transition-all cursor-pointer"
                    >
                      <ExternalLink size={13} />
                      فتح في نافذة مستقلة ↗
                    </button>
                  )}
                  {/* Direct download button inside the preview */}
                  <a
                    href={activePreview.objectUrl}
                    download={activePreview.name}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-xl text-[11px] font-black shadow transition-all cursor-pointer"
                  >
                    <Download size={13} />
                    تحميل الملف
                  </a>
                  
                  <button onClick={handleClosePreview} className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors font-bold text-slate-400 dark:text-gray-500 cursor-pointer">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 max-h-[75vh] overflow-y-auto flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
                {activePreview.isPdf ? (
                  <div className="w-full flex flex-col items-center gap-3">
                    {/* Added helpful status instructions to avoid iframe loading delays in certain browser setups */}
                    <div className="w-full text-center bg-yellow-50 dark:bg-amber-950/20 text-yellow-800 dark:text-amber-200 border border-yellow-250 dark:border-amber-900/40 p-2.5 rounded-xl text-[11px] font-bold leading-relaxed mb-0.5">
                      💡 في حال واجهت أي تأخر في التحميل بالمتصفح، يمكنك الضغط على زر <span className="underline font-black">"فتح في نافذة مستقلة ↗"</span> المتاح بالأعلى لاستعراض الكتاب مباشرة بمتصفحك الخاص، أو تنزيله بالكامل.
                    </div>
                    <iframe 
                      src={activePreview.objectUrl} 
                      className="w-full h-[55vh] rounded-xl border border-slate-200 dark:border-slate-800 bg-white" 
                      title="PDF Preview"
                    />
                  </div>
                ) : activePreview.isImage ? (
                  <img 
                    src={activePreview.objectUrl} 
                    className="max-w-full h-auto max-h-[60vh] object-contain rounded-xl shadow-md border border-slate-200 dark:border-slate-800" 
                    alt="Preview" 
                  />
                ) : (
                  // Elegant visual representation for un-previewable files like .docx, .xlsx, .zip
                  <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center text-center space-y-5 shadow-sm">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-municipality-gold animate-bounce">
                      <FileText size={36} className="stroke-[2.5]" />
                    </div>
                    <div className="w-full">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white mb-2 leading-snug truncate max-w-full bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">{activePreview.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-gray-400 font-bold">صيغة الملف: <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-cyan-400 font-extrabold">{activePreview.mimeType}</span></p>
                    </div>
                    <div className="w-full h-[1px] bg-gray-100 dark:bg-slate-800"></div>
                    <p className="text-xs text-slate-600 dark:text-gray-300 font-extrabold leading-relaxed text-center">
                      هذا النوع من المرفقات لا يدعم المعاينة الفورية المستقلة بالمتصفح (كقرارات الوورد Word، جداول الإكسل Excel، أو الأرشيفات المضغوطة).
                      <br/>
                      بإمكانك تنزيل المعاملة فوراً بالأسفل لفتحها عبر تطبيقاتك المثبتة بجهازك.
                    </p>
                    <a
                      href={activePreview.objectUrl}
                      download={activePreview.name}
                      className="w-full py-3 px-6 bg-municipality-blue hover:bg-[#163f69] text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Download size={18} />
                      تنزيل المعاملة الرسمية وإستعراضها
                    </a>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {books.map(book => (
          <div key={book.id} className="municipal-card flex overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className={cn(
              "w-2.5 shrink-0",
              book.type === 'incoming' ? "bg-green-500" : "bg-[#0e2c4d]"
            )} />
            <div className="p-6 flex-1 bg-white dark:bg-[#0e2c4d]">
              <div className="flex justify-between items-start mb-3 bg-white dark:bg-[#0e2c4d]">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-950 dark:text-slate-100 leading-tight block">{book.title}</h3>
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="flex items-center gap-1 font-bold"><Calendar size={12} /> {book.date}</span>
                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full font-black text-[10px]",
                      book.type === 'incoming' 
                        ? "bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300" 
                        : "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300"
                    )}>
                      {book.type === 'incoming' ? 'وارد' : 'صادر'}
                    </span>
                  </div>
                </div>
                {deletingId === book.id ? (
                  <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-950/20 px-2 py-1 rounded-lg border border-red-100 dark:border-red-900/40">
                    <span className="text-xs font-black text-red-600 dark:text-red-400">حذف؟</span>
                    <button 
                      onClick={() => {
                        onDelete(book.id);
                        setDeletingId(null);
                      }}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-black cursor-pointer align-middle"
                    >
                      نعم
                    </button>
                    <button 
                      onClick={() => setDeletingId(null)}
                      className="px-2 py-1 bg-gray-200 dark:bg-slate-800 text-slate-700 dark:text-gray-300 rounded text-[10px] font-black cursor-pointer align-middle"
                    >
                      لا
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => setDeletingId(book.id)}
                    className="text-red-300 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              <p className="text-sm text-slate-700 dark:text-gray-300 mb-4 font-semibold break-words whitespace-pre-line">{book.description}</p>

              {book.files && book.files.length > 0 && (
                <div className="flex flex-col gap-2 mt-2">
                  <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold select-none">المستندات والمرفقات الرسمية ({book.files.length}):</span>
                  <div className="flex flex-wrap gap-2">
                    {book.files.map((f, i) => {
                      const parsed = parseFileString(f);
                      return (
                        <div key={i} className="flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 transition-all text-right w-full sm:w-auto max-w-full">
                          <div className="flex items-center gap-2 overflow-hidden shrink min-w-0">
                            <span className="shrink-0">
                              {parsed.isPdf ? (
                                <FileText size={16} className="text-red-500" />
                              ) : parsed.isImage ? (
                                <Eye size={16} className="text-emerald-500" />
                              ) : (
                                <FileSearch size={16} className="text-indigo-600 dark:text-cyan-400" />
                              )}
                            </span>
                            <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[180px] select-none block" title={parsed.name}>
                              {parsed.name}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 shrink-0 mr-auto">
                            {/* Eye button to open fully integrated responsive preview overlay */}
                            <button 
                              onClick={() => handleOpenPreview(f, book.title, book.type)}
                              className="p-1.5 bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 rounded-lg transition-colors cursor-pointer"
                              title="عرض ومعاينة الملف"
                            >
                              <Eye size={15} />
                            </button>
                            {/* Direct download with actual captured file name */}
                            <button 
                              onClick={() => {
                                const safeObj = getSafeObjectUrl(f);
                                const link = document.createElement('a');
                                link.href = safeObj.url;
                                link.download = parsed.name; // Preserved native original file name!
                                link.click();
                                setTimeout(() => {
                                  safeObj.revoke();
                                }, 1500);
                              }}
                              className="p-1.5 bg-emerald-50 dark:bg-emerald-950 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-lg transition-colors cursor-pointer"
                              title="تحميل الملف"
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {books.length === 0 && !isAdding && (
        <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-100">
           <FileText size={48} className="mx-auto text-gray-200 mb-4" />
           <p className="text-gray-400">سجل الصادر والوارد فارغ حالياً</p>
        </div>
      )}
    </div>
  );
}
