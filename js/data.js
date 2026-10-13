/* =========================================================
   data.js - Single source of truth for site content
   ---------------------------------------------------------
   設計理念：
   - 所有「會變動」的內容（個人資料、專案、研究、技能、履歷）
     都集中在這支檔案，方便日後維護或遷移到 Next.js + TypeScript。
   - 未來遷移時，本檔可幾乎 1:1 轉成 TypeScript interface + JSON。
   - i18n 預留：siteContent.zh / siteContent.en 之後可擴充。
   ========================================================= */

/* ---------------- 個人基本資料 ---------------- */
const profile = {
  name: "洪紹鈞",                  
  nameEn: "Sam Hung",
  title: "Software & AI Agent Engineer",
  tagline: "用數學思維建構軟體，用工程實作落地 AI",
  shortBio:
    "應用數學背景出身，正往軟體工程與 AI Agent 工程方向發展。" +
    "擅長將影像辨識、資料分析與工程實作結合，建立可落地的智慧系統。",
  proof: [
    { icon: "fa-location-dot", label: "Taiwan" },
    { icon: "fa-graduation-cap", label: "M.S. Candidate" },
    { icon: "fa-trophy", label: "TSMC IT CareerHack 1st Place" },
    { icon: "fa-circle-check", label: "Open to opportunities", live: true }
  ],
  location: "Taiwan",
  email: "shaojun5861@gmail.com",   
  links: {
    github:   "https://github.com/samhung1205",     // TODO
    linkedin: "https://www.linkedin.com/in/sam-hung05",  // TODO
    resume:   "assets/files/resume.pdf"               // TODO: 放置真正 PDF
  }
};


/* ---------------- 核心定位 / About 特色 ---------------- */
const corePositioning = [
  {
    icon: "fa-square-root-variable",
    title: "應用數學背景",
    desc: "具備科學計算、統計、建模與最佳化訓練，能以數學語言抽象化真實問題。"
  },
  {
    icon: "fa-code",
    title: "軟體開發",
    desc: "熟悉前端與資料處理流程，能將原型 (prototype) 推進到可維運的產品。"
  },
  {
    icon: "fa-robot",
    title: "AI Agent 工程",
    desc: "以 LangGraph、Tool Calling 與 SSE 串流建構可操作後端工具的 Agent 工作流，並整合 Web 與桌面端共用服務。"
  },
  {
    icon: "fa-brain",
    title: "AI / Machine Learning",
    desc: "從推薦系統、物件偵測到生成式 AI，著重將模型結果轉化為實際應用。"
  }
];


/* ---------------- 技術能力 ---------------- */
/* Phase 4D：百分比熟練度已永久退場。自評數字沒有可驗證的基準，讀者無從
   判斷「PyTorch 80%」是什麼意思，只會稀釋真正有證據的項目。改成三個
   分組 + 一行「實際用在哪」，每一項都能在 Projects／Case Study 追到出處。
   刻意移除的項目見 Phase 4D 報告：Docker（Yolo-System 的容器化階段標記
   為待辦，沒有實作）、Flask（三個專案都用 FastAPI）、RAG（agent 層是
   唯讀 DB 工具，不是文件檢索）、scikit-learn（repo 內查無使用）。 */
const skills = [
  {
    id: "ai",
    icon: "fa-brain",
    label: "AI 與電腦視覺",
    items: ["Python", "PyTorch", "Ultralytics YOLO", "OpenCV", "LangGraph", "Agent tool calling"],
    evidence: "實際用於：Yolo-System 的偵測服務與 agent 層、DetectionData_Engine 的標註與資料品質流程"
  },
  {
    id: "engineering",
    icon: "fa-screwdriver-wrench",
    label: "軟體與系統",
    items: ["FastAPI", "SQLAlchemy / Alembic", "MySQL / SQLite", "React", "TypeScript", "PySide6 / PyQt6", "Git"],
    evidence: "實際用於：Yolo-System 的雙軌平台（後端、Web、桌面）、MetroPulse、本站的靜態建置流程"
  },
  {
    id: "data",
    icon: "fa-square-root-variable",
    label: "統計與資料",
    items: ["實驗設計", "統計建模", "最佳化", "資料分析", "SQL", "R"],
    evidence: "實際用於：MetroPulse 以 PageRank 建構的可解釋推薦模型、數學系與碩士課程的統計訓練"
  }
];


/* ---------------- 專案 (Projects) ---------------- */
/* status:  "completed" | "in-progress" | "planned"
   tier:    1 = 精選（碩論相關的主力系統）｜2 = 一般專案｜3 = 附屬／索引
   visible: false 代表「資料先備好，但還不放到 production Projects 列表」。
            這個網站是策展過的作品集，不是 GitHub repo 的鏡像——一個 repo
            存在不等於它該被當成對外展示的專案。
   每筆的 summary/role/tech/highlights 都以該 repo 實際的 README 與檔案
   結構為準（Phase 4B.1 逐一核對過），不寫 repo 裡沒有的功能。 */
