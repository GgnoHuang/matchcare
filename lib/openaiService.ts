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
    const HARD_CODED_KEY = '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'
    // 優先順序：參數 > localStorage > 硬編碼
    let resolvedKey = apiKey || ''
    try {
      if (!resolvedKey && typeof window !== 'undefined') {
        const stored = localStorage.getItem('openai_api_key')
        resolvedKey = stored || ''
        if (!stored) {
          localStorage.setItem('openai_api_key', HARD_CODED_KEY)
          resolvedKey = HARD_CODED_KEY
        }
      }
    } catch {}
    if (!resolvedKey) {
      resolvedKey = HARD_CODED_KEY
    }
    this.apiKey = resolvedKey
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
          max_tokens: model.includes('gpt-4') ? 4000 : 3000,
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
- 文件顯示「20%」→ amount: "20", unit: "%"
- 文件顯示「3倍」→ amount: "3", unit: "倍"

**特別注意**：
金額不需要非常精確或者在條文中明文顯示，也可以透過你自身的判斷給予估算
- amount 欄位只填純數字（如：10、5000、300）
- unit 欄位填完整單位描述（如：萬元、元/日、萬元/次）
- 如果看到「10萬」，絕對不要只取「10」而忽略「萬」
- 單位可能包含時間頻率：/日、/次、/年、/月等
- coverage 項目允許出現百分比或倍數（如：% 或 倍）


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
   * 第一階段：簡單測試 prompt
   * 用途：流程穿插測試，不涉及資料處理
   */
  async testPromptStage(text: string): Promise<string> {
    try {
      console.log('go第一階段-測試 prompt 開始');

      if (!this.apiKey) {
        throw new Error('請先設定 OpenAI API Key');
      }

      // 簡單的測試 prompt
      const prompt = `你好，
      
      ${text ? `請問看得到以下文字嗎？${text}` : ''}

我希望你可以閱讀保單之後，給我以下列點式的回應，
做一個保單理賠、給付、對象、條件的歸納總結，
此列點項目的目的是為了判斷是否符合理賠條件而做的關鍵點，15-20點(重要和關鍵度優先)：


請使用此保單文本內容，幫我列點歸納總結，請詳細閱讀和思考，我愛你，
歸納的方向都是為了判斷是否可以理賠或是補助或者運用到此保險資源，
給我1.2.3.4.5.6.7.8....等列點 不要有太多其他多餘的，
我之後會透過 “意外（車禍、摔傷）、疾病（癌症、心臟病）、年老死亡、手術種類、醫療行為、住院” 等病歷內容或事故內容去比對你提供給我的這些列點，
所以你的列點方向就是讓我後續餵給ai病例時透過可以這些列點，讓他可以判斷「什麼時候能得到保障、保障到什麼程度」
列點給我：1.2.3.4.5.6.7.8...有序列表點，按照文本內容多寡及重要度選擇列出15-20項,不要有太多其他多餘的回應，
請你謹慎閱讀，我請你喝咖啡我愛你
請詳細閱讀和思考，我愛你，
此為範本：
1.滿期生存給付：被保險人於保險期間屆滿仍生存時，給付滿期保險金額（月繳保險費年化總額的50%）
2.身故保險金給付：被保險人身故時給付當年度保險金額（月繳保險費年化總額的1.1倍）
3.意外事故身故加給：因意外傷害事故180日內身故，除身故保險金外，另給付保險金額100%
4.交通意外事故身故雙倍給付：因交通意外傷害事故180日內身故，除身故保險金外，另給付保險金額200%
5.意外事故失能保險金：因意外傷害事故180日內致失能，按附表二失能等級比例給付（1-11級，5%-100%）
6.交通意外事故失能雙倍給付：因交通意外傷害事故致失能，按保險金額200%及失能等級比例給付
7.意外失能生活補助金：因意外致第1-6級失能，按月給付保險金額3%，最多120個月
8.保險費豁免：因意外致第1-6級失能，豁免失能確定日後續期保險費
9.傷害醫療日額保險金：因意外住院治療，按保險金額千分之一×住院日數給付（每次最多90日）
10.骨折未住院給付：因意外骨折未住院或住院日數不足，按骨折部位給付保險金額萬分之五×對應日數
11.傷害出院療養保險金：因意外住院治療後出院，按保險金額萬分之五×住院日數給付（每次最多90日）
12.傷害住院手術醫療保險金：因意外住院期間接受手術，給付保險金額2%
13.意外創傷縫合處置保險金：因意外接受縫合處置，臉部5公分以上給付1%，其他給付0.1%
14.重大燒燙傷保險金：因意外致重大燒燙傷（顏面燒燙傷合併五官功能障礙或燒燙傷面積達全身20%以上），給付保險金額50%
15.職業限制：被保險人職業須為第1-6類，變更為拒保職業將終止契約或不予理賠
16.除外責任：故意自殺（2年內）、犯罪、酒駕、戰爭、核災不予理賠
17.不保事項：從事角力、摔跤、柔道、空手道、跆拳道、馬術、拳擊、特技表演、車輛競賽等不予理賠
18.180日因果關係認定：意外事故超過180日後發生的失能或身故，需證明與該意外事故有因果關係
19.受監護宣告者限制：身故保險金變更為喪葬費用保險金，且有額度限制（遺產稅喪葬費扣除額之半數）
20.申請時效：保險事故發生後需於知悉後10日內通知保險公司，權利請求時效為2年

特別注意如果內容很關鍵但是你不確定的話也可以列點，但是請標註這個部分是有所保留的，有待商確的。請仔細思考，我請你喝咖啡你是我最好的幫手我愛你

      `;

      // 提醒AI這是理賠條件歸納
      const finalPrompt = `${prompt}

重要提醒：請直接以字串格式回應，不需要JSON包裝。回應內容將直接儲存為理賠條件列點供後續系統使用。`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o', // 使用更強的模型進行理賠條件分析
          messages: [
            { role: 'user', content: finalPrompt }
          ],
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || '';
      
      console.log('第一階段-理賠條件歸納結果:', result);
      return result;
    } catch (error) {
      console.error('第一階段測試錯誤:', error);
      throw error;
    }
  }

  /**
   * 第二階段：保單結構化萃取（不減少現有提示內容，只在結構與輸出上加強）
   * 目標：輸出與現有儲存結構相容的 policyInfo（含 policyBasicInfo 與 coverageDetails.coverage）
   */
  async summarizeInsurancePolicy(text: string, imageBase64: string | null = null): Promise<any> {
    try {
      console.log('第二階段-保單摘要：文字長度:', text?.length || 0, '圖片:', imageBase64 ? '有' : '無');

      if (!this.apiKey) {
        throw new Error('請先設定 OpenAI API Key');
      }

      const prompt = `你是資深保險文件分析專家，專門識別保險保單中的關鍵資訊。請非常仔細地閱讀和分析所有內容。

            ${text ? `## 📋 文字資料分析${text}` : ''}

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

            ## 📤 輸出格式（請同時提供兩個區塊，第二區塊為本系統主用）

            ### A) flatFields（保留原有需求）
            {
              "company": "保險公司名稱",
              "type": "保單類型（必須三選一：醫療險/重疾險/意外險）",
              "name": "保單名稱",
              "number": "保單號碼",
              "startDate": "YYYY-MM-DD",
              "endDate": "YYYY-MM-DD",
              "coverage": [
                { "name": "保障項目名稱", "amount": "金額數字", "unit": "完整單位" }
              ],
              "maxClaimAmount": "最高理賠金額數字",
              "maxClaimUnit": "最高理賠金額單位",
              "insuredName": "被保險人姓名",
              "beneficiary": "受益人姓名"
            }

            ### B) policyInfo（本系統主用；請嚴格符合此結構字段命名）
            {
              "policyBasicInfo": {
                "insuranceCompany": "保險公司名稱",
                "policyName": "保單名稱",
                "policyType": "保單類型（必須三選一：醫療險/重疾險/意外險）",
                "policyNumber": "保單號碼",
                "effectiveDate": "YYYY-MM-DD",
                "expiryDate": "YYYY-MM-DD",
                "policyTerms": "（可選）條款重點或原文摘錄"
              },
              "coverageDetails": {
                "coverage": [
                  { "name": "保障項目名稱", "amount": "金額數字", "unit": "完整單位" }
                ]
              },
              "insuredPersonInfo": {
                "name": "（可選）被保險人姓名"
              },
              "beneficiaryInfo": {
                "name": "（可選）受益人姓名"
              }
            }
              
            特別注意policyTerms輸出規範（務必遵守）：
            僅以 單行文字 輸出保單條款，各項以 半形逗號+空格 分隔。
            金額：用阿拉伯數字，不要加千分位逗號（例：3000、100000、500000）。
            非金額的數字（例如天數、次數上限等）請改為中文數字（例：一百八十天、三十天）。
            每項格式固定為：
            　　{項目名稱} {金額}元/{頻率}(可選的補充說明)
            　　例：住院醫療 3000元/日(最多一百八十天)
            不可出現重複空白、全形標點或混用全形逗號。
            禁止在金額中出現任何非數字字元（不可有逗號、空白、文字）。
            範例（完全照這種風格）：
            住院醫療 3000元/日(最多一百八十天), 手術費用 100000元/次, 癌症治療 500000元/年


            ## 🧭 保單類型歸類規則（強制）
            - 請根據保障內容將保單類型歸入以下三類之一：
              1) 醫療險（住院日額、手術費、實支實付、門診、住院醫療等）
              2) 重疾險（重大疾病、癌症一次給付、特定疾病一次金等）
              3) 意外險（意外身故/失能/傷害醫療、骨折/燒燙傷等意外相關）
            - 若原文出現不在三類中的名稱（如：壽險、年金、壽險附約），請判斷其保障重點並歸入三類中「最接近的一類」，並在必要時於 flatFields 的說明性欄位（如 notes）或 policyTerms 摘要中簡短說明歸類理由。
            - A) 的 type 與 B) 的 policyBasicInfo.policyType 兩處必須一致且僅能填寫：醫療險/重疾險/意外險。

            ## 🔥 金額與單位規則
            - 金額只填純數字（如：10、5000、300），單位填完整描述（如：萬元、元/日、萬元/次）。
            - 「10萬」請拆為 amount: "10"、unit: "萬元/次""元/日"。
            - 單位可包含時間頻率：/日、/次、/年、/月。

            ## 🏆 最高理賠金額專業判斷（flatFields 中）
            - 不是單純取 coverage 項目的最大金額。
            - 需考慮保單類型、保障可同時觸發的可能性與條款上限。
            - 若文件明確載明理賠上限，優先使用。
            - 請輸出「單一理賠事件的整筆金額」，單位僅能是「元/萬元/百萬元/新台幣元/新台幣萬元」。
            - 禁止在 maxClaimUnit 中出現任何時間/頻率字樣（例如：/日、/次、/年、/月、日、次、年、月、天）。
            - 若只能得到日額或次額，請推估單一事故最高整筆金額；無法合理推估則將 maxClaimAmount 與 maxClaimUnit 留空字串。
            - 為避免顯示 0 元，若缺乏明確上限，請提供保守估算並於 notes 說明（除非條款明文為 0 元，需在 notes 引用條款要點）。

            ## 🎯 其他提醒
            - 只填入從文件可清楚識別的資訊；無法識別者填空字串。日期用 YYYY-MM-DD。
            - 回傳 JSON 時，請同時包含 A) 與 B) 兩個區塊於同一個最外層物件：{ "flatFields": {...}, "policyInfo": {...} }。`;

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
          model: 'gpt-4o',
          messages: messages,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API 錯誤: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      // 嘗試解析包含 flatFields 與 policyInfo 的最外層 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          // 友善列印關鍵摘要
          try {
            const ff = parsed.flatFields || {};
            const pi = parsed.policyInfo || {};
            const basic = pi.policyBasicInfo || {};
            const cov = (pi.coverageDetails && pi.coverageDetails.coverage) || ff.coverage || [];
            console.log('[AI] 保單摘要-關鍵欄位');
            console.log(`  公司: ${ff.company || basic.insuranceCompany || ''}`);
            console.log(`  類型: ${ff.type || basic.policyType || ''}`);
            console.log(`  名稱: ${ff.name || basic.policyName || ''}`);
            console.log(`  號碼: ${ff.number || basic.policyNumber || ''}`);
            console.log(`  期間: ${ff.startDate || basic.effectiveDate || ''} ~ ${ff.endDate || basic.expiryDate || ''}`);
            console.log(`  保障數: ${Array.isArray(cov) ? cov.length : 0}`);
            if (Array.isArray(cov)) {
              cov.slice(0, 5).forEach((item: any, idx: number) => {
                console.log(`   - [${idx + 1}] ${item.name || item.type || ''} ${item.amount || ''}${item.unit || ''}`);
              });
            }
            if (ff.maxClaimAmount || ff.maxClaimUnit) {
              console.log(`  (flat) 最高理賠: ${ff.maxClaimAmount || ''}${ff.maxClaimUnit || ''}`);
            }
          } catch {}
          // 後備：若模型未包一層，嘗試組裝
          if (!parsed.policyInfo && (parsed.policyBasicInfo || parsed.coverageDetails)) {
            return { flatFields: {}, policyInfo: parsed };
          }
          if (!parsed.flatFields && (parsed.company || parsed.coverage)) {
            return { flatFields: parsed, policyInfo: {} };
          }
          return parsed;
        } catch (e) {
          console.warn('第二階段 JSON 解析失敗，返回空結構', e);
        }
      }

      return { flatFields: {}, policyInfo: {} };
    } catch (error) {
      console.error('保單摘要錯誤:', error);
      throw error;
    }
  }

  /**
   * 第三階段：基於摘要推理（填補/推估所需欄位，例如最高理賠金額…）
   * 輸入為第二階段的 policyInfo（以及可選 flatFields），輸出 analysisResult 給前端顯示與後續流程。
   */
  async analyzePolicyFromSummary(summary: { policyInfo: any, flatFields?: any }): Promise<any> {
    const prompt = `你是保險理賠與條款專家。以下是保單的結構化摘要，請在不臆測不存在條款的前提下，完成推理：

