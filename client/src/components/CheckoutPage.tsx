import { memo, useEffect, useRef, useState } from 'react'
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
} from 'rxjs'
import { useLocation, useParams } from 'wouter'
import { products } from '../config'
import { useStore } from '../store'
import Dropdown from './Dropdown'

const countries = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  CH: 'Switzerland',
  AT: 'Austria',
  SE: 'Sweden',
  NO: 'Norway',
  DK: 'Denmark',
  FI: 'Finland',
  IE: 'Ireland',
  PT: 'Portugal',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  SK: 'Slovakia',
  SI: 'Slovenia',
  HR: 'Croatia',
  RO: 'Romania',
  BG: 'Bulgaria',
  GR: 'Greece',
  CY: 'Cyprus',
  MT: 'Malta',
  LU: 'Luxembourg',
  EE: 'Estonia',
  LV: 'Latvia',
  LT: 'Lithuania',
  JP: 'Japan',
  KR: 'South Korea',
  CN: 'China',
  IN: 'India',
  SG: 'Singapore',
  HK: 'Hong Kong',
  TW: 'Taiwan',
  TH: 'Thailand',
  MY: 'Malaysia',
  PH: 'Philippines',
  ID: 'Indonesia',
  VN: 'Vietnam',
  BR: 'Brazil',
  MX: 'Mexico',
  AR: 'Argentina',
  CL: 'Chile',
  CO: 'Colombia',
  PE: 'Peru',
  UY: 'Uruguay',
  EC: 'Ecuador',
  BO: 'Bolivia',
  PY: 'Paraguay',
  VE: 'Venezuela',
  GY: 'Guyana',
  SR: 'Suriname',
  ZA: 'South Africa',
  EG: 'Egypt',
  MA: 'Morocco',
  TN: 'Tunisia',
  KE: 'Kenya',
  NG: 'Nigeria',
  GH: 'Ghana',
  ET: 'Ethiopia',
  UG: 'Uganda',
  TZ: 'Tanzania',
  RU: 'Russia',
  UA: 'Ukraine',
  BY: 'Belarus',
  TR: 'Turkey',
  IL: 'Israel',
  SA: 'Saudi Arabia',
  AE: 'United Arab Emirates',
  QA: 'Qatar',
  KW: 'Kuwait',
  BH: 'Bahrain',
  OM: 'Oman',
  JO: 'Jordan',
  LB: 'Lebanon',
  IQ: 'Iraq',
  IR: 'Iran',
  NZ: 'New Zealand',
  FJ: 'Fiji',
  PG: 'Papua New Guinea',
  NC: 'New Caledonia',
  VU: 'Vanuatu',
  SB: 'Solomon Islands',
  TO: 'Tonga',
  WS: 'Samoa',
  KI: 'Kiribati',
  FM: 'Micronesia',
  MH: 'Marshall Islands',
  PW: 'Palau',
  NR: 'Nauru',
  TV: 'Tuvalu',
}

type OrderItem = {
  productId: string
  color: string
  size?: string
  quantity: number
}

type AddressSuggestion = {
  address: {
    house_number?: string
    road?: string
    city?: string
    town?: string
    village?: string
    state?: string
    postcode?: string
    country_code?: string
  }
  display_name: string
}

