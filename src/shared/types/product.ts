export interface Category {
  id: string
  name: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number
  categoryId: string
  available: boolean
}

export interface Menu {
  id: string
  name: string
  productIds: string[]
  active: boolean
}
