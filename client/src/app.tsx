import { useState } from "react";
import type { Product } from "./config";
import { products } from "./config";
import ProductGrid from "./components/ProductGrid";
import ProductModal from "./components/ProductModal";
import { useStore } from "./store";

const App = () => {
  const { placeOrder, isPlacing } = useStore();
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(
    undefined,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(undefined);
  };

  const handleOrder = async (product: Product) => {
    try {
      await placeOrder(BigInt(Math.floor(product.price * 1e18)));
      console.log(`Order placed for ${product.title}`);
    } catch (error) {
      console.error("Failed to place order:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col gap-24 m-6">
      <header
        className="flex tracking-tight"
        style={{ fontFamily: "EB Garamond" }}
      >
        <h1 className="text-stone-900">Small Brain Engineering, Inc.</h1>
      </header>

      <main className="p-6">
        <ProductGrid products={products} onProductClick={handleProductClick} />
      </main>

      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onOrder={handleOrder}
      />

      <div className="w-full relative">
        <img
          src="/assets/main.jpg"
          alt="Main background"
          className="w-full h-full object-cover rounded-xl lg:h-128"
        />
        <div className="absolute right-6 bottom-6 text-end text-stone-100">
          <h1
            className="text-6xl tracking-tighter"
            style={{
              fontFamily: "EB Garamond",
            }}
          >
            Think Small Brain.
          </h1>
        </div>
      </div>
    </div>
  );
};

export default App;
