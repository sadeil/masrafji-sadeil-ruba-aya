# Pulse — Your money, personalised

A premium personal-finance app demo with **role-based onboarding** and a tailored
dashboard for each lifestyle. Built with React 19, Vite, Tailwind CSS and Recharts.

## What makes it different

Most finance apps show the same dashboard to everyone. Pulse asks one question first —
**"Choose your financial lifestyle"** — and then personalises every section for that
persona.

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
- Cash-flow chart (Recharts area, 6 months)
- Spending donut by category
- Recent transactions with search & filter (Income / Expenses / All)
- Budget categories with traffic-light status (under / warning / over)
- Upcoming bills, goals progress, smart alerts
- Add transaction / income / bill modal
- Settings drawer to switch personas at any time
- Multi-currency: USD, ILS, JOD (live re-conversion)
- Light + dark mode (auto-detected from OS, remembered in localStorage)
- Fully responsive: sidebar on desktop, bottom nav on mobile
- `prefers-reduced-motion` respected, focus-visible outlines, accessible chips

### Stack

- React 19 + Vite 8 (Rolldown)
- Tailwind CSS 3 with a custom design-token system
- Recharts (cash flow, donut, forecast)
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

The app remembers your selection (`pulse-role`), theme (`pulse-theme`) and
currency (`pulse-currency`) in `localStorage`. Clear those keys to reset.
