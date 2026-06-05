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
  email: "shaojun5861@example.com",   
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
/* status: "completed" | "in-progress" | "planned" */
const projects = [
  {
    id: "metropulse",
    name: "MetroPulse 推薦系統",
    slug: "MP",
    summary: "結合捷運人流與商圈資料的個人化地點推薦系統。",
    tech: ["Python", "CSS", "TypeScript", "JavaScript", "Cloudflare"],
    role: "主開發者 / 資料建模",
    highlights: [
      "整合捷運運量與時段熱度資料，建立人流預測特徵",
      "設計 Hybrid Recommender：Content-Based + Collaborative Filtering",
      "前後端整合並提供即時推薦 API"
    ],
    github: "https://github.com/samhung1205/MetroPulse",   // TODO
    demo:   "#",                                              // TODO: Demo URL
    status: "completed"
  },
  {
    id: "yolo-ship",
    name: "YOLO 船舶物件偵測",
    slug: "YOLO",
    summary: "以 YOLO 系列模型對海事影像進行船舶偵測與分類。",
    tech: ["Python", "PyTorch", "YOLOv11", "OpenCV"],
    role: "資料處理 / 模型訓練與評估",
    highlights: [
      "建立自訂船舶資料集並進行標註清理",
      "比較 YOLOv5 / YOLOv8 在不同尺度船舶上的表現",
      "輸出可視化偵測結果與 mAP 評估報告"
    ],
    github: "https://github.com/samhung1205/yolo-ship",    // TODO
    demo:   "#",
    status: "completed"
  },
  {
    id: "ai-agent-lab",
    name: "AI Agent Lab",
    slug: "AGENT",
    summary: "以 LangGraph 打造可規劃、可呼叫工具的研究助理 Agent。",
    tech: ["Python", "LangGraph", "LangChain", "RAG", "Tool Calling"],
    role: "Agent 架構設計 / 工具整合",
    highlights: [
      "規劃多節點 Graph：Planner → Retriever → Tool Caller → Reflector",
      "整合本地向量資料庫提供研究文獻 RAG 檢索",
      "預計加入 Deep Agents 風格的子任務分派"
    ],
    github: "https://github.com/samhung1205/ai-agent-lab", // TODO
    demo:   "#",
    status: "in-progress"
  },
  {
    id: "personal-website",
    name: "Personal Website",
    slug: "WEB",
    summary: "個人作品集、研究展示與履歷網站（即此網站）。",
    tech: ["HTML", "CSS", "JavaScript"],
    role: "設計與開發",
    highlights: [
      "純 HTML / CSS / JS，預留遷移到 Next.js + TypeScript 的彈性",
      "資料與畫面分離：所有內容集中在 js/data.js",
      "響應式設計，支援桌機、平板、手機"
    ],
    github: "https://github.com/samhung1205/personal-website", // TODO
    demo:   "#",
    status: "completed"
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
      desc: "持續開發 AI Agent 與全端專案，包含 MetroPulse、YOLO 船舶偵測、AI Agent Lab 等。"
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