const projects = [
  {
    id: "yolo-system",
    image: {
      src: "assets/images/previews/YoloSystem.webp",
      original: "assets/images/YoloSystem.png",
      alt: "YOLO System Web Console 儀表板，包含物件偵測、偵測紀錄與 AI Chat 功能入口",
      width: 1200,
      height: 525
    },
    name: "YOLO System — 桌面 ＋ Web 雙軌平台",
    slug: "YOLO",
    tier: 1,
    visible: true,
    summary:
      "把一支 UI、業務邏輯與 SQL 全部耦合在一起的 PySide6 桌面程式，" +
      "重構成 FastAPI 後端搭配 React Web 前端、桌面版共用同一組 API 的雙軌平台，" +
      "並在過程中修掉明文密碼、硬編碼金鑰與字串拼接 SQL。" +
      "核心功能已完成，持續維護與優化，尚未部署公開網站。",
    tech: ["FastAPI", "React", "PySide6", "LangGraph", "YOLO", "SQLAlchemy"],
    role: "系統架構與全端實作（後端 / Web / 桌面）",
    highlights: [
      "分層重構 legacy：UI／業務邏輯／資料存取拆開，SQL 改走 SQLAlchemy ORM",
      "身分驗證改為 bcrypt 雜湊 ＋ JWT，金鑰與 DB 連線移入環境變數",
      "以 LangGraph 建立 agent 層並支援 SSE 串流，Web 與桌面共用同一組 API"
    ],
    github: "https://github.com/samhung1205/Yolo-System",
    demo:   "",
    // 只有真的存在案例研究頁的專案才有這個欄位——沒有就不渲染 CTA，
    // 不指向不存在的頁面（design-system/MASTER.md §9/§20）。
    caseStudy: "case-studies/yolo-system.html",
    status: "completed"
  },
  {
    id: "detection-data-engine",
    image: {
      src: "assets/images/previews/SDDE.webp",
      original: "assets/images/SDDE.png",
      alt: "SDDE 桌面工作台，顯示港口影像、目標標註框與類別清單",
      width: 1200,
      height: 749
    },
    name: "SDDE (DetectionData_Engine) — 船舶偵測資料工程工作台",
    slug: "SDDE",
    tier: 1,
    visible: true,
    summary:
      "面向遙測與航空影像船舶偵測研究的 PyQt6 資料工程工作台：" +
      "標註、YOLO 格式匯入匯出、prediction review、dataset QC 與錯誤分析集中在同一個介面，" +
      "讓訓練資料的品質可以被檢查、被追蹤、被重現。",
    tech: ["PyQt6", "Python", "OpenCV", "NumPy", "YOLO", "COCO"],
    role: "工具設計與實作（GUI／資料流程／研究屬性標註）",
    highlights: [
      "多類別 HBB 標註，支援 YOLO、COCO、Pascal VOC 三種格式匯入匯出",
      "Prediction review queue：pending／partial／reviewed 狀態可持久化並續作",
      "研究屬性標註（尺度、遮擋、難例、場景）與 copy-paste augmentation"
    ],
    github: "https://github.com/samhung1205/DetectionData_Engine",
    demo:   "",
    status: "completed"
  },
  {
    id: "lifeops",
    name: "LifeOps — 私人 AI 工作助理",
    tier: 2,
    visible: true,
    access: "personal",
    summary:
      "將任務、Gmail 待辦、Google Calendar 與 GitHub 專案動態整合成私人工作空間。" +
      "以 AI 協助辨識信件中的行動與期限、整理今日工作及產生回覆提案，" +
      "搭配同步、重試與用量管理；Gmail 草稿建立由使用者審閱確認。",
    tech: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Gemini", "Google OAuth", "GitHub App"],
    role: "個人開發（全端與 AI 工作流程整合）",
    highlights: [
      "增量同步與可續作游標，保留資料來源與期限的時區脈絡",
      "AI 輸出經 schema 驗證，低信心度或缺乏依據的期限交由使用者確認",
      "單一擁有者存取、資料庫 RLS 與 AI 用量管理；不自動寄信"
    ]
  },
  {
    id: "scamshield",
    name: "ScamShield — 防詐風險分析 PWA",
    tier: 2,
    visible: true,
    access: "personal",
    summary:
      "針對可疑訊息、網址、截圖與 QR code，提供可解釋的風險訊號與查證建議。" +
      "OCR 與 QR 解析在瀏覽器端執行；風險分數與證據充分程度分開處理，" +
      "選用的 AI 只協助說明，不決定風險結果。",
    tech: ["React", "TypeScript", "Cloudflare Workers", "D1", "Tesseract.js", "ZXing WASM", "IndexedDB"],
    role: "個人開發（前端、風險引擎與 API 整合）",
    highlights: [
      "裝置端 OCR／QR 與本機歷史紀錄，圖片不需上傳解析",
      "區分確認威脅情報、啟發式訊號與資訊不足，AI 說明驗證失敗時保留模板",
      "建立規則測試與語料評估流程，記錄已知漏判；真實世界辨識率仍待驗證"
    ]
  },
  {
    id: "metropulse",
    image: {
      src: "assets/images/previews/MetroPulse.webp",
      original: "assets/images/MetroPulse.png",
      alt: "MetroPulse 捷運推薦介面，包含出發站、時段、偏好設定與互動路線圖",
      width: 1200,
      height: 790
    },
    name: "MetroPulse 捷運站點推薦系統",
    slug: "MP",
    tier: 2,
    visible: true,
    summary:
      "把 Google PageRank 的連結分析套用到台北捷運人流，" +
      "再疊上偏好匹配與旅行成本，做出每一分都能拆解回來源的可解釋站點推薦。",
    tech: ["TypeScript", "Hono", "Cloudflare Workers", "D1", "Chart.js", "Vite"],
    role: "演算法設計與全端實作",
    highlights: [
      "以站間人流建構轉移機率矩陣，計算各時段的站點 PageRank",
      "推薦分數拆成熱門度／連結強度／偏好匹配／旅行成本四維，附自然語言理由",
      "互動式捷運路線圖與站點詳情頁：PageRank 時序圖、偏好雷達圖"
    ],
    github: "https://github.com/samhung1205/MetroPulse",
    demo:   "https://metro-go.pages.dev",
    status: "completed"
  },
  {
    id: "stocks",
    name: "台股投資分析平台",
    slug: "STOCKS",
    tier: 3,
    // Phase 4B.1：資料先備好，但暫不對外顯示——開發中，等 Sam 確認要公開
    // 展示時把 visible 改成 true 即可，不需要動 main.js。
    visible: false,
    summary:
      "純本機運行的台股研究工具：整合證交所、櫃買與 FinMind 等免費資料源，" +
      "把大盤、籌碼、財務與估值收斂成可篩選、可評分、可記錄的研究流程。",
    tech: ["Python", "FastAPI", "SQLAlchemy", "SQLite", "APScheduler"],
    role: "全端實作（資料源整合／評分邏輯／介面）",
    highlights: [
      "三層資料策略：全市場輕量層、個股深度層、閒置資料清理層",
      "行情來源可插拔，有金鑰走富果即時、無金鑰自動降級為證交所快照",
      "全市場篩選器與 100 分評分表，量化欄位自動預填"
    ],
    github: "https://github.com/samhung1205/Stocks",
    demo:   "",
    status: "in-progress"
  }
];


