# Vet Clinic Web App - Modern React Rebuild Technical Specification

## Context

The current Next.js application has critical issues that prevent enterprise deployment:
- Hydration mismatches causing layout shifts
- Complex import path issues
- Outdated UI/UX
- Database/Prisma synchronization problems

## Goals

1. **Zero Layout Shift**: Eliminate all hydration mismatches with Vite + client-side rendering
2. **Type-Safe Architecture**: Full TypeScript coverage with TanStack Router
3. **Modern UI/UX**: ShadCN/UI components with Framer Motion animations
4. **Enterprise Performance**: Sub-100ms interactions, code splitting, optimistic updates
5. **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation
6. **Zero Configuration**: Single command setup with automatic dependency resolution

## Non-Goals

- Server-side rendering (not needed for admin dashboard)
- Static site generation
- Multi-tenancy support
- Mobile native app features

## Proposed Architecture

### Technology Stack

```
Build Tool:     Vite 6.x (fast HMR, no SSR)
Framework:      React 18.3 + TypeScript 5.4
Routing:        TanStack Router 1.x (file-based, type-safe)
State:          TanStack Query 5.x (server), Zustand (client)
UI Library:     ShadCN/UI (Radix + Tailwind)
Animations:     Framer Motion 11.x
Forms:          React Hook Form + Zod
Styling:        Tailwind CSS 3.4 + CSS Variables
Icons:          Lucide React
HTTP Client:    Axios with interceptors
```

### Alternative Considered: Keep Next.js
**Why not**: Next.js App Router has fundamental hydration issues with dynamic content. Vite provides simpler, faster, more predictable behavior for admin dashboards.

## File Structure

```
web-modern/
├── src/
│   ├── components/
│   │   ├── ui/              # ShadCN base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── ...
│   │   ├── layout/          # Layout components
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopNav.tsx
│   │   │   └── Breadcrumbs.tsx
│   │   ├── billing/         # Feature components
│   │   │   ├── RevenueChart.tsx
│   │   │   ├── InvoiceTable.tsx
│   │   │   └── PaymentModal.tsx
│   │   └── common/          # Shared components
│   │       ├── PageHeader.tsx
│   │       ├── DataTable.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useInvoices.ts
│   │   └── useDebounce.ts
│   ├── lib/                 # Utilities
│   │   ├── utils.ts         # cn() helper
│   │   ├── api.ts           # API client
│   │   └── constants.ts
│   ├── routes/              # TanStack Router routes
│   │   ├── __root.tsx       # Root layout
│   │   ├── _authenticated.tsx  # Auth wrapper
│   │   ├── admin/
│   │   │   ├── index.tsx    # /admin
│   │   │   ├── billing/
│   │   │   │   ├── index.tsx     # /admin/billing
│   │   │   │   └── invoices/
│   │   │   │       ├── index.tsx # /admin/billing/invoices
│   │   │   │       └── $id.tsx   # /admin/billing/invoices/:id
│   │   │   └── settings.tsx
│   │   ├── login.tsx
│   │   └── patients/
│   │       └── index.tsx
│   ├── stores/              # Zustand stores
│   │   ├── authStore.ts
│   │   └── uiStore.ts
│   ├── types/               # TypeScript types
│   │   ├── api.ts
│   │   └── models.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Component Architecture

### Sidebar Component (Zero Layout Shift)

```tsx
// components/layout/Sidebar.tsx
// Fixed position, SSR-safe, animated with Framer Motion

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

// Key features:
// - CSS fixed positioning (no layout shift)
// - Framer Motion for smooth collapse/expand
// - CSS variables for theming
// - Keyboard navigation support
```

### Route Structure

```tsx
// routes/_authenticated.tsx
// Layout route that wraps all protected routes

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  )
}
```

## Animation Strategy

### Page Transitions
```tsx
// AnimatePresence for route transitions
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.2 }}
>
  {children}
