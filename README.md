# Make2Flow — Supply Chain Analytics Dashboard

A production-quality, mobile-first supply chain analytics dashboard built with React, TypeScript, Tailwind CSS, and Recharts. The latest UX/UI improvements focus on clearer navigation, stronger visual hierarchy, smarter filtering, and deeper route intelligence for operational decision-making.

## Pencil design file: 03-29suplaychaindesing.pen

---

## Features

- **Dashboard** — KPI cards with trend indicators, revenue/shipments area chart, shipments-by-status donut, top facilities bar chart, recent shipments table.
- **Facilities** — Full data table with sort, pagination, CSV export, and filters by type, status, and region. Utilization progress bars per row.
- **Suppliers** — Star ratings, on-time delivery trend badges, defect rate color coding, aggregate summary chips.
- **Products** — Stock status color coding, lead time indicators, category donut chart.
- **Shipments** — Advanced filtering, time analysis, detailed tables, and high-fidelity interactive geographic maps.
- **Interactive Geographic Map** — High-fidelity tracking via `react-simple-maps` with animated route trails and pulse effects for active facilities.
- **Progressive Loading** — Smooth UI transitions using Skeleton loaders for charts, maps, and data tables to prevent cumulative layout shift.
- **Dark/Light Mode Toggle** — Seamless native-feeling theme toggle available in the Topbar, persisted via Zustand and `localStorage`.
- **Global Filters** — Cross-view filtering with instant updates, removable chips, and mobile bottom sheets.
- **Settings** — Comprehensive configuration suite including Dark/Light mode toggle, Unit System (Metric/Imperial, Volume units), Time Analysis defaults (Default Date Range, Time Granularity), and Global Filtering info/presets.
- **CSV Export** — Available on every data table.
- **Accessibility** — ARIA labels on all tables, navigation, form controls, and status badges.

---

## Tech Stack

| Framework | React 18 + TypeScript |
| Bundler | Vite 5 |
| Styling | Tailwind CSS|
| Charts | Recharts (Area, Bar, Pie/Donut) & react-simple-maps |
| State | Zustand (dark mode, sidebar, global search) |
| Routing | React Router v6 |
| Icons | Lucide React |
| Utilities | clsx + tailwind-merge |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## App Flow & Navigation

Navigation was restructured to follow a clear and logical flow, improving consistency, discoverability, and data hierarchy across the full analytics journey:

- **Dashboard**: Centralized overview and KPIs.
- **Suppliers**: Tier analysis, activity trends, and detailed tables.
- **Facilities**: Type distribution, regional breakdown, and linked supplier context.
- **Products**: Volume trends and full relational visibility.
- **Shipments**: The most robust page, with advanced filtering, time analysis, detailed operational tables, and routing maps.
- **Settings**: Practical controls that directly affect analytics workflows:
  - **Appearance**: Toggle between Light and Dark mode.
  - **Data Preferences**: System-wide unit selection (Metric vs. Imperial, Weight/Volume units).
  - **Time & Analysis Settings**: Default date range bounds and chart axis granularity (Monthly/Quarterly/Yearly).
  - **Filtering Defaults**: Explanation of session-persisted global filters, date bounds, and dataset size.

---

## Advanced Analytics & Data Visualization

The dashboard relies on a robust visualization system, transforming raw supply chain data into accurate, actionable insights:

- **Geographic Route Intelligence Map**: Replaces static graphics with a full coordinate-based geographic projection (`react-simple-maps`). It plots accurate facility locations and animated shipping routes to expose logistics movement, route concentration, and potential bottlenecks.
- **Time-Series Area Charts**: Track revenue and shipment volumes over time (2020-2026), providing clear trend visibility.
- **Comparative Bar Charts**: Enable cross-entity comparison, identifying top-performing facilities or suppliers at a glance.
- **Distribution Donut Charts**: Provide immediate visual breakdowns of shipment statuses (e.g., In Transit, Delivered, Delayed) and product categories.

All charts are fully responsive, automatically adjusting their tick density and layout geometry to fit mobile screens perfectly. 

---

## UX/UI Improvements

### Progressive Loading
Skeleton loaders (`<Skeleton />` & `<LoadingContent />`) are implemented across the application, providing a progressive loading experience. This ensures the layout remains stable while data is fetched or calculated, giving users immediate visual feedback and preventing visual jumps mapping to Cumulative Layout Shift.

### Global Filtering Experience
A consistent global filtering system powers key views with Date range, Suppliers, Facilities, Products, and Status. Filters update instantly, display as removable chips, and use mobile-friendly bottom sheets for small screens.

### Data Table Upgrades
All key tables were improved with sorting, pagination, expandable rows, and responsive mobile behavior, creating a more reliable data exploration experience across devices.

---

## Mobile-First Approach

The entire application was designed mobile-first, meaning every layout decision starts from the smallest screen and scales up. Navigation switches from a persistent left rail on desktop to a native app-like **mobile bottom navigation bar**, ensuring thumb-friendly tap targets and no content overlap. Hamburger menus have been entirely removed in favor of this more accessible bottom-anchored structure.

Data tables — the most challenging element on small screens — were redesigned so that users can tap to expand an element's row to view hidden columns, ensuring no data points are visually lost or truncated on narrow viewports. On the dashboard, KPI cards stack vertically in a single column on mobile and expand to a 2- or 4-column grid on larger breakpoints. The topbar and navigator are `sticky` with a `backdrop-blur` so it remains legible as content scrolls beneath it on mobile, housing the avatar user menu, global search toggle, and notifications.

---

## AI Workflow

This project was built in collaboration with Claude (Anthropic) running in Cowork mode. The workflow followed a design-then-code discipline: wireframes for all core views were created first in Pencil.dev, then a custom Python script was used to apply a Vision UI dark color palette directly to the `.pen` JSON file. Once the design was locked, Claude scaffolded the full React project from `package.json` through every component and view, following three skills loaded at the start of the session: `react-19` (no manual memoization, named imports), `typescript` (const-types pattern, flat interfaces, no `any`), and `tailwind-4` (`cn()` utility, semantic classes, no hex in `className`).

Mock data (55 facilities, 22 suppliers, 120 products, 220 shipments) was generated using a seeded pseudo-random number generator so the data is deterministic, realistic, and reproducible without a database. The AI helped identify the right seeding strategy to avoid repeating patterns and to produce plausible seasonal revenue curves across 2020–2026.

---

## Project Structure

```
src/
├── components/
│   ├── charts/       # RevenueBarChart, ShipmentLineChart, DonutChart
│   ├── map/          # Route Intelligence Map components (react-simple-maps)
│   ├── layout/       # AppLayout, Sidebar, Topbar, MobileBottomNav
│   └── ui/           # KpiCard, DataTable, Skeleton, LoadingContent
├── data/             # Mock data + derived helpers
├── lib/              # cn(), formatters, CSV export
├── store/            # Zustand app store (dark mode, search)
├── types/            # TypeScript interfaces (const-types pattern)
└── views/            # Dashboard, Suppliers, Facilities, Products, Shipments, Settings
```