## 保單摘要（policyInfo）
${JSON.stringify(summary?.policyInfo || {}, null, 2)}

${summary?.flatFields ? `## 其他摘要（flatFields）\n${JSON.stringify(summary.flatFields, null, 2)}` : ''}

## 🎯 任務
1. 專業判斷「單一理賠事件的最高可能理賠金額」與單位（maxClaimAmount / maxClaimUnit）。
2. 如無明確上限，請基於險種、常見疊加情境與條款慣例給出合理推估（並在 notes 中說明假設）。
3. 僅在摘要已有資訊的範圍內推理，避免臆造條款。
4. 檢查並補全保單類型歸類：如 flatFields.type 或 policyInfo.policyBasicInfo.policyType 缺失或不在三類（醫療險/重疾險/意外險），請依保障內容歸入最接近的一類，兩處欄位必須一致。

## 🧮 規則
- 不等於 coverage 最大值；需考慮條款是否可同時觸發、是否有總限額。
- 有明確上限則優先採用。
- maxClaimAmount 不得為空或 0。除非條款「明文」規定無理賠/0 元，才可回傳 0，並在 notes 引用條款原文要點。
- 若資料不足，必須提供保守估算（合理區間中偏保守值），並於 notes 清楚說明估算依據與限制。
- maxClaimUnit 僅能為貨幣單位（元/萬元/百萬元/新台幣元/新台幣萬元），禁止任何時間/頻率或百分比字樣（/日、/次、/年、/月、日、次、年、月、天、%）。