</motion.div>
```

### Sidebar Animation
```tsx
// Layout animation for smooth width changes
<motion.aside
  layout
  initial={false}
  animate={{ width: isCollapsed ? 72 : 280 }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

## State Management

### Server State (TanStack Query)
```tsx
// hooks/useInvoices.ts
export function useInvoices(filters: InvoiceFilters) {
  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: () => api.getInvoices(filters),
    staleTime: 30000, // 30 seconds
    placeholderData: keepPreviousData,
  })
}
```

### Client State (Zustand)
```tsx
// stores/uiStore.ts
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  theme: 'light',
  toggleSidebar: () => set((state) => ({ 
    sidebarCollapsed: !state.sidebarCollapsed 
  })),
  setTheme: (theme) => set({ theme }),
}))
```

## Styling Strategy

### Tailwind Configuration
```ts
// tailwind.config.ts
export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... semantic colors
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
}
```

### CSS Variables
```css
/* index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 174 72% 26%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 174 72% 26%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode colors */
  }
}
```

## Implementation Phases

### Phase 1: Foundation (Day 1)
- [ ] Initialize Vite project with TypeScript
- [ ] Setup Tailwind CSS with CSS variables
- [ ] Configure TanStack Router
- [ ] Create base ShadCN components
- [ ] Setup development environment

### Phase 2: Layout System (Day 1-2)
- [ ] Build Sidebar component with Framer Motion
- [ ] Create TopNav with user menu
- [ ] Implement AppLayout wrapper
- [ ] Add breadcrumb navigation
- [ ] Test for zero layout shift

### Phase 3: Authentication (Day 2)
- [ ] Create auth store with Zustand
- [ ] Build login page
- [ ] Implement protected routes
- [ ] Add auth API integration
- [ ] Test authentication flow

### Phase 4: Core Pages (Day 3-4)
- [ ] Admin Dashboard with charts
- [ ] Billing Dashboard
- [ ] Invoice list and detail pages
- [ ] Patient management
- [ ] Settings page

### Phase 5: Polish (Day 5)
- [ ] Add keyboard shortcuts
- [ ] Implement command palette
- [ ] Add toast notifications
- [ ] Optimize performance
- [ ] Final accessibility audit

## Migration Strategy

### Parallel Development
1. Keep existing Next.js app running
2. Build new Vite app in `web-modern/` directory
3. Migrate features one by one
4. Switch over when feature-complete

### API Compatibility
- Use same REST API endpoints
- Maintain data format compatibility
- Test against production API

### Data Migration
- No database changes needed
- Use existing Prisma models
- Maintain same API contracts

## Testing Strategy

### Unit Tests
- Vitest for component testing
- React Testing Library for interactions
- Coverage > 80%

### E2E Tests
- Playwright for critical flows
- Test authentication
- Test invoice creation workflow

### Performance Tests
- Lighthouse CI for performance budgets
- Bundle size monitoring
- Interaction timing tests

## Observability

### Logging
- Structured logging with Pino
- Error boundary capture
- Performance metrics

### Analytics
- Page view tracking
- Feature usage analytics
- Error tracking with Sentry

## Success Metrics

- **Performance**: <100ms time to interactive
- **Layout Stability**: 0 CLS (Cumulative Layout Shift)
- **Accessibility**: 100 Lighthouse accessibility score
- **Bundle Size**: <200KB initial JS
- **Test Coverage**: >80%

## Open Questions

1. **Deployment**: Should we use Netlify, Vercel, or self-hosted?
   - *Recommendation*: Netlify for simple CDN deployment

2. **API Base URL**: How should we configure API endpoints?
   - *Recommendation*: Environment variables with .env files

3. **Error Tracking**: Which service for production monitoring?
   - *Recommendation*: Sentry for error tracking

## Rollout Plan

### Week 1: Development
- Complete all 5 implementation phases
- Internal testing

### Week 2: Testing
- QA testing
- Performance optimization
- Bug fixes

### Week 3: Migration
- Deploy to staging
- User acceptance testing
- Production deployment with feature flags

### Week 4: Cleanup
- Deprecate old Next.js app
- Monitor for issues
- Document new system
