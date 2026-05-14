const STORAGE_KEY = 'vet-theme-palette'

export interface PaletteEntry { key: string; label: string; value: string }

// Defaults derived from the actual CSS variables in index.css
export const LIGHT_DEFAULTS: PaletteEntry[] = [
  { key: 'light-primary',     label: 'Primary',     value: '#22776c' },
  { key: 'light-secondary',   label: 'Secondary',   value: '#ebedf0' },
  { key: 'light-accent',      label: 'Accent',      value: '#e5e8eb' },
  { key: 'light-muted',       label: 'Muted',       value: '#ebedf0' },
  { key: 'light-destructive', label: 'Destructive', value: '#dc2828' },
]

export const DARK_DEFAULTS: PaletteEntry[] = [
  { key: 'dark-primary',     label: 'Primary',     value: '#31af9e' },
  { key: 'dark-secondary',   label: 'Secondary',   value: '#252931' },
  { key: 'dark-accent',      label: 'Accent',      value: '#272b34' },
  { key: 'dark-muted',       label: 'Muted',       value: '#252931' },
  { key: 'dark-destructive', label: 'Destructive', value: '#c62e2e' },
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

const VAR_MAP: Record<string, string> = {
  'light-primary':     '--primary',
  'light-secondary':   '--secondary',
  'light-accent':      '--accent',
  'light-muted':       '--muted',
  'light-destructive': '--destructive',
  'dark-primary':      '--primary',
  'dark-secondary':    '--secondary',
  'dark-accent':       '--accent',
  'dark-muted':        '--muted',
  'dark-destructive':  '--destructive',
}

export function applyPalette(light: PaletteEntry[], dark: PaletteEntry[]): void {
  const lightRules = light.map((e) => `  ${VAR_MAP[e.key]}: ${hexToHslString(e.value)};`).join('\n')
  const darkRules  = dark.map((e) =>  `  ${VAR_MAP[e.key]}: ${hexToHslString(e.value)};`).join('\n')

  const css = `:root {\n${lightRules}\n}\n.dark {\n${darkRules}\n}`

  let el = document.getElementById('vet-theme-palette') as HTMLStyleElement | null
  if (!el) {
    el = document.createElement('style')
    el.id = 'vet-theme-palette'
    document.head.appendChild(el)
  }
  el.textContent = css
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

// Call once on app boot to re-apply any saved palette
export function loadAndApplyPalette(): void {
  const saved = loadSavedPalette()
  if (saved) applyPalette(saved.light, saved.dark)
}
