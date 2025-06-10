import type { Product } from "../config";

const ProductModal = ({
  product,
  isOpen,
  onClose,
  onOrder,
}: {
  product: Product | undefined;
  isOpen: boolean;
  onClose: () => void;
  onOrder: (product: Product) => void;
}) => {
  if (!isOpen || !product) return undefined;

  const handleOrder = () => {
    onOrder(product);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-2 border-stone-900 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-medium text-stone-900">
              {product.title}
            </h2>
            <button
              onClick={onClose}
              className="text-stone-900 text-2xl hover:bg-stone-100 w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          <img
            src={product.image}
            alt={product.title}
            className="w-full max-w-md mx-auto mb-6 border border-stone-900"
          />

          <div className="mb-6">
            <p className="text-stone-900 mb-4">{product.description}</p>
            <p className="text-2xl font-medium text-stone-900">
              ${product.price}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium text-stone-900 mb-3">Reviews</h3>
            <div className="space-y-2">
              {product.reviews.map((reviewUrl, index) => (
                <a
                  key={index}
                  href={reviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-stone-900 underline hover:no-underline"
                >
                  Review {index + 1}
                </a>
              ))}
            </div>
          </div>

          <button
            onClick={handleOrder}
            className="w-full bg-stone-900 text-white py-3 px-6 text-lg hover:bg-stone-800 transition-colors"
          >
            Order Now - ${product.price}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
