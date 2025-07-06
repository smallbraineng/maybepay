import type { Product } from '../config'

const ProductCard = ({
  product,
  onClick,
}: {
  product: Product
  onClick: (product: Product) => void
}) => {
  return (
    <button
      type="button"
      className="cursor-pointer flex gap-2 flex-col items-center border-none bg-transparent p-0"
      onClick={() => onClick(product)}
      aria-label={`View details for ${product.title}`}
    >
      <img
        src={product.image}
        alt={product.title}
        className="w-full aspect-square object-fit"
      />
      <div className="flex items-center gap-2">
        <h3
          className="text-stone-900 tracking-tight"
          style={{ fontFamily: 'EB Garamond' }}
        >
          {product.title}
        </h3>
        <div className="flex gap-0.5">
          {product.colors.reverse().map((color) => (
            <div
              key={color}
              className="w-3 h-3"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </button>
  )
}

export default ProductCard
