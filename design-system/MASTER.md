# Design System — Sam Hung Personal Portfolio

**Status:** Authoritative production design system (Preserve-and-Polish redesign)
**Last reviewed:** 2026-08-28
**Supersedes:** the original `MASTER.md` tracked as the legacy baseline at commit `2aa3e99` (still available in Git history — this rewrite does not delete that history, only the working content of this file)

> Two label types are used throughout this document:
> - **[RULE]** — a design decision. Not automatically checked; enforced by review and by following this document.
> - **[CI]** — mechanically enforced today by `npm run verify` (`scripts/verify.mjs` + `scripts/lib/checks.mjs`). If a `[CI]` line and the actual check ever disagree, the check is correct until this doc is updated — file that as a doc bug, not a code bug.
>
> This document does not use "Phase 1/2/3" to describe rollout stages — that language collided with this project's own numbered work phases in earlier drafts. Where a rollout order is needed, this doc says **Now** (already true or already CI-enforced), **Planned** (specified, not yet implemented), or **Deferred** (explicitly not scheduled).

---

## 1. Product / Design Principles

This is a portfolio for a specific hiring search: **AI Agent / software engineering roles**, for one candidate, read primarily by recruiters (fast scan) and hiring engineers (slower, evidence-seeking read).

**[RULE] Identity anchor.** *Preserve-and-Polish.* The site must remain recognizably the current portfolio — same navigation, same hero metaphor, same portrait-led identity — refined in execution, not replaced in concept. This document is not a request for a new visual language.

**[RULE] What this site is not.** Not an AI SaaS landing page, not an editorial/publication design, not brutalist, not a design-agency portfolio, not a cyberpunk/futuristic interface. If a proposed change's justification is "this is how AI/tech products look," that is disqualifying, not persuasive.

**[RULE] Evidence over decoration.** Technical credibility comes from real projects, real screenshots, architecture diagrams, results, and writing — never from decorative circuitry, gradients, particles, or generic AI iconography standing in for content that doesn't exist yet.

### 1.1 Implementation Constraints

**[RULE]** This design system must be implemented within the existing architecture, not alongside a new one:

- Static HTML/CSS/JavaScript. No framework migration as part of this redesign.
- The shared `_src/` layout/build system remains authoritative — generated pages are never hand-edited.
- The Notion → article pipeline (`scripts/sync-notion.mjs`) must remain compatible.
- Existing CI/verification gates (`npm run verify`) must continue to pass throughout implementation, not just at the end.

This is a boundary, not an engineering plan — see §19 for the specific files this revision touches.

---

## 2. Visual Identity

**[RULE] Character.** Clean, confident, quietly technical. Modern software-engineer portfolio — not a student assignment, not a marketing microsite.

**[RULE] Retired as the site's identity label.** *"Bento Personal Brand"* is retired. Bento-style grouping may still appear where content genuinely has mixed weights (see §11), but it is no longer the name of the design direction, and nothing should be built specifically to *be* a bento layout.