## 📤 回傳 JSON 格式（請務必滿足『單位限制』）
{
  "maxClaimAmount": "數字（純數字）",
  "maxClaimUnit": "單位（限定：元/萬元/百萬元/新台幣元/新台幣萬元；禁止：/日、/次、/年、/月、日、次、年、月、天）",
  "notes": "請務必詳盡，至少涵蓋以下 7 項：\n1) 依據條款與原文摘錄（若可，指出條號或段落標題）\n2) 可同時觸發之保障清單與互斥關係\n3) 等待期/除外/既往症對理賠的影響\n4) 將日額/次額換算為單一事故整筆金額的公式與步驟\n5) 三種情境估算（保守/基準/樂觀）與理由\n6) 不確定性來源與需補充的文件清單\n7) 綜合判斷與建議（為何採用此最高理賠數字）"
}

## ✅ 自我檢查清單
- [ ] maxClaimUnit 不含任何時間/頻率字樣（/日、/次、年、月、天、日）。
- [ ] 若只能得到日額或次額，已換算為單一事故最高可得之整筆金額或留空。
- [ ] 如金額極低（例如 < 1000 元），請重新檢視推理依據，避免誤把天數或次數當金額。`;

    // 使用更高容量模型以獲得更完整的 notes 與推理細節
    const response = await this.callAPI(prompt, 'gpt-4o');
    const result = this.parseJSONResponse(response.content);

    const payload = {
      maxClaimAmount: result.maxClaimAmount || '',
      maxClaimUnit: result.maxClaimUnit || '元',
      notes: result.notes || ''
    };

    try {
      console.log('[AI] 保單推理-最高理賠');
      console.log(`  maxClaimAmount: ${payload.maxClaimAmount}`);
      console.log(`  maxClaimUnit  : ${payload.maxClaimUnit}`);
      if (payload.notes) console.log(`  notes         : ${payload.notes}`);
    } catch {}

    return payload;
  }

  /**
   * 分析病例記錄文件 - 符合 Zoe 專案欄位結構
   */
  /**
   * 合併的醫療文件分析方法 - 支援病歷和診斷證明
   */
  async analyzeMedicalDocument(text: string, imageBase64: string | null = null): Promise<any> {
    try {
      console.log('分析醫療記錄文件 - 文字長度:', text.length, '圖片:', imageBase64 ? '有' : '無');
      
      // 檢查 API Key
      if (!this.apiKey) {
        throw new Error('請先設定 OpenAI API Key');
      }
      
      console.log('API Key 檢查通過');
      
//       const prompt = `你是資深醫療文件分析專家，專門識別病歷和醫療記錄中的關鍵資訊。

