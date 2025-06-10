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

type Store = {
  orders: Order[]
  isPlacing: boolean
  syncInterval: NodeJS.Timeout | undefined
  lastPlacedOrderId: number | undefined

  placeOrder: (price: bigint) => Promise<void>
  syncOrders: () => Promise<void>
  startSync: () => void
  stopSync: () => void
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
        const orders = ordersData.map((order: Record<string, unknown>) => ({
          ...order,
          value: BigInt(order.value as string),
          price: BigInt(order.price as string),
          timestamp: BigInt(order.timestamp as string),
        })) as Order[]

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

  startSync: () => {
    const { syncInterval } = get()
    if (syncInterval) clearInterval(syncInterval)

    get().syncOrders()
    const interval = setInterval(() => {
      get().syncOrders()
    }, 10000)

    set({ syncInterval: interval })
  },

  stopSync: () => {
    const { syncInterval } = get()
    if (syncInterval) {
      clearInterval(syncInterval)
      set({ syncInterval: undefined })
    }
  },
}))
