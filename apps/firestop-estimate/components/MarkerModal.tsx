import React, { useRef, useState, useEffect } from 'react';
import { X, Camera, Check, Trash2, AlertCircle } from 'lucide-react';
import { Marker, MarkerData } from '../types';

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeMarker: Partial<Marker> | null;
  formData: MarkerData;
  setFormData: React.Dispatch<React.SetStateAction<MarkerData>>;
  onSave: () => void;
  onDelete?: () => void; // 新增刪除 callback
  onPhotoCapture: (e: React.ChangeEvent<HTMLInputElement>) => void;
  FLOOR_OPTIONS: string[];
  NUMBER_OPTIONS: number[];
  isEditing?: boolean; // 判斷是新增還是編輯模式
}

// --- 標記資料編輯彈窗 ---
// 提供使用者輸入估價資料、拍攝照片的介面
const MarkerModal: React.FC<MarkerModalProps> = ({
  isOpen,
  onClose,
  activeMarker,
  formData,
  setFormData,
  onSave,
  onDelete,
  onPhotoCapture,
  FLOOR_OPTIONS,
  NUMBER_OPTIONS,
  isEditing = false,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 當彈窗關閉時重置刪除確認狀態
  useEffect(() => {
    if (!isOpen) setShowDeleteConfirm(false);
  }, [isOpen]);

  if (!isOpen) return null;

  const PIPES = [1, 2, 3, 4, 6];

  // 處理互斥按鈕邏輯
  const toggleIncomplete = () => {
    setFormData((prev) => ({
      ...prev,
      isIncomplete: !prev.isIncomplete,
      // 如果開啟了"不完整"，強制關閉"無防火帶"
      noFireBarrier: !prev.isIncomplete ? false : prev.noFireBarrier,
    }));
  };

  const toggleNoFireBarrier = () => {
    setFormData((prev) => ({
      ...prev,
      noFireBarrier: !prev.noFireBarrier,
      // 如果開啟了"無防火帶"，強制關閉"不完整"
      isIncomplete: !prev.noFireBarrier ? false : prev.isIncomplete,
    }));
  };

  // Fixed -> Absolute to keep inside app window
  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/20 w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300">
        
        {/* 標題列 */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 border border-red-600 w-8 h-8 flex items-center justify-center font-bold rounded text-sm shadow-sm">
              {activeMarker?.seq}
            </div>
            <h3 className="font-bold text-lg text-gray-800">{isEditing ? '編輯紀錄' : '新增紀錄'}</h3>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 bg-gray-100/50 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-200/50 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 內容區塊 */}
        <div className="p-5 space-y-5">
          {/* 拍照/預覽區塊 */}
          <div
            onClick={() => cameraInputRef.current?.click()}
            className={`w-full h-36 rounded-2xl flex items-center justify-center cursor-pointer border-2 transition-all ${
              formData.tempImage
                ? 'border-emerald-500/50 border-solid bg-emerald-50/50'
                : 'border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-100/50'
            }`}
          >
            {formData.tempImage ? (
              <div className="relative w-full h-full p-1">
                <img
                  src={URL.createObjectURL(formData.tempImage)}
                  className="w-full h-full object-contain rounded-xl shadow-sm"
                  alt="Captured"
                />
                <div className="absolute bottom-3 right-3 bg-emerald-600/90 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 font-bold shadow-md">
                  <Check size={14} strokeWidth={3} /> 已拍攝
                </div>
              </div>
            ) : (
              <div className="flex flex-row items-center justify-center gap-3 text-gray-400">
                <div className="bg-white p-3 rounded-full shadow-sm">
                  <Camera size={24} className="text-blue-500" />
                </div>
                <span className="font-bold text-gray-500">點擊開啟相機</span>
              </div>
            )}
            {/* 隱藏的檔案輸入框，支援相機 capture */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={onPhotoCapture}
            />
          </div>

          {/* 樓層與夾層設定 */}
          <div className="grid grid-cols-[1fr_auto] gap-4">
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1.5 ml-1">樓層</label>
              <select
                value={formData.floor}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none font-medium transition-all"
              >
                {FLOOR_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f}F
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1.5 ml-1">夾層</label>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, isMezzanine: !prev.isMezzanine }))}
                className={`h-[46px] px-6 rounded-xl border font-bold transition-all ${
                  formData.isMezzanine
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20'
                    : 'text-gray-500 border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                {formData.isMezzanine ? '是 (M)' : '否'}
              </button>
            </div>
          </div>

          {/* 位置描述輸入 */}
          <div>
            <label className="text-xs text-gray-500 font-bold block mb-1.5 ml-1">位置描述</label>
            <input
              type="text"
              placeholder="例如：主臥廁所"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-gray-400"
            />
          </div>

          {/* 金屬管數量選擇 */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-bold block ml-1">金屬管</span>
            <div className="grid grid-cols-5 gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              {PIPES.map((num) => (
                <div key={`metal-${num}`}>
                  <label className="text-[10px] text-center text-gray-400 font-bold block mb-1">{num}"</label>
                  <select
                    value={(formData as any)[`metal${num}`]}
                    onChange={(e) => setFormData({ ...formData, [`metal${num}`]: e.target.value })}
                    className="w-full border border-gray-200 p-1.5 rounded-lg bg-white text-sm text-center focus:border-blue-500 outline-none"
                  >
                    {NUMBER_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* PVC管數量選擇 */}
          <div className="space-y-2">
            <span className="text-xs text-gray-500 font-bold block ml-1">PVC管</span>
            <div className="grid grid-cols-5 gap-2 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
              {PIPES.map((num) => (
                <div key={`pvc-${num}`}>
                  <label className="text-[10px] text-center text-gray-400 font-bold block mb-1">{num}"</label>
                  <select
                    value={(formData as any)[`pvc${num}`]}
                    onChange={(e) => setFormData({ ...formData, [`pvc${num}`]: e.target.value })}
                    className="w-full border border-gray-200 p-1.5 rounded-lg bg-white text-sm text-center focus:border-blue-500 outline-none"
                  >
                    {NUMBER_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* 長寬輸入 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1.5 ml-1">長</label>
              <input
                type="number"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-bold block mb-1.5 ml-1">寬</label>
              <input
                type="number"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                className="w-full border border-gray-200 bg-gray-50/50 p-3 rounded-xl focus:ring-2 focus:ring-blue-500/50 outline-none"
              />
            </div>
          </div>

          {/* 施作面選擇 (四選一) */}
          <div>
            <label className="text-xs text-gray-500 font-bold block mb-1.5 ml-1">施作面</label>
            <div className="grid grid-cols-4 gap-2">
              {['單面', '雙面', '腳踩面', '倒吊面'].map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => setFormData({ ...formData, surfaceType: type })}
                  className={`py-3 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                    formData.surfaceType === type
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                      : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 不完整 / 無防火帶 互斥按鈕 */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <button
              type="button"
              onClick={toggleIncomplete}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                formData.isIncomplete
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              不完整
            </button>
            <button
              type="button"
              onClick={toggleNoFireBarrier}
              className={`py-3 rounded-xl font-bold text-sm transition-all border ${
                formData.noFireBarrier
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
              }`}
            >
              無防火帶
            </button>
          </div>

          {/* 底部按鈕 */}
          <div className="pt-2 pb-6 flex gap-3">
             {/* 刪除按鈕 (僅編輯模式顯示) - 兩段式確認 */}
             {isEditing && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (showDeleteConfirm) {
                    onDelete(); // 第二次點擊確認刪除
                  } else {
                    setShowDeleteConfirm(true); // 第一次點擊顯示確認
                    // 3秒後自動取消確認狀態
                    setTimeout(() => setShowDeleteConfirm(false), 3000);
                  }
                }}
                className={`px-5 py-4 rounded-xl font-bold text-lg shadow-sm border active:scale-95 transition-all flex items-center justify-center min-w-[72px] ${
                  showDeleteConfirm 
                    ? 'bg-red-600 text-white border-red-600 shadow-red-500/30' 
                    : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
                }`}
                title="刪除紀錄"
              >
                {showDeleteConfirm ? (
                  <span className="text-sm whitespace-nowrap px-1">確認?</span>
                ) : (
                  <Trash2 size={24} />
                )}
              </button>
            )}

            {/* 儲存按鈕 */}
            <button
              type="button"
              onClick={onSave}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/30 active:scale-95 transition hover:shadow-blue-500/40"
            >
              儲存並返回地圖
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkerModal;