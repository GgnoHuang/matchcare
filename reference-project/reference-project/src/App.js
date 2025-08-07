import React, { useState } from "react";
import UploadZone from "./components/UploadZone/UploadZone";
import CaseForm from "./components/CaseForm/CaseForm";
import ResultBox from "./components/ResultBox/ResultBox";
import { OpenAIService } from "./services/openaiService";
import "./App.css";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 處理檔案上傳
  const handleFileProcessed = (fileData) => {
    setUploadedFile(fileData);
    setError(null);
  };

  // 處理檔案上傳錯誤
  const handleFileError = (errorMessage) => {
    setError(errorMessage);
    setUploadedFile(null);
  };

  // 處理案例資料提交和 AI 分析
  const handleCaseSubmit = async (caseData) => {
    if (!apiKey.trim()) {
      setError("請先輸入 OpenAI API Key");
      return;
    }

    if (!uploadedFile) {
      setError("請先上傳保單文件");
      return;
    }

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const openaiService = new OpenAIService(apiKey);
      
      let policyText = '';
      let imageBase64 = null;

      if (uploadedFile.type === 'pdf') {
        policyText = uploadedFile.text;
      } else if (uploadedFile.type === 'image') {
        imageBase64 = uploadedFile.base64;
        policyText = "請從圖片中分析保單條款內容";
      } else if (uploadedFile.type === 'url') {
        policyText = uploadedFile.text;
      }

      const result = await openaiService.analyzeClaimEligibility(
        policyText,
        caseData,
        imageBase64
      );

      setAnalysisResult(result);
    } catch (err) {
      console.error('分析失敗:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 重置所有狀態
  const handleReset = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setError(null);
    setLoading(false);
  };

  const canSubmit = uploadedFile && apiKey.trim() && !loading;

  return (
    <div className="app">
      <div className="app-container">
        <header className="app-header">
          <h1>🏥 保單理賠 AI 判定工具</h1>
          <p>上傳保單文件，輸入案例資料，讓 AI 幫您判斷理賠條件</p>
        </header>

        <div className="api-key-section">
          <label htmlFor="apiKey">🔑 OpenAI API Key</label>
          <input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="請輸入您的 OpenAI API Key"
            className="api-key-input"
          />
          <p className="api-key-note">
            💡 您的 API Key 只會在本次瀏覽器會話中使用，不會被儲存
          </p>
        </div>

        <main className="app-main">
          <UploadZone 
            onFileProcessed={handleFileProcessed}
            onError={handleFileError}
          />

          <CaseForm 
            onSubmit={handleCaseSubmit}
            disabled={!canSubmit}
          />

          <ResultBox 
            result={analysisResult}
            loading={loading}
            error={error}
            onReset={handleReset}
          />
        </main>

        <footer className="app-footer">
          <p>⚠️ 此工具僅供參考，實際理賠條件請以保險公司正式審核為準</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
