# Personal Website

一個面向 **軟體工程師 / AI Agent 工程師** 求職與個人品牌的作品集網站，
以純 **HTML + CSS + JavaScript** 製作，採用「資料與畫面分離」架構，
未來可平順遷移到 **Next.js + TypeScript**。

> 設計風格：現代、乾淨、具科技感（深藍 / 黑灰 / 淡紫 / 青色），支援 RWD。

---

## 1. 專案資料夾結構

```
personal-website/
├── index.html          # Home：Hero、核心定位、Featured Projects、Featured Research、CTA
├── about.html          # About：背景、技能、學習方向
├── projects.html       # Projects：完整專案卡片列表
├── research.html       # Research：碩士論文 + AI Agent 研究
├── resume.html         # Resume：教育、技能、經歷、獲獎 + PDF 下載
├── contact.html        # Contact：聯絡管道 + 前端表單
│
├── css/
│   └── style.css       # 全站樣式（含設計 tokens、元件、RWD、動畫）
│
├── js/
│   ├── data.js         # ⭐ 所有「會變動的內容」集中於此（個人資料、專案、研究、技能、履歷）
│   └── main.js         # 共用互動：導覽列、Scroll Reveal、Skill bar、各頁渲染
│
├── assets/
│   ├── images/         # 圖片資源（個人照、專案截圖等）
│   └── files/          # 可下載檔案（resume.pdf 等）
│
└── README.md           # 本文件
```

### 各檔案用途速查

| 檔案 | 用途 |
|---|---|
| `index.html` | 首頁。Hero、核心定位、精選專案、精選研究、CTA |
| `about.html` | 詳細介紹、應用數學背景、技能、目前學習方向 |
| `projects.html` | 所有專案卡片（含狀態：Completed / In Progress / Coming Soon） |
| `research.html` | 碩士論文研究 + AI Agent 獨立研究 |
| `resume.html` | 履歷（教育、技能、經歷、獲獎），含 PDF 下載按鈕 |
| `contact.html` | Email / GitHub / LinkedIn + 前端聯絡表單 |
| `css/style.css` | 設計 tokens（CSS 變數）、版面、元件、動畫、RWD |
| `js/data.js` | **資料層**：個人資料、技能、專案、研究、履歷、聯絡資訊 |
| `js/main.js` | **邏輯層**：渲染 + 互動，依當頁存在的 DOM 自動執行 |
| `assets/images/` | 圖片資源 |
| `assets/files/resume.pdf` | 真實 PDF 履歷（請自行放入） |

---

## 2. 已實作的功能

✅ **頁面**：Home / About / Projects / Research / Resume / Contact 六頁完整串接
✅ **導覽列**：sticky 黏頂、active link 標記、行動版漢堡選單
✅ **資料驅動渲染**：所有專案、研究、技能、履歷皆來自 `js/data.js`
✅ **設計系統**：以 CSS 變數定義色彩、間距、字級、圓角、陰影
✅ **科技感視覺**：Hero 程式碼風格卡片、漸層文字、Mono 字體 eyebrow
✅ **卡片元件**：專案卡 / 研究卡 / 特色卡，含 hover 效果與狀態標籤
✅ **狀態標籤**：`Completed` / `In Progress` / `Coming Soon`，三色清楚區分
✅ **技能進度條**：滾入時動畫展開
✅ **Scroll Reveal**：使用 `IntersectionObserver`，元素進場淡入
✅ **聯絡表單**：前端驗證 + 友善錯誤訊息（尚未串後端）
✅ **RWD**：桌機 / 平板 / 手機三段斷點
✅ **動態 Footer**：年份、社群連結皆從 `data.js` 自動產生

---

## 3. 功能入口（URI / 路徑與參數）

本網站為純靜態網站，無後端 API。所有頁面皆為靜態 `.html`：

| Path | 頁面 | 說明 |
|---|---|---|
| `/` 或 `/index.html` | Home | 首頁 |
| `/about.html` | About | 關於我 |
| `/projects.html` | Projects | 所有專案 |
| `/research.html` | Research | 研究展示 |
| `/resume.html` | Resume | 履歷（含 PDF 下載） |
| `/contact.html` | Contact | 聯絡管道與表單 |
| `/assets/files/resume.pdf` | PDF | 履歷 PDF（請自行放置） |

> 目前未實作任何 query string 或動態參數。
> 專案 / 研究的「詳細頁」尚未建立，第一版以卡片摘要呈現。

---

## 4. 如何在本機預覽網站

