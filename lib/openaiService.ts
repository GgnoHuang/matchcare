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
      (messages[0].content as any).push({
        type: "image_url",
        image_url: {
          url: imageBase64
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
          { type: "image_url", image_url: { url: imageBase64 } }
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