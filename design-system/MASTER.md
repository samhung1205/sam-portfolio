# Design System: Sam Hung Personal Brand

## 1. Brand Keywords

AI Agent Engineer, Applied Mathematics, Computer Vision, Machine Learning, Data Analysis, Recommendation Systems, YOLO Detection, RAG, LangGraph, Software Engineering, Research-to-Product.

品牌語氣：
- Professional but not corporate
- Technical but approachable
- Research-minded, product-oriented
- Clean, precise, trustworthy
- Modern portfolio, not student assignment

核心訊息：
「用應用數學與工程能力，打造可落地的 AI Agent、資料分析與電腦視覺系統。」

## 2. Visual Direction

整體方向：Clean Tech Portfolio + Bento Personal Brand

視覺特徵：
- 乾淨留白，資訊層級清楚
- 淺色為主、深色為輔，避免過暗 hacker feel
- 柔和藍色 / 青色 / 紫色作為科技感 accent
- Bento grid 呈現技能、專案成果與研究主題
- 卡片有輕微深度、細邊框、柔和 hover
- 使用真實專案截圖、模型結果圖、架構圖，減少文字 placeholder

避免風格：
- 不走全黑駭客風
- 不走花俏 cyberpunk
- 不走 Bootstrap/template portfolio 感
- 不用過度玻璃擬態或大量發光效果

## 3. Color System

建議採用 Light-first，Dark optional。

### Light Mode

| Token | Value | Usage |
|---|---:|---|
| `--color-bg` | `#F8FAFC` | 全站背景 |
| `--color-bg-alt` | `#EEF4FF` | 淡色區塊背景 |
| `--color-surface` | `#FFFFFF` | Card / navbar / form |
| `--color-surface-2` | `#F1F5F9` | Hover surface |
| `--color-text` | `#0F172A` | 主文字 |
| `--color-text-muted` | `#475569` | 次要文字 |
| `--color-text-dim` | `#64748B` | 輔助文字 |
| `--color-primary` | `#2563EB` | Primary CTA |
| `--color-primary-2` | `#4F46E5` | Gradient / emphasis |
| `--color-accent` | `#0891B2` | Tech accent |
| `--color-border` | `#D8E2F0` | 邊框 |
| `--color-success` | `#059669` | Completed |
| `--color-warning` | `#D97706` | In progress |

### Dark Mode

| Token | Value |
|---|---:|
| `--color-bg` | `#0B1020` |
| `--color-bg-alt` | `#111827` |
| `--color-surface` | `#161D2F` |
| `--color-surface-2` | `#1E293B` |
| `--color-text` | `#E5E7EB` |
| `--color-text-muted` | `#AAB4C6` |
| `--color-text-dim` | `#7B8498` |
| `--color-primary` | `#7C9CFF` |
| `--color-primary-2` | `#A78BFA` |
| `--color-accent` | `#22D3EE` |
| `--color-border` | `#2A3358` |

## 4. Typography

建議字體：
- Heading: `Archivo`
- Body: `Inter` or `Space Grotesk`
- Chinese fallback: `Noto Sans TC`
- Code / tags: `JetBrains Mono`

CSS font stack:

```css
--font-heading: "Archivo", "Noto Sans TC", sans-serif;
--font-sans: "Inter", "Noto Sans TC", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
--font-mono: "JetBrains Mono", "Fira Code", monospace;
```

字級規則：
- Hero H1: `clamp(2.5rem, 6vw, 4.75rem)`
- Page H1: `clamp(2.25rem, 4vw, 3.5rem)`
- Section H2: `clamp(1.75rem, 3vw, 2.5rem)`
- Card title: `1.125rem` to `1.35rem`
- Body: `1rem`
- Small / tag: `0.75rem` to `0.875rem`

行距：
- Heading: `1.1` to `1.2`
- Body: `1.65`
- Card text: `1.55`

## 5. Spacing Scale

Use 4px-based spacing.

| Token | Value |
|---|---:|
| `--space-1` | `0.25rem` |
| `--space-2` | `0.5rem` |
| `--space-3` | `0.75rem` |
| `--space-4` | `1rem` |
| `--space-5` | `1.5rem` |
| `--space-6` | `2rem` |
| `--space-7` | `3rem` |
| `--space-8` | `4rem` |
| `--space-9` | `6rem` |

Layout rules:
- Container max width: `1120px` to `1200px`
- Desktop section padding: `80px-112px`
- Mobile section padding: `48px-64px`
- Card gap: `20px-28px`
- Hero content gap: `32px-64px`

## 6. Radius / Shadow / Card Style

