import React, { useState, useRef, useEffect } from 'react';
import { Camera, Save, Plus, X, User, MapPin, ClipboardList, PlusCircle, RotateCcw, Clock, Phone, PenTool } from 'lucide-react';
import { Complaint, ComplaintCategory, VehicleType, Settings } from '../types';
import { cn } from '../lib/utils';

interface SignaturePadProps {
  value?: string;
  onChange: (val: string) => void;
}

function SignaturePad({ value, onChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#020617';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      onChange(canvas.toDataURL('image/png'));
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase">
        <span className="flex items-center gap-1.5"><PenTool size={14} className="text-municipality-blue" /> توقيع الشاكي تفاعلياً</span>
        <button type="button" onClick={clear} className="text-[10px] text-red-500 font-bold hover:underline">مسح التوقيع</button>
      </div>
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl overflow-hidden relative">
        <canvas
          ref={canvasRef}
          width={400}
          height={100}
          className="w-full h-24 cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!value && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-[11px] text-gray-400 font-bold">
            وقع هنا بالماوس أو بالإصبع
          </div>
        )}
      </div>
    </div>
  );
}

interface ComplaintFormProps {
  onSave: (complaint: Complaint) => void;
  settings: Settings;
}

export default function ComplaintForm({ onSave, settings }: ComplaintFormProps) {
  const initialState = {
    date: new Date().toISOString().split('T')[0],
    category: ComplaintCategory.CLEANING,
    vehicle: VehicleType.CAR,
    details: '',
    inspectorName: settings.inspectors.find(i => i.id === settings.defaultInspectorId)?.name || settings.inspectors[0]?.name || '',
    centerName: settings.centers.find(c => c.id === settings.defaultCenterId)?.name || settings.centers[0]?.name || '',
    complainantName: '',
    complainantPhone: '',
    complainantSignature: '',
    images: [] as string[],
    status: 'pending' as 'pending' | 'done'
  };

  const [formData, setFormData] = useState(() => {
    try {
      const saved = localStorage.getItem('municipal_complaint_formData_draft');
      return saved ? { ...initialState, ...JSON.parse(saved) } : initialState;
    } catch {
      return initialState;
    }
  });
  const [previews, setPreviews] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('municipal_complaint_previews_draft');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Automatically save complaint form draft on input change
  useEffect(() => {
    localStorage.setItem('municipal_complaint_formData_draft', JSON.stringify(formData));
  }, [formData]);

  // Automatically save complaint previews draft on input change
  useEffect(() => {
    localStorage.setItem('municipal_complaint_previews_draft', JSON.stringify(previews));
  }, [previews]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      filesArray.forEach((file: File) => {
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
            const dataUrl = canvas.toDataURL('image/jpeg', 0.3); // Compress even more
            setFormData(prev => ({ ...prev, images: [...prev.images, dataUrl] }));
            setPreviews(prev => [...prev, dataUrl]);
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData(initialState);
    setPreviews([]);
    localStorage.removeItem('municipal_complaint_formData_draft');
    localStorage.removeItem('municipal_complaint_previews_draft');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.inspectorName || !formData.centerName) {
      alert('يرجى اختيار المفتش والمركز من قائمة الإعدادات أولاً');
      return;
    }
    const newComplaint: Complaint = {
      ...formData,
      id: crypto.randomUUID()
    };
    onSave(newComplaint);
    resetForm();
    alert('✅ تم حفظ الشكوى بنجاح بنظام بلدية دولة الكويت');
  };

  return (
    <div className="municipal-card max-w-4xl mx-auto shadow-2xl">
      <div className="bg-municipality-blue p-6 text-white border-b-4 border-municipality-gold">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-3">
            <PlusCircle size={28} className="text-municipality-gold" />
            تسجيل شكوى جديدة
          </h2>
          <button type="button" onClick={resetForm} className="text-white/50 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase font-bold">
            <RotateCcw size={14} /> مسح الكل
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">تاريخ الشكوى والإجراء</label>
            <input 
              type="date" 
              className="municipal-input focus:ring-municipality-gold" 
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">نوع الإجراء</label>
            <select 
              className="municipal-input focus:ring-municipality-gold"
              value={formData.category}
              onChange={e => setFormData({ ...formData, category: e.target.value as ComplaintCategory })}
            >
              {Object.values(ComplaintCategory).map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-500 uppercase">المركبة</label>
            <select 
              className="municipal-input focus:ring-municipality-gold"
              value={formData.vehicle}
              onChange={e => setFormData({ ...formData, vehicle: e.target.value as VehicleType })}
            >
              {Object.values(VehicleType).map(v => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase">
              <User size={14} /> المفتش المسؤول
            </label>
            <select 
              className="municipal-input focus:ring-municipality-gold"
              value={formData.inspectorName}
              onChange={e => setFormData({ ...formData, inspectorName: e.target.value })}
              required
            >
              <option value="">اختر المفتش...</option>
              <optgroup label="المراكز (Centers)">
                {settings.inspectors.filter(i => i.type === 'center').map(i => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))}
              </optgroup>
              <optgroup label="المجموعة م (Group M)">
                {settings.inspectors.filter(i => i.type === 'group_m').map(i => (
                  <option key={i.id} value={i.name}>{i.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase">
              <MapPin size={14} /> المركز الميداني
            </label>
            <select 
              className="municipal-input focus:ring-municipality-gold"
              value={formData.centerName}
              onChange={e => setFormData({ ...formData, centerName: e.target.value })}
              required
            >
              <option value="">اختر المركز...</option>
              <optgroup label="مراكز رئيسية">
                {settings.centers.filter(c => c.type === 'center').map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="المجموعة م">
                {settings.centers.filter(c => c.type === 'group_m').map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase">
              <Clock size={14} /> حالة المعاملة
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'pending' })}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all",
                  formData.status === 'pending' ? "bg-amber-500 text-white shadow-lg" : "bg-gray-50 text-gray-400 border border-gray-100"
                )}
              >
                قيد العمل
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, status: 'done' })}
                className={cn(
                  "flex-1 py-3 px-4 rounded-xl font-black text-xs transition-all",
                  formData.status === 'done' ? "bg-green-500 text-white shadow-lg" : "bg-gray-50 text-gray-400 border border-gray-100"
                )}
              >
                تم الإنجاز
              </button>
            </div>
          </div>
        </div>

        {/* Complainant Section */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-6">
          <h3 className="font-black text-sm text-municipality-blue border-r-4 border-municipality-gold pr-3">بيانات الشاكي</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase">
                <User size={14} className="text-municipality-blue" /> اسم المشتكي / صاحب العلاقة
              </label>
              <input 
                type="text" 
                placeholder="الاسم الثلاثي أو جهة البلاغ" 
                className="municipal-input bg-white focus:ring-municipality-gold"
                value={formData.complainantName}
                onChange={e => setFormData({ ...formData, complainantName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase">
                <Phone size={14} className="text-municipality-blue" /> رقم هاتف الشاكي
              </label>
              <input 
                type="tel" 
                placeholder="رقم الهاتف للشاكي" 
                className="municipal-input bg-white focus:ring-municipality-gold"
                value={formData.complainantPhone || ''}
                onChange={e => setFormData({ ...formData, complainantPhone: e.target.value })}
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-dashed border-amber-200 dark:border-amber-900/40 rounded-2xl p-4 flex flex-col justify-center items-center text-center">
              <span className="text-amber-600 dark:text-amber-400 font-black text-xs min-h-[40px] flex items-center justify-center">
                ✍️ يتم التوقيع يدوياً من قِبل الشاكي على المستند عند حفظه بعد الطباعة.
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase">
            <ClipboardList size={14} /> تفاصيل الشكوى
          </label>
          <textarea 
            rows={4} 
            placeholder="اكتب تفاصيل الشكوى، الموقع الجغرافي، والملاحظات الإجرائية بدقة..." 
            className="municipal-input focus:ring-municipality-gold resize-none"
            value={formData.details}
            onChange={e => setFormData({ ...formData, details: e.target.value })}
            required
          ></textarea>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-500 flex items-center gap-2 uppercase">
            <Camera size={14} /> صور للشكوى
          </label>
          <div className="flex flex-wrap gap-4">
             {previews.map((src, index) => (
                <div key={index} className="relative group w-32 h-32 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img src={src} alt="Evidence" className="w-full h-full object-cover" />
                  <button 
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            <label className="w-32 h-32 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors text-gray-400">
              <Plus size={24} />
              <span className="text-xs mt-2 uppercase font-bold">إضافة صورة</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button type="submit" className="municipal-button-primary hover:bg-municipality-gold group">
            <Save size={20} className="group-hover:scale-110 transition-transform" />
            تأريخ وحفظ المعاملة
          </button>
        </div>
      </form>
    </div>
  );
}
