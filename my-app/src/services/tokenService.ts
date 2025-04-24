

export const TokenService = {
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  /**
 * 解析 JWT 中的 exp（過期時間戳記）欄位。
 *
 * 用途：
 * - 用於判斷 accessToken 是否即將過期（通常搭配定時檢查使用）。
 *
 * 實作細節：
 * - JWT 結構為 "header.payload.signature"，此方法擷取第二段 payload。
 * - 解碼後取出 exp 欄位（Unix 時間，單位為秒）。
 *
 * 回傳值：
 * - 若成功解析，回傳 exp 整數時間戳。
 * - 若無 token 或格式錯誤，回傳 null。
 */
  getAccessExp(): number | null {
    const t = localStorage.getItem('accessToken')
    if (!t) return null
    try {
      const [, payload] = t.split('.')
      return JSON.parse(atob(payload)).exp as number
    } catch (err) {
      console.warn('⚠️ 無法解析 accessToken 的 exp 欄位', err);
      return null
    }
  },
};

