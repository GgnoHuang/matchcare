/**
 * OpenAI API 服務
 * 處理醫療資源匹配的 AI 分析
 */

export interface CaseData {
  age: string;
  gender: string;
  disease: string;
  treatment: string;
  notes?: string;
}

export interface AnalysisResult {
  success: boolean;
  content: string;
  usage?: any;
  timestamp: string;
}

export interface ResourceItem {
  id: string;
  category: string;
  subcategory: string;
  title: string;
  organization: string;
  eligibility: string;
  amount: string;
  deadline: string;
  matchedConditions: string[];
  details: string;
  priority: 'high' | 'medium' | 'low';
  status: 'eligible' | 'conditional' | 'ineligible';
  icon?: React.ReactElement;
}

export interface MedicalAnalysisResult {
  disease: string;
  severity: string;
  treatmentStage: string;
  estimatedCost: string;
  careNeeds: string;
  familyImpact: string;
}

export class OpenAIService {
  private apiKey: string;
  private baseURL: string = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * 分析醫療資源匹配條件
   * @param {string} medicalText - 病例或保單條款文字
   * @param {CaseData} caseData - 案例資料
   * @param {string} imageBase64 - 圖片base64 (可選)
   * @returns {Promise<AnalysisResult>} AI 分析結果
   */
  async analyzeResourceMatching(medicalText: string, caseData: CaseData, imageBase64: string | null = null): Promise<AnalysisResult> {
    const prompt = this.buildResourceMatchingPrompt(medicalText, caseData);
    
    const messages = [
      {
        role: "user",
        content: [
          { type: "text", text: prompt }
        ]
      }
    ];

    // 如果有圖片，加入圖片內容
    if (imageBase64) {
      // 確保 base64 格式正確
      const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
      ;(messages[0].content as any).push({
        type: "image_url",
        image_url: {
          url: imageUrl
        }
      });
    }

    try {
      console.log("發送 OpenAI API 請求到:", this.baseURL);
      console.log("使用模型:", 'gpt-4o');
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1500,
          temperature: 0.3
        })
      });

      console.log("OpenAI API 回應狀態:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenAI API 錯誤詳情:", errorText);
        throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("OpenAI API 回應資料:", data);
      return this.parseResponse(data);
    } catch (error) {
      console.error('OpenAI API 調用失敗:', error);
      throw new Error(`AI 分析失敗: ${(error as Error).message}`);
    }
  }

  /**
   * 構建醫療資源匹配分析提示語
   */
  private buildResourceMatchingPrompt(medicalText: string, caseData: CaseData): string {
    return `你是一位熟悉台灣醫療保險和健康資源的專業分析師。以下是病例或醫療文件內容：

---
${medicalText}
---

患者基本資料：
---
年齡: ${caseData.age}
性別: ${caseData.gender}
疾病: ${caseData.disease}
治療方式: ${caseData.treatment}
其他說明: ${caseData.notes || '無'}
---

請根據上述資料，分析患者可能符合的各種醫療資源和補助：

請以以下格式回覆：

## 🏥 政府補助資源
[分析可能符合的健保給付、重大傷病卡、政府補助等]

## 🏢 企業福利資源  
[分析可能的團保理賠、企業醫療福利等]

## 💰 保險理賠資源
[分析商業保險可能的理賠項目]

## 💳 金融產品資源
[分析醫療貸款、分期付款等金融協助]

## ⚖️ 法律救助資源
[分析可能的法律諮詢、醫療糾紛處理等]

## 📋 建議事項
[給予患者的具體建議和後續行動步驟]

請根據台灣現行的醫療保險制度和相關法規進行分析，提供實用的建議。`;
  }

  /**
   * 第1步：基礎病例分析
   */
  async analyzeMedicalCase(medicalText: string, caseData: CaseData, imageBase64: string | null = null): Promise<MedicalAnalysisResult> {
    const prompt = `你是一位專業的醫療分析師。請分析以下醫療資料，提取關鍵醫療資訊：

${medicalText ? `病例文字內容：
---
${medicalText}
---
` : ''}

${imageBase64 ? '請仔細分析圖片中的醫療資訊，包括診斷報告、檢查結果、醫師建議、處方箋、表格數據等所有可見內容。' : ''}

患者資料：
年齡: ${caseData.age}
性別: ${caseData.gender}
疾病: ${caseData.disease}
治療: ${caseData.treatment}

請根據所有可獲得的資訊（文字和圖片），以以下 JSON 格式回覆：
{
  "disease": "主要疾病診斷",
  "severity": "嚴重程度 (輕微/中度/重度/危急)",
  "treatmentStage": "治療階段 (初期/治療中/康復期/長期照護)",
  "estimatedCost": "預估治療費用區間",
  "careNeeds": "照護需求等級",
  "familyImpact": "對家庭經濟的影響程度"
}`;

    const response = await this.callAPI(prompt, 'gpt-4o-mini', imageBase64);
    return this.parseJSONResponse(response.content);
  }

  /**
   * 第2步：搜尋政府補助資源
   */
  async searchGovernmentSubsidies(medicalAnalysis: MedicalAnalysisResult): Promise<ResourceItem[]> {
    const prompt = `根據以下病例分析，搜尋台灣的政府補助資源：

病例分析：
- 疾病：${medicalAnalysis.disease}
- 嚴重程度：${medicalAnalysis.severity}
- 治療階段：${medicalAnalysis.treatmentStage}
- 預估費用：${medicalAnalysis.estimatedCost}

請搜尋相關的政府補助資源，包括：
- 中央健保給付項目
- 重大傷病相關補助
- 地方政府醫療補助
- 社會救助資源

以 JSON 格式回覆：
{
  "resources": [
    {
      "title": "補助項目名稱",
      "organization": "主辦機關",
      "category": "政府補助",
      "subcategory": "國家級/縣市級/區里級",
      "eligibility": "申請資格",
      "amount": "補助金額",
      "deadline": "申請期限",
      "details": "詳細說明",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "matchedConditions": ["匹配的病症1", "匹配的病症2"]
    }
  ]
}`;

    const response = await this.callAPI(prompt, 'gpt-4o-mini');
    const result = this.parseJSONResponse(response.content);
    return this.formatResources(result.resources || [], 'gov');
  }

  /**
   * 第3步：搜尋企業福利資源
   */
  async searchCorporateBenefits(medicalAnalysis: MedicalAnalysisResult): Promise<ResourceItem[]> {
    const prompt = `根據以下病例分析，搜尋台灣的企業福利資源：

病例分析：
- 疾病：${medicalAnalysis.disease}
- 嚴重程度：${medicalAnalysis.severity}
- 治療階段：${medicalAnalysis.treatmentStage}

請搜尋相關的企業福利資源，包括：
- 大型企業員工醫療補助
- 團體保險理賠
- 企業社會責任醫療專案
- 產業工會互助金

以 JSON 格式回覆：
{
  "resources": [
    {
      "title": "福利項目名稱",
      "organization": "企業/組織名稱",
      "category": "企業福利",
      "subcategory": "員工福利/企業社會責任",
      "eligibility": "申請資格",
      "amount": "補助金額",
      "deadline": "申請期限",
      "details": "詳細說明",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "matchedConditions": ["匹配的病症1", "匹配的病症2"]
    }
  ]
}`;

    const response = await this.callAPI(prompt, 'gpt-4o-mini');
    const result = this.parseJSONResponse(response.content);
    return this.formatResources(result.resources || [], 'corp');
  }

  /**
   * 第4步：分析保單理賠資源
   */
  async analyzeInsuranceClaims(medicalAnalysis: MedicalAnalysisResult, policyText: string, policyImageBase64: string | null = null): Promise<ResourceItem[]> {
    const prompt = `請比對病例與保單條款，分析可理賠項目：

病例分析：
- 疾病：${medicalAnalysis.disease}
- 嚴重程度：${medicalAnalysis.severity}
- 治療階段：${medicalAnalysis.treatmentStage}
- 預估費用：${medicalAnalysis.estimatedCost}

${policyText ? `保單條款文字：
---
${policyText}
---
` : ''}

${policyImageBase64 ? '請仔細分析保單圖片中的所有條款內容，包括保障項目、理賠條件、給付金額、免責條款等。' : ''}

請分析可理賠的項目，以 JSON 格式回覆：
{
  "resources": [
    {
      "title": "理賠項目名稱",
      "organization": "保險公司名稱",
      "category": "保單理賠",
      "subcategory": "醫療險/重疾險/意外險",
      "eligibility": "理賠條件",
      "amount": "理賠金額",
      "deadline": "申請期限",
      "details": "理賠說明",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "matchedConditions": ["匹配的病症1", "匹配的病症2"]
    }
  ]
}`;

    const response = await this.callAPI(prompt, 'gpt-4o-mini', policyImageBase64);
    const result = this.parseJSONResponse(response.content);
    return this.formatResources(result.resources || [], 'ins');
  }

  /**
   * 統一的 API 調用方法
   */
  private async callAPI(prompt: string, model: string = 'gpt-4o-mini', imageBase64: string | null = null): Promise<AnalysisResult> {
    const messages = [
      {
        role: "user",
        content: imageBase64 ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } }
        ] : prompt
      }
    ];

    try {
      console.log(`發送 ${model} API 請求...`);
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          max_tokens: model.includes('gpt-4') ? 4000 : 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error(`${model} API 調用失敗:`, error);
      throw error;
    }
  }

  /**
   * 解析 JSON 回應
   */
  private parseJSONResponse(content: string): any {
    try {
      // 提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('無法找到有效的 JSON 回應');
    } catch (error) {
      console.error('JSON 解析失敗:', error);
      return {};
    }
  }

  /**
   * 格式化資源資料
   */
  private formatResources(resources: any[], type: string): ResourceItem[] {
    return resources.map((resource, index) => ({
      id: `${type}-ai-${Date.now()}-${index}`,
      category: resource.category || (type === 'gov' ? '政府補助' : type === 'corp' ? '企業福利' : '保單理賠'),
      subcategory: resource.subcategory || '',
      title: resource.title || '',
      organization: resource.organization || '',
      eligibility: resource.eligibility || '',
      amount: resource.amount || '',
      deadline: resource.deadline || '',
      matchedConditions: resource.matchedConditions || [],
      details: resource.details || '',
      priority: resource.priority || 'medium',
      status: resource.status || 'eligible'
    }));
  }

  /**
   * 分析診斷證明文件
   */
  async analyzeDiagnosisCertificate(text: string, imageBase64: string | null = null): Promise<any> {
    const prompt = `你是一位專業的醫療文件分析師。請從診斷證明中提取以下資訊，如果找不到相關資訊請填入"待輸入"：

${text ? `文字內容：\n${text}\n` : ''}
${imageBase64 ? '請仔細分析圖片中的診斷證明內容。\n' : ''}

請提取以下資訊並以JSON格式回傳：
{
  "patientName": "病人姓名",
  "birthDate": "出生年月日",
  "idNumber": "身分證字號", 
  "firstVisitDate": "初診日",
  "certificateDate": "開立診斷書日期",
  "icdCode": "ICD-10診斷碼",
  "diseaseName": "病名",
  "treatmentSummary": "醫療處置摘要",
  "restPeriod": "建議休養時間",
  "isAccident": "是否因意外"
}`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    if (imageBase64) {
      // 確保 base64 格式正確
      const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
      (messages[0] as any).content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } }
      ];
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: imageBase64 ? 'gpt-4o-mini' : 'gpt-4o-mini',
          messages: messages,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // 嘗試解析JSON
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('無法解析JSON，返回原始內容');
      }
      
      // 如果解析失敗，返回預設結構
      return {
        patientName: "待輸入",
        birthDate: "待輸入", 
        idNumber: "待輸入",
        firstVisitDate: "待輸入",
        certificateDate: "待輸入",
        icdCode: "待輸入",
        diseaseName: "待輸入",
        treatmentSummary: "待輸入",
        restPeriod: "待輸入",
        isAccident: "待輸入"
      };
    } catch (error) {
      console.error('診斷證明分析錯誤:', error);
      throw error;
    }
  }

  /**
   * 分析保險保單文件
   */
  async analyzeInsurancePolicy(text: string, imageBase64: string | null = null): Promise<any> {
    const prompt = `你是一位專業的保險文件分析師。請從保險保單中提取以下資訊，如果找不到相關資訊請填入"待輸入"：

${text ? `文字內容：\n${text}\n` : ''}
${imageBase64 ? '請仔細分析圖片中的保險保單內容。\n' : ''}

請提取以下資訊並以JSON格式回傳：
{
  "policyBasicInfo": {
    "insuranceCompany": "保險公司名稱",
    "policyNumber": "保單號碼",
    "effectiveDate": "保單生效日期",
    "policyTerms": "保單條款（保險責任、除外責任、理賠條件等）",
    "insurancePeriod": "保險期間（保險契約有效期限）"
  },
  "policyHolderInfo": {
    "name": "姓名",
    "birthDate": "出生年月日",
    "idNumber": "身分證字號",
    "occupation": "職業",
    "contactAddress": "聯絡地址"
  },
  "insuredPersonInfo": {
    "name": "姓名",
    "birthDate": "出生年月日",
    "gender": "性別",
    "idNumber": "身分證字號",
    "occupation": "職業",
    "contactAddress": "聯絡地址"
  },
  "beneficiaryInfo": {
    "name": "姓名",
    "relationshipToInsured": "與被保人關係",
    "benefitRatio": "受益比例"
  },
  "insuranceContentAndFees": {
    "insuranceAmount": "保險金額（保險事故發生時的給付金額）",
    "paymentMethod": "繳費方式（月繳、季繳、年繳）",
    "paymentPeriod": "繳費期間（非必要標示）",
    "dividendDistribution": "紅利分配方式（非必要標示）"
  },
  "otherMatters": {
    "automaticPremiumLoan": "自動墊繳條款（若保費未繳，是否自動墊繳）",
    "additionalClauses": "附加條款與附約（醫療險、意外險等）"
  },
  "insuranceServiceInfo": {
    "customerServiceHotline": "客服專線",
    "claimsProcessIntro": "理賠流程簡介"
  }
}`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    if (imageBase64) {
      // 確保 base64 格式正確
      const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
      (messages[0] as any).content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } }
      ];
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: imageBase64 ? 'gpt-4o-mini' : 'gpt-4o-mini',
          messages: messages,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // 嘗試解析JSON
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('無法解析JSON，返回原始內容');
      }
      
      // 如果解析失敗，返回預設結構
      return {
        policyBasicInfo: {
          insuranceCompany: "待輸入",
          policyNumber: "待輸入",
          effectiveDate: "待輸入",
          policyTerms: "待輸入",
          insurancePeriod: "待輸入"
        },
        policyHolderInfo: {
          name: "待輸入",
          birthDate: "待輸入",
          idNumber: "待輸入",
          occupation: "待輸入",
          contactAddress: "待輸入"
        },
        insuredPersonInfo: {
          name: "待輸入",
          birthDate: "待輸入",
          gender: "待輸入",
          idNumber: "待輸入",
          occupation: "待輸入",
          contactAddress: "待輸入"
        },
        beneficiaryInfo: {
          name: "待輸入",
          relationshipToInsured: "待輸入",
          benefitRatio: "待輸入"
        },
        insuranceContentAndFees: {
          insuranceAmount: "待輸入",
          paymentMethod: "待輸入",
          paymentPeriod: "待輸入",
          dividendDistribution: "待輸入"
        },
        otherMatters: {
          automaticPremiumLoan: "待輸入",
          additionalClauses: "待輸入"
        },
        insuranceServiceInfo: {
          customerServiceHotline: "待輸入",
          claimsProcessIntro: "待輸入"
        }
      };
    } catch (error) {
      console.error('保險保單分析錯誤:', error);
      throw error;
    }
  }

  /**
   * 分析病例記錄文件
   */
  async analyzeMedicalRecord(text: string, imageBase64: string | null = null): Promise<any> {
    const prompt = `你是一位專業的醫療文件分析師。請從病例記錄中提取以下資訊，如果找不到相關資訊請填入"待輸入"：

${text ? `文字內容：\n${text}\n` : ''}
${imageBase64 ? '請仔細分析圖片中的病例記錄內容。\n' : ''}

請提取以下資訊並以JSON格式回傳：
{
  "clinicalRecord": "門診/急診/住院紀錄",
  "admissionRecord": "入院病歷", 
  "surgeryRecord": "手術紀錄",
  "examinationReport": "檢查報告影本",
  "medicationRecord": "用藥紀錄",
  "dischargeSummary": "出院病摘",
  "hospitalStamp": "醫療院所章戳與簽名"
}`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    if (imageBase64) {
      // 確保 base64 格式正確
      const imageUrl = imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
      (messages[0] as any).content = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageUrl } }
      ];
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: imageBase64 ? 'gpt-4o-mini' : 'gpt-4o-mini',
          messages: messages,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      // 嘗試解析JSON
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.warn('無法解析JSON，返回原始內容');
      }
      
      // 如果解析失敗，返回預設結構
      return {
        clinicalRecord: "待輸入",
        admissionRecord: "待輸入",
        surgeryRecord: "待輸入", 
        examinationReport: "待輸入",
        medicationRecord: "待輸入",
        dischargeSummary: "待輸入",
        hospitalStamp: "待輸入"
      };
    } catch (error) {
      console.error('病例記錄分析錯誤:', error);
      throw error;
    }
  }

  /**
   * 搜尋個人保單中的相關理賠項目
   */
  async searchPersonalPolicies(searchTerm: string, userPolicies: any[]): Promise<any[]> {
    if (!userPolicies || userPolicies.length === 0) {
      return [];
    }

    const matchedPolicies: any[] = [];
    
    for (const policy of userPolicies) {
      console.log(`分析保單: ${policy.fileName || policy.id}`, policy);
      
      // 組合完整的保單內容：原始文本 + 結構化資料
      const originalText = policy.textContent || '';
      const structuredData = JSON.stringify(policy.policyInfo || {}, null, 2);
      
      const fullPolicyContent = `
=== 保單檔案: ${policy.fileName} ===

=== 原始掃描內容 ===
${originalText}

=== AI分析的結構化資料 ===
${structuredData}
      `.trim();
      
      console.log(`完整保單內容長度: ${fullPolicyContent.length} 字元`);
      
      const searchResult = await this.analyzePolicyMatch(searchTerm, fullPolicyContent, policy);
      
      if (searchResult.hasMatch) {
        const insuranceCompany = policy.policyInfo?.policyBasicInfo?.insuranceCompany || '未知保險公司';
        
        // 根據AI分析的信心度決定優先級
        const priority = searchResult.confidenceLevel === 'high' ? 'high' : 
                        searchResult.confidenceLevel === 'medium' ? 'medium' : 'low';
        
        // 組合詳細說明，包含專業分析
        const detailedDescription = [
          searchResult.details,
          searchResult.medicalInsights ? `🔬 醫學分析：${searchResult.medicalInsights}` : '',
          searchResult.exclusionRisk ? `⚠️ 注意事項：${searchResult.exclusionRisk}` : '',
          searchResult.claimProcess ? `📋 理賠要點：${searchResult.claimProcess}` : ''
        ].filter(Boolean).join('\n\n');

        matchedPolicies.push({
          id: `policy-${policy.id || Date.now()}`,
          category: "保單理賠",
          subcategory: `個人保單 (${searchResult.matchType || '相關保障'})`,
          title: searchResult.matchedItem || `${insuranceCompany} - ${searchTerm}相關保障`,
          organization: `${insuranceCompany} | 來源：${policy.fileName}`,
          eligibility: `符合保單條款 (可信度：${searchResult.confidenceLevel || 'medium'})`,
          amount: searchResult.coverageAmount || "依保單條款",
          deadline: "依保單條款",
          details: detailedDescription,
          priority: priority,
          status: "eligible",
          matchedConditions: [searchTerm],
          sourcePolicy: policy.fileName,
          aiAnalysis: {
            confidenceLevel: searchResult.confidenceLevel,
            matchType: searchResult.matchType,
            medicalInsights: searchResult.medicalInsights,
            exclusionRisk: searchResult.exclusionRisk
          }
        });
        
        console.log(`找到匹配項目:`, searchResult);
      } else {
        console.log(`保單 ${policy.fileName} 無匹配項目`);
      }
    }
    
    return matchedPolicies;
  }

  /**
   * 分析保單是否匹配搜尋內容
   */
  private async analyzePolicyMatch(searchTerm: string, policyText: string, policy: any): Promise<any> {
    const prompt = `你是資深的保險理賠專家和醫療顧問，具備深厚的醫學知識和保險法規經驗。請運用專業智能分析以下保單，判斷與「${searchTerm}」的關聯性。

保單完整內容：
${policyText}

## 專業分析要求：

### 醫學知識應用
- 分析「${searchTerm}」的醫學定義、分類、併發症
- 識別相關疾病代碼(ICD-10)、同義詞、醫學術語
- 考慮疾病進程：初期症狀 → 確診 → 治療 → 併發症 → 長期照護

### 保險專業判斷
- 解讀保單條款的法律用詞和隱含意義
- 分析除外條款是否排除此疾病
- 評估等待期、既往症條款的影響
- 判斷不同險種的理賠適用性

### 案例範例（供參考）：
**糖尿病** → 可能關聯：
- 直接：糖尿病住院醫療、糖尿病特定疾病險
- 間接：腎臟病變、視網膜病變、心血管疾病併發症
- 手術：截肢手術、眼底雷射、腎臟透析
- 長照：糖尿病足護理、注射胰島素照護

**達文西手術** → 可能關聯：
- 直接：特定手術保險金、住院醫療險手術費
- 間接：攝護腺癌、子宮肌瘤等疾病的手術治療
- 材料費：機器手臂使用費、特殊醫材

請以JSON格式提供專業分析：
{
  "hasMatch": true/false,
  "matchedItem": "具體理賠項目名稱",
  "coverageAmount": "理賠金額/比例/條件",
  "details": "專業分析說明：為什麼匹配、理賠條件、注意事項",
  "confidenceLevel": "high/medium/low",
  "matchType": "直接保障/併發症保障/相關手術保障/長期照護保障",
  "medicalInsights": "醫學相關性說明",
  "exclusionRisk": "可能的除外條款風險",
  "claimProcess": "理賠申請時需注意的要點"
}

重要：這不是簡單的文字搜尋，而是基於醫學和保險專業知識的智能分析。`;

    try {
      console.log(`發送保單分析請求，搜尋詞: ${searchTerm}`);
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      console.log(`保單分析回應:`, response.content);
      return this.parseJSONResponse(response.content);
    } catch (error) {
      console.error('保單匹配分析失敗:', error);
      return { hasMatch: false };
    }
  }

  /**
   * 使用AI搜尋網路醫療資源
   */
  async searchMedicalResources(searchTerm: string): Promise<{
    estimatedCost: string;
    costSource: string;
    resources: any[];
  }> {
    const prompt = `請搜尋關於「${searchTerm}」的以下資訊：

1. 在台灣的平均醫療費用
2. 政府補助資源（如健保給付、特殊補助）
3. 公益基金會或慈善機構的協助
4. 醫療貸款或分期付款方案
5. 企業社會責任相關資源

請以JSON格式回傳最新資訊：
{
  "estimatedCost": "費用範圍",
  "costDescription": "費用說明",
  "costSource": "費用來源",
  "resources": [
    {
      "title": "資源名稱",
      "organization": "機構名稱", 
      "category": "政府補助/公益資源/金融產品/企業福利",
      "subcategory": "具體分類",
      "eligibility": "申請資格",
      "amount": "補助/貸款金額",
      "deadline": "申請期限",
      "details": "詳細說明",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "contactInfo": "聯絡方式或網址"
    }
  ]
}`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o');
      const result = this.parseJSONResponse(response.content);
      
      return {
        estimatedCost: result.estimatedCost || '費用資訊查詢中',
        costSource: result.costSource || 'AI搜尋結果',
        resources: this.formatNetworkResources(result.resources || [])
      };
    } catch (error) {
      console.error('網路醫療資源搜尋失敗:', error);
      return {
        estimatedCost: '無法取得費用資訊',
        costSource: '搜尋失敗',
        resources: []
      };
    }
  }

  /**
   * 格式化網路搜尋的資源資料
   */
  private formatNetworkResources(resources: any[]): any[] {
    return resources.map((resource, index) => ({
      id: `network-${Date.now()}-${index}`,
      category: resource.category || '其他資源',
      subcategory: resource.subcategory || '',
      title: resource.title || '',
      organization: resource.organization || '',
      eligibility: resource.eligibility || '',
      amount: resource.amount || '',
      deadline: resource.deadline || '',
      matchedConditions: [],
      details: resource.details || '',
      priority: resource.priority || 'medium',
      status: resource.status || 'eligible',
      contactInfo: resource.contactInfo || ''
    }));
  }

  /**
   * 綜合搜尋功能 - 結合個人保單和網路資源
   */
  async comprehensiveSearch(searchTerm: string, userPolicies: any[]): Promise<{
    estimatedCost: string;
    costSource: string;
    personalPolicyResults: any[];
    networkResources: any[];
    searchTerm: string;
  }> {
    console.log(`開始綜合搜尋: ${searchTerm}`);
    
    // 1. 搜尋個人保單
    const personalPolicyResults = await this.searchPersonalPolicies(searchTerm, userPolicies);
    
    // 2. 搜尋網路資源
    const networkSearch = await this.searchMedicalResources(searchTerm);
    
    // 3. 決定費用估算來源
    let estimatedCost = networkSearch.estimatedCost;
    let costSource = networkSearch.costSource;
    
    // 如果個人保單有匹配結果，優先使用保單資料推估費用
    if (personalPolicyResults.length > 0) {
      const maxCoverage = personalPolicyResults.reduce((max, policy) => {
        const amount = policy.amount.replace(/[^0-9]/g, '');
        return Math.max(max, parseInt(amount) || 0);
      }, 0);
      
      if (maxCoverage > 0) {
        estimatedCost = `約 ${maxCoverage.toLocaleString()} 元左右`;
        costSource = '根據您的保單理賠額度推估';
      }
    }
    
    return {
      estimatedCost,
      costSource,
      personalPolicyResults,
      networkResources: networkSearch.resources,
      searchTerm
    };
  }

  /**
   * 解析 AI 回應
   */
  private parseResponse(data: any): AnalysisResult {
    const content = data.choices?.[0]?.message?.content || '無法取得 AI 回應';
    
    return {
      success: true,
      content: content,
      usage: data.usage,
      timestamp: new Date().toISOString()
    };
  }
}