### 方法 A：直接用瀏覽器開啟（最快）
直接雙擊 `personal-website/index.html` 即可。
由於本網站僅使用 CDN + 本地相對路徑檔案，無需 build。

### 方法 B：起一個本地伺服器（建議，較貼近正式環境）

選擇任一個你方便的工具：

```bash
# Python 3
cd personal-website
python -m http.server 8000
# → 瀏覽器打開 http://localhost:8000

# 或 Node.js
npx serve personal-website

# 或 VS Code 的 Live Server 擴充套件，右鍵 index.html → Open with Live Server
```

---

## 5. 如何修改個人資料、專案、研究內容

**95% 的內容都集中在 `js/data.js`**，這是本網站「資料層」。
修改後重新整理瀏覽器即可看到變化。

### 5.1 修改個人基本資料
在 `js/data.js` 找到 `profile`：
```js
const profile = {
  name: "Your Name",
  email: "your.email@example.com",
  links: {
    github:   "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-id",
    resume:   "assets/files/resume.pdf"
  }
};
```

### 5.2 新增 / 修改專案
在 `projects` 陣列中新增物件，欄位如下：
```js
{
  id: "唯一識別",
  name: "專案名稱",
  slug: "縮圖文字（建議 ≤ 8 字元）",
  summary: "一句話摘要",
  tech: ["技術1", "技術2"],
  role: "你的角色 / 貢獻",
  highlights: ["亮點 1", "亮點 2"],
  github: "https://github.com/...",
  demo:   "https://...",        // 若無 demo，請保留 "#"
  status: "completed"            // completed | in-progress | planned
}
```

### 5.3 新增 / 修改研究
在 `research` 陣列中新增物件：
```js
{
  id: "唯一識別",
  type: "Master Thesis / Independent Research",
  title: "研究標題",
  summary: "研究摘要",
  keywords: ["關鍵字 1", "關鍵字 2"],
  highlights: ["亮點 1", "亮點 2"],
  status: "in-progress",
  links: { paper: "#", slides: "#", repo: "#" }
}
```

### 5.4 修改技能 / 履歷 / 聯絡資訊
直接編輯 `skills` / `resume` / `contacts` / `learningFocus` 對應區塊即可。

### 5.5 替換 PDF 履歷
把實體 PDF 放到 `assets/files/resume.pdf`，Resume 頁的下載按鈕即可生效。

### 5.6 微調設計風格
在 `css/style.css` 最上方 `:root { ... }` 修改 CSS 變數：
- `--color-primary` / `--color-primary-2` / `--color-accent`：主色
- `--color-bg` / `--color-bg-alt` / `--color-surface`：背景與卡片
- 字級、間距、圓角皆有對應變數

---

## 6. 部署到 GitHub Pages / Cloudflare Pages / Vercel

### 6.1 GitHub Pages

```bash
# 1. 在 GitHub 建立一個 repo，例如 personal-website
# 2. 把本資料夾推上去
cd personal-website
git init
git add .
git commit -m "init: personal website v1"
git branch -M main
git remote add origin https://github.com/your-username/personal-website.git
git push -u origin main

# 3. 到 GitHub 的 repo → Settings → Pages
#    Source 選 "Deploy from a branch" → Branch: main / root → Save
# 4. 等 1-2 分鐘，網址會出現在 https://your-username.github.io/personal-website/
```

> 如果你希望網址是 `https://your-username.github.io/`（沒有後綴），
> 請把 repo 命名為 `your-username.github.io`。

### 6.2 Cloudflare Pages

1. 在 Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git
2. 選擇剛剛建立的 GitHub repo
3. **Build settings 全部留空**（這是純靜態網站，不需要 build）
   - Build command: *(留空)*
   - Build output directory: `/`
4. Save and Deploy → 即可獲得 `xxx.pages.dev` 網址

### 6.3 Vercel

1. 到 Vercel → Add New Project → Import Git Repository
2. Framework Preset 選 **Other**（純靜態）
3. Root Directory 留 `./`
4. Deploy → 完成

---

## 7. 未實作的功能與未來規劃

### 第一版未實作
- ❌ Blog / Notes 文章系統（已預留導覽列空間與資料結構彈性）
- ❌ 英文版 i18n 切換（`data.js` 已採用單一來源結構，未來易擴充 `zh / en`）
- ❌ 專案 / 研究的「詳細頁」（目前以卡片摘要呈現）
- ❌ 真實後端表單寄送（目前僅前端驗證）
- ❌ 暗色 / 亮色主題切換（目前為固定深色主題）
- ❌ 搜尋 / 篩選功能（專案列表）

