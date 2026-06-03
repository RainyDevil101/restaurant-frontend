import type { Category } from '@/shared/types'
import { colors } from '@/shared/styles/colors'

function hashId(id: string): number {
  let hash = 0
  for (let index = 0; index < id.length; index++) {
    hash = (hash * 31 + id.charCodeAt(index)) | 0
  }
  return Math.abs(hash)
}

export function categoryColor(categoryId: string): string {
  const { palette, fallback } = colors.category
  return palette[hashId(categoryId) % palette.length] ?? fallback
}

export function categoryName(categoryId: string, categories: Category[]): string {
  return categories.find((category) => category.id === categoryId)?.name ?? ''
}
