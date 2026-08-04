/**
 * Products module public API.
 * UI and future FastAPI adapters should import from this barrel only.
 */

export type {
  Product,
  ProductCategory,
  ProductStatus,
  CreateProductInput,
  UpdateProductInput,
} from './types/Product'

export { defaultProducts } from './config/defaultProducts'
export { ProductService } from '../../data/services'
export { ApiProductService } from './services/ApiProductService'
export { default as ProductForm } from './components/ProductForm'
export { default as ProductManagement } from './pages/ProductManagement'