### 建議的下一步

1. **填入真實內容**：把 `data.js` 中所有 `Your Name`、`#`、`your-username` 替換為實際內容。
2. **放置 PDF 履歷**：將 `resume.pdf` 放入 `assets/files/`。
3. **加入個人頭像 / 專案截圖**：放在 `assets/images/`，並在 `data.js` 加上 `thumbnail` 欄位後於 `main.js` 渲染。
4. **新增 Blog 頁**：建立 `blog.html` 與 `js/posts.js`（與 `data.js` 同模式），未來再考慮升 Next.js MDX。
5. **加上 SEO / Open Graph meta**：在每個 HTML 加上 `og:title`、`og:image`、`twitter:card`。
6. **聯絡表單串接**：用 [Formspree](https://formspree.io) / [Web3Forms](https://web3forms.com) 等無後端服務，幾行 fetch 即可。
7. **加入 Google Analytics / Plausible**：追蹤訪客行為。

---

## 8. 未來遷移到 Next.js + TypeScript 的建議路線

本網站從一開始就為遷移做了規劃。以下是建議步驟：

### 8.1 建立 Next.js 專案
```bash
npx create-next-app@latest my-portfolio --typescript --app --tailwind
cd my-portfolio
```

### 8.2 對應遷移表

| 目前架構 | Next.js + TS 對應 |
|---|---|
| `index.html` | `app/page.tsx` |
| `about.html` | `app/about/page.tsx` |
| `projects.html` | `app/projects/page.tsx` |
| `research.html` | `app/research/page.tsx` |
| `resume.html` | `app/resume/page.tsx` |
| `contact.html` | `app/contact/page.tsx` |
| 共用 `<header>` 導覽列 | `app/layout.tsx` + `components/Navbar.tsx` |
| 共用 `<footer>` | `app/layout.tsx` + `components/Footer.tsx` |
| `js/data.js` | `data/profile.ts`、`data/projects.ts`、`data/research.ts`（加上 interface） |
| `js/main.js` 的渲染函式 | 拆成 React 元件：`<ProjectCard />`、`<ResearchCard />`、`<SkillBar />`、`<Timeline />` |
| `css/style.css` 的 CSS 變數 | 直接保留為 global CSS；或對應到 Tailwind 的 `theme.extend.colors` |
| Scroll Reveal | 可用 [framer-motion](https://www.framer.com/motion/) 的 `whileInView` 取代 |

### 8.3 TypeScript 型別範例

把 `data.js` 升級為 `data/projects.ts`：
```ts
export type ProjectStatus = "completed" | "in-progress" | "planned";

export interface Project {
  id: string;
  name: string;
  slug: string;
  summary: string;
  tech: string[];
  role: string;
  highlights: string[];
  github: string;
  demo: string;
  status: ProjectStatus;
}

export const projects: Project[] = [/* ... 直接搬過去 */];
```

> 因為目前 `data.js` 的物件結構已經是 schema 化的（每筆資料欄位一致），
> 升級成 TS 幾乎只需要：加上 `interface` 與 `export`，**內容本身不用改寫**。

### 8.4 i18n（中英文切換）
建議使用 `next-intl` 或 `next-i18next`：
- 把 `data.ts` 改成 `data.zh.ts` / `data.en.ts`，再用 locale 切換。
- 或在每筆物件內，把字串改為 `{ zh: "...", en: "..." }` 結構。

### 8.5 為什麼第一版不直接用 Next.js？
- 第一版重點是「**快速上線、累積內容**」，純 HTML/CSS/JS 無需 build、無需 node_modules。
- 等內容（文章、案例、英文版）累積到一定量，再升級到 Next.js 享受 ISR / MDX / 動態路由的好處，CP 值最高。

---

## 9. 專案目標總結

| 項目 | 內容 |
|---|---|
| **專案名稱** | Personal Website (Portfolio · Research · Resume) |
| **定位** | 個人作品集 / 研究展示 / 求職履歷 / 個人品牌 |
| **目標族群** | 招募方、合作夥伴、研究同行 |
| **技術棧** | HTML5、CSS3（CSS Variables）、Vanilla JavaScript、Font Awesome、Google Fonts |
| **資料儲存** | 純前端 JS 物件（`js/data.js`），無資料庫 |
| **公開網址** | _尚未部署_（部署後請更新此欄位） |
| **作者** | Your Name（請於 `js/data.js` 修改） |

---

Built with ❤ and a lot of `console.log`.
