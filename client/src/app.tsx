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
        className="flex tracking-tight justify-between text-sm md:text-lg lg:text-xl bg-white px-6 py-0.5 rounded-lg mb-8"
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
      <div className="mb-8 bg-stone-100 py-4 px-6 rounded-lg relative overflow-hidden">
        <div className="text-center mb-2">
          <div
            className="text-sm text-stone-500 tracking-wider uppercase"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
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

        {/* Fortune Favors the Bold Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="text-2xl md:text-4xl lg:text-6xl font-black text-stone-900 tracking-wider uppercase opacity-0 whitespace-nowrap text-center"
            style={{ fontFamily: 'Inter, sans-serif', animation: 'fortuneFlash 8s infinite' }}
          >
            FORTUNE FAVORS THE BOLD
          </div>
          <div
            className="text-2xl md:text-4xl lg:text-6xl font-black text-stone-900 tracking-wider uppercase opacity-0 whitespace-nowrap text-center absolute"
            style={{ fontFamily: 'Inter, sans-serif', animation: 'chooseMaybePay 8s infinite' }}
          >
            CHOOSE MAYBE PAY
          </div>
        </div>
      </div>

      {/* Main Hero Image */}
      <div className="w-full relative -mt-8">
        <img
          src="/assets/main.jpg"
          alt="Main background"
          className="w-full h-full object-cover rounded-xl lg:h-128"
        />
        <div className="absolute right-6 bottom-6 text-end text-stone-100">
          <h1
            className="text-2xl md:text-3xl lg:text-6xl tracking-tighter"
            style={{ fontFamily: 'EB Garamond' }}
          >
            Think Small Brain.
          </h1>
        </div>

        {/* Bottom Left Overlay */}
        <div className="absolute left-6 bottom-6 text-stone-100">
          <p
            className="text-lg md:text-xl lg:text-2xl mb-4"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            Want one of these hoodies for free?
          </p>
          <button
            onClick={() => {
              const maybePaySection = document.getElementById('maybe-pay-section')
              maybePaySection?.scrollIntoView({ behavior: 'smooth' })
              setTimeout(() => {
                if ((window as any).triggerMaybePayAnimation) {
                  (window as any).triggerMaybePayAnimation()
                }
              }, 1000)
            }}
            className="border-2 border-stone-100 px-4 py-2 rounded-lg inline-block hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer"
          >
            <span
              className="text-sm md:text-base lg:text-lg font-semibold tracking-wider uppercase"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Maybe Pay
            </span>
          </button>
        </div>
      </div>

      {/* Maybe Pay Section */}
      <div id="maybe-pay-section">
        <MaybePaySection />
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
      <Route path="/checkout/:productId/:color/:size?" component={CheckoutPage} />
      <Route path="/maybepay/:productId/:color/:size?" component={MaybePayCheckoutPage} />
    </Router>
  )
}

export default App
