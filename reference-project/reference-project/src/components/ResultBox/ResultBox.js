import React, { useState } from 'react';
import './ResultBox.css';

const ResultBox = ({ result, loading, error, onReset }) => {
  const [showFullResult, setShowFullResult] = useState(false);

  if (loading) {
    return (
      <div className="result-box loading">
        <div className="loading-header">
          <div className="loading-icon">🤖</div>
          <h3>AI 分析中...</h3>
        </div>
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>正在分析保單條款與案例資料，請稍候...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="result-box error">
        <div className="error-header">
          <div className="error-icon">⚠️</div>
          <h3>分析失敗</h3>
        </div>
        <div className="error-content">
          <p>{error}</p>
          <button onClick={onReset} className="retry-btn">
            重新分析
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const parseResult = (content) => {
    const sections = {
      decision: '未知',
      clauses: '無相關條款',
      reasoning: '無詳細說明',
      suggestions: '無建議事項'
    };

    try {
      // 嘗試解析結構化回應
      const lines = content.split('\n').filter(line => line.trim());
      
      lines.forEach(line => {
        const trimmed = line.trim();
        if (trimmed.includes('判定結果') || trimmed.includes('結論')) {
          sections.decision = trimmed.replace(/^\d+\.\s*[^：:]*[：:]?\s*/, '');
        } else if (trimmed.includes('相關條款') || trimmed.includes('條款')) {
          sections.clauses = trimmed.replace(/^\d+\.\s*[^：:]*[：:]?\s*/, '');
        } else if (trimmed.includes('判定原因') || trimmed.includes('原因') || trimmed.includes('理由')) {
          sections.reasoning = trimmed.replace(/^\d+\.\s*[^：:]*[：:]?\s*/, '');
        } else if (trimmed.includes('建議事項') || trimmed.includes('建議')) {
          sections.suggestions = trimmed.replace(/^\d+\.\s*[^：:]*[：:]?\s*/, '');
        }
      });
    } catch (err) {
      console.warn('無法解析結構化回應，使用原始內容');
    }

    return sections;
  };

  const parsedResult = parseResult(result.content);
  const isEligible = parsedResult.decision.includes('符合理賠') || 
                     parsedResult.decision.includes('可理賠') ||
                     parsedResult.decision.includes('符合');

  const getDecisionIcon = () => {
    if (isEligible) return '✅';
    if (parsedResult.decision.includes('不符合') || parsedResult.decision.includes('不可理賠')) return '❌';
    return '❓';
  };

  const getDecisionClass = () => {
    if (isEligible) return 'eligible';
    if (parsedResult.decision.includes('不符合') || parsedResult.decision.includes('不可理賠')) return 'ineligible';
    return 'uncertain';
  };

  return (
    <div className="result-box success">
      <div className="result-header">
        <div className="result-icon">🎯</div>
        <h3>AI 分析結果</h3>
        <button onClick={onReset} className="new-analysis-btn">
          新增分析
        </button>
      </div>

      <div className="result-content">
        <div className={`decision-card ${getDecisionClass()}`}>
          <div className="decision-header">
            <span className="decision-icon">{getDecisionIcon()}</span>
            <h4>判定結果</h4>
          </div>
          <p className="decision-text">{parsedResult.decision}</p>
        </div>

        <div className="details-section">
          <div className="detail-card">
            <h5>📋 相關條款</h5>
            <p>{parsedResult.clauses}</p>
          </div>

          <div className="detail-card">
            <h5>💭 判定原因</h5>
            <p>{parsedResult.reasoning}</p>
          </div>

          <div className="detail-card">
            <h5>💡 建議事項</h5>
            <p>{parsedResult.suggestions}</p>
          </div>
        </div>

        <div className="raw-result">
          <button 
            onClick={() => setShowFullResult(!showFullResult)}
            className="toggle-raw-btn"
          >
            {showFullResult ? '隱藏完整回應' : '查看完整回應'}
          </button>
          
          {showFullResult && (
            <div className="raw-content">
              <h5>🤖 AI 完整回應</h5>
              <pre>{result.content}</pre>
            </div>
          )}
        </div>

        <div className="result-meta">
          <div className="meta-info">
            <span>分析時間：{new Date(result.timestamp).toLocaleString('zh-TW')}</span>
            {result.usage && (
              <span>Token 使用：{result.usage.total_tokens}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultBox;