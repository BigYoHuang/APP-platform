import React, { useRef, useState } from 'react';
import { ImageIcon, X, FolderOpen, Loader2 } from 'lucide-react';
import { ProjectInfo, FloorPlan } from '../types';

interface SetupScreenProps {
  projectInfo: ProjectInfo;
  setProjectInfo: React.Dispatch<React.SetStateAction<ProjectInfo>>;
  onFileUpload: (newPlans: FloorPlan[]) => void; // 更新型別定義
  onUpdatePlanName: (idx: number, name: string) => void;
  onRemovePlan: (idx: number) => void;
  onStart: () => void;
  onReset: () => void;
  onLoadProject: (file: File) => void;
  isZipLoaded: boolean;
  isPDFLoaded: boolean; // 傳入 PDF 載入狀態
}

// --- 設定頁面元件 ---
// 這是應用程式的第一個畫面，讓使用者輸入專案名稱並上傳平面圖
const SetupScreen: React.FC<SetupScreenProps> = ({
  projectInfo,
  setProjectInfo,
  onFileUpload,
  onUpdatePlanName,
  onRemovePlan,
  onStart,
  onReset,
  onLoadProject,
  isZipLoaded,
  isPDFLoaded,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false); // PDF 處理中狀態

  // 處理檔案上傳 (圖片或 PDF)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files: File[] = Array.from(fileList);
    const newPlans: FloorPlan[] = [];
    setIsProcessing(true);

    try {
      for (const file of files) {
        if (file.type === 'application/pdf') {
          // --- 處理 PDF 檔案 ---
          if (!isPDFLoaded || !window.pdfjsLib) {
            alert('PDF 模組尚未載入，請稍後再試');
            continue;
          }

          try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await window.pdfjsLib.getDocument(arrayBuffer).promise;
            
            // 遍歷每一頁
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              // 設定 2倍縮放，確保轉出的圖片夠清晰
              const scale = 2.0; 
              const viewport = page.getViewport({ scale });
              
              // 建立 Canvas 進行繪製
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              if (context) {
                await page.render({
                  canvasContext: context,
                  viewport: viewport,
                }).promise;

                // Canvas 轉 Blob
                const blob = await new Promise<Blob | null>((resolve) => 
                  canvas.toBlob(resolve, 'image/jpeg', 0.9)
                );

                if (blob) {
                  // 將 Blob 轉為 File 物件
                  const imgFile = new File([blob], `${file.name}_Page${i}.jpg`, { type: 'image/jpeg' });
                  newPlans.push({
                    id: Date.now() + Math.random(),
                    name: `${file.name.replace('.pdf', '')}_P${i}`,
                    file: imgFile,
                    src: URL.createObjectURL(imgFile),
                  });
                }
              }
            }
          } catch (err) {
            console.error('Error parsing PDF:', err);
            alert(`無法讀取 PDF 檔案: ${file.name}`);
          }

        } else if (file.type.startsWith('image/')) {
          // --- 處理一般圖片 ---
          newPlans.push({
            id: Date.now() + Math.random(),
            name: file.name.replace(/\.[^/.]+$/, ''),
            file: file,
            src: URL.createObjectURL(file),
          });
        }
      }

      // 透過 callback 更新狀態
      if (newPlans.length > 0) {
        onFileUpload(newPlans);
      }

    } catch (e) {
      console.error(e);
      alert('檔案處理發生錯誤');
    } finally {
      setIsProcessing(false);
      // 清空 input 讓同檔名可再次選取
      e.target.value = '';
    }
  };

  // min-h-screen -> h-full overflow-y-auto to allow scrolling inside the absolute container
  // Updated Styles for Liquid Glass Effect
  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-slate-100 to-slate-200 p-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-white/60 backdrop-blur-xl border border-white/40 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] p-6 space-y-6 relative">
        
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 drop-shadow-sm">防火填塞估價</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">建立新專案 或 開啟舊專案</p>
        </div>

        {/* 開啟舊專案按鈕 */}
        <div className="pb-4 border-b border-white/30">
          <button
            onClick={() => projectInputRef.current?.click()}
            disabled={!isZipLoaded}
            className="w-full flex items-center justify-center gap-2 bg-white/50 border border-white/60 text-slate-700 py-3 rounded-xl font-bold hover:bg-white/80 transition disabled:opacity-50 shadow-sm"
          >
            <FolderOpen size={20} className="text-slate-600" />
            <span>開啟專案檔 (.siteproj)</span>
          </button>
          <input
            ref={projectInputRef}
            type="file"
            accept=".siteproj,.zip" 
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onLoadProject(file);
              e.target.value = '';
            }}
          />
        </div>

        {/* 專案名稱輸入框 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">專案名稱 (新專案)</label>
          <input
            type="text"
            className="w-full border border-white/30 bg-white/40 p-3 rounded-xl focus:ring-2 focus:ring-blue-400/50 focus:bg-white/60 outline-none transition-all shadow-inner placeholder:text-slate-400"
            placeholder="例如：XX建案_B棟"
            value={projectInfo.name}
            onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
          />
        </div>

        {/* 檔案上傳區塊 */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">匯入平面圖</label>
          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition group ${
               isProcessing 
                 ? 'border-gray-300 bg-gray-50/50 cursor-wait' 
                 : 'border-slate-300/60 hover:bg-blue-50/30 hover:border-blue-300/60 bg-white/30'
            }`}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center py-2">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                <span className="text-sm text-slate-500 font-bold">正在處理檔案...</span>
              </div>
            ) : (
              <>
                <div className="bg-white/60 p-3 rounded-full mb-2 group-hover:bg-white group-hover:shadow-md transition">
                  <ImageIcon className="w-6 h-6 text-slate-500 group-hover:text-blue-500" />
                </div>
                <span className="text-sm font-medium text-slate-600">點擊上傳 JPG/PNG/PDF</span>
                <span className="text-xs text-slate-400 mt-1">PDF將自動轉換為圖片</span>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf" // 增加 PDF 支援
              className="hidden"
              onChange={handleFileChange}
              disabled={isProcessing}
            />
          </div>
        </div>

        {/* 已上傳平面圖列表 */}
        <div className="space-y-3 max-h-60 overflow-y-auto px-1">
          {projectInfo.floorPlans.map((plan, idx) => (
            <div key={plan.id} className="flex items-center bg-white/50 border border-white/50 p-2 rounded-xl shadow-sm">
              <div className="w-10 h-10 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0 mr-3 shadow-inner">
                <img src={plan.src} className="w-full h-full object-cover" alt="preview" />
              </div>
              <div className="flex-1">
                <input
                  value={plan.name}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => onUpdatePlanName(idx, e.target.value)}
                  className="w-full text-sm font-medium text-slate-800 border-b border-transparent focus:border-blue-400 outline-none bg-transparent"
                  placeholder="輸入圖說名稱"
                />
              </div>
              <button onClick={() => onRemovePlan(idx)} className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                <X size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* 開始按鈕 */}
        <button
          onClick={onStart}
          disabled={!projectInfo.name || projectInfo.floorPlans.length === 0 || isProcessing}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3.5 rounded-xl font-bold hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.98] transition disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
        >
          開始作業 / 儲存設定
        </button>
      </div>
    </div>
  );
};

export default SetupScreen;