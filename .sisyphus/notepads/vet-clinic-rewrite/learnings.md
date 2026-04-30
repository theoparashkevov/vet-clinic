## Web-new scaffolding learnings

- Vite React TS template works well as a base for modern React apps.
- TanStack Router file-based routing requires `routeTree.gen.ts` to be generated before `tsc -b` passes. The Vite plugin generates it during `vite build`, but since `npm run build` runs `tsc -b && vite build`, the first run of `tsc -b` fails unless the file already exists. Workaround: run `vite build` once to generate the file, then `npm run build` works forever. The generated file should be committed to git.
- Tailwind v4 uses `@import "tailwindcss"` in CSS and `@theme` block for design tokens. No `tailwind.config.js` needed for basic theming.
- PostCSS config for Tailwind v4 is simply: `{ plugins: { "@tailwindcss/postcss": {} } }`.
- `baseUrl` + `paths` in tsconfig.app.json triggers TS5101 deprecation warning in TypeScript ~6.0.2. Removed to keep build clean.
- React 19 + TypeScript ~6.0.2 works with the Vite React plugin without issues.
- Zustand `persist` middleware stores to localStorage by default; `getToken()` reads from that stored shape directly.
- For API proxy in Vite: `server.proxy: { '/v1': { target: 'http://localhost:3000', changeOrigin: true } }`.
- The `_authenticated` layout route in TanStack Router uses `path: ''` (empty) so it doesn't add a URL segment but wraps children with auth checks.
