import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, X, ChevronDown, Check } from 'lucide-react';
import { RecordItem, LocationData, WORK_ITEMS, FIRESTOP_WORK_ITEMS, ProjectType } from '../types';
import { formatLocationString } from '../utils/watermark';

/**
 * 紀錄編輯器元件
 */

interface Props {
  initialData?: RecordItem;
  lastRecord?: RecordItem;
  defaultValues?: Partial<RecordItem>;
  projectType: ProjectType;
  prefilledDisplayId: string;
  onSave: (record: RecordItem) => void;
  onCancel: () => void;
}

const FLOOR_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => `B${10 - i}`),
  ...Array.from({ length: 50 }, (_, i) => `${i + 1}`),
  ...Array.from({ length: 3 }, (_, i) => `R${i + 1}`)
];

const RecordEditor: React.FC<Props> = ({ 
  initialData, 
  lastRecord, 
  defaultValues, 
  projectType, 
  prefilledDisplayId,
  onSave, 
  onCancel, 
}) => {
  
  const currentWorkItems = WORK_ITEMS;
  const isFirestop = projectType === 'FIRESTOP';
  const isAddPostConstructionMode = defaultValues?.workItem === '施工後';

  const [image, setImage] = useState<string | null>(initialData?.originalImage || null);
  const [displayId] = useState<string>(initialData?.displayId || prefilledDisplayId);
  const [location, setLocation] = useState<LocationData>(
    initialData?.location || 
    defaultValues?.location ||
    lastRecord?.location || 
    { building: '', floorStart: '', floorEnd: '', details: '' }
  );
  
  const [workItem, setWorkItem] = useState<string>(
    initialData?.workItem || 
    defaultValues?.workItem ||
    (!isFirestop ? lastRecord?.workItem : undefined) || 
    (isFirestop ? FIRESTOP_WORK_ITEMS[0] : WORK_ITEMS[0])
  );
  
  const [workItemCustom, setWorkItemCustom] = useState<string>(
    initialData?.workItemCustom || 
    defaultValues?.workItemCustom ||
    lastRecord?.workItemCustom || 
    ''
  );
  
  const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>(initialData?.note || '');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!image) {
      alert('請先拍攝照片');
      return;
    }

    const newRecord: RecordItem = {
      id: initialData?.id || Date.now().toString(),
      displayId: displayId,
      timestamp: initialData?.timestamp || Date.now(),
      originalImage: image,
      location,
      workItem,
      workItemCustom: workItem === '其他' ? workItemCustom : undefined,
      date,
      note
    };
    onSave(newRecord);
  };

  const isEditing = !!initialData;
  const title = isEditing ? '編輯紀錄' : '新增紀錄';
  const bgClass = isFirestop ? "bg-red-50/95" : "bg-white/95";

  return (
    // Changed fixed inset-0 to absolute inset-0 to stay inside app window
    <div className={`absolute inset-0 ${bgClass} backdrop-blur-2xl z-50 overflow-y-auto overflow-x-hidden flex flex-col animate-slideUp`}>
      {/* Header */}
      <div className="bg-white/50 backdrop-blur-md border-b border-white/50 px-4 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
           <h2 className="text-xl font-bold text-slate-800">{title}</h2>
           <span className="bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded text-sm font-mono font-bold">
             #{displayId}
           </span>
        </div>
        <button onClick={onCancel} className="p-2 bg-slate-100/50 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/50 transition-colors">
          <X size={24} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-6 pb-24 max-w-lg mx-auto w-full">
        {/* 照片區塊 */}
        <div 
          className="w-full aspect-[4/3] bg-white/40 rounded-3xl border-2 border-dashed border-slate-300/60 flex flex-col items-center justify-center overflow-hidden relative cursor-pointer active:bg-white/60 transition-all shadow-inner group hover:border-cyan-400/50"
          onClick={() => fileInputRef.current?.click()}
        >
          {image ? (
            <img src={image} alt="Preview" className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-slate-400 group-hover:text-cyan-600 transition-colors">
              <div className="bg-white/60 p-4 rounded-full mb-3 inline-block shadow-sm">
                 <Camera size={40} className="opacity-80" />
              </div>
              <span className="text-lg font-medium block">點擊以拍照</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            capture="environment" 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        {/* 施工位置輸入區塊 */}
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-600 ml-1">施工位置</label>
            <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center bg-white/50 rounded-xl p-1 border border-white/60 shadow-sm focus-within:ring-2 focus-within:ring-cyan-200/50">
                    <input 
                      type="text" 
                      value={location.building}
                      onChange={(e) => setLocation({...location, building: e.target.value.toUpperCase()})}
                      className="w-16 p-2 bg-transparent text-center outline-none font-bold text-slate-800 placeholder:font-normal" 
                      placeholder="-" 
                    />
                    <span className="pr-3 text-slate-500 text-sm font-medium">棟</span>
                </div>
                
                <div className="flex items-center bg-white/50 rounded-xl p-1 border border-white/60 shadow-sm focus-within:ring-2 focus-within:ring-cyan-200/50">
                    <div className="relative">
                      <select 
                        value={location.floorStart}
                        onChange={(e) => setLocation({...location, floorStart: e.target.value})}
                        className="w-20 p-2 bg-transparent text-center outline-none font-bold text-slate-800 appearance-none pr-6" 
                      >
                        <option value="">-</option>
                        {FLOOR_OPTIONS.map(f => (
                          <option key={f} value={f}>{f}F</option>
                        ))}
                      </select>
                      {!location.floorStart && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">F</span>}
                    </div>
                    <span className="mx-1 text-slate-400">~</span>
                    <div className="relative">
                      <select 
                        value={location.floorEnd}
                        onChange={(e) => setLocation({...location, floorEnd: e.target.value})}
                        className="w-20 p-2 bg-transparent text-center outline-none font-bold text-slate-800 appearance-none pr-6" 
                      >
                         <option value="">-</option>
                        {FLOOR_OPTIONS.map(f => (
                          <option key={f} value={f}>{f}F</option>
                        ))}
                      </select>
                      {!location.floorEnd && <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">F</span>}
                    </div>
                </div>
            </div>
             <input 
                  type="text" 
                  value={location.details}
                  onChange={(e) => setLocation({...location, details: e.target.value})}
                  className="w-full mt-2 p-3 bg-white/50 border border-white/60 rounded-xl outline-none focus:ring-2 focus:ring-cyan-200/50 shadow-sm transition-all" 
                  placeholder="輸入詳細位置..." 
                />
            <p className="text-xs text-slate-400 ml-1">預覽: {formatLocationString(location) || '(未填寫)'}</p>
        </div>

        {/* 施工項目選擇區塊 */}
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-600 ml-1">施工項目</label>
            {isFirestop ? (
              <div className="flex gap-4">
                <button 
                  onClick={() => !isAddPostConstructionMode && setWorkItem('施工前')}
                  disabled={isAddPostConstructionMode}
                  className={`flex-1 py-4 px-4 rounded-xl border font-bold transition-all relative overflow-hidden 
                    ${isAddPostConstructionMode 
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                      : (workItem === '施工前' 
                          ? 'bg-cyan-600 border-cyan-600 text-white shadow-lg shadow-cyan-500/30 scale-[1.02]' 
                          : 'bg-white/50 border-white/60 text-slate-600 hover:bg-white/80'
                        )
                    }`}
                >
                  施工前
                  {workItem === '施工前' && !isAddPostConstructionMode && <div className="absolute right-2 top-2"><Check size={16} /></div>}
                </button>
                <button 
                  onClick={() => setWorkItem('施工後')}
                  className={`flex-1 py-4 px-4 rounded-xl border font-bold transition-all relative overflow-hidden ${workItem === '施工後' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]' : 'bg-white/50 border-white/60 text-slate-600 hover:bg-white/80'}`}
                >
                  施工後
                   {workItem === '施工後' && <div className="absolute right-2 top-2"><Check size={16} /></div>}
                </button>
              </div>
            ) : (
              <div className="relative">
                <select 
                  value={workItem} 
                  onChange={(e) => setWorkItem(e.target.value)}
                  className="w-full p-4 pr-10 border border-white/60 rounded-xl bg-white/50 appearance-none outline-none focus:ring-2 focus:ring-cyan-200/50 shadow-sm text-slate-800 font-medium transition-all"
                >
                  {currentWorkItems.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20}/>
              </div>
            )}

            {workItem === '其他' && (
               <input 
               type="text" 
               value={workItemCustom}
               onChange={(e) => setWorkItemCustom(e.target.value)}
               className="w-full p-4 border border-white/60 rounded-xl bg-white/50 mt-2 outline-none focus:ring-2 focus:ring-cyan-200/50 shadow-sm transition-all animate-fadeIn" 
               placeholder="請輸入其他施工項目" 
             />
            )}
        </div>

        {/* 日期選擇區塊 */}
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-600 ml-1">施工日期</label>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-4 border border-white/60 rounded-xl bg-white/50 outline-none focus:ring-2 focus:ring-cyan-200/50 shadow-sm text-slate-800 font-medium" 
            />
        </div>

        {/* 備註區塊 */}
        <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-600 ml-1">備註</label>
            <textarea 
               value={note}
               onChange={(e) => setNote(e.target.value)}
               className="w-full p-4 border border-white/60 rounded-xl bg-white/50 outline-none focus:ring-2 focus:ring-cyan-200/50 shadow-sm transition-all" 
               placeholder="輸入備註事項..."
               rows={3}
             />
        </div>

        <button 
          onClick={handleSave}
          className={`w-full text-white font-bold py-4 px-6 rounded-2xl text-lg mt-6 shadow-lg active:scale-[0.98] transition-all ${isFirestop ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-500/30' : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/30'}`}
        >
          儲存紀錄
        </button>

      </div>
    </div>
  );
};

export default RecordEditor;