/**
 * 網站內容擷取工具
 * 使用 CORS proxy 獲取網頁內容並提取文字
 */

export class WebUtils {
  /**
   * 從網址提取文字內容
   * @param {string} url - 網址
   * @returns {Promise<string>} 提取的文字內容
   */
  static async extractTextFromURL(url) {
    try {
      // 驗證 URL 格式
      const validUrl = this.validateURL(url);
      
      // 使用 CORS proxy 獲取網頁內容
      const content = await this.fetchWebContent(validUrl);
      
      // 解析 HTML 並提取文字
      const text = this.extractTextFromHTML(content);
      
      // 清理和格式化文字
      const cleanText = this.cleanExtractedText(text);
      
      if (!cleanText || cleanText.length < 100) {
        throw new Error('網頁內容太少或無法提取文字');
      }
      
      return cleanText;
    } catch (error) {
      console.error('網址內容提取失敗:', error);
      throw new Error(`無法讀取網頁內容: ${error.message}`);
    }
  }

  /**
   * 驗證 URL 格式
   * @param {string} url - 網址
   * @returns {string} 標準化的 URL
   */
  static validateURL(url) {
    try {
      // 如果沒有協議，自動添加 https://
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch (error) {
      throw new Error('網址格式不正確，請檢查後重新輸入');
    }
  }

  /**
   * 使用 CORS proxy 獲取網頁內容
   * @param {string} url - 網址
   * @returns {Promise<string>} HTML 內容
   */
  static async fetchWebContent(url) {
    // 使用多個 CORS proxy 備案
    const proxies = [
      `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
      `https://corsproxy.io/?${encodeURIComponent(url)}`,
      `https://cors-anywhere.herokuapp.com/${url}`
    ];

    let lastError;
    
    for (const proxyUrl of proxies) {
      try {
        console.log(`嘗試從 ${proxyUrl} 獲取內容...`);
        
        const response = await fetch(proxyUrl, {
          method: 'GET',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          timeout: 15000 // 15秒超時
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        let content;
        
        // allorigins 返回 JSON 格式
        if (proxyUrl.includes('allorigins')) {
          const data = await response.json();
          content = data.contents;
        } else {
          content = await response.text();
        }

        if (!content || content.length < 100) {
          throw new Error('獲取的內容太少');
        }

        return content;
      } catch (error) {
        console.warn(`Proxy ${proxyUrl} 失敗:`, error);
        lastError = error;
        continue;
      }
    }

    throw new Error(`所有 proxy 都失敗了。最後錯誤: ${lastError?.message}`);
  }

  /**
   * 從 HTML 提取文字內容
   * @param {string} html - HTML 內容
   * @returns {string} 提取的文字
   */
  static extractTextFromHTML(html) {
    // 創建臨時 DOM 元素來解析 HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 移除不需要的元素
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 
      '.advertisement', '.ads', '.sidebar', '.menu',
      '.comments', '.social', '.share', '.related'
    ];

    unwantedSelectors.forEach(selector => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    // 優先提取主要內容區域
    const contentSelectors = [
      'main', 'article', '.content', '.post', '.entry',
      '.article-body', '.post-content', '[role="main"]'
    ];

    let mainContent = '';
    
    for (const selector of contentSelectors) {
      const element = doc.querySelector(selector);
      if (element) {
        mainContent = element.textContent || element.innerText || '';
        break;
      }
    }

    // 如果沒找到主要內容，使用整個 body
    if (!mainContent) {
      const body = doc.body;
      mainContent = body ? (body.textContent || body.innerText || '') : '';
    }

    return mainContent;
  }

  /**
   * 清理提取的文字
   * @param {string} text - 原始文字
   * @returns {string} 清理後的文字
   */
  static cleanExtractedText(text) {
    return text
      // 移除多餘的空白字符
      .replace(/\s+/g, ' ')
      // 移除開頭結尾空白
      .trim()
      // 限制長度，避免 token 超限
      .substring(0, 15000) // 約 3000-4000 tokens
      // 移除常見的垃圾文字
      .replace(/Cookie|隱私權|使用條款|廣告|訂閱|登入|註冊/g, '')
      .replace(/\n{3,}/g, '\n\n'); // 最多保留兩個換行
  }

  /**
   * 檢查 URL 是否可能包含有用內容
   * @param {string} url - 網址
   * @returns {boolean} 是否適合分析
   */
  static isValidContentURL(url) {
    const invalidExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.png', '.gif', '.mp4', '.zip'];
    const lowerUrl = url.toLowerCase();
    
    return !invalidExtensions.some(ext => lowerUrl.endsWith(ext));
  }
}