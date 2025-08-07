import React, { useState, useCallback } from 'react';
import { PDFUtils } from '../../utils/pdfUtils';
import { ImageUtils } from '../../utils/imageUtils';
import { WebUtils } from '../../utils/webUtils';
import './UploadZone.css';

const UploadZone = ({ onFileProcessed, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [previewImage, setPreviewImage] = useState(null);
  const [urlInput, setUrlInput] = useState('');
  const [inputMode, setInputMode] = useState('file'); // 'file' or 'url'

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    setProcessing(true);
    setUploadedFile(file);
    setExtractedText('');
    setPreviewImage(null);

    try {
      if (PDFUtils.isPDFFile(file)) {
        // 處理 PDF 檔案
        if (!PDFUtils.checkFileSize(file, 10)) {
          throw new Error('PDF 檔案大小不能超過 10MB');
        }

        const text = await PDFUtils.extractTextFromPDF(file);
        setExtractedText(text);
        
        if (onFileProcessed) {
          onFileProcessed({
            type: 'pdf',
            filename: file.name,
            text: text,
            size: file.size
          });
        }

      } else if (ImageUtils.isImageFile(file)) {
        // 處理圖片檔案
        if (!ImageUtils.checkFileSize(file, 5)) {
          throw new Error('圖片檔案大小不能超過 5MB');
        }

        const base64 = await ImageUtils.convertToBase64(file);
        setPreviewImage(base64);

        if (onFileProcessed) {
          onFileProcessed({
            type: 'image',
            filename: file.name,
            base64: base64,
            size: file.size
          });
        }

      } else {
        throw new Error('不支援的檔案格式。請上傳 PDF 或圖片檔案 (JPG, PNG, WebP)');
      }

    } catch (error) {
      console.error('檔案處理失敗:', error);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const handleURL = async () => {
    if (!urlInput.trim()) {
      if (onError) onError('請輸入網址');
      return;
    }

    if (!WebUtils.isValidContentURL(urlInput)) {
      if (onError) onError('此網址可能不包含可分析的文字內容');
      return;
    }

    setProcessing(true);
    setUploadedFile(null);
    setExtractedText('');
    setPreviewImage(null);

    try {
      const text = await WebUtils.extractTextFromURL(urlInput);
      setExtractedText(text);
      
      const processedData = {
        type: 'url',
        url: urlInput,
        text: text,
        size: text.length
      };
      
      setUploadedFile(processedData);
      
      if (onFileProcessed) {
        onFileProcessed(processedData);
      }

    } catch (error) {
      console.error('網址處理失敗:', error);
      if (onError) {
        onError(error.message);
      }
    } finally {
      setProcessing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setExtractedText('');
    setPreviewImage(null);
    setUrlInput('');
    if (onFileProcessed) {
      onFileProcessed(null);
    }
  };

  return (
    <div className="upload-zone">
      <h3>📁 上傳保單文件</h3>
      
      {/* 模式切換 */}
      <div className="input-mode-toggle">
        <button 
          className={`mode-btn ${inputMode === 'file' ? 'active' : ''}`}
          onClick={() => setInputMode('file')}
          disabled={processing}
        >
          📄 檔案上傳
        </button>
        <button 
          className={`mode-btn ${inputMode === 'url' ? 'active' : ''}`}
          onClick={() => setInputMode('url')}
          disabled={processing}
        >
          🌐 網址讀取
        </button>
      </div>
      
      {!uploadedFile ? (
        inputMode === 'file' ? (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <div className="upload-icon">📄</div>
            <h4>拖曳檔案到此處或點擊上傳</h4>
            <p>支援格式：PDF, JPG, PNG, WebP</p>
            <p>檔案大小：PDF ≤ 10MB, 圖片 ≤ 5MB</p>
            
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileInput}
              className="file-input"
              disabled={processing}
            />
          </div>
        </div>
        ) : (
        /* URL 輸入模式 */
        <div className="url-input-area">
          <div className="url-input-content">
            <div className="url-icon">🌐</div>
            <h4>輸入網址來分析線上保單</h4>
            <p>支援保險公司官網的保單條款頁面</p>
            
            <div className="url-input-group">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/policy-terms"
                className="url-input"
                disabled={processing}
                onKeyPress={(e) => e.key === 'Enter' && handleURL()}
              />
              <button 
                onClick={handleURL}
                disabled={processing || !urlInput.trim()}
                className="url-submit-btn"
              >
                {processing ? '讀取中...' : '讀取網頁'}
              </button>
            </div>
            
            <div className="url-examples">
              <p><strong>支援網站例如：</strong></p>
              <ul>
                <li>保險公司官方保單條款頁面</li>
                <li>政府保險相關法規網站</li>
                <li>線上保單文件 (HTML 格式)</li>
              </ul>
            </div>
          </div>
        </div>
        )
      ) : (
        <div className="file-preview">
          <div className="file-info">
            <div className="file-header">
              <span className="file-icon">
                {uploadedFile.type === 'url' ? '🌐' : 
                 uploadedFile.type === 'pdf' ? '📄' : '🖼️'}
              </span>
              <div className="file-details">
                <h4>
                  {uploadedFile.type === 'url' 
                    ? `網址: ${uploadedFile.url}` 
                    : uploadedFile.name || uploadedFile.filename
                  }
                </h4>
                <p>
                  {uploadedFile.type === 'url' 
                    ? `${Math.round(uploadedFile.size / 1024)} KB 文字內容`
                    : `${(uploadedFile.size / 1024 / 1024).toFixed(2)} MB`
                  }
                </p>
              </div>
              <button onClick={clearFile} className="clear-btn">✕</button>
            </div>
            
            {processing && (
              <div className="processing">
                <div className="loading-spinner"></div>
                <p>處理檔案中...</p>
              </div>
            )}
            
            {previewImage && (
              <div className="image-preview">
                <img src={previewImage} alt="上傳的圖片" />
                <p>✅ 圖片已準備好進行 AI 分析</p>
              </div>
            )}
            
            {extractedText && (
              <div className="text-preview">
                <h5>
                  {uploadedFile.type === 'url' ? '🌐 網頁內容：' : '📝 提取的文字內容：'}
                </h5>
                <div className="text-content">
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 && '...'}
                </div>
                <p className="text-length">
                  共 {extractedText.length} 個字元
                  {uploadedFile.type === 'url' && (
                    <span className="url-status"> ✅ 網頁已成功解析</span>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadZone;