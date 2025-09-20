import {
  http,
  type Address,
  type Hex,
  createPublicClient,
  createWalletClient,
  parseAbi,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { foundry } from 'viem/chains'
import { create } from 'zustand'

// connect wallet OR connect abstract global wallet

const ANVIL_PRIVATE_KEY =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80' as Hex
const CONTRACT_ADDRESS = '0x5fbdb2315678afecb367f032d93f642f64180aa3' as Address
const SERVER_URL = 'http://localhost:8787'

enum Status {
  PAID = 'paid',
  FREE = 'free',
  PENDING = 'pending',
}

type Order = {
  id: number
  value: bigint
  price: bigint
  timestamp: bigint
  buyer: Address
  status: Status
}

type InventoryItem = {
  color: string
  size?: string
  stock: number
}

type Store = {
  orders: Order[]
  isPlacing: boolean
  syncInterval: NodeJS.Timeout | undefined
  lastPlacedOrderId: number | undefined
  inventory: Record<string, InventoryItem[]>

  placeOrder: (price: bigint) => Promise<void>
  syncOrders: () => Promise<void>
  syncInventory: () => Promise<void>
  startSync: () => void
  stopSync: () => void
  getInventory: (productId: string) => InventoryItem[]
}

const abi = parseAbi([
  'function placeOrder(uint256 price) payable',
  'event OrderPlaced(uint256 indexed id, uint256 value, uint256 price, address buyer)',
])

const account = privateKeyToAccount(ANVIL_PRIVATE_KEY)

const publicClient = createPublicClient({
  chain: foundry,
  transport: http(),
})

const colorMap: Record<string, string> = {
  'stone': '#1c1917',
  'ice': '#e7e5e4',
}

const walletClient = createWalletClient({
  chain: foundry,
  transport: http(),
  account,
})

export const useStore = create<Store>((set, get) => ({
  orders: [],
  isPlacing: false,
  syncInterval: undefined,
  lastPlacedOrderId: undefined,
  inventory: {},

  placeOrder: async (price: bigint) => {
    set({ isPlacing: true })
    try {
      const currentBlock = await publicClient.getBlockNumber()

      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'placeOrder',
        args: [price],
        value: price,
      })

      await publicClient.waitForTransactionReceipt({ hash })

      const logs = await publicClient.getLogs({
        address: CONTRACT_ADDRESS,
        event: parseAbi([
          'event OrderPlaced(uint256 id, uint256 value, uint256 price, address buyer)',
        ])[0],
        fromBlock: currentBlock,
      })

      console.log(logs)

      const orderPlacedLog = logs.find(
        (log) => log.args.buyer?.toLowerCase() === account.address.toLowerCase()
      )

      if (!orderPlacedLog) {
        throw new Error('order placed event not found')
      }

      const orderId = Number(orderPlacedLog.args.id)
      console.log('placed order with id', orderId)

      set({ lastPlacedOrderId: orderId })

      const fastSyncInterval = setInterval(async () => {
        await get().syncOrders()
        const order = get().orders.find((o) => o.id === orderId)
        if (order && order.status !== Status.PENDING) {
          clearInterval(fastSyncInterval)
          set({ isPlacing: false })
        }
      }, 2_000)
    } catch (error) {
      console.error('failed to place order:', error)
      set({ isPlacing: false })
      throw error
    }
  },

  syncOrders: async () => {
    try {
      const allOrders: Order[] = []
      let page = 0
      let hasMore = true

      while (hasMore) {
        const response = await fetch(`${SERVER_URL}/orders?page=${page}`)
        if (!response.ok) throw new Error('failed to fetch orders')
        const ordersData = (await response.json()) as unknown[]
        const orders = ordersData.map((order: unknown) => {
          const orderRecord = order as Record<string, unknown>
          return {
            ...orderRecord,
            value: BigInt(orderRecord.value as string),
            price: BigInt(orderRecord.price as string),
            timestamp: BigInt(orderRecord.timestamp as string),
          }
        }) as Order[]

        if (orders.length === 0) {
          hasMore = false
        } else {
          allOrders.push(...orders)
          page++
          if (orders.length < 100) {
            hasMore = false
          }
        }
      }

      set({ orders: allOrders })
    } catch (error) {
      console.error('failed to sync orders:', error)
    }
  },

  syncInventory: async () => {
    try {
      const response = await fetch(`${SERVER_URL}/inventory`)
      if (!response.ok) throw new Error('failed to fetch inventory')
      const serverInventory = (await response.json()) as Record<string, Array<{color: string, size?: string, stock: number}>>
      
      const mappedInventory: Record<string, InventoryItem[]> = {}
      for (const [productId, items] of Object.entries(serverInventory)) {
        mappedInventory[productId] = items.map(item => {
          const hexColor = colorMap[item.color]
          if (!hexColor) {
            throw new Error(`Unknown color: ${item.color}`)
          }
          return {
            ...item,
            color: hexColor,
          }
        })
      }
      
      set({ inventory: mappedInventory })
    } catch (error) {
      console.error('failed to sync inventory:', error)
    }
  },

  startSync: () => {
    const { syncInterval } = get()
    if (syncInterval) clearInterval(syncInterval)

    get().syncOrders()
    get().syncInventory()
    const interval = setInterval(() => {
      get().syncOrders()
      get().syncInventory()
    }, 10_000)

    set({ syncInterval: interval })
  },

  stopSync: () => {
    const { syncInterval } = get()
    if (syncInterval) {
      clearInterval(syncInterval)
      set({ syncInterval: undefined })
    }
  },

  getInventory: (productId: string) => {
    return get().inventory[productId] || []
  },
}))
