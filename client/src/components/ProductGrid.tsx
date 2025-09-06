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
    <div className="w-full">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-stone-500 tracking-wider uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            PRODUCTS
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-900 tracking-tight"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            EVERYDAY ESSENTIALS.
          </h2>
        </div>
        <div className="flex items-center justify-between">
          <h3
            className="text-2xl md:text-3xl lg:text-4xl font-bold text-stone-700 tracking-tight"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            THINK SMALLBRAIN.
          </h3>
        </div>
      </div>

      {/* Product Grid */}
      <div className="mx-auto grid w-full max-w-4xl grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={onProductClick}
          />
        ))}
      </div>
    </div>
  )
}

export default ProductGrid