const CheckoutPage = memo(() => {
  const { productId, color, size } = useParams<{
    productId: string
    color: string
    size?: string
  }>()
  const [, setLocation] = useLocation()
  const { getInventory } = useStore()

  const [address, setAddress] = useState({
    email: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
  })

  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const searchSubject = useRef(new Subject<string>())

  useEffect(() => {
    const subscription = searchSubject.current
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) =>
          query.length < 3
            ? of([])
            : fetch(
                `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`
              )
                .then((res) => res.json())
                .catch(() => [])
        )
      )
      .subscribe(setSuggestions)

    return () => subscription.unsubscribe()
  }, [])

  const product = products.find((p) => p.id === productId)
  const orderItem = {
    productId: productId || '',
    color: decodeURIComponent(color || ''),
    size: size ? decodeURIComponent(size) : undefined,
    quantity: 1,
  }
  const shipping = address.country === 'US' ? 5 : 10
  const subtotal = product?.price || 0
  const total = subtotal + shipping

  const handleAddressSelect = (suggestion: AddressSuggestion) => {
    const addr = suggestion.address || {}
    const countryCode = addr.country_code?.toUpperCase() || 'US'
    setAddress((prev) => ({
      ...prev,
      street: `${addr.house_number || ''} ${addr.road || ''}`.trim(),
      city: addr.city || addr.town || addr.village || '',
      state: addr.state || '',
      zip: addr.postcode || '',
      country: countries[countryCode as keyof typeof countries]
        ? countryCode
        : 'US',
    }))
    setSuggestions([])
  }

  const handleBack = () => setLocation(`/product/${productId}`)
  const handlePay = () =>
    console.log('Payment processing...', { orderItem, address, total })

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
          <div className="space-y-8">
            <div>
              <h1
                className="text-3xl font-medium text-stone-900 mb-8"
                style={{ fontFamily: 'EB Garamond' }}
              >
                Checkout
              </h1>
            </div>

            <div>
              <h2 className="text-xl font-medium text-stone-900 mb-4">
                Delivery Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-stone-900 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={address.email}
                    onChange={(e) =>
                      setAddress((prev) => ({ ...prev, email: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-stone-900 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    placeholder="your@email.com"
                  />
                </div>

                <div className="relative">
                  <label
                    htmlFor="street"
                    className="block text-sm font-medium text-stone-900 mb-2"
                  >
                    Street Address
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={address.street}
                    onChange={(e) => {
                      setAddress((prev) => ({
                        ...prev,
                        street: e.target.value,
                      }))
                      searchSubject.current.next(e.target.value)
                    }}
                    onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                    className="w-full px-3 py-2 border border-stone-900 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    placeholder="Enter your address"
                  />

                  {suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-stone-900 border-t-0 z-10">
                      {suggestions.map((suggestion) => (
                        <button
                          type="button"
                          key={suggestion.display_name}
                          onMouseDown={() => handleAddressSelect(suggestion)}
                          className="w-full px-3 py-2 text-left hover:bg-stone-100 text-stone-900"
                        >
                          {suggestion.display_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-stone-900 mb-2"
                    >
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={address.city}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          city: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-stone-900 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="state"
                      className="block text-sm font-medium text-stone-900 mb-2"
                    >
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      value={address.state}
                      onChange={(e) =>
                        setAddress((prev) => ({
                          ...prev,
                          state: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-stone-900 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="zip"
                      className="block text-sm font-medium text-stone-900 mb-2"
                    >
                      ZIP Code
                    </label>
                    <input
                      id="zip"
                      type="text"
                      value={address.zip}
                      onChange={(e) =>
                        setAddress((prev) => ({ ...prev, zip: e.target.value }))
                      }
                      className="w-full px-3 py-2 border border-stone-900 text-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-stone-900 mb-2"
                    >
                      Country
                    </label>
                    <div id="country">
                      <Dropdown
                        options={Object.entries(countries).map(
                          ([code, name]) => ({
                            value: code,
                            label: name,
                          })
                        )}
                        value={address.country}
                        onChange={(value) =>
                          setAddress((prev) => ({ ...prev, country: value }))
                        }
                        placeholder="Select country"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="border border-stone-900 p-6">
              <h2 className="text-xl font-medium text-stone-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 object-cover border border-stone-900"
                  />
                  <div className="flex-1">
                    <h3 className="text-stone-900 font-medium">
                      {product.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-3 h-3 border border-stone-300"
                        style={{ backgroundColor: orderItem.color }}
                      />
                      <span className="text-sm text-stone-600">
                        {orderItem.color === '#1c1917' ? 'Dark' : 'Light'}
                        {orderItem.size && ` • ${orderItem.size}`}
                      </span>
                    </div>
                    <p className="text-stone-900 mt-2">${product.price}</p>
                  </div>
                </div>

                <div className="border-t border-stone-300 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-900">Subtotal</span>
                    <span className="text-stone-900">${subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-900">Shipping</span>
                    <span className="text-stone-900">${shipping}</span>
                  </div>
                  <div className="flex justify-between font-medium text-lg border-t border-stone-300 pt-2">
                    <span className="text-stone-900">Total</span>
                    <span className="text-stone-900">${total}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handlePay}
              disabled={
                !address.email ||
                !address.street ||
                !address.city ||
                !address.country
              }
              className="w-full bg-stone-900 text-white py-4 px-8 text-xl font-medium hover:bg-stone-800 transition-colors disabled:bg-stone-400 disabled:cursor-not-allowed"
            >
              Pay ${total}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

export default CheckoutPage
