const STORAGE_KEY = 'vet-theme-palette'

export interface PaletteEntry { key: string; label: string; description: string; value: string }

export interface ThemePreset {
  id: string
  name: string
  description: string
  /** 4 representative hex colours shown in the preview strip [bg, primary, accent, destructive] */
  preview: [string, string, string, string]
  light: Record<string, string>
  dark:  Record<string, string>
}

export const PRESETS: ThemePreset[] = [
  {
    id: 'forest',
    name: 'Forest',
    description: 'Teal greens — calm and clinical',
    preview: ['#f6f7f9', '#22776c', '#e5e8eb', '#dc2828'],
    light: { background: '#f6f7f9', foreground: '#192029', primary: '#22776c', secondary: '#ebedf0', accent: '#e5e8eb', muted: '#ebedf0', destructive: '#dc2828' },
    dark:  { background: '#12151c', foreground: '#eaedf0', primary: '#31af9e', secondary: '#252931', accent: '#272b34', muted: '#252931', destructive: '#c62e2e' },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues — clean and professional',
    preview: ['#f0f5ff', '#2563eb', '#e6eefb', '#dc2626'],
    light: { background: '#f0f5ff', foreground: '#0c1a3d', primary: '#2563eb', secondary: '#dde5f9', accent: '#e6eefb', muted: '#dde5f9', destructive: '#dc2626' },
    dark:  { background: '#0d1120', foreground: '#dde8ff', primary: '#3b82f6', secondary: '#131b30', accent: '#1a2540', muted: '#131b30', destructive: '#f87171' },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm ambers — energetic and inviting',
    preview: ['#fffbf5', '#c2610f', '#fddfc4', '#dc2626'],
    light: { background: '#fffbf5', foreground: '#291806', primary: '#c2610f', secondary: '#feecd8', accent: '#fddfc4', muted: '#feecd8', destructive: '#dc2626' },
    dark:  { background: '#160d04', foreground: '#f5e4cf', primary: '#f97316', secondary: '#2a1806', accent: '#391f08', muted: '#2a1806', destructive: '#f87171' },
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purples — modern and distinctive',
    preview: ['#f9f7ff', '#7c3aed', '#e6deff', '#dc2626'],
    light: { background: '#f9f7ff', foreground: '#1a1033', primary: '#7c3aed', secondary: '#ede8ff', accent: '#e6deff', muted: '#ede8ff', destructive: '#dc2626' },
    dark:  { background: '#100b1e', foreground: '#e4deff', primary: '#a78bfa', secondary: '#1e1533', accent: '#2a1f44', muted: '#1e1533', destructive: '#f87171' },
  },
  {
    id: 'slate',
    name: 'Slate',
    description: 'Neutral grays — minimal and timeless',
    preview: ['#f8fafc', '#475569', '#e2e8f0', '#dc2626'],
    light: { background: '#f8fafc', foreground: '#0f172a', primary: '#475569', secondary: '#e2e8f0', accent: '#e2e8f0', muted: '#e2e8f0', destructive: '#dc2626' },
    dark:  { background: '#0f172a', foreground: '#f1f5f9', primary: '#94a3b8', secondary: '#1e293b', accent: '#1e293b', muted: '#1e293b', destructive: '#f87171' },
  },
  {
    id: 'rose',
    name: 'Rose',
    description: 'Vibrant pinks — bold and expressive',
    preview: ['#fff7f9', '#e11d48', '#fdd8e5', '#dc2626'],
    light: { background: '#fff7f9', foreground: '#2d0a16', primary: '#e11d48', secondary: '#fce7ef', accent: '#fdd8e5', muted: '#fce7ef', destructive: '#dc2626' },
    dark:  { background: '#1a060d', foreground: '#fce7ef', primary: '#fb7185', secondary: '#2d1520', accent: '#3d1b2a', muted: '#2d1520', destructive: '#f87171' },
  },
  {
    id: 'emerald',
    name: 'Emerald',
    description: 'Fresh greens — natural and energising',
    preview: ['#f0fdf6', '#059669', '#a7f3d0', '#dc2626'],
    light: { background: '#f0fdf6', foreground: '#052e18', primary: '#059669', secondary: '#d1fae5', accent: '#a7f3d0', muted: '#d1fae5', destructive: '#dc2626' },
    dark:  { background: '#051a0d', foreground: '#d1fae5', primary: '#34d399', secondary: '#0d2b1a', accent: '#14392a', muted: '#0d2b1a', destructive: '#f87171' },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep indigo — elegant and immersive',
    preview: ['#f5f5ff', '#4f46e5', '#e0e7ff', '#dc2626'],
    light: { background: '#f5f5ff', foreground: '#1e1b4b', primary: '#4f46e5', secondary: '#e0e7ff', accent: '#eef2ff', muted: '#e0e7ff', destructive: '#dc2626' },
    dark:  { background: '#0d0b1e', foreground: '#e0e7ff', primary: '#818cf8', secondary: '#1a1740', accent: '#211e52', muted: '#1a1740', destructive: '#f87171' },
  },
  {
    id: 'copper',
    name: 'Copper',
    description: 'Warm amber-gold — earthy and rich',
    preview: ['#fdfaf6', '#b45309', '#fde68a', '#dc2626'],
    light: { background: '#fdfaf6', foreground: '#292009', primary: '#b45309', secondary: '#fef3c7', accent: '#fde68a', muted: '#fef3c7', destructive: '#dc2626' },
    dark:  { background: '#151005', foreground: '#fef3c7', primary: '#f59e0b', secondary: '#251c08', accent: '#35280c', muted: '#251c08', destructive: '#f87171' },
  },
  {
    id: 'arctic',
    name: 'Arctic',
    description: 'Ice cyan — crisp and refreshing',
    preview: ['#f0fbff', '#0891b2', '#b3eaf5', '#dc2626'],
    light: { background: '#f0fbff', foreground: '#0a2530', primary: '#0891b2', secondary: '#e0f7fc', accent: '#b3eaf5', muted: '#e0f7fc', destructive: '#dc2626' },
    dark:  { background: '#050f14', foreground: '#e0f7fc', primary: '#22d3ee', secondary: '#0a2030', accent: '#0d2d3a', muted: '#0a2030', destructive: '#f87171' },
  },
]

