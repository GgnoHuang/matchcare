/**
 * PDF 處理工具
 * 使用 PDF.js 提取 PDF 文字內容
 */

import * as pdfjsLib from 'pdfjs-dist';

// 設定 PDF.js worker - 提供多個備案
pdfjsLib.GlobalWorkerOptions.workerSrc = (() => {
  // 1. 優先使用本地檔案
  try {
    return `${window.location.origin}/pdf.worker.min.js`;
  } catch (e) {
    // 2. 備案：使用 unpkg CDN
    return `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
  }
})();

export class PDFUtils {
  /**
   * 從 PDF 檔案提取文字內容
   * @param {File} file - PDF 檔案
   * @returns {Promise<string>} 提取的文字內容
   */
  static async extractTextFromPDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      // 逐頁提取文字
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map(item => item.str)
          .join(' ');
        
        fullText += `第 ${pageNum} 頁:\n${pageText}\n\n`;
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF 文字提取失敗:', error);
      throw new Error(`無法讀取 PDF 檔案: ${error.message}`);
    }
  }

  /**
   * 驗證檔案是否為 PDF
   * @param {File} file - 檔案
   * @returns {boolean} 是否為 PDF
   */
  static isPDFFile(file) {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  /**
   * 檢查 PDF 檔案大小
   * @param {File} file - PDF 檔案
   * @param {number} maxSizeMB - 最大檔案大小 (MB)
   * @returns {boolean} 檔案大小是否符合限制
   */
  static checkFileSize(file, maxSizeMB = 10) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}