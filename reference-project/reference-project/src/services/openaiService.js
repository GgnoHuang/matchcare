/**
 * OpenAI API 服務
 * 處理保單理賠判定的 AI 分析
 */

export class OpenAIService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1/chat/completions';
  }

  /**
   * 分析保單理賠條件
   * @param {string} policyText - 保單條款文字
   * @param {object} caseData - 案例資料
   * @param {string} imageBase64 - 圖片base64 (可選)
   * @returns {Promise<object>} AI 分析結果
   */
  async analyzeClaimEligibility(policyText, caseData, imageBase64 = null) {
    const prompt = this.buildPrompt(policyText, caseData);
    
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
      messages[0].content.push({
        type: "image_url",
        image_url: {
          url: imageBase64
        }
      });
    }

    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      return this.parseResponse(data);
    } catch (error) {
      console.error('OpenAI API 調用失敗:', error);
      throw new Error(`AI 分析失敗: ${error.message}`);
    }
  }

  /**
   * 構建分析提示語
   */
  buildPrompt(policyText, caseData) {
    return `你是一位熟悉台灣醫療保險條款的理賠專員。以下是某張保單的條款內容：

---
${policyText}
---

這是使用者提供的案例資料：
---
年齡: ${caseData.age}
性別: ${caseData.gender}
疾病: ${caseData.disease}
治療方式: ${caseData.treatment}
其他說明: ${caseData.notes || '無'}
---

請根據保單條款判斷：此案例是否可能符合理賠條件？

請以以下格式回覆：
1. 判定結果：[符合理賠/不符合理賠/需要更多資料]
2. 相關條款：[引用具體條款內容]
3. 判定原因：[詳細說明理由]
4. 建議事項：[給予使用者的建議]`;
  }

  /**
   * 解析 AI 回應
   */
  parseResponse(data) {
    const content = data.choices?.[0]?.message?.content || '無法取得 AI 回應';
    
    return {
      success: true,
      content: content,
      usage: data.usage,
      timestamp: new Date().toISOString()
    };
  }
}