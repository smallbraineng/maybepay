import type { Product } from '../config'
import ProductCard from './ProductCard'

const ProductGrid = ({
  products,
  onProductClick,
}: {
  products: Product[]
  onProductClick: (product: Product) => void
}) => {
  return (
    <div className="mx-auto grid w-full max-w-4xl grid-cols-2 md:grid-cols-4 gap-6">
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
