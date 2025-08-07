/**
 * PDF 處理工具
 * 使用 PDF.js 提取 PDF 文字內容
 */

import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';

// 設定 PDF.js worker - 提供多個備案
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `${window.location.origin}/pdf.worker.min.js`;
}

export class PDFUtils {
  /**
   * 從 PDF 檔案提取文字內容
   * @param {File} file - PDF 檔案
   * @returns {Promise<string>} 提取的文字內容
   */
  static async extractTextFromPDF(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
      let fullText = '';

      // 逐頁提取文字
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item) => (item as TextItem).str)
          .join(' ');
        
        fullText += `第 ${pageNum} 頁:\n${pageText}\n\n`;
      }

      return fullText.trim();
    } catch (error) {
      console.error('PDF 文字提取失敗:', error);
      throw new Error(`無法讀取 PDF 檔案: ${(error as Error).message}`);
    }
  }

  /**
   * 驗證檔案是否為 PDF
   * @param {File} file - 檔案
   * @returns {boolean} 是否為 PDF
   */
  static isPDFFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  }

  /**
   * 檢查 PDF 檔案大小
   * @param {File} file - PDF 檔案
   * @param {number} maxSizeMB - 最大檔案大小 (MB)
   * @returns {boolean} 檔案大小是否符合限制
   */
  static checkFileSize(file: File, maxSizeMB = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }
}