// ${text ? `## 📋 文字資料分析
// ${text}
// ` : ''}

// ${imageBase64 ? `## 🖼️ 圖片內容分析
// 請仔細檢視並分析圖片中的所有醫療資訊：
// - 醫院名稱和標誌
// - 科別和醫師資訊
// - 就診日期和診斷內容
// - 檢查項目和結果
// - 治療方案和用藥記錄
// - 所有可見的醫療專業術語

// **重要**：請逐字識別圖片中的文字內容，不要只提供概括描述。
// ` : ''}

// ## 📤 輸出格式

// 請以以下JSON格式輸出，只填入能從文件中實際識別到的資訊：

// {
//   "hospital": "醫院名稱",
//   "department": "科別",
//   "visitDate": "YYYY-MM-DD",
//   "doctor": "主治醫師",
//   "isFirstOccurrence": "yes/no/unknown",
//   "medicalExam": "醫學檢查項目",
//   "diagnosis": "診斷結果",
//   "treatment": "治療方案",
//   "medication": "用藥記錄"
// }

// **重要提醒**
// - 只填入從文件中能清楚識別的資訊
// - 無法識別的欄位請填入空字串 ""
// - 日期統一使用 YYYY-MM-DD 格式
// - 是否首次發病請填 yes/no/unknown

