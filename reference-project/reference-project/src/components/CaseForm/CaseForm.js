import React, { useState } from 'react';
import './CaseForm.css';

const CaseForm = ({ onSubmit, disabled = false }) => {
  const [formData, setFormData] = useState({
    age: '',
    gender: '',
    disease: '',
    treatment: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // 清除該欄位的錯誤
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.age || formData.age < 1 || formData.age > 120) {
      newErrors.age = '請輸入有效的年齡 (1-120歲)';
    }

    if (!formData.gender) {
      newErrors.gender = '請選擇性別';
    }

    if (!formData.disease.trim()) {
      newErrors.disease = '請輸入疾病名稱';
    }

    if (!formData.treatment.trim()) {
      newErrors.treatment = '請輸入治療方式';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleReset = () => {
    setFormData({
      age: '',
      gender: '',
      disease: '',
      treatment: '',
      notes: ''
    });
    setErrors({});
  };

  return (
    <div className="case-form">
      <h3>👤 案例資料</h3>
      
      <form onSubmit={handleSubmit} className="form-container">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="age">年齡*</label>
            <input
              id="age"
              type="number"
              min="1"
              max="120"
              value={formData.age}
              onChange={(e) => handleInputChange('age', e.target.value)}
              placeholder="例如：42"
              className={errors.age ? 'error' : ''}
              disabled={disabled}
            />
            {errors.age && <span className="error-message">{errors.age}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="gender">性別*</label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              className={errors.gender ? 'error' : ''}
              disabled={disabled}
            >
              <option value="">請選擇</option>
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
            {errors.gender && <span className="error-message">{errors.gender}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="disease">疾病名稱*</label>
          <input
            id="disease"
            type="text"
            value={formData.disease}
            onChange={(e) => handleInputChange('disease', e.target.value)}
            placeholder="例如：乳癌第三期"
            className={errors.disease ? 'error' : ''}
            disabled={disabled}
          />
          {errors.disease && <span className="error-message">{errors.disease}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="treatment">治療方式*</label>
          <textarea
            id="treatment"
            value={formData.treatment}
            onChange={(e) => handleInputChange('treatment', e.target.value)}
            placeholder="例如：化療＋手術＋後續追蹤"
            rows="3"
            className={errors.treatment ? 'error' : ''}
            disabled={disabled}
          />
          {errors.treatment && <span className="error-message">{errors.treatment}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="notes">其他說明</label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="其他相關資訊（可選）"
            rows="2"
            disabled={disabled}
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="reset-btn"
            disabled={disabled}
          >
            重設
          </button>
          
          <button
            type="submit"
            className="submit-btn"
            disabled={disabled}
          >
            {disabled ? '分析中...' : '開始 AI 分析'}
          </button>
        </div>
      </form>

      <div className="form-note">
        <p>* 為必填欄位</p>
        <p>💡 提示：請提供詳細且準確的資訊，以獲得更精確的理賠判定結果。</p>
      </div>
    </div>
  );
};

export default CaseForm;