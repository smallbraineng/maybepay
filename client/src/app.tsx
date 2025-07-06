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
    <div className="min-h-screen bg-white flex flex-col gap-6 m-6">
      <header className="">
        <h1
          className="text-xl font-bold text-stone-900 tracking-tight"
          style={{ fontFamily: "EB Garamond" }}
        >
          Small Brain, Big Store
        </h1>
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
    </div>
  );
};

export default App;
