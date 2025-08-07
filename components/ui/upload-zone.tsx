'use client';

import React, { useState, useCallback } from 'react';
import { PDFUtils } from '../../lib/pdfUtils';
import { ImageUtils } from '../../lib/imageUtils';
import { Upload, X, FileText, Image, AlertCircle } from 'lucide-react';
import { Card, CardContent } from './card';
import { Button } from './button';

export interface UploadedFile {
  type: 'pdf' | 'image';
  filename: string;
  text?: string;
  base64?: string;
  size: number;
}

interface UploadZoneProps {
  onFileProcessed: (fileData: UploadedFile | null) => void;
  onError: (errorMessage: string) => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileProcessed, onError }) => {
  const [dragActive, setDragActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setProcessing(true);
    setUploadedFile(null);
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
        
        const fileData: UploadedFile = {
          type: 'pdf',
          filename: file.name,
          text: text,
          size: file.size
        };
        
        setUploadedFile(fileData);
        onFileProcessed(fileData);

      } else if (ImageUtils.isImageFile(file)) {
        // 處理圖片檔案
        if (!ImageUtils.checkFileSize(file, 5)) {
          throw new Error('圖片檔案大小不能超過 5MB');
        }

        const base64 = await ImageUtils.convertToBase64(file);
        setPreviewImage(base64);

        const fileData: UploadedFile = {
          type: 'image',
          filename: file.name,
          base64: base64,
          size: file.size
        };
        
        setUploadedFile(fileData);
        onFileProcessed(fileData);

      } else {
        throw new Error('不支援的檔案格式。請上傳 PDF 或圖片檔案 (JPG, PNG, WebP)');
      }

    } catch (error) {
      console.error('檔案處理失敗:', error);
      onError((error as Error).message);
    } finally {
      setProcessing(false);
    }
  };

  const clearFile = () => {
    setUploadedFile(null);
    setExtractedText('');
    setPreviewImage(null);
    onFileProcessed(null);
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Upload className="h-5 w-5" />
          上傳病例或保單文件
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          支援 PDF、JPG、PNG、WebP 格式，讓 AI 分析您的具體情況
        </p>
      </div>
      
      {!uploadedFile ? (
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">拖曳檔案到此處或點擊上傳</h4>
              <p className="text-sm text-gray-500 mb-4">
                支援格式：PDF, JPG, PNG, WebP<br />
                檔案大小：PDF ≤ 10MB, 圖片 ≤ 5MB
              </p>
              
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileInput}
                className="hidden"
                disabled={processing}
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button 
                  variant="outline" 
                  disabled={processing}
                  className="cursor-pointer"
                  asChild
                >
                  <span>
                    {processing ? '處理中...' : '選擇檔案'}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-2xl">
                  {uploadedFile.type === 'pdf' ? <FileText className="h-8 w-8 text-red-500" /> : <Image className="h-8 w-8 text-blue-500" />}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">{uploadedFile.filename}</h4>
                  <p className="text-sm text-gray-500">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFile}
                className="text-gray-500 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {processing && (
              <div className="mt-4 flex items-center gap-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <p className="text-sm">處理檔案中...</p>
              </div>
            )}
            
            {previewImage && (
              <div className="mt-4">
                <img 
                  src={previewImage} 
                  alt="上傳的圖片" 
                  className="max-w-full h-48 object-contain border rounded"
                />
                <p className="text-sm text-green-600 mt-2">✅ 圖片已準備好進行 AI 分析</p>
              </div>
            )}
            
            {extractedText && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-700 mb-2">📝 提取的文字內容：</h5>
                <div className="bg-gray-50 p-3 rounded text-xs max-h-32 overflow-y-auto">
                  {extractedText.substring(0, 500)}
                  {extractedText.length > 500 && '...'}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  共 {extractedText.length} 個字元
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UploadZone;