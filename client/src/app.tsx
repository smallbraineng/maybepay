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
        className="flex tracking-tight justify-between text-xs md:text-base lg:text-md bg-stone-200 px-6 py-4 rounded-lg mb-16"
        style={{ fontFamily: 'EB Garamond' }}
      >
        <h1 className="text-stone-900">Small Brain Engineering, Inc.</h1>
        <h1 className="text-stone-900">Limited Release of 50</h1>
      </header>

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