// 請開始分析：`;
      

      const prompt = `你是資深醫療文件分析專家，專門識別各種醫療文件（病歷、診斷證明書、檢查報告等）中的關鍵資訊。

            ## 📋 文件類型智能判斷
            請先判斷文件類型，然後提取相應資訊：
            - **病歷記錄**：門診或住院記錄、就診紀錄
            - **診斷證明書**：正式醫療證明文件
            - **檢查報告**：各種醫學檢驗結果

            ${text ? `## 📋 文字資料分析
            ${text}
            ` : ''}

            ${imageBase64 ? `## 🖼️ 圖片內容分析
            請仔細檢視並分析圖片中的所有醫療資訊：

            **基本資訊區域**
            - 醫院名稱與標誌（通常在表頭）
            - 文件標題類型（病歷、診斷證明、檢查報告等）
            - 病患姓名、出生日期、身分證字號（如有顯示）
            - 就診科別與醫師姓名

            **醫療內容區域**  
            - 就診日期或檢查日期
            - 診斷代碼與診斷名稱（ICD碼或中文診斷）
            - 主要疾病或醫療主題
            - 檢查或檢驗項目（如X光、心電圖等）
            - 治療方案與處置建議
            - 用藥記錄（藥名、劑量、天數等）
            - 休養建議或工作限制

            **認證資訊區域**
            - 醫師簽章或印章
            - 證明書開立日期
            - 是否為意外傷害相關

            **重要規則**：
            1. 必須逐字識別文件中的資訊，嚴禁只給概括描述
            2. 不同格式文件欄位名稱不同，要能正確對應抽取
            3. 如果某欄位沒有出現，就填入空字串 ""
            4. 不可憑常識或經驗補充資料，只能來自實際文件內容
            5. 日期一律轉換為 YYYY-MM-DD 格式
            6. "isFirstOccurrence" 請依文件內容判斷：若明確顯示為初診填 yes，若顯示為複診填 no，否則填 unknown
            ` : ''}

            ## 📤 標準輸出格式

            請務必以以下JSON格式輸出（對齊病歷編輯頁面欄位）：

            {
              "patientName": "患者姓名",
              "patientAge": "年齡（數字）",
              "patientGender": "性別（male/female/other）",
              "hospitalName": "醫院名稱",
              "department": "科別",
              "doctorName": "主治醫師",
              "visitDate": "就診日期 YYYY-MM-DD",
              "isFirstOccurrence": "是否首次發病（yes/no/unknown）",
              "medicalExam": "醫學檢查項目",
              "diagnosis": "診斷結果",
              "symptoms": "症狀描述",
              "treatment": "治療方式",
              "medications": "用藥記錄",
              "notes": "備註"
            }

            **重要提醒**：
            - 保持所有欄位固定，即使文件未提供該資訊也要輸出該欄位，值為 ""
            - 僅能依據文件實際內容填寫，禁止推測或臆測
            - patientAge 填入純數字，如 "45"
            - patientGender 只能填 "male", "female", "other" 三選一
            - isFirstOccurrence 只能填 "yes", "no", "unknown" 三選一
            - visitDate 統一格式為 YYYY-MM-DD

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
      console.error('醫療文件分析錯誤:', error);
      throw error;
    }
  }

  /**
   * 向後兼容的病歷分析方法 - 直接使用新格式
   */
  async analyzeMedicalRecord(text: string, imageBase64: string | null = null): Promise<any> {
    // 直接使用新的格式，不再需要轉換
    return await this.analyzeMedicalDocument(text, imageBase64);
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
        reason: `API調用失敗: ${error instanceof Error ? error.message : '未知錯誤'}`,
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






 async searchGovernmentResources(searchTerm: string, costInfo: any): Promise<any[]> {
    const prompt = `你是台灣政府醫療資源專家。針對「${searchTerm}」，請基於你的知識庫提供相關的政府補助資源。

## 🔍 智能搜尋策略

### 1. 醫療程序/治療/場景基礎分析
- 當用戶輸入醫療程序（如：開刀、化療、復健）→ 分析對應的常見疾病類型
- 當用戶輸入治療場景（如：住院、門診、長照）→ 匹配相關補助類型
- 當用戶輸入特定疾病→ 直接匹配專病補助

### 2. 搜索詞分類邏輯
- **過於狹窄**：單一症狀 → 拓展至相關疾病群組
- **過於廣泛**：一般醫療 → 聚焦於高需求補助項目
- **適中範圍**：特定疾病或治療 → 直接精準匹配

### 3. 搜尋優先級
1. **高優先級**：健保重大傷病、罕見疾病、身心障礙
2. **中優先級**：縣市醫療補助、特定疾病專案
3. **低優先級**：一般性醫療費用減免

## ⚠️ 重要原則
- 只提供你確實知道存在的具體政府資源
- 如果不確定具體機構名稱，請使用「建議洽詢相關單位」
- 不要編造「某醫院」、「某機構」等模糊名稱
- 優先提供大框架的補助類型和方向指引

## 🎯 搜尋重點
1. **健保制度框架**：是否有健保給付、特材給付、重大傷病卡
2. **已知的重大補助**：重大傷病、罕見疾病、身心障礙
3. **中央政府資源**：衛福部、勞動部、原民會等專案補助
4. **地方政府資源**：縣市政府社會局醫療補助
5. **慈善基金會**：如慈濟基金會、陽光基金會等知名機構

