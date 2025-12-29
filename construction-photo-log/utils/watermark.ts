import { RecordItem, ProjectData, LocationData } from '../types';

/**
 * 格式化施工位置字串
 * 邏輯：組合 棟、樓層(起始~結束)、詳細位置
 */
export const formatLocationString = (loc: LocationData): string => {
  let parts = [];
  if (loc.building) parts.push(`${loc.building}棟`);
  
  let floorStr = '';
  if (loc.floorStart) {
    floorStr += `${loc.floorStart}F`;
    if (loc.floorEnd) {
      floorStr += `~${loc.floorEnd}F`;
    }
  } else if (loc.floorEnd) {
    floorStr += `${loc.floorEnd}F`;
  }
  if (floorStr) parts.push(floorStr);
  
  if (loc.details) parts.push(loc.details);
  
  return parts.join(' ');
};

/**
 * 生成帶有浮水印的圖片
 * 使用 HTML5 Canvas 進行繪圖
 * 
 * @param base64Image 原始圖片 Base64
 * @param record 紀錄資料(用於文字內容)
 * @param projectName 案場名稱
 * @returns Promise<string> 完成浮水印的圖片 Base64
 */
export const generateWatermark = async (
  base64Image: string,
  record: RecordItem,
  projectName: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // 圖片載入完成後開始繪製
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject('No context');
        return;
      }

      // 設定 Canvas 大小與原圖一致，確保解析度不流失
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. 繪製原始圖片
      ctx.drawImage(img, 0, 0);

      // --- 浮水印設定與計算 ---
      // 根據需求：將浮水印高度縮小為原本的 2/3，寬度縮小為 3/4
      
      // 計算基準縮放比例 (以寬度 1000px 為基準)
      const scaleFactor = canvas.width / 1000;
      
      // 設定字體大小與間距
      // 舊設定 (Base): Font 24, Padding 20, Cell 10
      // 新設定 (Target): Font 16 (~2/3), Padding 12, Cell 6
      const fontSize = Math.max(12, Math.floor(16 * scaleFactor)); 
      const lineHeight = Math.floor(fontSize * 1.3); 
      const padding = Math.floor(12 * scaleFactor); 
      const cellPadding = Math.floor(6 * scaleFactor); 
      
      // 定義表格內容
      const rows = [
        { label: '工程名稱', value: `${projectName} 消防工程` },
        { label: '施工位置', value: formatLocationString(record.location) },
        { label: '施工項目', value: record.workItem === '其他' ? (record.workItemCustom || '其他') : record.workItem },
        { label: '施工日期', value: record.date },
        { label: '備註', value: record.note || '-' },
      ];

      // 設定字體以進行測量
      ctx.font = `bold ${fontSize}px Arial`;
      
      // 設定標籤欄位固定寬度 (舊: 120 -> 新: 90, 約 3/4)
      const labelWidth = Math.floor(90 * scaleFactor); 
      
      // 計算值欄位的最大寬度
      let maxTextWidth = 0;
      rows.forEach(row => {
        const w = ctx.measureText(row.value).width;
        if (w > maxTextWidth) maxTextWidth = w;
      });
      
      // 計算表格總寬高
      const tableWidth = labelWidth + maxTextWidth + (cellPadding * 3);
      const tableHeight = (rows.length * lineHeight) + (cellPadding * (rows.length + 1));

      // 定位：左下角
      const startX = padding;
      const startY = canvas.height - tableHeight - padding;

      // 2. 繪製半透明背景 (White Glass)
      // 使用較高不透明度 (0.9) 確保文字清晰可讀
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; 
      ctx.fillRect(startX, startY, tableWidth, tableHeight);
      
      // 3. 繪製邊框
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 1.5 * scaleFactor;
      ctx.strokeRect(startX, startY, tableWidth, tableHeight);

      // 4. 繪製文字
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#000000';

      rows.forEach((row, index) => {
        const rowY = startY + cellPadding + (index * lineHeight) + (lineHeight / 2);
        
        // 繪製標籤 (Label)
        ctx.textAlign = 'left';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(row.label, startX + cellPadding, rowY);

        // 繪製值 (Value)
        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(row.value, startX + labelWidth + (cellPadding * 2), rowY);
      });

      // 輸出為 JPEG
      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};