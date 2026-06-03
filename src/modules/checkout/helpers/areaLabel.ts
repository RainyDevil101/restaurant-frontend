import { colors } from '@/shared/styles/colors'

interface AreaLabel {
  text: string
  bg: string
  color: string
}

const AREA_MAP: Record<string, AreaLabel> = {
  'cat-3': { text: 'bar',     bg: colors.area.bar.bg,     color: colors.area.bar.text     },
}

const DEFAULT: AreaLabel =   { text: 'comedor', bg: colors.area.comedor.bg, color: colors.area.comedor.text }

export function areaLabel(categoryId: string): AreaLabel {
  return AREA_MAP[categoryId] ?? DEFAULT
}
