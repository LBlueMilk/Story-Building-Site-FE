# Story Building Site - FrontEnd

建立小說世界觀的前端平台，專注於 **時間軸管理**、**角色設定** 與 **畫布 (地圖繪製)** 功能，支援 OAuth、JWT 驗證機制。










## Line Endings 設定 (.gitattributes)

本專案已統一使用 LF 換行格式，避免不同開發環境導致的換行差異。

- 所有 `.ts`, `.tsx`, `.js`, `.css`, `.html`, `.json`, `.md` 檔案皆強制 LF 換行。
- 設定檔位於 `.gitattributes`，請勿更動。

如需手動重新正規化換行，可執行：

```bash
git add --renormalize .
git commit -m "Normalize line endings"

### 2️⃣ **建議個人 Git 全域設定也同步**
避免其他專案也出現 CRLF 警告：

```bash
git config --global core.autocrlf false