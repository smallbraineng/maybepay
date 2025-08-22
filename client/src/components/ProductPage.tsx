import { memo, useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useParams } from 'wouter'
import { products } from '../config'
import { useStore } from '../store'
import Dropdown from './Dropdown'

const ProductPage = memo(() => {
  const { id } = useParams<{ id: string }>()
  const [, setLocation] = useLocation()
  const { placeOrder, getInventory } = useStore()

  const product = useMemo(() => products.find((p) => p.id === id), [id])
  const inventory = useMemo(() => getInventory(id || ''), [id, getInventory])

  const [selectedColor, setSelectedColor] = useState('')
  const [selectedSize, setSelectedSize] = useState('')
  const [showError, setShowError] = useState(false)

  const colorOptions = useMemo(() => {
    const colors = [...new Set(inventory.map((item) => item.color))]
    return colors.map((color) => ({
      value: color,
      label: color === '#1c1917' ? 'Dark' : 'Light',
      color: color,
    }))
  }, [inventory])

  const sizeOptions = useMemo(() => {
    const availableSizes = inventory
      .filter((item) => !selectedColor || item.color === selectedColor)
      .filter((item) => item.size && item.stock > 0)
      .map((item) => item.size as string)

    const uniqueSizes = [...new Set(availableSizes)]
    const sizeOrder = ['S', 'M', 'L', 'XL']

    return sizeOrder
      .filter((size) => uniqueSizes.includes(size))
      .map((size) => ({
        value: size,
        label: size,
        disabled: !availableSizes.includes(size),
      }))
  }, [inventory, selectedColor])

  const currentStock = useMemo(() => {
    const item = inventory.find(
      (item) =>
        item.color === selectedColor &&
        (item.size === selectedSize || !item.size)
    )
    return item?.stock || 0
  }, [inventory, selectedColor, selectedSize])

  const hasSizes = useMemo(
    () => inventory.some((item) => item.size),
    [inventory]
  )

  const handleOrder = useCallback(() => {
    if (!product || !selectedColor || (hasSizes && !selectedSize)) {
      setShowError(true)
      return
    }
    setShowError(false)
    const checkoutPath = selectedSize
      ? `/checkout/${product.id}/${encodeURIComponent(selectedColor)}/${encodeURIComponent(selectedSize)}`
      : `/checkout/${product.id}/${encodeURIComponent(selectedColor)}`
    setLocation(checkoutPath)
  }, [product, selectedColor, selectedSize, setLocation, hasSizes])

  const handleMaybePay = useCallback(() => {
    if (!product || !selectedColor || (hasSizes && !selectedSize)) {
      setShowError(true)
      return
    }
    setShowError(false)
    const checkoutPath = selectedSize
      ? `/maybepay/${product.id}/${encodeURIComponent(selectedColor)}/${encodeURIComponent(selectedSize)}`
      : `/maybepay/${product.id}/${encodeURIComponent(selectedColor)}`
    setLocation(checkoutPath)
  }, [product, selectedColor, selectedSize, setLocation, hasSizes])

  // Hide error message when user selects both color and size
  useEffect(() => {
    if (selectedColor && (!hasSizes || selectedSize)) {
      setShowError(false)
    }
  }, [selectedColor, selectedSize, hasSizes])

  const handleBack = useCallback(() => {
    setLocation('/')
  }, [setLocation])

  if (!product) {
    return <div>Product not found</div>
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 text-stone-900 hover:text-stone-600 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <img
              src={product.image}
              alt={product.title}
              className="w-full max-w-md mx-auto border border-stone-900"
            />
          </div>

          <div className="space-y-8">
            <div>
              <h1
                className="text-4xl font-medium text-stone-900 mb-2"
                style={{ fontFamily: 'EB Garamond' }}
              >
                {product.title}
              </h1>
              <p className="text-3xl font-medium text-stone-900">
                ${product.price}
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="color-select"
                    className="block text-sm font-medium text-stone-900 mb-2"
                  >
                    Color
                  </label>
                  <div id="color-select">
                    <Dropdown
                      options={colorOptions}
                      value={selectedColor}
                      onChange={setSelectedColor}
                      placeholder="Select color"
                    />
                  </div>
                </div>

                {hasSizes && (
                  <div>
                    <label
                      htmlFor="size-select"
                      className="block text-sm font-medium text-stone-900 mb-2"
                    >
                      Size
                    </label>
                    <div id="size-select">
                      <Dropdown
                        options={sizeOptions}
                        value={selectedSize}
                        onChange={setSelectedSize}
                        placeholder="Select size"
                      />
                    </div>
                  </div>
                )}
              </div>

              {currentStock > 0 &&
                selectedColor &&
                (!hasSizes || selectedSize) && (
                  <p className="text-sm text-stone-600">
                    {currentStock} in stock
                  </p>
                )}
            </div>

            <div>
              <p className="text-stone-900 text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-medium text-stone-900 mb-4">
                Reviews
              </h3>
              <div className="space-y-2">
                {product.reviews.map((reviewUrl) => (
                  <a
                    key={reviewUrl}
                    href={reviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-stone-900 underline hover:no-underline"
                  >
                    Review {product.reviews.indexOf(reviewUrl) + 1}
                  </a>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={handleOrder}
                className="w-full bg-stone-900 text-white py-4 px-8 text-xl font-medium hover:bg-stone-800 transition-colors"
              >
                {currentStock === 0 &&
                selectedColor &&
                !hasSizes &&
                !selectedSize
                  ? 'Out of Stock'
                  : `Buy Now - $${product.price}`}
              </button>

              {/* Maybe Pay Button */}
              <button
                type="button"
                onClick={handleMaybePay}
                className="w-full bg-stone-200 text-stone-900 py-3 px-8 text-lg font-medium hover:bg-stone-300 transition-colors border border-stone-300"
              >
                Maybe Pay
              </button>

              {/* Error Message */}
              {showError && (
                <div className="text-red-600 text-sm text-center py-2">
                  Please select color{hasSizes ? ' and size' : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ProductPage
