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

  constructor(apiKey?: string) {
    this.apiKey = apiKey || localStorage.getItem('openai_api_key') || '';
  }

  /**
   * 智能判斷並生成正確格式的圖片URL
   */
  private generateImageUrl(imageBase64: string): string {
    if (imageBase64.startsWith('data:')) {
      return imageBase64;
    }
    
    // 根據base64開頭判斷圖片格式
    const isPNG = imageBase64.startsWith('iVBORw0KGgo'); // PNG signature
    const isJPEG = imageBase64.startsWith('/9j/'); // JPEG signature  
    const isWebP = imageBase64.startsWith('UklGR'); // WebP signature
    
    if (isPNG) {
      return `data:image/png;base64,${imageBase64}`;
    } else if (isJPEG) {
      return `data:image/jpeg;base64,${imageBase64}`;
    } else if (isWebP) {
      return `data:image/webp;base64,${imageBase64}`;
    } else {
      // 預設為PNG
      return `data:image/png;base64,${imageBase64}`;
    }
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
      const imageUrl = this.generateImageUrl(imageBase64);
      console.log(`圖片分析 - 設定圖片URL: ${imageUrl.substring(0, 50)}...`);
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
    const prompt = `你是資深的醫療分析專家，具備深厚的臨床經驗和保險理賠知識。請進行專業的醫療案例分析。

${medicalText ? `## 📋 文字資料分析
${medicalText}
` : ''}

${imageBase64 ? `## 🖼️ 圖片內容分析
請仔細檢視並分析圖片中的所有醫療資訊：
- 診斷證明或病歷內容
- 檢驗檢查報告和數值
- 醫師建議和治療計畫
- 處方藥物和用量
- 醫院印章和醫師簽名
- 所有可見的醫療專業術語

**重要**：請逐字識別圖片中的文字內容，不要只提供概括描述。
` : ''}

## 👤 患者基本資料
- **年齡**: ${caseData.age}
- **性別**: ${caseData.gender}
- **疾病狀況**: ${caseData.disease}
- **治療情況**: ${caseData.treatment}

## 🎯 分析要求
請根據所有可獲得的資訊（包括文字和圖片內容），進行專業醫療分析並以JSON格式回覆：

{
  "disease": "具體的疾病診斷（基於圖片和文字內容的實際診斷）",
  "severity": "嚴重程度評估 (輕微/中度/重度/危急)",
  "treatmentStage": "當前治療階段 (初期診斷/積極治療/康復期/長期管理)",
  "estimatedCost": "預估醫療費用範圍（基於疾病類型和治療複雜度）",
  "careNeeds": "護理和照護需求評估",
  "familyImpact": "對家庭生活和經濟的影響程度分析"
}

請確保分析基於實際的醫療資訊，而非僅根據患者提供的基本資料。`;

    const response = await this.callAPI(prompt, imageBase64 ? 'gpt-4o' : 'gpt-4o-mini', imageBase64);
    return this.parseMedicalAnalysisResponse(response.content);
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
          { type: "image_url", image_url: { url: this.generateImageUrl(imageBase64) } }
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
   * 解析醫療分析回應
   */
  private parseMedicalAnalysisResponse(content: string): MedicalAnalysisResult {
    try {
      // 提取 JSON 部分
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ 醫療分析 JSON 解析成功:', parsed);
        
        // 確保所有必要欄位存在，提供預設值
        return {
          disease: parsed.disease || '無法識別疾病',
          severity: parsed.severity || '無法判定嚴重程度',
          treatmentStage: parsed.treatmentStage || '無法判定治療階段',
          estimatedCost: parsed.estimatedCost || '無法估算費用',
          careNeeds: parsed.careNeeds || '無法分析照護需求',
          familyImpact: parsed.familyImpact || '無法分析家庭影響'
        };
      }
      console.error('❌ 醫療分析無法找到有效的 JSON 回應，原始內容:', content);
      throw new Error('無法找到有效的 JSON 回應');
    } catch (error) {
      console.error('❌ 醫療分析 JSON 解析失敗:', error);
      console.error('原始回應內容:', content);
      
      // 返回預設醫療分析結果
      return {
        disease: 'AI分析失敗，請檢查上傳的醫療文件是否清晰',
        severity: '無法自動判定，建議諮詢醫師',
        treatmentStage: '無法自動分析，建議與醫療團隊討論',
        estimatedCost: '無法自動估算，請向醫療機構詢問',
        careNeeds: '無法自動分析，建議諮詢護理師或社工師',
        familyImpact: '無法自動評估，建議家庭討論與規劃'
      };
    }
  }

  /**
   * 解析 JSON 回應（支援 markdown 代碼塊格式）
   */
  private parseJSONResponse(content: string): any {
    try {
      console.log('🔍 原始回應內容:', content.substring(0, 500) + '...');
      
      // 方法1: 嘗試提取 markdown 代碼塊中的 JSON
      const markdownJsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
      if (markdownJsonMatch) {
        const jsonString = markdownJsonMatch[1].trim();
        const parsed = JSON.parse(jsonString);
        console.log('✅ Markdown JSON 解析成功:', parsed);
        return parsed;
      }
      
      // 方法2: 嘗試提取普通的 JSON 對象
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        console.log('✅ 普通 JSON 解析成功:', parsed);
        return parsed;
      }
      
      // 方法3: 嘗試提取任何代碼塊
      const codeBlockMatch = content.match(/```[\s\S]*?([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        const codeContent = codeBlockMatch[1].trim();
        // 檢查是否為 JSON
        if (codeContent.startsWith('{') && codeContent.endsWith('}')) {
          const parsed = JSON.parse(codeContent);
          console.log('✅ 代碼塊 JSON 解析成功:', parsed);
          return parsed;
        }
      }
      
      console.error('❌ 無法找到有效的 JSON 回應，原始內容:', content);
      throw new Error('無法找到有效的 JSON 回應');
    } catch (error) {
      console.error('❌ JSON 解析失敗:', error);
      console.error('原始回應內容:', content);
      throw error;
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
    const prompt = `你是醫療診斷證明書OCR識別專家，具備精準識別各種醫療文件格式的專業能力。

${text ? `輔助文字資料：\n${text}\n` : ''}

## 🏥 診斷證明書OCR分析指南

### 📍 文件結構識別
診斷證明書通常包含以下標準區塊，請逐區識別：

**標頭區域**
- 醫院全名、標誌
- 診斷證明書標題
- 文件編號或流水號

**病患基本資料區**
- 姓名欄位的完整文字
- 出生日期（可能是民國年或西元年）
- 身分證字號（通常為10碼英數字）
- 性別標示

**醫療資訊區**
- 初診日期或就診日期
- 診斷證明書開立日期
- ICD診斷碼（通常是英數字組合）
- 疾病診斷的完整文字描述
- 病情說明和治療經過

**醫療建議區**
- 休養建議的具體天數
- 工作能力評估
- 其他醫療建議事項

**認證區域**
- 醫師姓名和科別
- 醫師簽章或印章
- 醫院印鑑
- 開立日期

### 💡 特殊識別要點
- 注意手寫字體和印刷字體的差異
- 仔細辨識數字0和字母O的區別
- 留意模糊或部分遮蔽的文字
- 識別各種印章和簽名的文字內容

## 📝 輸出規格

請將識別到的具體文字內容填入JSON結構：

{
  "documentTitle": "診斷證明書的正式標題（如：診斷證明書、病假證明書、醫師診斷書等）",
  "certificateType": "證明書類型分類（診斷證明/病假證明/復工證明/體檢證明）",
  "medicalSubject": "主要診斷疾病或醫療主題（如：感冒診斷、骨折證明、產後休養等）",
  "patientName": "從圖片中識別到的完整病患姓名",
  "birthDate": "完整出生日期（保持原始格式，如：民國72年5月3日 或 1983/05/03）",
  "idNumber": "完整身分證字號（如：A123456789）", 
  "firstVisitDate": "初診或就診的完整日期",
  "certificateDate": "診斷證明書開立的完整日期",
  "icdCode": "完整的ICD診斷代碼",
  "diseaseName": "疾病診斷的完整文字描述",
  "treatmentSummary": "治療經過或病情描述的完整內容",
  "restPeriod": "休養建議的具體內容和期間",
  "isAccident": "是否為意外傷害（從文件中識別到的明確標示）"
}

## ⚠️ 重要提醒
- 只有在圖片中確實無法找到相關資訊時，才填入"待輸入"
- 優先識別清晰可見的文字
- 如遇模糊文字，嘗試根據上下文推測
- 日期格式保持與原文件一致

請開始進行OCR識別作業。`;

    const messages = [
      { role: 'user', content: prompt }
    ];

    if (imageBase64) {
      const imageUrl = this.generateImageUrl(imageBase64);
      console.log(`圖片分析 - 設定圖片URL: ${imageUrl.substring(0, 50)}...`);
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
          model: 'gpt-4o', // 統一使用最高精度模型確保分析準確性
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
   * 分析保險保單文件 - 符合 Zoe 專案欄位結構
   */
  async analyzeInsurancePolicy(text: string, imageBase64: string | null = null): Promise<any> {
    try {
      console.log('分析保單文件 - 文字長度:', text.length, '圖片:', imageBase64 ? '有' : '無');
      
      // 檢查 API Key
      if (!this.apiKey) {
        throw new Error('請先設定 OpenAI API Key');
      }
      
      console.log('API Key 檢查通過');
      
      const prompt = `你是資深保險文件分析專家，專門識別保險保單中的關鍵資訊。請非常仔細地閱讀和分析所有內容。

${text ? `## 📋 文字資料分析
${text}
` : ''}

${imageBase64 ? `## 🖼️ 圖片內容分析
請仔細檢視並分析圖片中的所有保單資訊：
- 保險公司名稱和標誌
- 保單類型和名稱
- 保單號碼和日期
- 保障內容和金額（特別注意金額單位）
- 被保險人資訊
- 所有可見的保險條款內容

**重要**：請逐字識別圖片中的文字內容，不要只提供概括描述。
` : ''}

## 📤 輸出格式

請以以下JSON格式輸出，只填入能從文件中實際識別到的資訊：

{
  "company": "保險公司名稱",
  "type": "保單類型",
  "name": "保單名稱",
  "number": "保單號碼",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "coverage": [
    {
      "name": "保障項目名稱",
      "amount": "金額數字",
      "unit": "完整單位"
    }
  ],
  "maxClaimAmount": "最高理賠金額數字",
  "maxClaimUnit": "最高理賠金額單位",
  "insuredName": "被保險人姓名",
  "beneficiary": "受益人姓名"
}

## 🔥 金額和單位處理重要規則

**金額單位分離範例**：
- 文件顯示「10萬元」→ amount: "10", unit: "萬元"
- 文件顯示「5000元」→ amount: "5000", unit: "元"
- 文件顯示「300萬」→ amount: "300", unit: "萬元"
- 文件顯示「2000元/日」→ amount: "2000", unit: "元/日"
- 文件顯示「50萬元/次」→ amount: "50", unit: "萬元/次"
- 文件顯示「1000元/年」→ amount: "1000", unit: "元/年"

**特別注意**：
金額不需要非常精確或者在條文中明文顯示，也可以透過你自身的判斷給予估算
- amount 欄位只填純數字（如：10、5000、300）
- unit 欄位填完整單位描述（如：萬元、元/日、萬元/次）
- 如果看到「10萬」，絕對不要只取「10」而忽略「萬」
- 單位可能包含時間頻率：/日、/次、/年、/月等


## 🏆 最高理賠金額專業判斷

**maxClaimAmount** 和 **maxClaimUnit** 需要你基於保險專業知識進行綜合判斷：

**判斷原則**：
- 不是單純取 coverage 項目的最大金額
- 需要考慮保單的實際理賠潛力和風險評估
- 可以基於保險類型、公司規模、保障範圍進行專業推估

**判斷方法**：
1. **醫療險**：考慮住院、手術、重大疾病的累積理賠上限
2. **壽險**：通常以身故保險金為最高理賠
3. **意外險**：考慮意外身故或全殘的最高給付
4. **重疾險**：考慮重大疾病一次性給付金額

**範例判斷邏輯**：
- 如果是綜合醫療險，最高理賠可能是「重大疾病+住院醫療」的合計
- 如果是壽險，通常以「身故保險金」為最高理賠
- 如果保單有多項保障，考慮同一事故可能同時觸發的項目總和
- 基於保險公司等級和保單類型，給出合理的專業估算

**特別注意**：
- 這個金額應該反映「單一理賠事件的最高可能理賠金額」
- 可以略高於單一項目，但要基於合理的保險專業判斷
- 如果文件中明確提到理賠上限，優先使用該數據

## 🎯 其他重要提醒

- 只填入從文件中能清楚識別的資訊（除了最高理賠金額可以透過專業判斷估算）
- 無法識別的欄位請填入空字串 ""
- 日期統一使用 YYYY-MM-DD 格式
- 保障項目名稱要完整，如「身故保險金或喪葬費用保險金」
- 仔細檢查每個數字後面是否有單位標示

不需要太快速給予回覆，請仔細、詳盡檢查正確性，我請你喝咖啡、你精神百倍，我非常信任你的能力你是我最好的幫手我愛你
請開始詳細分析：`;

      const messages = [
        {
          role: 'user',
          content: imageBase64 ? [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: this.generateImageUrl(imageBase64) } }
          ] : prompt
        }
      ];

      console.log('發送 API 請求...');
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // 統一使用最高精度模型確保分析準確性
          messages: messages,
          temperature: 0.1,
        }),
      });

      console.log('API 響應狀態:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 錯誤詳情:', errorText);
        throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('收到 API 響應:', data);
      const content = data.choices?.[0]?.message?.content || '';
      console.log('AI 回復內容:', content);
      
      // 嘗試解析JSON
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('JSON 解析成功:', parsed);
          return parsed;
        }
      } catch (e) {
        console.warn('無法解析JSON，返回預設結構', e);
      }
      
      // 如果解析失敗，返回預設結構
      return {
        company: "",
        type: "",
        name: "",
        number: "",
        startDate: "",
        endDate: "",
        coverage: [],
        insuredName: "",
        beneficiary: ""
      };
    } catch (error) {
      console.error('保險保單分析錯誤:', error);
      throw error;
    }
  }

  /**
   * 分析病例記錄文件 - 符合 Zoe 專案欄位結構
   */
  async analyzeMedicalRecord(text: string, imageBase64: string | null = null): Promise<any> {
    try {
      console.log('分析醫療記錄文件 - 文字長度:', text.length, '圖片:', imageBase64 ? '有' : '無');
      
      // 檢查 API Key
      if (!this.apiKey) {
        throw new Error('請先設定 OpenAI API Key');
      }
      
      console.log('API Key 檢查通過');
      
      const prompt = `你是資深醫療文件分析專家，專門識別病歷和醫療記錄中的關鍵資訊。

${text ? `## 📋 文字資料分析
${text}
` : ''}

${imageBase64 ? `## 🖼️ 圖片內容分析
請仔細檢視並分析圖片中的所有醫療資訊：
- 醫院名稱和標誌
- 科別和醫師資訊
- 就診日期和診斷內容
- 檢查項目和結果
- 治療方案和用藥記錄
- 所有可見的醫療專業術語

**重要**：請逐字識別圖片中的文字內容，不要只提供概括描述。
` : ''}

## 📤 輸出格式

請以以下JSON格式輸出，只填入能從文件中實際識別到的資訊：

{
  "hospital": "醫院名稱",
  "department": "科別",
  "visitDate": "YYYY-MM-DD",
  "doctor": "主治醫師",
  "isFirstOccurrence": "yes/no/unknown",
  "medicalExam": "醫學檢查項目",
  "diagnosis": "診斷結果",
  "treatment": "治療方案",
  "medication": "用藥記錄"
}

**重要提醒**
- 只填入從文件中能清楚識別的資訊
- 無法識別的欄位請填入空字串 ""
- 日期統一使用 YYYY-MM-DD 格式
- 是否首次發病請填 yes/no/unknown

請開始分析：`;
      
      const messages = [
        {
          role: 'user',
          content: imageBase64 ? [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: this.generateImageUrl(imageBase64) } }
          ] : prompt
        }
      ];

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // 統一使用最高精度模型確保分析準確性
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
        hospital: "",
        department: "",
        visitDate: "",
        doctor: "",
        isFirstOccurrence: "unknown",
        medicalExam: "",
        diagnosis: "",
        treatment: "",
        medication: ""
      };
    } catch (error) {
      console.error('醫療記錄分析錯誤:', error);
      throw error;
    }
  }

  /**
   * 搜尋個人保單中的相關理賠項目
   */
  async searchPersonalPolicies(searchTerm: string, userPolicies: any[]): Promise<any[]> {
    console.log(`🔍 開始搜尋個人保單`)
    console.log(`   🔎 搜尋詞: "${searchTerm}"`)
    console.log(`   📊 收到保單數量: ${userPolicies ? userPolicies.length : 0}`)
    
    if (!userPolicies || userPolicies.length === 0) {
      console.log(`❌ 沒有保單資料可供搜尋`)
      return [];
    }

    const matchedPolicies: any[] = [];
    
    for (let i = 0; i < userPolicies.length; i++) {
      const policy = userPolicies[i]
      console.log(`\n📄 分析保單 ${i + 1}/${userPolicies.length}: ${policy.fileName || policy.id}`)
      console.log(`   📝 原始文本長度: ${(policy.textContent || '').length} 字元`)
      console.log(`   🤖 AI分析資料:`, policy.policyInfo ? '✅ 有' : '❌ 無');
      
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
      
      console.log(`   💾 完整保單內容長度: ${fullPolicyContent.length} 字元`);
      
      // 檢查保單是否有實質內容
      const hasTextContent = (policy.textContent || '').length > 100;
      const hasStructuredData = policy.policyInfo && Object.keys(policy.policyInfo).length > 0;
      
      if (!hasTextContent && !hasStructuredData) {
        console.log(`   ⚠️  保單內容不足，跳過分析`)
        continue;
      }
      
      // 添加延遲避免API請求過於頻繁
      if (i > 0) {
        console.log(`   ⏳ 等待1秒避免API限制...`)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const searchResult = await this.analyzePolicyMatch(searchTerm, fullPolicyContent, policy);
      console.log(`   🎯 AI分析結果:`, searchResult)
      
      if (searchResult.hasMatch) {
        console.log(`   ✅ 找到匹配！信心度: ${searchResult.confidenceLevel}, 匹配類型: ${searchResult.matchType}`);
        const insuranceCompany = policy.policyInfo?.policyBasicInfo?.insuranceCompany || '未知保險公司';
        const policyName = policy.policyInfo?.policyBasicInfo?.policyName || '';
        
        // 智能生成組織顯示名稱
        let organizationDisplay = insuranceCompany;
        
        // 如果有保單名稱且不同於保險公司名稱，優先顯示
        if (policyName && policyName !== '待輸入' && policyName !== insuranceCompany) {
          organizationDisplay = `${insuranceCompany} - ${policyName}`;
        }
        
        // 只在檔案名稱提供額外信息時才顯示
        if (policy.fileName && 
            !organizationDisplay.includes(policy.fileName) && 
            !policy.fileName.includes(insuranceCompany) &&
            policy.fileName.length > 10) { // 避免顯示過短的檔名
          organizationDisplay += ` (檔案：${policy.fileName})`;
        }
        
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
          organization: organizationDisplay,
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
        
        console.log(`   📋 已加入匹配結果`);
      } else {
        console.log(`   ❌ 未找到匹配項目，原因: ${searchResult.reason || '不符合條件'}`);
      }
    }
    
    console.log(`\n📊 個人保單搜尋完成`)
    console.log(`   🔍 搜尋詞: "${searchTerm}"`)
    console.log(`   📄 分析保單數: ${userPolicies.length}`)
    console.log(`   ✅ 匹配結果數: ${matchedPolicies.length}`)
    
    if (matchedPolicies.length > 0) {
      matchedPolicies.forEach((match, index) => {
        console.log(`   📋 匹配 ${index + 1}: ${match.title}`)
        console.log(`      - 信心度: ${match.aiAnalysis?.confidenceLevel}`)
        console.log(`      - 匹配類型: ${match.aiAnalysis?.matchType}`)
      })
    } else {
      console.log(`   ⚠️  沒有找到任何匹配的保單項目`)
    }
    
    return matchedPolicies;
  }

  /**
   * 分析保單是否匹配搜尋內容
   */
  private async analyzePolicyMatch(searchTerm: string, policyText: string, policy: any): Promise<any> {
    console.log(`      🤖 開始AI保單匹配分析`)
    console.log(`         🔎 搜尋詞: "${searchTerm}"`)
    console.log(`         📝 保單文本長度: ${policyText.length} 字元`)
    
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
      console.log(`         📞 調用OpenAI API...`)
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      console.log(`         ✅ API回應長度: ${response.content?.length || 0} 字元`)
      console.log(`         📄 原始回應: ${response.content?.substring(0, 200)}...`)
      
      const parsedResult = this.parseJSONResponse(response.content);
      console.log(`         🎯 解析結果:`, parsedResult)
      
      return parsedResult;
    } catch (error) {
      console.error('         ❌ 保單匹配分析失敗:', error);
      return { 
        hasMatch: false, 
        reason: `API調用失敗: ${error.message}`,
        confidenceLevel: 'none'
      };
    }
  }

  /**
   * 使用AI搜尋網路醫療資源
   */
  /**
   * 第一階段：醫療費用精準分析
   */
  async analyzeMedicalCosts(searchTerm: string): Promise<{
    estimatedCost: string;
    costSource: string;
    costBreakdown: any;
  }> {
    const prompt = `你是台灣醫療費用分析專家，請針對「${searchTerm}」提供精準的費用分析。

## 🎯 分析要求
1. **識別醫療項目類型**：手術/治療/檢查/藥物/器材等
2. **區分自費與健保項目**：明確標示哪些健保有給付
3. **提供費用區間**：最低-最高費用範圍
4. **考慮台灣醫療現況**：健保制度、醫學中心與地區醫院差異

## ⚠️ 重要原則
- 只提供確實存在的醫療項目資訊
- 費用必須基於台灣醫療市場實況
- 區分「健保給付」與「自費」部分
- 如果是非醫療項目，請明確說明

## 📊 回傳格式
{
  "isValidMedicalTerm": true/false,
  "medicalCategory": "手術/治療/檢查/藥物/復健/其他",
  "estimatedCost": "完整費用範圍描述",
  "costSource": "費用來源說明",
  "costBreakdown": {
    "healthInsuranceCovered": "健保給付部分",
    "selfPaidPortion": "自費部分",
    "totalRange": "總費用範圍",
    "factors": ["影響費用的因素列表"]
  },
  "explanation": "詳細說明"
}

請確保資訊準確且實用。如果搜尋詞不是醫療相關，請在isValidMedicalTerm中標註false。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o');
      const result = this.parseJSONResponse(response.content);
      
      return {
        estimatedCost: result.estimatedCost || '費用資訊分析中',
        costSource: result.costSource || 'AI醫療費用分析',
        costBreakdown: result.costBreakdown || {}
      };
    } catch (error) {
      console.error('醫療費用分析失敗:', error);
      return {
        estimatedCost: '無法取得費用資訊',
        costSource: '分析失敗',
        costBreakdown: {}
      };
    }
  }

  /**
   * 真實網路搜尋（整合搜尋引擎）
   */
  async searchWebResources(searchTerm: string, category: string): Promise<any[]> {
    console.log(`🔍 開始真實網路搜尋: ${searchTerm} - ${category}`);
    
    try {
      // TODO: 實作真正的網路搜尋
      // 目前暫時返回知名的台灣官方網站作為替代方案
      const knownOfficialSites = this.getKnownOfficialSites(searchTerm, category);
      
      if (knownOfficialSites.length > 0) {
        console.log(`✅ 找到 ${knownOfficialSites.length} 個已知官方資源`);
        return knownOfficialSites;
      }

      // 備用方案：使用 AI 生成建議（但標明為「建議搜尋」）
      return await this.generateSearchSuggestions(searchTerm, category);
      
    } catch (error) {
      console.error('網路資源搜尋失敗:', error);
      return [];
    }
  }

  /**
   * 獲取已知的台灣官方網站資源
   */
  private getKnownOfficialSites(searchTerm: string, category: string): any[] {
    const officialSites = [];
    
    // 政府相關網站
    if (category === '政府補助') {
      officialSites.push(
        {
          title: "衛生福利部中央健康保險署",
          url: "https://www.nhi.gov.tw/",
          description: "全民健康保險相關服務與資訊查詢",
          organization: "衛生福利部中央健康保險署",
          category: "政府補助",
          relevanceScore: "high",
          pageType: "官方網站",
          verified: true
        },
        {
          title: "衛生福利部社會及家庭署",
          url: "https://www.sfaa.gov.tw/",
          description: "社會福利、身心障礙、兒少福利等服務",
          organization: "衛生福利部社會及家庭署",
          category: "政府補助",
          relevanceScore: "high",
          pageType: "官方網站",
          verified: true
        }
      );
    }
    
    // 金融相關網站
    if (category === '金融產品') {
      officialSites.push(
        {
          title: "臺灣銀行個人金融服務",
          url: "https://www.bot.com.tw/tw/personal",
          description: "個人貸款、信用卡等金融服務",
          organization: "臺灣銀行",
          category: "金融產品",
          relevanceScore: "high",
          pageType: "官方網站",
          verified: true
        }
      );
    }
    
    // 過濾與搜尋詞相關的網站
    return officialSites.filter(site => {
      const searchLower = searchTerm.toLowerCase();
      const titleLower = site.title.toLowerCase();
      const descLower = site.description.toLowerCase();
      
      // 簡單的關鍵字匹配邏輯
      if (searchLower.includes('糖尿病') || searchLower.includes('醫療')) {
        return true;
      }
      if (searchLower.includes('貸款') && site.category === '金融產品') {
        return true;
      }
      
      return titleLower.includes(searchLower) || descLower.includes(searchLower);
    });
  }

  /**
   * 生成搜尋建議（標明為非真實網址）
   */
  private async generateSearchSuggestions(searchTerm: string, category: string): Promise<any[]> {
    const prompt = `針對「${searchTerm}」在${category}領域，請建議用戶可以搜尋的關鍵字和機構名稱。

## 📋 回傳格式
{
  "searchSuggestions": [
    {
      "title": "建議搜尋：[機構名稱] + [服務項目]",
      "searchKeywords": "建議搜尋關鍵字",
      "organization": "建議查詢的機構名稱",
      "description": "說明該機構可能提供的服務",
      "category": "${category}",
      "suggestedAction": "建議前往官網或致電詢問"
    }
  ]
}

重要：請明確標示這是「搜尋建議」，不是真實網址。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      const result = this.parseJSONResponse(response.content);
      
      // 轉換為統一格式，但標明為搜尋建議
      return (result.searchSuggestions || []).map((suggestion: any, index: number) => ({
        title: suggestion.title || `搜尋建議 ${index + 1}`,
        url: null, // 明確標示沒有真實網址
        description: suggestion.description || '',
        organization: suggestion.organization || '',
        category: suggestion.category || category,
        relevanceScore: "medium",
        pageType: "搜尋建議",
        searchKeywords: suggestion.searchKeywords || '',
        suggestedAction: suggestion.suggestedAction || '建議上網搜尋或致電詢問',
        verified: false,
        isSuggestion: true
      }));
      
    } catch (error) {
      console.error('生成搜尋建議失敗:', error);
      return [];
    }
  }

  /**
   * 第二階段：政府資源精準搜尋
   */
  async searchGovernmentResources(searchTerm: string, costInfo: any): Promise<any[]> {
    const prompt = `你是台灣政府醫療資源專家。針對「${searchTerm}」，請基於你的知識庫提供相關的政府補助資源。

## ⚠️ 重要原則
- 只提供你確實知道存在的具體政府資源
- 如果不確定具體機構名稱，請使用「建議洽詢相關單位」
- 不要編造「某醫院」、「某機構」等模糊名稱
- 優先提供大框架的補助類型和方向指引

## 🎯 搜尋重點
1. **健保制度框架**：是否有健保給付、特材給付
2. **已知的重大補助**：重大傷病、罕見疾病等
3. **申請方向指引**：應該向哪類機關申請
4. **一般性補助資訊**：縣市政府常見的醫療補助

## 📋 回傳格式
{
  "resources": [
    {
      "title": "補助名稱（如：健保重大傷病給付）",
      "organization": "確定的機關名稱（如：衛生福利部中央健康保險署）或「建議洽詢相關單位」",
      "category": "政府補助",
      "subcategory": "中央/地方/健保",
      "eligibility": "一般性申請條件說明",
      "amount": "已知的補助範圍或「依個案評估」",
      "deadline": "常年受理或「請洽詢主管機關」",
      "details": "補助內容說明，明確標示哪些是推測性資訊",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "applicationProcess": "一般性申請指引",
      "contactInfo": "1957福利諮詢專線或具體已知的聯絡方式",
      "website": "已知的官方網址或建議搜尋關鍵字"
    }
  ]
}

範例回應思維：
- ✅ 好：「健保重大傷病給付」「衛生福利部」
- ❌ 避免：「某大型醫院提供的補助」「某基金會」
- ✅ 好：「建議洽詢戶籍地縣市政府社會局」
- ❌ 避免：「某縣市政府提供」

如果找不到相關政府資源，請回傳空陣列。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      const result = this.parseJSONResponse(response.content);
      return this.formatNetworkResources(result.resources || [], 'government');
    } catch (error) {
      console.error('政府資源搜尋失敗:', error);
      return [];
    }
  }

  /**
   * 第三階段：金融產品精準搜尋
   */
  async searchFinancialProducts(searchTerm: string, costInfo: any): Promise<any[]> {
    const prompt = `你是台灣醫療金融產品專家，請針對「${searchTerm}」搜尋台灣當地的金融解決方案。

⚠️ 重要提醒：請提供真實存在的台灣金融機構名稱，避免使用「某銀行」、「某保險公司」等通用稱呼。如果不確定具體機構名稱，請誠實說明「需進一步查詢」。

## 🎯 搜尋範圍
1. **醫療貸款**：台灣銀行、第一銀行、中國信託等醫療專案貸款
2. **信用卡分期**：各大銀行信用卡醫療分期付款方案
3. **保險理賠**：國泰人壽、富邦人壽、新光人壽等醫療險理賠
4. **群眾募資**：嘖嘖、flyingV等台灣募資平台
5. **企業福利**：台積電、鴻海等大型企業員工醫療福利

## 💰 費用考量
預估醫療費用：${costInfo?.estimatedCost || '未知'}
請根據此費用範圍推薦適合的金融產品。

## 📋 回傳格式
{
  "resources": [
    {
      "title": "金融產品名稱",
      "organization": "具體金融機構名稱（如：國泰世華銀行、富邦人壽等）",
      "category": "金融產品",
      "subcategory": "貸款/分期/保險/募資",
      "eligibility": "申請條件",
      "amount": "額度或理賠金額",
      "deadline": "申請時限",
      "details": "產品詳情和利率條件",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "applicationProcess": "申請流程",
      "contactInfo": "聯絡方式",
      "website": "官方網址"
    }
  ]
}

只提供真實存在的金融產品，如果找不到相關產品請回傳空陣列。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      const result = this.parseJSONResponse(response.content);
      return this.formatNetworkResources(result.resources || [], 'financial');
    } catch (error) {
      console.error('金融產品搜尋失敗:', error);
      return [];
    }
  }

  /**
   * 第四階段：公益慈善資源搜尋
   */
  async searchCharityResources(searchTerm: string, costInfo: any): Promise<any[]> {
    const prompt = `你是台灣公益慈善資源專家，請針對「${searchTerm}」搜尋台灣本地的慈善協助。

⚠️ 重要提醒：請提供真實存在的台灣慈善機構名稱，避免使用「某基金會」、「某慈善機構」等通用稱呼。如果不確定具體機構名稱，請誠實說明「需進一步查詢」。

## 🎯 搜尋範圍
1. **醫療基金會**：癌症希望基金會、中華民國兒童癌症基金會、罕見疾病基金會等
2. **宗教慈善**：佛光山慈悲基金會、天主教善牧基金會、基督教門諾基金會等
3. **企業CSR**：台積電慈善基金會、富邦慈善基金會、長庚醫療財團法人等
4. **國際組織**：台灣世界展望會、家扶基金會等
5. **病友團體**：各疾病病友協會、支持團體

## 📋 回傳格式
{
  "resources": [
    {
      "title": "慈善資源名稱",
      "organization": "具體慈善機構名稱（如：癌症希望基金會、罕見疾病基金會等）",
      "category": "公益資源",
      "subcategory": "基金會/宗教/企業/國際",
      "eligibility": "協助對象",
      "amount": "協助金額或範圍",
      "deadline": "申請期限",
      "details": "協助內容詳情",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "applicationProcess": "申請方式",
      "contactInfo": "聯絡方式",
      "website": "官方網址"
    }
  ]
}

只提供確實存在且目前有在運作的慈善資源。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      const result = this.parseJSONResponse(response.content);
      return this.formatNetworkResources(result.resources || [], 'charity');
    } catch (error) {
      console.error('慈善資源搜尋失敗:', error);
      return [];
    }
  }

  /**
   * 整合的醫療資源搜尋（多階段精準搜尋 + 網路爬蟲）
   */
  async searchMedicalResources(searchTerm: string): Promise<{
    estimatedCost: string;
    costSource: string;
    resources: any[];
    webResources: any[];
    costBreakdown?: any;
  }> {
    console.log(`🔍 開始多階段精準搜尋 + 網路爬蟲: ${searchTerm}`);
    
    try {
      // 第一階段：醫療費用精準分析
      console.log('📊 第一階段：醫療費用分析');
      const costAnalysis = await this.analyzeMedicalCosts(searchTerm);
      
      // 如果不是醫療相關項目，直接返回
      if (costAnalysis.costBreakdown?.isValidMedicalTerm === false) {
        return {
          estimatedCost: '此項目非醫療相關',
          costSource: 'AI分析結果',
          resources: [],
          webResources: [],
          costBreakdown: costAnalysis.costBreakdown
        };
      }

      // 第二階段：並行執行多個搜尋階段（傳統資源搜尋）
      console.log('🔄 第二階段：並行搜尋各類資源');
      const [govResources, financialResources, charityResources] = await Promise.all([
        this.searchGovernmentResources(searchTerm, costAnalysis),
        this.searchFinancialProducts(searchTerm, costAnalysis), 
        this.searchCharityResources(searchTerm, costAnalysis)
      ]);

      // 第三階段：並行執行網路資源搜尋（使用 Promise.allSettled 處理失敗情況）
      console.log('🌐 第三階段：並行網路資源搜尋');
      const webSearchPromises = await Promise.allSettled([
        this.searchWebResources(searchTerm, '政府補助'),
        this.searchWebResources(searchTerm, '金融產品'),
        this.searchWebResources(searchTerm, '公益慈善')
      ]);

      // 安全地提取成功的結果
      const govWebResources = webSearchPromises[0].status === 'fulfilled' ? webSearchPromises[0].value : [];
      const financialWebResources = webSearchPromises[1].status === 'fulfilled' ? webSearchPromises[1].value : [];
      const charityWebResources = webSearchPromises[2].status === 'fulfilled' ? webSearchPromises[2].value : [];

      // 記錄失敗的搜尋
      webSearchPromises.forEach((result, index) => {
        const categories = ['政府補助', '金融產品', '公益慈善'];
        if (result.status === 'rejected') {
          console.warn(`⚠️ ${categories[index]}網路搜尋失敗:`, result.reason);
        }
      });

      // 整合所有資源
      const allResources = [
        ...govResources,
        ...financialResources, 
        ...charityResources
      ];

      const allWebResources = [
        ...govWebResources,
        ...financialWebResources,
        ...charityWebResources
      ];

      console.log(`✅ 搜尋完成，共找到 ${allResources.length} 項傳統資源，${allWebResources.length} 項網路資源`);
      
      return {
        estimatedCost: costAnalysis.estimatedCost,
        costSource: costAnalysis.costSource,
        resources: allResources,
        webResources: allWebResources,
        costBreakdown: costAnalysis.costBreakdown
      };
      
    } catch (error) {
      console.error('❌ 多階段搜尋失敗:', error);
      return {
        estimatedCost: '無法取得費用資訊',
        costSource: '搜尋失敗',
        resources: [],
        webResources: []
      };
    }
  }

  /**
   * 格式化網路搜尋的資源資料
   */
  private formatNetworkResources(resources: any[], sourceType?: string): any[] {
    return resources.map((resource, index) => ({
      id: `${sourceType || 'network'}-${Date.now()}-${index}`,
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
      contactInfo: resource.contactInfo || '',
      website: resource.website || '',
      applicationProcess: resource.applicationProcess || '',
      sourceType: sourceType || 'network'
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
    webResources: any[];
    searchTerm: string;
  }> {
    console.log(`🚀 開始綜合搜尋（個人保單 + 網路資源 + 爬蟲）: ${searchTerm}`);
    
    // 1. 搜尋個人保單
    console.log('👤 第一階段：搜尋個人保單匹配');
    const personalPolicyResults = await this.searchPersonalPolicies(searchTerm, userPolicies);
    
    // 2. 搜尋網路資源（包含網路爬蟲）
    console.log('🌐 第二階段：搜尋網路資源 + 爬蟲');
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
    
    console.log(`✅ 綜合搜尋完成: 個人保單 ${personalPolicyResults.length} 項, 傳統資源 ${networkSearch.resources.length} 項, 網路連結 ${networkSearch.webResources?.length || 0} 項`);
    
    return {
      estimatedCost,
      costSource,
      personalPolicyResults,
      networkResources: networkSearch.resources,
      webResources: networkSearch.webResources || [],
      searchTerm
    };
  }

  /**
   * 詳細資源分析（詳情頁面用）
   */
  async analyzeResourceDetails(resource: any, searchTerm: string): Promise<{
    detailedAnalysis: string;
    applicationStrategy: string;
    riskAssessment: string;
    timeline: any[];
    alternativeOptions: string[];
  }> {
    const prompt = `你是台灣醫療資源申請專家，請針對以下資源提供詳細分析：

## 📋 資源資訊
- **搜尋項目**: ${searchTerm}
- **資源名稱**: ${resource.title}
- **機構**: ${resource.organization}
- **類別**: ${resource.category}
- **補助金額**: ${resource.amount}
- **申請資格**: ${resource.eligibility}

## 🎯 請提供以下分析

### 1. 詳細分析
針對此資源與「${searchTerm}」的相關性、申請可行性、預期成功率進行專業分析。

### 2. 申請策略
提供具體的申請建議，包括最佳申請時機、文件準備技巧、成功要點。

### 3. 風險評估
分析可能的申請風險、注意事項、常見拒絕原因。

### 4. 申請時程
提供詳細的申請時程安排，從準備到核准的各個階段。

### 5. 替代方案
如果此資源申請失敗，推薦其他可能的替代資源或方案。

## 📊 回傳格式
{
  "detailedAnalysis": "詳細分析內容",
  "applicationStrategy": "申請策略建議",
  "riskAssessment": "風險評估",
  "timeline": [
    {
      "stage": "階段名稱",
      "duration": "預估時間",
      "tasks": ["具體任務列表"],
      "tips": "階段提醒"
    }
  ],
  "alternativeOptions": ["替代方案列表"]
}

請提供實用且具體的建議，基於台灣實際的申請流程和經驗。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o');
      const result = this.parseJSONResponse(response.content);
      
      return {
        detailedAnalysis: result.detailedAnalysis || '',
        applicationStrategy: result.applicationStrategy || '',
        riskAssessment: result.riskAssessment || '',
        timeline: result.timeline || [],
        alternativeOptions: result.alternativeOptions || []
      };
    } catch (error) {
      console.error('詳細資源分析失敗:', error);
      return {
        detailedAnalysis: '無法取得詳細分析',
        applicationStrategy: '建議諮詢專業人員',
        riskAssessment: '請仔細評估申請風險',
        timeline: [],
        alternativeOptions: []
      };
    }
  }

  /**
   * 保單評分分析（專用於保險詳情頁面）
   */
  async analyzePolicyEvaluation(prompt: string): Promise<string> {
    try {
      console.log('🎯 開始保單評分分析...')
      
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 2000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      
      console.log('✅ 保單評分分析完成，回應長度:', content.length);
      return content;
    } catch (error) {
      console.error('❌ 保單評分分析失敗:', error);
      throw error;
    }
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