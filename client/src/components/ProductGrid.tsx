import type { Product } from '../config'
import ProductCard from './ProductCard'

const ProductGrid = ({ products, onProductClick }: {
  products: Product[]
  onProductClick: (product: Product) => void
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onClick={onProductClick}
        />
      ))}
    </div>
  )
}

export default ProductGrid