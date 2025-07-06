import type { Product } from "../config";

const ProductCard = ({
  product,
  onClick,
}: {
  product: Product;
  onClick: (product: Product) => void;
}) => {
  return (
    <div className="cursor-pointer" onClick={() => onClick(product)}>
      <img
        src={product.image}
        alt={product.title}
        className="w-full aspect-square object-fit"
      />
      <div className="p-4">
        <h3
          className="text-stone-900 font-medium mb-2"
          style={{ fontFamily: "EB Garamond" }}
        >
          {product.title}
        </h3>
        <p className="text-stone-900 text-lg">${product.price}</p>
      </div>
    </div>
  );
};

export default ProductCard;