// Defaults match the actual CSS variable values in index.css
export const LIGHT_DEFAULTS: PaletteEntry[] = [
  { key: 'light-background',  label: 'Background',  description: 'Main page canvas and sidebar background',             value: '#f6f7f9' },
  { key: 'light-foreground',  label: 'Foreground',  description: 'Default text, headings, icons',                       value: '#192029' },
  { key: 'light-primary',     label: 'Primary',     description: 'Buttons, active nav items, links, focus rings',       value: '#22776c' },
  { key: 'light-secondary',   label: 'Secondary',   description: 'Secondary button backgrounds, badge fills',            value: '#ebedf0' },
  { key: 'light-accent',      label: 'Accent',      description: 'Hover highlights on menus, dropdowns, sidebar rows',  value: '#e5e8eb' },
  { key: 'light-muted',       label: 'Muted',       description: 'Muted/disabled backgrounds, table stripes',            value: '#ebedf0' },
  { key: 'light-destructive', label: 'Destructive', description: 'Delete buttons, error alerts, danger states',          value: '#dc2828' },
]

export const DARK_DEFAULTS: PaletteEntry[] = [
  { key: 'dark-background',  label: 'Background',  description: 'Main page canvas and sidebar background',             value: '#12151c' },
  { key: 'dark-foreground',  label: 'Foreground',  description: 'Default text, headings, icons',                       value: '#eaedf0' },
  { key: 'dark-primary',     label: 'Primary',     description: 'Buttons, active nav items, links, focus rings',       value: '#31af9e' },
  { key: 'dark-secondary',   label: 'Secondary',   description: 'Secondary button backgrounds, badge fills',            value: '#252931' },
  { key: 'dark-accent',      label: 'Accent',      description: 'Hover highlights on menus, dropdowns, sidebar rows',  value: '#272b34' },
  { key: 'dark-muted',       label: 'Muted',       description: 'Muted/disabled backgrounds, table stripes',            value: '#252931' },
  { key: 'dark-destructive', label: 'Destructive', description: 'Delete buttons, error alerts, danger states',          value: '#c62e2e' },
]

