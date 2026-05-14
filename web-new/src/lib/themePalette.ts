const STORAGE_KEY = 'vet-theme-palette'

export interface PaletteEntry { key: string; label: string; description: string; value: string }

// Defaults match the actual CSS variable values in index.css
export const LIGHT_DEFAULTS: PaletteEntry[] = [
  { key: 'light-primary',     label: 'Primary',     description: 'Buttons, active nav items, links, focus rings',      value: '#22776c' },
  { key: 'light-secondary',   label: 'Secondary',   description: 'Secondary button backgrounds, badge fills',           value: '#ebedf0' },
  { key: 'light-accent',      label: 'Accent',      description: 'Hover highlights on menus, dropdowns, sidebar rows',  value: '#e5e8eb' },
  { key: 'light-muted',       label: 'Muted',       description: 'Muted/disabled backgrounds, table stripes',           value: '#ebedf0' },
  { key: 'light-destructive', label: 'Destructive', description: 'Delete buttons, error alerts, danger states',         value: '#dc2828' },
]

export const DARK_DEFAULTS: PaletteEntry[] = [
  { key: 'dark-primary',     label: 'Primary',     description: 'Buttons, active nav items, links, focus rings',      value: '#31af9e' },
  { key: 'dark-secondary',   label: 'Secondary',   description: 'Secondary button backgrounds, badge fills',           value: '#252931' },
  { key: 'dark-accent',      label: 'Accent',      description: 'Hover highlights on menus, dropdowns, sidebar rows',  value: '#272b34' },
  { key: 'dark-muted',       label: 'Muted',       description: 'Muted/disabled backgrounds, table stripes',           value: '#252931' },
  { key: 'dark-destructive', label: 'Destructive', description: 'Delete buttons, error alerts, danger states',         value: '#c62e2e' },
]

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
  'light-primary':     ['--primary', '--ring', '--sidebar-primary', '--sidebar-ring'],
  'light-secondary':   ['--secondary'],
  'light-accent':      ['--accent', '--sidebar-accent'],
  'light-muted':       ['--muted'],
  'light-destructive': ['--destructive'],
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

  // Always remove and re-append so this tag is last in <head>,
  // guaranteeing it wins the cascade over Vite-injected stylesheets.
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

export function loadSavedPalette(): { light: PaletteEntry[]; dark: PaletteEntry[] } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as { light: PaletteEntry[]; dark: PaletteEntry[] }
  } catch {
    return null
  }
}

export function loadAndApplyPalette(): void {
  const saved = loadSavedPalette()
  if (saved) applyPalette(saved.light, saved.dark)
}
