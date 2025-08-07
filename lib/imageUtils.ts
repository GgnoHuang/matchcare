/**
 * 圖片處理工具
 * 處理圖片上傳和 base64 轉換
 */

export class ImageUtils {
  /**
   * 將圖片檔案轉換為 base64
   * @param {File} file - 圖片檔案
   * @returns {Promise<string>} base64 字串
   */
  static async convertToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      
      reader.onerror = () => {
        reject(new Error('圖片檔案讀取失敗'));
      };
      
      reader.readAsDataURL(file);
    });
  }

  /**
   * 驗證檔案是否為支援的圖片格式
   * @param {File} file - 檔案
   * @returns {boolean} 是否為支援的圖片格式
   */
  static isImageFile(file: File): boolean {
    const supportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return supportedTypes.includes(file.type);
  }

  /**
   * 檢查圖片檔案大小
   * @param {File} file - 圖片檔案
   * @param {number} maxSizeMB - 最大檔案大小 (MB)
   * @returns {boolean} 檔案大小是否符合限制
   */
  static checkFileSize(file: File, maxSizeMB = 5): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  /**
   * 壓縮圖片（如果需要）
   * @param {File} file - 原始圖片檔案
   * @param {number} maxWidth - 最大寬度
   * @param {number} quality - 壓縮品質 (0-1)
   * @returns {Promise<Blob>} 壓縮後的圖片
   */
  static async compressImage(file: File, maxWidth = 1024, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      if (!ctx) {
        reject(new Error('無法創建 canvas context'));
        return;
      }

      img.onload = () => {
        // 計算新的尺寸
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // 繪製壓縮後的圖片
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('圖片壓縮失敗'));
          }
        }, file.type, quality);
      };

      img.onerror = () => reject(new Error('圖片載入失敗'));
      img.src = URL.createObjectURL(file);
    });
  }
}