/* =========================================================
   main.js - 共用互動與內容渲染
   ---------------------------------------------------------
   負責：
     1. 導覽列（active link、行動版開關）
     2. 動態年份、社群連結
     3. Scroll Reveal 動畫
     4. Skill bar 動畫
     5. 各頁渲染函式 (render*)：依該頁元素存在與否，自動執行
     6. Contact 表單前端驗證（不串後端）
   ---------------------------------------------------------
   說明：
   - 所有「資料」皆從 window.siteData (data.js) 取得，
     確保資料與畫面分離；未來遷 Next.js 時，可改為從 props / fetch 取得。
   - 採用「特性偵測」風格：每個渲染器先檢查目標 DOM 是否存在，
     再決定是否執行 → 因此單一 main.js 可服務所有頁面。
   ========================================================= */


(function () {
  "use strict";

  const data = window.siteData || {};

  /* ---------- 工具函式 ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const renderTarget = (name, ctx = document) => $(`[data-render="${name}"]`, ctx);
  const renderTargets = (name, ctx = document) => $$(`[data-render="${name}"]`, ctx);

  // 簡易模板，避免 XSS：對任意字串做轉義
  const escape = (str = "") =>
    String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const statusMap = {
    "completed":   { cls: "status--completed", text: "Completed"   },
    "in-progress": { cls: "status--progress",  text: "In Progress" },
    "planned":     { cls: "status--planned",   text: "Coming Soon" }
  };


  /* =====================================================
     1. 導覽列：active link + 行動版開關
     ===================================================== */
  function initNav() {
    // 標記目前頁
    const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
    $$(".nav__link").forEach(a => {
      const href = (a.getAttribute("href") || "").toLowerCase();
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("is-active");
      }
    });

    // 行動版選單開關
    const toggle = $(".nav__toggle");
    const menu   = $(".nav__menu");
    if (toggle && menu) {
      const setMenu = (open) => {
        menu.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
      };

      toggle.addEventListener("click", () => {
        setMenu(!menu.classList.contains("is-open"));
      });

      $$(".nav__link", menu).forEach(a =>
        a.addEventListener("click", () => setMenu(false))
      );

      document.addEventListener("keydown", e => {
        if (e.key === "Escape") setMenu(false);
      });
    }
  }


  /* =====================================================
     2. Footer：動態年份 / 社群連結
     ===================================================== */
  function initFooter() {
    const y = renderTarget("footer-year");
    if (y) y.textContent = new Date().getFullYear();

    const social = renderTarget("footer-social");
    if (social && data.profile) {
      const { github, linkedin } = data.profile.links;
      social.innerHTML = `
        <li><a href="${escape(github)}"   aria-label="GitHub"   target="_blank" rel="noopener"><i class="fa-brands fa-github"></i></a></li>
        <li><a href="${escape(linkedin)}" aria-label="LinkedIn" target="_blank" rel="noopener"><i class="fa-brands fa-linkedin"></i></a></li>
        <li><a href="mailto:${escape(data.profile.email)}" aria-label="Email"><i class="fa-solid fa-envelope"></i></a></li>
      `;
    }
  }


  /* =====================================================
     3. Scroll Reveal：IntersectionObserver
     ===================================================== */
  function initReveal() {
    const items = $$(".reveal");
    if (!items.length || !("IntersectionObserver" in window)) {
      items.forEach(el => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-visible");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(el => io.observe(el));
  }


  /* =====================================================
     4. Skill bar 進場動畫
     ===================================================== */
  function animateSkillBars() {
    const bars = $$(".skill__fill");
    if (!bars.length) return;
    if (!("IntersectionObserver" in window)) {
      bars.forEach(b => b.classList.add("is-filled"));
      return;
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("is-filled");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    bars.forEach(b => io.observe(b));
  }


  /* =====================================================
     5-1. Home：渲染核心定位、Featured Projects、Featured Research
     ===================================================== */
  function renderHome() {
    // Hero 副標語現在是 design-system/MASTER.md §8 鎖定的靜態文案，
    // 直接寫在 _src/pages/index.html，不再從 data.profile.shortBio 渲染。
    const heroProof = renderTarget("hero-proof");
    if (heroProof && data.profile && data.profile.proof) {
      heroProof.innerHTML = data.profile.proof.map(item => `
        <span class="proof-pill">
          ${item.live ? `<span class="live-dot"></span>` : `<i class="fa-solid ${escape(item.icon)}"></i>`}
          ${escape(item.label)}
        </span>
      `).join("");
    }

    // 核心定位卡
    const coreGrid = renderTarget("core-grid");
    if (coreGrid && data.corePositioning) {
      coreGrid.innerHTML = data.corePositioning.map(c => `
        <article class="feature bento-card reveal">
          <div class="feature__icon"><i class="fa-solid ${escape(c.icon)}"></i></div>
          <h3>${escape(c.title)}</h3>
          <p>${escape(c.desc)}</p>
        </article>
      `).join("");
    }

    // Featured Projects：與 Projects 頁同一份 tier/visible 事實來源，
    // 只是首頁最多放 3 筆、且只有第一張用 Tier 1 降密度版型（首頁的
    // .project-bento 一列只容得下一張跨欄大卡）。用 tier 排序而不是靠
    // 陣列位置，data.js 調順位時首頁不會跟 Projects 頁講不同的故事。
    const featProj = renderTarget("featured-projects");
    if (featProj && data.projects) {
      const top = visibleProjects()
        .slice()
        .sort((a, b) => (a.tier || 2) - (b.tier || 2))
        .slice(0, 3);
      featProj.innerHTML = top
        .map((p, i) => projectCardHTML(p, { featured: i === 0 }))
        .join("");
    }

    // Featured Research（全部，通常 1–2 筆）
    const featRes = renderTarget("featured-research");
    if (featRes && data.research) {
      featRes.innerHTML = data.research.map(researchCardHTML).join("");
    }
  }


  /* =====================================================
     5-2. About：核心定位 / 學習方向
     ===================================================== */
  function renderAbout() {
    const coreGrid = renderTarget("about-core");
    if (coreGrid && data.corePositioning) {
      coreGrid.innerHTML = data.corePositioning.map(c => `
        <article class="feature reveal">
          <div class="feature__icon"><i class="fa-solid ${escape(c.icon)}"></i></div>
          <h3>${escape(c.title)}</h3>
          <p>${escape(c.desc)}</p>
        </article>
      `).join("");
    }

    const focusList = renderTarget("learning-focus");
    if (focusList && data.learningFocus) {
      focusList.innerHTML = data.learningFocus
        .map(item => `<li>${escape(item)}</li>`).join("");
    }
  }


  /* =====================================================
     5-3. Projects：完整列表（三層真實分級）
     ===================================================== */
  /**
   * Projects 的分層與可見性都由 js/data.js 的 tier / visible 欄位決定，
   * 不再在這裡維護一份 id 白名單——分層是「內容策展決策」，屬於資料，
   * 不屬於渲染邏輯；要調整順位或把開發中的專案放出來，只需要改 data.js。
   * visible:false 的專案完全不進 DOM（不是 CSS 隱藏），避免把還沒準備好
   * 對外的專案洩漏在原始碼或搜尋結果裡。
   */
  const visibleProjects = () =>
    (data.projects || []).filter(p => p.visible !== false);
  const byTier = (list, tier) => list.filter(p => (p.tier || 2) === tier);

  function renderProjects() {
    const grid = renderTarget("projects-grid");
    if (!grid || !data.projects) return;
    const list = visibleProjects();
    const tier1 = byTier(list, 1);
    const tier2 = byTier(list, 2);
    const tier3 = byTier(list, 3);

    grid.innerHTML = `
      ${tier1.length ? `<div class="project-tier1">${tier1.map(projectFeaturedHTML).join("")}</div>` : ""}
      ${tier2.length ? `<div class="project-tier2">${tier2.map(p => projectCardHTML(p)).join("")}</div>` : ""}
      ${tier3.length ? `<div class="project-tier3">${tier3.map(projectRowHTML).join("")}</div>` : ""}
    `;
  }

  /**
   * Tier 1 — Projects 頁精選案例：橫向、artifact 與內容並排、只放
   * 「這是什麼／做了什麼／為什麼重要」等級的濃縮內容，不放 highlights
   * 條列、不放整排 tag（design-system/MASTER.md §11）。目前還沒有
   * Case Study 詳細頁，所以只放驗證過真的有效的 GitHub/Demo 連結，
   * 不放「View Case Study」——按鈕不能指向不存在的頁面。
   */
  function projectFeaturedHTML(p) {
    const s = statusMap[p.status] || statusMap["planned"];
    const hasGithub = !!(p.github && p.github !== "#");
    const hasDemo = !!(p.demo && p.demo !== "#");
    const links = [
      hasGithub ? `<a href="${escape(p.github)}" target="_blank" rel="noopener"><i class="fa-brands fa-github"></i> GitHub</a>` : "",
      hasDemo ? `<a href="${escape(p.demo)}" target="_blank" rel="noopener"><i class="fa-solid fa-up-right-from-square"></i> Live Demo</a>` : "",
    ].filter(Boolean).join("");

    return `
      <article id="project-${escape(p.id)}" class="project-feature project-feature--${escape(p.id)} reveal">
        <div class="card__thumb project-feature__thumb" aria-hidden="true">
          <span>${escape(p.slug || p.name)}</span>
        </div>
        <div class="project-feature__body">
          <div class="card__header">
            <div>
              <span class="card__kicker">Featured</span>
              <h3 class="card__title">${escape(p.name)}</h3>
            </div>
            <span class="status ${s.cls}">${s.text}</span>
          </div>
          <p class="card__summary">${escape(p.summary)}</p>
          <div class="card__meta">
            <b>角色：</b>${escape(p.role || "—")}${
              (p.tech || []).length ? ` &middot; ${(p.tech || []).slice(0, 4).map(escape).join(" / ")}` : ""
            }
          </div>
          ${links ? `<div class="card__footer project-feature__links">${links}</div>` : ""}
        </div>
      </article>
    `;
  }

  /**
   * Tier 3 — 附屬／索引專案：緊湊列表列，不給縮圖，避免版面為了對稱
   * 硬塞一張用不到的卡（design-system/MASTER.md §11）。
   */
  function projectRowHTML(p) {
    const hasGithub = !!(p.github && p.github !== "#");
    const hasDemo = !!(p.demo && p.demo !== "#");
    const link = hasDemo
      ? `<a href="${escape(p.demo)}" target="_blank" rel="noopener">Demo</a>`
      : hasGithub
        ? `<a href="${escape(p.github)}" target="_blank" rel="noopener">GitHub</a>`
        : `<span class="card__link-placeholder">尚未公開</span>`;
    return `
      <div id="project-${escape(p.id)}" class="project-row">
        <span class="project-row__name">${escape(p.name)}</span>
        <span class="project-row__tech">${(p.tech || []).slice(0, 4).map(escape).join(" / ")}</span>
        <span class="project-row__link">${link}</span>
      </div>
    `;
  }

  /**
   * 專案卡渲染。
   * @param {object}  p
   * @param {object}  [opts]
   * @param {boolean} [opts.featured=false]  Tier 1（首頁精選案例）用：
   *   降密度——拿掉 highlights／雙連結，角色與技術併成一行，footer 換成
   *   單一「View Case Study」（design-system/MASTER.md §11）。projects.html
   *   的完整列表與首頁 Tier 2/3 都不傳這個 flag，維持原本完整內容。
   */
  function projectCardHTML(p, opts = {}) {
    const featured = !!opts.featured;
    const id = escape(p.id || "default");
    const s = statusMap[p.status] || statusMap["planned"];
    const tags = (p.tech || []).map(t => `<span class="tag">${escape(t)}</span>`).join("");
    const highlights = (p.highlights || [])
      .map(h => `<li>${escape(h)}</li>`).join("");
    const isPlaceholder = !p.demo || p.demo === "#";
    const demoLink = isPlaceholder
      ? `<span class="card__link-placeholder">
           Demo not published yet
         </span>`
      : `<a href="${escape(p.demo)}" target="_blank" rel="noopener">
           <i class="fa-solid fa-up-right-from-square"></i> Live Demo
         </a>`;

    const metaLine = featured
      ? `<div class="card__meta"><b>角色：</b>${escape(p.role || "—")}${
          (p.tech || []).length ? ` &middot; ${(p.tech || []).slice(0, 3).map(escape).join(" / ")}` : ""
        }</div>`
      : `<div class="card__meta"><b>角色：</b>${escape(p.role || "—")}</div>`;

    // 首頁 Tier 1 的 CTA 指到 projects.html 對應卡片的錨點。標籤刻意寫
    // 「View Project」而不是「View Case Study」——精選專案不等於案例研究，
    // 案例研究頁目前一頁都還沒有，按鈕不能承諾一個不存在的東西
    // （design-system/MASTER.md §20）。
    // GitHub 連結只在真的有效時才渲染——p.github 是空字串代表「查證過
    // 沒有公開 repo」，不能落回 "#" 顯示一個會 404 的假按鈕
    // （design-system/MASTER.md §9）。
    const hasGithub = !!(p.github && p.github !== "#");
    const githubLink = hasGithub
      ? `<a href="${escape(p.github)}" target="_blank" rel="noopener">
           <i class="fa-brands fa-github"></i> GitHub
         </a>`
      : "";
    const footer = featured
      ? `<div class="card__footer">
           <a class="card__case-cta" href="projects.html#project-${id}">
             View Project <i class="fa-solid fa-arrow-right"></i>
           </a>
         </div>`
      : `<div class="card__footer">
           ${githubLink}
           ${demoLink}
         </div>`;

    return `
      <article id="project-${id}" class="card project-card project-card--${id} reveal">
        <div class="card__thumb" aria-hidden="true">
          <span>${escape(p.slug || p.name)}</span>
        </div>
        <div class="card__header">
          <div>
            <span class="card__kicker">Project</span>
            <h3 class="card__title">${escape(p.name)}</h3>
          </div>
          <span class="status ${s.cls}">${s.text}</span>
        </div>
        <p class="card__summary">${escape(p.summary)}</p>
        ${metaLine}
        ${!featured && highlights ? `<ul class="card__highlights">${highlights}</ul>` : ""}
        ${!featured ? `<div class="tag-list">${tags}</div>` : ""}
        ${footer}
      </article>
    `;
  }


  /* =====================================================
     5-4. Research：完整列表
     ===================================================== */
  function renderResearch() {
    const grid = renderTarget("research-grid");
    if (!grid || !data.research) return;
    grid.innerHTML = data.research.map(researchCardHTML).join("");
  }

  function researchCardHTML(r) {
    const s = statusMap[r.status] || statusMap["planned"];
    const tags = (r.keywords || [])
      .map(k => `<span class="tag">${escape(k)}</span>`).join("");
    const highlights = (r.highlights || [])
      .map(h => `<li>${escape(h)}</li>`).join("");
    const links = r.links || {};
    const linkRow = Object.entries(links).map(([k, v]) => {
      if (!v || v === "#") return "";
      return `<a href="${escape(v)}" target="_blank" rel="noopener">
                <i class="fa-solid fa-up-right-from-square"></i> ${escape(k)}
              </a>`;
    }).join("");

    return `
      <article class="card reveal">
        <div class="card__header">
          <div>
            <span class="section-eyebrow section-eyebrow--compact">${escape(r.type)}</span>
            <h3 class="card__title card__title--spaced">${escape(r.title)}</h3>
          </div>
          <span class="status ${s.cls}">${s.text}</span>
        </div>
        <p class="card__summary">${escape(r.summary)}</p>
        ${highlights ? `<ul class="card__highlights">${highlights}</ul>` : ""}
        <div class="tag-list">${tags}</div>
        ${linkRow ? `<div class="card__footer">${linkRow}</div>` : ""}
      </article>
    `;
  }


  /* =====================================================
     5-5. Resume：教育 / 經歷 / 獲獎 / 技能
     ===================================================== */
  function renderResume() {
    const ed = renderTarget("resume-education");
    if (ed && data.resume) ed.innerHTML = timelineHTML(data.resume.education);

    const ex = renderTarget("resume-experience");
    if (ex && data.resume) ex.innerHTML = timelineHTML(data.resume.experience);

    const aw = renderTarget("resume-awards");
    if (aw && data.resume) aw.innerHTML = timelineHTML(data.resume.awards);

    renderSkills();
  }

  function timelineHTML(items) {
    if (!items || !items.length) return "";
    return items.map(it => `
      <div class="timeline__item reveal">
        <div class="timeline__date">${escape(it.date)}</div>
        <h4 class="timeline__title">${escape(it.title)}</h4>
        <div class="timeline__org">${escape(it.org)}</div>
        ${it.desc ? `<p>${escape(it.desc)}</p>` : ""}
      </div>
    `).join("");
  }

  function renderSkills() {
    if (!data.skills) return;
    const groups = [
      { key: "languages",   target: "skills-languages",   label: "Programming Languages" },
      { key: "ai",          target: "skills-ai",          label: "AI / ML" },
      { key: "engineering", target: "skills-engineering", label: "Software Engineering" },
      { key: "math",        target: "skills-math",        label: "Math / Statistics" }
    ];
    groups.forEach(g => {
      renderTargets(g.target).forEach(root => {
        root.innerHTML = (data.skills[g.key] || []).map(s => `
          <div class="skill">
            <div class="skill__head">
              <span>${escape(s.name)}</span>
              <span>${escape(String(s.level))}%</span>
            </div>
            <div class="skill__bar">
              <div class="skill__fill skill__fill--${escape(String(s.level))}"></div>
            </div>
          </div>
        `).join("");
      });
    });
  }


  /* =====================================================
     5-6. Contact：渲染聯絡卡片 + 表單前端驗證
     ===================================================== */
  function renderContact() {
    const list = renderTarget("contact-list");
    if (list && data.contacts) {
      list.innerHTML = data.contacts.map(c => `
        <li class="reveal">
          <i class="${escape(c.icon.startsWith('fa-brands') ? c.icon : 'fa-solid ' + c.icon)}"></i>
          <div>
            <a href="${escape(c.href)}" target="_blank" rel="noopener">
              <strong>${escape(c.label)}</strong>
            </a>
            <small>${escape(c.value)} · ${escape(c.hint || "")}</small>
          </div>
        </li>
      `).join("");
    }

    const form = renderTarget("contact-form");
    if (form) {
      form.addEventListener("submit", e => {
        e.preventDefault();
        const status = renderTarget("form-status", form);
        if (!status) return;
        const name   = form.elements["name"].value.trim();
        const email  = form.elements["email"].value.trim();
        const msg    = form.elements["message"].value.trim();
        status.classList.remove("form__status--success", "form__status--warning");
        if (!name || !email || !msg) {
          status.classList.add("form__status--warning");
          status.textContent = "請填寫姓名、Email 與訊息內容。";
          return;
        }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
          status.classList.add("form__status--warning");
          status.textContent = "Email 格式看起來不太對，請再確認。";
          return;
        }
        // 第一版尚未串後端，先顯示成功訊息
        status.classList.add("form__status--success");
        status.textContent = `感謝你的訊息！（前端表單，尚未串接後端，可改寄到 ${data.profile.email}）`;
        form.reset();
      });
    }
  }


  /* =====================================================
     6. 初始化（依當頁存在的 DOM 自動觸發）
     ===================================================== */
  document.addEventListener("DOMContentLoaded", () => {
    initNav();
    initFooter();
    renderHome();
    renderAbout();
    renderProjects();
    renderResearch();
    renderResume();
    renderContact();
    initReveal();
    animateSkillBars();
  });
})();
