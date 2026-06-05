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
    // Hero 名字 & 描述
    const heroBio  = renderTarget("hero-bio");
    if (heroBio  && data.profile) heroBio.textContent  = data.profile.shortBio;

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
          <h4>${escape(c.title)}</h4>
          <p>${escape(c.desc)}</p>
        </article>
      `).join("");
    }

    // Featured Projects（取前 3 個）
    const featProj = renderTarget("featured-projects");
    if (featProj && data.projects) {
      featProj.innerHTML = data.projects.slice(0, 3).map(projectCardHTML).join("");
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
          <h4>${escape(c.title)}</h4>
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
     5-3. Projects：完整列表
     ===================================================== */
  function renderProjects() {
    const grid = renderTarget("projects-grid");
    if (!grid || !data.projects) return;
    grid.innerHTML = data.projects.map(projectCardHTML).join("");
  }

  function projectCardHTML(p) {
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

    return `
      <article class="card project-card project-card--${escape(p.id || "default")} reveal">
        <div class="card__thumb" aria-hidden="true">
          <span>${escape(p.slug || p.name)}</span>
        </div>
        <div class="card__header">
          <div>
            <span class="card__kicker">Case Study</span>
            <h3 class="card__title">${escape(p.name)}</h3>
          </div>
          <span class="status ${s.cls}">${s.text}</span>
        </div>
        <p class="card__summary">${escape(p.summary)}</p>
        <div class="card__meta"><b>角色：</b>${escape(p.role || "—")}</div>
        ${highlights ? `<ul class="card__highlights">${highlights}</ul>` : ""}
        <div class="tag-list">${tags}</div>
        <div class="card__footer">
          <a href="${escape(p.github || "#")}" target="_blank" rel="noopener">
            <i class="fa-brands fa-github"></i> GitHub
          </a>
          ${demoLink}
        </div>
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
