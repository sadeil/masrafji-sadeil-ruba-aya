# Masrafji · مصرفجي

> Your money, personalised — a premium personal-finance app demo with **role-based onboarding**, a tailored dashboard for each lifestyle, and a smart notification system that actually understands the user.

Built with **React 19**, **Vite 8 (Rolldown)**, **Tailwind CSS 3**, **Recharts** and **Lucide** icons.

---

## What makes it different

Most finance apps show the same dashboard to everyone. Masrafji starts with a 3-step onboarding wizard — **financial lifestyle → primary goal → income type** — and then personalises every section, KPI, chart, alert and notification for that persona.

On desktop, the whole experience is rendered inside an **iPhone-style phone frame** so the demo feels like a real product preview. On mobile, the frame falls away and the app fills the screen.

### Personas

| Persona            | Focus                                                       |
| ------------------ | ----------------------------------------------------------- |
| Family Parent      | Household income, kids, bills, family safety net            |
| Business Owner     | Cash flow, invoices, payroll, KPIs                          |
| School Student     | Allowance, fun goals, badges, parent visibility             |
| University Student | Allowance + part-time job, dorm fees, books                 |
| Employee           | 50/30/20 rule, financial health score, emergency fund       |
| Freelancer         | Irregular income, invoices, tax buffer, income forecast     |
| General User       | Balanced default — income, expenses, goals, smart insights  |

### Shared building blocks

- Total balance, monthly income / expenses / savings KPIs
- Cash-flow chart (Recharts area, 6 months) and category donut
- Recent transactions with search & filter (Income / Expenses / All)
- Budget categories with traffic-light status (under / warning / over)
- Upcoming bills, savings goals, smart alerts
- Add-transaction / income / bill bottom sheet
- Comprehensive Settings tab (persona, language, theme, currency, notifications)
- Multi-currency: **USD, ILS, JOD, EUR** (live re-conversion)
- Light + dark mode (auto-detected from OS, remembered locally)
- Fully bilingual: English (LTR) and Arabic (RTL), with localised numerals
- `prefers-reduced-motion` respected, focus-visible outlines, accessible chips

### Smart notification system

- **Opening banner** — when a dashboard loads, a personalised, role-aware notification slides in from the top, auto-hides after 10 seconds, and can be dismissed manually. Each persona has its own pool (bills due, household spending up, emergency fund near goal, client payment overdue, allowance running low, …) that rotates between visits.
- **Notification Center** — the bell in the topbar shows a live unread badge with a pulsing halo. Tapping it opens an Apple-style slide-down sheet with filter chips (All / Unread / Bills / Goals / Tips / …), date-grouped sections (Today / Yesterday / Earlier), severity rails, mark-as-read, mark-all-read, dismiss, and deep-link actions. Read / dismissed state is persisted per role.
- **Press `1` demo trick** — on a presentation, hit **`1`** anywhere outside an input and a fresh personalised toast appears for the active persona (electricity bill due, fuel budget almost finished, Tesla stock moved, Netflix renews tomorrow, salary received, …). Each press cycles to a different relevant alert. The shortcut is typing-aware — it never fires inside inputs, textareas or contenteditable fields.

### Stack

- React 19 + Vite 8 (Rolldown)
- Tailwind CSS 3 with a custom design-token system (HSL CSS variables)
- Recharts for cash flow, donut and forecast charts
- Lucide icons
- All amounts stored internally in USD and converted at render time

### Local development

```bash
npm install
npm run dev      # dev server (Vite)
npm run build    # production build
npm run preview  # preview built bundle
npm run lint     # ESLint
```

### Persistence

Masrafji remembers the user's choices in `localStorage`:

| Key                                | Purpose                                  |
| ---------------------------------- | ---------------------------------------- |
| `masrafji-role`                    | Selected persona                         |
| `masrafji-goal`                    | Primary financial goal                   |
| `masrafji-income`                  | Income type (salary / allowance / mixed) |
| `masrafji-theme`                   | Light / dark / system                    |
| `masrafji-currency`                | USD / ILS / JOD / EUR                    |
| `masrafji-lang`                    | `en` or `ar`                             |
| `masrafji-notifications`           | Notifications on / off                   |
| `masrafji-notif-${role}`           | Banner rotation cursor per role          |
| `masrafji-notif-read-${role}`      | Read notification IDs per role           |
| `masrafji-notif-dismissed-${role}` | Dismissed notification IDs per role      |

Clear those keys (or use **Reset everything** in Settings) to start over.

### Accessibility & polish

- Strict containment inside the phone frame — every fixed/absolute layer (toasts, sheets, modals, notification center) is anchored to the simulated screen, never the viewport.
- Bilingual typography: Inter for English, Tajawal for Arabic, with mirrored layout, mirrored animations and Arabic-Indic numerals where appropriate.
- All keyboard interactions are scoped (no shortcuts fire while typing in form fields).
- Reduced-motion users get static fallbacks for all looping animations.

---

Made with care · مصرفجي