/** Build a full PaletteEntry[] from a preset's flat colour map */
export function paletteFromPreset(preset: ThemePreset, mode: 'light' | 'dark'): PaletteEntry[] {
  const defaults = mode === 'light' ? LIGHT_DEFAULTS : DARK_DEFAULTS
  const values   = mode === 'light' ? preset.light   : preset.dark
  return defaults.map((d) => {
    const slot = d.key.replace(`${mode}-`, '')
    return values[slot] ? { ...d, value: values[slot] } : d
  })
}

function hexToHslString(hex: string): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return 'hsl(0 0% 50%)'

  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  let h = 0
  let s = 0

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
    else if (max === g) h = ((b - r) / d + 2) / 6
    else h = ((r - g) / d + 4) / 6
  }

  return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`
}

// Each palette key maps to every CSS variable it should drive
const VAR_MAP: Record<string, string[]> = {
  'light-background':  ['--background', '--card', '--popover', '--sidebar'],
  'light-foreground':  ['--foreground', '--card-foreground', '--popover-foreground', '--sidebar-foreground'],
  'light-primary':     ['--primary', '--ring', '--sidebar-primary', '--sidebar-ring'],
  'light-secondary':   ['--secondary'],
  'light-accent':      ['--accent', '--sidebar-accent'],
  'light-muted':       ['--muted'],
  'light-destructive': ['--destructive'],
  'dark-background':   ['--background', '--card', '--popover', '--sidebar'],
  'dark-foreground':   ['--foreground', '--card-foreground', '--popover-foreground', '--sidebar-foreground'],
  'dark-primary':      ['--primary', '--ring', '--sidebar-primary', '--sidebar-ring'],
  'dark-secondary':    ['--secondary'],
  'dark-accent':       ['--accent', '--sidebar-accent'],
  'dark-muted':        ['--muted'],
  'dark-destructive':  ['--destructive'],
}

function buildRules(entries: PaletteEntry[]): string {
  return entries.flatMap((e) => {
    const hsl = hexToHslString(e.value)
    return (VAR_MAP[e.key] ?? []).map((cssVar) => `  ${cssVar}: ${hsl};`)
  }).join('\n')
}

export function applyPalette(light: PaletteEntry[], dark: PaletteEntry[]): void {
  const css = `:root {\n${buildRules(light)}\n}\n.dark {\n${buildRules(dark)}\n}`

  document.getElementById('vet-theme-palette')?.remove()
  const el = document.createElement('style')
  el.id = 'vet-theme-palette'
  el.textContent = css
  document.head.appendChild(el)
}

export function savePalette(light: PaletteEntry[], dark: PaletteEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ light, dark }))
}

export function clearSavedPalette(): void {
  localStorage.removeItem(STORAGE_KEY)
  document.getElementById('vet-theme-palette')?.remove()
}

function mergePalette(defaults: PaletteEntry[], saved: PaletteEntry[]): PaletteEntry[] {
  return defaults.map((d) => {
    const match = saved.find((s) => s.key === d.key)
    return match ? { ...d, value: match.value } : d
  })
}

export function loadSavedPalette(): { light: PaletteEntry[]; dark: PaletteEntry[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved = JSON.parse(raw) as { light: PaletteEntry[]; dark: PaletteEntry[] }
    return {
      light: mergePalette(LIGHT_DEFAULTS, saved.light ?? []),
      dark:  mergePalette(DARK_DEFAULTS,  saved.dark  ?? []),
    }
  } catch {
    return null
  }
}

export function loadAndApplyPalette(): void {
  const saved = loadSavedPalette()
  if (saved) applyPalette(saved.light, saved.dark)
}
