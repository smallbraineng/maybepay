import type { Product } from '../config'

const ProductCard = ({ product, onClick }: {
  product: Product
  onClick: (product: Product) => void
}) => {
  return (
    <div 
      className="border border-stone-900 cursor-pointer hover:bg-stone-50 transition-colors duration-200"
      onClick={() => onClick(product)}
    >
      <img 
        src={product.image} 
        alt={product.title}
        className="w-full aspect-square object-cover border-b border-stone-900"
      />
      <div className="p-4">
        <h3 className="text-stone-900 font-medium mb-2">{product.title}</h3>
        <p className="text-stone-900 text-lg">${product.price}</p>
      </div>
    </div>
  )
}

export default ProductCard