/* ---------------- 研究 (Research) ---------------- */
/* 碩士論文已完成（2026-09）；題目、摘要與結果以 assets/files/Thesis.pdf
   為準。目前仍在學，預計 2027 年 3–4 月畢業，教育期間維持 Present。
   links 內的值若是 "#"，不會渲染成假連結。 */
const research = [
  {
    id: "thesis-ship-detection",
    type: "Master’s Thesis · 2026.09",
    title: "跨域港口與機場目標偵測：YOLO11 模組變體、資料增強與圖形化介面研究支援系統",
    summary:
      "以四類港口與三類機場目標建立七類跨域偵測設定，比較 YOLO11n、EfficientViM、DySample 與 ASFF。" +
      "從錯誤分析出發，檢查標註修正與港口領域監督對偵測表現的影響，並建置兩套 GUI 支援研究流程。",
    keywords: ["YOLO11", "Cross-domain Detection", "Data-centric AI", "GUI Research Tools"],
    highlights: [
      "各架構在任務、類別與指標間各有取捨，沒有單一架構普遍占優",
      "固定評估基準下，部分船舶標註修正使 YOLO11n mAP@50 由 76.2% 提升至 77.0%",
      "資料增強採合併處理，尚無組件式消融；船種輔助器保留人工最終確認"
    ],
    status: "completed",
    links: {
      "研究摘要": "research.html#thesis-overview",
      "閱讀完整論文（PDF）": "assets/files/Thesis.pdf"
    }
  },
  {
    id: "agent-verifiability",
    type: "Independent Research · 進行中",
    title: "Agent 回答的可驗證性",
    summary:
      "探討語言模型在讀取結構化資料後產生的說明，如何被系統性地檢查——" +
      "重點不是讓它答得漂亮，而是能不能抓出它捏造的部分。",
    keywords: ["LLM Evaluation", "Grounding", "LangGraph", "Tool Calling"],
    highlights: [
      "以 LangGraph 建立唯讀工具邊界，限制 agent 可存取的資料範圍",
      "設計 20 個涵蓋零物件、低信心度、失敗任務與邊界值的評估案例",
      "檢查回答是否引用不存在的類別或信心度數值、該提醒複核時是否提醒"
    ],
    status: "in-progress",
    links: {}
  }
];


