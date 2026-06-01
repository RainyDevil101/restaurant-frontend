import { mockCategories } from '@/shared/mocks'

const PALETTE: Record<string, string> = {
  'cat-1': '#10B981',
  'cat-2': '#3B82F6',
  'cat-3': '#F59E0B',
  'cat-4': '#8B5CF6',
}

export function categoryColor(categoryId: string): string {
  return PALETTE[categoryId] ?? '#9CA3AF'
}

export function categoryName(categoryId: string): string {
  return mockCategories.find((c) => c.id === categoryId)?.name ?? ''
}