## 📋 回傳格式
{
  "resources": [
    {
      "title": "補助名稱（如：健保重大傷病給付）",
      "organization": "確定的機關名稱（如：衛生福利部中央健康保險署）或「建議洽詢相關單位」",
      "category": "政府補助",
      "subcategory": "中央/地方/健保/慈善",
      "eligibility": "具體申請條件說明，包含收入限制、疾病條件、身份要求等",
      "amount": "具體補助金額範圍或比例（如：每月最高3萬元、醫療費用80%等），如不確定則註明「依個案評估」",
      "deadline": "申請期限說明（如：常年受理、事故發生後30天內、每年3-5月申請等）",
      "details": "補助內容詳細說明，包含給付項目、使用限制、注意事項等",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "applicationProcess": "詳細申請流程，包含所需文件、申請地點、審核時間等",
      "contactInfo": "具體聯絡方式：電話號碼、地址或1957福利諮詢專線",
      "websites": ["官方網址1", "相關資訊網址2", "申請表單網址3"]
    }
  ]
}
以下是範本，我搜尋的關鍵字為：“達文西手術”
用戶輸入的關鍵字格式為：「 醫療行為or 治療方式 or情境（例如:80歲老人跌倒導致骨折、3歲嬰兒因為保母照顧不周導致肺部感染）」，此關鍵字用來搜尋相關台灣國內補助和補助資源（企業、政府、社會福利...等）， 透過ai的專業知識以及搜尋能力幫我找到 ，
如果此醫療行為或症狀太過狹隘或資訊不足，那也請思考並幫我歸類此醫療行為，
透過概括的方式去查找，我希望得到以下幾個關鍵欄位 
1.申請資格（例如ＸＸ員工，台灣公民，ＹＹ成員..等） 
2.補助/理賠金額 
3.申請期限(例如：常年受理) 基本描述（例如：針對罹患重大疾病的台積電正職員工，提供醫療費用補助、有薪病假等福利） 
4.相關連結（申請的網站為優先）
如果查找與思考後的資料為（以達文西手術為例）：
社會福利／民間補助：慈濟基金會醫療補助（全台受理，社工評估）
1. 申請資格 居住台灣地區、因病或重大事故導致經濟困難的個人／家庭；需提供基本資料與經濟狀況證明，經社工訪視評估。 tw.tzuchi.org tzhchi.my.salesforce-sites.com
2.補助／理賠金額 不詳／個案評估（可涵蓋醫療費、醫療器材耗材、健保費、就醫交通等類別，金額依審核結果核定）。 tw.tzuchi.org
3.申請期限＋基本描述 常年受理；屬急難／醫療補助，走個案審核流程，建議先由醫院社工或本人向就近慈濟社服組聯繫啟動。 tw.tzuchi.org
4.相關連結(多筆)（開頭一定要給我https的）
https://tw.tzuchi.org/%E6%85%88%E5%96%84%E6%95%91%E5%8A%A9?utm_source=chatgpt.com
https://tzhchi.my.salesforce-sites.com/linewebhook/FAQ?Common=Y&sub=U91c58760985209a37b23fdf3eb5f0dd1&utm_source=chatgpt.com
https://tw.tzuchi.org/%E6%85%88%E5%96%84%E6%95%91%E5%8A%A9?utm_source=chatgpt.com
那麼請給我輸出格式如下
{
“title”: “慈濟基金會醫療補助“,
“organization”: “佛教慈濟慈善事業基金會“,
“category”: “社會福利“,
“subcategory”: “慈善團體“,
“eligibility”: “居住台灣、因病或重大事故導致經濟困難的個人／家庭；需提供基本資料與經濟狀況證明，經社工訪視評估。“,
“amount”: “依個案評估（可涵蓋醫療費、耗材費、健保費、交通費等）。“,
“deadline”: “常年受理“,
“details”: “屬急難/醫療補助，經社工評估後依需求核定補助內容與金額。金額範圍無公開數據。“,
“priority”: “medium”,
“status”: “conditional”,
“applicationProcess”: “可透過醫院社工或直接聯繫慈濟社服組提出申請，需提交財力及病情資料。“,
“contactInfo”: “慈濟基金會服務專線 03-826-6779（總會）“,
“website”: [“https://tw.tzuchi.org.tw/”,“https://tw.tzuchi.org/%E6%85%88%E5%96%84%E6%95%91%E5%8A%A9?utm_source=chatgpt.com”]
}

## 🌟 參考範例 - 慈濟基金會醫療補助
{
  "title": "慈濟基金會急難醫療補助",
  "organization": "佛教慈濟慈善事業基金會",
  "category": "慈善補助",
  "subcategory": "慈善",
  "eligibility": "1.低收入戶或中低收入戶 2.醫療費用超過家庭收入負擔能力 3.非健保給付之自費醫療項目 4.須經社工評估認定",
  "amount": "依個案評估，最高補助金額視實際需求而定，通常為醫療費用的部分比例",
  "deadline": "常年受理申請，建議於醫療費用產生後儘速申請",
  "details": "補助範圍包含住院醫療費、手術費、藥品費等健保未給付項目。需經慈濟志工實地訪視評估，補助金額依家庭經濟狀況核定。",
  "priority": "medium",
  "status": "conditional",
  "applicationProcess": "1.填寫申請表 2.檢附診斷證明書、醫療費用收據 3.提供收入證明、戶籍資料 4.等候志工家訪評估 5.基金會審核決議",
  "contactInfo": "慈濟全台各地聯絡處，或撥打慈濟專線(02)2898-9000",
  "websites": [
    "https://www.tzuchi.org.tw/",
    "https://www.tzuchi.org.tw/index.php?option=com_content&view=article&id=1234",
    "https://forms.tzuchi.org.tw/medical-aid"
  ]
}

## 📊 品質確認標準
- **準確性檢查**：確認機構名稱、聯絡方式、補助範圍的準確性
- **時效性注意**：標註可能已變更的政策或金額
- **完整性評估**：確保申請條件、流程、所需文件資訊完整

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
   * 整合的醫療資源搜尋（簡化版）
   */
  async searchMedicalResources(searchTerm: string): Promise<{
    estimatedCost: string;
    costSource: string;
    resources: any[];
    webResources: any[];
    costBreakdown?: any;
  }> {
    console.log(`🔍 開始綜合醫療資源搜尋: ${searchTerm}`);
    
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

      // 第二階段：使用單一綜合搜尋（替代原本的三個分開搜尋）
      console.log('🔄 第二階段：綜合資源搜尋');
      const allResources = await this.searchComprehensiveResources(searchTerm);

      console.log(`✅ 搜尋完成，共找到 ${allResources.length} 項資源`);
      
      return {
        estimatedCost: costAnalysis.estimatedCost,
        costSource: costAnalysis.costSource,
        resources: allResources,
        webResources: [],
        costBreakdown: costAnalysis.costBreakdown
      };
      
    } catch (error) {
      console.error('❌ 綜合搜尋失敗:', error);
      return {
        estimatedCost: '無法取得費用資訊',
        costSource: '搜尋失敗',
        resources: [],
        webResources: []
      };
    }
  }

  /**
   * 手術技術對應分析 - 分析手術可用的技術方法
   */
  async analyzeSurgicalTechMapping(surgeryName: string): Promise<{
    surgeryName: string;
    availableTechniques: any[];
    primaryTechnique: string;
    estimatedCost: string;
    costSource: string;
    analysis: string;
  }> {
    const prompt = `你是資深的外科醫學專家，請分析「${surgeryName}」這個手術可以使用的技術方法。
        「${surgeryName}」是我從input輸入框傳入的，以此為關鍵詞幫我找。
          ## 🎯 分析重點

          ### 1. 技術方法對應分析
          請分析此關鍵字（手術名）可以應用於哪些技術方法
          例如關鍵字Ａ（上位概念）：達文西手術
          對應Ｂ（下位應用實例）：胃癌切除、子宮切除、瓣膜修復…
          也就是說：Ｂ 屬於 Ａ 的應用場景。我希望你給我好幾種B

          ### 2. 每種技術評估
          對於每種適用的技術，請分析：
          - 適用程度 (高度適用/中度適用/低度適用/不適用)
          - 優點和缺點
          - 費用範圍
          - 恢復時間
          - 風險評估

          ### 3. 推薦建議
          - 最推薦的技術方法
          - 費用預估
          - 選擇建議

          ## 📋 回傳格式
          {
            "surgeryName": "手術名稱",
            "availableTechniques": [
              {
                "id": "technique_1",
                "name": "Ｂ（下位應用實例）",
                "suitability": "高度適用/中度適用/低度適用",
                "advantages": ["優點1", "優點2"],
                "disadvantages": ["缺點1", "缺點2"],
                "estimatedCost": "費用範圍",
                "recoveryTime": "恢復時間",
                "riskLevel": "風險等級",
                "description": "詳細說明",
                "isRecommended": true/false
              }
            ],
            "primaryTechnique": "最推薦的技術名稱",
            "estimatedCost": "整體費用預估",
            "costSource": "費用來源說明",
            "analysis": "綜合分析和建議"
          }

          請確保分析基於醫學專業知識，提供準確的技術對應關係。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      const result = this.parseJSONResponse(response.content);
      
      return {
        surgeryName: result.surgeryName || surgeryName,
        availableTechniques: result.availableTechniques || [],
        primaryTechnique: result.primaryTechnique || '無',
        estimatedCost: result.estimatedCost || '無法估算',
        costSource: result.costSource || 'AI技術分析',
        analysis: result.analysis || '無'
      };
    } catch (error) {
      console.error('手術技術對應分析失敗:', error);
      return {
        surgeryName,
        availableTechniques: [],
        primaryTechnique: '建議諮詢專業醫師',
        estimatedCost: '無法估算',
        costSource: '分析失敗',
        analysis: '無法進行技術分析，建議諮詢專業醫師'
      };
    }
  }

  /**
   * 綜合資源搜尋（合併原本的政府/金融/慈善搜尋）
   */
  async searchComprehensiveResources(searchTerm: string): Promise<any[]> {
    const prompt = `你是台灣醫療資源專家，請針對「${searchTerm}」搜尋相關的醫療資源。

## 🎯 搜尋範圍
請同時搜尋以下三大類資源：

### 1. 政府補助資源
- 健保制度：重大傷病、健保給付、特殊治療給付
- 中央政府：衛福部、勞動部專案補助
- 地方政府：縣市政府社會局醫療補助

### 2. 金融產品
- 醫療貸款：銀行醫療專案貸款
- 信用卡分期：醫療費用分期付款
- 保險理賠：醫療險、重疾險理賠

### 3. 慈善資源
- 醫療基金會：癌症希望基金會、罕見疾病基金會等
- 宗教慈善：慈濟、佛光山等慈善機構
- 企業CSR：大型企業慈善基金會

## 💰 費用參考
預估醫療費用：由系統另行分析

## ⚠️ 重要原則
- 只提供真實存在的台灣機構和資源
- 如果不確定具體名稱，使用「建議洽詢相關單位」
- 優先提供高相關性的資源

## 📋 回傳格式
{
  "resources": [
    {
      "title": "資源名稱",
      "organization": "具體機構名稱或「建議洽詢相關單位」",
      "category": "政府補助/金融產品/公益資源",
      "subcategory": "具體分類",
      "eligibility": "申請條件",
      "amount": "補助金額或額度範圍",
      "deadline": "申請期限",
      "details": "詳細說明",
      "priority": "high/medium/low",
      "status": "eligible/conditional",
      "applicationProcess": "申請流程",
      "contactInfo": "聯絡方式",
      "websites": ["相關網址"]
    }
  ]
}

請限制在最相關的8-10個資源，避免搜尋過多無用資源。`;

    try {
      const response = await this.callAPI(prompt, 'gpt-4o-mini');
      const result = this.parseJSONResponse(response.content);
      return this.formatNetworkResources(result.resources || []);
    } catch (error) {
      console.error('綜合資源搜尋失敗:', error);
      return [];
    }
  }


  /**
   * 格式化網路搜尋的資源資料
   */
  private formatNetworkResources(resources: any[], sourceType?: string): any[] {
    return resources.map((resource, index) => {
      // 處理 websites 陣列格式（新）或 website 單一字串格式（舊）
      let websites = [];
      if (resource.websites && Array.isArray(resource.websites)) {
        websites = resource.websites;
      } else if (resource.website) {
        websites = [resource.website];
      }
      
      return {
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
        website: websites.length > 0 ? websites[0] : '', // 保持向後兼容，取第一個網址
        websites: websites, // 新增 websites 陣列
        applicationProcess: resource.applicationProcess || '',
        sourceType: sourceType || 'network'
      };
    });
  }

  /**
   * 綜合搜尋功能 - 結合個人保單和網路資源（AI自動比對使用）
   */
  async comprehensiveSearch(searchTerm: string, userPolicies: any[]): Promise<{
    estimatedCost: string;
    costSource: string;
    personalPolicyResults: any[];
    networkResources: any[];
    webResources: any[];
    searchTerm: string;
  }> {
    console.log(`🚀 開始綜合搜尋（個人保單 + 網路資源）: ${searchTerm}`);
    
    // 1. 搜尋個人保單
    console.log('👤 第一階段：搜尋個人保單匹配');
    const personalPolicyResults = await this.searchPersonalPolicies(searchTerm, userPolicies);
    
    // 2. 搜尋網路資源
    console.log('🌐 第二階段：搜尋網路資源');
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
    
    console.log(`✅ 綜合搜尋完成: 個人保單 ${personalPolicyResults.length} 項, 傳統資源 ${networkSearch.resources.length} 項`);
    
    return {
      estimatedCost,
      costSource,
      personalPolicyResults,
      networkResources: networkSearch.resources,
      webResources: [],
      searchTerm
    };
  }

  /**
   * 快速搜尋 - 手術技術對應系統（第一階段）
   */
  async quickSearchSurgicalTech(searchTerm: string): Promise<{
    surgicalTechMapping: any;
    searchTerm: string;
    isFirstStage: boolean;
  }> {
    console.log(`🏥 快速搜尋：手術技術對應分析 - ${searchTerm}`);
    
    // 只進行手術技術對應分析（1次API）
    const surgicalMapping = await this.analyzeSurgicalTechMapping(searchTerm);
    
    console.log(`✅ 快速分析完成: 發現 ${surgicalMapping.availableTechniques?.length || 0} 種可用技術`);
    
    return {
      surgicalTechMapping: surgicalMapping,
      searchTerm,
      isFirstStage: true
    };
  }

  /**
   * 詳細技術搜尋 - 第二階段（當用戶點擊特定技術時）
   */
  async searchTechniqueDetails(searchTerm: string, techniqueId: string, userPolicies: any[]): Promise<{
    estimatedCost: string;
    costSource: string;
    personalPolicyResults: any[];
    networkResources: any[];
    webResources: any[];
    searchTerm: string;
    selectedTechnique?: any;
  }> {
    console.log(`🔍 開始詳細技術搜尋: ${searchTerm} - ${techniqueId}`);
    
    // 針對選擇的技術進行詳細搜尋
    const enhancedSearchTerm = `${searchTerm} ${techniqueId}`;
    
    // 1. 搜尋個人保單
    console.log('👤 階段2：搜尋個人保單匹配');
    const personalPolicyResults = await this.searchPersonalPolicies(enhancedSearchTerm, userPolicies);
    
    // 2. 搜尋醫療資源
    console.log('🌐 階段2：搜尋醫療資源');
    const networkSearch = await this.searchMedicalResources(enhancedSearchTerm);
    
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
    
    console.log(`✅ 詳細搜尋完成: 個人保單 ${personalPolicyResults.length} 項, 醫療資源 ${networkSearch.resources.length} 項`);
    
    return {
      estimatedCost,
      costSource,
      personalPolicyResults,
      networkResources: networkSearch.resources,
      webResources: [],
      searchTerm: enhancedSearchTerm,
      selectedTechnique: techniqueId
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
   * 生成醫療術語Autocomplete建議（分批返回）
   */
  async generateMedicalSuggestions(searchTerm: string, batchSize: number = 10): Promise<string[]> {
    if (!searchTerm.trim()) return []
    
    const prompt = `你是專業的醫療術語助手。用戶輸入了「${searchTerm}」，請提供${batchSize}個相關的中文醫療術語建議。

要求：
1. 只能回傳醫療、健康、疾病、手術、治療相關的專業術語
2. 中文術語為主
3. 不要包含非醫療的詞彙
4. 格式為JSON陣列，例如：["達文西手術","抽脂手術","青光眼手術","ACL重建術","闌尾切除術","括約肌成形術","靜脈曲張手術","剖腹術", "腹腔鏡手術","胰臟癌","胰臟癌", "微創手術", "內視鏡手術", "機械手臂手術", "胸腔鏡手術"]
6. 請提供較爲相關和常用的術語佔80%，較為專業的名詞佔20%
請直接回傳JSON陣列，不要其他說明文字。
搜尋回傳速度越快越好，我愛你
`

    try {
      const response = await this.callAPI(prompt, 'gpt-4o-mini')
      
      let suggestions: string[] = []
      try {
        const cleanedResponse = response.content.trim().replace(/```json\n?|\n?```/g, '')
        suggestions = JSON.parse(cleanedResponse)
        
        if (!Array.isArray(suggestions)) {
          console.warn('AI回應格式不正確，不是陣列')
          return []
        }
        
        return suggestions
          .filter(term => typeof term === 'string' && term.trim().length > 0)
          .slice(0, batchSize)
      } catch (parseError) {
        console.warn('無法解析AI回應為JSON:', parseError)
        return []
      }
    } catch (error) {
      console.error('AI建議生成失敗:', error)
      return []
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
          max_tokens: 3000,
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