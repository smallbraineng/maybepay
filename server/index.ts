import { readFileSync } from 'node:fs'
import {
  http,
  type Address,
  type Hex,
  createPublicClient,
  createWalletClient,
  parseAbi,
} from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import * as chains from 'viem/chains'
import { getStock, writeOrder } from './db'
import type { RngData } from './setupRng'
import { OrderInputSchema, hashOrder } from './types'

const privateKey = process.argv[2] as Hex
const chainId = Number.parseInt(process.argv[3] as string)
const contractAddress = process.argv[4] as Address

if (!privateKey || !chainId || !contractAddress) {
  console.log('usage: bun index.ts <private_key> <chain_id> <contract_address>')
  process.exit(1)
}

const chain = Object.values(chains).find((c) => c.id === chainId)
if (!chain) {
  console.log(`chain id ${chainId} not found`)
  process.exit(1)
}

const account = privateKeyToAccount(privateKey)
const publicClient = createPublicClient({
  chain,
  transport: http(),
})
const walletClient = createWalletClient({
  chain,
  transport: http(),
  account,
})

const abi = parseAbi([
  'function orderIndex() view returns (uint256)',
  'function orders(uint256) view returns (uint256 value, uint256 price, uint256 timestamp, address buyer, uint8 status, string metadata)',
  'function processOrder(uint256 id, uint256 ownerRng) external',
  'function setCommitment(uint256 id, bytes32 commitment) external',
  'event OrderPlaced(uint256 indexed id, uint256 value, uint256 price, address buyer, string metadata)',
  'event OrderProcessed(uint256 indexed id, uint8 status)',
])

const loadRngData = (): RngData => {
  try {
    const rngFile = readFileSync('rng.json', 'utf-8')
    const rngData = JSON.parse(rngFile) as RngData

    if (
      !rngData.count ||
      !rngData.numbers ||
      rngData.numbers.length !== rngData.count
    ) {
      throw new Error('invalid rng data structure')
    }

    console.log(`loaded ${rngData.count} rng numbers from rng.json`)
    return rngData
  } catch (error) {
    console.error('failed to load rng.json:', error)
    process.exit(1)
  }
}

const rngData = loadRngData()

enum Status {
  PAID = 'paid',
  FREE = 'free',
  PENDING = 'pending',
}

const getStatus = (status: number): Status => {
  switch (status) {
    case 0:
      return Status.PAID
    case 1:
      return Status.FREE
    case 2:
      return Status.PENDING
    default:
      throw new Error(`unknown status: ${status}`)
  }
}

type Order = {
  id: number
  value: bigint
  price: bigint
  timestamp: bigint
  buyer: Address
  status: Status
  metadata: string
}

// Item, enums, and getItemId are imported from ./types

const orders: Order[] = []

const indexOrders = async () => {
  const orderCount = await publicClient.readContract({
    address: contractAddress,
    abi,
    functionName: 'orderIndex',
  })

  for (let i = orders.length; i < Number(orderCount); i++) {
    const orderData = await publicClient.readContract({
      address: contractAddress,
      abi,
      functionName: 'orders',
      args: [BigInt(i)],
    })

    orders.push({
      id: i,
      value: orderData[0],
      price: orderData[1],
      timestamp: orderData[2],
      buyer: orderData[3],
      status: getStatus(orderData[4]),
      metadata: orderData[5],
    })
  }
}

const processPendingOrders = async () => {
  const pendingOrders = orders.filter(
    (order) => order.status === Status.PENDING
  )

  for (const order of pendingOrders) {
    if (order.id >= rngData.count) {
      console.error(`no rng available for order ${order.id}`)
      process.exit(1)
    }

    const rng = BigInt(rngData.numbers[order.id] as string)
    await walletClient.writeContract({
      address: contractAddress,
      abi,
      functionName: 'processOrder',
      args: [BigInt(order.id), rng],
    })

    // Wait for order status to update
    while (order.status === Status.PENDING) {
      const orderData = await publicClient.readContract({
        address: contractAddress,
        abi,
        functionName: 'orders',
        args: [BigInt(order.id)],
      })
      order.status = getStatus(orderData[4])
      await new Promise((resolve) => setTimeout(resolve, 1_000))
    }

    console.log(`processed order ${order.id} with status ${order.status}`)
  }
}

const syncLoop = async () => {
  try {
    await indexOrders()
    await processPendingOrders()
    setTimeout(syncLoop, 5_000)
  } catch (error) {
    console.error('failed to sync, trying again', error)
  }
}

const server = Bun.serve({
  port: 8787,
  routes: {
    '/orders': {
      GET(req) {
        const url = new URL(req.url)
        const page = Number.parseInt(url.searchParams.get('page') || '0')
        const sortedOrders = orders.sort((a, b) =>
          Number(b.timestamp - a.timestamp)
        )
        const paginatedOrders = sortedOrders.slice(page * 100, (page + 1) * 100)

        const response = Response.json(
          paginatedOrders.map((order) => ({
            ...order,
            value: order.value.toString(),
            price: order.price.toString(),
            timestamp: order.timestamp.toString(),
          }))
        )
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET')
        return response
      },
    },
    '/inventory': {
      GET() {
        const response = Response.json(getStock())
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
        return response
      },
    },
    '/confirm': {
      OPTIONS() {
        const response = new Response(null, { status: 204 })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response
      },
      async POST(req) {
        const parsed = OrderInputSchema.parse(await req.json())

        // get the order from the order id
        const order = orders.find((order) => order.id === parsed.orderId)
        if (!order) {
          return Response.json({ error: 'order not found' }, { status: 400 })
        }
        // order status must not be pending
        if (order.status === Status.PENDING) {
          return Response.json({ error: 'order is pending' }, { status: 400 })
        }
        // order metadata must match passed metadata
        const orderHash = hashOrder(parsed)
        if (orderHash !== order.metadata) {
          return Response.json(
            { error: 'order metadata does not match' },
            { status: 400 }
          )
        }

        writeOrder(parsed.orderId, parsed.email, parsed.address, parsed.items)

        return Response.json({ ok: true })
      },
    },
    '/hash': {
      OPTIONS() {
        const response = new Response(null, { status: 204 })
        response.headers.set('Access-Control-Allow-Origin', '*')
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
        return response
      },
      async POST(req) {
        const parsed = OrderInputSchema.parse(await req.json())
        const digest = hashOrder(parsed)
        const r = new Response(digest, {
          headers: {
            'Content-Type': 'text/plain; charset=ascii',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
          },
        })
        return r
      },
    },
  },
  fetch() {
    return new Response('not found', { status: 404 })
  },
})

console.log(`listening on ${server.url}`)
syncLoop()
