// Supabase 配置
export const supabaseConfig = {
  baseUrl: "https://xcvczdwjybsajbzppgqo.supabase.co/rest/v1",
  apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhjdmN6ZHdqeWJzYWpienBwZ3FvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3NTk2MzksImV4cCI6MjA3MDMzNTYzOX0.jQ1QeiTKLGTPx3TmR6QA_I8cgMaYBNOPlnhl8e0dr14"
}

// 登入/註冊邏輯
export async function loginOrRegisterUser(phone: string, password: string) {
  const { baseUrl, apiKey } = supabaseConfig

  try {
    // Step 1: 查詢是否有這個電話
    const res = await fetch(`${baseUrl}/users_basic?select=*&phonenumber=eq.${encodeURIComponent(phone)}`, {
      method: "GET",
      headers: {
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "Accept": "application/json",
      }
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(`查詢失敗 (${res.status}): ${errText}`)
    }

    const users = (await res.json()) as Array<any>

    // Step 2: 有資料 → 比密碼
    if (users.length > 0) {
      const matched = users.find(u => u.password === password)
      if (matched) {
        // 登入成功，返回用戶資料
        return {
          success: true,
          isLogin: true,
          user: {
            id: matched.id,
            username: matched.username || `用戶${phone}`,
            phoneNumber: matched.phonenumber,
            email: matched.email || `${phone}@example.com`
          }
        }
      } else {
        return {
          success: false,
          error: "密碼錯誤"
        }
      }
    }

    // Step 3: 沒資料 → 註冊
    const resInsert = await fetch(`${baseUrl}/users_basic`, {
      method: "POST",
      headers: {
        "apikey": apiKey,
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        phonenumber: phone,
        password: password,
        username: `用戶${phone}` // 預設名稱
      })
    })

    if (!resInsert.ok) {
      const errText = await resInsert.text()
      throw new Error(`註冊失敗 (${resInsert.status}): ${errText}`)
    }

    const newUser = await resInsert.json()
    
    // 註冊成功，自動登入
    return {
      success: true,
      isLogin: false, // 是註冊不是登入
      user: {
        id: Array.isArray(newUser) ? newUser[0].id : newUser.id,
        username: Array.isArray(newUser) ? newUser[0].username : newUser.username,
        phoneNumber: Array.isArray(newUser) ? newUser[0].phonenumber : newUser.phonenumber,
        email: `${phone}@example.com`
      }
    }

  } catch (error: any) {
    return {
      success: false,
      error: error.message || "系統錯誤"
    }
  }
}