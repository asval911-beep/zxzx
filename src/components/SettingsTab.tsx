import React, { useState } from 'react';
import { Users, Plus, Trash2, MapPin, Save, UserCheck } from 'lucide-react';
import { Settings } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

interface SettingsTabProps {
  settings: Settings;
  onUpdate: (settings: Settings) => void;
}

export default function SettingsTab({ settings, onUpdate }: SettingsTabProps) {
  const [newInspector, setNewInspector] = useState('');
  const [newInspectorType, setNewInspectorType] = useState<'group_m' | 'center'>('center');
  const [newCenter, setNewCenter] = useState('');
  const [newCenterType, setNewCenterType] = useState<'group_m' | 'center'>('center');

  const addInspector = () => {
    if (!newInspector.trim()) return;
    onUpdate({ 
      ...settings, 
      inspectors: [...settings.inspectors, { 
        id: crypto.randomUUID(), 
        name: newInspector.trim(), 
        type: newInspectorType 
      }] 
    });
    setNewInspector('');
  };

  const addCenter = () => {
    if (!newCenter.trim()) return;
    onUpdate({ 
      ...settings, 
      centers: [...settings.centers, { 
        id: crypto.randomUUID(), 
        name: newCenter.trim(), 
        type: newCenterType 
      }] 
    });
    setNewCenter('');
  };

  const removeInspector = (id: string) => {
    onUpdate({ 
      ...settings, 
      inspectors: settings.inspectors.filter(i => i.id !== id),
      defaultInspectorId: settings.defaultInspectorId === id ? undefined : settings.defaultInspectorId
    });
  };

  const removeCenter = (id: string) => {
    onUpdate({ 
      ...settings, 
      centers: settings.centers.filter(c => c.id !== id),
      defaultCenterId: settings.defaultCenterId === id ? undefined : settings.defaultCenterId
    });
  };

  const setDefaultInspector = (id: string) => {
    onUpdate({ ...settings, defaultInspectorId: id });
  };

  const setDefaultCenter = (id: string) => {
    onUpdate({ ...settings, defaultCenterId: id });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Inspectors Management */}
      <div className="municipal-card">
        <div className="bg-municipality-blue p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <h3 className="font-bold">إدارة قائمة المفتشين</h3>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded uppercase tracking-wider">Inspectors Management</span>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                className="municipal-input py-2 flex-1" 
                placeholder="إضافة اسم مفتش جديد..." 
                value={newInspector}
                onChange={e => setNewInspector(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addInspector()}
              />
              <button onClick={addInspector} className="p-3 bg-municipality-gold text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
                <Plus size={20} />
              </button>
            </div>
            
            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <span className="text-xs font-black text-gray-400 mr-2 uppercase tracking-tight">تصنيف المفتش:</span>
              <div className="flex gap-1 flex-1">
                <button 
                  onClick={() => setNewInspectorType('center')}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black transition-all",
                    newInspectorType === 'center' ? "bg-municipality-blue text-white shadow-md" : "text-gray-400 hover:bg-gray-200"
                  )}
                >
                  الـمـراكـز
                </button>
                <button 
                  onClick={() => setNewInspectorType('group_m')}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black transition-all",
                    newInspectorType === 'group_m' ? "bg-municipality-gold text-white shadow-md" : "text-gray-400 hover:bg-gray-200"
                  )}
                >
                  الـمـجـمـوعـة م
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {settings.inspectors.map((inspector, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                key={inspector.id} 
                className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 group shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shadow-inner",
                    inspector.type === 'center' ? "bg-blue-50 text-municipality-blue font-black" : "bg-amber-50 text-amber-700"
                  )}>
                    {inspector.type === 'center' ? 'C' : 'M'}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-municipality-blue">{inspector.name}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      inspector.type === 'center' ? "text-municipality-blue/60 dark:text-slate-350" : "text-amber-500"
                    )}>
                      {inspector.type === 'center' ? 'الـمـراكـز' : 'الـمـجـمـوعـة م'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setDefaultInspector(inspector.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      settings.defaultInspectorId === inspector.id ? "bg-municipality-gold text-white shadow-sm" : "text-gray-300 hover:bg-gray-100 hover:text-municipality-blue"
                    )}
                    title="تثبيت كافتراضي"
                  >
                    <UserCheck size={16} />
                  </button>
                  <button onClick={() => removeInspector(inspector.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
            {settings.inspectors.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                <Users size={48} className="mx-auto text-gray-100 mb-2" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">لا يوجد مفتشين حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Centers Management */}
      <div className="municipal-card">
        <div className="bg-municipality-blue p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <h3 className="font-bold">إدارة قائمة المراكز</h3>
          </div>
          <span className="text-[10px] font-black bg-white/10 px-2 py-1 rounded uppercase tracking-wider">Centers Management</span>
        </div>
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <input 
                type="text" 
                className="municipal-input py-2 flex-1" 
                placeholder="إضافة اسم مركز جديد..." 
                value={newCenter}
                onChange={e => setNewCenter(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && addCenter()}
              />
              <button onClick={addCenter} className="p-3 bg-municipality-gold text-white rounded-lg shadow-lg hover:scale-105 transition-transform">
                <Plus size={20} />
              </button>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl border border-gray-100">
              <span className="text-xs font-black text-gray-400 mr-2 uppercase tracking-tight">نوع المركز:</span>
              <div className="flex gap-1 flex-1">
                <button 
                  onClick={() => setNewCenterType('center')}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black transition-all",
                    newCenterType === 'center' ? "bg-municipality-blue text-white shadow-md" : "text-gray-400 hover:bg-gray-200"
                  )}
                >
                  رئـيـسـي
                </button>
                <button 
                  onClick={() => setNewCenterType('group_m')}
                  className={cn(
                    "flex-1 py-1.5 px-3 rounded-lg text-[10px] font-black transition-all",
                    newCenterType === 'group_m' ? "bg-municipality-gold text-white shadow-md" : "text-gray-400 hover:bg-gray-200"
                  )}
                >
                  الـمـجـمـوعـة م
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {settings.centers.map((center, i) => (
              <motion.div 
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                key={center.id} 
                className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 group shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shadow-inner",
                    center.type === 'center' ? "bg-amber-50 text-amber-750" : "bg-blue-50 text-municipality-blue font-black"
                  )}>
                    <MapPin size={14} />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-municipality-blue">{center.name}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest",
                      center.type === 'center' ? "text-amber-500" : "text-municipality-blue/60 dark:text-slate-350"
                    )}>
                      {center.type === 'center' ? 'مـركـز رئيـسـي' : 'الـمـجـمـوعـة م'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setDefaultCenter(center.id)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      settings.defaultCenterId === center.id ? "bg-municipality-gold text-white shadow-sm" : "text-gray-300 hover:bg-gray-100 hover:text-municipality-blue"
                    )}
                    title="تثبيت كافترضي"
                  >
                    <MapPin size={16} />
                  </button>
                  <button onClick={() => removeCenter(center.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
            {settings.centers.length === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl">
                <MapPin size={48} className="mx-auto text-gray-100 mb-2" />
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">لا يوجد مراكز حالياً</p>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