/* ---------------- 履歷 (Resume) ---------------- */
/* org 可留空（例如尚未確認掛在哪個單位的研究專題），留空時不渲染該行，
   不用topic 清單充當單位名稱。tech 是選填的技術行。 */
const resume = {
  education: [
    {
      date: "09/2024 – Present",
      title: "數學建模與科學計算碩士班（在學）",
      org: "國立陽明交通大學（NYCU）· 數科所",
      desc: "預計於 2027 年 3–4 月畢業。研究方向為科學計算與影像辨識；碩士論文已於 2026 年 9 月完成，研究跨域港口與機場目標偵測、資料增強與 GUI 研究支援；摘要與完整 PDF 見 Research 頁。"
    },
    {
      date: "09/2020 – 06/2024",
      title: "數學學士",
      org: "國立臺灣師範大學（NTNU）· 數學系",
      desc: "與目前工作最相關的訓練：機率統計、最佳化、數值方法。"
    }
  ],
  experience: [
    {
      date: "2026 – Present",
      title: "AI / 軟體工程（自主專案）",
      org: "獨立開發",
      desc:
        "把一支 UI、業務邏輯與 SQL 耦合在同一層的 PySide6 桌面程式，重構成桌面版與 React Web 共用同一組 FastAPI 後端的偵測平台，" +
        "過程中修掉明文密碼、硬編碼金鑰與字串拼接 SQL；另建一套 PyQt6 資料工程工作台，處理標註、YOLO 格式匯入匯出與資料集品質檢查。",
      tech: "FastAPI · SQLAlchemy / Alembic · React · PySide6 / PyQt6 · LangGraph · MySQL"
    },
    {
      date: "09/2024 – 08/2026",
      title: "微積分課程教學助理",
      org: "國立陽明交通大學（NYCU）",
      desc: "協助微積分課程教學與課務管理，開發 AI Agent 輔助學生報名與課務流程；獲 114 學年度優良教學助理獎。"
    }
  ],
  /* Phase 4D 曾有一筆「2023 – 2024 研究專題：台北捷運人流分析」的經歷，
     org 留空、標題含糊寫成「研究專題」。日期落在 NTNU 學士班期間、早於
     NYCU 碩士班（09/2024 起），沒有證據顯示這是一個獨立掛牌的職位或
     研究職，Phase 4D.1 移除。底下的 PageRank／MetroPulse 工作本身仍
     保留——透過 Projects 頁與上面 skills 的 evidence 行呈現，只是不再
     包裝成一段查無實據的「經歷」。 */
  awards: [
    {
      date: "2026",
      title: "TSMC IT CareerHack 冠軍",
      org: "台積電",
      desc: "團隊以 AI 輔助 legacy code 重構與驗證流程，包含 C→Rust 遷移與 MVC 架構解耦。"
    },
    {
      date: "114 學年度",
      title: "優良教學助理獎",
      org: "國立陽明交通大學（NYCU）",
      desc: "於微積分課程教學助理任職期間獲獎。"
    },
    {
      date: "2022",
      title: "最佳研究獎",
      org: "2022 Applied Mathematics Conference",
      desc: "臺北捷運人流分析專題，負責數學建模、Python 實作與結果解讀。"
    }
  ]
};


/* ---------------- 聯絡資訊 ---------------- */
const contacts = [
  {
    icon: "fa-envelope",
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}?subject=${encodeURIComponent("Portfolio inquiry")}`,
    hint: "開啟預設郵件程式；歡迎合作、面試邀請或技術討論"
  },
  {
    icon: "fa-brands fa-github",
    label: "GitHub",
    value: "github.com/samhung1205",
    href: profile.links.github,
    hint: "原始碼、專案與實驗筆記"
  },
  {
    icon: "fa-brands fa-linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/sam-hung05",
    href: profile.links.linkedin,
    hint: "完整職涯資訊"
  }
];


/* ---------------- 對外匯出 ---------------- *
   以 window.siteData 暴露，方便靜態頁面引用；
   未來遷移到 Next.js 時，可直接改成 ES Module export。
   --------------------------------------------- */
window.siteData = {
  profile,
  corePositioning,
  skills,
  projects,
  research,
  resume,
  contacts
};
