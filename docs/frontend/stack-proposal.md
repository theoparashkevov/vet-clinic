# Frontend Stack Proposal (v1)

- App framework: Next.js 15 (React 19), TypeScript
- Styling: Tailwind CSS + CSS variables (design tokens)
- Components: Radix UI primitives + headless patterns; light wrapper for consistency
- Forms/validation: React Hook Form + Zod
- Data fetching/state: TanStack Query; REST/JSON for v1; OpenAPI client later
- Routing: App Router; protected routes for doctor/owner
- i18n: next-intl (EN first)
- Dates/times: date-fns-tz, default TZ Europe/Sofia; all UTC in storage
- Testing: Vitest + Testing Library; Playwright for e2e
- A11y: axe-core in tests; eslint-plugin-jsx-a11y; keyboard traps and focus mgmt
- Performance: image optimization, code-splitting, bundle budget checks
- CI: lint/type/test on PR; Lighthouse CI optional

Rationale: productivity, a11y/perf maturity, strong ecosystem, easy Dockerization.
