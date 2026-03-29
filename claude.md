# Make2Flow — Project Analysis and Context

1. **Main Purpose:** Make2Flow is a production-quality Supply Chain Analytics Dashboard. It provides rich and detailed data exploration across different entities such as facilities, suppliers, products, and shipments.
2. **Navigation and IA:** Navigation was restructured to follow a logical and consistent flow: Dashboard, Suppliers, Facilities, Products, Shipments, and Settings. This improves hierarchy, discoverability, and user orientation across analytics workflows.
3. **Design and UX:** The application follows a "Mobile-First" approach, ensuring that all design decisions scale up from small screens (320px). It features a Vision UI-inspired dark theme (dark navy + violet). Every interactive element is optimized for accessibility (ARIA labels) and meets the minimum touch target size (44px). Tables, filters, and controls were refined for responsive behavior, including mobile-first interactions and bottom-sheet filter UX.
4. **Dashboard Coverage:** The Dashboard now includes all required visual elements: KPI cards with trend indicators, line charts for time-series analysis, bar charts for comparisons, donut charts for distributions, and a paginated recent-activity table. This creates a high-signal executive overview with actionable insights.
5. **Section-Level Enhancements:** Suppliers now focus on tier analysis, activity trends, and detailed tabular data. Facilities now highlight type distribution, regional segmentation, and supplier relationships. Products now expose volume trends with full relational context. Shipments became the most robust view with advanced filtering, time analysis, rich route detail, and deep table interactions.
6. **Global Filtering System:** A consistent filtering model was implemented across key pages, supporting date range, suppliers, facilities, products, and status with instant updates, removable filter chips, and mobile-friendly bottom sheets.
7. **Time Intelligence:** Time-based analysis (2020-2026) was integrated across key views to support trend tracking, comparison windows, and temporal decision-making.
8. **Advanced Data Tables:** Tables were upgraded with sorting, pagination, expandable rows, and responsive behavior for small screens while preserving usability and readability.
9. **Settings Value:** The Settings page now provides practical control over data preferences, time granularity, and default filter behavior.
10. **Route Intelligence Map:** A Route Intelligence Map was added to Shipments, visualizing facility-to-facility flows through interactive routes to improve understanding of logistics performance and bottlenecks.
11. **AI Workflow (Cowork):** The project was built in collaboration with AI (Claude) following a strict "design-then-code" discipline. The initial wireframes were created in Pencil.dev, and a custom Python script was used to apply the color palette before the complete React project scaffolding was built starting from `package.json`.
12. **Mock Data:** Deterministic and realistic data (55 facilities, 22 suppliers, 120 products, 220 shipments) was generated using a seeded pseudo-random number generator, achieving plausible seasonal revenue curves (2020-2026) without requiring a backend server or database.
13. **Outcome:** The application now behaves as a professional, mobile-first supply chain analytics tool tailored for operational and strategic decision-making.

## Skills and Technologies Used

The following "skills" (predefined rules and conventions for AI code generation) and methodologies formed the foundational guidelines for development:

*   **React 19 (Requested Skill):** Establishes the use of modern React conventions. The directive emphatically stipulated avoiding manual memoization (such as unnecessary `useMemo` or `useCallback`) and exclusively using named imports.
*   **TypeScript (Skill):** Enforces strict typing as a structural foundation. The *const-types* pattern was heavily applied, flat interfaces were prioritized, and the use of the `any` type was strictly prohibited.
*   **Tailwind CSS 3/4 (Skill):** Configured for semantic, responsive styling. The guidelines required the use of the `cn()` utility function (which combines `clsx` and `tailwind-merge`), the use of semantic class names, and the complete avoidance of embedded hexadecimal color codes within `className` string literals.
*   **Vite 5:** Acts as the primary frontend bundler and development environment, providing continuous HMR and ultra-fast compilation.
*   **Zustand:** Chosen for global state management because it is lightweight and lacks boilerplate. It manages the local dark mode preference, sidebar toggle behavior, and global search inputs decoupled from the UI layer.
*   **Recharts:** The chosen library for analytical data visualization; includes interactive and container-adaptable components (`ResponsiveContainer`) such as area, bar, and donut charts.
*   **React Router v6:** Client-side router used to structure the 6 core views (Dashboard, Suppliers, Facilities, Products, Shipments, Settings), enabling fluid navigation without full page reloads.
*   **Lucide React:** Used exhaustively for all the modern and clean icons presented in the status bars, menus, and application widgets.