Radius:
- Small controls: `8px`
- Buttons / inputs: `10px`
- Cards: `16px`
- Hero image / featured panels: `20px`

Shadow:

```css
--shadow-sm: 0 1px 2px rgba(15, 23, 42, 0.06);
--shadow-md: 0 12px 30px rgba(15, 23, 42, 0.08);
--shadow-lg: 0 24px 60px rgba(15, 23, 42, 0.12);
```

Card base:
- Background: `--color-surface`
- Border: `1px solid --color-border`
- Radius: `16px`
- Padding: `24px`
- Hover: translateY(-3px), stronger border, soft shadow
- Avoid heavy glow on normal cards

## 7. Button Style

Primary button:
- Filled blue or blue-indigo gradient
- Text contrast must pass WCAG
- Height: minimum `44px`
- Radius: `10px`
- Font weight: `600`
- Hover: slight lift + shadow
- Focus: visible 3px ring

Secondary / ghost button:
- Transparent or white surface
- Border with muted color
- Hover border changes to primary
- Avoid low-contrast grey text

Button hierarchy:
- Hero primary: `View Projects`
- Hero secondary: `Download Resume`
- Tertiary: `Contact`

## 8. Navbar Style

Navbar direction:
- Sticky top
- Light translucent surface in light mode
- Clear active state
- Brand should include logo + `Sam Hung` or short role label
- Desktop nav right aligned
- Mobile menu full-width dropdown

Required behavior:
- Mobile toggle must use `aria-expanded`
- Menu closed state should not allow keyboard focus inside hidden links
- All nav links need `:focus-visible`
- Minimum tap target: `44px`

Recommended nav items:
Home, About, Projects, Research, Resume, Contact

## 9. Project Card Style

Project card must answer quickly:
- What is it?
- What problem does it solve?
- What did I build?
- What stack did I use?
- What result or evidence exists?

Card structure:
1. Visual thumbnail: screenshot, result image, architecture diagram, or clean generated project visual
2. Project title
3. One-line outcome
4. Role / contribution
5. 2-3 bullet highlights
6. Tech tags
7. Links: GitHub, Demo, Case Study

Avoid:
- Text-only placeholder thumbnails
- Too many tags
- "Coming Soon" as a dominant message
- Links to `#`

## 10. Section Layout Rules

Homepage order:
1. Hero: name, role, value proposition, proof chips, CTA
2. Featured Projects: 3 strongest projects
3. Bento Positioning: AI Agent / Applied Math / CV / Software Engineering
4. Research Highlight
5. Resume CTA
6. Contact CTA

General section rules:
- Each section needs one clear purpose
- Section header max width: `720px`
- Use bento grid only when content has different weights
- Avoid stacking many identical cards without hierarchy
- Use alternating background only when it improves scanning
- Keep CTA after high-intent sections

RWD:
- Desktop: 2-3 column grids
- Tablet: 2 columns
- Mobile: 1 column
- Avoid fixed heights for text-heavy cards
- Hero image should not push core CTA too far below fold on mobile

## 11. Light / Dark Mode Recommendation

Recommendation: Light-first with optional dark mode.

Reason:
- 求職與個人品牌網站需要可讀性與信任感，light mode 更接近 professional portfolio。
- Dark mode 可保留科技感，但不應作為唯一模式，避免過暗、壓迫、hacker portfolio 感。
- 如果短期不做 toggle，建議先把目前深色主題調亮，或改為 light-first。

Suggested strategy:
- Phase 1: Light-first static theme
- Phase 2: Add dark mode via CSS variables
- Phase 3: Add user preference with `prefers-color-scheme`

## 12. Anti-Patterns To Avoid

Content anti-patterns:
- Footer 顯示 `Your Name`
- 使用 example email 或 `your-username`
- 對訪客顯示 TODO / placeholder / 尚未串後端
- 專案只有技術名詞，沒有成果或問題脈絡
- 技能用百分比但沒有證據支撐

Visual anti-patterns:
- 全站過暗、低對比
- 過多漸層、glow、動畫
- 所有卡片長得一樣，沒有主次
- 大量 icon 但缺少內容
- Hero 只有 slogan，沒有 proof

UX / accessibility anti-patterns:
- 沒有 `:focus-visible`
- 忽略 `prefers-reduced-motion`
- 手機選單沒有 `aria-expanded`
- 點擊區域小於 44px
- 只用顏色表示狀態
- 圖片缺少有意義 alt text

Implementation constraints:
- Maintain pure HTML + CSS + JavaScript
- Use CSS variables as design tokens
- Keep content in `js/data.js`
- Avoid introducing React / Next.js until content and brand system are stable
