import { useEffect, useState } from 'react'
import { useStore } from './store'
import { formatEther } from 'viem'

export const App = () => {
  const { orders, isPlacing, placeOrder, startSync, stopSync } = useStore()
  const [priceInput, setPriceInput] = useState('')

  useEffect(() => {
    startSync()
    return () => stopSync()
  }, [])

  const handlePlaceOrder = async () => {
    const price = parseFloat(priceInput)
    if (isNaN(price) || price <= 0) return
    
    try {
      await placeOrder(BigInt(Math.floor(price * 1e18)))
      setPriceInput('')
    } catch (error) {
      console.error('failed to place order:', error)
    }
  }

  return (
    <div>
      <div>
        <input
          type="number"
          value={priceInput}
          onChange={(e) => setPriceInput(e.target.value)}
          placeholder="price in eth"
          step="0.01"
          disabled={isPlacing}
        />
        <button onClick={handlePlaceOrder} disabled={isPlacing || !priceInput}>
          {isPlacing ? 'placing...' : 'place order'}
        </button>
      </div>
      
      <div>
        <h3>orders ({orders.length})</h3>
        {orders.map((order) => (
          <div key={order.id}>
            id: {order.id} | 
            value: {formatEther(order.value)} eth | 
            price: {formatEther(order.price)} eth | 
            buyer: {order.buyer} | 
            status: {order.status} | 
            timestamp: {new Date(Number(order.timestamp) * 1000).toLocaleString()}
          </div>
        ))}
      </div>
    </div>
  )
}