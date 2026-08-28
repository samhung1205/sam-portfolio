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
    { icon: "fa-graduation-cap", label: "M.S. Applied Math" },
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
    desc: "專注 LangChain / LangGraph / Deep Agents、RAG 與 Tool Calling，打造可推理的自動化系統。"
  },
  {
    icon: "fa-brain",
    title: "AI / Machine Learning",
    desc: "從推薦系統、物件偵測到生成式 AI，著重將模型結果轉化為實際應用。"
  }
];


/* ---------------- 技術能力 ---------------- */
const skills = {
  languages: [
    { name: "Python",      level: 90 },
    { name: "JavaScript",  level: 75 },
    { name: "TypeScript",  level: 60 },
    { name: "SQL",         level: 75 },
    { name: "R",           level: 65 }
  ],
  ai: [
    { name: "PyTorch / scikit-learn", level: 80 },
    { name: "LangChain / LangGraph",  level: 75 },
    { name: "RAG / Tool Calling",     level: 75 },
    { name: "YOLO / Computer Vision", level: 70 }
  ],
  engineering: [
    { name: "Git / GitHub",           level: 85 },
    { name: "FastAPI / Flask",        level: 70 },
    { name: "Docker",                 level: 60 },
    { name: "HTML / CSS / Web",       level: 75 }
  ],
  math: [
    { name: "Experimental Design",    level: 90 },
    { name: "Statistical Modeling",   level: 85 },
    { name: "Optimization",           level: 75 },
    { name: "Data Analysis",          level: 85 }
  ]
};


/* ---------------- 目前學習方向 ---------------- */
const learningFocus = [
  "LangChain：基礎 Chain / Prompt / Memory 整合與工具串接",
  "LangGraph：以圖結構建構多步驟、可控的 Agent workflow",
  "Deep Agents：探索具備規劃、反思、子任務分派能力的 Agent 架構",
  "RAG (Retrieval-Augmented Generation)：向量檢索、Reranker 與評估",
  "Tool Calling：讓 LLM 安全、結構化地呼叫外部 API 與資料源"
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
    name: "YOLO System — 桌面 ＋ Web 雙軌平台",
    slug: "YOLO",
    tier: 1,
    visible: true,
    summary:
      "把一支 UI、業務邏輯與 SQL 全部耦合在一起的 PySide6 桌面程式，" +
      "重構成 FastAPI 後端搭配 React Web 前端、桌面版共用同一組 API 的雙軌平台，" +
      "並在過程中修掉明文密碼、硬編碼金鑰與字串拼接 SQL。",
    tech: ["FastAPI", "React", "PySide6", "LangGraph", "YOLO", "SQLAlchemy"],
    role: "系統架構與全端實作（後端 / Web / 桌面）",
    highlights: [
      "分層重構 legacy：UI／業務邏輯／資料存取拆開，SQL 改走 SQLAlchemy ORM",
      "身分驗證改為 bcrypt 雜湊 ＋ JWT，金鑰與 DB 連線移入環境變數",
      "以 LangGraph 建立 agent 層並支援 SSE 串流，Web 與桌面共用同一組 API"
    ],
    github: "https://github.com/samhung1205/Yolo-System",
    demo:   "",
    status: "in-progress"
  },
  {
    id: "detection-data-engine",
    name: "SDDE — 船舶偵測資料工程工作台",
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
    id: "metropulse",
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
    demo:   "",
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
const research = [
  {
    id: "thesis-Yolo",
    type: "Master Thesis",
    title: "Optimizing Ship Detection in Multi-Scale Environments",
    summary:
      "Developed a ship detection pipeline for multi-scale environments and evaluated model performance across complex visual scenes." +
      "Improved the YOLO11 architecture by comparing feature extraction modules using Python and PyTorch.",
    keywords: [
      "Ship Detection",
      "YOLO11",
      "Computer Vision",
      "Deep Learning"
    ],
    highlights: [
      "Constructed a custom dataset with multi-scale ship annotations",
      "Implemented and compared different feature extraction in YOLO11",
      "Analyzed model performance using mAP and visualized detection results"
      
    ],
    status: "in-progress",
    links: {
      paper: "#",          // TODO
      slides: "#",         // TODO
      repo: "#"            // TODO
    }
  },
  {
    id: "ai-agent-research",
    type: "Independent Research",
    title: "AI Agent：從 LangChain 到 Deep Agents 的實作探索",
    summary:
      "正在學習與實作 LangChain、LangGraph、Deep Agents、RAG、Tool Calling 等技術，" +
      "目標是建立可用於研究整理、報告生成與自動化工作流程的 AI Agent 系統。",
    keywords: [
      "LangChain", "LangGraph", "Deep Agents",
      "RAG", "Tool Calling", "LLM Workflow"
    ],
    highlights: [
      "比較不同 Agent 架構（ReAct / Plan-Execute / Graph-based）",
      "建立研究文獻 RAG 流程，並嘗試自動化摘要與彙整",
      "探索 Deep Agents 風格的長期規劃與反思機制"
    ],
    status: "in-progress",
    links: { repo: "#", notes: "#" }
  }
];


/* ---------------- 履歷 (Resume) ---------------- */
const resume = {
  education: [
    {
      date: "2024 – Present",
      title: "數學建模與科學計算碩士",
      org: "NYCU Taiwan · 數科所",
      desc: "研究方向：科學計算、影像辨識、機器學習。"
    },
    {
      date: "2020 – 2024",
      title: "數學學士",
      org: "NTNU Taiwan · 數學系",
      desc: "主修：數值方法、機率、統計、最佳化、線性代數。"
    }
  ],
  experience: [
    {
      date: "2026 – Present",
      title: "AI Agent / Software Engineer (Self-directed)",
      org: "Independent Projects",
      desc: "持續開發 AI Agent 與全端專案，包含 YOLO System、SDDE 資料工程工作台與 MetroPulse。"
    },
    {
      date: "2023 – 2024",
      title: "Graduate Researcher",
      org: "Scientific Computing / Statistics / Data Analysis",
      desc: "運用 Google Pagerank 於台北捷運⼈流分析。"
    }
  ],
  awards: [
    {
      date: "2026",
      title: " 1st Place TSMC IT CareerHack",
      org: "legacy code / refactoring / AI Agent",
      desc: "Hackathon 冠軍。"
    }
  ]
};


/* ---------------- 聯絡資訊 ---------------- */
const contacts = [
  {
    icon: "fa-envelope",
    label: "Email",
    value: profile.email,
    href: `mailto:${profile.email}`,
    hint: "歡迎合作、面試邀請或技術討論"
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
  learningFocus,
  projects,
  research,
  resume,
  contacts
};
