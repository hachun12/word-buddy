# Word Buddy 單字小夥伴 🎒

專為**國小孩童**設計的單字學習網頁 App，收錄**必學 300 單字**（依 `docs/301voc.pdf`）。
純靜態網站，可直接放上 **GitHub Pages**，讓小朋友隨時聯網使用。

## ✨ 功能

- **13 大主題**：數字、人物、身體、衣物、動物、物品、食物、地點、時間、動詞、形容詞、介系詞、疑問詞
- **單字卡**：emoji 圖示 + 英文 + 中文 + 例句，點卡片翻面
- **真人發音**：使用瀏覽器內建語音（Web Speech API），免費、免金鑰
- **可點擊例句**：例句盡量用 300 單字組成，**點句中的單字就能查詢＋發音**
- **聽音選圖**：聽發音，從 4 張圖選出正確的
- **看圖選字**：看圖片，選出正確的英文
- **星星獎勵 + 進度記錄**：答對得星星，學習進度存在瀏覽器（`localStorage`），免登入
- **PWA**：可「加入主畫面」像 App 一樣開啟，並支援離線使用
- **RWD**：手機、平板、電腦皆可用，大按鈕大字體

## 📁 專案結構

```
index.html            主頁面
manifest.json         PWA 設定
sw.js                 Service Worker（離線快取）
.nojekyll             讓 GitHub Pages 原樣提供檔案
css/style.css         樣式（兒童友善、RWD）
js/
  data.js             300 單字資料（英文/中文/emoji/例句）
  speech.js           發音模組
  progress.js         星星與進度（localStorage）
  ui.js               共用 UI（可點擊例句、單字彈窗、彩帶）
  mode-flashcards.js  單字卡
  mode-listen.js      聽音選圖遊戲
  mode-quiz.js        看圖選字遊戲
  app.js              主控 / 首頁 / 導覽
icons/                App 圖示
docs/301voc.pdf       原始單字表
```

## 🚀 部署到 GitHub Pages

1. 建立一個 GitHub 儲存庫，例如 `word-buddy`。
2. 把本資料夾所有檔案 push 上去（放在 repo 根目錄）：
   ```bash
   git init
   git add .
   git commit -m "Word Buddy 單字小夥伴"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/word-buddy.git
   git push -u origin main
   ```
3. 到 repo 的 **Settings → Pages**，
   **Source** 選 `Deploy from a branch`，Branch 選 `main` / `/ (root)`，儲存。
4. 稍等 1–2 分鐘，網址會是：
   `https://<你的帳號>.github.io/word-buddy/`
   把這個網址給小朋友即可隨時使用。

> 💡 發音需要在 **https**（GitHub Pages 就是）或 localhost 環境才穩定；
> 第一次點發音時，部分瀏覽器需要使用者先互動一次才會出聲（本程式已在點擊時觸發）。

## 🖥️ 本機預覽

因為使用 Service Worker 與多個 JS 檔，建議用簡易伺服器開啟（直接雙擊 `index.html` 也可，只是 SW 會停用）：

```bash
# 於專案根目錄
python -m http.server 8000
# 瀏覽器開 http://localhost:8000
```

## 🔧 之後想擴充

- 想換單字／改中文／改例句：只要編輯 `js/data.js`。
- 想加新遊戲：仿照 `mode-quiz.js` 建立 `mode-xxx.js`，在 `index.html` 引入、在 `app.js` 加入口。
- 想加真人錄音或圖片：把音檔/圖檔放進 `assets/`，於 `data.js` 增加欄位即可。
