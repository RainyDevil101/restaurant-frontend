interface AreaLabel {
  text: string
  bg: string
  color: string
}

const AREA_MAP: Record<string, AreaLabel> = {
  'cat-3': { text: 'bar',     bg: '#EDE9FE', color: '#6D28D9' },
}

const DEFAULT: AreaLabel = { text: 'comedor', bg: '#F3F4F6', color: '#4B5563' }

export function areaLabel(categoryId: string): AreaLabel {
  return AREA_MAP[categoryId] ?? DEFAULT
}
