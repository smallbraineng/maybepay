import { Route, Router, useLocation } from 'wouter'
import CheckoutPage from './components/CheckoutPage'
import MaybePayCheckoutPage from './components/MaybePayCheckoutPage'
import MaybePaySection from './components/MaybePaySection'
import ProductGrid from './components/ProductGrid'
import ProductPage from './components/ProductPage'
import type { Product } from './config'
import { products } from './config'

const HomePage = () => {
  const [, setLocation] = useLocation()

  const handleProductClick = (product: Product) => {
    setLocation(`/product/${product.id}`)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col m-6">
      <header
        className="flex tracking-tight justify-between text-sm md:text-lg lg:text-xl bg-white px-6 py-2 rounded-lg mb-8"
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        <div className="flex items-center gap-3">
          <img
            src="/assets/small brain logo.png"
            alt="Think Small Brain Logo"
            className="w-8 h-8 -mt-0.5"
          />
          <h1 className="text-stone-900">Small Brain Engineering, Inc.</h1>
        </div>
        <h1 className="text-stone-900">Limited Release of 50</h1>
      </header>

      {/* Top Product Grid */}
      <div className="mb-8 bg-stone-50 py-8 px-6 rounded-lg">
        <div className="text-center mb-4">
          <div className="text-sm text-stone-500 tracking-wider uppercase" style={{ fontFamily: 'Inter, sans-serif' }}>
            FEATURED
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-2xl grid-cols-2 md:grid-cols-4 gap-2">
          {products.slice(0, 4).map((product) => (
            <div
              key={product.id}
              className="cursor-pointer flex gap-1 flex-col items-center border-none bg-transparent p-0"
              onClick={() => handleProductClick(product)}
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="flex items-center gap-1">
                <h3
                  className="text-stone-900 tracking-tight text-xs"
                  style={{ fontFamily: 'EB Garamond' }}
                >
                  {product.title}
                </h3>
                <div className="flex gap-0.5">
                  {product.colors.slice(0, 2).map((color) => (
                    <div
                      key={color}
                      className="w-1.5 h-1.5"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MaybePaySection />

      {/* CHOOSE MAYBE PAY Header */}
      <div className="w-full bg-stone-200 px-6 py-2 rounded-t-lg text-center">
        <h2 className="text-sm text-stone-900 tracking-wider uppercase">
          CHOOSE MAYBE PAY
        </h2>
      </div>

      <div className="w-full relative">
        <img
          src="/assets/main.jpg"
          alt="Main background"
          className="w-full h-full object-cover rounded-b-xl lg:h-128"
        />
        <div className="absolute right-6 bottom-6 text-end text-stone-100">
          <h1
            className="text-2xl md:text-3xl lg:text-6xl tracking-tighter"
            style={{
              fontFamily: 'EB Garamond',
            }}
          >
            Think Small Brain.
          </h1>
        </div>
      </div>

      <main className="p-6">
        <ProductGrid products={products} onProductClick={handleProductClick} />
      </main>
    </div>
  )
}

const App = () => {
  return (
    <Router>
      <Route path="/" component={HomePage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route
        path="/checkout/:productId/:color/:size?"
        component={CheckoutPage}
      />
      <Route
        path="/maybepay/:productId/:color/:size?"
        component={MaybePayCheckoutPage}
      />
    </Router>
  )
}

export default App
