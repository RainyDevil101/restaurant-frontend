import type { Category, Product, Menu } from '@/shared/types'

export const mockCategories: Category[] = [
  { id: 'cat-1', name: 'Entradas' },
  { id: 'cat-2', name: 'Platos fuertes' },
  { id: 'cat-3', name: 'Bebidas' },
  { id: 'cat-4', name: 'Postres' },
]

export const mockProducts: Product[] = [
  // Entradas
  { id: 'prod-1', name: 'Guacamole',         description: 'Con totopos',           price: 85,  categoryId: 'cat-1', available: true  },
  { id: 'prod-2', name: 'Sopa de tortilla',  description: 'Con crema y queso',     price: 75,  categoryId: 'cat-1', available: true  },
  { id: 'prod-3', name: 'Flautas',           description: 'Pollo o papa, 3 pzas',  price: 90,  categoryId: 'cat-1', available: true  },

  // Platos fuertes
  { id: 'prod-4', name: 'Carne asada',       description: '300g con guarnición',   price: 220, categoryId: 'cat-2', available: true  },
  { id: 'prod-5', name: 'Pollo a la plancha',description: 'Con arroz y ensalada',  price: 175, categoryId: 'cat-2', available: true  },
  { id: 'prod-6', name: 'Enchiladas verdes', description: 'Pollo, crema y queso',  price: 140, categoryId: 'cat-2', available: true  },
  { id: 'prod-7', name: 'Quesadillas',       description: 'Con queso Oaxaca',      price: 120, categoryId: 'cat-2', available: false },

  // Bebidas
  { id: 'prod-8',  name: 'Agua fresca',      description: 'Jamaica, horchata o tamarindo', price: 35, categoryId: 'cat-3', available: true },
  { id: 'prod-9',  name: 'Refresco',         description: 'Lata 355ml',            price: 30,  categoryId: 'cat-3', available: true  },
  { id: 'prod-10', name: 'Cerveza',          description: 'Botella 355ml',         price: 55,  categoryId: 'cat-3', available: true  },
  { id: 'prod-11', name: 'Agua mineral',     description: 'Botella 500ml',         price: 25,  categoryId: 'cat-3', available: true  },

  // Postres
  { id: 'prod-12', name: 'Flan napolitano',  description: 'Con cajeta',            price: 65,  categoryId: 'cat-4', available: true  },
  { id: 'prod-13', name: 'Pastel de chocolate', description: 'Rebanada',           price: 70,  categoryId: 'cat-4', available: true  },
]

export const mockMenu: Menu = {
  id: 'menu-1',
  name: 'Menú principal',
  productIds: mockProducts.filter((p) => p.available).map((p) => p.id),
  active: true,
}

export const mockMenus: Menu[] = [
  mockMenu,
  {
    id: 'menu-2',
    name: 'Menú de temporada',
    productIds: ['prod-1', 'prod-4', 'prod-8', 'prod-10'],
    active: false,
  },
]
