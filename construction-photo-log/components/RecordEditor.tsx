import React, { useState, useEffect, useRef } from 'react';
import { Camera, Save, X, ChevronDown, Check } from 'lucide-react';
import { RecordItem, LocationData, WORK_ITEMS, FIRESTOP_WORK_ITEMS, ProjectType } from '../types';
import { formatLocationString } from '../utils/watermark';

/**
 * 紀錄編輯器元件 (新增/修改)
 * 介面風格：Glassmorphism 全螢幕覆蓋層
 */

interface Props {
  initialData?: RecordItem;         // 若有傳入此參數，表示為「編輯模式」
  lastRecord?: RecordItem;          // 上一筆紀錄 (用於新增模式時繼承資料)
  defaultValues?: Partial<RecordItem>; // 特殊預設值 (例如：新增施工後時，指定特定位置與工項)
  projectType: ProjectType;         // 專案類型，決定顯示哪種下拉選單
  prefilledDisplayId: string;       // 預填的顯示編號 (例如 "001")
  onSave: (record: RecordItem) => void; // 儲存回調
  onCancel: () => void;             // 取消/關閉回調
}

// 產生樓層選項清單
// B10~B1, 1~50, R1~R3
const FLOOR_OPTIONS = [
  ...Array.from({ length: 10 }, (_, i) => `B${10 - i}`), // B10 -> B1
  ...Array.from({ length: 50 }, (_, i) => `${i + 1}`),   // 1 -> 50
  ...Array.from({ length: 3 }, (_, i) => `R${i + 1}`)    // R1 -> R3
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
  
  // 決定使用哪個選項清單 (一般專案用)
  const currentWorkItems = WORK_ITEMS;
  const isFirestop = projectType === 'FIRESTOP';
  
  // 判斷是否為「新增施工後」模式 (即透過 defaultValues 指定了施工後)
  const isAddPostConstructionMode = defaultValues?.workItem === '施工後';

  // --- 狀態管理 ---
  // 圖片 (Base64) - 圖片不繼承，必須重拍
  const [image, setImage] = useState<string | null>(initialData?.originalImage || null);
  
  // 顯示編號 (不開放編輯，僅用於儲存)
  const [displayId] = useState<string>(initialData?.displayId || prefilledDisplayId);

  // 施工位置 (物件結構)
  // 優先順序: 編輯資料 > 特殊預設值(新增施工後) > 上一筆紀錄(繼承) > 預設空白
  const [location, setLocation] = useState<LocationData>(
    initialData?.location || 
    defaultValues?.location ||
    lastRecord?.location || 
    {
      building: '',
      floorStart: '',
      floorEnd: '',
      details: ''
    }
  );
  
  // 施工項目與自定義項目
  // 優先順序: 
  // 1. 編輯資料 (initialData)
  // 2. 特殊預設值 (defaultValues - 新增施工後)
  // 3. 上一筆紀錄 (lastRecord - 僅限一般專案繼承，防火填塞不繼承工項)
  // 4. 預設值 (防火填塞預設為「施工前」)
  const [workItem, setWorkItem] = useState<string>(
    initialData?.workItem || 
    defaultValues?.workItem ||
    (!isFirestop ? lastRecord?.workItem : undefined) || // 防火填塞不繼承上一筆的工項
    (isFirestop ? FIRESTOP_WORK_ITEMS[0] : WORK_ITEMS[0])
  );
  
  const [workItemCustom, setWorkItemCustom] = useState<string>(
    initialData?.workItemCustom || 
    defaultValues?.workItemCustom ||
    lastRecord?.workItemCustom || 
    ''
  );
  
  // 日期 (預設今天，不繼承，避免忘記改日期)
  const [date, setDate] = useState<string>(initialData?.date || new Date().toISOString().split('T')[0]);
  
  // 備註 (通常每張照片備註不同，暫不繼承)
  const [note, setNote] = useState<string>(initialData?.note || '');
  
  // 隱藏的檔案輸入框 Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 處理檔案選擇/拍照回傳
   * 將 File 物件轉為 Base64 字串以便儲存與預覽
   */
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

  /**
   * 處理儲存邏輯
   * 包含驗證 (必須有照片) 與資料組裝
   */
  const handleSave = () => {
    if (!image) {
      alert('請先拍攝照片');
      return;
    }

    const newRecord: RecordItem = {
      id: initialData?.id || Date.now().toString(), // 若是新增則用當下時間戳當 ID
      displayId: displayId, // 儲存顯示編號
      timestamp: initialData?.timestamp || Date.now(),
      originalImage: image,
      location,
      workItem,
      // 若選擇「其他」，則保存自定義輸入的內容
      workItemCustom: workItem === '其他' ? workItemCustom : undefined,
      date,
      note
    };
    onSave(newRecord);
  };

  const isEditing = !!initialData;
  const title = isEditing ? '編輯紀錄' : '新增紀錄';

  // 根據專案類型選擇背景色 (為了在白色背景上更清晰，這裡微調)
  const bgClass = isFirestop ? "bg-red-50/90" : "bg-white/90";

  return (
    // 外層容器
    <div className={`fixed inset-0 ${bgClass} backdrop-blur-2xl z-50 overflow-y-auto overflow-x-hidden flex flex-col animate-slideUp`}>
      {/* Header: 半透明頂部導航 */}
      <div className="bg-white/50 backdrop-blur-md border-b border-white/50 px-4 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-2">
           <h2 className="text-xl font-bold text-slate-800">{title}</h2>
           {/* 顯示目前編號 */}
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
                {/* 棟別輸入 */}
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
                
                {/* 樓層輸入 */}
                <div className="flex items-center bg-white/50 rounded-xl p-1 border border-white/60 shadow-sm focus-within:ring-2 focus-within:ring-cyan-200/50">
                    {/* 起始樓層 */}
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
                    
                    {/* 結束樓層 */}
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
            {/* 詳細位置 */}
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
              /* 防火填塞：左右按鈕選擇 */
              <div className="flex gap-4">
                <button 
                  onClick={() => !isAddPostConstructionMode && setWorkItem('施工前')}
                  disabled={isAddPostConstructionMode} // 如果是新增施工後模式，鎖定施工前按鈕
                  className={`flex-1 py-4 px-4 rounded-xl border font-bold transition-all relative overflow-hidden 
                    ${isAddPostConstructionMode 
                      ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed' // 反灰樣式
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
              /* 一般專案：下拉選單 */
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

            {/* 選擇「其他」時顯示的輸入框 */}
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

        {/* 儲存按鈕 */}
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