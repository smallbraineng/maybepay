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
import type { RngData } from './setupRng'

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
  'function orders(uint256) view returns (uint256 value, uint256 price, uint256 timestamp, address buyer, uint8 status)',
  'function processOrder(uint256 id, uint256 ownerRng) external',
  'function setCommitment(uint256 id, bytes32 commitment) external',
  'event OrderPlaced(uint256 indexed id, uint256 value, uint256 price, address buyer)',
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
}

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
  await indexOrders()
  await processPendingOrders()
  setTimeout(syncLoop, 5_000)
}

const server = Bun.serve({
  port: 8787,
  fetch(request) {
    const url = new URL(request.url)

    if (url.pathname === '/orders') {
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
    }

    return new Response('not found', { status: 404 })
  },
})

console.log(`listening on ${server.url}`)
syncLoop()
