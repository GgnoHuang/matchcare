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