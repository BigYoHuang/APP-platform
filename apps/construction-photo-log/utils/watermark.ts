import { RecordItem } from '../types';
import { LocationData } from '../types';

/**
 * 格式化施工位置字串
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

      // 設定 Canvas 大小與原圖一致
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. 繪製原始圖片
      ctx.drawImage(img, 0, 0);

      // --- 浮水印設定與計算 ---
      const scaleFactor = canvas.width / 1000;
      
      const fontSize = Math.max(12, Math.floor(16 * scaleFactor)); 
      const lineHeight = Math.floor(fontSize * 1.3); 
      const padding = Math.floor(12 * scaleFactor); 
      const cellPadding = Math.floor(6 * scaleFactor); 
      
      const rows = [
        { label: '工程名稱', value: `${projectName} 消防工程` },
        { label: '施工位置', value: formatLocationString(record.location) },
        { label: '施工項目', value: record.workItem === '其他' ? (record.workItemCustom || '其他') : record.workItem },
        { label: '施工日期', value: record.date },
        { label: '備註', value: record.note || '-' },
      ];

      ctx.font = `bold ${fontSize}px Arial`;
      
      const labelWidth = Math.floor(90 * scaleFactor); 
      
      let maxTextWidth = 0;
      rows.forEach(row => {
        const w = ctx.measureText(row.value).width;
        if (w > maxTextWidth) maxTextWidth = w;
      });
      
      const tableWidth = labelWidth + maxTextWidth + (cellPadding * 3);
      const tableHeight = (rows.length * lineHeight) + (cellPadding * (rows.length + 1));

      const startX = padding;
      const startY = canvas.height - tableHeight - padding;

      // 2. 繪製半透明背景
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
        
        ctx.textAlign = 'left';
        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillText(row.label, startX + cellPadding, rowY);

        ctx.font = `${fontSize}px Arial`;
        ctx.fillText(row.value, startX + labelWidth + (cellPadding * 2), rowY);
      });

      resolve(canvas.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = reject;
    img.src = base64Image;
  });
};