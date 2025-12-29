import React from 'react';
import { X, MousePointer2 } from 'lucide-react';
import { Marker } from '../types';

interface ClusterSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  markers: Marker[]; // 在此聚合點中的所有標記列表
  onSelect: (marker: Marker) => void; // 選擇後的回呼函式
}

// --- 聚合標記選擇視窗 ---
// 當使用者點擊地圖上重疊的標記(聚合點)時，顯示此選單讓使用者選擇要查看哪一筆
const ClusterSelectModal: React.FC<ClusterSelectModalProps> = ({
  isOpen,
  onClose,
  markers,
  onSelect,
}) => {
  if (!isOpen) return null;

  // Fixed -> Absolute
  return (
    <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white/95 backdrop-blur-2xl border border-white/20 w-full max-w-xs rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* 標題與關閉按鈕 */}
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            {/* 顯示聚合數量 */}
            <div className="bg-yellow-400 border border-red-600 w-6 h-6 flex items-center justify-center font-bold rounded text-xs shadow-sm">
              {markers.length}
            </div>
            <h3 className="font-bold text-lg text-gray-800">選擇標記</h3>
          </div>
          <button onClick={onClose} className="p-1.5 bg-gray-200/50 rounded-full text-gray-500 hover:text-gray-800 hover:bg-gray-300/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* 標記列表 */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-2">
          {markers.map((marker) => (
            <button
              key={marker.id}
              onClick={() => onSelect(marker)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50/50 active:bg-blue-100/50 transition-colors border border-transparent hover:border-blue-100 shadow-sm bg-white/50 text-left group"
            >
              {/* 標記序號 */}
              <div className="bg-yellow-400 border border-red-600 w-8 h-8 flex-shrink-0 flex items-center justify-center font-bold rounded shadow-sm group-hover:scale-110 transition-transform">
                {marker.seq}
              </div>
              {/* 標記資訊摘要 */}
              <div className="flex-1 min-w-0">
                <div className="font-bold text-slate-800 truncate">
                   {marker.data.location || '無位置描述'}
                </div>
                <div className="text-xs text-slate-500 truncate">
                  {marker.data.floor}F {marker.data.isMezzanine ? '(夾層)' : ''} - {marker.data.surfaceType}
                </div>
              </div>
              <MousePointer2 className="text-slate-300 group-hover:text-blue-500 transition-colors" size={18} />
            </button>
          ))}
        </div>
        
        <div className="p-3 bg-gray-50/50 text-center text-xs text-slate-400 border-t border-gray-100">
            請選擇要查看或編輯的項目
        </div>
      </div>
    </div>
  );
};

export default ClusterSelectModal;