**[RULE] Anti-patterns — explicit, permanent.**
- No deep-navy or dark-blue identity.
- No blue → indigo → cyan (or purple) gradient system.
- No neon accents, no glow-heavy surfaces (`box-shadow` blur used for depth is fine; blur used to simulate light-emission is not).
- No glassmorphism as a dominant treatment (the portrait badge's `backdrop-filter` is a narrow, justified exception — see §10 — not a precedent).
- No decorative neural-network / circuit-board / particle motifs.
- No warm-paper / cream editorial palette (this was evaluated and explicitly rejected during design-direction exploration).
- No card-everything layout, no excessive pill badges, no fake-terminal decoration.

---

## 3. Color Tokens

Light-first. **[RULE] Dark mode is Deferred** — no production dark palette is defined by this document. Do not design new components around an assumed dark variant. When dark mode is scheduled, it gets its own design pass and its own contrast-pair audit; it does not inherit assumptions from this section.

### 3.1 Neutral system

| Token | Value | Usage |
|---|---:|---|
| `--color-bg` | `#FAFAFA` | Page background |
| `--color-bg-alt` | `#F4F4F5` | Alternating section band |
| `--color-surface` | `#FFFFFF` | Cards, nav, form fields |
| `--color-border` | `#E4E4E7` | Default hairline border |
| `--color-text` | `#18181B` | Primary text |
| `--color-text-muted` | `#52525B` | Secondary text |
| `--color-text-dim` | `#6A6A70` | Tertiary / de-emphasized text |

**[RULE] No blue-tinted neutrals.** The previous system's border (`#D8E2F0`) and alt-background (`#EEF4FF`) carried a blue cast into what should have been neutral gray — this was a primary source of the site reading as a generic AI/SaaS template. Every neutral token above is genuinely achromatic or near-achromatic. This is a hard constraint, not a preference: a future accent change must not re-introduce hue into `--color-bg`, `--color-bg-alt`, or `--color-border`.

### 3.2 Brand accent — Muted Copper

| Token | Value | Usage |
|---|---:|---|
| `--color-primary` | `#9C5A3C` | Interactive default: primary button fill, active nav state, links |
| `--color-primary-hover` | `#7A4429` | Hover / pressed state; also used as `--color-accent-text` (small accent text — eyebrows, icons — where a stronger, AA-safer copper is needed) |

**[RULE] Copper is a role, not a surface fill.** Copper is for things the user can act on or that deserve one point of emphasis — buttons, active states, icon accents, the one metric on a case-study page. **Large surfaces (page background, section bands, card fills) must never carry a copper tint.** This mirrors §3.1: an accent hue leaking into the neutral system is the exact failure mode being corrected.

**[RULE] Retired token.** The previous three-hue system (`--color-primary` blue / `--color-primary-2` indigo / `--color-accent` cyan) is retired. There is one accent family now (copper, two weights). See §19 for the exact CSS-variable migration this implies — this is a **Planned**, not yet implemented, change.

### 3.3 Status colors

| Token | Value | Usage |
|---|---:|---|
| `--color-success` | `#059669` | "Completed" status |
| `--color-warning` | `#A16207` | "In progress" status — **revised** from `#D97706` |

**[RULE] Brand accent and semantic warning are not interchangeable, and must stay visually distinguishable.**

- **Muted Copper** (`--color-primary` / `--color-primary-hover`) = interaction and brand emphasis. Buttons, links, active states, icon accents.
- **Warning** (`--color-warning`) = status only — exclusively the "in progress" project/research badge. Never used for anything interactive or brand-related.

The two families were previously close enough (`#9C5A3C` vs. `#D97706`) that a status badge next to a copper-accented element could misread as related. `--color-warning` is revised to `#A16207` — 16° further around the hue wheel from copper than the legacy value, while still passing AA (4.72:1 on `--color-bg`, 4.92:1 as white-on-fill). Do not tune this value back toward copper for stylistic consistency; the distance is the point.

### 3.4 Contrast

**[CI]** All pairs below are enforced by `checkContrast` against `_src/config/contrast.json` (WCAG 2.1 SC 1.4.3 — 4.5:1 normal text, 3.0:1 large text/UI). Ratios shown are against the new tokens; they must be re-verified by the CI gate once the tokens are implemented, not assumed from this table.

| Foreground | Background | Ratio | Threshold |
|---|---|---:|---:|
| `--color-text` | `--color-bg` | 16.97:1 | 4.5 |
| `--color-text-muted` | `--color-bg` | 7.41:1 | 4.5 |
| `--color-text-dim` | `--color-bg` | 4.63:1 | 4.5 |
| `--color-primary` (as text) | `--color-bg` | 4.81:1 | 4.5 |
| `--color-primary-hover` (as text/accent) | `--color-bg` | 6.83:1 | 4.5 |
| `--color-primary` (white text on fill) | — | 5.02:1 | 4.5 |

**[RULE] Non-text UI boundaries** (inputs, focusable card borders) need 3:1, not the decorative hairline `--color-border` (which measures ≈1.3:1 against white — fine for a quiet divider, not sufficient where a boundary is load-bearing). Use `rgb(var(--c-text-rgb) / 0.35)` or equivalent (~`#8A8A8F`, 3.4:1) for any border that must be perceivable as a boundary, e.g. focus rings, form inputs, interactive card edges.

---

## 4. Typography

**[RULE] Keep the current font stack.** Inter (UI/body), Archivo (display headings, used selectively), Noto Sans TC (CJK), JetBrains Mono (technical/data contexts only — figures, code, tags). **Do not change fonts to chase a detector's "overused font" warning** — Inter's ubiquity is a real signal worth knowing about, but the type-scale problem below is what actually made the site read generic, and fixing the scale is the higher-leverage, lower-risk fix. (This exception is recorded in `.impeccable/config.json` as a sanctioned ignore.)

```css
--font-heading: "Archivo", "Noto Sans TC", sans-serif;
--font-sans: "Inter", "Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

### 4.1 Type scale

**[RULE] The core defect being fixed:** in the legacy implementation, 12px text was used 44 times and 16px only 5 times — the dominant reading size on the page was a label size. The scale below fixes this directly.

| Token | Size | Role |
|---|---:|---|
| `--fs-xs` | `0.8125rem` (13px) | Labels, metadata, tags — **not** body text |
| `--fs-sm` | `0.875rem` (14px) | Secondary UI text |
| `--fs-base` | `1rem` (16px) | **Default body text** — normal reading copy belongs here |
| `--fs-md` | `1.125rem` (18px) | Lead paragraphs, card summaries |
| `--fs-lg` | `1.25rem` (20px) | Card titles |
| `--fs-xl` | `1.5rem` (24px) | Small section headings |
| `--fs-h3` | `1.75rem` (28px) | **New — the missing middle heading level**, for sub-section headings that need more weight than 24px but shouldn't compete with a page's main H2 |
| `--fs-2xl` | `2rem` (32px) | — |
| `--fs-3xl` | `2.5rem` (40px) | Section H2 |
| `--fs-4xl` | `3.25rem` (52px) | Page-level H1 (non-hero) |

Hero H1 keeps its own fluid `clamp()` rule (see §8), since it needs to respond to both viewport width and the hero's fixed-height budget — a fixed step in this table can't do that.

**[RULE] `--fs-xs` moved from 12px to 13px.** This is a value change, not a rename — every existing `var(--fs-xs)` reference is unaffected structurally. It clears the 11px WCAG-adjacent floor with margin and was the single edit that resolved ~44 undersized-text instances at once.

**[RULE] 12px-scale text is for genuine metadata only** — timestamps, fine print, dense table cells where 13px would visibly crowd. It must never be the site's dominant text size again.

### 4.2 Heading hierarchy

**[RULE] Semantic order is required.** No skipping levels (the legacy site skipped H2 → H4 in the bento/feature grid). Visual size is controlled by the type-scale tokens above, independent of semantic level — a visually small H3 is fine; a semantically-skipped H4 is not.

**[CI]** `checkStructuralHtml` verifies each page has exactly one `<h1>` and a present `<main>`; it does not currently walk full heading order for skips. Full no-skip enforcement is **Planned**, not yet a CI gate — see §19.

### 4.3 Line length / rhythm

**[RULE]** Reading-width text (card summaries, paragraphs) is capped at ~62–65ch. Line-height: 1.65 body / 1.55 card text / 1.1–1.2 headings — unchanged from the legacy spec, still correct.

---

## 5. Spacing / Layout

Unchanged from the legacy system — this part was already sound.

| Token | Value |
|---|---:|
| `--space-1` … `--space-9` | `0.25rem` → `6rem`, 4px-based |

- Container: `1120px`–`1200px` max-width.
- Desktop section padding: `80–112px` vertical. **[RULE]** use one consistent value per template, not the legacy's unexplained 64/96/96/96 mix.
- Mobile section padding: `48–64px`.
- Card gap: `20–28px`.

---

## 6. Radius / Border / Shadow

| Token | Value | Usage |
|---|---:|---|
| `--radius-sm` | `8px` | Small controls, tags |
| `--radius-md` | `10px` | Buttons, inputs, Tier-3 fallback tiles |
| `--radius-lg` | `16px` | Standard (Tier-2) cards, credential blocks |
| `--radius-xl` | `20–22px` | Featured (Tier-1) card, portrait frame |

```css
--shadow-sm: 0 1px 2px rgb(var(--c-text-rgb) / 0.06);
--shadow-md: 0 12px 30px rgb(var(--c-text-rgb) / 0.08);
```

**[RULE] `--shadow-lg` and `--shadow-glow` are retired.** The legacy 24px/60px-blur shadow and the copper-tinted glow shadow are both gone. The portrait frame's shadow is reduced to `0 18px 44px rgb(var(--c-text-rgb) / 0.10)` — present but quiet.

**[RULE] Elevation communicates hierarchy, not decoration.** Exactly one shadow weight differentiates Tier-1 from Tier-2/3 (see §11) — not a shadow-per-hover-state system. Hover-lift (`translateY`) is retired as the default card interaction (see §16).

---

## 7. Navigation

**[RULE] Preserve the current 6 items and structure:** Home, About, Projects, Research, Articles, Resume. **Do not restructure.** (Note: this differs from the legacy doc's "recommended" list, which included Contact and omitted Articles — that recommendation is superseded; Articles is real, shipped content and stays.)

**[RULE] Direct-contact nav affordance (new).**
- Wide desktop: current 6 nav items + a compact, filled, **labelled** Contact action to `resume.html#contact`, 44px min-height.
- Constrained laptop width: all 6 nav destinations are preserved — the IA does not shrink. If the labelled Contact action starts crowding the nav at this width, **collapse Contact to a 44×44 icon-only action first**, before touching anything else.
- Mobile: existing disclosure/hamburger behavior, Contact collapses to 44×44 icon-only. (A first prototype pass shipped Contact at 198px wide on mobile and visibly crowded the header — confirmed by testing, fixed by icon-only collapse.)

**[RULE — three-state responsive contract, measured and now locked]** Measured against the real built nav (production logo, wordmark and font metrics, inner pages — the homepage's brandless nav is not the constraint):

| Part | Measured width |
|---|---:|
| Brand (logo + wordmark + role line) | 295px |
| Six nav links incl. gaps | 534px |
| Contact — labelled | 108px |
| Contact — icon-only | 44px |
| `<nav>` internal menu↔Contact gap | 12px |
| `.container` side padding | 24px each |

With `W` = media-query width (includes the scrollbar; `clientWidth` = `W − 15`):

| State | Range | Nav | Contact | Brand↔nav separation |
|---|---|---|---|---|
| **A** | `W ≥ 1041px` | 6 labelled links | labelled, 108px | ≥ 29px |
| **B** | `965px – 1040px` | 6 labelled links | 44×44 icon-only | 18–93px |
| **C** | `W ≤ 964px` | disclosure menu | 44×44 icon-only | n/a |

Derivation: state A needs `295 + 653 = 949px` of content width and overflows the page at `W ≤ 987`; state B needs `295 + 589 = 884px` and overflows at `W ≤ 922`. Both breakpoints sit above their overflow point, so the collapse happens while the nav is merely getting tight rather than after it has already broken.

**[RULE] The two collapses are independent and must not share a breakpoint.** The original implementation bound both to a single `820px` rule; their real failure points are ~140px apart, which left `821–987px` overflowing horizontally on every page. Contact collapses to icon-only ~76px before the disclosure menu takes over.

**[RULE] The icon-only state hides the label with the clip technique, never `display:none`** — the accessible name "Contact" must stay in the accessibility tree. The envelope glyph carries `aria-hidden="true"`.

**[CI]** `checkNavConfig` verifies rendered nav items match `_src/config/nav.json`. `checkSharedShellIntegrity` verifies the nav markup has one generating source. `checkStructuralHtml` verifies `aria-controls`/`aria-expanded` on the mobile toggle. **[CI — Phase 4B.3]** Every page `renderPage()` produces (hand-written and Notion-generated alike) carries a `<!-- shell:<hash> -->` signature derived from the current nav/head/footer partials and `nav.json`; `checkShellFreshness` fails the build if a committed page's signature doesn't match the current one — this is what catches an out-of-date shell on `articles.html`/`articles/*.html`, which `build.mjs --check` cannot see since they aren't produced by `build.mjs`.

**[RULE]** Sticky top, light translucent surface, visible active state, `:focus-visible` on every link, ≥44px tap targets — unchanged from legacy, still correct.

---

## 8. Hero

**[RULE] Structure — final.**

```
LEFT                          RIGHT
eyebrow / role                large portrait (sole visual anchor)
headline                      availability bar (bottom-integrated)
supporting line
proof credentials
CTA row (primary/secondary/tertiary)
```

**[RULE] Permanently removed, do not restore:** the three right-column bento cards (FOCUS / CV / DATA) and the "AI Agents · Computer Vision · Data Systems" tag line. The portrait is the sole right-column anchor. This was tested with the cards removed and confirmed as a genuine improvement — the cards were the strongest remaining dashboard/SaaS-template signal in the hero, and their content was already redundant with Projects/Research/Skills.

**[RULE] Final hero copy.**

```
Eyebrow:    AI Agent Engineer · Applied Mathematics
Headline:   用數學思維建構軟體，
            用工程實作落地 AI
Supporting: 將研究、資料與模型轉化為可驗證、可部署的軟體系統。
```

No marketing language, no headline padding. The supporting line was specifically chosen to make a claim the headline doesn't already make (verifiable/deployable systems), not to restate it — the earlier prototype pairing of this headline with the old bio paragraph was rejected for exactly that redundancy.

**[RULE] Legacy tagline — retired from Hero, preserved as secondary brand copy.** The original tagline, `「用應用數學與工程能力，打造可落地的 AI Agent、資料分析與電腦視覺系統。」`, is **not** the Hero headline and must never appear alongside the locked headline in the Hero. It remains genuinely useful copy and may be reused elsewhere — an About-page introduction, a meta-description/SEO summary — as a *single* standalone statement in that context, not as a second Hero line.

**[RULE] CTA hierarchy.**

| Priority | Label | Target |
|---|---|---|
| Primary | View Projects | `projects.html` |
| Secondary | Contact Me | `resume.html#contact` |
| Tertiary | Download Resume | `assets/files/resume.pdf` |

Weight expressed through fill/size/font-weight, not just position — legacy shipped these at inverted widths (tertiary widest at 187px vs primary's 159px). Target proportions: primary filled and widest, secondary outlined, tertiary a plain text link with no icon.

### 8.1 Portrait

**[RULE]** ~470px wide desktop (**+20% over the legacy 390px**), 4:5 aspect ratio, `--radius-xl` frame, quiet neutral-tinted border (not the legacy's copper/rainbow gradient border), shadow per §6. Scales to ~415px on short-viewport laptops (see §17), full-width capped ~400px on mobile.

### 8.2 Availability treatment

**[RULE]** Integrated bottom bar flush to the portrait's edges (not a floating inset pill) — radius matches the photo's bottom corners, hairline top border, no shadow, 44px min-height. `backdrop-filter` may remain here; this is the one sanctioned glassmorphism exception in the whole system (§2), justified because it sits directly on a photograph, not on a content surface.

### 8.3 Viewport behavior

**[RULE] Deliberate full-first-screen hero on desktop/laptop.** `min-height: calc(100dvh - var(--nav-h))` (with `svh`/`vh` fallback) — this structure already exists in the codebase; it is not being rebuilt, only having its internal rhythm refined (spacing converted to `clamp()` viewport-relative values instead of fixed gaps). **The next section must not be visible on initial load** at desktop/laptop sizes.

Verified exact at two sizes during prototyping:

| Viewport | Hero height | Next section starts at | Overhang |
|---|---:|---:|---:|
| 1440×900 | 836px | 900px | 0px |
| 1366×768 | 704px | 768px | 0px |

**[RULE] Mobile releases the constraint.** Readability takes priority over filling the viewport; the hero is allowed to exceed one screen height on mobile without penalty.

---

## 9. Buttons / CTA

| Style | Fill | Border | Text |
|---|---|---|---|
| Primary | `--color-primary` solid | none | white, weight 600 |
| Secondary (ghost) | transparent | `--color-border` | `--color-text` |
| Tertiary (text) | none | none | `--color-text-dim`, weight 500, no icon |

**[RULE]** Min-height 44px, `--radius-md`. **No gradient fills** (legacy primary button was a blue→indigo gradient; retired along with the rest of the gradient system). Hover: color change only — **no `translateY` lift, no glow shadow** on buttons (see §16).

---

## 10. Credentials (Proof Pills)

**[RULE] Preserve all real credential content** (location, degree, award, availability status) — this is genuine, earned content and none of it is decorative.

**[RULE] Quiet visual treatment.** Transparent fill, hairline neutral border (not `--color-border`'s full-strength card treatment), `--radius-sm`, no shadow, `--fs-sm` text in `--color-text`. Copper is used **only** on the pill's icon, never as a fill or border color for the pill itself — this is what separates a credential chip from a generic SaaS feature-pill.

---

## 11. Project System

**[RULE] Three intentional tiers**, differentiated by spacing, border weight, radius, elevation, and content density — never by decoration alone.

| | Tier 1 — Featured Case Study | Tier 2 — Standard / Documented | Tier 3 — Index / Supporting |
|---|---|---|---|
| Border | `rgb(var(--c-text-rgb)/0.10)` | `--color-border` | none (flat fill or table row) |
| Radius | `--radius-xl` | `--radius-lg` | `--radius-md` |
| Shadow | `--shadow-md` (the only elevated tier) | none | none |
| Content | thumbnail, title, one outcome sentence, verified metric *if it exists*, short role/stack line, "View Case Study" CTA | title, summary, role, highlights, tags, links | name, stack, year, link |
| Count | 1–2 projects max | remaining featured-page projects | everything else |

**[RULE] Featured-card content is intentionally shallow.** Problem / Approach / Architecture / Results / Trade-offs belong on the **Case Study detail page**, not the homepage card. A prototype that put full narrative content into a wider Tier-1 card was explicitly rejected — "featured" means *scan-friendly and pointing somewhere deeper*, not *a bigger card with more text in it*.

**[RULE] Only the strongest 1–2 projects get a full Case Study page.** Everything else stays at Tier 2/3 depth. Do not build case-study infrastructure for every project.

**[RULE] Card height remains content-driven; never encode fixed production heights.** The two Home Tier-1 cards are one deliberate comparison pair, so their outer surfaces stretch to equal height while they share a row and their CTAs align at the bottom. This is grid alignment, not a fixed pixel height. Once the layout becomes single-column, each card returns to its natural content height. Other project tiers remain natural-height.

---

## 12. Project Imagery

**[RULE] Two legitimate states only.**

**A — Real artifact available.** Screenshot, architecture diagram, evaluation/result plot — `object-fit: cover`, real evidence. Always replaces the fallback the moment a real artifact exists.

**B — Artifact not yet available.** A **finished neutral fallback**: solid tinted fill (`rgb(var(--c-text-rgb) / 0.045)`), a real hairline solid border (not dashed), centered on the project's existing `slug`/short identifier at reduced opacity. This is a monogram-tile pattern (the same family used by GitHub/Vercel for repos without a preview image) — a deliberately finished system, not a placeholder apologizing for itself.

**[RULE] Explicitly forbidden for state B:** "待補" or any equivalent apology text, dashed/unfinished-looking borders, fabricated screenshots, blue/cyan gradients, radial glow. All five were present in the legacy implementation and are retired.

---

## 13. Skills

**[RULE] Percentage skill bars are permanently removed.** No proficiency percentages, no animated fill bars, no invented scores of any kind — a self-rated "90%" is not evidence and does not become evidence by being decorated.

**[RULE] Replacement: evidence-oriented groups.**

```
AI & Machine Learning     → PyTorch/scikit-learn, LangChain/LangGraph, RAG/Tool Calling, YOLO/CV
Software & Systems        → Python, TypeScript/JS, Git, FastAPI/Flask, Docker
Statistics & Data         → Experimental Design, Statistical Modeling, Optimization, Data Analysis
```

Each group may close with a plain-text line connecting it to real, named projects/experience — e.g. *"實際運用於：YOLO System、SDDE 資料工程工作台."* **[RULE]** Skills are chips inside a grouped block, not individually large badges — the group is the visual unit, not the individual skill.

---

## 14. Articles

**[RULE] Preserve the working Notion → static-HTML pipeline** (`scripts/sync-notion.mjs`, `_src/`, `articles/`). This infrastructure is sound and out of scope for this revision.

**[RULE] Reading surface — professional, not editorial.** This project explicitly evaluated and rejected a magazine/academic-publication visual identity for the whole site (Field Notes direction). Articles get a clean, competent reading surface consistent with the rest of the site's system — not a separate visual language.

Requirements:
- Readable measure (~65–70ch), `--fs-base` (16px) body minimum.
- Robust inline-code and long-URL wrapping (`overflow-wrap`) — **[CI]** `checkArticleRobustness` already guards a specific mobile line-wrap regression here; keep it green.
- Block code: horizontally scrollable, never causes page-level horizontal overflow.
- Clear, non-skipped heading hierarchy (§4.2).
- Useful metadata (date, reading context) without inventing metrics that don't exist (no fake "5 min read" precision if it isn't computed from real content).
- Keyboard-accessible prev/next or index navigation.

---

## 15. Contact

**[RULE] Direct contact is a core conversion path.** It must also give deterministic browser feedback instead of depending entirely on whether the visitor configured a desktop mail handler.

- **Navigation and general Home CTAs:** route to `resume.html#contact`, where Email, GitHub and LinkedIn are visible choices.
- **Explicit Email links:** retain `mailto:` and prefill the recipient and a short subject. Keep the address visible so it can still be copied when no default mail application is configured.
- **Avoid duplicate actions:** the Resume contact section does not need a separate “寄信給我” button beside an already fully clickable Email row.
- Desktop nav: compact filled Contact pill, 44px min-height.
- Mobile nav: 44×44 icon-only Contact target.
- Hero Contact stays **secondary** to View Projects — contact is important, but action on real work is the primary ask.

**[CI]** `checkStructuralHtml` will continue to verify internal links resolve; a `mailto:` target is external to that check by nature — no gate currently confirms the address itself is correct. Manual verification required whenever the address changes.

---

## 16. Motion

**[RULE] Functional feedback only.** Color/border transitions on hover and focus, nothing else, ~150ms.

**[RULE] Explicitly retired:**
- Scroll-reveal as a dependency for seeing content (`.reveal { opacity: 0 }` with no `<noscript>` fallback — confirmed during audit: with JS disabled, all 14 reveal-gated elements on the homepage stay invisible. This is a real defect, not a style preference, and must be fixed regardless of the motion-philosophy decision: either remove scroll-reveal entirely, or ship a `<noscript>` rule forcing `opacity:1`.)
- Hover-lift (`translateY`) as the default card/button interaction.
- Parallax.
- Animated percentage bars (moot once §13 ships, but stated explicitly).
- Animating layout properties (`width`, `height`, `top`, `left`, `margin`, `padding`) for any reason — animate `transform`/`opacity` only.

**[CI]** `prefers-reduced-motion: reduce` support is required and already present in the legacy CSS (`scroll-behavior: auto` override) — preserve it through this revision.

**[RULE] Core content must survive JavaScript failure.** This is the same principle behind the scroll-reveal fix above, stated as a general requirement: nothing essential to reading the page may depend on JS execution succeeding.

---

## 17. Responsive Contract

**[RULE] Replace the legacy's three uncoordinated breakpoints** (900px / 820px / 720px, each governing different, unrelated concerns with no documented relationship) **with one explicit structural boundary plus a documented height refinement layer.**

### 17.1 Width bands

| Band | Range | Hero | Project grid | Nav |
|---|---|---|---|---|
| **Desktop** | ≥1201px | Two-column, full portrait scale | 3-column (Tier-1 spans 2) | Inline |
| **Laptop / Tablet** | 901–1200px | Two-column, same structure, spacing/portrait may scale down at short heights (§17.2) | 2–3 column depending on fit | All 6 destinations preserved; Contact collapses labelled → icon-only if crowded (§7) |
| **Mobile** | ≤900px | Single column, portrait full-width capped ~400px, viewport-fill constraint released | Single column, tiers stack top-to-bottom in priority order | Collapsed, icon-only Contact |

The 900/901px boundary is not arbitrary — it's the one breakpoint actually validated during prototyping (hero collapse, project-grid collapse, and touch-target audit were all tested at exactly this boundary and confirmed clean at both 1440×900 and 375×812).

### 17.2 Height refinement (laptop/desktop only)

Two existing height-based rules already live in production CSS at `min-width:901px and max-height:820px` / `max-height:700px`, scaling the hero's portrait and spacing down for short-viewport laptops (e.g. 1366×768). **These are kept and extended, not replaced** — validated exact at 1366×768 (704px hero, 0px overhang). **[RULE — implementation note]** both existing rules currently reference `.hero-mini-grid`/`.mini-card`, which are dead once §8's mini-card removal ships; that dead CSS must be cleaned up as part of the same change, not left in place.

### 17.3 What is explicitly retired

The separate 820px nav-only and 720px type/hero-polish breakpoints are folded into the 900px structural boundary **unless** implementation testing shows the nav (now wider, with the new Contact pill) no longer fits down to 900px. This is not an unresolved design decision — §7 already specifies the required fallback behavior (labelled → icon-only Contact) precisely so the nav can degrade gracefully at whatever width it actually breaks, without that width needing to be known in advance.

---

## 18. Accessibility

**[RULE] Baseline (all of the below, no exceptions without a written, reviewed reason):**

- WCAG AA contrast — 4.5:1 normal text, 3.0:1 large text/UI (§3.4).
- ≥44×44px interactive targets, everywhere, including footer/social icons and card footer links (the legacy site shipped several at 20–32px; all confirmed fixed in prototype).
- Valid `aria-controls`/`id` relationships on toggles.
- Visible `:focus-visible` on every interactive element.
- `prefers-reduced-motion` respected.
- Semantically correct, non-skipped heading hierarchy.
- No horizontal page overflow at any supported viewport.
- Meaningful `alt` text on informative images (decorative images — e.g. the monogram fallback tiles — use `aria-hidden` or empty `alt`, matching current `.card__thumb` practice).
- Full keyboard operability, including the mobile menu and the new nav Contact action.

### 18.1 [CI] enforcement map — what is actually mechanically checked today

| Requirement | Enforced by |
|---|---|
| Structural HTML (title/description/`<main>`/single `<h1>`/`aria-controls`/internal links resolve) | `checkStructuralHtml` |
| Nav matches `nav.json` | `checkNavConfig` |
| One shared nav/shell source (no drift between pages) | `checkSharedShellIntegrity` |
| Generated pages (incl. Notion-synced articles) use the current shared shell, not a stale one | `checkShellFreshness` |
| No unexplained hardcoded color literals (must be a token, or a documented exception in `COLOR_EXCEPTIONS`) | `checkColorTokenDiscipline` |
| WCAG contrast on the declared pairs | `checkContrast` against `_src/config/contrast.json` |
| Article mobile line-wrap regression | `checkArticleRobustness` |
| Build output matches `_src/pages/*.html` source | `build.mjs --check` |

Everything else in this document (touch-target size, heading-skip detection, motion rules, focus-visible presence, alt-text quality) is currently a **[RULE]** — real, required, but caught by review, not by `npm run verify`. Closing that gap is listed in §20.

---

## 19. Known Conflicts With Current Code/Config

This section exists so implementation doesn't silently drift from this document. Nothing below is a design ambiguity — these are places where **today's code still reflects the old system** and must change to match what §3–§17 specify.

1. **`css/style.css` `:root` still defines the retired blue/indigo/cyan triad** (`--color-primary: #2563EB`, `--color-primary-2: #4F46E5`, `--color-accent: #0891B2`) and the blue-tinted neutrals (`--color-bg-alt: #EEF4FF`, `--color-border: #D8E2F0`). These need updating to §3's values.
2. **`--color-accent` as an independent hue is retired**, but `--c-accent-rgb` is referenced directly in several gradient/glow declarations throughout `style.css` (hero glow, card-thumb radial glow, bento gradients, CTA-panel gradient) — all of which are separately retired by §2/§12/§16. Removing the gradients removes most of these references; any that remain should alias to `--color-primary-hover`, not be left pointing at a hue that no longer exists in the palette.
3. **`_src/config/contrast.json`'s declared pairs reference `--color-accent-text` and `--color-primary-2` by name** — both token *names* are kept (§3.2 aliases `--color-primary-hover` to the accent-text role), but their *values* change. The CI gate must be re-run after the token update, not assumed to still pass from this document's math alone.
4. **`js/main.js`'s `projectCardHTML()` and skills-rendering functions** generate the legacy card structure (highlights + dual GitHub/Demo links on every tier, percentage-bar skill markup) — both need rewriting to match §11 (tier-differentiated content) and §13 (grouped skills, no bars). A prototype-only client-side DOM patch was used during design-lock prototyping to *demonstrate* the target structure; that patch is not production code and must not ship.
5. **`_src/config/nav.json`'s `brand` object has no field for a persistent Contact action or a populated wordmark** — `.nav__brand-text` currently renders empty in production (a known, pre-existing gap); §7 depends on this being addressed.
6. **`assets/images/logo.png`** is a raster PNG with the wordmark baked into the image and a blue/gradient rainbow-copper treatment — needs a real SVG replacing it, with the wordmark separated out into the existing `.nav__brand-text` slot (see the asset requirement immediately below).
7. **Two existing `@media (max-width: 900px)` blocks** already exist independently in `style.css` for unrelated concerns (`.page-hero` treatment) — §17's consolidation should merge into this existing boundary, not add a third one.

**Asset requirement (not a token, a deliverable):** production logo must be vector/SVG, symbol in `--color-primary` (copper), "SAM" wordmark in `--color-text` (graphite), no pale/washed-out wordmark treatment. The design-lock prototype SVG is a structural stand-in, not final art — do not ship it as-is without a design pass.

---

## 20. Known / Deferred Work

**Deferred (explicitly out of scope for this revision):**
- Dark mode — no palette defined; scheduled as its own future design task with its own contrast audit.
- Full no-skip heading-order CI gate (currently a `[RULE]` only — see §18.1).
- Touch-target-size and motion-property CI gates (same — currently review-only).

**Blocking real implementation, not a design question:**
- At least one real project artifact (screenshot/diagram/plot) needs to exist before §12's State A can be verified end-to-end rather than just specified.
- Real vector logo art (§19).

**Master's thesis information architecture (documented here, implemented in the Research phase):**
- The thesis is a **Research** artifact, never an Article. Articles are technical writing; the thesis is primary research output and is delivered mainly as a PDF.
- Planned page: `research/master-thesis.html` — a recruiter-readable Research Overview that stands on its own, with the PDF as the deeper artifact behind a *View Full Thesis PDF* CTA. A reader must never be forced to open the PDF just to understand the work.
- Planned section order: title → research overview → research problem → key contributions → methodology / system overview → architecture & model figures → verified evaluation results → related engineering tools → PDF CTA.
- *Related engineering tools* links out to the two Tier-1 projects (`Yolo-System`, `DetectionData_Engine`), which are the thesis's engineering artifacts. This is the only sanctioned cross-link between Research and Projects.
- Evaluation numbers on that page are subject to the same no-fabrication rule as §11: omit the slot rather than invent a figure.
- Case-study scope is separate from featured status: **Featured Project ≠ Case Study.** `DetectionData_Engine` stays a Featured Project unless and until a case study is explicitly commissioned.
- **Case-study route convention (shipped):** `case-studies/<slug>.html`, authored in `_src/pages/case-studies/` and generated by `build.mjs`, which now walks `_src/pages/` recursively and derives `pathPrefix` from directory depth. No router, no framework. `Yolo-System` is the first one; the thesis (research) is the other planned one.
- **[RULE] A "View Case Study" CTA renders only when a real page exists.** It is driven by an optional `caseStudy` field on the project record in `js/data.js` — a project without that field falls back to "View Project" pointing at its `projects.html` anchor. Never hardcode the label.

**Content, not layout:**
- Whether a verified metric exists for the current Tier-1 featured project. §11 explicitly allows the metric line to be omitted rather than fabricated — do not invent a number to fill the slot.
