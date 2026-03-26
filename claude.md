# Make2Flow — Project Analysis and Context

1. **Main Purpose:** Make2Flow is a production-quality Supply Chain Analytics Dashboard. It provides rich and detailed data exploration across different entities such as facilities, suppliers, products, and shipments.
2. **Design and UX:** The application follows a "Mobile-First" approach, ensuring that all design decisions scale up from small screens (320px). It features a Vision UI-inspired dark theme (dark navy + violet). Every interactive element is optimized for accessibility (ARIA labels) and meets the minimum touch target size (44px). Data tables use horizontal scrolling with pinned columns on mobile devices, and KPI cards adapt with a responsive grid system.
3. **AI Workflow (Cowork):** The project was built in collaboration with AI (Claude) following a strict "design-then-code" discipline. The initial wireframes were created in Pencil.dev, and a custom Python script was used to apply the color palette before the complete React project scaffolding was built starting from `package.json`.
4. **Mock Data:** Deterministic and realistic data (55 facilities, 22 suppliers, 120 products, 220 shipments) was generated using a seeded pseudo-random number generator, achieving plausible seasonal revenue curves (2020-2026) without requiring a backend server or database.
5. **Key Features:** Includes a Dashboard view with KPIs and status charts, full data tables of facilities and shipments with advanced filters and CSV export, supplier profiles with delivery metrics, and global search capabilities combined with a persistent Dark Mode.

## Skills and Technologies Used

The following "skills" (predefined rules and conventions for AI code generation) and methodologies formed the foundational guidelines for development:

*   **React 19 (Requested Skill):** Establishes the use of modern React conventions. The directive emphatically stipulated avoiding manual memoization (such as unnecessary `useMemo` or `useCallback`) and exclusively using named imports.
*   **TypeScript (Skill):** Enforces strict typing as a structural foundation. The *const-types* pattern was heavily applied, flat interfaces were prioritized, and the use of the `any` type was strictly prohibited.
*   **Tailwind CSS 3/4 (Skill):** Configured for semantic, responsive styling. The guidelines required the use of the `cn()` utility function (which combines `clsx` and `tailwind-merge`), the use of semantic class names, and the complete avoidance of embedded hexadecimal color codes within `className` string literals.
*   **Vite 5:** Acts as the primary frontend bundler and development environment, providing continuous HMR and ultra-fast compilation.
*   **Zustand:** Chosen for global state management because it is lightweight and lacks boilerplate. It manages the local dark mode preference, sidebar toggle behavior, and global search inputs decoupled from the UI layer.
*   **Recharts:** The chosen library for analytical data visualization; includes interactive and container-adaptable components (`ResponsiveContainer`) such as area, bar, and donut charts.
*   **React Router v6:** Client-side router used to structure the 5 main views, enabling fluid navigation without full page reloads.
*   **Lucide React:** Used exhaustively for all the modern and clean icons presented in the status bars, menus, and application widgets.
